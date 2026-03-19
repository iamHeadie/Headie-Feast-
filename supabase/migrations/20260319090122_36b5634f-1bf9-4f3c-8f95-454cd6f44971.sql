
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_delivery_address jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_completed_tour boolean NOT NULL DEFAULT false;

ALTER TABLE public.order_history
  ADD COLUMN IF NOT EXISTS driver_location jsonb DEFAULT NULL;
