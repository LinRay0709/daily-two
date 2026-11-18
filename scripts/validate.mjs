// Usage: node scripts/validate.mjs 2026-11-16
// Checks one day file against the rules in DAILY.md. Exits 1 with a list of problems.
import fs from 'node:fs';
const date = process.argv[2];
const errs = [];
const bad = m => errs.push(m);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) { console.error('Pass a date like 2026-11-16'); process.exit(1); }
let d;
try { d = JSON.parse(fs.readFileSync(`days/${date}.json`, 'utf8')); } catch (e) { console.error('Cannot read days/' + date + '.json: ' + e.message); process.exit(1); }
const str = (v, name, min = 1, max = 1e4) => { if (typeof v !== 'string' || v.trim().length < min) bad(`${name} is missing`); else if (v.length > max) bad(`${name} is longer than ${max} characters`); };
const hasZh = s => /[一-鿿]/.test(s || '');

if (d.date !== date) bad('date field does not match the file name');
str(d.topic, 'topic', 1, 20); str(d.title, 'title', 5, 70);
str(d.hook, 'hook', 5, 60); str(d.bridge, 'bridge', 5, 70);
if (!hasZh(d.hook) || !hasZh(d.bridge)) bad('hook and bridge must be Traditional Chinese');
if (!d.src || !/^https:\/\//.test(d.src.url || '')) bad('src.url must be an https link'); else str(d.src.name, 'src.name', 1, 60);

if (!Array.isArray(d.p) || d.p.length !== 2) bad('p must have exactly 2 paragraphs');
else {
  d.p.forEach((t, i) => { const m = (t.match(/\{\d\}/g) || []); if (m.length !== 1 || m[0] !== `{${i}}`) bad(`paragraph ${i + 1} must contain exactly one placeholder {${i}}`); });
  const words = d.p.join(' ').split(/\s+/).length;
  if (words < 70 || words > 135) bad(`the two paragraphs total ${words} words; keep them between 70 and 135`);
}
if (!Array.isArray(d.inText) || d.inText.length !== 2 || d.inText.some(t => typeof t !== 'string' || !t.trim())) bad('inText must have 2 strings');

if (!Array.isArray(d.words) || d.words.length !== 2) bad('words must have exactly 2 entries');
else d.words.forEach((w, i) => {
  const n = `words[${i}]`;
  str(w.term, n + '.term', 2, 40); str(w.ipa, n + '.ipa', 3, 60); str(w.pos, n + '.pos', 2, 50);
  str(w.zh, n + '.zh', 1, 24); str(w.def, n + '.def', 5, 110); str(w.mn, n + '.mn', 15, 110);
  str(w.ex, n + '.ex', 10, 120); str(w.exZh, n + '.exZh', 4, 70); str(w.ill, n + '.ill', 50, 6000);
  if (!hasZh(w.zh) || !hasZh(w.mn) || !hasZh(w.exZh)) bad(n + ': zh, mn and exZh must be Traditional Chinese');
  if (typeof w.ipa === 'string' && !/^\/.+\/$/.test(w.ipa)) bad(n + '.ipa must be wrapped in slashes');
  if (typeof w.term === 'string') {
    if (i === 0 && !/\s/.test(w.term.trim())) bad('words[0] must be a phrase of two or more words');
    if (i === 1 && /\s/.test(w.term.trim())) bad('words[1] must be a single word (no spaces)');
  }
  const s = w.ill || '';
  if (!/^<svg[^>]*viewBox="0 0 320 190"[^>]*class="ill"|^<svg[^>]*class="ill"[^>]*viewBox="0 0 320 190"/.test(s)) bad(n + '.ill must start with <svg viewBox="0 0 320 190" class="ill" ...>');
  if (!/role="img"/.test(s) || !/aria-label="/.test(s)) bad(n + '.ill needs role="img" and an aria-label');
  if (/<script|<foreignObject|<image|<use|<style|\son\w+\s*=|javascript:|href\s*=|url\(\s*['"]?https?:/i.test(s)) bad(n + '.ill contains a forbidden element or attribute');
  if (/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i.test(s)) bad(n + '.ill must use the CSS variables for color, not literal colors');
  if (!s.trim().endsWith('</svg>')) bad(n + '.ill must end with </svg>');
});

if (typeof d.css !== 'string') bad('css must be a string (may be empty)');
else {
  if (d.css.length > 3000) bad('css is longer than 3000 characters');
  if (/@import|url\(|<|expression\(|position\s*:\s*fixed/i.test(d.css)) bad('css contains a forbidden construct');
  if (/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i.test(d.css)) bad('css must not contain literal colors');
  if (/animation/.test(d.css) && !/infinite/.test(d.css)) bad('animations should loop (infinite) so they still play when the scene is revisited');
}

if (!Array.isArray(d.quiz) || d.quiz.length !== 2) bad('quiz must have exactly 2 questions');
else d.quiz.forEach((q, i) => {
  const n = `quiz[${i}]`;
  str(q.q, n + '.q', 15, 160); str(q.why, n + '.why', 10, 130);
  if (typeof q.q === 'string' && !q.q.includes('___')) bad(n + '.q must contain a ___ blank');
  if (!Array.isArray(q.opts) || q.opts.length !== 3 || new Set(q.opts).size !== 3) bad(n + '.opts must be 3 different strings');
  if (!Number.isInteger(q.a) || q.a < 0 || q.a > 2) bad(n + '.a must be 0, 1 or 2');
});
if (Array.isArray(d.quiz) && d.quiz.length === 2 && d.quiz[0].a === d.quiz[1].a) bad('put the two correct answers at different positions');

let hist = [];
try { hist = JSON.parse(fs.readFileSync('history.json', 'utf8')); } catch (e) { bad('history.json is unreadable'); }
const norm = s => String(s).toLowerCase().replace(/[^a-z ]/g, '').trim();
const used = new Set(hist.filter(h => h.date !== date).flatMap(h => h.terms.map(norm)));
(d.words || []).forEach(w => { if (used.has(norm(w.term))) bad(`"${w.term}" was already taught on an earlier day`); });
const mine = hist.find(h => h.date === date);
if (!mine) bad('history.json has no entry for ' + date);
else if (JSON.stringify(mine.terms) !== JSON.stringify((d.words || []).map(w => w.term))) bad('history.json terms for this date do not match the day file');
try { const l = JSON.parse(fs.readFileSync('latest.json', 'utf8')); if (l.date !== date) bad('latest.json does not point at ' + date); } catch (e) { bad('latest.json is unreadable'); }

if (errs.length) { console.error('FAILED\n- ' + errs.join('\n- ')); process.exit(1); }
console.log('OK ' + date);
