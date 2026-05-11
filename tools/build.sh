#!/bin/bash

echo "Starting build process..."

npm run typecheck
if [ $? -ne 0 ]; then
    echo "TypeScript check failed"
    exit 1
fi

npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi

echo "Build completed successfully"
