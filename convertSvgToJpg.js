const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const urls = [
    "https://crocoblock.com/plugins/jetengine",
    "https://crocoblock.com/plugins/jetelements",
    "https://crocoblock.com/plugins/jetstylemanager",
    "https://crocoblock.com/plugins/jetsearch",
    "https://crocoblock.com/plugins/jetsmartfilters",
    "https://crocoblock.com/plugins/jetgridbuilder",
    "https://crocoblock.com/plugins/jetblocks",
    "https://crocoblock.com/plugins/jetcomparewishlist",
    "https://crocoblock.com/plugins/jetbooking",
    "https://crocoblock.com/plugins/jetpopup",
    "https://crocoblock.com/plugins/jettabs",
    "https://crocoblock.com/plugins/jetmenu",
    "https://crocoblock.com/plugins/jetreviews",
    "https://crocoblock.com/plugins/jetwoobuilder",
    "https://crocoblock.com/plugins/jetblog",
    "https://crocoblock.com/plugins/jetthemecore",
    "https://crocoblock.com/plugins/jetappointment",
    "https://crocoblock.com/plugins/jetproductgallery",
    "https://crocoblock.com/plugins/jettricks",
    "https://crocoblock.com/plugins/jetformbuilder"
];

(async function convertSvgFromMultipleUrls(urls) {
    // 使用 Puppeteer 打開一個無頭瀏覽器
    const browser = await puppeteer.launch();
    const divClass = '.mb-28.mb-sm-32.mb-lg-36.text-size-null.plugin-logo.pt-xl-12';

    for (const url of urls) {
        const outputPath = path.join(__dirname, `${new URL(url).pathname.split('/').pop()}.png`);

        try {
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });

            const divElement = await page.waitForSelector(divClass);
            const svgElement = await divElement.$('svg');
            if (!svgElement) {
                throw new Error('SVG element not found within the specified div');
            }

            const svgContent = await page.evaluate(svg => {
                svg.setAttribute('style', 'padding: 20px;');
                return svg.outerHTML;
            }, svgElement);

            await page.setContent(`
                <body style="margin: 0; background-color: black; display: flex; align-items: center; justify-content: center; height: 100vh;">
                    ${svgContent}
                </body>
            `);

            const elementHandle = await page.$('svg');
            const boundingBox = await elementHandle.boundingBox();

            const screenshotBuffer = await page.screenshot({
                clip: {
                    x: boundingBox.x - 20,
                    y: boundingBox.y - 20,
                    width: boundingBox.width + 40,
                    height: boundingBox.height + 40
                }
            });

            await sharp(screenshotBuffer)
                .png()
                .toFile(outputPath);

            console.log(`Saved PNG for ${url} to ${outputPath}`);
            await page.close();
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
        }
    }

    await browser.close();
})(urls);
