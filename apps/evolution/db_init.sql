-- EvolutionGo Database Initialization for PostgreSQL 18
-- Segregates authentication/Noise protocol keys from application messaging

SELECT 'CREATE DATABASE evogo_auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evogo_auth')\gexec

SELECT 'CREATE DATABASE evogo_users'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evogo_users')\gexec

\c evogo_auth;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c evogo_users;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
