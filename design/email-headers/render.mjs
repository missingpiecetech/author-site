/**
 * Renders the four "The Nobledark Circle" email newsletter headers to PNG.
 *
 * Each header is an HTML/SVG template drawn at its 600px email display width
 * and captured by headless Puppeteer at deviceScaleFactor 2 (1200px wide PNGs),
 * so text is baked into the image (email clients do not load web fonts).
 *
 * Everything comes from the site, not redrawn:
 *   - colors from client/src/theme.css (ground, cream, accent);
 *   - Cormorant Garamond and Spectral from client/node_modules/@fontsource,
 *     embedded with @font-face;
 *   - the Thorned Bramble corner and divider artwork, read at render time from
 *     client/src/components/ui/filigree/bramble.jsx, drawn at the site's scale
 *     (112px corner box, a fifth outside the 2px frame line; 269x54px divider);
 *   - the background art from client/src/assets/backgrounds, with the site's
 *     20% ground wash and 0 2px 8px #000000 text shadow;
 *   - the gold crystal icon from design/crystal-icon/crystal-icon-gold-wide.svg.
 *
 * Run from anywhere: node design/email-headers/render.mjs
 * Writes nobledark-circle-header-<n>-<name>.png next to this file. Exits with
 * an error after a hard timeout of 60 seconds.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const CLIENT = join(ROOT, 'client');
const require = createRequire(join(CLIENT, 'package.json'));
const puppeteer = require('puppeteer');

const TIMEOUT_MS = 60_000;
const timer = setTimeout(() => {
	console.error(`render.mjs: timed out after ${TIMEOUT_MS / 1000}s`);
	process.exit(1);
}, TIMEOUT_MS);

const COLORS = { ground: '#121017', cream: '#ece4d4', accent: '#cfae6b' };
const WIDTH = 600;
const CORNER_SIZE = 112;
const UNIT = CORNER_SIZE / 100;
const FRAME_BORDER_WIDTH = 2;
const FRAME_INSET = 0.2;
const DIVIDER = { width: 240 * UNIT, height: 48 * UNIT };

// Bramble artwork: take the JSX bodies from bramble.jsx and turn them into SVG markup.
const bramble = readFileSync(join(CLIENT, 'src/components/ui/filigree/bramble.jsx'), 'utf8');
const between = (start, end) => {
	const from = bramble.indexOf(start);
	const to = bramble.indexOf(end, from + start.length);
	if (from < 0 || to < 0) throw new Error(`bramble.jsx: cannot find ${start} ... ${end}`);
	return bramble.slice(from + start.length, to);
};
const toSvg = (jsx) => jsx.replace(/<>|<\/>/g, '').replace(/^\s*\(|\)\s*;?\s*$/g, '');
const ARM = toSvg(between('const ARM = (', ');\n\nexport const CornerArt'));
const CORNER = toSvg(between('export const CornerArt = () => (', ');\n\n/* Half')).replace(/\{ARM\}/g, ARM);
const DIVIDER_HALF = between('const DIVIDER_HALF = ', ';\n').replace('{ARM}', ARM);
const DIVIDER_ART = toSvg(between('export const DividerArt = () => (', ');\n')).replace(
	/\{DIVIDER_HALF\}/g,
	DIVIDER_HALF
);

const font = (file) =>
	`data:font/woff2;base64,${readFileSync(join(CLIENT, 'node_modules/@fontsource', file)).toString('base64')}`;
const FONTS = `
@font-face { font-family: 'Cormorant Garamond'; font-weight: 500; font-style: normal; src: url(${font('cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'Cormorant Garamond'; font-weight: 600; font-style: normal; src: url(${font('cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'Cormorant Garamond'; font-weight: 500; font-style: italic; src: url(${font('cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2')}) format('woff2'); }
@font-face { font-family: 'Spectral'; font-weight: 400; font-style: normal; src: url(${font('spectral/files/spectral-latin-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'Spectral'; font-weight: 500; font-style: normal; src: url(${font('spectral/files/spectral-latin-500-normal.woff2')}) format('woff2'); }`;

const background = (name) =>
	`data:image/webp;base64,${readFileSync(join(CLIENT, 'src/assets/backgrounds', `${name}-2560.webp`)).toString('base64')}`;
const CRYSTAL_ICON = readFileSync(join(ROOT, 'design/crystal-icon/crystal-icon-gold-wide.svg'), 'utf8')
	.replace(/<\?xml[^>]*>/, '')
	.replace(/width="\d+" height="\d+"/, 'width="64" height="64"');

// Corners exactly as FiligreeCorners places them on a frame.
const cornerOffset = FRAME_BORDER_WIDTH / -2 - CORNER_SIZE * FRAME_INSET;
const corners = () =>
	[
		`top:${cornerOffset}px;left:${cornerOffset}px`,
		`top:${cornerOffset}px;right:${cornerOffset}px;transform:scaleX(-1)`,
		`bottom:${cornerOffset}px;left:${cornerOffset}px;transform:scaleY(-1)`,
		`bottom:${cornerOffset}px;right:${cornerOffset}px;transform:scale(-1)`
	]
		.map(
			(style) =>
				`<svg class="corner" viewBox="0 0 100 100" style="${style}" xmlns="http://www.w3.org/2000/svg">${CORNER}</svg>`
		)
		.join('');
const divider = () =>
	`<svg class="divider" viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">${DIVIDER_ART}</svg>`;
const eyebrow = () => `<p class="eyebrow">Michael Vadney</p>`;
const title = () => `<h1>The Nobledark <span class="gold">Circle</span></h1>`;

// The frame sits far enough in that the part of each corner outside it stays on the canvas.
const FRAME_MARGIN = Math.ceil(-cornerOffset) + 2;

const page = (height, body, extraCss = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: ${COLORS.ground}; }
#header { position: relative; width: ${WIDTH}px; height: ${height}px; overflow: hidden; background: ${COLORS.ground}; color: ${COLORS.accent}; }
.art, .wash { position: absolute; inset: 0; }
.art { background-size: cover; background-position: center; }
.wash { background: rgb(18 16 23 / 0.2); }
/* Bottom quarter fades to solid ground (under the frame, which draws on top), so the
   image's foot matches an email body set to the ground color. */
