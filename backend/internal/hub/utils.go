package hub

import (
	"math/rand"
	"strings"
	"time"
)

var letters = []rune("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") // no O, I, 1, 0 for clarity

// Create a local rand.Rand instance seeded once
var src = rand.New(rand.NewSource(time.Now().UnixNano()))

func GenerateCanvasCode(length int) string {
	var sb strings.Builder
	for range length {
		sb.WriteRune(letters[src.Intn(len(letters))])
	}
	return sb.String()
}