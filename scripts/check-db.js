const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const interviewId = 'cmse9n1470002c8vk3ewoklea';
  const res = await pool.query("SELECT * FROM \"Interview\" WHERE id = $1", [interviewId]);
  console.log('Interview:', res.rows[0]);
  
  if (res.rows[0]) {
    const userRes = await pool.query("SELECT * FROM \"User\" WHERE id = $1", [res.rows[0].userId]);
    console.log('User associated with interview:', userRes.rows[0]);
  } else {
    console.log('No interview found with ID', interviewId);
  }
}

run().catch(console.error).finally(() => pool.end());
