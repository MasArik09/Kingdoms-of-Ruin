package inventory

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

func (r *Repository) GetInventory(ctx context.Context, ownerType, ownerID string) ([]InventoryItem, error) {
	query := `
		SELECT id, owner_type, owner_id, item_id, quantity, created_at, updated_at
		FROM inventory_items
		WHERE owner_type = $1 AND owner_id = $2
	`
	rows, err := r.pool.Query(ctx, query, ownerType, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to query inventory: %w", err)
	}
	defer rows.Close()

	var items []InventoryItem
	for rows.Next() {
		var item InventoryItem
		err := rows.Scan(
			&item.ID,
			&item.OwnerType,
			&item.OwnerID,
			&item.ItemID,
			&item.Quantity,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan inventory row: %w", err)
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading inventory rows: %w", err)
	}

	return items, nil
}

func (r *Repository) AddOrUpdateItem(ctx context.Context, ownerType, ownerID, itemID string, quantity int) (*InventoryItem, error) {
	query := `
		INSERT INTO inventory_items (owner_type, owner_id, item_id, quantity)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (owner_type, owner_id, item_id)
		DO UPDATE SET 
			quantity = inventory_items.quantity + EXCLUDED.quantity,
			updated_at = CURRENT_TIMESTAMP
		RETURNING id, owner_type, owner_id, item_id, quantity, created_at, updated_at
	`
	var item InventoryItem
	err := r.pool.QueryRow(ctx, query, ownerType, ownerID, itemID, quantity).Scan(
		&item.ID,
		&item.OwnerType,
		&item.OwnerID,
		&item.ItemID,
		&item.Quantity,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert inventory item: %w", err)
	}

	return &item, nil
}
