package inventory

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) GetInventory(c *fiber.Ctx) error {
	ownerType := c.Query("owner_type", "player")
	ownerID := c.Query("owner_id", "player_default")

	items, err := h.repo.GetInventory(c.Context(), ownerType, ownerID)
	if err != nil {
		log.Printf("Error fetching inventory: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch inventory",
		})
	}

	// Ensure we return an empty array [] instead of null if inventory is empty
	if items == nil {
		items = []InventoryItem{}
	}

	return c.Status(fiber.StatusOK).JSON(items)
}

func (h *Handler) AddOrUpdateItem(c *fiber.Ctx) error {
	var req AddItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if req.OwnerType == "" {
		req.OwnerType = "player"
	}
	if req.OwnerID == "" {
		req.OwnerID = "player_default"
	}
	if req.ItemID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "item_id is required",
		})
	}
	if req.Quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "quantity must be greater than zero",
		})
	}

	item, err := h.repo.AddOrUpdateItem(c.Context(), req.OwnerType, req.OwnerID, req.ItemID, req.Quantity)
	if err != nil {
		log.Printf("Error adding item to inventory: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update inventory",
		})
	}

	return c.Status(fiber.StatusOK).JSON(item)
}
