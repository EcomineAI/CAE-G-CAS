@echo off
echo Starting G-CAS Appointment System...

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file is missing!
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo Please ensure .env contains valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY credentials.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting development server...
REM Run vite dev with the --open flag to automatically launch the browser
call npm run dev -- --open

pause

