import { useState } from "react"

function AddItem({ goods, setGoods, setAdd }) {
    const [good, setGood] = useState({ name: "", min: "", price: "" });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setGood((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    function submitNewGood(event) {
        event.preventDefault()
        const goodsArray = [...goods];
        goodsArray.push(good);
        setGoods((prev) => (goodsArray));
        setAdd(false);
    }
    return (<>
        <input placeholder="item name" name="name" onChange={handleChange} />
        <input placeholder="minimal amount" name="min" onChange={handleChange} type="number"/>
        <input placeholder="price" name="price" onChange={handleChange} type="number"/>
        <button onClick={submitNewGood}>add</button>
    </>)
}
export default AddItem