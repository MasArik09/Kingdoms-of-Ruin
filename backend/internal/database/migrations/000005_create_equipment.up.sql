CREATE TABLE IF NOT EXISTS character_equipment (
    id SERIAL PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL,
    owner_id VARCHAR(50) NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    slot_id VARCHAR(30) NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (owner_type, owner_id, slot_id)
);
