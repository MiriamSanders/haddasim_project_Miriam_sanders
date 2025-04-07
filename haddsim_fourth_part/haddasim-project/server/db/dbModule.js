
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: ", err);
    } else {
        console.log("Connected to MySQL database");

        // Individual table creation queries
        const createSuppliersTable = `
            CREATE TABLE IF NOT EXISTS suppliers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                password TEXT NOT NULL,
                phone_number VARCHAR(20) NOT NULL,
                contact_name VARCHAR(100) NOT NULL
            );
        `;
        
        const createItemsTable = `
            CREATE TABLE IF NOT EXISTS items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_name VARCHAR(255) NOT NULL,
                minumal_amount INT,
                price FLOAT,
                supplier_id INT,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            );
        `;
        
        const createOrdersTable = `
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT,
                date VARCHAR(25),
                status VARCHAR(100),
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            );
        `;
        
        const createOrderItemsTable = `
            CREATE TABLE IF NOT EXISTS order_items (
                order_id INT,
                item_id INT,
                amount INT,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (item_id) REFERENCES items(id)
            );
        `;
        
        const createMinimalItemsTable = `
            CREATE TABLE IF NOT EXISTS minimal_items (
                item_name VARCHAR(100),
                current_amount INT,
                minimal_amount INT
            );
        `;

        // Execute each query one by one
        db.query(createSuppliersTable, (err, result) => {
            if (err) {
                console.error("Error creating suppliers table: ", err);
            } else {
                console.log("Suppliers table created or already exists.");
            }
        });

        db.query(createItemsTable, (err, result) => {
            if (err) {
                console.error("Error creating items table: ", err);
            } else {
                console.log("Items table created or already exists.");
            }
        });

        db.query(createOrdersTable, (err, result) => {
            if (err) {
                console.error("Error creating orders table: ", err);
            } else {
                console.log("Orders table created or already exists.");
            }
        });

        db.query(createOrderItemsTable, (err, result) => {
            if (err) {
                console.error("Error creating order_items table: ", err);
            } else {
                console.log("Order items table created or already exists.");
            }
        });

        db.query(createMinimalItemsTable, (err, result) => {
            if (err) {
                console.error("Error creating minimal_items table: ", err);
            } else {
                console.log("Minimal items table created or already exists.");
            }
        });
    }
});

module.exports = db;
