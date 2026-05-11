#!/bin/bash

echo "Cleaning build artifacts..."

npm run clean

rm -rf coverage

echo "Clean completed"
