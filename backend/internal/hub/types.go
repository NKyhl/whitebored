package hub

// Point represents a coordinate on a canvas.
type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// Stroke represents a single stroke drawn on a canvas.
type Stroke struct {
	From  Point  `json:"from"`
	To    Point  `json:"to"`
	Color string `json:"color"`
	Width int    `json:"width"`
}

// StrokeMessage represents a message containing stroke data.
type StrokeMessage struct {
	Type   string `json:"type"` // "stroke"
	Stroke Stroke `json:"stroke"`
}

// Client represents a connected user.
type Client struct {
	ID     string
	Send   chan []byte
	Canvas string
}

// Canvas holds the clients connected and the strokes drawn.
type Canvas struct {
	Clients map[string]*Client
	Strokes []Stroke
}