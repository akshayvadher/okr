package broadcast

import (
	"log"
	"sync"
)

type Event struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

type ClientManager struct {
	Clients    map[chan Event]bool
	Register   chan chan Event
	Unregister chan chan Event
	Broadcast  chan Event
	Mutex      sync.Mutex
}

func NewClientManager() *ClientManager {
	return &ClientManager{
		Clients:    make(map[chan Event]bool),
		Register:   make(chan chan Event),
		Unregister: make(chan chan Event),
		Broadcast:  make(chan Event),
	}
}

func (manager *ClientManager) Start() {
	go func() {
		for {
			select {
			case client := <-manager.Register:
				manager.Mutex.Lock()
				manager.Clients[client] = true
				manager.Mutex.Unlock()
				log.Printf("Client registered. Total Clients: %d", len(manager.Clients))

			case client := <-manager.Unregister:
				manager.Mutex.Lock()
				if _, ok := manager.Clients[client]; ok {
					delete(manager.Clients, client)
					close(client)
				}
				manager.Mutex.Unlock()
				log.Printf("Client unregistered. Total Clients: %d", len(manager.Clients))

			case event := <-manager.Broadcast:
				manager.Mutex.Lock()
				for client := range manager.Clients {
					client <- event
				}
				manager.Mutex.Unlock()
			}
		}
	}()
}
