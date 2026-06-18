import fs from 'fs';
import path from 'path';
import pool from './src/config/database.js';

async function runMigrations() {
  try {
    const migrationFile = path.join(process.cwd(), 'src/config/schema-migrations.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('🔄 Running database migrations...');
    
    await pool.query(sql);
    
    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

runMigrations();
