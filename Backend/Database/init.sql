-- 1. Enable UUID Extension (required for UUID generation functions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Hierarchy (InheritanceType.JOINED)
-- Each subclass table's Primary Key is also a Foreign Key to the users table
CREATE TABLE users (
                       user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       role VARCHAR(50),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sellers (
                         user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
                         store_name VARCHAR(255),
                         is_approved BOOLEAN DEFAULT FALSE,
                         compliance_docs BYTEA -- Maps to byte[] with JdbcTypeCode(SqlTypes.BINARY)
);

CREATE TABLE customers (
                           user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
                           name VARCHAR(255),
                           shipping_address TEXT,
                           phone_number VARCHAR(20)
);

CREATE TABLE administrators (
                                user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Product Management
CREATE TABLE products (
                          product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          sku VARCHAR(255) UNIQUE NOT NULL,
                          name VARCHAR(255) NOT NULL,
                          brand VARCHAR(255),
                          description TEXT,
                          price NUMERIC(10, 2), -- Maps to BigDecimal(10, 2)
                          status VARCHAR(50), -- Maps to Enum ProductStatus
                          user_id UUID NOT NULL REFERENCES sellers(user_id) -- Foreign key to Seller subclass
);

CREATE TABLE products_images (
                                id BIGSERIAL PRIMARY KEY,
                                file_name VARCHAR(255),
                                product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE
);

-- 4. Order System
CREATE TABLE orders (
                        order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        quantity INTEGER NOT NULL,
                        total_amount NUMERIC(10, 2), -- (product.price * quantity)
                        payment_status VARCHAR(50) DEFAULT 'UNPAID',
                        shipment_status VARCHAR(50) DEFAULT 'PROCESSING',
                        estimated_delivery DATE,
                        shipping_address TEXT,
                        product_id UUID NOT NULL REFERENCES products(product_id),
                        customer_id UUID NOT NULL REFERENCES customers(user_id) -- Foreign key to Customer subclass
);

-- 5. System Settings
CREATE TABLE platform_settings (
                                   id INTEGER PRIMARY KEY DEFAULT 1,
                                   tax_rate DOUBLE PRECISION,
                                   currency VARCHAR(10),
                                   CONSTRAINT singleton_check CHECK (id = 1) -- Ensures only one row exists
);

CREATE TABLE payment_methods (
                                 settings_id INTEGER REFERENCES platform_settings(id) ON DELETE CASCADE,
                                 method_name VARCHAR(100)
);

-- 2. Create the Parent Table (Shared data for all notifications)
CREATE TABLE notifications (
                               notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                               message TEXT NOT NULL,
                               estimated_delivery DATE DEFAULT CURRENT_DATE, -- Matches columnDefinition = "DATE"
                               is_read BOOLEAN DEFAULT FALSE,
                               type VARCHAR(50),
                               time_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               user_id UUID NOT NULL,

    -- Links to your existing users table (assuming table name is 'users')
                               CONSTRAINT fk_notification_user
                                   FOREIGN KEY (user_id) REFERENCES users(user_id)
                                       ON DELETE CASCADE
);

-- 3. Create the In-App Child Table (Required for JOINED inheritance)
CREATE TABLE in_app_notifications (
                                      notification_id UUID PRIMARY KEY,

                                      CONSTRAINT fk_in_app_parent
                                          FOREIGN KEY (notification_id) REFERENCES notifications(notification_id)
                                              ON DELETE CASCADE
);

-- 4. Create the Email Child Table (Stores email-specific data)
CREATE TABLE email_notifications (
                                     notification_id UUID PRIMARY KEY,
                                     recipient_email VARCHAR(255) NOT NULL,

                                     CONSTRAINT fk_email_parent
                                         FOREIGN KEY (notification_id) REFERENCES notifications(notification_id)
                                             ON DELETE CASCADE
);

CREATE TABLE wallets (
                         wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                         balance DECIMAL(10, 2) DEFAULT 100.00,
                         user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE transactions (
                              transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              sender_id UUID,
                              receiver_id UUID,
                              amount DECIMAL(10, 2) NOT NULL,
                              timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              description TEXT,
                              status VARCHAR(50),

                              CONSTRAINT fk_transaction_sender
                                  FOREIGN KEY (sender_id) REFERENCES users(user_id)
                                      ON DELETE SET NULL,

                              CONSTRAINT fk_transaction_receiver
                                  FOREIGN KEY (receiver_id) REFERENCES users(user_id)
                                      ON DELETE SET NULL
);
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);

-- 1. Create the User record (Parent)
-- We manually specify a UUID so we can reference it in the next step
-- password = "admin123"
INSERT INTO users (user_id, email, password, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@pasar.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'ADMIN');

-- 2. Create the Administrator record (Child)
-- This links the 'user_id' from the record above
INSERT INTO administrators (user_id)
VALUES ('00000000-0000-0000-0000-000000000000');