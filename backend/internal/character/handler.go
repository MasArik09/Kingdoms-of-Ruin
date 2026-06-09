package character

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

// GetProgress returns the character progress.
// GET /api/character/progress?owner_id=player_default
func (h *Handler) GetProgress(c *fiber.Ctx) error {
	ownerID := c.Query("owner_id", "player_default")

	progress, err := h.repo.GetProgress(c.UserContext(), ownerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(progress)
}

type UpdateProgressRequest struct {
	OwnerID    string `json:"owner_id"`
	Level      int    `json:"level"`
	Experience int    `json:"experience"`
}

// UpdateProgress updates the character level and experience.
// POST /api/character/progress
func (h *Handler) UpdateProgress(c *fiber.Ctx) error {
	var req UpdateProgressRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "failed to parse request body: " + err.Error(),
		})
	}

	if req.OwnerID == "" {
		req.OwnerID = "player_default"
	}
	if req.Level <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "level must be greater than 0",
		})
	}

	err := h.repo.UpdateProgress(c.UserContext(), req.OwnerID, req.Level, req.Experience)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message":    "Character progress updated successfully",
		"level":      req.Level,
		"experience": req.Experience,
	})
}
