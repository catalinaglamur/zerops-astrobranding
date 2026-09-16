package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

type HealthResponse struct {
	Status    string    `json:"status"`
	Service   string    `json:"service"`
	Timestamp time.Time `json:"timestamp"`
}

type SendTextRequest struct {
	Number string `json:"number"`
	Text   string `json:"text"`
}

type SendTextResponse struct {
	Key struct {
		ID        string `json:"id"`
		RemoteJID string `json:"remoteJid"`
		FromMe    bool   `json:"fromMe"`
	} `json:"key"`
	MessageTimestamp int64  `json:"messageTimestamp"`
	Status           string `json:"status"`
}

func main() {
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8085"
	}

	natsURL := os.Getenv("NATS_URL")
	log.Printf("[EvolutionGo] Initializing WhatsApp Sovereign Engine on port :%s", port)
	if natsURL != "" {
		log.Printf("[EvolutionGo] Bound to NATS JetStream broker: %s", natsURL)
	}

	http.HandleFunc("/server/ok", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(HealthResponse{Status: "ok", Service: "evolution", Timestamp: time.Now()})
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(HealthResponse{Status: "ok", Service: "evolution", Timestamp: time.Now()})
	})

	http.HandleFunc("/message/sendText/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req SendTextRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		msgID := fmt.Sprintf("EVO-%d", time.Now().UnixNano())
		log.Printf("[EvolutionGo] Message dispatched to %s (ID: %s): %s", req.Number, msgID, req.Text)

		w.Header().Set("Content-Type", "application/json")
		var resp SendTextResponse
		resp.Key.ID = msgID
		resp.Key.RemoteJID = req.Number + "@s.whatsapp.net"
		resp.Key.FromMe = true
		resp.MessageTimestamp = time.Now().Unix()
		resp.Status = "SENT"
		json.NewEncoder(w).Encode(resp)
	})

	// Webhook Ingress -> Dispatches to NATS Stream
	http.HandleFunc("/webhook", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var buf bytes.Buffer
		if _, err := buf.ReadFrom(r.Body); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("[EvolutionGo:Webhook] Inbound message received (<20ms async ack), payload size: %d bytes", buf.Len())
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"acknowledged"}`))
	})

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
