@echo off
echo Running tests...

call npm run test
if %errorlevel% neq 0 (
    echo Tests failed
    exit /b 1
)

echo All tests passed
