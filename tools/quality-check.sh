#!/bin/bash

echo "Checking code quality..."

npm run lint
npm run typecheck

echo "Quality check completed"
