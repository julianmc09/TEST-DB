CREATE TABLE IF NOT EXISTS clients (
    identification_number VARCHAR(200) PRIMARY KEY,
    client_name VARCHAR(200) NOT NULL,
    address VARCHAR(400) NOT NULL,
    apartment VARCHAR(250) NOT NULL,
    phone VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    invoice_number VARCHAR(200) PRIMARY KEY,
    platform_used VARCHAR(200) NOT NULL,
    billing_period VARCHAR(100) NOT NULL,
    invoiced_amount FLOAT NOT NULL,
    paid_amount FLOAT NOT NULL,
    identification_number VARCHAR(200) NOT NULL,
    FOREIGN KEY (identification_number) REFERENCES clients(identification_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(200) PRIMARY KEY,
    transaction_date TIMESTAMP NOT NULL,
    transaction_amount FLOAT NOT NULL,
    transaction_status VARCHAR(100) NOT NULL,
    transaction_type VARCHAR(200) NOT NULL,
    invoice_number VARCHAR(200) NOT NULL,
    FOREIGN KEY (invoice_number) REFERENCES invoices(invoice_number) ON DELETE CASCADE
);