// =============================================================================
// generate-sitemap.js
//
// Generates sitemap.xml from data.json's profiles (as ?rom=<id> URLs) and
// faq/manifest.json's articles (as ?faq=<id> URLs). Run automatically by
// .github/workflows/deploy.yml before each deploy — you never need to run
// this yourself or commit sitemap.xml; it's regenerated fresh every time.
//
// Requires data.json's hub.siteUrl to be set (your real deployed URL, no
// trailing slash) — if it's missing, this just skips generation entirely
// rather than writing a sitemap full of wrong URLs.
// =============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function main() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data.json'), 'utf8'));
  const siteUrl = (data.hub && data.hub.siteUrl || '').replace(/\/+$/, '');

  if (!siteUrl) {
    console.log('data.json: hub.siteUrl is not set — skipping sitemap.xml generation.');
    return;
  }

  const urls = [`${siteUrl}/`];

  // Multi-profile hub: one URL per ROM. Legacy single-profile data.json (no
  // "profiles" array) has no ?rom= routing at all — the homepage IS the ROM
  // page, already covered by the entry above.
  if (Array.isArray(data.profiles)) {
    data.profiles.forEach(profile => {
      if (profile && profile.id) urls.push(`${siteUrl}/?rom=${encodeURIComponent(profile.id)}`);
    });
  }

  const faqManifestPath = path.join(ROOT, 'faq', 'manifest.json');
  if (fs.existsSync(faqManifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(faqManifestPath, 'utf8'));
      (manifest.articles || []).forEach(article => {
        if (article && article.id) urls.push(`${siteUrl}/?faq=${encodeURIComponent(article.id)}`);
      });
    } catch (err) {
      console.warn('Could not parse faq/manifest.json, skipping FAQ URLs in sitemap:', err.message);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n')}\n</urlset>\n`;

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  console.log(`Generated sitemap.xml with ${urls.length} URL(s).`);
}

main();
