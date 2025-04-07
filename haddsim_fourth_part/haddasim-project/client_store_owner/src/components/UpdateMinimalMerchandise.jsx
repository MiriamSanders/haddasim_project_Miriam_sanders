import React, { useEffect, useState } from "react";
function UpdateMinimalMerchandise() {
    const [merchandise, setMerchandise] = useState([]);
    useEffect(() => {
        async function fetchMin() {
            const response = await fetch('http://localhost:3000/minimalitems');
            const result = await response.json();
            setMerchandise(result);
            console.log(result);

        }
        fetchMin();
    }, []);


    function handleChange(itemName, newAmount) {
        setMerchandise(prevMerchandise =>
            prevMerchandise.map(good =>
                good.item_name === itemName
                    ? { ...good, minimal_amount: newAmount }
                    : good
            )
        );
    };

    async function handleUpdate() {
        const updatedMerchandise = merchandise.map(good => ({
            ...good,
            minimal_amount: good.minimal_amount === null ? 0 : good.minimal_amount
        }));

        const response = await fetch('http://localhost:3000/minimalitems', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMerchandise),
        });
        if (response.ok) {
            alert("minimum values updated")
        }
        else {
            alert('unable to update , please try again later')
        }
    };

    return (
        <div>
            <h1>Update Minimal Merchandise</h1>
            {merchandise.map((item) => (
                <div key={item.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{item.item_name}</span>
                        <input
                            type="number"
                            value={(merchandise.find(good => good.item_name === item.item_name)?.minimal_amount)}
                            onChange={(e) => handleChange(item.item_name, parseInt(e.target.value))}
                            style={{ width: "60px" }}
                        />
                    </div>
                </div>
            ))}
            <button onClick={handleUpdate}>Save Changes</button>
        </div>
    );
};

export default UpdateMinimalMerchandise;
