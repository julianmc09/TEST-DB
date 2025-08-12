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




// Get all clients
app.get('/clients', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT identification_number, client_name, address, apartment, phone, email FROM clients');
        res.json(rows);
    } catch (err) {
        console.error('error obtained by the client', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get client by Id
app.get('/clients/:identification_number', async (req, res) => {
    const { identification_number } = req.params;
    try {
        const { rows } = await db.query('SELECT identification_number, client_name, address, apartment, phone, email FROM clients WHERE id = $1', [identification_number]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'client not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a new client
app.post('/clients', async (req, res) => {
    const { identification_number, client_name, address, apartment, phone, email } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await db.query('SELECT * FROM clients WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'The email is already registered' });
        }

        const result = await db.query(
            'INSERT INTO clients (identification_number, client_name, address, apartment, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING identification_number, client_name, address, apartment, phone, email',
            [identification_number, client_name, address, apartment, phone, email]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update client
app.put('/clients/:identification_number', async (req, res) => {
    const { identification_number } = req.params;
    const { client_name, address, apartment, phone, email } = req.body;

    try {
        let query, params;

        query = 'UPDATE clients SET identification_number = $1, client_name = $2, address = $3, apartment = $4, phone = $5, email = $6 WHERE identification_number = $1 RETURNING identification_number, client_name, address, apartment, phone, email';
        params = [identification_number, client_name, address, apartment, phone, email];


        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating users:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete client
app.delete('/clients/:identification_number', async (req, res) => {
    const { identification_number } = req.params;
    try {
        const result = await db.query('DELETE FROM clients WHERE identification_number = $1', [identification_number]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User successfully deleted' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Count clients
app.get('/clients/count', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT COUNT(*) AS count FROM clients');
        res.json(rows[0]);
    } catch (err) {
        console.error('Error counting users:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//Import clients whit CSV

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
        // Validar datos requeridos
        if (!row.identification_number || !row.client_name || !row.address || !row.apartment || !row.phone || !row.email)  {
          errors.push(`Invalid row: ${JSON.stringify(row)} - required fields are missing`);
          continue;
        }
        
        // Verificar si el email ya existe
        const existingClient = await db.query('SELECT * FROM clients WHERE email = $1', [row.email]);
        if (existingClient.rows.length > 0) {
          errors.push(`Client with ${row.email} already exist`);
          continue;
        }
    
        // Insertar usuario
        await db.query(
          'INSERT INTO clients (identification_number, client_name, address, apartment, phone, email) VALUES ($1, $2, $3, $4, $5, $6,)',
          [row.identification_number, row.client_name, row.address, row.apartment, row.phone, row.email,]
        );
        
        imported++;
      } catch (err) {
        errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
      }
    }
    
    res.json({
      message: `import completed. ${imported} clients imported successfully.`,
      imported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error importing clients:', err);
    res.status(500).json({ message: 'Internal Error Server' });
  }
});

//Import invoices whit CSV

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
        // Validar datos requeridos
        if (!row.invoice_number || !row.platform_used || !row.billing_period || !row.invoiced_amount || !row.paid_amount || !row.identification_number) {
          errors.push(`Invalid row: ${JSON.stringify(row)} - required fields are missing`);
          continue;
        }
        
        // Insertar producto
        await db.query(
          'INSERT INTO invoices (invoice_number, platform_used, billing_period, invoiced_amount, paid_amount, identification_number) VALUES ($1, $2, $3, $4, $5, $6)',
          [row.invoice_number, row.platform_used, row.billing_period, row.invoiced_amount, row.paid_amount,row.identification_number]
        );
        
        imported++;
      } catch (err) {
        errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
      }
    }
    
    res.json({
      message: `Import completed ${imported} invoiced imported correctly.`,
      imported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error importing invoices:', err);
    res.status(500).json({ message: 'Internal Error Server' });
  }
});


// Importar transactions with CSV
app.post('/import/transactions', async (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ message: 'invalid data' });
  }
  
  try {
    let imported = 0;
    const errors = [];
    
    for (const row of data) {
      try {
        // Validar datos requeridos
        if (!row.transaction_id || !row.transaction_date || !row.transaction_amount || !row.transaction_status || !row.transaction_type || !row.invoice_number) {
          errors.push(`Invalid row: ${JSON.stringify(row)} - Required fields are missing`);
          continue;
        }
        
        // Validar que el usuario existe
        const clientExists = await db.query('SELECT identification_number FROM clients WHERE identification_number = $1', [row.identification_number]);
        if (clientExists.rows.length === 0) {
          errors.push(`Client with ID ${row.identification_number} don't exist`);
          continue;
        }
        
        // Validar que el producto existe
        const invoiceExists = await db.query('SELECT invoice_number FROM invoices WHERE invoice_number = $1', [row.invoice_number]);
        if (invoiceExists.rows.length === 0) {
          errors.push(`Transaction with id ${row.invoice_number} don't exist`);
          continue;
        }
        
        
        // Insert transaction
        await db.query(
          'INSERT INTO transactions (transaction_id, transaction_date, transaction_amount, transaction_status, transaction_type, invoice_number) VALUES ($1, $2, $3, $4, $5, $6)',
          [purchaseDate.toISOString().split('T')[0], row.transaction_id, row.transaction_date, row.transaction_amount, row.transaction_status, row.transaction_type, row.invoice_number]
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
    res.status(500).json({ message: 'Internal Error Server' });
  }
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
