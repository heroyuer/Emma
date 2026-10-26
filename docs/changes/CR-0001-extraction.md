# CR-0001 — Independent Emma extraction and automatic local updates

Document revision: 13
Status: implemented_host_validation_pending
Opened: 2026-10-25
Target release: 0.1.0 preview package; no verified cloud or learner rollout

## Problem

The personal Sites plugin cannot be shared to the children's separate accounts. Coaching, learning archives and updates need independent lifecycles.

## Before

Z English Coach 1.3.2 is published in the parent's account with private hosted records. Its sharing restriction and native Voice delegation gap remain. It is preserved unchanged.

## After

New PRIVATE Emma GitHub repo contains client coaching instructions/persona/portrait, a standard Drive dependency, archive generation/contract, local bootstrap/update tooling and host acceptance guidance. No custom MCP/Sites tools. Parent dashboard remains on the parent's LOCAL laptop, importing authorized Drive archives when awake; no dashboard migration/import schedule is implemented yet.

## Scope

Independent package, own-account Drive connection, newly designated folders, local marketplace update staging/activation, approved versioned releases and per-machine scheduler setup artifacts. No actual child/parent installation, schedules, credentials, new Drive folder or learner-record migration in this development task.

## Acceptance

- Package is self-contained, versioned and has no old App/MCP dependency or dead Drive references.
- Actual text archives retain Chinese/errors; evidence references are validated and metrics have explicit limits. Local preparation never claims remote save.
- Supported authoring/import/local paths are documented separately from untested free/teen-account and native Voice behavior.
- Automatic updater stages only approved stable releases, validates package, preserves config/identity and keeps rollback. Active/unknown client state defers activation; no forced hot reload.
- No account-owned cloud plugin is silently republished by a local updater. Its same-ID guarded update remains a separate host-capability-dependent path.
- Parent local dashboard/import architecture is documented without creating an automation or discarding existing useful pages/data.

## Decisions

2026-10-25: parent explicitly authorized private Emma repo, extraction, own-account installs and automatic future approved updates. Local marketplace preferred where supported: no cloud republish for local refresh, but client restart/install may be necessary. Cloud account copies require each owner's supported Plugin Creator tools; no inherited sharing/access. GitHub sign-in/private read access and each child's Drive authorization cannot be supplied by the parent's credentials. Stable release promotion follows parent testing, not arbitrary main commits.

## Implementation and verification

See docs/installation.md, docs/updates.md and docs/architecture.md for capability boundaries. Synthetic tests and package validation are source checks; actual child account installation, native Voice startup, complete capture, Drive upload/readback and automatic client refresh remain unverified. No production lesson was started here.

## Commit and release links

Source: https://github.com/heroyuer/Emma. Package/release status is recorded independently in release.json and docs/releases.json. No shipped cloud release tag.

Approved session follow-up: short requested stop before25min pauses, same-day start resumes accumulated time excluding pause gap; requested end at25min closes,30min next-turn wrap-up, explicit permanent earlier finish respected. New America/Chicago day seals prior partial work and starts a fresh ID. Ledger/checkpoint tests cover duplicate starts, exact-text retries, boundaries, pause gaps and active/paused rollover. Local host execution remains a prerequisite for ledger enforcement. Automatic updater review corrected registration-before-activation, downgrade prevention, malformed-tag fallback and bootstrap busy/staged reporting.

Checkpoint follow-up: source is now pushed; archive revisions increment on pause/close, unknown timestamps stay explicit and session statuses validate. Ten client tests plus five dashboard tests passed locally. Preview tagging denotes source-package identity only. Native Voice/install/Drive acceptance remains pending.

Source-only release audit: e59fcfdfb6dabe293e1916a91e9bae6e832064c3 and immutable preview tag emma-v0.1.0 identify validated package source; package hash is recorded in docs/releases.json. Both private repos pushed and remote main read back. This is not a cloud publication or actual client install.

