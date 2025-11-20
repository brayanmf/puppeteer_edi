import puppeteer from "puppeteer";

(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // -------------------------------------------------------------------------------------
  // 0) Launch + Hook
  // -------------------------------------------------------------------------------------
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Hook mejorado con múltiples intentos
  await page.evaluateOnNewDocument(() => {
    try {
      const tryHook = () => {
        const proto = window.sliderCaptcha?.Constructor?.prototype;
        if (!proto) return false;
        const orig = proto.init;
        proto.init = function () {
          this.$element.__sliderCaptchaInstance = this;
          window.__captchaInstance = this; // Backup global
          return orig.apply(this, arguments);
        };
        return true;
      };

      if (!tryHook()) {
        // Reintentar cada 100ms hasta 3 segundos
        const interval = setInterval(() => {
          if (tryHook()) clearInterval(interval);
        }, 100);
        setTimeout(() => clearInterval(interval), 3000);
      }
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
    // 2) Esperar slidercaptcha con reintentos
    // -------------------------------------------------------------------------------------
    await page.waitForSelector(".slidercaptcha", { visible: true, timeout: 15000 });
    console.log("🟦 slidercaptcha visible.");

    // Esperar a que el canvas esté completamente renderizado
    await sleep(800);

    const instReady = await page
      .waitForFunction(() => {
        const el = document.querySelector(".slidercaptcha");
        return el && (el.__sliderCaptchaInstance || window.__captchaInstance);
      }, { timeout: 8000 })
      .catch(() => false);

    if (instReady) console.log("✅ Instancia interna disponible.");
    else console.log("⚠️ No se encontró instancia. Se usará template matching.");

    // -------------------------------------------------------------------------------------
    // 3) Esperar imagen en canvas CON VERIFICACIÓN MEJORADA
    // -------------------------------------------------------------------------------------
    const canvasReady = await page
      .waitForFunction(() => {
        const bg = document.querySelector(".slidercaptcha canvas:first-child");
        const blk = document.querySelector(".slidercaptcha canvas.block");

        if (!bg || !blk) return false;

        const bgCtx = bg.getContext("2d");
        const blkCtx = blk.getContext("2d");

        try {
          // Verificar background
          const bgData = bgCtx.getImageData(0, 0, bg.width, bg.height).data;
          let bgSum = 0;
          for (let i = 0; i < Math.min(4000, bgData.length); i += 4) {
            bgSum += bgData[i] + bgData[i + 1] + bgData[i + 2];
          }

          // Verificar bloque (debe tener pixels con alpha > 0)
          const blkData = blkCtx.getImageData(0, 0, blk.width, blk.height).data;
          let alphaCount = 0;
          for (let i = 3; i < blkData.length; i += 40) {
            if (blkData[i] > 10) alphaCount++;
          }

          return bgSum > 1000 && alphaCount > 20;
        } catch (_) {
          return false;
        }
      }, { timeout: 10000 })
      .catch(() => false);

    if (!canvasReady) {
      console.log("❌ Canvas no cargó correctamente");
      await page.screenshot({ path: "debug_canvas_empty.png", fullPage: true });
      return;
    }

    console.log("🟩 Canvas con imagen completa.");
    await sleep(300); // Pequeña pausa adicional

    // -------------------------------------------------------------------------------------
    // 4) Obtener posición real del hueco
    // -------------------------------------------------------------------------------------
    let canvasBestX = null;
    let matchLogs = null;

    const instData = await page.evaluate(() => {
      const el = document.querySelector(".slidercaptcha");
      const inst = el?.__sliderCaptchaInstance || window.__captchaInstance;
      if (!inst) return null;
      return {
        x: inst.x,
        y: inst.y,
        sliderL: inst.options?.sliderL,
        sliderR: inst.options?.sliderR,
        offset: inst.options?.offset,
      };
    });

    if (instData && typeof instData.x === "number") {
      console.log("🔐 inst.x =", instData.x, "inst.y =", instData.y);
      canvasBestX = instData.x;
    } else {
      console.log("🔍 Ejecutando template-matching MEJORADO CON DETECCIÓN DE BORDES…");

      matchLogs = await page.evaluate(() => {
        // Interpolación bilineal mejorada
        function bilinear(bg, w, h, fx, fy) {
          fx = Math.max(0, Math.min(fx, w - 1));
          fy = Math.max(0, Math.min(fy, h - 1));

          const x0 = Math.floor(fx), x1 = Math.min(x0 + 1, w - 1);
          const y0 = Math.floor(fy), y1 = Math.min(y0 + 1, h - 1);
          const wx = fx - x0, wy = fy - y0;

          const idx = (ix, iy) => (iy * w + ix) * 4;
          const [p00, p10, p01, p11] = [idx(x0, y0), idx(x1, y0), idx(x0, y1), idx(x1, y1)];

          const interpolate = (offset) =>
            bg[p00 + offset] * (1 - wx) * (1 - wy) +
            bg[p10 + offset] * wx * (1 - wy) +
            bg[p01 + offset] * (1 - wx) * wy +
            bg[p11 + offset] * wx * wy;

          return [interpolate(0), interpolate(1), interpolate(2)];
        }

        const bgCanvas = document.querySelector(".slidercaptcha canvas:first-child");
        const blkCanvas = document.querySelector(".slidercaptcha canvas.block");

        if (!bgCanvas || !blkCanvas) return { error: "missing canvas" };

        const bgW = bgCanvas.width, bgH = bgCanvas.height;
        const blkW = blkCanvas.width, blkH = blkCanvas.height;

        const bctx = bgCanvas.getContext("2d");
        const cctx = blkCanvas.getContext("2d");

        const bgData = bctx.getImageData(0, 0, bgW, bgH).data;
        const blkData = cctx.getImageData(0, 0, blkW, blkH).data;

        // NUEVO: Detectar bordes del hueco en el fondo usando diferencias de color
        function detectGap() {
          let gapScores = [];

          for (let x = 30; x < bgW - 30; x++) {
            let edgeScore = 0;

            // Buscar cambios verticales bruscos (característicos del hueco)
            for (let y = 10; y < bgH - 10; y++) {
              const idx1 = (y * bgW + x) * 4;
              const idx2 = (y * bgW + (x + 1)) * 4;

              // Diferencia con pixel adyacente horizontal
              const diffH = Math.abs(bgData[idx1] - bgData[idx2]) +
                Math.abs(bgData[idx1 + 1] - bgData[idx2 + 1]) +
                Math.abs(bgData[idx1 + 2] - bgData[idx2 + 2]);

              // Diferencia vertical (detecta bordes de la forma)
              if (y < bgH - 1) {
                const idx3 = ((y + 1) * bgW + x) * 4;
                const diffV = Math.abs(bgData[idx1] - bgData[idx3]) +
                  Math.abs(bgData[idx1 + 1] - bgData[idx3 + 1]) +
                  Math.abs(bgData[idx1 + 2] - bgData[idx3 + 2]);

                if (diffV > 100) edgeScore += diffV; // Bordes verticales fuertes
              }

              if (diffH > 80) edgeScore += diffH * 1.5; // Peso mayor a cambios horizontales
            }

            gapScores.push({ x, score: edgeScore });
          }

          // Encontrar picos de edge score (candidatos a hueco)
          gapScores.sort((a, b) => b.score - a.score);
          const topCandidates = gapScores.slice(0, 5);

          console.log("Top 5 candidatos por detección de bordes:",
            topCandidates.map(c => `x=${c.x} score=${c.score.toFixed(0)}`).join(", "));

          return topCandidates.map(c => c.x);
        }

        const gapCandidates = detectGap();

        // Construir máscara optimizada con threshold más bajo para capturar más detalles
        let mask = [];
        let edgeMask = []; // Máscara especial para bordes del bloque

        for (let y = 0; y < blkH; y++) {
          for (let x = 0; x < blkW; x++) {
            const i = (y * blkW + x) * 4;
            const alpha = blkData[i + 3];

            if (alpha > 20) {
              mask.push({ x, y, i });

              // Identificar bordes (píxeles en la frontera)
              const isEdge = x === 0 || x === blkW - 1 || y === 0 || y === blkH - 1 ||
                (x > 0 && blkData[i - 4 + 3] < 20) ||
                (x < blkW - 1 && blkData[i + 4 + 3] < 20);

              if (isEdge) {
                edgeMask.push({ x, y, i, weight: 2.0 }); // Peso doble a bordes
              }
            }
          }
        }

        if (mask.length < 100) return { error: "mask too small", maskSize: mask.length };

        console.log(`Máscara: ${mask.length} pixels (${edgeMask.length} en bordes)`);

        // BÚSQUEDA DIRIGIDA usando candidatos de detección de bordes
        let bestX = 0, bestScore = Infinity;
        let allResults = [];

        // Buscar alrededor de cada candidato ±20px
        for (const candidateX of gapCandidates) {
          const searchStart = Math.max(10, candidateX - 20);
          const searchEnd = Math.min(bgW - blkW - 10, candidateX + 20);

          for (let X = searchStart; X <= searchEnd; X += 1) {
            let ssd = 0;

            // Calcular matching con peso extra en bordes
            for (const m of mask) {
              const bx = X + m.x;
              if (bx < 0 || bx >= bgW) continue;

              const bi = (m.y * bgW + bx) * 4;
              const dr = blkData[m.i] - bgData[bi];
              const dg = blkData[m.i + 1] - bgData[bi + 1];
              const db = blkData[m.i + 2] - bgData[bi + 2];

              ssd += dr * dr + dg * dg + db * db;
            }

            // Bonus para bordes bien alineados
            let edgeBonus = 0;
            for (const e of edgeMask) {
              const bx = X + e.x;
              if (bx < 0 || bx >= bgW) continue;

              const bi = (e.y * bgW + bx) * 4;
              const dr = blkData[e.i] - bgData[bi];
              const dg = blkData[e.i + 1] - bgData[bi + 1];
              const db = blkData[e.i + 2] - bgData[bi + 2];

              edgeBonus += (dr * dr + dg * dg + db * db) * e.weight;
            }

            const totalScore = ssd + edgeBonus * 0.3;
            allResults.push({ X, score: totalScore });

            if (totalScore < bestScore) {
              bestScore = totalScore;
              bestX = X;
            }
          }
        }

        console.log(`Búsqueda dirigida: X=${bestX}, score=${bestScore.toFixed(0)}`);

        // BÚSQUEDA FINA con subpixel (±5px alrededor del mejor)
        let fineX = bestX, fineScore = bestScore;
        const fineRange = 5;
        const fineStep = 0.2;

        for (let dx = -fineRange; dx <= fineRange; dx += fineStep) {
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
            fineX = fx;
          }
        }

        console.log(`Búsqueda fina: X=${fineX.toFixed(2)}, score=${fineScore.toFixed(0)}`);

        // Mostrar top 3 resultados
        allResults.sort((a, b) => a.score - b.score);
        console.log("Top 3 matches:", allResults.slice(0, 3).map(r =>
          `X=${r.X} score=${r.score.toFixed(0)}`).join(", "));

        return {
          bestX_coarse: bestX,
          bestScore_coarse: bestScore,
          bestX_refined: fineX,
          bestScore_refined: fineScore,
          maskSize: mask.length,
          gapCandidates,
          top3: allResults.slice(0, 3)
        };
      });

      if (matchLogs.error) {
        console.log("❌ Match error:", matchLogs.error);
        await page.screenshot({ path: "debug_match_error.png", fullPage: true });
        return;
      }

      canvasBestX = matchLogs.bestX_refined;
      console.log("🔎 Matching refinado: X =", canvasBestX.toFixed(2));
    }

    // -------------------------------------------------------------------------------------
    // 5) Convertir X (canvas) → delta (CSS) - MEJORADO
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
        canvasHeight: bg.height,
        canvasCSS: bgRect.width,
        blockCSS: blkRect.width,
        sliderCSS: sliderRect.width,
        railCSS: railRect.width,
        bgLeft: bgRect.left,
        railLeft: railRect.left,
      };
    }, canvasBestX);

    const scale = conv.canvasCSS / conv.canvasWidth;
    const visibleX = canvasBestX * scale;

    // CORRECCIÓN CRÍTICA: El offset debe ser proporcional al ancho del rail
    const usableRail = conv.railCSS - conv.sliderCSS;

    // El bloque se mueve junto con el slider, no necesitamos restar blockCSS
    const usableCanvas = conv.canvasCSS;

    // Calcular offset directo (sin conversión de espacio)
    let finalOffset = visibleX * (usableRail / usableCanvas);

    // Ajuste por posición inicial del rail vs canvas
    const positionDiff = conv.railLeft - conv.bgLeft;
    if (Math.abs(positionDiff) > 1) {
      finalOffset += positionDiff;
    }

    // NUEVO: Compensación por el ancho del slider (centro del slider vs borde del bloque)
    const sliderCompensation = conv.sliderCSS / 2;
    finalOffset -= sliderCompensation;

    console.log("🔧 Conversión:", {
      canvasBestX: canvasBestX.toFixed(2),
      scale: scale.toFixed(4),
      visibleX: visibleX.toFixed(2),
      usableRail: usableRail.toFixed(2),
      usableCanvas: usableCanvas.toFixed(2),
      finalOffset: finalOffset.toFixed(2),
    });

    // -------------------------------------------------------------------------------------
    // 6) Arrastre HUMANIZADO MEJORADO
    // -------------------------------------------------------------------------------------
    const sliderHandle = await page.$(".slidercaptcha .slider");
    const box = await sliderHandle.boundingBox();

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    async function drag(delta) {
      // Reset antes de intentar
      await page.evaluate(() => {
        const slider = document.querySelector(".slidercaptcha .slider");
        if (slider) slider.style.left = "0px";
      });

      await sleep(150);

      await page.mouse.move(startX, startY, { steps: 3 });
      await sleep(80 + Math.random() * 40);
      await page.mouse.down();
      await sleep(60 + Math.random() * 30);

      // Movimiento con aceleración y desaceleración realista
      const steps = 60 + Math.floor(Math.random() * 20);
      const jitterAmount = 0.8;

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;

        // Curva de aceleración más realista (ease-in-out)
        const ease = t < 0.5
          ? 2 * t * t
          : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Añadir micro-pausas aleatorias (simula corrección humana)
        if (i % 12 === 0) {
          await sleep(15 + Math.random() * 25);
        }

        const x = startX + delta * ease + (Math.random() * jitterAmount * 2 - jitterAmount);
        const y = startY + (Math.random() * 2.5 - 1.25);

        await page.mouse.move(x, y);
        await sleep(4 + Math.random() * 8);
      }

      // Pequeña pausa antes de soltar (comportamiento humano)
      await sleep(50 + Math.random() * 30);
      await page.mouse.up();

      // Esperar validación
      await sleep(1200);

      return await page.evaluate(() => {
        const sc = document.querySelector(".slidercaptcha .sliderContainer");
        return sc && sc.classList.contains("sliderContainer_success");
      });
    }

    // -------------------------------------------------------------------------------------
    // 7) Estrategia de intentos mejorada
    // -------------------------------------------------------------------------------------
    console.log("🎯 Intento principal con offset:", finalOffset.toFixed(2));
    let solved = await drag(finalOffset);

    if (!solved) {
      console.log("🔁 Ajustes finos sistemáticos...");

      // Con el score tan alto, probablemente el matching falló
      // Probar posiciones alternativas basadas en proporciones comunes
      const alternativeOffsets = [
        finalOffset * 0.85,  // 85%
        finalOffset * 0.90,  // 90%
        finalOffset * 0.95,  // 95%
        finalOffset * 1.05,  // 105%
        finalOffset * 1.10,  // 110%
        finalOffset - 20,    // -20px
        finalOffset - 15,
        finalOffset - 10,
        finalOffset - 5,
        finalOffset + 5,
        finalOffset + 10,
        finalOffset + 15,
        finalOffset + 20,
      ];

      for (const offset of alternativeOffsets) {
        // Validar que el offset esté dentro de límites razonables
        if (offset < 0 || offset > usableRail) continue;

        console.log(`  Probando offset alternativo: ${offset.toFixed(2)}px`);
        if (await drag(offset)) {
          solved = true;
          console.log(`✅ Resuelto con offset alternativo: ${offset.toFixed(2)}px`);
          break;
        }
      }
    }

    if (!solved) {
      console.log("🔬 Búsqueda subpixel extendida...");

      // Estrategia 2: búsqueda subpixel más amplia
      const subpixelSearch = [
        -1.5, -1.25, -1, -0.75, -0.5, -0.25,
        0.25, 0.5, 0.75, 1, 1.25, 1.5
      ];

      for (const d of subpixelSearch) {
        console.log(`  Probando offset subpixel: ${(finalOffset + d).toFixed(2)}`);
        if (await drag(finalOffset + d)) {
          solved = true;
          console.log(`✅ Resuelto con ajuste subpixel: ${d}px`);
          break;
        }
      }
    }

    if (!solved) {
      console.log("🎲 Último intento: ajuste basado en escala...");

      // Estrategia 3: ajuste basado en la escala (a veces hay offset sistemático)
      const scaleAdjustments = [
        finalOffset * 0.98,
        finalOffset * 1.02,
        finalOffset * 0.96,
        finalOffset * 1.04,
        finalOffset - 8,
        finalOffset + 8
      ];

      for (const adjustedOffset of scaleAdjustments) {
        console.log(`  Probando offset ajustado: ${adjustedOffset.toFixed(2)}`);
        if (await drag(adjustedOffset)) {
          solved = true;
          console.log(`✅ Resuelto con ajuste de escala`);
          break;
        }
      }
    }

    console.log(solved ? "✅ 🎉 CAPTCHA RESUELTO EXITOSAMENTE" : "❌ CAPTCHA NO RESUELTO");

    if (!solved) {
      await page.screenshot({ path: "debug_final_fail.png", fullPage: true });
    } else {
      await page.screenshot({ path: "success.png", fullPage: true });
    }

    // -------------------------------------------------------------------------------------
    // 8) Logs detallados para debugging
    // -------------------------------------------------------------------------------------
    console.log("\n--- DATOS COMPLETOS PARA ANÁLISIS ---");
    console.log(JSON.stringify({
      matching: matchLogs || { source: "instancia interna", x: instData?.x },
      conversion: conv,
      finalOffset: finalOffset.toFixed(2),
      solved,
    }, null, 2));

  } catch (e) {
    console.error("❌ ERROR:", e);
    await page.screenshot({ path: "debug_error.png", fullPage: true });
  }
})();