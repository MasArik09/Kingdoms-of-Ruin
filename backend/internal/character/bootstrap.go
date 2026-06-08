package character

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// BootstrapDefaultCharacter handles creating the default player character
// and seeding their starter equipment if it's a new character.
func BootstrapDefaultCharacter(ctx context.Context, pool *pgxpool.Pool) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start bootstrap transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Check if the default character already exists
	var exists bool
	err = tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM characters WHERE id = 'player_default')").Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check default character existence: %w", err)
	}

	if !exists {
		log.Println("Bootstrapping default character: player_default...")

		// Insert character
		_, err = tx.Exec(ctx, `
			INSERT INTO characters (id, name, level, experience)
			VALUES ('player_default', 'Hero', 1, 0)
		`)
		if err != nil {
			return fmt.Errorf("failed to insert default character: %w", err)
		}

		// Seed starter equipment into inventory_items
		starterItems := []struct {
			itemID   string
			quantity int
		}{
			{"rusty_sword", 1},
			{"traveler_hood", 1},
			{"worn_leather_armor", 1},
			{"old_boots", 1},
		}

		for _, item := range starterItems {
			_, err = tx.Exec(ctx, `
				INSERT INTO inventory_items (owner_type, owner_id, item_id, quantity)
				VALUES ('player', 'player_default', $1, $2)
				ON CONFLICT (owner_type, owner_id, item_id) DO NOTHING
			`, item.itemID, item.quantity)
			if err != nil {
				return fmt.Errorf("failed to seed starter item %s: %w", item.itemID, err)
			}
		}

		log.Println("Character player_default bootstrapped with starter equipment successfully.")
	}

	return tx.Commit(ctx)
}
