# CR-0002 — Lesson progression and reviewable archives

Document revision: 1
Status: implemented_host_validation_pending
Opened: 2026-10-25
Target release: 0.2.2 preview candidate

## Problem and plan

Reviewed sessions revealed repetitive sentence rehearsal and an archive with almost no coach text and an empty summary. Historical version labels do not prove which instructions governed live Voice. Keep actual learner records outside Git; use synthetic regressions only.

1. Preserve all supplied text while separately flagging capture gaps, missing summaries and unknown rule revisions. Suppress participation ratios when capture is limited.
2. Expose sanitized startup host evidence separately from local tracking and storage verification. Do not claim native Voice control or reconstruct unavailable speech.
3. Advance what-next requests and repeated correction loops toward meaningful discussion; allow unfinished supplied thoughts to continue.
4. Test archive preservation, advisory behavior, receipt compatibility and timing; verify and package the candidate.
5. Run the manual native Voice acceptance procedure before stable promotion or child rollout.

## Acceptance

A learner-only/imbalanced archive is still preserved and visibly limited. Missing summary is visible. Storage verification cannot remove quality warnings. Host observations are labelled reported, not verified. What-next cues advance; clear stop takes precedence. No production records, folders, sharing or account settings are changed. Pending old artifacts retain original bytes and generator versions.

## Validation

42 local tests passed, including preservation of limited archives through receipt verification, summary flags and immutable summary-only correction, host-evidence sanitization, stop precedence and progression. Package verification passed. npm is unavailable on PATH; the exact package-script Node commands were executed directly. Manual host acceptance remains pending; see docs/voice-acceptance.md. No real Voice lesson is simulated by unit tests.
