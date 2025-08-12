import express, { json } from 'express';
import pkg from 'pg';
import cors from 'cors';

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(json());

// PostgreSQL Configuration
const db = new Pool({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  user: 'postgres.sgnkqyfwduhlwickqrfy',
  password: 'Julian321512699.',
  database: 'postgres',
  port: 6543,
  ssl: { rejectUnauthorized: false } 
});

// Test the connection to the database
db.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('✅ Connection to the database successful');
    release();
  }
});

// ===== CLIENTS ENDPOINTS =====

// Get all clients
app.get('/clients', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT identification_number, client_name, address, apartment, phone, email FROM clients ORDER BY client_name');
        res.json(rows);
    } catch (err) {
        console.error('Error getting clients:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get client by ID
app.get('/clients/:identification_number', async (req, res) => {
    const { identification_number } = req.params;
    try {
        const { rows } = await db.query('SELECT identification_number, client_name, address, apartment, phone, email FROM clients WHERE identification_number = $1', [identification_number]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error getting client:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a new client
app.post('/clients', async (req, res) => {
    const { identification_number, client_name, address, apartment, phone, email } = req.body;

    try {
        // Check if the client already exists
        const existingClient = await db.query('SELECT * FROM clients WHERE identification_number = $1 OR email = $2', [identification_number, email]);
        if (existingClient.rows.length > 0) {
            return res.status(400).json({ message: 'Client with this ID or email already exists' });
        }

        const result = await db.query(
            'INSERT INTO clients (identification_number, client_name, address, apartment, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING identification_number, client_name, address, apartment, phone, email',
            [identification_number, client_name, address, apartment, phone, email]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating client:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update client
app.put('/clients/:identification_number', async (req, res) => {
    const { identification_number } = req.params;
    const { client_name, address, apartment, phone, email } = req.body;

    try {
        const result = await db.query(
            'UPDATE clients SET client_name = $1, address = $2, apartment = $3, phone = $4, email = $5 WHERE identification_number = $6 RETURNING identification_number, client_name, address, apartment, phone, email',
            [client_name, address, apartment, phone, email, identification_number]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating client:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete client
app.delete('/clients/:identification_number', async (req, res) => {
    const { identification_number } = req.params;
    try {
        const result = await db.query('DELETE FROM clients WHERE identification_number = $1', [identification_number]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json({ message: 'Client successfully deleted' });
    } catch (err) {
        console.error('Error deleting client:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ===== INVOICES ENDPOINTS =====

// Get all invoices
app.get('/invoices', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT invoice_number, platform_used, billing_period, invoiced_amount, paid_amount, identification_number FROM invoices ORDER BY invoice_number');
        res.json(rows);
    } catch (err) {
        console.error('Error getting invoices:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ===== TRANSACTIONS ENDPOINTS =====

// Get all transactions
app.get('/transactions', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT transaction_id, transaction_date, transaction_amount, transaction_status, transaction_type, invoice_number FROM transactions ORDER BY transaction_date DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error getting transactions:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ===== IMPORT ENDPOINTS =====

// Import clients with CSV
app.post('/import/clients', async (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  
  try {
    let imported = 0;
    const errors = [];
    
    for (const row of data) {
      try {
        // Validate required data
        if (!row.identification_number || !row.client_name || !row.address || !row.apartment || !row.phone || !row.email) {
          errors.push(`Invalid row: ${JSON.stringify(row)} - required fields are missing`);
          continue;
        }
        
        // Check if client already exists
        const existingClient = await db.query('SELECT * FROM clients WHERE identification_number = $1 OR email = $2', [row.identification_number, row.email]);
        if (existingClient.rows.length > 0) {
          errors.push(`Client with ID ${row.identification_number} or email ${row.email} already exists`);
          continue;
        }
    
        // Insert client
        await db.query(
          'INSERT INTO clients (identification_number, client_name, address, apartment, phone, email) VALUES ($1, $2, $3, $4, $5, $6)',
          [row.identification_number, row.client_name, row.address, row.apartment, row.phone, row.email]
        );
        
        imported++;
      } catch (err) {
        errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
      }
    }
    
    res.json({
      message: `Import completed. ${imported} clients imported successfully.`,
      imported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error importing clients:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Import invoices with CSV
app.post('/import/invoices', async (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  
  try {
    let imported = 0;
    const errors = [];
    
    for (const row of data) {
      try {
        // Validate required data
        if (!row.invoice_number || !row.platform_used || !row.billing_period || !row.invoiced_amount || !row.paid_amount || !row.identification_number) {
          errors.push(`Invalid row: ${JSON.stringify(row)} - required fields are missing`);
          continue;
        }
        
        // Check if client exists
        const clientExists = await db.query('SELECT identification_number FROM clients WHERE identification_number = $1', [row.identification_number]);
        if (clientExists.rows.length === 0) {
          errors.push(`Client with ID ${row.identification_number} does not exist`);
          continue;
        }
        
        // Check if invoice already exists
        const existingInvoice = await db.query('SELECT * FROM invoices WHERE invoice_number = $1', [row.invoice_number]);
        if (existingInvoice.rows.length > 0) {
          errors.push(`Invoice with number ${row.invoice_number} already exists`);
          continue;
        }
        
        // Insert invoice
        await db.query(
          'INSERT INTO invoices (invoice_number, platform_used, billing_period, invoiced_amount, paid_amount, identification_number) VALUES ($1, $2, $3, $4, $5, $6)',
          [row.invoice_number, row.platform_used, row.billing_period, row.invoiced_amount, row.paid_amount, row.identification_number]
        );
        
        imported++;
      } catch (err) {
        errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
      }
    }
    
    res.json({
      message: `Import completed. ${imported} invoices imported successfully.`,
      imported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error importing invoices:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Import transactions with CSV
app.post('/import/transactions', async (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  
  try {
    let imported = 0;
    const errors = [];
    
    for (const row of data) {
      try {
        // Validate required data
        if (!row.transaction_id || !row.transaction_date || !row.transaction_amount || !row.transaction_status || !row.transaction_type || !row.invoice_number) {
          errors.push(`Invalid row: ${JSON.stringify(row)} - Required fields are missing`);
          continue;
        }
        
        // Check if invoice exists
        const invoiceExists = await db.query('SELECT invoice_number FROM invoices WHERE invoice_number = $1', [row.invoice_number]);
        if (invoiceExists.rows.length === 0) {
          errors.push(`Invoice with number ${row.invoice_number} does not exist`);
          continue;
        }
        
        // Check if transaction already exists
        const existingTransaction = await db.query('SELECT * FROM transactions WHERE transaction_id = $1', [row.transaction_id]);
        if (existingTransaction.rows.length > 0) {
          errors.push(`Transaction with ID ${row.transaction_id} already exists`);
          continue;
        }
        
        // Insert transaction
        await db.query(
          'INSERT INTO transactions (transaction_id, transaction_date, transaction_amount, transaction_status, transaction_type, invoice_number) VALUES ($1, $2, $3, $4, $5, $6)',
          [row.transaction_id, row.transaction_date, row.transaction_amount, row.transaction_status, row.transaction_type, row.invoice_number]
        );
        
        imported++;
      } catch (err) {
        errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
      }
    }
    
    res.json({
      message: `Import completed. ${imported} transactions imported successfully.`,
      imported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error importing transactions:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
