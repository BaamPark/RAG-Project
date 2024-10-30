#!/bin/bash

# Function to handle Ctrl+C and stop all background processes
cleanup() {
  echo "Stopping servers..."
  pkill -f "uvicorn"  # Stop FastAPI backend
  pkill -f "npm"  # Stop Next.js frontend
  exit 0
}

# Trap Ctrl+C (SIGINT) and run the cleanup function
trap cleanup SIGINT

# Start the backend (FastAPI)
echo "Starting FastAPI backend..."
cd backend  # Navigate to the backend directory
uvicorn main:app --reload --port 8000 &  # Run backend in the background
cd ..  # Go back to the root directory

# Start the frontend (Next.js)
echo "Starting Next.js frontend..."
cd frontend  # Navigate to the frontend directory
npm run dev &  # Run frontend in the background

# Wait for both processes to finish
wait
