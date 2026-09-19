# Sheepy World: A Cheeky Tale

**A cozy pixel-art exploration game originally created as a one-year anniversary gift for my girlfriend.**

Built around memory, exploration, environmental storytelling, and small playful interactions, **Sheepy World** grew from a personal gift into a complete game with multiple connected regions, memory restoration, dialogue, cats, controller support, original music and sound design, and a post-game **Together Mode**.

> **This repository is a privacy-safe public portfolio edition.** Personal photographs, videos, private messages, identifying details, and selected relationship-specific content from the original anniversary version have been removed, generalized, or replaced with fictional placeholders.

### Play the game

**[⬇ Download for Windows](https://github.com/goncaloterroso25-create/Sheepy-World/releases/download/SheepyWorldV1/Sheepy-World-Public-Setup.exe)**

[View the release](https://github.com/goncaloterroso25-create/Sheepy-World/releases/tag/SheepyWorldV1) · [Portfolio](https://goncaloterroso.com) · [Architecture](docs/ARCHITECTURE.md)

> The Windows build is currently unsigned, so Windows SmartScreen may display an **Unknown Publisher** warning. No Node.js, Rust, Git, or other development tools are required to play.

---

## Screenshots

All screenshots below come from the sanitized public edition.

| | |
| --- | --- |
| ![Title and menu](docs/screenshots/01-title.png) | ![Autumn Park](docs/screenshots/02-autumn-park.png) |
| ![Snow region](docs/screenshots/03-snow.png) | ![Porto region](docs/screenshots/04-porto.png) |
| ![Mentalist scene](docs/screenshots/05-mentalist.png) | ![Scrapbook UI](docs/screenshots/06-scrapbook.png) |
| ![Cat interaction](docs/screenshots/07-cats.png) | ![Together Mode](docs/screenshots/08-together.png) |

## Highlights

- 🌿 **A connected cozy world** spanning Autumn Park, River Town, Vila Meow, Snow, Porto, an old-world festival, a Mentalist-inspired case, and Final Park.
- 📖 **Memory restoration** built around exploration, clues, scrapbook fragments, and environmental storytelling rather than a traditional quest list.
- 💬 **Dialogue and choices** with repeatable interactions, character moments, and scene-specific events.
- 🐈 **Tobias, Teemi, and Chicho**, each with their own sprites, movement, interactions, and behaviors.
- 🫶 **Together Mode**, a post-game companion experience with hand-holding, synchronized movement, couch/TV moments, sleeping, playful interactions, and small idle details.
- 🎧 **Original music and bespoke sound design**, alongside carefully curated ambience and sound effects.
- 🎮 **Keyboard and controller support**, save persistence, fullscreen support, and a native Windows build through Tauri.

## Origin

The original **Sheepy World** was designed as a one-year anniversary game for my girlfriend. The protagonist is based on her, while I appear as another character in the world.

Shared memories and personal experiences shaped the game's tone and structure, but this public version deliberately separates the project from the parts of our relationship that should remain private.

That personal origin is still important to the project: it is why the game revolves around remembering, noticing small details, revisiting places, and turning everyday moments into meaningful interactions.

## Gameplay & Systems

### Memory restoration

Exploration gradually reveals clues and fragments that move memories through different stages until they are restored. The Scrapbook acts as the player's record of that progress and provides subtle guidance without turning the experience into a checklist.

The public edition keeps the full progression system while generalizing private dates, event names, and identifying details.

### Scrapbook & UI

The interface uses a tactile paper-and-ink visual language across the Scrapbook, Bag, HUD, dialogue, pause menu, and settings.

For this portfolio edition, the gallery uses four fictional illustrated memory cards so the media systems remain fully functional without exposing any private photographs.

### Dialogue

Dialogue supports character portraits, branching choices, one-off moments, repeatable interactions, and story events.

Ordinary humor and playful couple interactions remain intact. Private conversations, sensitive details, and the original anniversary letter were intentionally omitted or replaced with transparent public-edition notices.

### Together Mode

After completing the game, **Together Mode** adds a companion character and a set of paired interactions across the world.

It includes hand-holding, close movement, synchronized sprinting, couch and TV moments, sleeping, COF, idle affection, playful micro-events, and a **“Switch sides?” → BUMP** interaction.

The system itself is preserved in the public edition; only a small number of relationship-specific details were generalized for privacy.

### Cats

Tobias, Teemi, and Chicho keep their names and approved in-game designs.

They can roam, animate directionally, react to the player, and take part in region-specific interactions. No real reference photographs of the cats are included in this repository.

## 🎧 Sound Design & Original Music

Audio was a hands-on part of the game's creative direction.

**I composed and produced the original Sheepy World soundtrack**, and also created the bespoke sound design for several key interactions, including:

- Scrapbook sounds
- Bag / inventory sounds
- Door sounds
- Additional UI and interaction feedback

For the remaining sound effects and environmental ambience used by the original game, I handled the **curation, selection, integration, and overall audio direction** so that the sound palette matched each scene and interaction.

That distinction is intentional: I did not personally record or compose every ambience or remaining SFX, but I was responsible for choosing how that wider audio palette fit the game.

The public repository distributes only the approved original instrumental theme. Some audio from the private anniversary version is intentionally excluded for privacy and source-asset reasons.

## Public Portfolio Edition

This GitHub version is intentionally different from the original private anniversary release.

For privacy:

- personal photographs and videos were removed and replaced with fictional illustrated placeholders;
- the original anniversary letter and other private messages were omitted;
- identifying names, exact private dates, selected locations, and relationship-specific details were generalized;
- a small number of private dialogue lines and inside jokes were replaced with neutral public wording;
- private voice material and other non-public audio assets are not distributed here.

The goal was to preserve the **game, its personality, and its systems** without turning a personal relationship into a public archive.

## Design Approach

A few principles guided the project:

- **Discovery over checklists** — progress should come from noticing places, conversations, objects, and changes in the world.
- **Small interactions matter** — quiet character moments are as important as larger set pieces.
- **Cozy but readable** — pixel art, UI, animation, and sound should feel warm without sacrificing clarity.
- **Privacy by design** — the public edition demonstrates the project without exposing the private material it was originally built around.

## Tech

| Technology | Version | Used for |
| --- | ---: | --- |
| Phaser | 3.90.0 | Game runtime, scenes, input, cameras, audio |
| TypeScript | 5.9.3 | Gameplay, UI, data, and tooling |
| Vite | 7.3.6 | Development and production builds |
| Vitest | 3.2.7 | Automated testing |
| Tauri | 2.11.x | Native Windows desktop wrapper |

The codebase is split into focused systems for world regions, interactions, dialogue, memories, UI, audio, saving, cats, and Together Mode.

For a deeper technical breakdown, see **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Testing & Privacy QA

The project includes automated coverage for gameplay systems such as movement, saves, interactions, memory progression, dialogue choices, cats, audio behavior, Together Mode, title flow, and completion.

The public edition also includes dedicated privacy checks that help prevent private media, local machine paths, installers, secrets, and other excluded material from accidentally entering the repository.

```powershell
npm run privacy
npm test
npm run typecheck
npm run lint
npm run build
```

## Run from Source

If you only want to play, use the **[Windows release](https://github.com/goncaloterroso25-create/Sheepy-World/releases/tag/SheepyWorldV1)** above.

For development or source review:

**Prerequisite:** Node.js `^20.19.0` or `>=22.12.0`

```powershell
npm install
npm run dev
```

Then open the local URL printed by Vite.

### Production build

```powershell
npm run build
```

### Desktop build

Building the Tauri desktop wrapper additionally requires Rust and the normal platform prerequisites for Tauri 2:

```powershell
npm run desktop:dev
npm run desktop:build
```

Compiled installers are distributed through **GitHub Releases**, not stored in the tracked source repository.

## Development Approach

Concepted, designed, creatively directed, iterated, tested, and manually reviewed by **Gonçalo Terroso**.

My direct creative work also includes the original music, bespoke sound design, and curation/integration of the wider audio palette.

The project was developed through an **AI-assisted workflow** combining hands-on creative direction, systems design, iterative implementation, runtime testing, and manual visual QA. AI-assisted implementation was used as a development tool; creative and release decisions remained actively directed and reviewed.

## Project Status

The original private anniversary game and its Windows release are complete.

This repository is the separate, privacy-safe **public portfolio edition**, with its own downloadable Windows build.

## Author

**Gonçalo Terroso**  
Concept · Game Design · Creative Direction · Development · Sound Design · Original Music · QA

🌐 [goncaloterroso.com](https://goncaloterroso.com)

© 2026 Gonçalo Terroso. All rights reserved. No open-source license is granted by the presence of this source portfolio.
