import React, { useEffect, useState } from 'react';
import { checkout } from '../updateStock';
function SupplierOrder() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [orderLines, setOrderLines] = useState([]);
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    async function fetchSuppliers() {
      const response = await fetch('http://localhost:3000/suppliers');
      const result = await response.json();
      setSuppliers(result);
    }

    fetchSuppliers();
  }, []);

  function handleSupplierChange(e) {
    const supplierId = parseInt(e.target.value);
    const supplier = suppliers.find((s) => s.id === supplierId);
    setSelectedSupplier(supplier);
    setOrderLines([]);
  };

  const handleAddItem = () => {
    setOrderLines([...orderLines, { id: '', item_name: '', amount: '' }]);
  };

  function handleItemChange(index, field, value) {
    const updated = [...orderLines];
    updated[index][field] = value;
    if (field === 'id') {
      const item = selectedSupplier.items.find((i) => i.id === parseInt(value));
      updated[index].item_name = item ? item.item_name : '';
    }
    setOrderLines(updated);
  };

  function getMinAmount(itemId) {
    const item = selectedSupplier?.items.find((i) => i.id === parseInt(itemId));
    return item?.minumal_amount || 1;
  };

  async function handleSubmit() {
    if (!selectedSupplier || orderLines.some((line) => !line.id || !line.amount)) {
      alert('Please complete the order form.');
      return;
    }
    if (orderLines.some((line) => line.amount < getMinAmount(line.id))) {
      alert('some fields are less then the minimal amount please add ');
      return
    }
    const order = {
      supplier: selectedSupplier.id,
      items: orderLines,
      date: new Date().toISOString().toLocaleString(),
    };
    setOrderData([...orderData, order]);
    setSelectedSupplier(null);
    setOrderLines([]);
    const response = await fetch('http://localhost:3000/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    if (response.ok) {
      alert('Order submitted successfully!');
    } else {
      alert('Error submitting the order.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Order from Supplier</h1>
      <select onChange={handleSupplierChange} value={selectedSupplier?.id || ''}>
        <option value="">Select a Supplier</option>
        {suppliers.map((supplier) => (
          <option key={supplier.id} value={supplier.id}>
            {supplier.company_name}
          </option>
        ))}
      </select>
      {selectedSupplier && (
        <div>
          <h2>Items from {selectedSupplier.company_name}</h2>
          {orderLines.map((line, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <select
                value={line.id}
                onChange={(e) => handleItemChange(index, 'id', e.target.value)}
              >
                <option value="">Select Item</option>
                {selectedSupplier.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={line.amount}
                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={handleAddItem}>Add Item</button>
          <button onClick={handleSubmit} style={{ marginTop: 20 }}>
            Submit Order
          </button>
        </div>

      )}
      <div style={{ marginTop: 30 }}>
        <h3>Submitted Orders:</h3>
        {orderData.map((order, index) => (
          <div key={index} style={{ border: '1px solid #ccc', margin: '10px 0', padding: 10 }}>
            <p><strong>Supplier:</strong> {order.supplier}</p>
            <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.item_name} - {item.amount}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SupplierOrder;
