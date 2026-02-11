const { Pool } = require('pg');

function createPool() {
  const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST || 'db',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB,
  });

  // IMPORTANT: usem esquemes en català
  pool.on('connect', (client) => {
    client.query("SET search_path TO meteo,auth,public").catch(console.error);
  });

  return pool;
}

module.exports = { createPool };
