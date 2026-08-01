// =============================================================================
// main.js — renders the page from data.json, then overlays live release data
// fetched directly from the ROM's own release feed (JSON) and changelog (text).
//
// EDIT: to change editorial content (tagline, specs, install steps, logo),
// edit data.json. To point this page at a different device/ROM release feed,
// edit the "remote" block at the top of data.json.
// =============================================================================

// Small inline icon set (no external icon font/library needed).
// EDIT: add more entries here if you add new spec/link types in data.json.
const ICONS = {
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
  display: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4"/></svg>',
  memory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  android: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9v6M18 9v6M8 4l1.5 2M16 4l-1.5 2"/><rect x="6" y="6" width="12" height="10" rx="3"/><circle cx="9.5" cy="10.5" r=".6" fill="currentColor"/><circle cx="14.5" cy="10.5" r=".6" fill="currentColor"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.22-3.37-1.22-.46-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.11 2.91.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.74 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.32 2.74-1.05 2.74-1.05.56 1.43.21 2.48.1 2.74.65.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10 12.5 2.5 4 3l-.5 8.5L11 19l9-9z"/><circle cx="8.5" cy="7.5" r="1.2" fill="currentColor"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 3.5 2.7 10.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14c.3-1.2-.5-1.8-1.8-1.8z"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>',
  firmware: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/><path d="M9 9h6v6H9z"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6"/></svg>',
  tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
  bitcoin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h4a2 2 0 0 1 0 4h-4zM9.5 11.5h4.5a2 2 0 0 1 0 4h-4.5zM9.5 7.5v8M11 6v1.5M13 6v1.5M11 15.5V17M13 15.5V17"/></svg>',
  ethereum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v7.5L18 14 12 3z"/><path d="M12 3 6 14l6-3.5z"/><path d="M12 15.5 6 14l6 6.5 6-6.5z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.35-9.5-8.5C.8 8 2 4.5 5.5 4c2-.3 3.7.8 4.5 2.3C10.8 4.8 12.5 3.7 14.5 4 18 4.5 19.2 8 17.5 11.5 15 15.65 12 20 12 20z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>'
};

// Escapes text before it goes inside a code block — shell commands often
// contain characters like < > that would otherwise break the markup.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function iconMarkup(name) {
  return ICONS[name] || ICONS.tag;
}

// Formats an ISO date (YYYY-MM-DD) into a short, locale-agnostic display date.
function formatDate(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// "2 days ago" / "Today" for recent dates, falling back to a plain date
// (e.g. "12 Jul 2026") once it's more than a few weeks old — kept short so
// it fits comfortably in a hub-card's meta row.
function formatRelativeDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);

  if (diffDays < 0) return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Formats a byte count into a human-readable size, e.g. 1929857518 -> "1.80 GB".
function formatSize(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return null;
  const gb = Number(bytes) / (1024 ** 3);
  return `${gb.toFixed(2)} GB`;
}

