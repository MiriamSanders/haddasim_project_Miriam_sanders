import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from '../App';
//deal with reload ...
function ViewOrders() {
    const [orderList, setOrderList] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    useEffect(() => {
        if (auth != id) {
            navigate('/login');
        }
        async function fetchOrders() {
            const response = await fetch(`http://localhost:3000/orders/${id}`);
            const result = await response.json();
            setOrderList(result);
            console.log(result);

        }

        fetchOrders();
    }, [id, auth, navigate]);
    async function approveOrder(id) {
        const response = await fetch(`http://localhost:3000/orders/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ order_status: "in-progress" }),
        });
        if (response.ok) {
            setOrderList(prev =>
                prev.map((order) =>
                    order.order_id === id ? { ...order, orderStatus: "in-progress" } : order));
        }
    }
    return (
        <div >
            <button onClick={() => { navigate('/login'); setAuth(null) }}>logout</button>
            {orderList && orderList.map((item) => (
                <div key={item.order_id} className="view_order">
                    <h1>{item.order_id}</h1>
                    <p>{item.date}</p>
                    <p>{item.orderStatus}</p>
                    <ul>
                        {item.items && item.items.map(good => <li>name : {good.item_name}  | quantity : {good.quantity}</li>)}
                    </ul>
                    {item.orderStatus === "pending" && <button onClick={() => approveOrder(item.order_id)}>approve order</button>}
                </div>
            ))}
        </div>
    );
}
export default ViewOrders;