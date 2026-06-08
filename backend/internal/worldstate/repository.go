package worldstate

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	GetState(ctx context.Context, key string) (string, error)
	SetState(ctx context.Context, key string, value string) error
	GetAllStates(ctx context.Context) (map[string]string, error)
}

type repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) GetState(ctx context.Context, key string) (string, error) {
	var val string
	err := r.db.QueryRow(ctx, "SELECT value FROM world_states WHERE key = $1", key).Scan(&val)
	if err != nil {
		return "", err
	}
	return val, nil
}

func (r *repository) SetState(ctx context.Context, key string, value string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO world_states (key, value, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (key) DO UPDATE
		SET value = EXCLUDED.value, updated_at = NOW()
	`, key, value)
	return err
}

func (r *repository) GetAllStates(ctx context.Context) (map[string]string, error) {
	rows, err := r.db.Query(ctx, "SELECT key, value FROM world_states")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	states := make(map[string]string)
	for rows.Next() {
		var key, val string
		if err := rows.Scan(&key, &val); err != nil {
			return nil, err
		}
		states[key] = val
	}
	return states, nil
}
