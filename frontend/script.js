// API configuration
const API_BASE_URL = 'http://localhost:3000';

// Global variables
let currentUser = null;
let clients = [];
let invoices = [];
let transactions = [];

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
});

// Event listeners
function setupEventListeners() {
   
    // Form CRUD
    document.getElementById('userFormData').addEventListener('submit', handleUserSubmit);
}

// Authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        showMainApp();
    }
}


// Show main application
function showMainApp() {
    document.getElementById('mainContainer').style.display = 'block';
}



// Navigation between sections
function showSection(sectionName) {

    console.log(sectionName);
    
    // Hide sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show section
    document.getElementById(sectionName).classList.add('active');
    
    // Load data according to section
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'clients':
            loadUsers();
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
        const [clientCount, invoicesCount, TransactionsCount] = await Promise.all([
            fetch(`${API_BASE_URL}/clients/count`).then(r => r.json()).catch(() => ({ count: 0 })),
            fetch(`${API_BASE_URL}/invoices/count`).then(r => r.json()).catch(() => ({ count: 0 })),
            fetch(`${API_BASE_URL}/transactions/count`).then(r => r.json()).catch(() => ({ count: 0 }))
        ]);
        
        document.getElementById('totalClients').textContent = clientCount.count || 0;
        document.getElementById('totalInvoices').textContent = invoicesCount.count || 0;
        document.getElementById('totalTransactions').textContent = TransactionsCount.count || 0;
    } catch (error) {
        console.error('Error loading Dashboard:', error);
        
        document.getElementById('totalClients').textContent = '0';
        document.getElementById('totalInvoices').textContent = '0';
        document.getElementById('totalTransactions').textContent = '0';
    }
}


// Load client
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        users = await response.json();
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    Error loading users: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Show users in the table
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${clients.identification_number}</td>
            <td>${clients.client_name}</td>
            <td>${clients.address}</td>
            <td>${clients.apartment}</td>
            <td>${clients.phone}</td>
            <td>${clients.email}</td>
            
            <td>
                <button class="btn btn-sm btn-warning" onclick="editUser(${clients.identification_number})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${clients.identification_number})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show user form
function showUserForm(userId = null) {
    const form = document.getElementById('userForm');
    const formData = document.getElementById('userFormData');
    
    if (userId) {
        const user = clients.find(u => u.identification_number === userId);
        if (user) {
            document.getElementById('userId').value = user.identification_number;
            document.getElementById('userName').value = user.client_name;
            document.getElementById('userAddress').value = user.address;
            document.getElementById('userApartment').value = user.apartment;
            document.getElementById('userPhone').value = user.phone;
            document.getElementById('userEmail').value = user.email;

        }
    } else {
        formData.reset();
        document.getElementById('userId').value = '';
    }
    
    form.style.display = 'block';
}

// Cancel user form
function cancelUserForm() {
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('userFormData').reset();
}

// Handle user form submission
async function handleUserSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const address = document.getElementById('userAddress').value;
    const apartment = document.getElementById('userApartment').value;
    const phone = document.getElementById('userPhone').value;
    const email = document.getElementById('userEmail').value;

    
    try {
        const url = userId ? `${API_BASE_URL}/clients/${userId}` : `${API_BASE_URL}/clients`;
        const method = userId ? 'PUT' : 'POST';
        
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            alert(userId ? 'User updated' : 'Created user');
            cancelUserForm();
            loadUsers();
        } else {
            const error = await response.json();
            alert(error.message || 'Error saving user');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        alert('Error saving user');
    }
}

// Edit user
function editUser(userId) {
    showUserForm(userId);
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('User deleted');
            loadUsers();
        } else {
            alert('Error deleted user');
        }
    } catch (error) {
        console.error('Error deleted user:', error);
        alert('Error deleted user');
    }
}



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
        // Error in table
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Error cargando productos: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Show invoices in table
function displayInvoices() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoices.invoice_number}</td>
            <td>${invoices.platform_used}</td>
            <td>${invoices.billing_period}</td>
            <td>${invoices.invoiced_amount}</td>
            <td>${invoices.paid_amount}</td>
            <td>${invoices.identification_number}</td>
            
        `;
        tbody.appendChild(row);
    });
}



// Load Transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        purchases = await response.json();
        displayTransactions();
    } catch (error) {
        console.error('Error load transactions:', error);
        // Error in table
        const tbody = document.getElementById('purchasesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Error cargando compras: ${error.message}
                </td>
            </tr>
        `;
    }
}


// Show transaction in table
function displayTransactions() {
    const tbody = document.getElementById('purchasesTableBody');
    tbody.innerHTML = '';
    
    purchases.forEach(purchase => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transactions.transaction_id}</td>
            <td>${transactions.trasanction_date}</td>
            <td>${transactions.transaction_amount}</td>
            <td>${transactions.transaction_status}</td>
            <td>${transactions.transaction_type}</td>
            <td>${transactions.invoice_number}</td>


            
        `;
        tbody.appendChild(row);
    });
}



// Function for import CSV
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
        console.error('Error in CSV:', error);
        alert('ErroR IN CSV');
    }
}

// Validate headers according to table
function validateHeaders(headers, table) {
    const requiredHeaders = {
        'clients': ['identification_number', 'client_name', 'address', 'apartment', 'phone', 'email'],
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
                    loadUsers();
                    break;
                case 'invoices':
                    loadInvoices();
                    break;
                case 'transactions':
                    loadTransactions();
                    break;
            }
            
            // Update dashboard
            loadDashboardData();
        } else {
            const error = await response.json();
            alert(`❌ Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error sending data:', error);
        alert('Error sending data');
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

// Manage import
function handleImport() {
    const fileInput = document.getElementById('csvFile');
    const tableSelect = document.getElementById('targetTable');
    
    if (!fileInput.files[0]) {
        alert('Select a CSV file');
        return;
    }
    
    if (!tableSelect.value) {
        alert('Select a table');
        return;
    }
    
    const file = fileInput.files[0];
    const targetTable = tableSelect.value;
    
    // Validate extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Select a valid file');
        return;
    }
    
    importCSV(file, targetTable);
    closeImportModal();
}


// Functions of clients
export const clientAPI = {
    // Get all clients
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/clients`);
        return response.json();
    },

    // Get client by Id
    getById: async (identification_number) => {
        const response = await fetch(`${API_BASE_URL}/clients/${identification_number}`);
        return response.json();
    },

    // New client
    create: async (clientData) => {
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });
        return response.json();
    },

    // Update client
    update: async (identification_number, clientData) => {
        const response = await fetch(`${API_BASE_URL}/clients/${identification_number}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });
        return response.json();
    },

    // Delete client
    delete: async (identification_number) => {
        const response = await fetch(`${API_BASE_URL}/users/${identification_number}`, {
            method: 'DELETE'
        });
        return response.json();
    },

};

// Functions of import CSV
export const importAPI = {
    // Import clients
    clients: async (data) => {
        const response = await fetch(`${API_BASE_URL}/import/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data })
        });
        return response.json();
    },

    // Import invoices
    products: async (data) => {
        const response = await fetch(`${API_BASE_URL}/import/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data })
        });
        return response.json();
    },

    // Import transactions
    purchases: async (data) => {
        const response = await fetch(`${API_BASE_URL}/import/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data })
        });
        return response.json();
    }
};
