-- Run this in Supabase SQL editor

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT CHECK (role IN ('employee', 'manager', 'admin')) DEFAULT 'employee',
  department  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  total_qty   INT NOT NULL DEFAULT 0,
  available   INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID REFERENCES users(id),
  asset_id      UUID REFERENCES assets(id),
  status        TEXT CHECK (status IN ('pending','approved','rejected','returned')) DEFAULT 'pending',
  reason        TEXT,
  requested_at  TIMESTAMPTZ DEFAULT now(),
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES users(id)
);

CREATE TABLE allocations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    UUID REFERENCES requests(id),
  employee_id   UUID REFERENCES users(id),
  asset_id      UUID REFERENCES assets(id),
  allocated_at  TIMESTAMPTZ DEFAULT now(),
  returned_at   TIMESTAMPTZ
);

-- Seed sample users
INSERT INTO users (name, email, role, department) VALUES
  ('Alice Manager', 'alice@company.com', 'manager', 'Engineering'),
  ('Bob Employee', 'bob@company.com', 'employee', 'Engineering'),
  ('Carol Admin', 'carol@company.com', 'admin', 'IT'),
  ('Dave Employee', 'dave@company.com', 'employee', 'Marketing');

-- Seed sample assets (supplement with DummyJSON / Kaggle CSV)
INSERT INTO assets (name, category, total_qty, available) VALUES
  ('MacBook Pro 14"', 'hardware', 10, 7),
  ('Dell Monitor 27"', 'hardware', 20, 14),
  ('Logitech MX Keys', 'hardware', 30, 22),
  ('Adobe Creative Cloud', 'software', 15, 10),
  ('GitHub Copilot License', 'software', 50, 38),
  ('Slack Pro Seat', 'software', 100, 71),
  ('USB-C Hub', 'hardware', 25, 19),
  ('Jabra Headset', 'hardware', 20, 13);