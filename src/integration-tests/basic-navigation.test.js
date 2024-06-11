const portfinder = require('portfinder');
const puppeteer = require('puppeteer');

const app = require('../meadowlark');

let server = null;
let port = null;

beforeEach(async () => {
    port = await portfinder.getPortPromise();
    server = app.listen(port);
});

afterEach(() => {
    server.close();
});

test('Home page links to about page', async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' });
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('[data-test-id="about"]'),
        ]);
        expect(page.url()).toBe(`http://localhost:${port}/about`);
        await browser.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
});

test('About page links to home page', async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`http://localhost:${port}/about`, { waitUntil: 'networkidle2' });
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('[data-test-id="home"]')
        ]);
        expect(page.url()).toBe(`http://localhost:${port}/`);
        await browser.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
});