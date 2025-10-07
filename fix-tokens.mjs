import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'D3v3/op3R',
  database: 'ausbildung'
});

async function fixTokensTable() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Ver qué compañías existen
    const companiesResult = await client.query('SELECT id, name FROM companies ORDER BY id');
    console.log('🏢 Compañías existentes:', companiesResult.rows.length);
    companiesResult.rows.forEach(c => console.log('  -', c.id, c.name));

    // Ver qué referencias problemáticas hay en tokens
    const invalidTokens = await client.query(`
      SELECT t.id, t."companyId", t.amount, t."createdAt"
      FROM tokens t
      WHERE t."companyId" NOT IN (SELECT id FROM companies)
    `);
    console.log('❌ Tokens con companyId inválido:', invalidTokens.rows.length);

    invalidTokens.rows.forEach(token => {
      console.log(`  Token ID: ${token.id}, companyId: ${token.companyId}, amount: ${token.amount}`);
    });

    if (invalidTokens.rows.length > 0) {
      console.log('🔧 Eliminando tokens inválidos...');
      const deleteResult = await client.query(`
        DELETE FROM tokens
        WHERE "companyId" NOT IN (SELECT id FROM companies)
      `);
      console.log('✅ Tokens inválidos eliminados:', deleteResult.rowCount);
    }

    // Verificar que no queden tokens inválidos
    const remainingInvalid = await client.query(`
      SELECT COUNT(*) as count
      FROM tokens t
      WHERE t."companyId" NOT IN (SELECT id FROM companies)
    `);

    if (remainingInvalid.rows[0].count > 0) {
      console.log('❌ Aún quedan tokens inválidos:', remainingInvalid.rows[0].count);
    } else {
      console.log('✅ Todas las referencias de tokens son válidas');
    }

    await client.end();
    console.log('🎉 Tabla tokens arreglada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

fixTokensTable();