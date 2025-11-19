import puppeteer from "puppeteer";

(async () => {
  // Reemplaza a waitForTimeout (que ya no existe)
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // -------------------------------------------------------------------------------------
  // 0) Launch + Hook
  // -------------------------------------------------------------------------------------
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Hook antes que cargue la web (captura instancia interna del captcha)
  await page.evaluateOnNewDocument(() => {
    try {
      const tryHook = () => {
        const proto = window.sliderCaptcha?.Constructor?.prototype;
        if (!proto) return false; // Aún no cargó la librería
        const orig = proto.init;
        proto.init = function () {
          this.$element.__sliderCaptchaInstance = this;
          return orig.apply(this, arguments);
        };
        return true;
      };

      if (!tryHook()) document.__WAIT_SLIDER_HOOK__ = true;
    } catch (_) { }
  });

  await page.setViewport({ width: 1366, height: 768 });

  try {
    // -------------------------------------------------------------------------------------
    // 1) Navegar
    // -------------------------------------------------------------------------------------
    await page.goto("https://facility.sistemaedi.com.pe/login", {
      waitUntil: "networkidle2",
    });

    await page.type('input[formcontrolname="usuario"]', "soporteedi", { delay: 30 });
    await page.type('input[formcontrolname="password"]', "Azure2022", { delay: 30 });
    await page.click('button.btn-ediAuth_enviar[type="submit"]');

    // -------------------------------------------------------------------------------------
    // 2) Esperar slidercaptcha
    // -------------------------------------------------------------------------------------
    await page.waitForSelector(".slidercaptcha", { visible: true, timeout: 15000 });
    console.log("🟦 slidercaptcha visible.");

    // Esperar instancia interna
    const instReady = await page
      .waitForFunction(() => {
        const el = document.querySelector(".slidercaptcha");
        return el && el.__sliderCaptchaInstance;
      }, { timeout: 8000 })
      .catch(() => false);

    if (instReady) console.log("✅ Instancia interna disponible.");
    else console.log("⚠️ No se encontró instancia. Se usará template matching.");

    // -------------------------------------------------------------------------------------
    // 3) Esperar imagen en canvas
    // -------------------------------------------------------------------------------------
    const canvasReady = await page
      .waitForFunction(() => {
        const c = document.querySelector(".slidercaptcha canvas:first-child");
        if (!c) return false;
        const ctx = c.getContext("2d");
        try {
          const d = ctx.getImageData(0, 0, c.width, c.height).data;
          let sum = 0;
          for (let i = 0; i < Math.min(2000, d.length); i += 50)
            sum += d[i] + d[i + 1] + d[i + 2];
          return sum > 600;
        } catch (_) {
          return false;
        }
      }, { timeout: 8000 })
      .catch(() => false);

    if (!canvasReady) {
      console.log("❌ canvas no cargó: guardo debug.");
      await page.screenshot({ path: "debug_canvas_empty.png" });
      return;
    }

    console.log("🟩 Canvas con imagen.");

    // -------------------------------------------------------------------------------------
    // 4) Obtener posición real del hueco (si instancia existe)
    // -------------------------------------------------------------------------------------
    let canvasBestX = null;
    let matchLogs = null;

    const instData = await page.evaluate(() => {
      const el = document.querySelector(".slidercaptcha");
      const inst = el?.__sliderCaptchaInstance;
      if (!inst) return null;
      return {
        x: inst.x,
        sliderL: inst.options.sliderL,
        sliderR: inst.options.sliderR,
        offset: inst.options.offset,
      };
    });

    if (instData && typeof instData.x === "number") {
      console.log("🔐 inst.x =", instData.x);
      canvasBestX = instData.x;
    } else {
      console.log("🔍 Ejecutando template-matching…");
      matchLogs = await page.evaluate(() => {
        function bilinear(bg, w, h, fx, fy) {
          fx = Math.min(Math.max(fx, 0), w - 1);
          fy = Math.min(Math.max(fy, 0), h - 1);
          const x0 = Math.floor(fx),
            x1 = Math.min(x0 + 1, w - 1);
          const y0 = Math.floor(fy),
            y1 = Math.min(y0 + 1, h - 1);
          const wx = fx - x0,
            wy = fy - y0;

          const idx = (ix, iy) => (iy * w + ix) * 4;

          const p00 = idx(x0, y0),
            p10 = idx(x1, y0),
            p01 = idx(x0, y1),
            p11 = idx(x1, y1);

          const r =
            bg[p00] * (1 - wx) * (1 - wy) +
            bg[p10] * wx * (1 - wy) +
            bg[p01] * (1 - wx) * wy +
            bg[p11] * wx * wy;

          const g =
            bg[p00 + 1] * (1 - wx) * (1 - wy) +
            bg[p10 + 1] * wx * (1 - wy) +
            bg[p01 + 1] * (1 - wx) * wy +
            bg[p11 + 1] * wx * wy;

          const b =
            bg[p00 + 2] * (1 - wx) * (1 - wy) +
            bg[p10 + 2] * wx * (1 - wy) +
            bg[p01 + 2] * (1 - wx) * wy +
            bg[p11 + 2] * wx * wy;

          return [r, g, b];
        }

        const bgCanvas = document.querySelector(".slidercaptcha canvas:first-child");
        const blkCanvas = document.querySelector(".slidercaptcha canvas.block");
        if (!bgCanvas || !blkCanvas) return { error: "missing canvas" };

        const bgW = bgCanvas.width,
          bgH = bgCanvas.height;

        const blkW = blkCanvas.width,
          blkH = blkCanvas.height;

        const bctx = bgCanvas.getContext("2d");
        const cctx = blkCanvas.getContext("2d");

        const bgData = bctx.getImageData(0, 0, bgW, bgH).data;
        const blkData = cctx.getImageData(0, 0, blkW, blkH).data;

        let mask = [];
        for (let y = 0; y < blkH; y++) {
          for (let x = 0; x < blkW; x++) {
            const i = (y * blkW + x) * 4;
            if (blkData[i + 3] > 10) mask.push({ x, y, i });
          }
        }

        if (!mask.length) return { error: "mask empty" };

        let bestX = 0;
        let best = 9e99;

        for (let X = 10; X <= bgW - blkW - 10; X++) {
          let ssd = 0;
          for (const m of mask) {
            const bi = ((m.y * bgW + (X + m.x)) * 4);
            const dr = blkData[m.i] - bgData[bi];
            const dg = blkData[m.i + 1] - bgData[bi + 1];
            const db = blkData[m.i + 2] - bgData[bi + 2];
            ssd += dr * dr + dg * dg + db * db;
            if (ssd > best) break;
          }
          if (ssd < best) {
            best = ssd;
            bestX = X;
          }
        }

        // Fine search
        let fine = bestX,
          fineScore = best;
        for (let dx = -5; dx <= 5; dx += 0.2) {
          const fx = bestX + dx;
          let ssd = 0;
          for (const m of mask) {
            const [r, g, b] = bilinear(bgData, bgW, bgH, fx + m.x, m.y);
            const dr = blkData[m.i] - r;
            const dg = blkData[m.i + 1] - g;
            const db = blkData[m.i + 2] - b;
            ssd += dr * dr + dg * dg + db * db;
            if (ssd > fineScore) break;
          }
          if (ssd < fineScore) {
            fineScore = ssd;
            fine = fx;
          }
        }

        return { bestX_refined: fine, bestScore_refined: fineScore };
      });

      if (matchLogs.error) {
        console.log("❌ match error:", matchLogs.error);
        await page.screenshot({ path: "debug_match_error.png" });
        return;
      }

      canvasBestX = matchLogs.bestX_refined;
      console.log("🔎 Matching X =", canvasBestX);
    }

    // -------------------------------------------------------------------------------------
    // 5) Convertir X (canvas) → delta (CSS)
    // -------------------------------------------------------------------------------------
    const conv = await page.evaluate((canvasX) => {
      const bg = document.querySelector(".slidercaptcha canvas:first-child");
      const blk = document.querySelector(".slidercaptcha canvas.block");
      const slider = document.querySelector(".slidercaptcha .slider");
      const rail = document.querySelector(".slidercaptcha .sliderContainer");

      const bgRect = bg.getBoundingClientRect();
      const blkRect = blk.getBoundingClientRect();
      const sliderRect = slider.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();

      return {
        canvasX,
        canvasWidth: bg.width,
        canvasCSS: bgRect.width,
        blockCSS: blkRect.width,
        sliderCSS: sliderRect.width,
        railCSS: railRect.width,
      };
    }, canvasBestX);

    const scale = conv.canvasCSS / conv.canvasWidth;
    const visibleX = canvasBestX * scale;

    const usableRail = conv.railCSS - conv.sliderCSS;
    const usableCanvas = conv.canvasCSS - conv.blockCSS;

    const finalOffset = (visibleX / usableCanvas) * usableRail;

    console.log("🔧 Conversión:", {
      canvasBestX,
      scale,
      visibleX,
      usableRail,
      usableCanvas,
      finalOffset,
    });

    // -------------------------------------------------------------------------------------
    // 6) Arrastre
    // -------------------------------------------------------------------------------------
    const sliderHandle = await page.$(".slidercaptcha .slider");
    const box = await sliderHandle.boundingBox();

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    async function drag(delta) {
      await page.mouse.move(startX, startY);
      await page.mouse.down();

      const steps = 55;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ease = 1 - Math.pow(1 - t, 2);
        const x = startX + delta * ease + (Math.random() * 1.2 - 0.6);
        const y = startY + (Math.random() * 3 - 1.5);
        await page.mouse.move(x, y);
        await sleep(6 + Math.random() * 6);
      }

      await page.mouse.up();
      await sleep(900);

      return await page.evaluate(() => {
        const sc = document.querySelector(".slidercaptcha .sliderContainer");
        return sc && sc.classList.contains("sliderContainer_success");
      });
    }

    let solved = await drag(finalOffset);

    if (!solved) {
      console.log("🔁 micro-nudges…");
      for (const d of [-6, -4, -2, 2, 4, 6]) {
        if (await drag(finalOffset + d)) {
          solved = true;
          break;
        }
      }
    }

    if (!solved) {
      console.log("🔬 subpixel search…");
      for (const d of [-1, -0.75, -0.5, -0.25, 0.25, 0.5, 0.75, 1]) {
        if (await drag(finalOffset + d)) {
          solved = true;
          break;
        }
      }
    }

    console.log(solved ? "✅ CAPTCHA APROBADO" : "❌ CAPTCHA FALLÓ");

    if (!solved) {
      await page.screenshot({ path: "debug_final_fail.png" });
    }

    console.log("--- LOGS PARA ENVIAR SI FALLA ---");
    console.log({
      bestX_coarse: matchLogs?.bestX_coarse,
      bestScore_coarse: matchLogs?.bestScore_coarse,
      bestX_refined: matchLogs?.bestX_refined ?? instData?.x,
      bestScore_refined: matchLogs?.bestScore_refined,
      scale,
      visibleX,
      usableRail,
      usableCanvas,
      finalOffset,
      startX,
      startY,
    });

  } catch (e) {
    console.error("ERROR:", e);
    await page.screenshot({ path: "debug_error.png" });
  }
})();
