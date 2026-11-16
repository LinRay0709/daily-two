# Daily job: publish today's two phrases

This repository is a public GitHub Pages site. `index.html` is a fixed player that plays one day's lesson as a nine-scene, Stories-style reel on an iPhone. Your job each day is to add one data file for today and point the site at it. Never edit `index.html`, `scripts/`, or `widget/` as part of the daily job.

## The reader

One person: a native Mandarin speaker (Traditional Chinese, Taiwan) with advanced English (TOEIC 900+). They read news comfortably. What they lack is the idioms, slang, phrasal verbs and collocations that native speakers actually use in business, tech and everyday talk. They remember things through vivid, concrete, slightly funny mental images, and the whole lesson must take under two minutes.

## Steps

1. Work out today's date in Asia/Taipei (`TZ=Asia/Taipei date +%F`). Call it DATE. If `days/DATE.json` already exists and `latest.json` points at it, stop: today is done.
2. Read `history.json`. Do not reuse any term in it. Look at the last few topics and alternate between the two topics below so neither runs more than two days in a row.
3. Search the web for a real news story from the last three days in one of the topics:
   - `科技與 AI`: AI models and companies, chips, consumer tech, big-tech moves.
   - `醫療與生技新創`: medical devices, digital health, biotech startups, funding rounds, FDA decisions.
   Pick a story with a concrete, picturable situation. Open the article itself (not only a search snippet) and confirm every fact you will state: names, numbers, dates. If you cannot confirm a detail, leave it out. If nothing from the last three days is solid, use the most recent story you can verify. Never invent news.
4. Choose two target items that fit this story naturally. Each must be an idiom, slang expression, phrasal verb or collocation that an educated native speaker uses and an advanced learner probably does not produce. No textbook vocabulary (nothing like "ubiquitous" or "mitigate"), nothing archaic, nothing offensive. The two items should feel different from each other.
5. Write `days/DATE.json` following the schema below.
6. Set `latest.json` to `{"date":"DATE"}` and append `{"date","topic","terms"}` for today to `history.json`.
7. Run `node scripts/validate.mjs DATE`. Fix every reported problem and run it again until it prints `OK`.
8. Commit only `days/DATE.json`, `latest.json` and `history.json` with the message `Add DATE` and push to `main`. If the push fails, report the error; do not force-push.

## Schema of `days/DATE.json`

```
{
 "date": "2026-11-16",
 "topic": "科技與 AI",                 one of the two topic names above, exactly
 "title": "...",                       English headline, at most 70 characters, ideally using target item 1
 "hook": "...",                        Traditional Chinese, one sentence, shown under illustration 1 before any word is taught; it sets up the mental image
 "bridge": "...",                      Traditional Chinese, one sentence, shown under illustration 2; it sets up the second image
 "src": {"name": "Outlet name", "url": "https://..."},   the article you verified against
 "p": ["... {0}.", "... {1} ..."],     exactly two English paragraphs, 70 to 135 words in total
 "inText": ["...", "..."],             the text that replaces {0} and {1}: the target item inflected to fit the sentence
 "words": [ {word}, {word} ],
 "css": "...",                         keyframes and rules for today's two illustrations (may be empty)
 "quiz": [ {question}, {question} ]
}
```

Paragraph 1 contains `{0}` once and paragraph 2 contains `{1}` once. Write the paragraphs yourself in plain, natural news English. Do not copy sentences from the source; paraphrase and keep it short. Attribute claims to who made them.

Each word:

```
{
 "term": "eat someone's lunch",        dictionary form
 "ipa": "/iːt ˈsʌmwʌnz lʌntʃ/",        General American, wrapped in slashes
 "pos": "idiom · informal · business", part of speech and register, in English
 "zh": "搶走對手的生意、市佔",           Traditional Chinese meaning, at most 24 characters
 "def": "to take business or market share away from a competitor",   plain English definition
 "mn": "...",                          the mnemonic, Traditional Chinese, 15 to 110 characters
 "ex": "...",                          one new example sentence, a different context from the news
 "exZh": "...",                        its Traditional Chinese translation
 "ill": "<svg ...>...</svg>"           the illustration (rules below)
}
```

The mnemonic is the heart of the lesson. It must be one concrete scene the reader can see, built from this news story, that makes the literal words of the phrase lead to its meaning. End with a short clause that states the link. Good: "午休時間，Google 打開便當，發現 ChatGPT 已經坐在旁邊夾走了五格裡的一格。便當被吃掉，就是生意被搶走。" Bad: an abstract explanation, an etymology lecture, or a scene unrelated to the story. The illustration must draw the same scene as the mnemonic.

Each quiz question:

```
{
 "q": "... ___ ...",                   an English sentence in a new context with one ___ blank
 "opts": ["...", "...", "..."],        the right answer plus two real expressions that look plausible but mean something else
 "a": 0,                               index of the right answer; the two questions must use different indexes
 "why": "..."                          Traditional Chinese, one or two sentences: why it is right and what each distractor really means
}
```

Question 1 tests word 1 and question 2 tests word 2. Inflect the options so all three fit the blank grammatically.

## Illustration rules

Open a previous day file and study its `ill` and `css` before drawing.

- Start exactly with `<svg viewBox="0 0 320 190" class="ill" role="img" aria-label="(Traditional Chinese description)">` and end with `</svg>`.
- Simple flat shapes: `rect`, `circle`, `ellipse`, `line`, short `path`, `text`. Stroke width 2 to 2.5. Keep it under 6000 characters.
- Colors only through these CSS variables, never literal colors: `var(--ink)` outlines and text, `var(--card)` light fills, `var(--bento)` secondary fills, `var(--hl)` the yellow highlight for the one thing the eye should land on, `var(--line)` faint lines, `var(--mute)` secondary strokes. The page has light and dark themes and the variables handle both.
- Text inside the SVG uses `class="svgl"` (bold label) or `class="hand"` (handwriting). Keep SVG text short and English or numerals.
- No `<script>`, `<style>`, `<image>`, `<use>`, `<foreignObject>`, no `href`, no event attributes.
- Animate with classes whose rules live in the day's `css` field. Name today's classes and keyframes with a per-day prefix (for example `d1116-`) so they never collide. Animations loop with `infinite` over 3 to 4 seconds and show the action of the mnemonic (the thing being taken, flipped, spilled, and so on). For transforms on SVG shapes set `transform-box:fill-box` and a `transform-origin`. Animate only `transform` and `opacity`.
- The drawing must still make sense as a still image, because animations are switched off for readers who prefer reduced motion. If the resting frame would hide the point, add a `@media (prefers-reduced-motion:reduce)` rule in `css` that sets a meaningful still state.
- `css` contains only rules for today's classes: no `@import`, no `url()`, no literal colors, no `position:fixed`.

## Quality bar before you commit

- Every fact in the paragraphs is in the source article you opened.
- A reader finishes all nine scenes in under two minutes.
- Each mnemonic is a picture, tied to the story, and the illustration shows that picture.
- The validator prints `OK`.
