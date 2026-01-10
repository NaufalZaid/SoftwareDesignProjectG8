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

CREATE TABLE product_images (
                                id BIGSERIAL PRIMARY KEY,
                                file_name VARCHAR(255),
                                image_data BYTEA, -- Binary data for images
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