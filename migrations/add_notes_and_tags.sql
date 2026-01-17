-- Add notes and tags columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tags text[];
