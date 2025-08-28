# GDPR Data Practices

## Data Retention
- User profile and activity data are stored in Supabase while the account remains active.
- When a user requests deletion, associated records and authentication accounts are permanently removed.

## Consent
- Users can opt in or out of email communications from the profile page.
- Data exports and deletion requests can be triggered from profile settings or via `/api/account/export` and `/api/account/delete`.
