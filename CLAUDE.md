# Notes for Claude

Livy's site: 《梦蝶之后：一艘驶向自我的花船》, a multi-deck flower boat that works as her personal museum. One deck per stage of her life (Guangzhou, Oxford, HKU, Penn + career, a maker's loft, a roof terrace), a butterfly leads visitors up. Built from her curatorial brief and CV (Nov 2026). All site text is in her voice ("I"). Chris (Zhuojin Li) builds it for her; his own site is https://lizhuojin.com (repo `rsm-zhl232/rsm-zhl232.github.io`). Read README.md first.

## Working with Chris and Livy

- Talk to Chris in Chinese. Site text stays bilingual (EN / 中文) in `assets/js/content.js`.
- Requests often come from Livy through Chris. For bigger changes (the look, the visiting route, anything that changes how the place feels), give a few options first and wait for a pick. Small asks can go straight in.
- After a change, say plainly what it looks like and where to look; they often check on a phone.
- The title and the word 花船 come from Livy's own brief. (An earlier draft was 海上楼阁, because her first wording 海上青楼 also reads as "brothel"; don't bring 青楼 back unless she asks.)
- Contact: email only, assembled at runtime from `PROFILE.emailParts`. Her phone number and the CV PDF are not on the site; Chris chose that.

## How things are built

- Static site, no build step. Three.js r160 and fonts are self-hosted in `assets/vendor/` so the site loads in mainland China. Don't add CDN dependencies.
- Inside, the site works like Chris's apartment: an orthographic camera from above at 45°, a visitor avatar that walks on a nav grid, objects that open a side panel. `avatar.js` and `nav.js` are copied from his repo (`assets/js/room/`) so people look the same on both sites; keep them in step when his copies change.
- `decks.js` has one floor plan per deck (sizes, furniture with `type`, `id`, `foot`, `spot`, where the butterfly rests). `props.js` has the furniture builders (`BUILD`), `world.js` builds the hull, deck shells, eaves, courtyard and pier from the plans and also the nav grid per deck.
- While you are on a deck, the decks above it are hidden and its front walls drop to their lower 0.95 m (`upper` in `world.js`), so the camera can see in. The courtyard (天井) runs through the middle; through it you see the decks below.
- `world.js` merges static meshes per material at the end (`mergeStatic`). Anything that has to move, be clicked on its own, or change visibility must be in a separate subtree (an item, an `upper` part, or `userData.keep`).
- The moon casts shadows outside; inside, a warm directional `lamp` in `main.js` takes over.
- The sample artworks and loft pieces are drawn on a canvas in `art.js` until Livy sends real ones.

## Checking a change

- Run `python3 -m http.server 8080` and open `/`, `/?deck=N` (0–5), `/?deck=3&panel=flight`, `/?ride` or `/?outside`.
- In a cloud session, Playwright with `--use-angle=swiftshader` works, but renders a few frames a second, so walking looks slow there; test walk paths by running `NavGrid` over `PLANS` in Node instead. Run at most two browsers at once.
- Screenshot with headless Chrome. Use `--use-gl=swiftshader --enable-unsafe-swiftshader --virtual-time-budget=9000` and wrap it in a timeout, for example `perl -e 'alarm 90; exec @ARGV' "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless ...`.
- Headless Chrome's viewport is about 87px shorter than `--window-size`, so a dark strip at the bottom of a screenshot is expected. Test phones at 600 px wide.
- Delete any temporary test pages before committing.

## Deploying

- Private GitHub repo `rsm-zhl232/LVhome`. Cloudflare Workers static assets project `lvhome` once Chris connects it; then a push to `main` deploys.
- Commit as Chris:
  `git -c user.name="rsm-zhl232" -c user.email="jinjean0406@gmail.com" commit`
- Files that must not be public are listed in `.assetsignore`.

## Waiting on Livy

- Her Guangzhou memories (one per window on deck 01) and her school there.
- Photos of her fashion design work: the Oxford design table and the whole Maker's Loft show placeholders.
- Her LinkedIn URL (`PROFILE.linkedin`).
- Her own intro, if she wants one beyond the brief.
- A domain.
- Visiting between the two sites: a door to Chris's place exists (`SITE.chris`). The way back from his site, and greeting each other as hosts, are still to do.
