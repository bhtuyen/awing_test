CREATE TABLE IF NOT EXISTS pirate_treasures (
  pirate_treasure_id char(36) PRIMARY KEY,
  pirate_treasure_name nvarchar(255) NOT NULL,
  map_rows int NOT NULL CHECK (1 <= map_rows AND map_rows <= 500),
  map_columns int NOT NULL CHECK (1 <= map_columns AND map_columns <= 500),
  treasure_chest_number int NOT NULL CHECK (1 <= treasure_chest_number AND treasure_chest_number <= 250000),
  map_data json NOT NULL,
  optimal_path json NOT NULL,
  created_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pirate_treasure_name (pirate_treasure_name)
);