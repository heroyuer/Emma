# Emma change discipline

Preserve the separate Z English Coach repo/Site/data. This repo contains no Sites runtime or custom MCP server. Never copy learner records, credentials, enrollment codes, real account identities or runtime folder settings into Git.

Every change requires a CR with revision/status, index entry and CHANGELOG in the same batch. Package changes bump VERSION, package.json and plugin manifests together. Run npm test and npm run verify; package only plugin/. Source/package creation is not cloud installation, native Voice acceptance or verified Drive saving. Record those checkpoints separately in docs/releases.json. Do not tag an untested candidate as a shipped cloud release.

The parent dashboard and schedules are separate decisions: do not create automation, migrate stored records, change sharing or provision a dashboard here. No deleted Drive folders/IDs may be restored or reused. Runtime setup requires a newly designated folder and each learner's own Drive connection. No direct sharing of this repo grants account plugin or Drive access.
