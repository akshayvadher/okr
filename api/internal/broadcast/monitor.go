package broadcast

import (
	"gorm.io/gorm"
	"log"
	"okr/internal/domain"
	"time"
)

func MonitorTransactions(db *gorm.DB, manager *ClientManager) {
	var lastTimestamp time.Time

	var latestTransaction domain.Transaction
	result := db.Model(&domain.Transaction{}).Order("server_created_at DESC").First(&latestTransaction)

	if result.Error != nil {
		if result.Error.Error() == "record not found" {
			// No transactions in the database yet
			lastTimestamp = time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC)
			log.Printf("No existing transactions found. Starting with default timestamp")
		} else {
			log.Printf("Error getting last timestamp: %v", result.Error)
			lastTimestamp = time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC)
		}
	} else {
		lastTimestamp = latestTransaction.ServerCreatedAt
	}

	log.Printf("Starting monitoring from timestamp: %v", lastTimestamp)

	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		var newTransactions []domain.Transaction
		result := db.Model(&domain.Transaction{}).
			Where("server_created_at > ?", lastTimestamp).
			Order("server_created_at ASC").
			Find(&newTransactions)

		if result.Error != nil {
			log.Printf("Error querying for new transactions: %v", result.Error)
			continue
		}

		if len(newTransactions) > 0 {
			lastTimestamp = newTransactions[len(newTransactions)-1].ServerCreatedAt

			for _, transaction := range newTransactions {
				manager.Broadcast <- Event{Type: "new", Data: transaction}
			}
		}
	}
}
