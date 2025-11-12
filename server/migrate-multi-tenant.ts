/**
 * Multi-Tenant Database Migration Script
 * This migration adds multi-tenancy support to the CRM
 * Run this to update the database with new tables and columns
 * Usage: tsx server/migrate-multi-tenant.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.error('Example: DATABASE_URL=postgresql://user:password@host/database tsx server/migrate-multi-tenant.ts');
    process.exit(1);
  }

  console.log('🔄 Starting multi-tenant database migration...');
  console.log(`Database: ${databaseUrl.split('@')[1]?.split('?')[0] || 'unknown'}`);

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // 1. Create tenants table
    console.log('\n📦 Creating tenants table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        plan VARCHAR(50) NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
        status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
        max_users INTEGER DEFAULT 5,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled')),
        trial_ends_at TIMESTAMP,
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);');
    console.log('✓ Tenants table created');

    // 2. Update users table
    console.log('\n👤 Updating users table...');
    await pool.query(`
      DO $$
      BEGIN
        -- Add tenant_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id') THEN
          ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        END IF;

        -- Add new columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
          ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at') THEN
          ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='mfa_enabled') THEN
          ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
          ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    console.log('✓ Users table updated');

    // 3. Update accounts table
    console.log('\n🏢 Updating accounts table...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts' AND column_name='tenant_id') THEN
          ALTER TABLE accounts ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts' AND column_name='updated_at') THEN
          ALTER TABLE accounts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts' AND column_name='owner_id') THEN
          ALTER TABLE accounts ADD COLUMN owner_id UUID REFERENCES users(id);
        END IF;
      END $$;
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id ON accounts(tenant_id);');
    console.log('✓ Accounts table updated');

    // 4. Update contacts table
    console.log('\n👥 Updating contacts table...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='tenant_id') THEN
          ALTER TABLE contacts ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='updated_at') THEN
          ALTER TABLE contacts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='owner_id') THEN
          ALTER TABLE contacts ADD COLUMN owner_id UUID REFERENCES users(id);
        END IF;
      END $$;
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);');
    console.log('✓ Contacts table updated');

    // 5. Update leads table
    console.log('\n🎯 Updating leads table...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='tenant_id') THEN
          ALTER TABLE leads ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='updated_at') THEN
          ALTER TABLE leads ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='first_name') THEN
          ALTER TABLE leads ADD COLUMN first_name VARCHAR(100);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='last_name') THEN
          ALTER TABLE leads ADD COLUMN last_name VARCHAR(100);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='notes') THEN
          ALTER TABLE leads ADD COLUMN notes TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='tags') THEN
          ALTER TABLE leads ADD COLUMN tags TEXT[];
        END IF;
      END $$;
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);');
    console.log('✓ Leads table updated');

    // 6. Update opportunities table
    console.log('\n💼 Updating opportunities table...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='tenant_id') THEN
          ALTER TABLE opportunities ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='updated_at') THEN
          ALTER TABLE opportunities ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='lead_id') THEN
          ALTER TABLE opportunities ADD COLUMN lead_id UUID REFERENCES leads(id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='amount') THEN
          ALTER TABLE opportunities ADD COLUMN amount INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='close_date') THEN
          ALTER TABLE opportunities ADD COLUMN close_date TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='next_action') THEN
          ALTER TABLE opportunities ADD COLUMN next_action TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='opportunities' AND column_name='next_action_date') THEN
          ALTER TABLE opportunities ADD COLUMN next_action_date TIMESTAMP;
        END IF;
      END $$;
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_id ON opportunities(tenant_id);');
    console.log('✓ Opportunities table updated');

    // 7. Update activities table
    console.log('\n📝 Updating activities table...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='tenant_id') THEN
          ALTER TABLE activities ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='updated_at') THEN
          ALTER TABLE activities ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='account_id') THEN
          ALTER TABLE activities ADD COLUMN account_id UUID REFERENCES accounts(id);
        END IF;
      END $$;
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities(tenant_id);');
    console.log('✓ Activities table updated');

    // 8. Create audit_logs table
    console.log('\n📊 Creating audit_logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100),
        entity_id UUID,
        changes JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);');
    console.log('✓ Audit logs table created');

    // 9. Create password_reset_tokens table
    console.log('\n🔐 Creating password_reset_tokens table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);');
    console.log('✓ Password reset tokens table created');

    // 10. Create mfa_secrets table
    console.log('\n🔒 Creating mfa_secrets table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mfa_secrets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        secret VARCHAR(255) NOT NULL,
        backup_codes TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_mfa_secrets_user_id ON mfa_secrets(user_id);');
    console.log('✓ MFA secrets table created');

    console.log('\n✅ Multi-tenant migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log('  • Tenants table created');
    console.log('  • All existing tables updated with tenant_id');
    console.log('  • Audit logs table created');
    console.log('  • Password reset tokens table created');
    console.log('  • MFA secrets table created');
    console.log('  • All necessary indexes created');
    console.log('\n⚠️  IMPORTANT: You need to manually assign existing data to a tenant');
    console.log('   Run: UPDATE users SET tenant_id = \'<tenant-id>\' WHERE tenant_id IS NULL;');
    console.log('   (Repeat for accounts, contacts, leads, opportunities, activities)');
    console.log('\n🚀 Your database is now multi-tenant ready!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
