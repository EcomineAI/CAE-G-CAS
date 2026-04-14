@echo off
echo Starting G-CAS Appointment System...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting development server...
REM Run vite dev with the --open flag to automatically launch the browser
call npm run dev -- --open

pause
