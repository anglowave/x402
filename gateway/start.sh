#!/bin/bash

echo "=========================================="
echo "x402 Agent Gateway"
echo "=========================================="
echo ""

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

if [ ! -f ".env.local" ]; then
    echo "Warning: .env.local not found"
    echo "Please copy env.example to .env.local and configure your vault"
    echo ""
    exit 1
fi

echo "Starting development server on http://localhost:3000"
echo ""
npm run dev
