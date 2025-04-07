const express = require("express");
const router = express.Router();
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
//אתגר
router.post('/placeorder', (req, res) => {
    const { items } = req.body;
    console.log(items)
    const minimalUpdateSql = 'UPDATE  minimal_items SET current_amount = current_amount - ? WHERE item_name = ?'

    Object.entries(items).forEach(([itemName, quantity]) => {
        db.query(minimalUpdateSql, [quantity, itemName], (err, result) => {
            if (err) {
                console.error('Error updating minimal_amount:', err);
                return res.status(500).json({ error: "Failed to update some items" });
            }

            console.log(`Minimal amount for ${itemName} updated successfully.`);
        });
    });
    const sqlDiffrence = 'SELECT item_name, minimal_amount, current_amount, (minimal_amount - current_amount) AS amount_difference FROM minimal_items WHERE current_amount < minimal_amount';
    const smallestPrice = "SELECT id, supplier_id, price AS smallest_price FROM items WHERE (item_name, price) IN ( SELECT item_name, MIN(price) FROM items GROUP BY item_name ) AND item_name = ? LIMIT 1;"
    db.query(sqlDiffrence, (err, result) => {
        if (err) {
            console.error('Error fetching items:', err);
            return res.status(500).json({ error: 'Failed to fetch items' });
        }
        result.forEach(good => {
            db.query(smallestPrice, [good.item_name], async (err, smallestResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch items' });
                }
                const orderObj = {
                    supplier: smallestResult[0].supplier_id,
                    date: new Date().toISOString(),
                    items: [{ id: smallestResult[0].id, amount: good.amount_difference }]
                };
                const response = await fetch('http://localhost:3000/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderObj),
                });
                if (response) {
                   res.status(200).json({message:"seccessfuly updated and current stock, and ordered relevent items"})
                }
            })

        });


    }

    )
})
module.exports = router;