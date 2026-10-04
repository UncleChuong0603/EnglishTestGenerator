# Deferred security and operational debt

This register is deliberately separate from completed task reports. Do not mark an
item complete from repository changes alone when provider or infrastructure action
is required.

| Item | State | Required owner action | Completion evidence |
| --- | --- | --- | --- |
| Google provider secret rotation | Open | Revoke/reissue in Google Cloud, update Dokploy without sharing the value, redeploy | Old credential rejected; Google login succeeds with the new credential |
| payOS provider secret rotation | Open | Revoke/reissue API/checksum credentials at payOS, update Dokploy, redeploy | Old credentials rejected; provider-authenticated sandbox/approved verification succeeds |
| Legacy Cloudflare R2 key | Open | Revoke the unused R2 key and remove stale Dokploy variables | Provider confirms revocation and safe status no longer lists the names |
| Git-history artifact cleanup | Open | Agree branch/tag/fork/cache scope, rotate every exposed credential first, then coordinate the history rewrite | Hosting scan and fresh clone no longer contain the historical build artifact |
| Migration `0017` historical drift | Accepted, monitored | Never rewrite the production ledger or historical SQL. Keep the exception exact to `0017_question_bank_import`; investigate any second mismatch | Production audit reports only `0017` and the latest migration is applied |
| Encrypted off-VPS backups | Open | Provision a separate encrypted object store or backup host, retention policy and restore credentials | Recent DB and media copies exist off-host and an isolated restore from that copy passes |
| Alert delivery | Open | Choose an owner-controlled channel for nonzero ops-health results | Forced test alert is received and acknowledged |

See `docs/task36b-security-closeout.md` for the original exposure scope. Never put
credential values, hashes, encoded environment payloads or unreviewed production
logs in Git, chat or tickets.
