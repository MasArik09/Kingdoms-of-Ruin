package worldstate

import "time"

type WorldState struct {
	ID        int       `json:"id"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UpdateStateRequest struct {
	Key   string `json:"key" xml:"key" form:"key"`
	Value string `json:"value" xml:"value" form:"value"`
}
