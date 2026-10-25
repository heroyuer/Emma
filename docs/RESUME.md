# Durable resume checkpoint — 2026-10-25

## Implemented and checked

- PRIVATE repos created: heroyuer/Emma and heroyuer/Emma-dashboard. Source checkpoint is committed/pushed separately; check git log/status and remote main before continuing, do not infer installation from source.
- Emma preview0.1.0: independent coaching skill/approved portrait/standard Drive dependency, archive preparation and pause-aware session ledger. Ten synthetic tests plus package and skill validation passed. Actual Git-tag staging/idle activation tested with a temporary synthetic repo, not the real client.
- Emma Dashboard preview0.1.0: localhost journal/session pages, SQLite/cache revision history, bounded read-only Drive traversal/receipt verification, parent-test separation, five synthetic tests passed; empty local homepage returned HTTP200. PKCE OAuth onboarding and task setup scripts are prepared, not executed.
- Shared archive.schema.json identical in both repos. Higher checkpoint/final revisions require unchanged prior transcript prefix, retain prior cache history. Same-day paused session excludes away time; new Chicago date starts a new ID and seals prior unfinished work partial.
- Original repo/Site/data remain preserved and unarchived. No real child lessons, Drive archive writes, scheduled tasks, OAuth secrets or learner records were created/copied.

## Next exact steps

1. Re-read Git status/logs and CRs in both new repos. Verify remote/private state. Read docs/installation.md and docs/updates.md; preview source is not a stable approved rollout.
2. Run tests/verify and inspect final package. Review updater review fixes (registration before activation, downgrade rejection, malformed-tag fallback, busy/staged bootstrap). Exercise failure paths and actual local client marketplace install before stable promotion.
3. Parent may explicitly test preview bootstrap. Requires own GitHub access, Node/Git, desktop restart and Plugins install/Drive connection. No actual parent/child install is verified yet. Native ChatGPT Voice remains an independent blocker until Hi Emma invokes the full skill/tools in a fresh Voice chat.
4. Configure NEW Drive root locally from the parent's supplied current folder, then stable learner folders/parent-tests through actual authorized Drive tools. Coordinator checked root title/empty contents/writer permissions, but no subfolders were created here. Do not restore old folders or embed IDs/emails in Git. Verify each child's own Drive account/write/readback.
5. For parent importer, user must supply/create Google Desktop OAuth client credentials and enable Drive API. Run dashboard scripts/authorize.mjs <client-json> <new-root-id> <expected-parent-email>, complete own browser consent, then scripts/import.mjs. Actual OAuth/live import not yet verified; never borrow ChatGPT connector credentials. Task scripts are artifacts only; register only on intended account after successful manual test.
6. Test pause checkpoint→same-day resume→final revision import,25/30-minute behavior,new-day active/paused rollover and actual available transcript with both clients. Native host may not delegate every Voice turn; report coverage honestly.
7. After parent acceptance, promote an approved stable version and test daily/sign-in updater on each intended machine; child cloud account-owned copies have no verified unattended republish path. Local updates require restart/refresh, not hot reload.
8. Archive ORIGINAL GitHub repo only after full split/migration gates are met or remaining limitations are explicitly accepted. Do not shut down Site, delete records/local checkouts or archive chats.

Known incomplete integration: skill must actually invoke ledger/Drive tools; backend-free instructions cannot enforce missing native Voice/execution capabilities. Dashboard is a local source preview, not connected family monitoring. Archive receipt generation/upload requires actual tool readbacks. No stable auto-update release exists yet.

## Parent bootstrap completed after initial checkpoint

Actual parent preview bootstrap ran successfully from immutable emma-v0.1.0. Files/standard Drive dependency/source receipt and personal-emma marketplace entry read back successfully. Runtime is parent_test, with unique local identity and no configured Drive destination; no real identity/IDs are committed. No schedules or app restart. Next user step: restart intended ChatGPT desktop client, find Emma in the Personal plugins/local source and install/refresh; verify0.1.0 in a fresh chat, then separately test native Voice. This local registration is not verified client installation or a cloud account-owned publication. Parent importer still needs Google Desktop OAuth credentials and consent.

## 0.1.1 follow-up preview

Fixes are source-tested: shared profile runtime instead of chat-local ledgers; explicit paused-ledger archive adapter and revision-specific local preparation; canonical hashed receipt generator; dashboard legacy receipt revalidation from newly fetched bytes/parents; stronger reading-to-discussion guidance. No old test records rewritten, no raw transcript committed. Actual cross-chat native host invocation and new upload acceptance still require a fresh test. Parent0.1.0 remains loaded until the preview update is staged/activated and client refresh occurs.

0.1.1 artifact is26fcd567e719b67356c8cc9dd27e0103a5b46cc5, preview tag emma-v0.1.1. Parent updater fetched, tested and STAGED this package; active source remains0.1.0. Between sessions, close intended desktop clients, run the local launcher with --preview, reopen/refresh and verify loaded0.1.1 before a new test. No old chat-local ledger was silently migrated. Dashboard source artifact7434dc741bc3f23fd59dcae536ab8f8a8cdfd6dc supports read-time legacy receipt revalidation; actual standalone OAuth remains required.

Parent explicitly requested activation: updater activated0.1.1 between sessions and verified exact source/config/marketplace, retaining0.1.0 rollback. No forced restart. Next step is restart/refresh intended desktop client and open a new test chat; verify loaded0.1.1 before assessing the new behavior.

Installed-cache follow-up: source activation did not refresh the installed0.1.0 cache in the observed parent test. Supported `codex plugin add emma@personal-emma --json` now returned installed0.1.1; `codex plugin list --marketplace personal-emma --json` confirms enabled/same identity/source, and cached skill was read back. Fresh test should explicitly select the local Emma plugin rather than resolve its name from old personal-context search. Old Site plugin was not removed. Updater still needs this separately verified host-refresh step incorporated before calling future automatic upgrades complete.

Scheduler repair completed:0.1.2 artifact9205b3c91d04609351d89299f95fa9aefac88fa4 passed15 tests including empty PATH. Captured validated per-user absolute tools (no credentials), activated/installed same Emma identity0.1.2, re-registered existing limited/current-user task with working directory. Actual scheduled run returned LastTaskResult0 and persisted no_approved_release at2026-10-25T21:41:59.059Z. Daily noon+logon/StartWhenAvailable; no stable release available, so no automatic stable upgrade expected yet. No child tasks or import/reminder schedules. Still test native host and integrate/verify installed-cache refresh for future auto-activated packages; do not equate checker success with full future upgrade acceptance.
