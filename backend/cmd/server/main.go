// Command server is the entry point for the shop API.
//
// Run from the backend/ directory:
//
//	go run ./cmd/server
//
// The server listens on :8080.  The frontend Vite dev server proxies /api/*
// requests to this process, so no CORS configuration is needed in production
// when deployed behind a single reverse proxy.
package main

import (
	"log/slog"
	"net/http"
	"os"

	"shop/internal/handler"
	"shop/internal/service"
	"shop/internal/store"
)

func main() {
	log := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	// Wire the dependency graph bottom-up:
	//   store → service → handler → router
	//
	// MemoryStore implements ProductReader, CartStore, and OrderStore,
	// so a single instance is passed to all three services.
	mem := store.NewMemoryStore()

	productSvc := service.NewProductService(mem)
	cartSvc := service.NewCartService(mem, mem)
	orderSvc := service.NewOrderService(mem, mem)

	h := handler.NewHandler(productSvc, cartSvc, orderSvc, log)
	router := handler.NewRouter(h)

	addr := ":8080"
	log.Info("shop API server started", "addr", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Error("server stopped", "err", err)
		os.Exit(1)
	}
}
