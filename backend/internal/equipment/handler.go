package equipment

import (
	"context"
	"time"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) GetEquipment(c *fiber.Ctx) error {
	ownerType := c.Query("owner_type", "player")
	ownerID := c.Query("owner_id", "player_default")

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	equipMap, err := h.repo.GetEquipment(ctx, ownerType, ownerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(equipMap)
}

func (h *Handler) EquipItem(c *fiber.Ctx) error {
	var req EquipRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "failed to parse request body",
		})
	}

	if req.OwnerType == "" {
		req.OwnerType = "player"
	}
	if req.OwnerID == "" {
		req.OwnerID = "player_default"
	}
	if req.SlotID == "" || req.ItemID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "slot_id and item_id are required",
		})
	}

	if !req.SlotID.IsValid() {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid slot_id",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := h.repo.EquipItem(ctx, req.OwnerType, req.OwnerID, req.SlotID, req.ItemID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"slot":   req.SlotID,
		"item":   req.ItemID,
	})
}

func (h *Handler) UnequipItem(c *fiber.Ctx) error {
	var req UnequipRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "failed to parse request body",
		})
	}

	if req.OwnerType == "" {
		req.OwnerType = "player"
	}
	if req.OwnerID == "" {
		req.OwnerID = "player_default"
	}
	if req.SlotID == "" || !req.SlotID.IsValid() {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid or missing slot_id",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := h.repo.UnequipItem(ctx, req.OwnerType, req.OwnerID, req.SlotID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"slot":   req.SlotID,
	})
}
