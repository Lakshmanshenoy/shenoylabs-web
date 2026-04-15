#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Simple CLI to generate an article hero SVG.
// Usage example:
// node scripts/generate-hero.js --title "Blueprint: Integrations" --subtitle "Environment variables · runbooks" --output public/images/articles/blueprint-hero.svg

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const argv = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      opts[key] = true;
    } else {
      opts[key] = next;
      i++;
    }
  }
  return opts;
}

function escapeXml(s) {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const opts = parseArgs();

const title = opts.title || opts.t || 'Article Title';
const subtitle = opts.subtitle || opts.s || '';
const output = opts.output || opts.o || path.join(process.cwd(), 'public/images/articles/hero-generated.svg');
const width = parseInt(opts.width || opts.w || '1200', 10);
const height = parseInt(opts.height || opts.h || '675', 10);
const accent1 = opts.accent1 || '#f8fafc';
const accent2 = opts.accent2 || '#e2e8f0';
const textColor = opts.fg || '#0f172a';
const caption = opts.caption || '';

const titleFontSize = Math.min(64, Math.floor(width / 20));
const subtitleFontSize = Math.min(28, Math.floor(width / 42));
const titleY = Math.round(height * 0.33);
const subtitleY = titleY + Math.round(titleFontSize * 0.9) + 8;
const captionY = height - 40;

const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)}">\n` +
  `  <defs>\n` +
  `    <linearGradient id="g" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">\n` +
  `      <stop offset="0" stop-color="${accent1}"/>\n` +
  `      <stop offset="1" stop-color="${accent2}"/>\n` +
  `    </linearGradient>\n` +
  `  </defs>\n` +
  `  <rect width="${width}" height="${height}" fill="url(#g)"/>\n` +
  `  <rect x="80" y="${Math.round(height * 0.14)}" width="${width - 160}" height="${Math.round(height * 0.72)}" rx="24" fill="#ffffff" stroke="#cbd5e1"/>\n` +
  `  <text x="140" y="${titleY}" fill="${textColor}" font-family="Georgia, serif" font-size="${titleFontSize}" font-weight="700">${escapeXml(title)}</text>\n` +
  (subtitle ? `  <text x="140" y="${subtitleY}" fill="#475569" font-family="Arial, sans-serif" font-size="${subtitleFontSize}">${escapeXml(subtitle)}</text>\n` : '') +
  (caption ? `  <text x="140" y="${captionY}" fill="#475569" font-family="Arial, sans-serif" font-size="13">${escapeXml(caption)}</text>\n` : '') +
  `</svg>\n`;

const outdir = path.dirname(output);
fs.mkdirSync(outdir, { recursive: true });
fs.writeFileSync(output, svg, 'utf8');
console.log('Wrote', output);
