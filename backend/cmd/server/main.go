package main

import (
	"context"
	"log"
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/inventory"
	"backend/internal/worldstate"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	log.Println("Starting Kingdoms of Ruin Backend Server...")

	// 1. Load configuration
	cfg := config.LoadConfig()

	// 2. Connect to database and run migrations
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.Close()

	// 3. Setup Fiber Application
	app := fiber.New(fiber.Config{
		AppName: "Kingdoms of Ruin API v1.0",
	})

	// Setup Inventory Core
	invRepo := inventory.NewRepository(db.Pool)
	invHandler := inventory.NewHandler(invRepo)

	// Setup World State Core
	wsRepo := worldstate.NewRepository(db.Pool)
	wsHandler := worldstate.NewHandler(wsRepo)

	// 4. Register middlewares
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, OPTIONS",
	}))

	// 5. Register Health Endpoint
	app.Get("/api/health", func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		// Query database using pgx/v5 connection pool to verify it's responsive and migrations worked
		var note string
		err := db.Pool.QueryRow(ctx, "SELECT notes FROM migration_verifications ORDER BY id LIMIT 1").Scan(&note)
		if err != nil {
			log.Printf("Health check DB query error: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":    "error",
				"database":  "disconnected",
				"error_msg": err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":          "ok",
			"database":        "connected",
			"migration_check": note,
		})
	})

	// Register Inventory Endpoints
	app.Get("/api/inventory", invHandler.GetInventory)
	app.Post("/api/inventory/add", invHandler.AddOrUpdateItem)

	// Register World State Endpoints
	app.Get("/api/worldstate", wsHandler.GetState)
	app.Post("/api/worldstate/set", wsHandler.SetState)

	// 6. Start server listening
	log.Printf("Server listening on port %s", cfg.ServerPort)
	if err := app.Listen(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
