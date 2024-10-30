# Function to stop all background processes on Ctrl+C
cleanup() {
  echo "Stopping servers..."
  pkill -f "python backend/main.py"  # Stop backend
  pkill -f "npm run dev"  # Stop frontend
  exit 0
}

# Trap Ctrl+C (SIGINT) and run the cleanup function
trap cleanup SIGINT

# Start the backend (FastAPI)
echo "Starting FastAPI backend..."
python backend/main.py &  # Run backend in the background

# Start the frontend (Next.js)
echo "Starting Next.js frontend..."
npm --prefix frontend run dev &  # Run frontend from the root

# Wait for both processes to finish
wait
