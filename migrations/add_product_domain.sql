-- Migration: Add Domain to Products Table
-- Run this in Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS domain text;
