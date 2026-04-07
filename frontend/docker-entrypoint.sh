#!/bin/sh
set -e

echo "Installing dependencies..."
npm install

echo "Starting development server..."
npm run dev