Parent local preview preparation: under existing authorization, ran bootstrap --preview on actual parent machine. Verified version0.1.0, exact tagged source, full skill and standard Drive dependency, resolving personal-emma marketplace entry. Runtime parent_test identity is outside Git; destination remains unconfigured. No existing marketplace was present; no other entries/settings were replaced. No app restart/process closing, native Voice test, actual client install confirmation or schedule. User restart and Plugins install/refresh are next. This source-only audit does not promote stable.

0.1.1 preview follow-up after parent test: replace hand-written receipts with deterministic exact-field/byte-hash generation; use one configured profile ledger across local chats; deepen learner contributions and short reading/application flow without quotas. No raw test transcript or private Drive IDs copied to Git. Actual native Voice and new live upload acceptance remain pending; original0.1.0 archives unchanged.

0.1.1 source/package audit: artifact26fcd567e719b67356c8cc9dd27e0103a5b46cc5 and immutable preview tag pushed;13 client tests,6 dashboard tests,actual-module synthetic receipt roundtrip and skill/package validation passed. Forward review identified paused-status mapping/local revision conflicts; explicit adapter/revision directories now cover them. Actual parent updater fetched and staged0.1.1, deferring activation while client running; active source remains0.1.0. No app restart, old-record migration, schedules or stable promotion.

Parent explicitly requested latest activation. Actual updater activated preview0.1.1 from tagged artifact26fcd567e719b67356c8cc9dd27e0103a5b46cc5 between sessions; verified current files, unchanged config hash/marketplace path and retained0.1.0 rollback. No app restart/cache edits or stable promotion. Client refresh/new-chat loaded-version and new live lesson acceptance remain pending.

Naming/routing diagnosis: latest parent chat retrieved the old Site plugin through prior context and Plugin Creator instead of loading the independent local skill. Actual installed cache still0.1.0 despite active source0.1.1. Used supported CLI plugin add for the SAME emma@personal-emma identity; plugin list verified installed/enabled0.1.1 and cache skill readback matched. No cache hand-edit, old-plugin removal or app restart. New explicit local Emma selection/routing remains to test. Future updater must distinguish source activation from installed-cache refresh; restart-only guidance was insufficient in this observed case.

0.1.2 scheduler fix: actual task failed because bundled Git was absent from scheduler PATH. Capture/validate absolute per-machine Node/Git/tar paths outside Git; use derived tool directories, deterministic working directory and safe persisted results. Same parent task must be re-registered and actual scheduled exit0 verified. No credentials, child tasks or stable promotion.

0.1.2 actual scheduler acceptance: source artifact9205b3c91d04609351d89299f95fa9aefac88fa4/preview tag pushed,15 tests passed including empty-PATH real Git staging and safe failure-status persistence. Parent preview activated between sessions with config hash unchanged, same plugin identity cache read back0.1.2. Existing task re-registered (no duplicate) with validated local tools and working directory; actual run at2026-10-25T21:41:59.059Z returned LastTaskResult0 and persisted no_approved_release/updater0.1.2. Limited Interactive/current-user daily noon+logon/StartWhenAvailable preserved. No child tasks, reminders, importer schedule or stable promotion. This validates the scheduled checker; real native Voice and future installed-cache refresh after automatic activation remain separate open acceptance.

Approved0.2.0 preview enhancement: real startup gate/profile-history-clock diagnostics, meaning-led advisory steering, one durable closing/save-queue controller, exact session binding/serialized operations/conflict retention/idempotent retries, pause-aware clock and new-day queue preservation. Pending payload/artifacts survive updates and keep generator/start versions; no invented cloud I/O. Add supported same-identity installed-cache refresh and exact-version upgrade entrypoint, preserving existing task timing. Synthetic regression/parent-local checks and actual installed readback required; native Voice and child upgrade remain unverified. Real child records remain read-only and outside Git.

0.2.1 preview follow-up: actual late final handoff can extend the exact same paused/closed transcript without reopening teaching or counting away time. capture_final uses a strict unchanged-prefix/session check, increments archive revision and preserves original clock/start version/artifacts. Added pause→late tail and closed→late tail regression coverage. Child upgrade prompt targets final preview0.2.1.
