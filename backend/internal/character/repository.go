package character

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

// GetProgress fetches the character's level and experience.
func (r *Repository) GetProgress(ctx context.Context, id string) (*CharacterProgress, error) {
	query := `
		SELECT id, name, level, experience
		FROM characters
		WHERE id = $1
	`
	var progress CharacterProgress
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&progress.ID,
		&progress.Name,
		&progress.Level,
		&progress.Experience,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get character progress: %w", err)
	}
	return &progress, nil
}

// UpdateProgress updates the character's level and experience.
func (r *Repository) UpdateProgress(ctx context.Context, id string, level int, experience int) error {
	query := `
		UPDATE characters
		SET level = $1, experience = $2, updated_at = NOW()
		WHERE id = $3
	`
	cmd, err := r.pool.Exec(ctx, query, level, experience, id)
	if err != nil {
		return fmt.Errorf("failed to update character progress: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("no character found with ID: %s", id)
	}
	return nil
}
