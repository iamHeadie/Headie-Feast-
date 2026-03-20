-- Add push notification fields to the profiles table.
-- push_permission: stores the browser permission status ('granted' | 'denied' | null)
-- push_subscription: stores the serialised PushSubscription JSON so the server
--                    can send targeted Web Push messages via VAPID.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS push_permission  text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS push_subscription jsonb   DEFAULT NULL;
