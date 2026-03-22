-- =============================================================
-- Seed data: development fixtures
-- Run after migration: npm run db:seed
-- =============================================================

-- Users (3 sample users)
INSERT INTO users (id, google_id, email, name, avatar_url) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'google_alice_001', 'alice@example.com', 'Alice Johnson', 'https://i.pravatar.cc/150?u=alice'),
  ('a1000000-0000-0000-0000-000000000002', 'google_bob_002',   'bob@example.com',   'Bob Smith',     'https://i.pravatar.cc/150?u=bob'),
  ('a1000000-0000-0000-0000-000000000003', 'google_carol_003', 'carol@example.com', 'Carol White',   'https://i.pravatar.cc/150?u=carol')
ON CONFLICT DO NOTHING;

-- Events (4 sample events)
INSERT INTO events (id, slug, title, description, event_date, event_time, creator_id) VALUES
  (
    'e2000000-0000-0000-0000-000000000001',
    'team-picnic-2026',
    'Team Picnic 2026',
    'Annual team picnic in Central Park. Bring a blanket and your appetite!',
    '2026-06-15', '12:00:00',
    'a1000000-0000-0000-0000-000000000001'
  ),
  (
    'e2000000-0000-0000-0000-000000000002',
    'product-launch-q3',
    'Q3 Product Launch',
    'Join us for the live reveal of our Q3 product line.',
    '2026-07-20', '18:00:00',
    'a1000000-0000-0000-0000-000000000002'
  ),
  (
    'e2000000-0000-0000-0000-000000000003',
    'hackathon-august',
    'August Hackathon',
    '48-hour hackathon — build anything, win prizes.',
    '2026-08-01', '09:00:00',
    'a1000000-0000-0000-0000-000000000001'
  ),
  (
    'e2000000-0000-0000-0000-000000000004',
    'year-end-party',
    'Year-End Party',
    'Celebrate the year with food, music, and good company.',
    '2026-12-20', '19:30:00',
    'a1000000-0000-0000-0000-000000000003'
  )
ON CONFLICT DO NOTHING;

-- RSVPs (6 sample RSVPs)
INSERT INTO rsvps (event_id, name, email, status) VALUES
  ('e2000000-0000-0000-0000-000000000001', 'Bob Smith',     'bob@example.com',       'yes'),
  ('e2000000-0000-0000-0000-000000000001', 'Carol White',   'carol@example.com',     'tentative'),
  ('e2000000-0000-0000-0000-000000000002', 'Alice Johnson', 'alice@example.com',     'yes'),
  ('e2000000-0000-0000-0000-000000000002', 'Dave Brown',    'dave@example.com',      'no'),
  ('e2000000-0000-0000-0000-000000000003', 'Carol White',   'carol@example.com',     'yes'),
  ('e2000000-0000-0000-0000-000000000004', 'Bob Smith',     'bob@example.com',       'yes')
ON CONFLICT DO NOTHING;
