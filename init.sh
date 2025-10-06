#!/bin/bash
# Railway initialization script for Ausbildung Backend

echo "🚀 Starting Ausbildung Backend initialization..."

# Set NODE_ENV if not set
export NODE_ENV=${NODE_ENV:-production}

# Wait for database to be ready (Railway provides DATABASE_URL)
echo "⏳ Waiting for database to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Checking database connection..."

    # Try to connect to database using Node.js script
    node -e "
        const { Sequelize } = require('sequelize');
        const parseDatabaseUrl = (databaseUrl) => {
            try {
                const url = new URL(databaseUrl);
                return {
                    database: url.pathname.slice(1),
                    username: url.username,
                    password: url.password,
                    host: url.hostname,
                    port: url.port || 5432,
                    dialect: 'postgres'
                };
            } catch (error) {
                return null;
            }
        };

        const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
        if (!dbConfig) {
            console.error('Invalid DATABASE_URL');
            process.exit(1);
        }

        const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            logging: false,
            pool: { max: 1, min: 0, acquire: 5000, idle: 1000 },
            dialectOptions: {
                ssl: process.env.NODE_ENV === 'production' ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            }
        });

        sequelize.authenticate()
            .then(() => {
                console.log('✅ Database connection successful');
                process.exit(0);
            })
            .catch((error) => {
                console.error('❌ Database connection failed:', error.message);
                process.exit(1);
            });
    "

    if [ $? -eq 0 ]; then
        echo "✅ Database is ready!"
        break
    fi

    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Database connection failed after $max_attempts attempts"
        exit 1
    fi

    echo "⏳ Waiting 5 seconds before next attempt..."
    sleep 5
    attempt=$((attempt + 1))
done

# Run database migrations
echo "🗄️ Running database migrations..."
npx sequelize-cli db:migrate --config src/database/database.js

if [ $? -ne 0 ]; then
    echo "❌ Database migrations failed"
    exit 1
fi

echo "✅ Database migrations completed!"

# Optional: Run database seeders (uncomment if needed)
# echo "🌱 Running database seeders..."
# npx sequelize-cli db:seed:all

echo "✅ Database initialization completed!"
echo "🎯 Backend is ready to accept connections!"