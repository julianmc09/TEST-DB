// API configuration
const API_BASE_URL = 'http://localhost:3000';

// Global variables
let clients = [];
let invoices = [];
let transactions = [];

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showMainApp();
    showSection('dashboard');
});

// Event listeners
function setupEventListeners() {
    // Form CRUD for clients
    document.getElementById('userFormData').addEventListener('submit', handleUserSubmit);
}

// Show main application
function showMainApp() {
    document.getElementById('mainContainer').style.display = 'block';
}

// Navigation between sections
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find the clicked link and make it active
    const clickedLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (clickedLink) {
        clickedLink.classList.add('active');
    }
    
    // Load data according to section
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'clients':
            loadClients();
            break;
        case 'invoices':
            loadInvoices();
            break;
        case 'transactions':
            loadTransactions();
            break;
    }
}

// Load dashboard
async function loadDashboardData() {
    try {
        // Load all data for dashboard
        await Promise.all([
            loadClients(),
            loadInvoices(),
            loadTransactions()
        ]);
    } catch (error) {
        console.error('Error loading Dashboard:', error);
    }
}

// ===== CLIENTS FUNCTIONS =====

// Load clients
async function loadClients() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        clients = await response.json();
        displayClients();
    } catch (error) {
        console.error('Error loading clients:', error);
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Error loading clients: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Display clients in table
function displayClients() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if (clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No clients found. Add your first client!
                </td>
            </tr>
        `;
        return;
    }
    
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.identification_number}</td>
            <td>${client.client_name}</td>
            <td>${client.address}</td>
            <td>${client.apartment}</td>
            <td>${client.phone}</td>
            <td>${client.email}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editClient('${client.identification_number}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.identification_number}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show client form
function showUserForm(clientId = null) {
    const form = document.getElementById('userForm');
    const formData = document.getElementById('userFormData');
    
    if (clientId) {
        const client = clients.find(c => c.identification_number === clientId);
        if (client) {
            document.getElementById('userIdent').value = client.identification_number;
            document.getElementById('userName').value = client.client_name;
            document.getElementById('userAddress').value = client.address;
            document.getElementById('userApartment').value = client.apartment;
            document.getElementById('userPhone').value = client.phone;
            document.getElementById('userEmail').value = client.email;
        }
    } else {
        formData.reset();
        document.getElementById('userIdent').value = '';
    }
    
    form.style.display = 'block';
}

// Cancel client form
function cancelUserForm() {
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('userFormData').reset();
}

// Handle client form submission
async function handleUserSubmit(e) {
    e.preventDefault();
    
    const identification_number = document.getElementById('userIdent').value;
    const client_name = document.getElementById('userName').value;
    const address = document.getElementById('userAddress').value;
    const apartment = document.getElementById('userApartment').value;
    const phone = document.getElementById('userPhone').value;
    const email = document.getElementById('userEmail').value;

    // Check if this is an edit or create operation
    const isEdit = clients.some(c => c.identification_number === identification_number);
    
    try {
        const url = isEdit ? `${API_BASE_URL}/clients/${identification_number}` : `${API_BASE_URL}/clients`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identification_number,
                client_name,
                address,
                apartment,
                phone,
                email
            })
        });
        
        if (response.ok) {
            alert(isEdit ? 'Client updated successfully!' : 'Client created successfully!');
            cancelUserForm();
            loadClients();
        } else {
            const error = await response.json();
            alert(error.message || 'Error saving client');
        }
    } catch (error) {
        console.error('Error saving client:', error);
        alert('Error saving client');
    }
}

// Edit client
function editClient(clientId) {
    showUserForm(clientId);
}

// Delete client
async function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Client deleted successfully!');
            loadClients();
        } else {
            const error = await response.json();
            alert(error.message || 'Error deleting client');
        }
    } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client');
    }
}

// ===== INVOICES FUNCTIONS =====

// Load invoices
async function loadInvoices() {
    try {
        const response = await fetch(`${API_BASE_URL}/invoices`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        invoices = await response.json();
        displayInvoices();
    } catch (error) {
        console.error('Error loading invoices:', error);
        const tbody = document.getElementById('invoicesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Error loading invoices: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Display invoices in table
function displayInvoices() {
    const tbody = document.getElementById('invoicesTableBody');
    tbody.innerHTML = '';
    
    if (invoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No invoices found. Import some data to get started!
                </td>
            </tr>
        `;
        return;
    }
    
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.platform_used}</td>
            <td>${invoice.billing_period}</td>
            <td>$${parseFloat(invoice.invoiced_amount).toFixed(2)}</td>
            <td>$${parseFloat(invoice.paid_amount).toFixed(2)}</td>
            <td>${invoice.identification_number}</td>
        `;
        tbody.appendChild(row);
    });
}

// ===== TRANSACTIONS FUNCTIONS =====

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        transactions = await response.json();
        displayTransactions();
    } catch (error) {
        console.error('Error loading transactions:', error);
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Error loading transactions: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Display transactions in table
function displayTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No transactions found. Import some data to get started!
                </td>
            </tr>
        `;
        return;
    }
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.transaction_id}</td>
            <td>${new Date(transaction.transaction_date).toLocaleDateString()}</td>
            <td>$${parseFloat(transaction.transaction_amount).toFixed(2)}</td>
            <td>${transaction.transaction_status}</td>
            <td>${transaction.transaction_type}</td>
            <td>${transaction.invoice_number}</td>
        `;
        tbody.appendChild(row);
    });
}

// ===== CSV IMPORT FUNCTIONS =====

// Function for importing CSV
async function importCSV(file, targetTable) {
    try {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            console.log('Headers:', headers);
            console.log('Table:', targetTable);
            
            // Validate headers
            if (!validateHeaders(headers, targetTable)) {
                alert('The CSV file is not in the correct format for the selected table');
                return;
            }
            
            // Process data
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index];
                    });
                    data.push(row);
                }
            }
            
            console.log('Processed data:', data);
            
            // Send data to the backend
            await sendDataToBackend(data, targetTable);
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('Error processing CSV:', error);
        alert('Error processing CSV file');
    }
}

// Validate headers according to table
function validateHeaders(headers, table) {
    const requiredHeaders = {
        'clients': ['client_name', 'identification_number', 'address', 'apartment', 'phone', 'email'],
        'invoices': ['invoice_number', 'platform_used', 'billing_period', 'invoiced_amount', 'paid_amount', 'identification_number'],
        'transactions': ['transaction_id', 'transaction_date', 'transaction_amount', 'transaction_status', 'transaction_type', 'invoice_number']
    };
    
    const required = requiredHeaders[table];
    if (!required) return false;
    
    return required.every(header => headers.includes(header));
}

// Send data to the backend
async function sendDataToBackend(data, table) {
    try {
        const response = await fetch(`${API_BASE_URL}/import/${table}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`✅ ${result.message}\nImported records: ${result.imported}`);
            
            // Reload the corresponding section
            switch(table) {
                case 'clients':
                    loadClients();
                    break;
                case 'invoices':
                    loadInvoices();
                    break;
                case 'transactions':
                    loadTransactions();
                    break;
            }
        } else {
            const error = await response.json();
            alert(`❌ Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error sending data:', error);
        alert('Error sending data to server');
    }
}

// Show import modal
function showImportModal() {
    const modal = document.getElementById('importModal');
    modal.style.display = 'block';
}

// Close import modal
function closeImportModal() {
    const modal = document.getElementById('importModal');
    modal.style.display = 'none';
    document.getElementById('csvFile').value = '';
    document.getElementById('targetTable').value = '';
}

// Handle import
function handleImport() {
    const fileInput = document.getElementById('csvFile');
    const tableSelect = document.getElementById('targetTable');
    
    if (!fileInput.files[0]) {
        alert('Please select a CSV file');
        return;
    }
    
    if (!tableSelect.value) {
        alert('Please select a target table');
        return;
    }
    
    const file = fileInput.files[0];
    const targetTable = tableSelect.value;
    
    // Validate extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a valid CSV file');
        return;
    }
    
    importCSV(file, targetTable);
    closeImportModal();
}