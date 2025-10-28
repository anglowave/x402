@echo off
echo ==========================================
echo x402 Agent Gateway
echo ==========================================
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist ".env.local" (
    echo Warning: .env.local not found
    echo Please copy env.example to .env.local and configure your vault
    echo.
    pause
    exit /b 1
)

echo Starting development server on http://localhost:3000
echo.
npm run dev
