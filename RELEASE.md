# Releasing 4-Stat DG

This walks through cutting a release so that Foundry users can install or auto-update via the manifest URL:

```
https://github.com/Diskoteket/4-stat-dg/releases/latest/download/system.json
```

> Both `manifest` and `download` in `system.json` already point to `releases/latest/download/...`. That means every new GitHub release becomes the latest version Foundry sees — no further edits needed once those URLs are correct.

---

## One-time setup

1. Push this repo to GitHub at the URL referenced in `system.json` (currently `https://github.com/Diskoteket/4-stat-dg`). If you use a different repo URL, edit the `url`, `manifest`, `download`, and `bugs` fields in `system.json` before tagging anything.
2. (Optional) Decide on a license and add a `LICENSE` file. If you want Foundry's package browser to show it, add `"license": "LICENSE"` back to `system.json`.

---

## Cutting a release

For each new version:

### 1. Bump the version

Edit `system.json` and update `"version"` (semver, e.g. `0.1.0` → `0.1.1`).

If you're targeting a newer Foundry build, also update `compatibility.verified`:

```json
"compatibility": {
  "minimum": "12",
  "verified": "12",
  "maximum": "13"
}
```

### 2. Commit and tag

```bash
git add system.json
git commit -m "Release v0.1.1"
git tag v0.1.1
git push origin main --tags
```

### 3. Build the zip

From the repo root, package everything **except** the dev-only files:

```bash
zip -r 4-stat-dg.zip . \
  -x ".git/*" -x ".github/*" -x "*.zip" -x ".DS_Store" -x ".gitignore" \
  -x "RELEASE.md"
```

The zip **must** contain `system.json` at its root (not nested in a folder). Verify:

```bash
unzip -l 4-stat-dg.zip | head
```

You should see `system.json` listed without a directory prefix.

### 4. Create the GitHub release

Via the GitHub web UI:

1. Go to **Releases** → **Draft a new release**
2. Choose the tag you just pushed (e.g. `v0.1.1`)
3. Title: `v0.1.1`
4. **Attach two files:**
   - `system.json` (the manifest itself — Foundry reads this first)
   - `4-stat-dg.zip` (the download)
5. Publish

Or via `gh`:

```bash
gh release create v0.1.1 \
  --title "v0.1.1" \
  --notes "Release notes here" \
  system.json 4-stat-dg.zip
```

### 5. Verify

After publishing, hit both URLs in a browser — they should serve the latest files:

- `https://github.com/Diskoteket/4-stat-dg/releases/latest/download/system.json`
- `https://github.com/Diskoteket/4-stat-dg/releases/latest/download/4-stat-dg.zip`

Then in Foundry → Setup → Install System → paste the manifest URL. If you already have it installed, the **Update** button should appear and pull the new version.

---

## Why both `system.json` and the zip

- **`system.json`** is what Foundry hits first via the manifest URL. It reads the `version` field and the `download` URL.
- **The zip** is the actual payload Foundry downloads and unpacks. It must include a `system.json` at its root for installation to succeed.

If you ever forget to upload one of them, installs will fail silently with "could not fetch manifest" or "invalid system" errors.

---

## Local development

To test the system locally without publishing:

1. Symlink (or copy) the repo into your Foundry `Data/systems/` directory:

   ```bash
   ln -s "$(pwd)" "$HOME/Library/Application Support/FoundryVTT/Data/systems/4-stat-dg"
   ```

   (Adjust path per platform — Linux uses `~/.local/share/FoundryVTT/Data/systems/`.)

2. Restart Foundry. The system should appear in the **Game Systems** list.
3. Create a world using **4-Stat DG**, launch it, and iterate. Foundry watches files but you'll need to refresh (F5) after editing modules/templates.
