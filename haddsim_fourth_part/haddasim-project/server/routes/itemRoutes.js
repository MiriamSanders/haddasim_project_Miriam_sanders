const express = require("express");
const router = express.Router();
const fetch = require('node-fetch');
router.use(express.json());
const db = require('../db/dbModule');
router.get('/minimalitems', (req, res) => {
    const query = `
    SELECT item_name,minimal_amount FROM minimal_items `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(result);
    });
});
//update minimal values
router.put('/minimalitems', (req, res) => {
    const updatedItems = req.body;
    updatedItems.forEach(item => {
        const query = `
            UPDATE minimal_items
            SET minimal_amount = ?
            WHERE item_name = ?;
        `;
        db.query(query, [item.minimal_amount, item.item_name], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
        });
    });

    res.status(200).json({ message: 'Items updated successfully!' });
});
//challenge
router.post('/placeorder', async (req, res) => {
    const { items } = req.body;
    const minimalUpdateSql = 'UPDATE minimal_items SET current_amount = current_amount - ? WHERE item_name = ?';
    const sqlDifference = `
        SELECT item_name, minimal_amount, current_amount, 
        (minimal_amount - current_amount) AS amount_difference 
        FROM minimal_items 
        WHERE current_amount < minimal_amount
    `;
    const smallestPriceSql = `
        SELECT id, supplier_id, price AS smallest_price 
        FROM items 
        WHERE (item_name, price) IN (
            SELECT item_name, MIN(price) FROM items GROUP BY item_name
        ) 
        AND item_name = ? 
        LIMIT 1
    `;
    //adapter function- so it will run in the order i want it tooo
    const query = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });

    try {
        for (const [itemName, quantity] of Object.entries(items)) {
            const result = await query(minimalUpdateSql, [quantity, itemName]);
            if (result.affectedRows === 0) {
                return res.status(400).json({ error: "Some items are not in the minimal_items table" });
            }
        }
        const lowItems = await query(sqlDifference);
        for (const good of lowItems) {
            const smallestResult = await query(smallestPriceSql, [good.item_name]);
            if (smallestResult.length === 0) continue;
            const orderObj = {
                supplier: smallestResult[0].supplier_id,
                date: new Date().toISOString(),
                items: [{ id: smallestResult[0].id, amount: good.amount_difference }]
            };
            await fetch('http://localhost:3000/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderObj),
            });
        }
        res.status(200).json({ message: "Successfully updated stock and ordered relevant items" });

    } catch (err) {
        console.error("Error during placeorder:", err);
        res.status(500).json({ error: "An error occurred while processing the order." });
    }
});

module.exports = router;