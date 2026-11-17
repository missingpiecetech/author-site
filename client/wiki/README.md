# Crownfall Wiki

A Coppermind-style fan encyclopedia for *Crownfall* by Michael Vadney: 82 articles on characters, magic, the world and the story, with chapter-gated spoiler protection. Styled to match michaelvadney.com.

This is the **source** for the wiki. It is linked from the main site as "The Codex" and ships as
a static page at `/wiki/`. The build writes the one self-contained HTML file to
`client/public/wiki/index.html` (a committed artifact Vite copies into `dist/wiki/`), so
Cloudflare serves it directly, ahead of the SPA's `/* /index.html 200` rewrite. The `client/wiki/`
source folder itself is not shipped (Vite only copies `public/`).

## Files

| File | What it is |
|---|---|
| `articles.json` | All article content. Edit this to change the wiki. |
| `did-you-know.json` | The "Did you know…" facts on the main page (HTML strings). |
| `template.html` | Page shell: CSS, layout and all JavaScript. `__DATA__` and `__DYK__` are replaced at build time. |
| `build.py` | Regenerates `client/public/wiki/index.html` from the three files above and warns about broken links. Run `npm run build:wiki` from `client/` (or `python3 wiki/build.py`), then commit the rebuilt artifact. |

## Article schema (`articles.json`)

```json
{
  "id": "kyndel-heim",            // URL hash: index.html#kyndel-heim
  "title": "Kyndel Heim",
  "cat": "Characters",            // Characters | Magic | World | Story
  "sub": "Point-of-view characters", // group heading on the category page
  "blurb": "One spoiler-free sentence.",
  "quote": {"text": "...", "who": "Kyndel", "ch": 1},  // epigraph, or null
  "infobox": {"rows": [["Label", "html"], ...]},     // or null
  "lead": "<p>...</p>",
  "sections": [{"h": "Heading", "html": "<p>...</p>"}],
  "firstCh": 1,                   // chapter where the subject is first named
  "subSafe": {"ch": 33, "alt": "Artifacts and devices"}  // optional neutral group name before chapter `ch`
}
```

Markup used inside the HTML strings:

- Link to another article: `<a data-to="ARTICLE-ID">text</a>` (unknown ids render as plain text)
- Chapter citation: `<cite>12</cite>` or `<cite>4, 9</cite>` (links to the chapter guide)
- Inline spoiler: `<span class="sp" data-ch="23">...</span>`
- Block spoiler: `<div class="sp" data-ch="23"><p>...</p></div>`
- Gated glossary term: `<li data-ch="44">...</li>`
- `data-ch` is the chapter that reveals the content. Spoilers are never nested.

## Spoiler rules

- Content from chapters 1-3 (the premise) is shown freely; everything later is wrapped in a spoiler tagged with its chapter.
- Articles whose `firstCh` is after the reader's chosen chapter are hidden from category lists, search and "Random article", and show a cover page if opened directly.
- The reader's progress ("I've read through") is kept in `localStorage` under `cf-readto`.

## Writing style

Encyclopedic, neutral, past tense for events. No em dashes, no "not X, but Y" constructions, minimal quotation from the novel (paraphrase instead). Names match the manuscript spelling.

## Ideas not yet built

Pronunciation guide, map of Burunt, family trees, cover art, "Word of Michael" author answers, hover previews, and moving the wiki to separate pages under /wiki on the author site for search engines.
