package character

// CharacterProgress holds the persistent level and experience state of a character.
type CharacterProgress struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Level      int    `json:"level"`
	Experience int    `json:"experience"`
}
