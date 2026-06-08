package equipment

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

func (r *Repository) GetEquipment(ctx context.Context, ownerType, ownerID string) (map[string]string, error) {
	query := `
		SELECT slot_id, item_id
		FROM character_equipment
		WHERE owner_type = $1 AND owner_id = $2
	`
	rows, err := r.pool.Query(ctx, query, ownerType, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to query equipment: %w", err)
	}
	defer rows.Close()

	equipMap := make(map[string]string)
	// Initialize default keys so the client always gets a structured map
	equipMap[string(SlotWeapon)] = ""
	equipMap[string(SlotHelmet)] = ""
	equipMap[string(SlotChest)] = ""
	equipMap[string(SlotGloves)] = ""
	equipMap[string(SlotBoots)] = ""
	equipMap[string(SlotRing)] = ""

	for rows.Next() {
		var slot, item string
		if err := rows.Scan(&slot, &item); err != nil {
			return nil, fmt.Errorf("failed to scan equipment row: %w", err)
		}
		equipMap[slot] = item
	}
	return equipMap, nil
}

func (r *Repository) EquipItem(ctx context.Context, ownerType, ownerID string, slotID SlotID, itemID string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Verify item is in inventory
	var invQty int
	err = tx.QueryRow(ctx, `
		SELECT quantity FROM inventory_items 
		WHERE owner_type = $1 AND owner_id = $2 AND item_id = $3
	`, ownerType, ownerID, itemID).Scan(&invQty)
	if err != nil {
		return fmt.Errorf("item not found in inventory: %w", err)
	}
	if invQty < 1 {
		return fmt.Errorf("item quantity is 0")
	}

	// 2. Decrement inventory
	if invQty == 1 {
		_, err = tx.Exec(ctx, `
			DELETE FROM inventory_items 
			WHERE owner_type = $1 AND owner_id = $2 AND item_id = $3
		`, ownerType, ownerID, itemID)
	} else {
		_, err = tx.Exec(ctx, `
			UPDATE inventory_items SET quantity = quantity - 1, updated_at = CURRENT_TIMESTAMP
			WHERE owner_type = $1 AND owner_id = $2 AND item_id = $3
		`, ownerType, ownerID, itemID)
	}
	if err != nil {
		return fmt.Errorf("failed to decrement inventory: %w", err)
	}

	// 3. Check if an item is already equipped in this slot
	var oldItemID string
	err = tx.QueryRow(ctx, `
		SELECT item_id FROM character_equipment 
		WHERE owner_type = $1 AND owner_id = $2 AND slot_id = $3
	`, ownerType, ownerID, string(slotID)).Scan(&oldItemID)
	
	hasOldItem := err == nil

	// 4. Return old item to inventory
	if hasOldItem && oldItemID != "" {
		_, err = tx.Exec(ctx, `
			INSERT INTO inventory_items (owner_type, owner_id, item_id, quantity)
			VALUES ($1, $2, $3, 1)
			ON CONFLICT (owner_type, owner_id, item_id)
			DO UPDATE SET quantity = inventory_items.quantity + 1, updated_at = CURRENT_TIMESTAMP
		`, ownerType, ownerID, oldItemID)
		if err != nil {
			return fmt.Errorf("failed to return old item to inventory: %w", err)
		}
	}

	// 5. Set new item equipped
	_, err = tx.Exec(ctx, `
		INSERT INTO character_equipment (owner_type, owner_id, slot_id, item_id)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (owner_type, owner_id, slot_id)
		DO UPDATE SET item_id = EXCLUDED.item_id
	`, ownerType, ownerID, string(slotID), itemID)
	if err != nil {
		return fmt.Errorf("failed to insert equipped item: %w", err)
	}

	return tx.Commit(ctx)
}

func (r *Repository) UnequipItem(ctx context.Context, ownerType, ownerID string, slotID SlotID) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Get equipped item ID
	var itemID string
	err = tx.QueryRow(ctx, `
		SELECT item_id FROM character_equipment 
		WHERE owner_type = $1 AND owner_id = $2 AND slot_id = $3
	`, ownerType, ownerID, string(slotID)).Scan(&itemID)
	if err != nil {
		return fmt.Errorf("no item equipped in this slot")
	}

	// 2. Remove from equipment
	_, err = tx.Exec(ctx, `
		DELETE FROM character_equipment 
		WHERE owner_type = $1 AND owner_id = $2 AND slot_id = $3
	`, ownerType, ownerID, string(slotID))
	if err != nil {
		return fmt.Errorf("failed to delete equipment: %w", err)
	}

	// 3. Return to inventory
	_, err = tx.Exec(ctx, `
		INSERT INTO inventory_items (owner_type, owner_id, item_id, quantity)
		VALUES ($1, $2, $3, 1)
		ON CONFLICT (owner_type, owner_id, item_id)
		DO UPDATE SET quantity = inventory_items.quantity + 1, updated_at = CURRENT_TIMESTAMP
	`, ownerType, ownerID, itemID)
	if err != nil {
		return fmt.Errorf("failed to return item to inventory: %w", err)
	}

	return tx.Commit(ctx)
}
