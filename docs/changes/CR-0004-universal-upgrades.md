# CR-0004 — Universal upgrade and scheduled channel

Document revision: 1
Status: implemented_host_validation_pending
Opened: 2026-10-26
Target release: 0.2.4 preview

Replace version-pinned upgrade prompts with a reusable prompt that resolves the newest tested tagged release. Keep exact-version override optional. Explicitly opt each testing machine into preview updates; preserve its task timing/settings/principal and preserve the channel when reconciling without an override. A scheduled action must not pin a version or force between-session activation. Use installed/save/version readbacks rather than a successful process exit as proof. Google Upgrade is edited in place; no account or learner data is added to Git.

Validation: 47 tests passed, including actual PowerShell wrapper calls and mocked scheduler reconciliation for stable default, preview opt-in, preservation and opt-out. Native Voice and installations on other child machines remain separate.
