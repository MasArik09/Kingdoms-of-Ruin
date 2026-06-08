package equipment

import "time"

type SlotID string

// Enforce shared slot definitions as Go constants to avoid hardcoded string mismatches
const (
	SlotWeapon SlotID = "weapon"
	SlotHelmet SlotID = "helmet"
	SlotChest  SlotID = "chest"
	SlotGloves SlotID = "gloves"
	SlotBoots  SlotID = "boots"
	SlotRing   SlotID = "ring"
)

// SlotIDRegistry defines all valid equipment slots
var SlotIDRegistry = []SlotID{
	SlotWeapon,
	SlotHelmet,
	SlotChest,
	SlotGloves,
	SlotBoots,
	SlotRing,
}

// IsValid checks if the SlotID is a registered, valid equipment slot
func (s SlotID) IsValid() bool {
	for _, validSlot := range SlotIDRegistry {
		if s == validSlot {
			return true
		}
	}
	return false
}


type EquippedItem struct {
	ID        int       `json:"id"`
	OwnerType string    `json:"owner_type"`
	OwnerID   string    `json:"owner_id"`
	SlotID    SlotID    `json:"slot_id"`
	ItemID    string    `json:"item_id"`
	CreatedAt time.Time `json:"created_at"`
}

type EquipRequest struct {
	OwnerType string `json:"owner_type" xml:"owner_type" form:"owner_type"`
	OwnerID   string `json:"owner_id" xml:"owner_id" form:"owner_id"`
	SlotID    SlotID `json:"slot_id" xml:"slot_id" form:"slot_id"`
	ItemID    string `json:"item_id" xml:"item_id" form:"item_id"`
}

type UnequipRequest struct {
	OwnerType string `json:"owner_type" xml:"owner_type" form:"owner_type"`
	OwnerID   string `json:"owner_id" xml:"owner_id" form:"owner_id"`
	SlotID    SlotID `json:"slot_id" xml:"slot_id" form:"slot_id"`
}
