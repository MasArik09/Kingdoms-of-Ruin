package config

import (
	"os"
)

type Config struct {
	ServerPort  string
	DatabaseURL string
}

func LoadConfig() *Config {
	serverPort := os.Getenv("SERVER_PORT")
	if serverPort == "" {
		serverPort = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:123@localhost:5432/kingdoms_of_ruin?sslmode=disable"
	}

	return &Config{
		ServerPort:  serverPort,
		DatabaseURL: databaseURL,
	}
}
