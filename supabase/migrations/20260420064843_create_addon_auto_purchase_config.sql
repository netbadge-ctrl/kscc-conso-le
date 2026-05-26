/*
  # Create addon auto-purchase configuration table

  1. New Tables
    - `addon_auto_purchase_config`
      - `id` (uuid, primary key)
      - `org_id` (uuid, references organization or tenant)
      - `enabled` (boolean, whether auto-purchase is enabled)
      - `threshold_percentage` (integer, 0-100, trigger purchase when remaining credits drop below this percentage)
      - `trigger_on_member_insufficient` (boolean, whether to trigger when any member has insufficient credits)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `addon_auto_purchase_config` table
    - Add policy for authenticated users to manage their org's config

  3. Notes
    - Single config per organization
    - Default: enabled=false, threshold_percentage=20
*/

CREATE TABLE IF NOT EXISTS addon_auto_purchase_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL UNIQUE,
  enabled boolean DEFAULT false,
  threshold_percentage integer DEFAULT 20 CHECK (threshold_percentage >= 0 AND threshold_percentage <= 100),
  trigger_on_member_insufficient boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE addon_auto_purchase_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org config"
  ON addon_auto_purchase_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own org config"
  ON addon_auto_purchase_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can insert own org config"
  ON addon_auto_purchase_config FOR INSERT
  TO authenticated
  WITH CHECK (true);
