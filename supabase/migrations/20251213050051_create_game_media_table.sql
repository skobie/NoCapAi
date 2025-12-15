/*
  # Create Game Media Table

  1. New Tables
    - `game_media`
      - `id` (uuid, primary key) - Unique identifier for each media item
      - `url` (text) - URL of the image or video
      - `type` (text) - Either 'image' or 'video'
      - `is_ai` (boolean) - Whether the media is AI-generated or real
      - `created_at` (timestamptz) - When the media was added
      - `is_active` (boolean) - Whether the media should be shown in the game
  
  2. Security
    - Enable RLS on `game_media` table
    - Add policy for all authenticated users to read game media
  
  3. Indexes
    - Add index on `is_active` for efficient querying of active media
  
  4. Initial Data
    - Populate with diverse set of images for the game
*/

CREATE TABLE IF NOT EXISTS game_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  is_ai boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active game media"
  ON game_media
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_game_media_active ON game_media(is_active);

-- Insert diverse image set for the game
INSERT INTO game_media (url, type, is_ai) VALUES
-- Real images from Pexels
('https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1759530/pexels-photo-1759530.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1181719/pexels-photo-1181719.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1116302/pexels-photo-1116302.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/906107/pexels-photo-906107.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
-- AI-generated looking images (marked as AI for game purposes)
('https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1376930/pexels-photo-1376930.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
-- More real images
('https://images.pexels.com/photos/853168/pexels-photo-853168.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/789822/pexels-photo-789822.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/698479/pexels-photo-698479.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/636342/pexels-photo-636342.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/615344/pexels-photo-615344.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
('https://images.pexels.com/photos/598917/pexels-photo-598917.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', false),
-- More AI-styled images  
('https://images.pexels.com/photos/1368382/pexels-photo-1368382.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1345415/pexels-photo-1345415.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1319839/pexels-photo-1319839.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1308624/pexels-photo-1308624.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1300510/pexels-photo-1300510.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1261820/pexels-photo-1261820.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true),
('https://images.pexels.com/photos/1197132/pexels-photo-1197132.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', true)
ON CONFLICT DO NOTHING;