// Appends a "?v=<version>" cache-busting query param to a LOCAL image path.
// Without this, replacing e.g. assets/img/logo.svg with new artwork but
// keeping the same filename can leave browsers showing the old cached copy
// indefinitely; bumping "assetVersion" in data.json forces a re-fetch.
// Left untouched for absolute/external URLs (nothing to bust there, and we
// shouldn't tack unexpected query params onto someone else's server).
function withCacheBust(url, version) {
  if (!url || !version) return url;
  if (/^([a-z]+:)?\/\//i.test(url)) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

// Fades an <img> in once it's actually decoded, instead of it popping in
// abruptly (or sitting blank) while it loads. Safe to call on an image
// that's already cached/complete — it just fades in immediately.
function fadeInOnLoad(img) {
  if (!img) return;
  img.classList.add('fade-in');
  img.classList.remove('img-loaded');
  const reveal = () => img.classList.add('img-loaded');
  if (img.complete && img.naturalWidth > 0) {
    reveal();
  } else {
    img.addEventListener('load', reveal, { once: true });
    img.addEventListener('error', reveal, { once: true }); // don't hide a broken image forever
  }
}

// Warms the browser's cache for an image URL ahead of time (e.g. the rest of
// a screenshot gallery) so opening the lightbox later feels instant instead
// of stuttering on a first-time decode.
function preloadImage(url) {
  if (!url) return;
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
}

// Default timeout for network requests. On a poor connection, failing fast
// and falling back to cached/local data beats leaving the UI hanging.
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// cacheMode: 'no-cache' (default) always revalidates with the server — right
// for the remote OTA feeds, where a new release should show up promptly.
// Pass 'default' for local, rarely-changing files (data.json) to let the
// browser serve a fully cached copy on repeat visits without a network
// round trip at all.
async function loadJson(url, cacheMode = 'no-cache') {
  const response = await fetchWithTimeout(url, { cache: cacheMode });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return response.json();
}

async function loadText(url, cacheMode = 'no-cache') {
  const response = await fetchWithTimeout(url, { cache: cacheMode });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return response.text();
}

// -----------------------------------------------------------------------
// Remote release JSON — field NAMES vary between ROMs (some use "download",
// others "url" or "downloadUrl"; some nest the release list under a
// different key, etc). Instead of hardcoding one ROM's field names, every
// lookup below goes through releaseJsonMap (configured in data.json), so
// adapting to a different ROM's OTA JSON is a data.json edit, not a code edit.
// -----------------------------------------------------------------------

// Reads a (possibly nested) value out of an object using a "a.b.c" path.
// Used both to locate the release list inside the JSON and to read
// individual fields, since some ROMs nest fields (e.g. "meta.version").
function getByPath(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

// Looks up one logical field (e.g. "version") on a release entry, using the
// JSON key name configured for it in releaseJsonMap.fields, falling back to
// the field's own name if nothing is configured.
function getMappedField(entry, map, fieldKey) {
  const jsonKey = (map.fields && map.fields[fieldKey]) || fieldKey;
  return getByPath(entry, jsonKey);
}

// Converts whatever date representation the feed uses into a plain
// YYYY-MM-DD string, based on releaseJsonMap.dateFormat.
function normalizeReleaseDate(rawValue, dateFormat) {
  if (rawValue === undefined || rawValue === null || rawValue === '') return null;

  switch (dateFormat) {
    case 'unix_millis':
      return new Date(Number(rawValue)).toISOString().split('T')[0];
    case 'iso':
    case 'text':
      return String(rawValue).split('T')[0];
    case 'unix_seconds':
    default:
      return new Date(Number(rawValue) * 1000).toISOString().split('T')[0];
  }
}

function pickRepoUrlsFromDownloadLink(downloadUrl) {
  // Expected shape: https://github.com/<owner>/<repo>/releases/download/<tag>/<file>
  // Harmless no-op if the ROM hosts downloads somewhere else — it just won't match.
  const match = downloadUrl && downloadUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\//);
  if (!match) return null;
  const [, owner, repo] = match;
  return {
    repoUrl: `https://github.com/${owner}/${repo}`,
    releasesUrl: `https://github.com/${owner}/${repo}/releases`
  };
}

// Optional: pulls the device codename / Android base version out of the
// build filename using a regex configured in releaseJsonMap.filenamePattern,
// which must use named capture groups (?<codename>...) and (?<androidBase>...).
// If no pattern is configured, this is skipped and data.json's own
// device.codename / latestRelease.androidBase are left untouched.
function pickCodenameFromFilename(filename, pattern) {
  if (!filename || !pattern) return null;
  try {
    const match = filename.match(new RegExp(pattern));
    if (!match || !match.groups) return null;
    const { codename, androidBase } = match.groups;
    return {
      codename: codename || null,
      androidBase: androidBase ? `Android ${androidBase.split('.')[0]}` : null
    };
  } catch (err) {
    console.error('Invalid releaseJsonMap.filenamePattern regex:', err);
    return null;
  }
}

// Picks the latest release entry out of the raw JSON feed using
// releaseJsonMap.listPath (dot-path to the array) and .entryIndex.
function extractReleaseEntry(feedJson, map) {
  const list = map.listPath ? getByPath(feedJson, map.listPath) : feedJson;
  const array = Array.isArray(list) ? list : [list].filter(Boolean);
  return array[map.entryIndex ?? 0];
}

// Applies one release entry onto the page data, using releaseJsonMap to
// resolve each ROM-specific field name.
function applyRemoteRelease(pageData, release, map) {
  if (!release) return;

  const version = getMappedField(release, map, 'version');
  const deviceName = getMappedField(release, map, 'device');
  const filename = getMappedField(release, map, 'filename');
  const download = getMappedField(release, map, 'download');
  const rawDate = getMappedField(release, map, 'date');
  const buildType = getMappedField(release, map, 'buildType');
  const maintainer = getMappedField(release, map, 'maintainer');
  const size = getMappedField(release, map, 'size');
  const sha256 = getMappedField(release, map, 'sha256');
  const md5 = getMappedField(release, map, 'md5');
  const telegram = getMappedField(release, map, 'telegram');
  const gapps = getMappedField(release, map, 'gapps');
  const firmware = getMappedField(release, map, 'firmware');

  const parsedFilename = pickCodenameFromFilename(filename, map.filenamePattern);
  const repoUrls = pickRepoUrlsFromDownloadLink(download);
  const dateIso = normalizeReleaseDate(rawDate, map.dateFormat) || pageData.latestRelease.date;

  if (deviceName) pageData.device.name = deviceName;
  if (parsedFilename) {
    if (parsedFilename.codename) pageData.device.codename = parsedFilename.codename;
    if (parsedFilename.androidBase) pageData.latestRelease.androidBase = parsedFilename.androidBase;
  }

  pageData.latestRelease.version = version || pageData.latestRelease.version;
  pageData.latestRelease.codename = buildType || pageData.latestRelease.codename;
  pageData.latestRelease.date = dateIso;
  pageData.latestRelease.maintainer = maintainer;
  pageData.latestRelease.size = formatSize(size);
  pageData.latestRelease.sha256 = sha256 || null;
  pageData.latestRelease.md5 = md5 || null;

  // NOTE: links.downloads is intentionally NOT overwritten here — it stays
  // fully controlled by data.json (e.g. a stable ".../releases/latest" page)
  // rather than being replaced by this build's direct download URL.
  if (telegram) pageData.links.telegram = telegram;
  if (gapps) pageData.links.gapps = gapps;
  if (firmware) pageData.links.firmware = firmware;
  if (repoUrls) {
    pageData.links.github = repoUrls.repoUrl;
    pageData.links.releases = repoUrls.releasesUrl;
  }
}

// -----------------------------------------------------------------------
// Remote changelog text — formats vary (dash vs asterisk bullets, "----"
// vs "====" underlines, etc), so the date pattern and bullet characters are
// configurable via changelogMap in data.json instead of hardcoded here.
// -----------------------------------------------------------------------
function parseChangelogText(text, map = {}) {
  const dateLinePattern = new RegExp(map.dateLinePattern || '^\\d{4}-\\d{2}-\\d{2}$');
  const bulletChars = (map.bulletPrefixes && map.bulletPrefixes.length > 0)
    ? map.bulletPrefixes
    : ['-', '*'];
  const bulletClass = bulletChars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
  const bulletLineRegex = new RegExp(`^[${bulletClass}]+\\s*`);
  const separatorLineRegex = new RegExp(`^([${bulletClass}=_])\\1+$`); // e.g. "----", "====", "****"

  const lines = text.split('\n');
  const dateLineIndexes = [];

  lines.forEach((line, index) => {
    if (dateLinePattern.test(line.trim())) {
      dateLineIndexes.push(index);
    }
  });

  return dateLineIndexes.map((startIndex, i) => {
    const endIndex = dateLineIndexes[i + 1] ?? lines.length;
    const block = lines.slice(startIndex, endIndex);
    const changes = block
      .map(line => line.trim())
      .filter(line => bulletLineRegex.test(line) && !separatorLineRegex.test(line))
      .map(line => line.replace(bulletLineRegex, ''));

    return {
      date: lines[startIndex].trim(),
      changes
    };
  });
}

function applyRemoteChangelog(pageData, entries) {
  if (!entries || entries.length === 0) return;

  pageData.changelog = entries;

  // Use the newest entry's own bullets as the release summary so it always
  // reflects what actually shipped, instead of a static editorial blurb.
  const [latestEntry] = entries;
  if (latestEntry && latestEntry.changes.length > 0) {
    pageData.latestRelease.summary = latestEntry.changes.slice(0, 3).join('. ') + '.';
  }
}

// -----------------------------------------------------------------------
// Rendering
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// Theme colors — lets data.json override the Material You accent palette to
// match a specific ROM's branding, without touching any CSS. Only the
// accent hues need to be supplied; the "on-primary" text color (used for
// filled-button text) is auto-computed for contrast unless overridden, and
// --color-primary-container derives from --color-primary automatically via
// color-mix() in the stylesheet.
// -----------------------------------------------------------------------
function hexToRgb(hex) {
  const clean = String(hex).trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// WCAG relative luminance, used to decide whether dark or light text reads
// better on a given accent color.
function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(channel => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastTextFor(hex) {
  return relativeLuminance(hex) > 0.55 ? '#1B1523' : '#FFFFFF';
}

const THEMEABLE_CSS_PROPERTIES = [
  '--color-primary',
  '--color-secondary',
  '--color-tertiary',
  '--color-on-primary',
  '--color-primary-container'
];

// Clears any inline theme overrides from a previously active profile so the
// stylesheet's defaults (or the next profile's own theme) take over cleanly —
// without this, switching from a themed profile to one with no/partial
// theme config would leave the old profile's colors stuck via inline style.
function resetTheme() {
  const root = document.documentElement.style;
  THEMEABLE_CSS_PROPERTIES.forEach(prop => root.removeProperty(prop));
}

function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement.style;

  if (theme.primary) {
    root.setProperty('--color-primary', theme.primary);
    root.setProperty('--color-on-primary', theme.onPrimary || contrastTextFor(theme.primary));
  }
  if (theme.secondary) root.setProperty('--color-secondary', theme.secondary);
  if (theme.tertiary) root.setProperty('--color-tertiary', theme.tertiary);
  // Optional manual override; otherwise the stylesheet derives this from
  // --color-primary via color-mix() automatically.
  if (theme.primaryContainer) root.setProperty('--color-primary-container', theme.primaryContainer);
}

let currentHub = null; // set once in init(); used by renderFooter() when no profile is open (hub view)

// Renders the footer credit line. Pass a profile when a specific ROM's page
// is open; pass null on the hub view, where there's no single ROM to credit —
// falling back to the collection's own identity instead of leaving stale
// placeholder text ("ROM") visible.
// Currencies we know how to label/icon. Add more here (and to data.json's
// donate object) if you want to accept something beyond BTC/ETH.
const DONATE_CURRENCIES = {
  bitcoin: { label: 'Bitcoin (BTC)', icon: 'bitcoin' },
  ethereum: { label: 'Ethereum (ETH)', icon: 'ethereum' }
};

// Renders the wallet address rows (reusing the same copyable code-block
// look as the install guide) and returns whether there was anything to show.
function renderDonateWallets(donate) {
  const rows = Object.keys(DONATE_CURRENCIES)
    .filter(key => donate && donate[key])
    .map(key => {
      const { label, icon } = DONATE_CURRENCIES[key];
      return `
        <div class="donate-wallet">
          <div class="donate-wallet-label">${iconMarkup(icon)}<span>${label}</span></div>
          ${renderCodeBlock(donate[key])}
        </div>
      `;
    });
  document.getElementById('donate-wallets').innerHTML = rows.join('');
  return rows.length > 0;
}

function openDonateModal() {
  document.getElementById('donate-modal').classList.add('open');
}

function closeDonateModal() {
  document.getElementById('donate-modal').classList.remove('open');
}

function initDonateModal() {
  const modal = document.getElementById('donate-modal');
  document.getElementById('footer-donate-link').addEventListener('click', openDonateModal);
  document.getElementById('donate-modal-close').addEventListener('click', closeDonateModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeDonateModal(); // click on the backdrop, not the card
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeDonateModal();
  });
}

// -----------------------------------------------------------------------
// Fox Run — a small hidden easter egg (classic Snake, fox-skinned). Type
// "fox" anywhere on the page (not while typing in a field) to open it.
// Purely a fun bonus; it doesn't touch or depend on anything else on the site.
// -----------------------------------------------------------------------
const FOX_GAME_GRID_SIZE = 20;
const FOX_GAME_CELL_SIZE = 20; // canvas is 400x400 -> 20x20 grid
const FOX_GAME_TICK_MS = 130;

let foxGameState = null; // holds the current game's mutable state while the modal is open

function placeFoxGameFood(snake) {
  let cell;
  do {
    cell = { x: Math.floor(Math.random() * FOX_GAME_GRID_SIZE), y: Math.floor(Math.random() * FOX_GAME_GRID_SIZE) };
  } while (snake.some(seg => seg.x === cell.x && seg.y === cell.y));
  return cell;
}

function resetFoxGameState() {
  const start = { x: 10, y: 10 };
  const snake = [start, { x: 9, y: 10 }, { x: 8, y: 10 }];
  const rootStyle = getComputedStyle(document.documentElement);

  foxGameState = {
    snake,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: placeFoxGameFood(snake),
    score: 0,
    over: false,
    timerId: null,
    // Read the theme colors once per game rather than every frame.
    colors: {
      background: rootStyle.getPropertyValue('--color-background').trim() || '#05070D',
      primary: rootStyle.getPropertyValue('--color-primary').trim() || '#4DA6FF',
      secondary: rootStyle.getPropertyValue('--color-secondary').trim() || '#88EBFF',
      tertiary: rootStyle.getPropertyValue('--color-tertiary').trim() || '#FFC868',
      onSurface: rootStyle.getPropertyValue('--color-on-surface').trim() || '#E8F0FF'
    }
  };
}

function drawFoxGame() {
  const canvas = document.getElementById('fox-game-canvas');
  const ctx = canvas.getContext('2d');
  const size = FOX_GAME_CELL_SIZE;
  const { colors } = foxGameState;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Food
  ctx.fillStyle = colors.tertiary;
  const food = foxGameState.food;
  ctx.beginPath();
  ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Body (head brighter/secondary-colored, rest primary)
  foxGameState.snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? colors.secondary : colors.primary;
    const pad = index === 0 ? 1 : 2;
    ctx.fillRect(segment.x * size + pad, segment.y * size + pad, size - pad * 2, size - pad * 2);
  });

  // A couple of triangle "ears" and dot eyes on the head segment, just
  // enough to read as a fox rather than a plain square.
  const head = foxGameState.snake[0];
  const hx = head.x * size + size / 2;
  const hy = head.y * size + size / 2;
  ctx.fillStyle = colors.background;
  ctx.beginPath();
  ctx.moveTo(hx - 6, hy - 4);
  ctx.lineTo(hx - 3, hy - 9);
  ctx.lineTo(hx, hy - 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx, hy - 4);
  ctx.lineTo(hx + 3, hy - 9);
  ctx.lineTo(hx + 6, hy - 4);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx - 3, hy, 1.2, 0, Math.PI * 2);
  ctx.arc(hx + 3, hy, 1.2, 0, Math.PI * 2);
  ctx.fill();

  if (foxGameState.over) {
    ctx.fillStyle = 'rgba(5, 7, 13, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.onSurface;
    ctx.textAlign = 'center';
    ctx.font = '600 20px Inter, sans-serif';
    ctx.fillText('Game over', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Press Enter to try again', canvas.width / 2, canvas.height / 2 + 16);
  }
}

function tickFoxGame() {
  if (!foxGameState || foxGameState.over) return;

  foxGameState.direction = foxGameState.nextDirection;
  const head = foxGameState.snake[0];
  const newHead = { x: head.x + foxGameState.direction.x, y: head.y + foxGameState.direction.y };

  const hitWall = newHead.x < 0 || newHead.x >= FOX_GAME_GRID_SIZE || newHead.y < 0 || newHead.y >= FOX_GAME_GRID_SIZE;
  const hitSelf = foxGameState.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y);

  if (hitWall || hitSelf) {
    foxGameState.over = true;
    clearInterval(foxGameState.timerId);
    drawFoxGame();
    return;
  }

  foxGameState.snake.unshift(newHead);

  if (newHead.x === foxGameState.food.x && newHead.y === foxGameState.food.y) {
    foxGameState.score += 1;
    document.getElementById('fox-game-score').textContent = String(foxGameState.score);
    foxGameState.food = placeFoxGameFood(foxGameState.snake);
  } else {
    foxGameState.snake.pop();
  }

  drawFoxGame();
}

