# Releasing 4-Stat DG

Foundry users install/update via this manifest URL:

```
https://github.com/Diskoteket/4-stat-dg/releases/latest/download/system.json
```

That URL resolves to whatever you publish as the **latest GitHub release**. So "releasing" = "publish a GitHub release with two files attached." That's it.

---

## Each release — the full sequence

Run these commands from the repo root (`/Users/disco/code/4-stat-dg`). Replace `0.1.0` with whatever version you're cutting.

### 1. Bump the version in `system.json`

Open `system.json`, change:

```json
"version": "0.1.0",
```

If you've tested on a newer Foundry build, also bump `compatibility.verified`.

### 2. Commit, tag, push

```bash
git add system.json
git commit -m "Release v0.1.0"
git tag v0.1.0
git push origin main --tags
```

### 3. Build the zip

```bash
zip -r 4-stat-dg.zip . \
  -x ".git/*" -x ".github/*" -x "*.zip" -x ".DS_Store" \
  -x ".gitignore" -x "RELEASE.md"
```

Sanity-check that `system.json` is at the **root** of the zip (not inside a folder):

```bash
unzip -l 4-stat-dg.zip | head
```

You should see `system.json` listed without any directory prefix. If you see `4-stat-dg/system.json`, the install will fail — re-zip from inside the repo, not from its parent directory.

### 4. Publish the GitHub release

In a browser:

1. Go to <https://github.com/Diskoteket/4-stat-dg/releases/new>
2. **Choose a tag:** select `v0.1.0` (the tag you just pushed)
3. **Release title:** `v0.1.0`
4. Release notes: short summary of what changed
5. **Attach binaries** (drag & drop into the "Attach binaries" zone):
   - `system.json` — the manifest from the repo root
   - `4-stat-dg.zip` — the zip you just built
6. Leave "Set as the latest release" checked
7. Click **Publish release**

### 5. Verify

Open both URLs in a browser — each should download the file you just attached:

- <https://github.com/Diskoteket/4-stat-dg/releases/latest/download/system.json>
- <https://github.com/Diskoteket/4-stat-dg/releases/latest/download/4-stat-dg.zip>

Then in Foundry:

- **Fresh install:** Setup → Game Systems → Install System → paste the manifest URL → Install
- **Update existing install:** Setup → Game Systems → the "Update" button should appear next to 4-Stat DG within ~30 seconds

If install fails, the most common causes are:
- `system.json` not attached to the release (Foundry shows "could not fetch manifest")
- Zip has the system folder nested inside (Foundry shows "invalid system" or won't show your sheets)
- `version` field in `system.json` matches what's already installed → no update prompt; bump it

---

## First release only

You've already pushed the repo and the remote is set. So for the very first release (`v0.1.0`) the only setup task is making sure `system.json` has the right URLs — and it does (`Diskoteket/4-stat-dg`). Just run steps 1–5 above.

If you want a license to show in Foundry's package browser later, drop a `LICENSE` file at the repo root and add `"license": "LICENSE"` back to `system.json`.

---

## Local testing without releasing

Symlink the repo into Foundry's systems directory so you can iterate without zipping:

```bash
ln -s "$(pwd)" "$HOME/Library/Application Support/FoundryVTT/Data/systems/4-stat-dg"
```

Restart Foundry. The system shows up in the systems list. After editing JS/templates, refresh the world with F5 to reload.

To remove the symlink later:

```bash
rm "$HOME/Library/Application Support/FoundryVTT/Data/systems/4-stat-dg"
```
