import puppeteer from "puppeteer";
import express from "express";

const app = express();
app.use(express.json());

app.post("/api/extraer", async (req, res) => {
  const { url, selector } = req.body

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Hook (igual que antes)
  await page.evaluateOnNewDocument(() => {
    try {
      const tryHook = () => {
        const proto = window.sliderCaptcha?.Constructor?.prototype;
        if (!proto) return false;
        const orig = proto.init;
        proto.init = function () {
          this.$element.__sliderCaptchaInstance = this;
          window.__captchaInstance = this;
          return orig.apply(this, arguments);
        };
        return true;
      };
      if (!tryHook()) {
        const interval = setInterval(() => { if (tryHook()) clearInterval(interval); }, 100);
        setTimeout(() => clearInterval(interval), 3000);
      }
    } catch (_) { }
  });

  try {
    // NAV
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.type('input[formcontrolname="usuario"]', "soporteedi", { delay: 30 });
    await page.type('input[formcontrolname="password"]', "Azure2022", { delay: 30 });
    await page.click('button.btn-ediAuth_enviar[type="submit"]');

    // Esperar captcha
    await page.waitForSelector(".slidercaptcha", { visible: true, timeout: 15000 });
    await sleep(600);

    // Esperar canvas listo
    const canvasReady = await page.waitForFunction(() => {
      const bg = document.querySelector(".slidercaptcha canvas:first-child");
      const blk = document.querySelector(".slidercaptcha canvas.block");
      if (!bg || !blk) return false;
      try {
        const d = bg.getContext('2d').getImageData(0, 0, bg.width, bg.height).data;
        let sum = 0;
        for (let i = 0; i < Math.min(1200, d.length); i += 32) sum += d[i] + d[i + 1] + d[i + 2];
        const blkData = blk.getContext('2d').getImageData(0, 0, blk.width, blk.height).data;
        let alphaCount = 0;
        for (let i = 3; i < blkData.length; i += 40) if (blkData[i] > 10) alphaCount++;
        return sum > 500 && alphaCount > 10;
      } catch (e) { return false; }
    }, { timeout: 10000 }).catch(() => false);

    if (!canvasReady) {
      console.error("❌ Canvas no listo");
      await page.screenshot({ path: "debug_canvas_empty.png", fullPage: true });
      await browser.close();
      return;
    }
    console.log("🟩 Canvas listo");

    // Obtener instancia si existe
    const instData = await page.evaluate(() => {
      const el = document.querySelector(".slidercaptcha");
      const inst = el?.__sliderCaptchaInstance || window.__captchaInstance || null;
      if (!inst) return null;
      return { x: inst.x, y: inst.y, options: inst.options };
    });

    // Obtener canvasBestX (instancia preferida; sino matching refinado)
    let canvasBestX = null;
    let matchLogs = null;

    if (instData && typeof instData.x === "number") {
      canvasBestX = instData.x;
      console.log("🔐 inst.x encontrado:", canvasBestX);
    } else {
      console.log("🔎 doing refined matching (fallback)");
      matchLogs = await page.evaluate(() => {
        function bilinear(bg, w, h, fx, fy) {
          fx = Math.max(0, Math.min(fx, w - 1)); fy = Math.max(0, Math.min(fy, h - 1));
          const x0 = Math.floor(fx), x1 = Math.min(x0 + 1, w - 1);
          const y0 = Math.floor(fy), y1 = Math.min(y0 + 1, h - 1);
          const wx = fx - x0, wy = fy - y0;
          const idx = (ix, iy) => (iy * w + ix) * 4;
          const p00 = idx(x0, y0), p10 = idx(x1, y0), p01 = idx(x0, y1), p11 = idx(x1, y1);
          const interp = (o) =>
            bg[p00 + o] * (1 - wx) * (1 - wy) + bg[p10 + o] * wx * (1 - wy) + bg[p01 + o] * (1 - wx) * wy + bg[p11 + o] * wx * wy;
          return [interp(0), interp(1), interp(2)];
        }

        const bg = document.querySelector(".slidercaptcha canvas:first-child");
        const blk = document.querySelector(".slidercaptcha canvas.block");
        const bgW = bg.width, bgH = bg.height, blkW = blk.width, blkH = blk.height;
        const bctx = bg.getContext('2d'), kctx = blk.getContext('2d');
        const bgData = bctx.getImageData(0, 0, bgW, bgH).data;
        const blkData = kctx.getImageData(0, 0, blkW, blkH).data;

        // calcular leftTrim del block (primer column con alpha>threshold)
        let leftTrim = 0;
        const colCount = blkW;
        for (let x = 0; x < colCount; x++) {
          let colHas = false;
          for (let y = 0; y < blkH; y++) {
            const idx = (y * blkW + x) * 4;
            if (blkData[idx + 3] > 10) { colHas = true; break; }
          }
          if (colHas) { leftTrim = x; break; }
        }

        // mask
        let mask = [];
        for (let y = 0; y < blkH; y++) {
          for (let x = 0; x < blkW; x++) {
            const i = (y * blkW + x) * 4;
            if (blkData[i + 3] > 12) mask.push({ x, y, i });
          }
        }
        if (mask.length < 50) return { error: 'mask small', maskLen: mask.length, leftTrim };

        let bestX = 10, bestScore = 1e18;
        for (let X = 10; X <= bgW - blkW - 10; X++) {
          let ssd = 0;
          for (const m of mask) {
            const bi = (m.y * bgW + (X + m.x)) * 4;
            const dr = blkData[m.i] - bgData[bi];
            const dg = blkData[m.i + 1] - bgData[bi + 1];
            const db = blkData[m.i + 2] - bgData[bi + 2];
            ssd += dr * dr + dg * dg + db * db;
            if (ssd > bestScore) break;
          }
          if (ssd < bestScore) { bestScore = ssd; bestX = X; }
        }

        // refine subpixel
        let fineX = bestX, fineScore = bestScore;
        for (let dx = -3; dx <= 3; dx += 0.2) {
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
          if (ssd < fineScore) { fineScore = ssd; fineX = fx; }
        }

        return { bestX, bestScore, refinedX: fineX, refinedScore: fineScore, leftTrim, maskLen: mask.length };
      });

      if (matchLogs?.error) {
        console.error("❌ matching failed", matchLogs);
        await page.screenshot({ path: 'debug_match_error.png', fullPage: true });
        return;
      }
      canvasBestX = matchLogs.refinedX;
      console.log("🔎 matching refinedX:", canvasBestX, "leftTrim:", matchLogs.leftTrim);
    }

    // -------------------------------------------------------------------------------------
    // Conversión PRECISA: considerar leftTrim y blockCSS
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

      // compute leftTrim (first nontransparent column) in block CSS space
      const blkCtx = blk.getContext('2d');
      const blkData = blkCtx.getImageData(0, 0, blk.width, blk.height).data;
      let leftTrim = 0;
      for (let x = 0; x < blk.width; x++) {
        let ok = false;
        for (let y = 0; y < blk.height; y++) {
          if (blkData[(y * blk.width + x) * 4 + 3] > 10) { ok = true; break; }
        }
        if (ok) { leftTrim = x; break; }
      }

      return {
        canvasX,
        canvasWidth: bg.width,
        canvasCSS: bgRect.width,
        blockCSS: blkRect.width,
        sliderCSS: sliderRect.width,
        railCSS: railRect.width,
        bgLeft: bgRect.left,
        railLeft: railRect.left,
        leftTrim // px in block canvas coordinates
      };
    }, canvasBestX);

    // now compute finalOffset correctly:
    // visibleBestX = canvasBestX * scale
    const scale = conv.canvasCSS / conv.canvasWidth;
    const visibleBestX = canvasBestX * scale;
    const leftTrimVisible = conv.leftTrim * scale;

    // usableCanvas should be canvasCSS - blockCSS (where block can slide)
    const canvasVisibleUsable = Math.max(conv.canvasCSS - conv.blockCSS, 1);
    const usableRail = Math.max(conv.railCSS - conv.sliderCSS, 1);

    // finalOffsetOnRail = ((visibleBestX - leftTrimVisible) / canvasVisibleUsable) * usableRail
    let finalOffset = ((visibleBestX - leftTrimVisible) / canvasVisibleUsable) * usableRail;

    // enforce limits
    finalOffset = Math.max(0, Math.min(finalOffset, usableRail));

    console.log("🔧 CONVERSION DETAILS:", {
      canvasBestX,
      scale,
      visibleBestX,
      leftTrimVisible,
      canvasVisibleUsable,
      usableRail,
      finalOffset
    });

    // -------------------------------------------------------------------------------------
    // Drag: ensure DOM mousedown and then humanized mouse moves by DELTA
    // -------------------------------------------------------------------------------------
    const sliderHandle = await page.$(".slidercaptcha .slider");
    const sliderBox = await sliderHandle.boundingBox();
    const startX = sliderBox.x + sliderBox.width / 2;
    const startY = sliderBox.y + sliderBox.height / 2;

    // dispatch DOM mousedown to trigger internal listeners
    await sliderHandle.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent('mousedown', {
        view: window, bubbles: true, cancelable: true,
        clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, buttons: 1
      }));
    });
    await sleep(40);

    async function doDragDelta(deltaPx) {
      // ensure start position
      await page.mouse.move(startX, startY, { steps: 3 });
      await sleep(50 + Math.random() * 30);
      await page.mouse.down();

      const steps = 60;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
        const x = startX + deltaPx * ease + (Math.random() - 0.5) * 0.6;
        const y = startY + (Math.random() - 0.5) * 1.2;
        await page.mouse.move(x, y);
        await sleep(4 + Math.random() * 6);
      }

      await sleep(40 + Math.random() * 40);
      await page.mouse.up();
      await sleep(900);

      // check success
      const ok = await page.evaluate(() => {
        const captcha = document.querySelector(".slidercaptcha");
        if (!captcha) return true; // ⚠️ CAPTCHA YA NO EXISTE → LOGIN EXITOSO
        const sc = captcha.querySelector(".sliderContainer");
        if (!sc) return true;      // ⚠️ CONTENEDOR YA NO ESTÁ → LOGIN LISTO
        return sc.classList.contains("sliderContainer_success");
      });
      return ok;
    }

    // Attempt primary
    console.log("🎯 Intentando delta:", finalOffset.toFixed(3));
    let solved = await doDragDelta(finalOffset);
    console.log("result primary:", solved);

    // micro nudges if fail
    if (!solved) {
      const deltas = [-6, -4, -2, -1, 1, 2, 4, 6];
      for (const d of deltas) {
        console.log("🔁 intentando nudged delta:", (finalOffset + d).toFixed(3));
        if (await doDragDelta(finalOffset + d)) { solved = true; console.log("ok nudged", d); break; }
        await sleep(200);
      }
    }

    // subpixel search
    if (!solved) {
      const subs = [-1, -0.5, -0.25, 0.25, 0.5, 1];
      for (const d of subs) {
        console.log("🔬 subpixel delta:", (finalOffset + d).toFixed(3));
        if (await doDragDelta(finalOffset + d)) { solved = true; console.log("ok sub", d); break; }
        await sleep(200);
      }
    }

    console.log(solved ? "✅ CAPTCHA OK" : "❌ CAPTCHA FAIL");

    // screenshot
    await page.screenshot({ path: solved ? "success.png" : "fail.png", fullPage: true });

    // final logs
    console.log("\n--- LOG FINAL ---");
    console.log(JSON.stringify({
      instData,
      matchLogs,
      conv,
      leftTrimVisible: conv.leftTrim * scale,
      canvasBestX,
      scale,
      visibleBestX,
      canvasVisibleUsable,
      usableRail,
      finalOffset,
      startX, startY,
      solved
    }, null, 2));


    await page.mouse.down();

    await page.waitForSelector(selector, { visible: true, timeout: 15000 });
    const html = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.outerHTML : null;
    }, selector);

    await browser.close();
    res.json({ success: true, html });



  } catch (err) {
    console.error("ERROR:", err);
    await page.screenshot({ path: "debug_error.png", fullPage: true }).catch(() => { });
    await browser.close();
  }
});

app.listen(3000, () => {
  console.log("Servidor listo en http://localhost:3000");
});