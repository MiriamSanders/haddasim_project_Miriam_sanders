const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require('bcrypt');
const db = require('../db/dbModule')
router.use(express.json());
const saltRounds = 10;
router.post("/signup", async (req, res) => {
    const { companyName, password, phone, rep, goods } = req.body;
    if (!companyName || !password || !phone || !rep) {
        return res.status(400).json({ error: "All fields are required" });
    }
    //check if password is already in use
    const checkiFExists = 'SELECT password FROM suppliers';
    db.query(checkiFExists, async (err, result) => {
        if (result) {
            for (let i = 0; i < result.length; i++) {
                const isMatch = await bcrypt.compare(password, result[i].password);
                if (isMatch) return res.status(401).json({ error: "Invalid credentials" });
            }
        }
    })
    //add supplier
    const sql = "INSERT INTO suppliers (company_name, password, phone_number, contact_name) VALUES (?, ?, ?, ?)";
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    db.query(sql, [companyName, hashedPassword, phone, rep], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const supplierId = result.insertId;
        const sqlItem = "INSERT INTO items (item_name, minumal_amount, price, supplier_id) VALUES (?, ?, ?, ?)";
        let count = 0;
        goods.forEach((item, index) => {
            //add each of the items
            db.query(sqlItem, [item.name, item.min, item.price, supplierId], (err, result) => {
                if (err) {
                    console.error('Error inserting item:', err);
                    if (index === goods.length - 1) {
                        return res.status(500).json({ error: "Failed to insert some items" });
                    }
                    return;
                }
                //check if the item already exists in the minimal table
                const checkQuery = `SELECT COUNT(*) AS count FROM minimal_items WHERE item_name = ?`;
                db.query(checkQuery, [item.name], (err, result) => {
                    if (err) {
                        console.error('Error checking minimal_items:', err);
                        return res.status(500).json({ error: "Failed to check minimal_items" });
                    }
                    if (result[0].count === 0) {
                        // If the item doesn't exist in minimal_items, insert it with default values (0, 0)
                        const insertQuery = `INSERT INTO minimal_items (item_name, current_amount, minimal_amount) VALUES (?, 0, 0)`;
                        db.query(insertQuery, [item.name], (err, result) => {
                            if (err) {
                                console.error('Error inserting into minimal_items:', err);
                                return res.status(500).json({ error: "Failed to insert into minimal_items" });
                            }
                        })
                    }
                });
                //check that all items were properly inserted
                count++;
                if (count === goods.length) {
                    res.status(201).json({ message: "Supplier and items added successfully", supplierId: supplierId });
                }
            });
        });
    });
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