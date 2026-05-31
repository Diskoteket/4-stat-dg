# Releasing 4-Stat DG

Pushing a version tag triggers the GitHub Actions release pipeline, which builds the zip and publishes a GitHub release automatically. You only need three steps.

---

## Cutting a release

### 1. Bump the version in `system.json`

```json
"version": "0.1.1"
```

If you've tested on a newer Foundry build, also bump `compatibility.verified`.

### 2. Commit and tag

```bash
git add system.json
git commit -m "Release v0.1.1"
git tag v0.1.1
git push origin main --tags
```

### 3. Watch it go

GitHub Actions picks up the tag, verifies it matches `system.json`, builds `4-stat-dg.zip`, and publishes a release with both files attached. Takes about 30 seconds.

Check progress at:
`https://github.com/Diskoteket/4-stat-dg/actions`

---

## Verify the release

After the action completes, confirm both URLs serve the files:

- `https://github.com/Diskoteket/4-stat-dg/releases/latest/download/system.json`
- `https://github.com/Diskoteket/4-stat-dg/releases/latest/download/4-stat-dg.zip`

Then in Foundry → Setup → Install System → paste the manifest URL to install, or hit **Update** if it's already installed.

---

## If the action fails

**"Tag does not match system.json version"** — the tag you pushed (`v0.1.1`) doesn't match the `version` field in `system.json`. Fix `system.json`, amend the commit, delete and re-push the tag:

```bash
# fix system.json, then:
git add system.json
git commit --amend --no-edit
git tag -d v0.1.1
git tag v0.1.1
git push origin main --tags --force
```

**Action passed but Foundry shows no update** — the `version` in `system.json` must be higher than what's currently installed. Foundry only prompts for updates when the manifest version is newer.

---

## Local testing without releasing

Symlink the repo into Foundry's systems directory:

```bash
ln -s "$(pwd)" "$HOME/Library/Application Support/FoundryVTT/Data/systems/4-stat-dg"
```

Restart Foundry. After editing JS or templates, refresh the world with F5.

```bash
# remove when done
rm "$HOME/Library/Application Support/FoundryVTT/Data/systems/4-stat-dg"
```
