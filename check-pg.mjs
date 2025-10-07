import pkg from 'pg';
const { Client } = pkg;
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'D3v3/op3R',
  database: 'ausbildung'
});

async function checkConnection() {
  try {
    await client.connect();
    console.log('✅ PostgreSQL local conectado');
    await client.end();
  } catch (err) {
    console.log('❌ PostgreSQL local no disponible:', err.message);
    console.log('🔄 Necesitas usar Railway o iniciar PostgreSQL localmente');
  }
}

checkConnection();