function openFoxGame() {
  resetFoxGameState();
  document.getElementById('fox-game-score').textContent = '0';
  document.getElementById('fox-game-modal').classList.add('open');
  drawFoxGame();
  foxGameState.timerId = setInterval(tickFoxGame, FOX_GAME_TICK_MS);
}

function closeFoxGame() {
  document.getElementById('fox-game-modal').classList.remove('open');
  if (foxGameState && foxGameState.timerId) clearInterval(foxGameState.timerId);
  foxGameState = null;
}

const FOX_GAME_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 }
};

function initFoxGame() {
  document.getElementById('fox-game-close').addEventListener('click', closeFoxGame);
  document.getElementById('fox-game-modal').addEventListener('click', (event) => {
    if (event.target.id === 'fox-game-modal') closeFoxGame();
  });

  document.addEventListener('keydown', (event) => {
    const modal = document.getElementById('fox-game-modal');
    if (!modal.classList.contains('open')) return;

    if (event.key === 'Escape') {
      closeFoxGame();
      return;
    }

    if (event.key === 'Enter' && foxGameState && foxGameState.over) {
      openFoxGame(); // restart
      return;
    }

    const direction = FOX_GAME_DIRECTIONS[event.key];
    if (!direction || !foxGameState) return;
    event.preventDefault(); // stop arrow keys/space from scrolling the page behind the modal

    // Ignore a direct U-turn into the snake's own neck.
    const current = foxGameState.direction;
    if (direction.x === -current.x && direction.y === -current.y) return;
    foxGameState.nextDirection = direction;
  });

  // Secret trigger: typing "fox" anywhere (not while focused in a text field) opens the game.
  let typedBuffer = '';
  document.addEventListener('keydown', (event) => {
    const active = document.activeElement;
    const tag = active && active.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (active && active.isContentEditable)) return;
    if (event.key.length !== 1) return; // ignore Shift/Arrow/etc — only single printable characters count

    typedBuffer = (typedBuffer + event.key).slice(-3).toLowerCase();
    if (typedBuffer === 'fox') {
      typedBuffer = '';
      openFoxGame();
    }
  });
}

// Best-effort: turns a GitHub repo URL into its /issues page. Returns null
// for anything that doesn't look like a plain github.com/owner/repo URL.
function deriveIssuesUrl(githubUrl) {
  if (!githubUrl) return null;
  const match = githubUrl.match(/^https:\/\/github\.com\/[^/]+\/[^/]+/);
  return match ? `${match[0]}/issues` : null;
}

