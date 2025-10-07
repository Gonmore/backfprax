import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'D3v3/op3R',
  database: 'ausbildung'
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Ver el esquema de la tabla scenter_profamilys
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'scenter_profamilys'
      ORDER BY ordinal_position
    `);

    console.log('📋 Esquema de scenter_profamilys:');
    schemaResult.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Ver algunos datos de ejemplo
    const dataResult = await client.query('SELECT * FROM scenter_profamilys LIMIT 5');
    console.log('📊 Datos de ejemplo:');
    dataResult.rows.forEach(row => {
      console.log(' ', row);
    });

    await client.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

checkSchema();