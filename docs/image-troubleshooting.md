# Image troubleshooting and rescue steps

Purpose
-------
Short, reproducible steps used to diagnose and fix the homepage hero image issue. Save this for future image-related problems (broken downloads, wrong MIME, license checks, attribution).

Summary of the issue
--------------------
- Attempted to download a free Unsplash image via `source.unsplash.com`, but the saved file was an HTML error page (small file, ~500 bytes) and therefore did not render.

Checklist & steps
-----------------
1. Inspect the locally saved image file

```bash
ls -l public/images/home/hero-whatido.jpg
file public/images/home/hero-whatido.jpg
``` 

2. If the file is unexpectedly small or `file` reports `HTML document`, check the remote headers to see what is being returned:

```bash
curl -I "https://source.unsplash.com/1600x900/?workspace,laptop,notebook,research"
``` 

3. If the remote source returns HTML (error page), 5xx, or a redirect that doesn't result in an image, switch to a reliable free source. Two reliable approaches used here:

- Wikimedia Commons (explicit license metadata) — preferred when you need explicit license/attribution info.
- Unsplash / Pexels — convenient, but verify final download is an image (and follow license/attribution rules).

4. Search Wikimedia Commons (example using the API):

```bash
curl -s "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=laptop%20workspace&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|mime" | jq .
```

5. Verify the candidate image's license/metadata via `imageinfo` (look for `LicenseShortName` / `UsageTerms` / `extmetadata`):

```bash
curl -s "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|mime|extmetadata&pageids=<PAGEID>" | jq .
```

6. Download the verified image with `curl -L` and save it into `public/images/home/`:

```bash
curl -L -o public/images/home/hero-whatido.jpg "<IMAGE_URL_FROM_COMMONS>"
```

7. Confirm the saved file is a valid image and reasonably sized:

```bash
ls -lh public/images/home/hero-whatido.jpg
file public/images/home/hero-whatido.jpg
identify -format "%w x %h" public/images/home/hero-whatido.jpg  # optional (ImageMagick)
```

8. Update the site configuration or content that references the image. For this project the hero image is configured in:

```text
content/homepage/hero.json
```

Change `visualImage` and `visualAlt` accordingly. Example:

```json
{
  "visualImage": "/images/home/hero-whatido.jpg",
  "visualAlt": "Workspace with laptop and notebook representing research and projects"
}
```

9. Run the project's checks and tests to ensure nothing else is broken:

```bash
bash scripts/checks.sh
pnpm vitest run  # optional: run unit tests
```

10. Commit the change with a clear message and push to your branch:

```bash
git add public/images/home/hero-whatido.jpg content/homepage/hero.json
git commit -m "chore: replace hero image with Wikimedia Commons workspace photo (CC BY 2.0) and update hero.json"
git push origin HEAD
```

Attribution & licensing
-----------------------
- If you use an image under a permissive license (e.g., CC BY), ensure you include attribution where required. For Wikimedia Commons images the API returns `LicenseShortName` and `LicenseUrl` in `extmetadata`.
- Example attribution text to add to footer or near the hero (HTML/JSX):

```jsx
<small className="text-xs">Photo: <a href="https://commons.wikimedia.org/wiki/File:...">Shixart1985</a> / Wikimedia Commons (CC BY 2.0)</small>
```

Notes & troubleshooting tips
----------------------------
- `source.unsplash.com` can redirect and sometimes return HTML error pages (rate-limits, CDN issues). Always verify downloaded file with `file` and `ls -l`.
- If a downloaded file is HTML, open it (e.g., `less public/images/hero.jpg`) to quickly see the error message returned by the remote host.
- Prefer explicit-license sources (Wikimedia Commons) when you need to record attribution or the exact license.
- For programmatic workflows, prefer the photographer's download link or an API that returns a direct image URL (and capture attribution metadata alongside it).

Reference commands used during the fix (exact history)
-----------------------------------------------------
1. Inspect local file

```bash
ls -l public/images/home/hero-whatido.jpg
file public/images/home/hero-whatido.jpg
```

2. Inspect remote response

```bash
curl -I "https://source.unsplash.com/1600x900/?workspace,laptop,notebook,research"
```

3. Search Wikimedia Commons and inspect metadata

```bash
curl -s "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=laptop%20workspace&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|mime" | jq .
curl -s "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|mime|extmetadata&pageids=<PAGEID>" | jq .
```

4. Download verified image

```bash
curl -L -o public/images/home/hero-whatido.jpg "https://upload.wikimedia.org/wikipedia/commons/d/d9/Modern_workspace_with_a_laptop%2C_books%2C_an_apple%2C_and_a_small_potted_plant_on_a_bright_desk.jpg"
```

5. Run checks

```bash
bash scripts/checks.sh
pnpm vitest run
```

6. Commit

```bash
git add public/images/home/hero-whatido.jpg content/homepage/hero.json
git commit -m "chore: replace hero image with Wikimedia Commons workspace photo (CC BY 2.0) and update hero.json"
git push origin HEAD
```

If you want, I can add a small visible attribution (e.g., in the hero card or site footer) automatically — tell me where you prefer it to appear.