function renderFooterLinks(profile) {
  const container = document.getElementById('footer-links');
  let links;

  if (profile) {
    const p = profile.links || {};
    links = [
      p.github ? { label: 'Source Code', url: p.github } : null,
      p.releases ? { label: 'Releases', url: p.releases } : null,
      deriveIssuesUrl(p.github) ? { label: 'Issues', url: deriveIssuesUrl(p.github) } : null,
      p.telegram ? { label: 'Telegram', url: p.telegram } : null
    ].filter(Boolean);
  } else {
    links = [
      currentHub && currentHub.githubUrl ? { label: 'GitHub', url: currentHub.githubUrl } : null,
      currentHub && currentHub.telegramUrl ? { label: 'Telegram', url: currentHub.telegramUrl } : null
    ].filter(Boolean);
  }

  container.innerHTML = links
    .map(link => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`)
    .join('');
}

function renderFooter(profile) {
  const romNameEl = document.getElementById('footer-rom-name');
  const creditEl = document.getElementById('footer-credit');
  const donateLink = document.getElementById('footer-donate-link');

  renderFooterLinks(profile);

  // A profile can set its own wallets, or the site-wide ones from data.json's
  // hub.donate are used as a fallback — so a single maintainer's default
  // addresses don't need repeating in every profile.
  const donateConfig = (profile && profile.donate) || (currentHub && currentHub.donate) || null;
  donateLink.hidden = !renderDonateWallets(donateConfig);

  if (profile) {
    romNameEl.textContent = profile.rom.name;
    const author = profile.rom.author;
    if (author && author.name) {
      const link = author.url
        ? `<a href="${author.url}" target="_blank" rel="noopener">${author.name}</a>`
        : author.name;
      creditEl.innerHTML = `Site &amp; ROM maintained by ${link}`;
    } else {
      creditEl.innerHTML = '';
    }
    return;
  }

  romNameEl.textContent = (currentHub && currentHub.title) || 'this site';
  creditEl.innerHTML = '';
}

// Frozen/discontinued profile status. Set profile.status in data.json to
// one of these keys (or leave it unset/"active" for normal behavior).
// profile.statusMessage can override the default wording per-profile.
const STATUS_CONFIG = {
  frozen: {
    badgeLabel: 'Frozen',
    icon: 'pause',
    defaultMessage: 'This build is frozen — no new updates are currently being published.'
  },
  discontinued: {
    badgeLabel: 'Discontinued',
    icon: 'archive',
    defaultMessage: 'Support for this build has been discontinued. Existing downloads remain available below, but no further updates should be expected.'
  }
};

function renderStatusBanner(profile) {
  const banner = document.getElementById('status-banner');
  const config = STATUS_CONFIG[profile.status];

  if (!config) {
    banner.hidden = true;
    return;
  }

  banner.hidden = false;
  banner.className = `status-banner status-banner-${profile.status}`;
  document.getElementById('status-banner-icon').innerHTML = iconMarkup(config.icon);
  document.getElementById('status-banner-text').textContent = profile.statusMessage || config.defaultMessage;
}

function renderHero(data) {
  const { rom, latestRelease } = data;

  document.title = `${rom.name} — Custom Android Firmware`;
  const metaDescription = document.getElementById('meta-description');
  if (metaDescription) metaDescription.setAttribute('content', rom.tagline);

  document.getElementById('hero-title').textContent = rom.name;
  document.getElementById('hero-tagline').textContent = rom.tagline;

  // Every other spot the ROM name appears in static markup (nav CTA button,
  // install section heading/subheading) — kept as ROM-name-aware spans in
  // index.html so switching ROMs never requires hand-editing the HTML.
  const navCtaName = document.getElementById('nav-cta-rom-name');
  if (navCtaName) navCtaName.textContent = rom.name;
  const installHeadingName = document.getElementById('install-heading-rom-name');
  if (installHeadingName) installHeadingName.textContent = rom.name;
  const installSubheadingName = document.getElementById('install-subheading-rom-name');
  if (installSubheadingName) installSubheadingName.textContent = rom.name;

  document.getElementById('hero-meta-version').textContent = latestRelease.version;
  document.getElementById('hero-meta-base').textContent = latestRelease.androidBase;
  document.getElementById('hero-meta-date').textContent = formatDate(latestRelease.date);

  document.getElementById('hero-download-btn').href = data.links.downloads;

  // Hero logo only — the nav-brand logo belongs to the hub (the whole
  // collection's identity) and is set once in renderHub, never here.
  const logoSrc = rom.logoImage ? withCacheBust(rom.logoImage, data.assetVersion) : null;
  if (logoSrc) {
    document.querySelectorAll('.hero-logo').forEach(img => {
      img.src = logoSrc;
      fadeInOnLoad(img);
    });
  }
}

// Gallery state for the screenshot lightbox — populated by renderDevice,
// read by the lightbox open/next/prev functions below.
let galleryImages = [];
let galleryIndex = 0;

function renderDevice(data) {
  const { device } = data;

  document.getElementById('device-name').textContent = device.name;
  document.getElementById('device-codename').textContent = `Codename: ${device.codename}`;

  const rawScreenshots = (device.screenshots && device.screenshots.length > 0)
    ? device.screenshots
    : [{ src: 'assets/img/screenshot-placeholder.svg', caption: '' }];
  galleryImages = data.assetVersion
    ? rawScreenshots.map(item => ({ ...item, src: withCacheBust(item.src, data.assetVersion) }))
    : rawScreenshots;

  const screenshotImg = document.getElementById('device-screenshot');
  screenshotImg.src = galleryImages[0].src;
  screenshotImg.alt = `${device.name} running ${data.rom.name}`;
  fadeInOnLoad(screenshotImg);

  // Warm the cache for the rest of the gallery now, in the background, so
  // opening the lightbox later shows each image instantly instead of
  // stuttering on a first-time decode.
  galleryImages.slice(1).forEach(item => preloadImage(item.src));

  const grid = document.getElementById('specs-grid');
  grid.innerHTML = device.specs.map(spec => `
    <div class="spec-card reveal">
      <div class="spec-icon">${iconMarkup(spec.icon)}</div>
      <div class="spec-label">${spec.label}</div>
      <div class="spec-value">${spec.value}</div>
    </div>
  `).join('');
}

function renderRelease(data) {
  const { latestRelease, links } = data;

  document.getElementById('release-version').textContent = latestRelease.version;
  document.getElementById('release-codename').textContent = latestRelease.codename;
  document.getElementById('release-date').textContent = formatDate(latestRelease.date);
  document.getElementById('release-summary').textContent = latestRelease.summary;
  document.getElementById('release-download-btn').href = links.downloads;
  document.getElementById('release-notes-btn').href = links.releases;

  const metaParts = [];
  if (latestRelease.maintainer) metaParts.push(`Maintainer: ${latestRelease.maintainer}`);
  if (latestRelease.size) metaParts.push(`Size: ${latestRelease.size}`);
  document.getElementById('release-meta').textContent = metaParts.join(' · ');

  const checksums = [
    latestRelease.sha256 ? { label: 'SHA256', value: latestRelease.sha256 } : null,
    latestRelease.md5 ? { label: 'MD5', value: latestRelease.md5 } : null
  ].filter(Boolean);

  document.getElementById('release-checksums').innerHTML = checksums.map(checksum => `
    <div class="checksum-row">
      <span class="checksum-label">${checksum.label}</span>
      <span class="checksum-value" title="${checksum.value}">${checksum.value}</span>
      <button type="button" class="checksum-copy-btn" data-copy-text="${encodeURIComponent(checksum.value)}" aria-label="Copy ${checksum.label} checksum">
        ${iconMarkup('copy')}
      </button>
    </div>
  `).join('');
}

function renderChangelog(data) {
  const list = document.getElementById('changelog-list');
  list.innerHTML = data.changelog.map(entry => `
    <div class="changelog-item reveal">
      <span class="changelog-dot"></span>
      <div class="changelog-meta">
        ${entry.version ? `<span class="changelog-version">${entry.version}</span>` : ''}
        <span class="changelog-date">${formatDate(entry.date)}</span>
      </div>
      <ul class="changelog-changes">
        ${entry.changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// Renders a single command block (array of lines or one string) with a copy button.
function renderCodeBlock(lines) {
  if (!lines) return '';
  const text = Array.isArray(lines) ? lines.join('\n') : lines;
  return `
    <div class="code-block">
      <pre><code>${escapeHtml(text)}</code></pre>
      <button type="button" class="code-copy-btn" data-copy-text="${encodeURIComponent(text)}" aria-label="Copy command">
        ${iconMarkup('copy')}
      </button>
    </div>
  `;
}

function renderCallout(type, text) {
  if (!text) return '';
  const icon = type === 'warning' ? 'warning' : type === 'tip' ? 'tip' : 'info';
  return `
    <div class="install-callout install-callout-${type} reveal">
      <span class="install-callout-icon">${iconMarkup(icon)}</span>
      <span>${text}</span>
    </div>
  `;
}

// Warning banner, requirements checklist and prerequisites — all optional,
// all sourced from data.installGuide so any ROM's guide can be dropped in.
function renderInstallIntro(data) {
  const container = document.getElementById('install-intro');
  const guide = data.installGuide;

  if (!guide) {
    container.innerHTML = '';
    return;
  }

  const requirementItems = (guide.requirements || [])
    .map(req => {
      // linkRef pulls the URL from data.links so it always matches the
      // Downloads button; url is for one-off links that don't belong there.
      const url = req.linkRef ? data.links[req.linkRef] : req.url;
      if (!url) return ''; // skip requirements whose link isn't configured
      const optionalTag = req.optional ? '<span class="requirement-optional-tag">optional</span>' : '';
      return `<li><a href="${url}" target="_blank" rel="noopener">${req.label}</a>${optionalTag}</li>`;
    })
    .filter(Boolean)
    .join('');

  const prereqItems = (guide.prerequisites || [])
    .map(item => `<li>${item}</li>`)
    .join('');

  const requirementsBlock = requirementItems ? `
    <div class="install-requirements reveal">
      <div class="install-requirements-title">Requirements</div>
      <ul class="install-requirements-list">${requirementItems}</ul>
      ${prereqItems ? `
        <div class="install-prereqs-title">Also required</div>
        <ul class="install-prereqs-list">${prereqItems}</ul>
      ` : ''}
    </div>
  ` : '';

  container.innerHTML = [
    renderCallout('tip', guide.otaNote),
    renderCallout('warning', guide.warning),
    requirementsBlock,
    renderCallout('important', guide.importantNote)
  ].join('');
}

// Numbered steps — each one can mix and match description / ordered list /
// code block / a nested "if that fails" alternative / a closing note.
function renderInstallSteps(data) {
  const container = document.getElementById('install-steps');
  const guide = data.installGuide;

  if (!guide || !guide.steps) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = guide.steps.map(step => `
    <div class="install-step reveal">
      <div class="install-step-number"></div>
      <div class="install-step-body">
        <div class="install-step-title">${step.title}</div>
        ${step.description ? `<div class="install-step-desc">${step.description}</div>` : ''}
        ${step.list ? `<ol class="step-list">${step.list.map(item => `<li>${item}</li>`).join('')}</ol>` : ''}
        ${renderCodeBlock(step.code)}
        ${step.alternative ? `
          <div class="step-alternative">
            ${step.alternative.note ? `<div class="step-alternative-note">${step.alternative.note}</div>` : ''}
            ${renderCodeBlock(step.alternative.code)}
          </div>
        ` : ''}
        ${step.important ? `<div class="step-important">${step.important}</div>` : ''}
        ${step.note ? `<div class="step-note">${step.note}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// Copy-to-clipboard for code blocks. Delegated on document so it keeps
// working after install-intro/install-steps are re-rendered with live data.
function initCodeCopyButtons() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.code-copy-btn, .checksum-copy-btn, .copy-link-btn');
    if (!button) return;

    const text = button.dataset.copyText
      ? decodeURIComponent(button.dataset.copyText)
      : window.location.href; // copy-link buttons with no explicit data-copy-text just copy the current URL

    navigator.clipboard.writeText(text).then(() => {
      const original = button.innerHTML;
      button.innerHTML = iconMarkup('check');
      button.classList.add('copied');
      setTimeout(() => {
        button.innerHTML = original;
        button.classList.remove('copied');
      }, 1500);
    }).catch(err => console.error('Clipboard copy failed:', err));
  });
}

function renderLinks(data) {
  const { links } = data;
  const linkDefs = [
    { key: 'github', icon: 'github', title: 'Source code', desc: 'Browse the repository on GitHub' },
    { key: 'downloads', icon: 'download', title: 'Downloads', desc: 'Grab the latest build' },
    { key: 'releases', icon: 'tag', title: 'Release history', desc: 'All versions and changelogs' },
    { key: 'gapps', icon: 'box', title: 'GApps', desc: 'Google apps package for this build' },
    { key: 'firmware', icon: 'firmware', title: 'Firmware', desc: 'Matching vendor firmware package' },
    { key: 'telegram', icon: 'telegram', title: 'Community chat', desc: 'Ask questions, get support' }
  ];

  const grid = document.getElementById('links-grid');
  grid.innerHTML = linkDefs
    .filter(def => links[def.key]) // skip links that aren't set
    .map(def => `
      <a class="link-card reveal" href="${links[def.key]}" target="_blank" rel="noopener">
        <div class="link-icon">${iconMarkup(def.icon)}</div>
        <div>
          <div class="link-title">${def.title}</div>
          <div class="link-desc">${def.desc}</div>
        </div>
      </a>
    `).join('');
}

// Fades / slides sections into view as they cross into the viewport.
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// Adds a subtle background/border once the page has scrolled past the hero.
function initHeaderScrollState() {
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// -----------------------------------------------------------------------
// Screenshot lightbox — opens on clicking the phone mockup, browses through
// device.screenshots from data.json (populated into galleryImages above).
// -----------------------------------------------------------------------
function updateLightboxImage() {
  const item = galleryImages[galleryIndex];
  const image = document.getElementById('lightbox-image');
  image.src = item.src;
  image.alt = item.caption || 'Screenshot';
  fadeInOnLoad(image);
  document.getElementById('lightbox-caption').textContent = item.caption || '';
  document.getElementById('lightbox-counter').textContent = `${galleryIndex + 1} / ${galleryImages.length}`;

  const hasMultiple = galleryImages.length > 1;
  document.getElementById('lightbox-prev').style.display = hasMultiple ? '' : 'none';
  document.getElementById('lightbox-next').style.display = hasMultiple ? '' : 'none';
  document.getElementById('lightbox-counter').style.display = hasMultiple ? '' : 'none';
}

function openLightbox(startIndex) {
  galleryIndex = ((startIndex % galleryImages.length) + galleryImages.length) % galleryImages.length;
  updateLightboxImage();
  document.getElementById('screenshot-lightbox').classList.add('open');
  document.body.style.overflow = 'hidden'; // prevent background scroll while open
}

function closeLightbox() {
  document.getElementById('screenshot-lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function stepLightbox(delta) {
  galleryIndex = ((galleryIndex + delta) % galleryImages.length + galleryImages.length) % galleryImages.length;
  updateLightboxImage();
}

function initLightbox() {
  const phoneScreen = document.getElementById('phone-screen');
  const lightbox = document.getElementById('screenshot-lightbox');

  const openFromPhone = () => openLightbox(0);
  phoneScreen.addEventListener('click', openFromPhone);
  phoneScreen.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFromPhone();
    }
  });

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => stepLightbox(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => stepLightbox(1));

  // Click on the dark backdrop (not the image itself) closes the lightbox.
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') stepLightbox(-1);
    if (event.key === 'ArrowRight') stepLightbox(1);
  });

  initLightboxSwipe(lightbox);
}

