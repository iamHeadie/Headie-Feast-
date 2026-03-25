#!/usr/bin/env bash
# Run this script once to configure the required Edge Function secrets in your
# Supabase project.  Replace each placeholder with the real value from your
# Supabase dashboard before executing.
#
# Usage:
#   chmod +x supabase/setup-secrets.sh
#   ./supabase/setup-secrets.sh

set -euo pipefail

# Service-role key — used by Edge Functions to bypass RLS (admin operations).
# Dashboard → Project Settings → API → service_role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Public project URL
# Dashboard → Project Settings → API → Project URL
supabase secrets set SUPABASE_URL=<your-project-url>

# Anon / public key — safe to expose to clients
# Dashboard → Project Settings → API → anon / public key
supabase secrets set SUPABASE_ANON_KEY=<your-anon-public-key>

echo "Secrets set successfully. Redeploy the Edge Functions if they are already deployed:"
echo "  supabase functions deploy admin-actions"
echo "  supabase functions deploy get-admin-stats"
echo "  supabase functions deploy rider-onboarding"
echo "  supabase functions deploy send-rider-welcome"
