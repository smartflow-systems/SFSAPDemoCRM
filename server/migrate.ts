/**
 * Database Migration Script
 * Run this to create all database tables
 * Usage: tsx server/migrate.ts
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';
import * as schema from '@shared/schema';

neonConfig.webSocketConstructor = ws;

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.error('Example: DATABASE_URL=postgresql://user:password@host/database tsx server/migrate.ts');
    process.exit(1);
  }

  console.log('🔄 Starting database migration...');
  console.log(`Database: ${databaseUrl.split('@')[1]?.split('?')[0] || 'unknown'}`);

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    // Create tables using Drizzle's schema
    console.log('Creating tables...');

    // Since we're using Drizzle, we can use their migration system
    // For now, we'll manually create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Sales Rep', 'Viewer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created users table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        account_type VARCHAR(100),
        industry VARCHAR(100),
        website VARCHAR(255),
        phone VARCHAR(50),
        billing_street TEXT,
        billing_city VARCHAR(100),
        billing_state VARCHAR(100),
        billing_postal_code VARCHAR(20),
        billing_country VARCHAR(100),
        number_of_employees INTEGER,
        annual_revenue DECIMAL(15,2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created accounts table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        mobile VARCHAR(50),
        title VARCHAR(100),
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created contacts table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        title VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
        rating VARCHAR(20) CHECK (rating IN ('Hot', 'Warm', 'Cold') OR rating IS NULL),
        value DECIMAL(15,2),
        owner_id VARCHAR(255),
        account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created leads table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        owner_id VARCHAR(255),
        stage VARCHAR(50) NOT NULL DEFAULT 'Discovery' CHECK (stage IN ('Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost')),
        value DECIMAL(15,2) NOT NULL DEFAULT 0,
        probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
        expected_close_date DATE,
        closed_at TIMESTAMP,
        source VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created opportunities table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note')),
        subject VARCHAR(255),
        description TEXT,
        due_date TIMESTAMP,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical') OR priority IS NULL),
        owner_id VARCHAR(255),
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created activities table');

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contacts_account_id ON contacts(account_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON opportunities(owner_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities(opportunity_id);');
    console.log('✓ Created indexes');

    console.log('✅ Migration completed successfully!');
    console.log('\nTo use PostgreSQL storage, set DATABASE_URL environment variable and restart the server.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
