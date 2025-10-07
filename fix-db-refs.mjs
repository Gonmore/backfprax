import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'D3v3/op3R',
  database: 'ausbildung'
});

async function fixDatabase() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Ver qué profamilys existen
    const profamilysResult = await client.query('SELECT id, name FROM profamilys ORDER BY id');
    console.log('📚 Profamilys existentes:', profamilysResult.rows.length);

    // Ver qué referencias problemáticas hay
    const invalidRefs = await client.query(`
      SELECT sp."scenterId", sp."profamilyId"
      FROM scenter_profamilys sp
      WHERE sp."profamilyId" NOT IN (SELECT id FROM profamilys)
    `);
    console.log('❌ Referencias inválidas encontradas:', invalidRefs.rows.length);

    invalidRefs.rows.forEach(row => {
      console.log(`  scenterId: ${row.scenterId}, profamilyId: ${row.profamilyId}`);
    });

    if (invalidRefs.rows.length > 0) {
      console.log('🔧 Eliminando referencias inválidas...');
      const deleteResult = await client.query(`
        DELETE FROM scenter_profamilys
        WHERE "profamilyId" NOT IN (SELECT id FROM profamilys)
      `);
      console.log('✅ Referencias inválidas eliminadas:', deleteResult.rowCount);
    }

    // Verificar que no queden referencias inválidas
    const remainingInvalid = await client.query(`
      SELECT COUNT(*) as count
      FROM scenter_profamilys sp
      WHERE sp."profamilyId" NOT IN (SELECT id FROM profamilys)
    `);

    if (remainingInvalid.rows[0].count > 0) {
      console.log('❌ Aún quedan referencias inválidas:', remainingInvalid.rows[0].count);
    } else {
      console.log('✅ Todas las referencias son válidas');
    }

    await client.end();
    console.log('🎉 Base de datos arreglada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

fixDatabase();