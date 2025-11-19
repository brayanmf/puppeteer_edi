import express from "express";
import puppeteer from "puppeteer";
import fs from "fs"; 

const app = express();
app.use(express.json());

app.post("/api/extraer", async (req, res) => {
  const { url, selector } = req.body;


  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,  
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
   
    await page.setViewport({ width: 1366, height: 768 });

  
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`🖥️ NAVEGADOR (${msg.type()}):`, msg.text());
      }
    });


    const response = await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });


    console.log(`2. Respuesta del servidor: ${response.status()} ${response.statusText()}`);

    if (response.status() >= 400) {
      throw new Error(`El servidor rechazó la URL con error: ${response.status()}`);
    }

   

    try {
   
      await page.waitForSelector(selector, { visible: true, timeout: 15000 });
      console.log("✅ Selector encontrado!");

    } catch (e) {
   
      await page.screenshot({ path: 'debug_error.png', fullPage: true });
     


      const estructura = await page.evaluate(() => {
 
        return Array.from(document.body.children).map(el => ({
            tag: el.tagName,
            clases: el.className,
            id: el.id
        }));
      });
      


      const htmlContent = await page.content();
      fs.writeFileSync('debug_dom.html', htmlContent); 
      
      throw new Error(`Timeout esperando ${selector}. Revisa debug_error.png`);
    }

 
    const html = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.outerHTML : null;
    }, selector);

    await browser.close();
    res.json({ success: true, html });

  } catch (err) {
    console.error("Error:", err.message);
    if (browser) await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor listo en http://localhost:3000");
});