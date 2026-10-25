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
