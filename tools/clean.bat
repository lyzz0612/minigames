@echo off
echo Cleaning build artifacts...

call npm run clean

if exist coverage (
    rd /s /q coverage
)

echo Clean completed
