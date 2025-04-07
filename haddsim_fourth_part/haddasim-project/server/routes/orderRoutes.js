const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
router.use(express.json());
const db = require('../db/dbModule')
router.get('/orders/:id', (req, res) => {
    const supplierId = req.params.id;
    const ordersQuery = `
        SELECT * FROM orders WHERE supplier_id = ?
    `;
    db.query(ordersQuery, [supplierId], (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        if (orders.length === 0) {
            return res.json([]); // no orders found
        }
        const orderIds = orders.map(order => order.id);
        const placeholders = orderIds.map(() => '?').join(',');
        const itemsQuery = `
            SELECT oi.order_id, i.id AS item_id, i.item_name, oi.amount
            FROM order_items oi
            JOIN items i ON oi.item_id = i.id
            WHERE oi.order_id IN (${placeholders})
        `;
        db.query(itemsQuery, orderIds, (err, orderItems) => {
            if (err) return res.status(500).json({ error: err.message });
            const itemsByOrder = {};
            orderItems.forEach(item => {
                if (!itemsByOrder[item.order_id]) {
                    itemsByOrder[item.order_id] = [];
                }
                itemsByOrder[item.order_id].push({
                    item_id: item.item_id,
                    item_name: item.item_name,
                    quantity: item.amount
                });
            });
            const fullOrders = orders.map(order => ({
                order_id: order.id,
                date: order.date,
                orderStatus: order.status,
                items: itemsByOrder[order.id] || []
            }));
            res.json(fullOrders);
        });
    });
});
router.get('/orders', (req, res) => {
    db.query(" SELECT * FROM orders", (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        if (orders.length === 0) {
            return res.json([]);
        }
        const orderIds = orders.map(order => order.id);
        const placeholders = orderIds.map(() => '?').join(',');
        const itemsQuery = `
            SELECT oi.order_id, i.id AS item_id, i.item_name, oi.amount
            FROM order_items oi
            JOIN items i ON oi.item_id = i.id
            WHERE oi.order_id IN (${placeholders})
        `;

        db.query(itemsQuery, orderIds, (err, orderItems) => {
            if (err) return res.status(500).json({ error: err.message });
            const itemsByOrder = {};
            orderItems.forEach(item => {
                if (!itemsByOrder[item.order_id]) {
                    itemsByOrder[item.order_id] = [];
                }
                itemsByOrder[item.order_id].push({
                    item_id: item.item_id,
                    item_name: item.item_name,
                    quantity: item.amount
                });
            });
            const fullOrders = orders.map(order => ({
                order_id: order.id,
                supplier_id: order.supplier_Id,
                date: order.date,
                orderStatus: order.status,
                items: itemsByOrder[order.id] || []
            }));
            res.json(fullOrders);
        });
    });
});
router.post('/orders', (req, res) => {
    const { supplier, date, items } = req.body;
    console.log(req.body)
    const orderItemsSql = 'INSERT INTO order_items (order_id, item_Id, amount) VALUES (?, ?, ?)';
    const ordersSql = 'INSERT INTO orders (supplier_id, date, status) VALUES (?, ?, ?)';
    const minimalSql = 'UPDATE minimal_items SET current_amount = current_amount + ? WHERE item_name = (SELECT item_name FROM items WHERE id = ? LIMIT 1)';
    // add order
    db.query(ordersSql, [supplier, date, "pending"], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const orderId = result.insertId;
        let count = 0;
        // For each item in the order, insert into order_items and update the current stock
        items.forEach((item, index) => {
            const itemId = parseInt(item.id);
            const amount = parseInt(item.amount);
            if (isNaN(itemId) || isNaN(amount)) {
                return res.status(400).json({ error: "Invalid item id or amount" });
            }

            // Insert item into order_items table
            db.query(orderItemsSql, [orderId, itemId, amount], (err) => {
                if (err) {
                    console.error('Error inserting item:', err);
                    // If it’s the last item, send the response with failure
                    if (index === items.length - 1) {
                        return res.status(500).json({ error: "Failed to insert some items" });
                    }
                    return;
                }
                // Update the minimal stock after inserting the item
                db.query(minimalSql, [amount, itemId], (err) => {
                    if (err) {
                        console.error('Error updating minimal stock:', err);
                        return res.status(500).json({ error: "Failed to update stock" });
                    }
                });
                count++;
                //check if all items were added properly
                if (count === items.length) {
                    res.status(201).json({ message: "Order added successfully" });
                }
            });
        });
    });
});
// update the status 
router.patch("/orders/:orderId", (req, res) => {
    const orderId = req.params.orderId;
    const { order_status } = req.body;
    const updateOrderSql = 'UPDATE orders SET status = ? WHERE id = ?;';
    db.query(updateOrderSql, [order_status, orderId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Order updated successfully" });
    });
});
module.exports = router