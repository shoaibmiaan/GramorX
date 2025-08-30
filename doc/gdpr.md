# GDPR Data Practices

## Data Retention
- User profile and activity data are stored in Supabase while the account remains active.
- Auxiliary logs (focus violations, login history) are purged after **365 days**.
- Uploaded media and practice attempts are retained for 24 months to support progress analytics.
- When a user requests deletion, associated records and authentication accounts are permanently removed within 30 days.

## Consent & Control
- Users can opt in or out of email communications from the profile page.
- Data exports and deletion requests can be triggered from profile settings or via `/api/export` and `/api/account/delete`.
