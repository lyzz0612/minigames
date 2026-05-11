@echo off
echo Starting build process...

call npm run typecheck
if %errorlevel% neq 0 (
    echo TypeScript check failed
    exit /b 1
)

call npm run lint
if %errorlevel% neq 0 (
    echo Linting failed
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo Build failed
    exit /b 1
)

echo Build completed successfully
