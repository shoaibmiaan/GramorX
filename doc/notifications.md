# Notifications

This guide covers the data model and flow for the in-app notification system.

## Table schema

```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/notifications` | List notifications for the current user |
| `POST` | `/api/notifications` | Create a new notification |
| `PATCH` | `/api/notifications/:id` | Mark a notification as read |

## Context usage

`NotificationProvider` wraps the app and exposes a `useNotifications()` hook. The
provider loads the user's notifications on mount and subscribes to Supabase
realtime changes. Components like `NotificationBell` consume the hook to display
counts and messages.

## UI flow

1. User signs in and the provider fetches unread notifications.
2. The bell icon shows the unread count.
3. Clicking the bell reveals a dropdown with recent notifications.
4. Selecting a notification marks it as read and navigates if a link is present.

## Seed sample notifications

```sql
-- replace with a real user id
insert into notifications (user_id, title, body)
values ('00000000-0000-0000-0000-000000000000', 'Welcome', 'Thanks for joining!');
```
Run the snippet in the Supabase SQL editor or via `psql` to create a sample
notification.

## Test realtime updates

1. Start the dev server: `npm run dev`.
2. Open two browser windows signed in as the same user.
3. Insert a notification using the SQL above.
4. Both windows should receive the new notification instantly via realtime.
