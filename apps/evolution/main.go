package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
}

type SendTextRequest struct {
	Number string `json:"number"`
	Text   string `json:"text"`
}

type SendTextResponse struct {
	Key struct {
		ID string `json:"id"`
	} `json:"key"`
	Status string `json:"status"`
}

func main() {
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8085"
	}

	http.HandleFunc("/server/ok", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(HealthResponse{Status: "ok", Service: "evolution"})
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(HealthResponse{Status: "ok", Service: "evolution"})
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
		log.Printf("[EvolutionGo] Mensaje despachado a %s: %s", req.Number, req.Text)

		w.Header().Set("Content-Type", "application/json")
		var resp SendTextResponse
		resp.Key.ID = fmt.Sprintf("EVO-%d", 100000)
		resp.Status = "PENDING"
		json.NewEncoder(w).Encode(resp)
	})

	log.Printf("[EvolutionGo] WhatsApp Gateway listening on port :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
