package inventory

import "time"

type InventoryItem struct {
	ID        int       `json:"id"`
	OwnerType string    `json:"owner_type"`
	OwnerID   string    `json:"owner_id"`
	ItemID    string    `json:"item_id"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type AddItemRequest struct {
	OwnerType string `json:"owner_type" xml:"owner_type" form:"owner_type"`
	OwnerID   string `json:"owner_id" xml:"owner_id" form:"owner_id"`
	ItemID    string `json:"item_id" xml:"item_id" form:"item_id"`
	Quantity  int    `json:"quantity" xml:"quantity" form:"quantity"`
}
