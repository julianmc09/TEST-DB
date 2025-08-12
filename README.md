# Financial Information System

A complete web application to manage clients, invoices, and financial transactions.

## Features

- **Dashboard**: System overview
- **Client Management**: Full CRUD (Create, Read, Update, Delete)
- **Invoice Management**: View invoices
- **Transaction Management**: View transactions
- **CSV Import**: Import data from CSV files

## Installation

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Run the server:
```bash
npm start
```

The server will be available at `http://localhost:3000`

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Open `index.html` in your web browser

## Usage

### Navigation

- **Dashboard**: Main view with system summary
- **Clients**: Manage clients (add, edit, delete)
- **Invoices**: View existing invoices
- **Transactions**: View existing transactions

### Client Management

1. Click on "Add client" to add a new client
2. Fill in the form with:
   - Identification number
   - Client name
   - Address
   - Apartment
   - Phone
   - Email
3. Click "Save" to store the client
4. Use the "Edit" and "Delete" buttons in the table to manage existing clients

### CSV Import

1. Click on "Import CSV" in the dashboard
2. Select the CSV file
3. Select the target table (clients, invoices, transactions)
4. Click "Import"

### CSV File Format

#### Clients
```
identification_number,client_name,address,apartment,phone,email
123456789,John Doe,123 Main St,Apt 4A,555-0101,john.doe@email.com
```

#### Invoices
```
invoice_number,platform_used,billing_period,invoiced_amount,paid_amount,identification_number
INV-001,Stripe,2024-01,150.00,150.00,123456789
```

#### Transactions
```
transaction_id,transaction_date,transaction_amount,transaction_status,transaction_type,invoice_number
TXN-001,2024-01-15,150.00,completed,payment,INV-001
```

## Sample Files

Sample CSV files are included:
- `clients.csv`
- `Invoicescsv`
- `Transactions.csv`

## Database

The application uses PostgreSQL with the following tables:
- `clients`: Client information
- `invoices`: Issued invoices
- `transactions`: Completed transactions

## Technologies Used

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Data Base**: PostgreSQL

## Important Notes

- Clients must exist before creating invoices
- Invoices must exist before creating transactions
- The system automatically enforces referential integrity
- CSV files must match the exact specified format.