// Swipe left/right to move between screenshots on touch devices — mirrors
// the prev/next buttons and arrow-key support above.
function initLightboxSwipe(lightbox) {
  const SWIPE_THRESHOLD_PX = 45; // minimum horizontal travel to count as a swipe
  const DIRECTION_RATIO = 1.5;   // must be this much more horizontal than vertical (ignores scroll-ish gestures)
  const CLAIM_THRESHOLD_PX = 10; // small early movement used just to decide "this looks horizontal"

  let touchStartX = 0;
  let touchStartY = 0;
  let tracking = false;
  let claimedHorizontal = false; // true once we've decided this gesture is a horizontal swipe

  lightbox.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return; // ignore pinch/multi-touch
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    tracking = true;
    claimedHorizontal = false;
  }, { passive: true });

  // Without this, a mobile browser can hijack a horizontal drag for its own
  // gesture (edge-swipe-back, pull-to-refresh, page panning) and fire
  // touchcancel instead of touchend — so the swipe silently never registers.
  // Calling preventDefault() here, only once the gesture is clearly
  // horizontal, tells the browser "this one's ours" instead.
  lightbox.addEventListener('touchmove', (event) => {
    if (!tracking || event.touches.length !== 1) return;

    const deltaX = event.touches[0].clientX - touchStartX;
    const deltaY = event.touches[0].clientY - touchStartY;

    if (!claimedHorizontal
      && Math.abs(deltaX) > CLAIM_THRESHOLD_PX
      && Math.abs(deltaX) > Math.abs(deltaY)) {
      claimedHorizontal = true;
    }

    if (claimedHorizontal) event.preventDefault();
  }, { passive: false }); // must be non-passive for preventDefault() to have any effect

  lightbox.addEventListener('touchend', (event) => {
    if (!tracking) return;
    tracking = false;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(deltaX) < Math.abs(deltaY) * DIRECTION_RATIO) return; // too vertical — not a left/right swipe

    stepLightbox(deltaX < 0 ? 1 : -1); // swiped left -> next, right -> previous
  }, { passive: true });

  lightbox.addEventListener('touchcancel', () => {
    tracking = false;
  }, { passive: true });
}

function renderAll(data) {
  renderHero(data);
  renderDevice(data);
  renderRelease(data);
  renderChangelog(data);
  renderInstallIntro(data);
  renderInstallSteps(data);
  renderLinks(data);
  renderStatusBanner(data);
}

// -----------------------------------------------------------------------
// FAQ — an optional docs/knowledge-base section. Article content lives as
// plain Markdown files under faq/, listed in faq/manifest.json, and is
// rendered client-side with marked.js (loaded via CDN in index.html) into
// the same visual language as the rest of the site. If faq/manifest.json is
// missing or empty, every FAQ nav entry simply stays hidden — the whole
// feature is opt-in and doesn't require anything from data.json.
// -----------------------------------------------------------------------

// GitHub's "> [!NOTE]" style alert blockquotes. Maps the marker to a label,
// an icon (reusing icons already defined above), and a CSS modifier class.
const MARKDOWN_ALERT_CONFIG = {
  NOTE: { label: 'Note', icon: 'info' },
  TIP: { label: 'Tip', icon: 'tip' },
  IMPORTANT: { label: 'Important', icon: 'warning' },
  WARNING: { label: 'Warning', icon: 'warning' },
  CAUTION: { label: 'Caution', icon: 'warning' }
};

