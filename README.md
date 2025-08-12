# Sistema de Información Financiera

Una aplicación web completa para gestionar clientes, facturas y transacciones financieras.

## Características

- **Dashboard**: Vista general del sistema
- **Gestión de Clientes**: CRUD completo (Crear, Leer, Editar, Eliminar)
- **Gestión de Facturas**: Visualización de facturas
- **Gestión de Transacciones**: Visualización de transacciones
- **Importación CSV**: Importar datos desde archivos CSV

## Instalación

### Backend

1. Navega al directorio backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

1. Navega al directorio frontend:
```bash
cd frontend
```

2. Abre `index.html` en tu navegador web

## Uso

### Navegación

- **Dashboard**: Vista principal con resumen del sistema
- **Clients**: Gestionar clientes (agregar, editar, eliminar)
- **Invoices**: Ver facturas existentes
- **Transactions**: Ver transacciones existentes

### Gestión de Clientes

1. Haz clic en "Add client" para agregar un nuevo cliente
2. Completa el formulario con:
   - Número de identificación
   - Nombre del cliente
   - Dirección
   - Apartamento
   - Teléfono
   - Email
3. Haz clic en "Save" para guardar
4. Usa los botones "Edit" y "Delete" en la tabla para gestionar clientes existentes

### Importación CSV

1. Haz clic en "Import CSV" en el dashboard
2. Selecciona el archivo CSV
3. Selecciona la tabla destino (clients, invoices, transactions)
4. Haz clic en "Import"

### Formato de Archivos CSV

#### Clientes
```
identification_number,client_name,address,apartment,phone,email
123456789,John Doe,123 Main St,Apt 4A,555-0101,john.doe@email.com
```

#### Facturas
```
invoice_number,platform_used,billing_period,invoiced_amount,paid_amount,identification_number
INV-001,Stripe,2024-01,150.00,150.00,123456789
```

#### Transacciones
```
transaction_id,transaction_date,transaction_amount,transaction_status,transaction_type,invoice_number
TXN-001,2024-01-15,150.00,completed,payment,INV-001
```

## Archivos de Ejemplo

Se incluyen archivos CSV de ejemplo:
- `sample-clients.csv`
- `sample-invoices.csv`
- `sample-transactions.csv`

## Base de Datos

La aplicación utiliza PostgreSQL con las siguientes tablas:
- `clients`: Información de clientes
- `invoices`: Facturas emitidas
- `transactions`: Transacciones realizadas

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Base de Datos**: PostgreSQL

## Notas Importantes

- Los clientes deben existir antes de crear facturas
- Las facturas deben existir antes de crear transacciones
- El sistema valida la integridad referencial automáticamente
- Los archivos CSV deben tener el formato exacto especificado
