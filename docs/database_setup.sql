
-- ATUALIZAÇÃO DA ESTRUTURA DO BANCO DE DADOS
-- Rode isso na aba SQL do phpMyAdmin

-- 1. Garante que a tabela de usuários tenha todas as colunas
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    plan VARCHAR(20) DEFAULT 'Gratuito',
    credits INT DEFAULT 0,
    is_verified TINYINT(1) DEFAULT 0,
    is_blocked TINYINT(1) DEFAULT 0,
    subscription_status VARCHAR(20) DEFAULT 'active',
    trial_ends_at DATETIME NULL,
    verification_code VARCHAR(50) NULL,
    google_api_key VARCHAR(255) NULL,
    openai_api_key VARCHAR(255) NULL,
    groq_api_key VARCHAR(255) NULL,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Se a tabela já existia mas faltavam colunas, adicione-as (comandos seguros)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(50) NULL;
-- FIX: Garantir tamanho correto para suportar formato 'codigo|timestamp' do forgot_password
ALTER TABLE users MODIFY COLUMN verification_code VARCHAR(50) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_api_key TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS openai_api_key TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS groq_api_key TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cerebras_api_key TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS openrouter_api_key TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mistral_api_key TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS together_api_key TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login DATETIME NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS creative_context TEXT NULL;
ALTER TABLE users MODIFY COLUMN google_api_key TEXT NULL;
ALTER TABLE users MODIFY COLUMN openai_api_key TEXT NULL;
ALTER TABLE users MODIFY COLUMN groq_api_key TEXT NULL;



-- 3. Tabela de Projetos (Migração do LocalStorage)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabela de Configurações do Sistema (Migração do LocalStorage)
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    settings_json JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Tabela de Cupons (ATUALIZADA COM TRACKING)
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INT NOT NULL,
    active TINYINT(1) DEFAULT 1,
    times_validated INT DEFAULT 0, -- Quantas vezes testaram
    times_used INT DEFAULT 0,      -- Quantas vezes pagaram
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenta adicionar as colunas novas caso a tabela já exista
BEGIN;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS times_validated INT DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS times_used INT DEFAULT 0;
COMMIT;

-- 6. Tabela de Campanhas de Email (NOVO)
CREATE TABLE IF NOT EXISTS email_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    target_group VARCHAR(50) NOT NULL,
    sent_count INT DEFAULT 0,
    clicks_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insere registro inicial se não existir
INSERT IGNORE INTO system_settings (id, settings_json) VALUES (1, '{}');

-- 7. Novos Campos para Plataforma Freemium (CPF, Endereço, etc)
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) NULL UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cep VARCHAR(10) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(50) NULL;

-- 8. Controle de Uso Diário (Para os limites do plano Free)
CREATE TABLE IF NOT EXISTS daily_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    prompts_used_today INT DEFAULT 0,
    last_reset_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, last_reset_date)
);

-- 9. Logs de Atividade e Anti-Fraude
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NULL,
    ip_address VARCHAR(45) NOT NULL,
    device_fingerprint VARCHAR(255) NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSON NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Eventos de Analytics
CREATE TABLE IF NOT EXISTS analytics_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) NULL,
    metadata JSON NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
