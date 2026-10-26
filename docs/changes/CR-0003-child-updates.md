# CR-0003 — Repeatable child updates

Document revision: 1
Status: implemented_host_validation_pending
Opened: 2026-10-26
Target release: 0.2.3 preview

Keep child-facing update commands current on every release. Generate the guide from VERSION/release.json during packaging and reject stale copies during verification. Read the updater version from packaged source. Add a wrapper around the existing same-identity upgrader; preserve settings and pending lessons, explicitly opt into previews, and report success only after installed-version/cache verification. Publish a tested preview source tag so exact-version updates can resolve. Today’s real session is the live acceptance test; source tests do not establish Voice acceptance. A recurring parent review may inspect new authorized archives and make evidence-based source improvements without copying private records into Git.

45 local tests passed, including real PowerShell invocation against synthetic installs, installed-version mismatch handling and active/save guard deferral. Package and generated-guide verification passed. The wrapper waits for the child process and reads its explicit exit code/stdout; missing output cannot falsely count as success. Native Voice and child installation remain pending. No real child installation, account connection or live lesson performed in this development checkout.
