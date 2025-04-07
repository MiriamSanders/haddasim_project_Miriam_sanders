const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const db = require('../db/dbModule')
router.use(express.json());
//get all suppliers and their items
router.get('/suppliers', (req, res) => {
    const supplierSql = 'SELECT id, company_name FROM suppliers';
    const itemsSql = 'SELECT * FROM items';
    db.query(supplierSql, (err, suppliers) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(itemsSql, (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            const suppliersWithItems = suppliers.map(supplier => ({
                ...supplier,
                items: items.filter(item => item.supplier_id === supplier.id)
            }));
            res.json(suppliersWithItems);
        });
    });
});
module.exports = router