// Turns any blockquote starting with "[!NOTE]" (etc — GitHub's alert
// syntax) into a styled callout, after marked.js has already rendered the
// markdown to plain HTML. Blockquotes that don't match are left untouched.
function enhanceMarkdownAlerts(container) {
  container.querySelectorAll('blockquote').forEach(blockquote => {
    const firstParagraph = blockquote.querySelector('p');
    if (!firstParagraph) return;

    const match = firstParagraph.textContent.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
    if (!match) return;

    const type = match[1].toUpperCase();
    const config = MARKDOWN_ALERT_CONFIG[type];
    if (!config) return;

    firstParagraph.innerHTML = firstParagraph.innerHTML.replace(/^\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');

    blockquote.classList.add('markdown-alert', `markdown-alert-${type.toLowerCase()}`);
    const titleEl = document.createElement('div');
    titleEl.className = 'markdown-alert-title';
    titleEl.innerHTML = `${iconMarkup(config.icon)}<span>${config.label}</span>`;
    blockquote.insertBefore(titleEl, blockquote.firstChild);
  });
}

// Returns [] (feature simply doesn't appear) if there's no faq/ folder,
// no manifest, or it's malformed — this is entirely optional.
async function loadFaqManifest() {
  try {
    const manifest = await loadJson('faq/manifest.json', 'default');
    return Array.isArray(manifest.articles) ? manifest.articles : [];
  } catch (err) {
    console.warn('FAQ manifest not loaded (expected if faq/manifest.json is not set up yet) —', err.message);
    return [];
  }
}

// Injects FAQPage structured data (schema.org) once the manifest is loaded,
// so search engines can potentially show these Q&As directly in results.
// Uses each article's excerpt as the "answer" — keep excerpts genuinely
// answer-shaped (a sentence or two that actually addresses the title) rather
// than a generic teaser, or this won't qualify for rich results anyway.
function injectFaqStructuredData(faqArticles) {
  if (faqArticles.length === 0) return;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqArticles.map(article => ({
      '@type': 'Question',
      name: article.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: article.excerpt || article.title
      }
    }))
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'faq-structured-data';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function renderFaqList(articles) {
  const list = document.getElementById('faq-list');
  list.innerHTML = articles.map(article => {
    // Precomputed lowercase blob of everything searchable, so filtering on
    // every keystroke is just a substring check — no re-joining per search.
    const searchBlob = [article.title, article.excerpt, ...(article.keywords || [])]
      .filter(Boolean).join(' ').toLowerCase();

    return `
      <div class="faq-card reveal" role="button" tabindex="0" data-faq-id="${article.id}" data-search-blob="${searchBlob.replace(/"/g, '&quot;')}">
        <div class="faq-card-title">${article.title}</div>
        ${article.excerpt ? `<div class="faq-card-excerpt">${article.excerpt}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Client-side keyword filter over title + excerpt + manifest "keywords" —
// no extra network requests needed, so it filters instantly as you type.
function filterFaqList(query) {
  const trimmed = query.trim().toLowerCase();
  const cards = document.querySelectorAll('#faq-list .faq-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const matches = trimmed === '' || card.dataset.searchBlob.includes(trimmed);
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  const noResults = document.getElementById('faq-no-results');
  noResults.hidden = !(trimmed !== '' && visibleCount === 0);
  document.getElementById('faq-no-results-query').textContent = query.trim();
}

function initFaqSearch() {
  document.getElementById('faq-search-input').addEventListener('input', (event) => {
    filterFaqList(event.target.value);
  });
}

function showFaqListPane() {
  document.getElementById('faq-list-view').hidden = false;
  document.getElementById('faq-article-view').hidden = true;
}

function showFaqArticlePane() {
  document.getElementById('faq-list-view').hidden = true;
  document.getElementById('faq-article-view').hidden = false;
}

async function openFaqArticle(articles, id) {
  const article = articles.find(a => a.id === id);
  if (!article) {
    showFaqListPane();
    return;
  }

  document.getElementById('faq-article-title').textContent = article.title;
  const contentEl = document.getElementById('faq-article-content');
  contentEl.innerHTML = '<p>Loading…</p>';
  showFaqArticlePane();

  try {
    const markdown = await loadText(`faq/${article.file}`, 'default');
    contentEl.innerHTML = (typeof marked !== 'undefined')
      ? marked.parse(markdown)
      : `<pre>${escapeHtml(markdown)}</pre>`; // marked failed to load (e.g. CDN blocked) — show raw text rather than nothing
    enhanceMarkdownAlerts(contentEl);
  } catch (err) {
    console.error(`Failed to load FAQ article "${id}":`, err);
    contentEl.innerHTML = '<p>This article could not be loaded right now. Please try again later.</p>';
  }
}

function initFaqNavigation(profiles, faqArticles) {
  const list = document.getElementById('faq-list');

  list.addEventListener('click', (event) => {
    const card = event.target.closest('.faq-card');
    if (card) goToFaq(profiles, faqArticles, card.dataset.faqId, 'push');
  });

  list.addEventListener('keydown', (event) => {
    const card = event.target.closest('.faq-card');
    if (!card) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToFaq(profiles, faqArticles, card.dataset.faqId, 'push');
    }
  });

  document.getElementById('faq-back-link').addEventListener('click', (event) => {
    event.preventDefault();
    backToFaqList('push');
  });

  // Article content can contain links to other articles (e.g.
  // "?faq=troubleshooting") — intercept those instead of a full page reload.
  document.getElementById('faq-article-content').addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="?faq="]');
    if (!link) return;
    event.preventDefault();
    const targetId = new URLSearchParams(link.getAttribute('href').slice(1)).get('faq');
    goToFaq(profiles, faqArticles, targetId, 'push');
  });

  ['hub-nav-faq', 'detail-nav-faq'].forEach(id => {
    document.getElementById(id).addEventListener('click', (event) => {
      event.preventDefault();
      goToFaq(profiles, faqArticles, null, 'push');
    });
  });

  initFaqSearch();
}


let currentSwitchToken = 0; // guards against a slow/stale fetch overwriting a newer render

// Accepts either the new { profiles: [...] } shape or a legacy single-profile
// data.json (everything at the top level, no "profiles" array) for backward
// compatibility with sites that haven't migrated yet.
function normalizeProfiles(data) {
  if (Array.isArray(data.profiles) && data.profiles.length > 0) {
    return { profiles: data.profiles, defaultProfileId: data.defaultProfileId, hub: data.hub };
  }
  const fallbackProfile = { id: 'default', label: (data.rom && data.rom.name) || 'ROM', ...data };
  return { profiles: [fallbackProfile], defaultProfileId: 'default', hub: data.hub };
}

function getProfileById(profiles, id) {
  return profiles.find(profile => profile.id === id);
}

// Computes the homepage stats row purely from the profiles array — no
// manual counts to keep in sync in data.json.
function computeHubStats(profiles) {
  const romCount = profiles.length;

  const deviceNames = new Set(
    profiles.map(p => (p.device && p.device.name) || '').filter(Boolean)
  );

  const androidNumbers = profiles
    .map(p => p.latestRelease && p.latestRelease.androidBase)
    .filter(Boolean)
    .map(base => parseInt(String(base).replace(/[^\d]/g, ''), 10))
    .filter(n => !Number.isNaN(n));
  const latestAndroid = androidNumbers.length > 0 ? Math.max(...androidNumbers) : null;

  const otaSupported = profiles.some(p => p.remote && p.remote.releaseJsonUrl);

  return [
    { value: String(romCount), label: romCount === 1 ? 'Supported ROM' : 'Supported ROMs', icon: 'download' },
    { value: String(deviceNames.size), label: deviceNames.size === 1 ? 'Supported Device' : 'Supported Devices', icon: 'shield' },
    { value: latestAndroid ? `Android ${latestAndroid}` : '—', label: 'Latest Base', icon: 'android' },
    { value: otaSupported ? 'Supported' : 'Manual', label: 'OTA Updates', icon: 'tip' }
  ];
}

// Eases a stat number up from 0 to its target value. Purely cosmetic, so it
// respects prefers-reduced-motion (jumps straight to the final value there).
function animateCountUp(el, target, duration = 900) {
  const prefersReducedMotion = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    el.textContent = String(target);
    return;
  }

  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic — quick start, gentle settle
    el.textContent = String(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderHubStats(profiles) {
  const container = document.getElementById('hub-stats');
  const stats = computeHubStats(profiles);

  container.innerHTML = stats.map(stat => `
    <div class="hub-stat-card reveal">
      <div class="hub-stat-icon">${iconMarkup(stat.icon)}</div>
      <div class="hub-stat-value">${stat.value}</div>
      <div class="hub-stat-label">${stat.label}</div>
    </div>
  `).join('');

  // Count up only the purely-numeric stats (ROMs/Devices) — text values like
  // "Android 16" or "Supported" just render as-is, counting up wouldn't make sense.
  container.querySelectorAll('.hub-stat-value').forEach((el, i) => {
    const target = Number(stats[i].value);
    if (Number.isFinite(target) && String(stats[i].value).trim() !== '') {
      animateCountUp(el, target);
    }
  });
}

// Sets an external link's href and hides it if the URL isn't configured —
// used for every GitHub/Telegram link across the header, drawer and hero.
function setExternalLink(elementId, url) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (url) {
    el.href = url;
    el.hidden = false;
  } else {
    el.hidden = true;
  }
}

function renderHubCardBody(profile) {
  const rom = profile.rom || {};
  const device = profile.device || {};
  const release = profile.latestRelease || {};
  const cardLogoSrc = withCacheBust(rom.logoImage || 'assets/img/logo.svg', profile.assetVersion);

  const statusConfig = STATUS_CONFIG[profile.status];
  const statusBadge = statusConfig
    ? `<span class="hub-card-status hub-card-status-${profile.status}">${statusConfig.badgeLabel}</span>`
    : '';

  const cardTags = Array.isArray(profile.tags)
    ? profile.tags
    : (profile.remote && profile.remote.releaseJsonUrl ? ['OTA'] : []); // fallback when 'tags' isn't set at all

  const badges = [
    profile.featured ? '<span class="hub-card-badge hub-card-badge-featured">Featured</span>' : '',
    release.codename ? `<span class="hub-card-badge hub-card-badge-build">${release.codename}</span>` : '',
    ...cardTags.map(tag => {
      const modifier = tag.trim().toUpperCase() === 'OTA' ? 'hub-card-badge-ota' : 'hub-card-badge-tag';
      return `<span class="hub-card-badge ${modifier}">${tag}</span>`;
    })
  ].filter(Boolean).join('');

  const updatedLabel = release.date ? `Updated ${formatRelativeDate(release.date)}` : '';

  return `
    <div class="hub-card-logo"><img src="${cardLogoSrc}" alt="" decoding="async" loading="lazy"></div>
    <div>
      <div class="hub-card-name">${rom.name || profile.label || profile.id}${statusBadge}</div>
      <div class="hub-card-device">${device.name || ''}${device.codename ? ` (${device.codename})` : ''}</div>
    </div>
    ${badges ? `<div class="hub-card-badges">${badges}</div>` : ''}
    <div class="hub-card-meta">
      ${release.version ? `<span>v${release.version}</span>` : ''}
      ${release.androidBase ? `<span>${release.androidBase}</span>` : ''}
      ${updatedLabel ? `<span>${updatedLabel}</span>` : ''}
    </div>
  `;
}

// Hub-grid tiles start out showing data.json's local fallback (version,
// date, etc). This fetches each profile's actual live release feed in the
// background and patches just that card in place once it arrives — without
// this, "Updated X ago" and the version shown on the grid could silently be
// months stale even though the profile's own page shows the current build.
async function refreshHubCardData(profile) {
  const remote = profile.remote || {};
  if (!remote.releaseJsonUrl) return;

  try {
    const releaseFeed = await loadJson(remote.releaseJsonUrl);
    const releaseMap = remote.releaseJsonMap || {};
    applyRemoteRelease(profile, extractReleaseEntry(releaseFeed, releaseMap), releaseMap);

    const card = document.querySelector(`.hub-card[data-profile-id="${profile.id}"]`);
    if (!card) return; // profile no longer on screen (e.g. grid re-rendered) — nothing to update

    card.innerHTML = renderHubCardBody(profile);
    fadeInOnLoad(card.querySelector('.hub-card-logo img'));
  } catch (err) {
    console.error(`Failed to refresh hub card data for "${profile.id}":`, err);
  }
}

function renderHub(profiles, hub = {}) {
  document.getElementById('hub-heading').textContent = hub.title || 'All builds';
  document.getElementById('hub-subheading').textContent = hub.subtitle || '';
  document.getElementById('nav-brand-title').textContent = hub.title || 'All builds';

  if (hub.logoImage) {
    const busted = withCacheBust(hub.logoImage, hub.assetVersion);
    [document.getElementById('nav-brand-logo'), document.getElementById('hub-hero-logo')].forEach(img => {
      img.src = busted;
      fadeInOnLoad(img);
    });
  }

  setExternalLink('hub-cta-github', hub.githubUrl);
  setExternalLink('hub-nav-github', hub.githubUrl);
  setExternalLink('hub-nav-telegram', hub.telegramUrl);
  setExternalLink('nav-drawer-github', hub.githubUrl);
  setExternalLink('nav-drawer-telegram', hub.telegramUrl);

  renderHubStats(profiles);

  const grid = document.getElementById('hub-grid');
  grid.innerHTML = profiles.map(profile => {
    const accentStyle = (profile.theme && profile.theme.primary)
      ? `--hub-card-accent: ${profile.theme.primary};${profile.theme.primaryContainer ? ` --hub-card-accent-container: ${profile.theme.primaryContainer};` : ''}`
      : '';
    const cardModifierClasses = [
      profile.status === 'discontinued' ? ' hub-card-discontinued' : '',
      profile.featured ? ' hub-card-featured' : ''
    ].join('');

    return `
      <div class="hub-card reveal${cardModifierClasses}" role="button" tabindex="0" data-profile-id="${profile.id}" style="${accentStyle}">
        ${renderHubCardBody(profile)}
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.hub-card-logo img').forEach(fadeInOnLoad);

  // Stats depend on latestRelease.androidBase/remote config too, so refresh
  // them once every card's live data has come back in (or failed/timed out).
  Promise.all(profiles.map(profile => refreshHubCardData(profile)))
    .then(() => renderHubStats(profiles));
}

// Shows exactly one of the three top-level sections, hiding the other two.
function showTopLevelView(view) {
  document.getElementById('hub-view').hidden = view !== 'hub';
  document.getElementById('detail-view').hidden = view !== 'detail';
  document.getElementById('faq-view').hidden = view !== 'faq';
}

function showHubView() {
  showTopLevelView('hub');
  document.getElementById('nav-back-link').hidden = true;
  document.getElementById('nav-links').hidden = true;
  document.getElementById('nav-cta').hidden = true;
  window.scrollTo(0, 0);
  renderFooter(null); // hub view has no single ROM to credit — show hub-level info instead
  initScrollReveal(); // must run AFTER unhiding: observing hidden (display:none) elements
                       // and waiting for them to become visible later is unreliable in some browsers
}

function showDetailView(hasHub) {
  showTopLevelView('detail');
  document.getElementById('nav-back-link').hidden = !hasHub;
  document.getElementById('nav-links').hidden = false;
  document.getElementById('nav-cta').hidden = false;
  window.scrollTo(0, 0);
  initScrollReveal(); // must run AFTER unhiding, same reasoning as above
}

// FAQ is reached from anywhere (hub, or any ROM's page) — the back-link
// always has somewhere to return to (the hub, or the single ROM in a
// single-profile site), so it's always shown here, unlike showDetailView's.
function showFaqTopLevelView() {
  showTopLevelView('faq');
  document.getElementById('nav-back-link').hidden = false;
  document.getElementById('nav-links').hidden = true;
  document.getElementById('nav-cta').hidden = true;
  window.scrollTo(0, 0);
  renderFooter(null);
  initScrollReveal();
}

// Fetches and overlays a profile's live release/changelog data, guarded by
// a token so a slow response from a profile the visitor has since navigated
// away from can't clobber a newer render.
async function loadRemoteDataForProfile(profile, token) {
  const remote = profile.remote || {};

  if (remote.releaseJsonUrl) {
    try {
      const releaseFeed = await loadJson(remote.releaseJsonUrl);
      if (token !== currentSwitchToken) return;
      const releaseMap = remote.releaseJsonMap || {};
      applyRemoteRelease(profile, extractReleaseEntry(releaseFeed, releaseMap), releaseMap);
    } catch (err) {
      console.error('Failed to load live release data, keeping local fallback:', err);
    }
  }

  if (token !== currentSwitchToken) return;

  if (remote.changelogUrl) {
    try {
      const changelogText = await loadText(remote.changelogUrl);
      if (token !== currentSwitchToken) return;
      applyRemoteChangelog(profile, parseChangelogText(changelogText, remote.changelogMap || {}));
    } catch (err) {
      console.error('Failed to load live changelog, keeping local fallback:', err);
    }
  }

  if (token !== currentSwitchToken) return;

  renderHero(profile);
  renderDevice(profile);
  renderRelease(profile);
  renderChangelog(profile);
  renderInstallIntro(profile);
  renderLinks(profile);
  initScrollReveal(); // newly injected changelog/link cards need their own reveal observers
}

// historyMode controls how the URL reflects the navigation: 'replace'
// (initial load), 'push' (the visitor clicked something, so back/forward
// can step through it), or 'none' (already handled, e.g. a popstate event).
// paramName/paramValue are ROUTING state ('rom'/<id> or 'faq'/<articleId or
// 'list'>) — only one of them is ever present in the URL at a time, and a
// null paramName means "neither" (the hub).
function updateUrlParam(paramName, paramValue, historyMode) {
  if (historyMode === 'none') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('rom');
  url.searchParams.delete('faq');
  if (paramName && paramValue) url.searchParams.set(paramName, paramValue);

  if (historyMode === 'push') {
    window.history.pushState(null, '', url);
  } else {
    window.history.replaceState(null, '', url);
  }
}

function goToHub(profiles, historyMode) {
  if (profiles.length <= 1) return; // nothing to go back to in single-profile mode
  currentSwitchToken++; // invalidate any in-flight fetch for the profile being left
  closeLightbox();
  updateUrlParam(null, null, historyMode);
  resetTheme();
  showHubView();
}

// "Home" for whichever mode the site is in: the hub grid if there's more
// than one profile, or the single profile's own page otherwise. Used by the
// global "back" link and nav-brand click, which need somewhere to go from
// FAQ even on a single-profile site (where goToHub is deliberately a no-op).
function goHome(profiles, historyMode) {
  if (profiles.length > 1) {
    goToHub(profiles, historyMode);
  } else {
    goToProfile(profiles, profiles[0].id, historyMode);
  }
}

async function goToProfile(profiles, id, historyMode) {
  const profile = getProfileById(profiles, id);
  if (!profile) return;

  const token = ++currentSwitchToken;
  const hasHub = profiles.length > 1;

  closeLightbox();
  updateUrlParam('rom', profile.id, historyMode);

  resetTheme();
  applyTheme(profile.theme);
  renderAll(profile);
  renderFooter(profile);
  showDetailView(hasHub);

  await loadRemoteDataForProfile(profile, token);
}

// Opens the FAQ section — either the article list (articleId is null/not
// found) or a specific article, straight from the hub, a ROM's page, or a
// direct link. FAQ isn't profile-themed, so it always uses the default palette.
function goToFaq(profiles, faqArticles, articleId, historyMode) {
  if (faqArticles.length === 0) return; // feature not configured — nothing to open

  currentSwitchToken++;
  closeLightbox();
  const resolvedId = faqArticles.some(a => a.id === articleId) ? articleId : null;
  updateUrlParam('faq', resolvedId || 'list', historyMode);

  resetTheme();
  showFaqTopLevelView();

  if (resolvedId) {
    openFaqArticle(faqArticles, resolvedId);
  } else {
    showFaqListPane();
  }
}

// Local navigation within the FAQ section (article -> list), without
// re-running the full top-level view switch since we're already there.
function backToFaqList(historyMode) {
  updateUrlParam('faq', 'list', historyMode);
  showFaqListPane();
}

// Reflects whatever the URL currently says (used for popstate — never
// pushes/replaces history itself, since the browser already navigated it).
function restoreFromUrl(profiles, faqArticles) {
  const params = new URLSearchParams(window.location.search);
  const romId = params.get('rom');
  const faqParam = params.get('faq');

  if (romId && getProfileById(profiles, romId)) {
    goToProfile(profiles, romId, 'none');
  } else if (faqParam !== null && faqArticles.length > 0) {
    const articleId = faqArticles.some(a => a.id === faqParam) ? faqParam : null;
    goToFaq(profiles, faqArticles, articleId, 'none');
  } else if (profiles.length > 1) {
    currentSwitchToken++;
    closeLightbox();
    resetTheme();
    showHubView();
  } else {
    goToProfile(profiles, profiles[0].id, 'none');
  }
}

function initHubNavigation(profiles, faqArticles) {
  document.getElementById('nav-brand-link').addEventListener('click', (event) => {
    event.preventDefault();
    goHome(profiles, 'push');
  });

  document.getElementById('nav-back-link').addEventListener('click', (event) => {
    event.preventDefault();
    goHome(profiles, 'push');
  });

  const grid = document.getElementById('hub-grid');
  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.hub-card');
    if (card) goToProfile(profiles, card.dataset.profileId, 'push');
  });
  grid.addEventListener('keydown', (event) => {
    const card = event.target.closest('.hub-card');
    if (!card) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToProfile(profiles, card.dataset.profileId, 'push');
    }
  });

  window.addEventListener('popstate', () => restoreFromUrl(profiles, faqArticles));

  // "Home" in the desktop hub nav is only ever shown while already on the
  // hub, so it just scrolls back to the top instead of navigating anywhere.
  document.getElementById('hub-nav-home').addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function scrollToRomsGrid() {
  const grid = document.getElementById('hub-grid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openNavDrawer() {
  document.getElementById('nav-drawer').classList.add('open');
  document.getElementById('nav-drawer').setAttribute('aria-hidden', 'false');
  document.getElementById('nav-menu-toggle').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeNavDrawer() {
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('nav-drawer').setAttribute('aria-hidden', 'true');
  document.getElementById('nav-menu-toggle').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Mobile hamburger + slide-in drawer. Shown on every view (unlike the
// desktop hub-only nav-links) since it's the only nav access on mobile.
function initNavDrawer(profiles, faqArticles) {
  const drawer = document.getElementById('nav-drawer');

  document.getElementById('nav-menu-toggle').addEventListener('click', () => {
    if (drawer.classList.contains('open')) closeNavDrawer();
    else openNavDrawer();
  });

  document.getElementById('nav-drawer-close').addEventListener('click', closeNavDrawer);
  document.getElementById('nav-drawer-backdrop').addEventListener('click', closeNavDrawer);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) closeNavDrawer();
  });

  document.getElementById('nav-drawer-panel').addEventListener('click', (event) => {
    const link = event.target.closest('[data-drawer-action]');
    if (!link) return;
    const action = link.dataset.drawerAction;

    if (action !== 'home' && action !== 'roms' && action !== 'faq') {
      closeNavDrawer(); // github/telegram are plain external links — just close and let them navigate
      return;
    }

    event.preventDefault();
    closeNavDrawer();
    const isHubVisible = !document.getElementById('hub-view').hidden;

    if (action === 'home') {
      if (isHubVisible) window.scrollTo({ top: 0, behavior: 'smooth' });
      else goHome(profiles, 'push');
    } else if (action === 'roms') {
      if (isHubVisible) {
        scrollToRomsGrid();
      } else {
        goToHub(profiles, 'push');
        setTimeout(scrollToRomsGrid, 60); // let the hub view render before scrolling to it
      }
    } else {
      goToFaq(profiles, faqArticles, null, 'push');
    }
  });
}

// Material-style ripple feedback on any .btn click, delegated so it works
// for buttons injected later (e.g. per-profile download/release buttons).
// Scatters a handful of small twinkling "star" dots into a scene background.
// Purely decorative — count stays modest and animation is opacity/scale only
// (GPU-cheap), and respects prefers-reduced-motion via the CSS rule already
// disabling .scene-star's animation there.
function initStarfield(containerId, count = 45) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.starsRendered) return; // static scene, only needs building once
  container.dataset.starsRendered = 'true';

  const stars = [];
  for (let i = 0; i < count; i++) {
    const size = 1 + Math.random() * 2; // 1-3px
    const style = [
      `left: ${(Math.random() * 100).toFixed(2)}%`,
      `top: ${(Math.random() * 100).toFixed(2)}%`,
      `width: ${size.toFixed(1)}px`,
      `height: ${size.toFixed(1)}px`,
      `animation-duration: ${(3 + Math.random() * 4).toFixed(1)}s`,
      `animation-delay: -${(Math.random() * 4).toFixed(1)}s` // negative delay staggers them so they don't all pulse in sync
    ].join('; ');
    stars.push(`<span class="scene-star" style="${style}"></span>`);
  }
  container.innerHTML = stars.join('');
}

function initButtonRipple() {
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// Shown if data.json fails to load or anything during setup throws — so a
// real problem is visible and diagnosable instead of leaving a silently
// blank page (which is indistinguishable from a CSS/caching issue).
function showFatalError(message) {
  const heading = document.getElementById('hub-heading');
  const subheading = document.getElementById('hub-subheading');
  const grid = document.getElementById('hub-grid');

  if (heading) heading.textContent = 'Something went wrong';
  if (subheading) subheading.textContent = '';
  if (grid) {
    grid.innerHTML = `
      <div class="install-callout install-callout-warning" style="grid-column: 1 / -1;">
        <span class="install-callout-icon">${iconMarkup('warning')}</span>
        <span>This page failed to load: ${message}. Open the browser console (F12 → Console) for the full error, and double-check data.json is valid JSON.</span>
      </div>
    `;
  }

  const hubView = document.getElementById('hub-view');
  const detailView = document.getElementById('detail-view');
  if (hubView) hubView.hidden = false;
  if (detailView) detailView.hidden = true;
}

async function init() {
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  let rawData;
  try {
    rawData = await loadJson('data.json', 'default');
  } catch (err) {
    console.error('Failed to load data.json:', err);
    showFatalError('could not load data.json');
    return;
  }

  // Never throws — resolves to [] if there's no faq/ folder or manifest,
  // in which case every FAQ nav entry just stays hidden below.
  const faqArticles = await loadFaqManifest();
  injectFaqStructuredData(faqArticles);

  try {
    const { profiles: rawProfiles, defaultProfileId, hub } = normalizeProfiles(rawData);

    // Sort order: featured profile(s) first, then defaultProfileId (just
    // controls grid order, not routing — the hub is always the landing page
    // unless ?rom= is set), then whatever order they're listed in.
    const profiles = [...rawProfiles].sort((a, b) => {
      const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (featuredDiff !== 0) return featuredDiff;
      if (defaultProfileId) {
        if (a.id === defaultProfileId) return -1;
        if (b.id === defaultProfileId) return 1;
      }
      return 0;
    });

    const faqNavHidden = faqArticles.length === 0;
    ['hub-nav-faq', 'detail-nav-faq', 'nav-drawer-faq'].forEach(id => {
      document.getElementById(id).hidden = faqNavHidden;
    });

    currentHub = hub;
    renderHub(profiles, hub);
    renderFaqList(faqArticles);
    initHubNavigation(profiles, faqArticles);
    initNavDrawer(profiles, faqArticles);
    initFaqNavigation(profiles, faqArticles);
    initButtonRipple();
    initStarfield('hub-hero-stars');
    initStarfield('hero-stars');
    initHeaderScrollState();
    initCodeCopyButtons();
    initLightbox();
    initDonateModal();
    initFoxGame();

    const params = new URLSearchParams(window.location.search);
    const romIdFromUrl = params.get('rom');
    const faqParamFromUrl = params.get('faq');

    if (romIdFromUrl && getProfileById(profiles, romIdFromUrl)) {
      await goToProfile(profiles, romIdFromUrl, 'replace');
    } else if (faqParamFromUrl !== null && faqArticles.length > 0) {
      const articleId = faqArticles.some(a => a.id === faqParamFromUrl) ? faqParamFromUrl : null;
      goToFaq(profiles, faqArticles, articleId, 'replace');
    } else if (profiles.length <= 1) {
      // Single-profile site: skip the hub entirely, go straight to the page.
      await goToProfile(profiles, profiles[0].id, 'none');
    } else {
      showHubView();
    }
  } catch (err) {
    console.error('Failed to render the page:', err);
    showFatalError(err && err.message ? err.message : String(err));
  }
}

document.addEventListener('DOMContentLoaded', init);

// Registered after 'load' so it never competes with this page's own
// first-visit requests for bandwidth — it only helps from the next visit on.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.error('Service worker registration failed (site still works fine without it):', err);
    });
  });
}
