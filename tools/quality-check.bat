@echo off
echo Checking code quality...

call npm run lint
call npm run typecheck

echo Quality check completed
