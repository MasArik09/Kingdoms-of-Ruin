CREATE TABLE IF NOT EXISTS migration_verifications (
    id SERIAL PRIMARY KEY,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

INSERT INTO migration_verifications (notes) VALUES ('Phase 0A migration successfully executed');
