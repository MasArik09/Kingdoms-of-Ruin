package worldstate

import (
	"context"
	"time"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) GetState(c *fiber.Ctx) error {
	key := c.Query("key")
	if key == "" {
		// Get all states
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		states, err := h.repo.GetAllStates(ctx)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.JSON(states)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	val, err := h.repo.GetState(ctx, key)
	if err != nil {
		// Return empty value on miss so client doesn't need to check 404
		return c.JSON(fiber.Map{
			"key":   key,
			"value": "",
		})
	}

	return c.JSON(fiber.Map{
		"key":   key,
		"value": val,
	})
}

func (h *Handler) SetState(c *fiber.Ctx) error {
	var req UpdateStateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	if req.Key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Key is required",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := h.repo.SetState(ctx, req.Key, req.Value); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"key":    req.Key,
		"value":  req.Value,
	})
}
