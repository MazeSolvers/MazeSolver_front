package main

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)
var mutex = &sync.Mutex{}
var matrix = make(map[string]bool)

type Message struct {
	X      float64 `json:"x"`
	Z      float64 `json:"z"`
	GridX  int     `json:"gridX"`
	GridZ  int     `json:"gridZ"`
}

func main() {
	absPath, _ := filepath.Abs("../")
	log.Printf("Serving files from: %s\n", absPath)
	fs := http.FileServer(http.Dir(absPath))
	http.Handle("/", fs)
	http.HandleFunc("/ws", handleConnections)

	go handleMessages()

	log.Println("HTTP server started on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	mutex.Lock()
	clients[ws] = true
	mutex.Unlock()

	log.Printf("Client connected: %v", ws.RemoteAddr())

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			mutex.Lock()
			delete(clients, ws)
			mutex.Unlock()
			break
		}
		log.Printf("Received message: %+v", msg)
		handleBlockPlacement(msg)
	}
	log.Printf("Client disconnected: %v", ws.RemoteAddr())
}

func handleMessages() {
	for {
		msg := <-broadcast
		log.Printf("Broadcasting message: %+v", msg)
		mutex.Lock()
		for client := range clients {
			go func(client *websocket.Conn) {
				err := client.WriteJSON(msg)
				if err != nil {
					log.Printf("error: %v", err)
					client.Close()
					mutex.Lock()
					delete(clients, client)
					mutex.Unlock()
				}
			}(client)
		}
		mutex.Unlock()
	}
}

func handleBlockPlacement(msg Message) {
	mutex.Lock()
	defer mutex.Unlock()

	log.Printf("Handling block placement for message: %+v", msg)

	key := fmt.Sprintf("%d:%d", msg.GridX, msg.GridZ)
	if _, exists := matrix[key]; !exists {
		matrix[key] = true
		broadcast <- msg
		log.Printf("Wall added at (%d, %d) - Coordinates: (%f, %f)", msg.GridX, msg.GridZ, msg.X, msg.Z)
	} else {
		log.Printf("Block already exists at (%d, %d)", msg.GridX, msg.GridZ)
	}
}
