-- Bariwala – Seed Data
-- Run after schema.sql

-- Passwords are bcrypt hash of 'password123'
INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'landlord@bariwala.com', '$2a$10$CwTycUXWue0Thq9StjUM0u3I1E4G2y5GjMBDeRp6S3YPzuBm0OFMa', 'Rahim Uddin', '01711111111', 'landlord'),
  ('b2222222-2222-2222-2222-222222222222', 'tenant@bariwala.com',   '$2a$10$CwTycUXWue0Thq9StjUM0u3I1E4G2y5GjMBDeRp6S3YPzuBm0OFMa', 'Karim Hossain', '01722222222', 'tenant'),
  ('c3333333-3333-3333-3333-333333333333', 'seller@bariwala.com',   '$2a$10$CwTycUXWue0Thq9StjUM0u3I1E4G2y5GjMBDeRp6S3YPzuBm0OFMa', 'Fatema Akter', '01733333333', 'buyer_seller'),
  ('d4444444-4444-4444-4444-444444444444', 'admin@bariwala.com',    '$2a$10$CwTycUXWue0Thq9StjUM0u3I1E4G2y5GjMBDeRp6S3YPzuBm0OFMa', 'Admin User', '01744444444', 'admin');

INSERT INTO properties (landlord_id, title, description, address, city, rent_amount, bedrooms, bathrooms, area_sqft, property_type, image_urls, advance_deposit, map_latitude, map_longitude, distance_from_road, facilities) VALUES
  ('a1111111-1111-1111-1111-111111111111', '3 BHK Flat in Gulshan',      'Spacious 3-bedroom flat with modern amenities.', 'Road 35, Gulshan 2', 'Dhaka',        35000, 3, 2, 1800, 'flat', ARRAY['https://placehold.co/600x400?text=Gulshan+Flat'], 70000, 23.7925, 90.4078, '50m', ARRAY['WiFi','Parking','Generator','Lift','Gas']),
  ('a1111111-1111-1111-1111-111111111111', 'Studio Room in Banani',  'Cozy furnished room for singles or couples.',       'Road 11, Banani',    'Dhaka',        15000, 1, 1, 500,  'room',      ARRAY['https://placehold.co/600x400?text=Banani+Room'], 30000, 23.7935, 90.4025, '20m', ARRAY['WiFi','Guard','Water Supply']),
  ('a1111111-1111-1111-1111-111111111111', 'Sublet in Motijheel', 'Shared living in the business district.',      'DIT Road, Motijheel','Dhaka',        8000, 1, 1, 300, 'sublet',    ARRAY['https://placehold.co/600x400?text=Sublet+Space'], 16000, 23.7330, 90.4180, '100m', ARRAY['WiFi','Kitchen Access']);

INSERT INTO marketplace_items (seller_id, title, description, price, category, condition, city, image_urls) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'Samsung Galaxy S24',       'Almost new, 6 months used.',    65000, 'electronics', 'like_new', 'Dhaka',       ARRAY['https://placehold.co/600x400?text=Samsung+S24']),
  ('c3333333-3333-3333-3333-333333333333', 'Wooden Dining Table',      '6-seater, solid wood.',         12000, 'furniture',   'used',     'Dhaka',       ARRAY['https://placehold.co/600x400?text=Dining+Table']),
  ('c3333333-3333-3333-3333-333333333333', 'Honda CB Hornet 160R',     '2022 model, 8000 km driven.',  185000, 'vehicles',    'used',     'Chittagong',  ARRAY['https://placehold.co/600x400?text=Honda+CB']);
