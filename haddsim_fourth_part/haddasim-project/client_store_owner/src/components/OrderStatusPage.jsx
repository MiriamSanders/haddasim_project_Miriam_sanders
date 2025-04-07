import React, { useEffect, useState } from 'react';
import OrderStatus from "./OrderStatus"
function OrderStatusPage() {
  const [ordersData, setOrdersData] = useState([]);
  const [showFilterOrders, setShowFilterOrders] = useState(false);
  useEffect(() => {
    async function fetchAllorders() {
      const response = await fetch(`http://localhost:3000/orders`);
      const result = await response.json();
      const updatedOrders = result.map(order => ({ ...order, inprogress: true }));
      setOrdersData(updatedOrders);
      console.log(updatedOrders);
    }

    fetchAllorders();
  }, []);
  function filterOrders() {
    setShowFilterOrders(!showFilterOrders);
    const nextState = !showFilterOrders
    if (nextState) {
      setOrdersData(prev =>
        prev.map(order =>
          order.orderStatus === "received" ? { ...order, inprogress: false } : order
        )
      );
    }
    else {
      setOrdersData(prev => prev.map(order => ({ ...order, inprogress: true })));
    }
  }

  return (
    <div>
      <h1>Existing Orders Status</h1>
      <button onClick={filterOrders}>{showFilterOrders ? "show all orders" : "show orders in progress"}</button>
      <div>
        {ordersData.map(order => {
          if (order.inprogress) {
            return <OrderStatus order={order} key={order.order_id} />;
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default OrderStatusPage;
