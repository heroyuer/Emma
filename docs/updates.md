# Automatic approved updates

Standing authorization covers ordinary future upgrades from this private maintained repo. It does not grant new services, broader permissions, public publication or parent credentials. Each computer needs its own GitHub read access (managed by Git/GCM), Node and Git; no secret is stored in this repo or scheduler arguments.

## Implemented local path

`scripts/update.mjs` fetches version tags from the pinned repository, selects a SemVer release whose release.json says stable/approved and parent-tested for native Voice, validates the candidate and runs its tests before activation. Arbitrary commits do not qualify. A lock prevents concurrent updaters. Settings stay under `~/.emma/runtime/`, outside replaced source. The managed `current/` path and marketplace name preserve local identity; the previous version remains in `previous/`.

The updater stages while ChatGPT/Codex is running or session state is unknown. On Windows it activates automatically when those processes are closed and no active-lesson marker exists. Bootstrap has an explicit between-sessions context. Activation uses directory renames with rollback on failure, then requires client restart/install refresh according to the host. This is not hot reload and not a transaction across arbitrary power loss; if interrupted, inspect current/previous and restore the last valid version before re-running. A stale lock requires inspection, not blind deletion. Older queued stage folders are retained for inspection; do not count them as active installs.

On the intended Windows account only, execute `scripts/setup-updates.ps1 -InstallRoot <that-user-home>/.emma` after bootstrap. It registers a current-user, limited task at noon and sign-in, with missed-run catch-up. It checks whenever the machine is awake and user logged in; no service or password is installed and it does not wake a sleeping machine. Launching the update command before a lesson is the startup catch-up path. A running client may require a restart; report staged/activated/current/failure truthfully. No such task has been registered during development.

The coach should pin the loaded plugin/rule version in active lesson metadata and use `runtime/lesson-active.json` when execution is supported. Clearing it after closing must preserve pending-save status. A native Voice session may lack local execution/markers, so background process detection conservatively stages while the client is running. Do not promise seamless per-session upgrades in a host that cannot execute this path.

Rollback: close client and preserve runtime config/archives; verify previous/release.json and its package, then move current to a uniquely named failed directory and previous to current within the managed root. Restart and verify loaded version. Do not delete an old working version or downgrade without recording actual status. A production rollback procedure requires local client testing.

## Parent promotion

Parent tests the preview in their own account, including native Voice startup and Drive save/readback. Bump versions for changes, update CR/changelog, set release.json to stable/approved with native_voice_acceptance parent-tested only after the real test, and push the tested source. The CI workflow runs tests/validation and creates an immutable annotated version tag only for an approved matching release. No stable version is published for this first unverified preview.

Local upgrades mean local package activation/refresh, not cloud publishing. If the chosen host requires an account-owned cloud plugin, an owner-account Plugin Creator tool must republish that same ID using its observed release and verify files. There is no verified unattended API for doing that from this standalone local updater. Do not claim GitHub sync makes cloud personal copies update automatically.

### Scheduler environment repair (0.1.2)

Setup captures validated absolute Node/Git/tar paths and optional host executables to ignored per-user runtime/toolchain.json. The scheduled updater reconstructs only required tool directories in its environment and uses a fixed working directory. It does not rely on the Codex shell PATH or copy credentials. Moving/removing bundled tools requires rerunning setup from a working shell; validation fails safely instead of silently using another source. Every check persists safe status/time/error code to update-status.json, including no_approved_release and failures. A successful manual run is not scheduler acceptance; require an actual task run and LastTaskResult0.

### Supported full upgrade (0.2.0)

Use scripts/upgrade.mjs --preview --version0.2.0 --between-sessions only between sessions. The workflow save guard blocks activation while any lesson or unresolved save is protected. After activation/current-version checks, the upgrader invokes the supported same-selector codex plugin add command, checks manifest/Drive dependency and exact installed skill, and reports cache_refresh separately. No --force or invented refresh command. The scheduled checker uses this same refresh step for approved releases. Existing same-user task timing/settings are preserved when reconciling setup. Current preview tags are not stable approval.
