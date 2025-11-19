import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // --- LOGIN ---
  await page.goto("https://facility.sistemaedi.com.pe/login", { waitUntil: "networkidle2" });
  await page.type('input[formcontrolname="usuario"]', "soporteedi", { delay: 40 });
  await page.type('input[formcontrolname="password"]', "Azure2022", { delay: 40 });
  await page.click('button.btn-ediAuth_enviar[type="submit"]');

  // Esperar captcha
  await page.waitForSelector(".slidercaptcha", { visible: true, timeout: 15000 });
  console.log("🟦 Captcha detectado.");

  // Esperar canvas cargado
  const canvasReady = await page.waitForFunction(() => {
    const c = document.querySelector(".slidercaptcha canvas:first-child");
    if (!c) return false;
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 0; i < Math.min(1200, d.length); i += 32) sum += d[i] + d[i + 1] + d[i + 2];
    return sum > 500;
  }, { timeout: 10000 }).catch(() => false);

  if (!canvasReady) {
    console.log("❌ Canvas no cargó imagen. Guardando screenshot...");
    await page.screenshot({ path: "debug_canvas_empty.png" });
    await browser.close();
    return;
  }
  console.log("🟩 Canvas cargado.");

  // Matching ya con refinamiento subpixel (idéntico al anterior)
  const matchResult = await page.evaluate(() => {
    // bilinearSample helper
    function bilinearSample(bgData, bgW, bgH, fx, fy) {
      if (fx < 0) fx = 0;
      if (fy < 0) fy = 0;
      const x0 = Math.floor(fx);
      const x1 = Math.min(x0 + 1, bgW - 1);
      const y0 = Math.floor(fy);
      const y1 = Math.min(y0 + 1, bgH - 1);
      const wx = fx - x0;
      const wy = fy - y0;
      function pix(ix, iy) {
        const idx = (iy * bgW + ix) * 4;
        return [bgData[idx], bgData[idx + 1], bgData[idx + 2], bgData[idx + 3]];
      }
      const p00 = pix(x0, y0), p10 = pix(x1, y0), p01 = pix(x0, y1), p11 = pix(x1, y1);
      const r = p00[0] * (1 - wx) * (1 - wy) + p10[0] * wx * (1 - wy) + p01[0] * (1 - wx) * wy + p11[0] * wx * wy;
      const g = p00[1] * (1 - wx) * (1 - wy) + p10[1] * wx * (1 - wy) + p01[1] * (1 - wx) * wy + p11[1] * wx * wy;
      const b = p00[2] * (1 - wx) * (1 - wy) + p10[2] * wx * (1 - wy) + p01[2] * (1 - wx) * wy + p11[2] * wx * wy;
      return [r, g, b];
    }

    const bgCanvas = document.querySelector(".slidercaptcha canvas:first-child");
    const blockCanvas = document.querySelector(".slidercaptcha canvas.block");
    if (!bgCanvas || !blockCanvas) return { error: "No canvases" };

    const bgW = bgCanvas.width, bgH = bgCanvas.height;
    const blockW = blockCanvas.width, blockH = blockCanvas.height;
    const bgCtx = bgCanvas.getContext("2d");
    const blockCtx = blockCanvas.getContext("2d");
    const bgData = bgCtx.getImageData(0, 0, bgW, bgH).data;
    const blockData = blockCtx.getImageData(0, 0, blockW, blockH).data;

    const mask = [];
    const columnVis = new Array(blockW).fill(0);
    for (let y = 0; y < blockH; y++) {
      for (let x = 0; x < blockW; x++) {
        const i = (y * blockW + x) * 4;
        if (blockData[i + 3] > 10) { mask.push({ x, y, idx: i }); columnVis[x] = 1; }
      }
    }
    let leftTrim = 0;
    for (let x = 0; x < blockW; x++) { if (columnVis[x]) { leftTrim = x; break; } }
    if (mask.length === 0) return { error: "Block mask empty" };

    const startX = 10, endX = Math.max(10, bgW - blockW - 10);
    let bestX = startX, bestScore = Number.POSITIVE_INFINITY;
    for (let candX = startX; candX <= endX; candX++) {
      let ssd = 0;
      for (let k = 0; k < mask.length; k++) {
        const m = mask[k];
        const bgI = ((m.y * bgW) + (candX + m.x)) * 4;
        const dr = blockData[m.idx] - bgData[bgI];
        const dg = blockData[m.idx + 1] - bgData[bgI + 1];
        const db = blockData[m.idx + 2] - bgData[bgI + 2];
        ssd += dr * dr + dg * dg + db * db;
        if (ssd > bestScore) break;
      }
      if (ssd < bestScore) { bestScore = ssd; bestX = candX; }
    }

    // refinement subpixel
    let refinedBestX = bestX, refinedScore = bestScore;
    const fineRadius = 6, fineStep = 0.2;
    for (let dx = -fineRadius; dx <= fineRadius; dx += fineStep) {
      const fx = bestX + dx;
      if (fx < 0 || fx + blockW >= bgW) continue;
      let ssd = 0;
      for (let k = 0; k < mask.length; k++) {
        const m = mask[k];
        const sample = bilinearSample(bgData, bgW, bgH, fx + m.x, m.y);
        const dr = blockData[m.idx] - sample[0];
        const dg = blockData[m.idx + 1] - sample[1];
        const db = blockData[m.idx + 2] - sample[2];
        ssd += dr * dr + dg * dg + db * db;
        if (ssd > refinedScore) break;
      }
      if (ssd < refinedScore) { refinedScore = ssd; refinedBestX = fx; }
    }

    const bgRect = bgCanvas.getBoundingClientRect();
    const blockRect = blockCanvas.getBoundingClientRect();
    const sliderRect = document.querySelector(".slidercaptcha .slider").getBoundingClientRect();
    const railRect = document.querySelector(".slidercaptcha .sliderContainer").getBoundingClientRect();

    return {
      bestX_coarse: bestX,
      bestScore_coarse: bestScore,
      bestX_refined: refinedBestX,
      bestScore_refined: refinedScore,
      leftTrim,
      bgW, bgH, blockW, blockH,
      bgRect: { width: bgRect.width, left: bgRect.left },
      blockRect: { width: blockRect.width },
      sliderRect: { width: sliderRect.width, left: sliderRect.left },
      railRect: { width: railRect.width, left: railRect.left }
    };
  });

  if (matchResult.error) {
    console.error("MATCH ERROR:", matchResult.error);
    await page.screenshot({ path: "debug_match_error.png" });
    await browser.close();
    return;
  }

  console.log("🔎 Match results (canvas):", {
    bestX_coarse: matchResult.bestX_coarse,
    bestScore_coarse: matchResult.bestScore_coarse,
    bestX_refined: matchResult.bestX_refined,
    bestScore_refined: matchResult.bestScore_refined,
    leftTrim: matchResult.leftTrim
  });

  // **********************
  // Conversión CORRECTA:
  // finalX = railRect.left + finalOffsetOnRail + sliderWidth/2
  // **********************
  const scaleCanvasToCSS = matchResult.bgRect.width / matchResult.bgW;
  const visibleBestX = matchResult.bestX_refined * scaleCanvasToCSS;
  const leftTrimVisible = matchResult.leftTrim * scaleCanvasToCSS;
  const railWidth = matchResult.railRect.width;
  const sliderWidth = matchResult.sliderRect.width;
  const usableRail = Math.max(railWidth - sliderWidth, 1);
  const blockVisibleWidth = matchResult.blockRect.width;
  const canvasVisibleUsable = Math.max(matchResult.bgRect.width - blockVisibleWidth, 1);

  const finalOffsetOnRail = ((visibleBestX - leftTrimVisible) / canvasVisibleUsable) * usableRail;

  console.log("🔧 Conversion:", { scaleCanvasToCSS, visibleBestX, leftTrimVisible, usableRail, canvasVisibleUsable, finalOffsetOnRail });

  if (!Number.isFinite(finalOffsetOnRail)) {
    console.error("❌ finalOffsetOnRail no es finito.");
    await page.screenshot({ path: "debug_not_finite.png" });
    await browser.close();
    return;
  }

  // coordenadas de arrastre
  const sliderHandle = await page.$(".slidercaptcha .slider");
  const sliderBox = await sliderHandle.boundingBox();
  const startX = sliderBox.x + sliderBox.width / 2;
  const startY = sliderBox.y + sliderBox.height / 2;

  // Aquí calculamos finalX correctamente usando rail left
  const railLeft = matchResult.railRect.left;
  const finalX_base = railLeft + finalOffsetOnRail + sliderWidth / 2;

  console.log("🕹 Coords base (pantalla px):", { startX, startY, finalX_base });

  // Función que intenta arrastrar a una X específica (doDrag) y devuelve si pasó
  async function doDragTo(xTarget) {
    // arrastre
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    const steps = 50;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = 1 - (1 - t) * (1 - t);
      const x = startX + (xTarget - startX) * ease + (Math.random() * 1.2 - 0.6);
      const y = startY + (Math.random() * 4 - 2);
      await page.mouse.move(x, y);

    }
    await page.mouse.up();
    // esperar validación pequeña

    // comprobar si pasó
    const solved = await page.evaluate(() => {
      const el = document.querySelector(".slidercaptcha");
      if (!el) return true;
      const sc = document.querySelector(".slidercaptcha .sliderContainer");
      if (sc && sc.classList.contains("sliderContainer_success")) return true;
      return false;
    });
    return solved;
  }

  // 1) intento inicial
  let solved = await doDragTo(finalX_base);
  console.log("Intento inicial result:", solved);

  // 2) si falla, hacemos una búsqueda local: offsets en px (negativos y positivos)
  if (!solved) {
    console.log("🔁 Intentando micro-nudges alrededor del candidato (±6 px).");
    const deltas = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];

    for (const d of deltas) {
      const trialX = finalX_base + d;
      console.log("➡ Probando ajuste d =", d, "→ X:", trialX.toFixed(2));
      const ok = await doDragTo(trialX);
      console.log("   resultado:", ok);
      if (ok) { solved = true; break; }
      // pequeño descanso entre intentos

    }
  }

  // 3) Si aún no funciona, probar micro-subpixel alrededor del mejor delta (paso 0.5)
  if (!solved) {
    console.log("🔬 Intento sub-pixel fino (±2 px en pasos 0.5).");
    const deltas = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2];
    for (const d of deltas) {
      const trialX = finalX_base + d;
      console.log("➡ Probando subpixel d =", d, "→ X:", trialX.toFixed(2));
      const ok = await doDragTo(trialX);
      console.log("   resultado:", ok);
      if (ok) { solved = true; break; }

    }
  }

  console.log(solved ? "✅ CAPTCHA APROBADO" : "❌ CAPTCHA NO APROBADO (envíame logs y screenshot).");

  if (!solved) {
    await page.screenshot({ path: "debug_after_final_try.png" });
    console.log("Screenshot saved: debug_after_final_try.png");
  }

  // Imprimir bloque final de logs para que me los pegues si aún falla
  console.log("\n--- LOGS PARA ENVIAR SI FALLA ---");
  console.log({
    bestX_coarse: matchResult.bestX_coarse,
    bestScore_coarse: matchResult.bestScore_coarse,
    bestX_refined: matchResult.bestX_refined,
    bestScore_refined: matchResult.bestScore_refined,
    leftTrim: matchResult.leftTrim,
    scaleCanvasToCSS,
    visibleBestX,
    leftTrimVisible,
    blockVisibleWidth: matchResult.blockRect.width,
    railWidth,
    sliderWidth,
    usableRail,
    canvasVisibleUsable,
    finalOffsetOnRail,
    railLeft,
    startX,
    startY,
    finalX_base
  });

  // await browser.close();
})();
