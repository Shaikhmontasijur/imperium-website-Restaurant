-- IMPERIUM Restaurant Supabase Schema
-- Phase 1 & 2 Database Setup

-- 1. Orders Table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  order_type text not null check (order_type in ('delivery','pickup')),
  address text,
  zone text,
  items jsonb not null,
  subtotal numeric not null,
  delivery_fee numeric not null default 0,
  total numeric not null,
  payment_method text not null default 'cash',
  status text not null default 'pending' check (status in ('pending','new','confirmed','preparing','out_for_delivery','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_customer_phone on orders(customer_phone, created_at desc);

-- 2. Menu Items Table
create table if not exists menu_items (
  id text primary key,
  category text not null,
  name_en text not null,
  name_ar text,
  description_en text,
  description_ar text,
  price numeric not null,
  image text,
  available boolean not null default true,
  options jsonb,
  sort_order int default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_menu_category on menu_items(category, sort_order);
