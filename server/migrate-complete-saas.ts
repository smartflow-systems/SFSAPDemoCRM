/**
 * Complete SaaS Platform Migration Script
 * This migration adds all advanced features: custom fields, workflows, webhooks,
 * API keys, email sync, communication logs, and more
 * Run after migrate-multi-tenant.ts
 * Usage: tsx server/migrate-complete-saas.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.error('Example: DATABASE_URL=postgresql://user:password@host/database tsx server/migrate-complete-saas.ts');
    process.exit(1);
  }

  console.log('🚀 Starting complete SaaS platform migration...');
  console.log(`Database: ${databaseUrl.split('@')[1]?.split('?')[0] || 'unknown'}`);

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // 1. Custom fields system
    console.log('\n🎨 Creating custom fields tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_fields (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('lead', 'opportunity', 'account', 'contact')),
        field_name VARCHAR(100) NOT NULL,
        field_label VARCHAR(255) NOT NULL,
        field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'dropdown', 'checkbox', 'textarea')),
        options JSONB,
        required BOOLEAN DEFAULT FALSE,
        position INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_field_values (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
        entity_id UUID NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_custom_fields_tenant ON custom_fields(tenant_id, entity_type);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON custom_field_values(entity_id);');
    console.log('✓ Custom fields tables created');

    // 2. Workflow automation
    console.log('\n⚡ Creating workflow tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger_type VARCHAR(100) NOT NULL,
        trigger_conditions JSONB,
        actions JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS workflow_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        entity_id UUID,
        status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'running')),
        error TEXT,
        execution_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON workflows(tenant_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);');
    console.log('✓ Workflow tables created');

    // 3. API keys
    console.log('\n🔑 Creating API keys table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        key VARCHAR(255) UNIQUE NOT NULL,
        scopes TEXT[],
        last_used_at TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);');
    console.log('✓ API keys table created');

    // 4. Webhooks
    console.log('\n🪝 Creating webhook tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        events TEXT[],
        secret VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
        event VARCHAR(100) NOT NULL,
        payload JSONB,
        response_status INTEGER,
        response_body TEXT,
        attempts INTEGER DEFAULT 1,
        success BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON webhooks(tenant_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);');
    console.log('✓ Webhook tables created');

    // 5. Email sync settings
    console.log('\n📧 Creating email sync table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_sync_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL CHECK (provider IN ('gmail', 'outlook')),
        email VARCHAR(255) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP,
        sync_enabled BOOLEAN DEFAULT TRUE,
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_email_sync_user ON email_sync_settings(user_id);');
    console.log('✓ Email sync table created');

    // 6. Communication logs (SMS, calls, emails)
    console.log('\n📞 Creating communication logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS communication_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('sms', 'call', 'email')),
        direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
        from_number VARCHAR(50) NOT NULL,
        to_number VARCHAR(50) NOT NULL,
        subject TEXT,
        body TEXT,
        status VARCHAR(50),
        duration INTEGER,
        cost INTEGER,
        lead_id UUID REFERENCES leads(id),
        contact_id UUID REFERENCES contacts(id),
        opportunity_id UUID REFERENCES opportunities(id),
        user_id UUID REFERENCES users(id),
        external_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_communication_logs_tenant ON communication_logs(tenant_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_communication_logs_lead ON communication_logs(lead_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_communication_logs_contact ON communication_logs(contact_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_communication_logs_type ON communication_logs(type, direction);');
    console.log('✓ Communication logs table created');

    console.log('\n✅ Complete SaaS platform migration finished successfully!');
    console.log('\n📋 Migration Summary:');
    console.log('  ✓ Custom fields system (2 tables)');
    console.log('  ✓ Workflow automation (2 tables)');
    console.log('  ✓ API keys (1 table)');
    console.log('  ✓ Webhooks (2 tables)');
    console.log('  ✓ Email sync (1 table)');
    console.log('  ✓ Communication logs (1 table)');
    console.log('\n🎉 Your CRM is now a complete multi-tenant SaaS platform!');
    console.log('\n📚 Total Tables: 19 (10 from Phase 0 + 9 from this migration)');
    console.log('\n🔧 Next Steps:');
    console.log('   1. Configure Stripe: Set STRIPE_SECRET_KEY in environment');
    console.log('   2. Configure Twilio: Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
    console.log('   3. Set up email service for password reset');
    console.log('   4. Configure OAuth for Gmail/Outlook sync');
    console.log('   5. Test webhook delivery');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
