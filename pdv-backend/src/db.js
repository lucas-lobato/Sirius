import pkg from 'pg';
const { Pool } = pkg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // obrigatório para Azure, Supabase, Render etc.
});
