# ⚔ AniManga List 2025–26 — Personal Archive

> *"Perceive that which cannot be seen with the eye."* — Miyamoto Musashi, 五輪書

A beautifully crafted personal archive for tracking **Anime**, **Manga**, and **Manhwa** — built with pure HTML, CSS, and Vanilla JavaScript. No frameworks. No build tools. Just craft.

---

## 🌐 Live Demo

🔗 **[View Live Site → ](https://YOUR-USERNAME.github.io/animanga-archive/)**

> Replace with your actual GitHub Pages URL after deployment.

---

## 📸 Preview

| Night Dojo Mode | Dawn Mode |
|---|---|
| Dark samurai aesthetic with crimson & gold | Warm parchment light theme |

---

## ✨ Features

### 🗂 Archive
- **100+ Anime** entries — from Akira (1988) to Dandadan (2024)
- **100+ Manga** entries — Berserk, Vagabond, Chainsaw Man and beyond
- **35+ Manhwa** entries — Solo Leveling, Tower of God, Sweet Home and more
- Every entry links directly to **MyAnimeList**, **AnimePahe**, and **Comick.io**

### 🔍 Search & Filter
- Real-time search by title, description, or genre tag
- Filter buttons per section (Action, Psychological, Romance, Sci-Fi, etc.)
- Sort by rating, year, or title (A–Z / Z–A)
- Grid view ↔ List view toggle

### ⭐ Personal Tracking
- **Favorites** — heart any entry, stored in LocalStorage forever
- **Progress tracker** — mark each series as Want / Watching / Done / Dropped
- **Export** — copy your entire favorites list as formatted text
- **Daily Picks** — a fresh anime + manga recommendation every day
- **Random Pick** — let the archive choose for you

### 🎨 Aesthetic (Night Dojo Theme)
- Dark mode built around samurai philosophy — every pixel bleeds ink
- Crimson `#cc1433` and Gold `#c8a032` color palette
- **Dawn / Night toggle** — switch between dark night and warm parchment day mode
- Typography: `Cinzel Decorative` · `Cormorant Garamond` · `Noto Serif JP` · `JetBrains Mono`

### 🌌 Visual Effects
- **Three.js 3D katana** — floating, rotating, mouse-reactive
- **Kanji fog** — Japanese characters drift through the background
- **Golden rain** overlay (night mode only)
- **Ember particles** — glowing embers drift upward
- **Click particles** — crimson sparks on every click
- **Card 3D tilt** — perspective tilt on hover with shimmer pass
- **Ink-blot loader** — cinematic opening sequence on every load
- **Scroll progress bar** — with a glowing ⚔ sword indicator

### ⌨ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `1` | Jump to Anime section |
| `2` | Jump to Manga section |
| `3` | Jump to Manhwa section |
| `←` / `→` | Cycle Musashi quotes |
| `D` | Toggle Dawn / Night Dojo mode |
| `F` | Open Favorites panel |
| `M` | Toggle sound effects |
| `Esc` | Close any open modal |
| `?` | Toggle keyboard guide |

---

## 📁 Project Structure

```
animanga-archive/
│
├── index.html          # Main archive page
├── Brief_Intro.html    # Intro/presentation slideshow (9 slides)
├── README.md           # This file
│
├── css/
│   └── style.css       # All styles — Night Dojo + Dawn themes
│
└── js/
    ├── app.js          # All logic — rendering, search, filters, sound, effects
    └── data.js         # Database — all anime, manga, manhwa entries + Musashi quotes
```

---

## 🛠 Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Structure and semantic markup |
| CSS3 Custom Properties | Theming, animations, responsive layout |
| Vanilla JavaScript | All interactivity and logic |
| Three.js r128 | 3D katana scene and particle system |
| Canvas API | Rain, ember particles, kanji fog |
| Web Audio API | Sound effects (clicks, sword swings, heart chimes) |
| Intersection Observer | Scroll-triggered reveal animations |
| LocalStorage | Favorites, progress tracking, theme persistence |
| CSS Scroll Snap | Smooth section navigation in Brief Intro |
| Google Fonts | Cinzel Decorative, Cormorant Garamond, JetBrains Mono, Noto Serif JP |

**Zero frameworks. Zero build tools. Zero dependencies beyond Three.js.**

---

## 🚀 Running Locally

No installation needed. Just open the folder:

1. Download or clone this repository
2. Open `index.html` in any modern browser
3. That's it — no server, no npm, no setup

```bash
# Or if you have VS Code with Live Server:
# Right-click index.html → Open with Live Server
```

---

## ➕ Adding Your Own Entries

1. Open `js/data.js`
2. Add a new object to `animeDB`, `mangaDB`, or `manhwaDB`:

```javascript
{
  title: "YOUR TITLE",
  jp: "日本語タイトル",
  rating: 5,               // 1–5 stars
  desc: "Short description.",
  tags: ["action", "psychological"],
  malId: "12345",          // MyAnimeList ID (used for the MAL link)
  year: "2024",
  episodes: "24 eps",
  status: "finished"       // "finished" or "airing"
}
```

3. Save and refresh — it appears instantly.

Alternatively, use the **Add Entry** form on the live site (bottom of the page) — entries are saved to LocalStorage permanently.

---

## 🎌 About

Built by **Gaurav** — BCA Student from Assam, India.

This is my personal viewing log for 2025–26. Every entry here is something I actually watched or read — curated by hand, not generated. No filler. No algorithms. Just my journey through anime, manga, and manhwa.

> *"Think lightly of yourself and deeply of the world."*
> — Miyamoto Musashi, 独行道

📧 [saikiag459@gmail.com](mailto:saikiag459@gmail.com)

---

## 📜 License

Personal project — free to use as inspiration or reference.
Please don't republish as your own.

---

<div align="center">

⚔ **ガウラブ** ⚔

*Built with obsession, craft, and Musashi's discipline.*

</div>
