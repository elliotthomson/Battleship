# ⚔️ Naval War: Rome vs Greece

A themed Battleship game pitting the Roman fleet against the Greek navy. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

**[Play Live on GitHub Pages →](https://elliotthomson.github.io/Battleship/)**

## 🎮 Features

- **Manual Ship Placement** — place your Roman fleet with hover preview, orientation toggle, and validation
- **🎲 Random Placement** — one-click auto-place for quick games
- **4 Difficulty Modes** — Easy, Medium, Hard, Expert with increasingly smart AI
- **Bow-and-Arrow Animation** — SVG arrow with arrowhead, shaft, and fletching flies across the battle lane
- **Themed UI** — Roman crimson/gold vs Greek blue/marble styling with Cinzel & Philosopher fonts
- **Responsive** — works on desktop and mobile

## 🏛️ Roman Fleet

- **Quinquereme** (5 cells)
- **Roman Trireme** (4 cells)
- **Greek Trireme** (3 cells)
- **Bireme** (3 cells)
- **Scout Galley** (2 cells)

## 🤖 AI Difficulty Levels

- **Easy** — Pure random targeting
- **Medium** — Random + tries adjacent cells after a hit
- **Hard** — Hunt/Target mode with depth-first adjacent targeting
- **Expert** — Hunt/Target + checkerboard parity scanning

## 📁 File Structure

```
Battleship/
├── index.html      # Game interface (setup + battle screens)
├── style.css       # All styling, animations, responsive design
├── script.js       # Game engine, AI, arrow animation
├── 404.html        # Themed 404 page for GitHub Pages
├── .nojekyll       # Bypass Jekyll processing on GitHub Pages
└── README.md
```

## 🚀 Deploy to GitHub Pages

1. Go to your repo **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** branch and **/ (root)** folder
4. Click **Save**
5. Your site will be live at `https://elliotthomson.github.io/Battleship/`

## 🖥️ Run Locally

Just open `index.html` in a browser — no build step or server required.

## 🔧 Browser Support

Chrome, Firefox, Safari, Edge, and mobile browsers.
