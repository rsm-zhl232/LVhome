# Notes for Claude

Livy's site: a four-storey pavilion on the sea, one gallery hall per floor, reached by boat. Chris (Zhuojin Li) builds it for her; his own site is https://lizhuojin.com (repo `rsm-zhl232/rsm-zhl232.github.io`). Read README.md first.

## Working with Chris and Livy

- Talk to Chris in Chinese. Site text stays bilingual (EN / 中文) in `assets/js/content.js`.
- Requests often come from Livy through Chris. For bigger changes (the look, the visiting route, anything that changes how the place feels), give a few options first and wait for a pick. Small asks can go straight in.
- After a change, say plainly what it looks like and where to look; they often check on a phone.
- Livy's wording for the place was 海上青楼. The draft title is 海上楼阁, because 青楼 also reads as "brothel" in modern Chinese. Don't switch it to 青楼 unless she confirms.

## How things are built

- Static site, no build step. Three.js r160 and fonts are self-hosted in `assets/vendor/` so the site loads in mainland China. Don't add CDN dependencies.
- `world.js` builds everything at world scale (metres). The pavilion is at the origin; the pier and the boat route are on +z. `SIZES` sets the floor widths, `H` the storey height.
- Each floor has an outer lattice wall and a separate inner gallery wall, so the inside and outside can look different. The moon casts shadows; that is what keeps it from lighting the halls.
- `gallery.js` hangs works in `slots()` order: back wall, sides, then the front wall.
- The sample artworks are drawn on a canvas in `art.js`. A work with `image` uses the image instead.

## Checking a change

- Run `python3 -m http.server 8080` and open `/`, `/?hall=N`, `/?hall=N&work=K`, `/?ride` or `/?outside`.
- Screenshot with headless Chrome. Use `--use-gl=swiftshader --enable-unsafe-swiftshader --virtual-time-budget=9000` and wrap it in a timeout, for example `perl -e 'alarm 90; exec @ARGV' "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless ...`.
- Headless Chrome's viewport is about 87px shorter than `--window-size`, so a dark strip at the bottom of a screenshot is expected. Test phones at 600 px wide.
- Delete any temporary test pages before committing.

## Deploying

- Private GitHub repo `rsm-zhl232/LVhome`. Cloudflare Workers static assets project `lvhome` once Chris connects it; then a push to `main` deploys.
- Commit as Chris:
  `git -c user.name="rsm-zhl232" -c user.email="jinjean0406@gmail.com" commit`
- Files that must not be public are listed in `.assetsignore`.

## Waiting on Livy

- Her real works and their titles and notes (everything in `HALLS` is a sample).
- Which title she wants (see above), and her own intro.
- A domain.
- Visiting between the two sites: a door to Chris's place exists (`SITE.chris`). The way back from his site, and greeting each other as hosts, are still to do.
