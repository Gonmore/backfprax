#!/bin/bash
# Railway initialization script for Ausbildung Backend

echo "🚀 Starting Ausbildung Backend initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
npx sequelize-cli db:migrate

# Run database seeders (optional, uncomment if needed)
# echo "🌱 Running database seeders..."
# npx sequelize-cli db:seed:all

echo "✅ Database initialization completed!"
echo "🎯 Backend is ready to accept connections!"