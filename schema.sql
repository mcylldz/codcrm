-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  stock int default 0,
  cost decimal(10, 2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Orders Table
create type order_status as enum ('teyit_bekleniyor', 'ulasilamadi', 'teyit_alindi', 'kabul_etmedi');

create table orders (
  id uuid default uuid_generate_v4() primary key,
  name text,
  surname text,
  phone text,
  address text,
  city text,
  district text,
  product text,
  package_id int,
  payment_method text,
  order_timestamp timestamp with time zone,
  ab_test_variation text,
  order_source text,
  total_price decimal(10, 2),
  base_price decimal(10, 2),
  shipping_cost decimal(10, 2),
  payment_status text,
  status order_status default 'teyit_bekleniyor',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Suppliers Table
create table suppliers (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  contact_name text,
  contact_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Supplier Products (Many-to-Many)
create table supplier_products (
  supplier_id uuid references suppliers(id),
  product_id uuid references products(id),
  primary key (supplier_id, product_id)
);

-- 5. Purchases Table
create type purchase_status as enum ('yolda', 'stoga_girdi');

create table purchases (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references suppliers(id),
  product_id uuid references products(id),
  amount int not null,
  price decimal(10, 2),
  date timestamp with time zone default timezone('utc'::text, now()),
  status purchase_status default 'yolda',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Webhook Sources Table (NEW)
create table webhook_sources (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  product_id uuid references products(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table orders enable row level security;
alter table products enable row level security;
alter table suppliers enable row level security;
alter table purchases enable row level security;
alter table webhook_sources enable row level security;
