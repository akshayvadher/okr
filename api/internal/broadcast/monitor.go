package broadcast

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/lib/pq"
	"gorm.io/gorm"
	"log"
	"okr/config"
	"okr/internal/domain"
	"time"
)

func MonitorTransactions(cfg *config.DatabaseConfig, db *gorm.DB, manager *ClientManager) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
	)

	listener := pq.NewListener(dsn, 10*time.Second, time.Minute, func(ev pq.ListenerEventType, err error) {
		if err != nil {
			log.Printf("Error in listener: %v", err)
		}
	})
	defer listener.Close()

	err := listener.Listen("new_transaction")
	if err != nil {
		log.Fatalf("Failed to listen on channel: %v", err)
	}

	log.Println("Started listening for new transactions via PostgreSQL NOTIFY")

	fallbackTicker := time.NewTicker(30 * time.Second)
	defer fallbackTicker.Stop()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		for {
			select {
			case notification := <-listener.Notify:
				if notification == nil {
					continue
				}

				var transactionObject map[string]interface{}
				err := json.Unmarshal([]byte(notification.Extra), &transactionObject)
				if err != nil {
					log.Printf("Error parsing notification payload: %v", err)
					continue
				}

				var transaction domain.Transaction
				result := db.First(&transaction, "id = ?", transactionObject["id"])
				if result.Error != nil {
					log.Printf("Error fetching transaction %s: %v", transactionObject, result.Error)
					continue
				}

				manager.Broadcast <- Event{Type: "new", Data: transaction}

			case <-fallbackTicker.C:
				checkForMissedTransactions(db, manager)

			case <-ctx.Done():
				return
			}
		}
	}()

	<-ctx.Done()
}

func checkForMissedTransactions(_db *gorm.DB, _manager *ClientManager) {
	// TODO Do we need this?
}
