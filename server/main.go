package main

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)
var matrix = make(map[string]bool)
var maze = NewCheckMaze(51) // 미로 크기를 설정
var placementQueue = make(chan Message)

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
	go processPlacements()

	log.Println("HTTP server started on :3000")
	err := http.ListenAndServe(":3000", nil)
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

	clients[ws] = true
	log.Printf("Client connected: %v", ws.RemoteAddr())

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		log.Printf("Received message: %+v", msg)
		placementQueue <- msg
	}
	log.Printf("Client disconnected: %v", ws.RemoteAddr())
}

func handleMessages() {
	for msg := range broadcast {
		log.Printf("Broadcasting message: %+v", msg)
		for client := range clients {
			go func(client *websocket.Conn) {
				err := client.WriteJSON(msg)
				if err != nil {
					log.Printf("error: %v", err)
					client.Close()
					delete(clients, client)
				}
			}(client)
		}
	}
}

func processPlacements() {
	for msg := range placementQueue {
		handleBlockPlacement(msg)
	}
}

func handleBlockPlacement(msg Message) {
	log.Printf("Handling block placement for message: %+v", msg)

	// 1초 대기
	time.Sleep(1 * time.Second)

	key := fmt.Sprintf("%d:%d", msg.GridX, msg.GridZ)
	if _, exists := matrix[key]; !exists {
		if maze.addWall(msg.GridX, msg.GridZ) {
			matrix[key] = true
			broadcast <- msg
			log.Printf("Wall added at (%d, %d) - Coordinates: (%f, %f)", msg.GridX, msg.GridZ, msg.X, msg.Z)
		} else {
			log.Printf("Adding wall at (%d, %d) would block the path", msg.GridX, msg.GridZ)
			// 검증 실패 메시지 전송
			broadcast <- Message{X: msg.X, Z: msg.Z, GridX: -1, GridZ: -1}
		}
	} else {
		log.Printf("Block already exists at (%d, %d)", msg.GridX, msg.GridZ)
		// 중복 메시지 전송
		broadcast <- Message{X: msg.X, Z: msg.Z, GridX: -1, GridZ: -1}
	}
}
