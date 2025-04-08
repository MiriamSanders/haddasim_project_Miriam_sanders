const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require('bcrypt');
const db = require('../db/dbModule')
router.use(express.json());
const saltRounds = 10;
// a rejected promise will throw an error
//adapter function so it will run the order i want it 
const query = (sql, params = []) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
    });
});

router.post("/signup", async (req, res) => {
    const { companyName, password, phone, rep, goods } = req.body;
    if (!companyName || !password || !phone || !rep) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const existing = await query('SELECT password FROM suppliers');
        for (const row of existing) {
            const isMatch = await bcrypt.compare(password, row.password);
            if (isMatch) {
                return res.status(401).json({ error: "Invalid credentials (password already in use)" });
            }
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await query(
            "INSERT INTO suppliers (company_name, password, phone_number, contact_name) VALUES (?, ?, ?, ?)",
            [companyName, hashedPassword, phone, rep]
        );
        const supplierId = result.insertId;

        for (const item of goods) {
            await query(
                "INSERT INTO items (item_name, minumal_amount, price, supplier_id) VALUES (?, ?, ?, ?)",
                [item.name, item.min, item.price, supplierId]
            );
            const countResult = await query(
                "SELECT COUNT(*) AS count FROM minimal_items WHERE item_name = ?",
                [item.name]
            );
            if (countResult[0].count === 0) {
                await query(
                    "INSERT INTO minimal_items (item_name, current_amount, minimal_amount) VALUES (?, 0, 0)",
                    [item.name]
                );
            }
        }
        res.status(201).json({ message: "Supplier and items added successfully", supplierId });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Something went wrong during signup" });
    }
});

router.post("/login", async (req, res) => {
    const { companyName, password } = req.body;
    if (!companyName || !password) {
        return res.status(400).json({ error: "Company name and password required" });
    }
    const sql = "SELECT * FROM suppliers WHERE company_name = ?";
    db.query(sql, [companyName], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const supplier = results[0];
        const isMatch = await bcrypt.compare(password, supplier.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.status(200).json({ message: "Login successful", supplierId: supplier.id });
    });
});
module.exports = router