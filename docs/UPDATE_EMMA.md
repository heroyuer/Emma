# Update Emma

Generated from VERSION and release.json. The reusable prompt does not pin a version.

Current source candidate: 0.2.4
Channel: preview
Tagged source: emma-v0.2.4

## Universal upgrade prompt

Update my existing Emma installation to the newest tested, version-tagged preview release from https://github.com/heroyuer/Emma. My parent authorizes the preview channel for our ongoing real-session testing and future preview updates. Fetch fresh origin tags, select the highest eligible semantic version, and read AGENTS.md, release.json and docs/UPDATE_EMMA.md from that exact tag. Verify its metadata, tests and package before activating; do not install arbitrary main commits or downgrade a newer installation. Use my own account and preserve my profile, Google Drive destination/connection, archives, pending saves, marketplace entries and existing Emma identity. Never clear a lesson/save guard, create a duplicate plugin, borrow parent credentials or interrupt a lesson. Between sessions, run scripts/update-kids.ps1 -Preview from the verified release source; no version number is needed. Reconcile this machine's existing current-user scheduled task using the release's scripts/setup-updates.ps1 -InstallRoot <my existing Emma root> -Channel preview, preserving its triggers, settings and principal. Verify its action uses the existing launcher, has --preview, and has no pinned --version or --between-sessions flag. Start the task once and read back its action, last result and update-status.json: report checked, staged, activated and installed states separately. A running client or pending save may defer activation; retain the update and explain when it can finish. Confirm cache_refresh=verified and installed_version equals the resolved release before claiming installation succeeded. Open a fresh chat to confirm the loaded version; the real lesson tests Voice and transcript capture separately. If this is an account-owned cloud copy, use that same plugin ID's supported update path and explain that a Windows local task does not update cloud copies.

## PowerShell from the verified release source

```powershell
.\scripts\update-kids.ps1 -Preview
```

Finish the lesson and pending save first. No -Version means resolve the newest eligible tagged release in the selected channel. The scheduled task preserves this channel and timing, checks without a pinned version, and defers activation while the client is running or a save guard exists. A local task updates local marketplace installs, not account-owned cloud copies.