.fade { position: absolute; left: 0; right: 0; bottom: 0; height: 25%; background: linear-gradient(to bottom, rgb(18 16 23 / 0), ${COLORS.ground} 92%); }
.frame { position: absolute; inset: ${FRAME_MARGIN}px; border: ${FRAME_BORDER_WIDTH}px solid ${COLORS.accent}; }
.corner { position: absolute; width: ${CORNER_SIZE}px; height: ${CORNER_SIZE}px; overflow: visible; fill: ${COLORS.accent}; }
.content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
/* The divider artwork leaves empty space at the bottom of its box; this centers the ink. */
.optical { padding-top: 8px; }
.eyebrow { font-family: 'Spectral', serif; font-weight: 400; font-size: 13px; letter-spacing: 0.22em; text-transform: uppercase; color: ${COLORS.accent}; padding-left: 0.22em; }
h1 { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 50px; line-height: 0.95; color: ${COLORS.cream}; }
.gold { color: ${COLORS.accent}; }
.divider { width: ${DIVIDER.width}px; height: ${DIVIDER.height}px; overflow: visible; fill: ${COLORS.accent}; flex-shrink: 0; }
${extraCss}
</style></head><body><div id="header">${body}</div></body></html>`;

const DESIGNS = [
	{
		file: 'nobledark-circle-header-1-framed.png',
		html: page(
			260,
			`<div class="frame">${corners()}</div>
			<div class="content optical">${eyebrow()}<div style="height:10px"></div>${title()}<div style="height:10px"></div>${divider()}</div>`
		)
	},
	{
		file: 'nobledark-circle-header-2-over-art.png',
		html: page(
			260,
			`<div class="art" style="background-image:url(${background('cracks')})"></div><div class="wash"></div><div class="wash" style="background: rgb(18 16 23 / 0.15)"></div><div class="fade"></div>
			<div class="frame">${corners()}</div>
			<div class="content optical shadowed">${eyebrow()}<div style="height:10px"></div>${title()}<div style="height:10px"></div>${divider()}</div>`,
			`.shadowed .eyebrow, .shadowed h1 { text-shadow: 0 2px 8px #000000; }
			 .shadowed .divider { filter: drop-shadow(0 2px 8px #000000); }`
		)
	},
	{
		file: 'nobledark-circle-header-3-crest.png',
		html: page(
			270,
			`<div class="frame">${corners()}</div>
			<div class="content">${CRYSTAL_ICON}<div style="height:12px"></div>${eyebrow()}<div style="height:10px"></div>${title()}</div>`
		)
	},
	{
		file: 'nobledark-circle-header-4-minimal.png',
		html: page(
			240,
			`<div class="content optical">${eyebrow()}<div style="height:12px"></div>${title()}<div style="height:12px"></div>${divider()}</div>`
		)
	}
];

const browser = await puppeteer.launch({ headless: 'new' });
try {
	const tab = await browser.newPage();
	await tab.setViewport({ width: WIDTH, height: 400, deviceScaleFactor: 2 });
	for (const design of DESIGNS) {
		await tab.setContent(design.html, { waitUntil: 'load' });
		await tab.evaluate(() => document.fonts.ready);
		const missing = await tab.evaluate(() =>
			['600 50px "Cormorant Garamond"', '400 13px Spectral'].filter((f) => !document.fonts.check(f))
		);
		if (missing.length) throw new Error(`${design.file}: fonts not loaded: ${missing.join(', ')}`);
		const header = await tab.$('#header');
		writeFileSync(join(HERE, design.file), await header.screenshot({ type: 'png' }));
		console.log(`wrote ${design.file}`);
	}
} finally {
	await browser.close();
	clearTimeout(timer);
}
