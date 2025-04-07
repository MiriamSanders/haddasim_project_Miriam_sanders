import { useState } from "react";
function OrderStatus({ order }) {
    const [selectedOrder, setSelectedOrder] = useState(false);
    async function updateStatus() {
        try {
            const response = await fetch(`http://localhost:3000/orders/${order.order_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ order_status: "received" }),
            });
            if (response.ok) {
                alert("status updated successfuly");
                setSelectedOrder(false);
                order.orderStatus = "received";
            }

        } catch (err) {
            alert(err)
        }
    }
    return (
        <div>
            <div style={{ backgroundColor: "rgba(195, 163, 101, 0.553)", marginBottom: '20px', border: '1px solid #ccc', borderRadius: "20px", padding: '10px' }}>
                <h2>Order from {order.supplier_id}</h2>
                <ul>
                    {order.items.map((item, index) => (
                        <li key={index}>{item.item_name} - Amount: {item.quantity}</li>
                    ))}
                </ul>
                <p>Status: {order.orderStatus}</p>
                {order.orderStatus != "received" && <div>
                    <button onClick={() => setSelectedOrder(true)}>Edit Status</button>


                    {selectedOrder && (
                        <div>
                            <h3>Edit Status for Order from {selectedOrder.supplier_id}</h3>
                            <button onClick={() => {
                                updateStatus();
                            }}>Update Received</button>
                        </div>
                    )}
                </div>
                }

            </div>
        </div>
    )
}
export default OrderStatus
