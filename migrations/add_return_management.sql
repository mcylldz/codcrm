-- Migration: Add Return Management Fields to Orders
-- Run this in Supabase SQL Editor

-- 1. Add new status to order_status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'iade_donduruldu';

-- 2. Add return cost field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_cost DECIMAL(10, 2) DEFAULT 0.00;

-- 3. Add return_processed flag
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_processed BOOLEAN DEFAULT FALSE;

-- 4. Add return_date tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_date TIMESTAMP WITH TIME ZONE;

-- Note: After running this migration, orders marked as 'iade_donduruldu' will:
-- - Have their revenue excluded from analytics
-- - Keep shipping costs (not refunded)
-- - Have return_cost added to total losses
-- - Have stock restored automatically
