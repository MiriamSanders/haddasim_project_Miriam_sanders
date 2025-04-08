import React, { useState, useContext } from "react";
import "../styles/Register.css";
import { useNavigate } from "react-router-dom";
import AddItem from "./AddItem";
import { AuthContext } from "../App";
function Register({ type }) {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [rep, setRep] = useState("");
    const [goods, setGoods] = useState([]);
    const [add, setAdd] = useState(false);
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    function resetForm() {
        setUserName("");
        setPassword("");
        setPhone("");
        setRep("");
        setGoods("");
    }
    function ChangePage(page) {
        console.log(page, 'sdf')
        navigate(`/${page}`);
    }

    async function signUpFunction(event) {
        event.preventDefault();
        const companyData = {
            companyName: userName,
            password,
            phone,
            rep,
            goods
        };
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(companyData),
        });

        if (response.ok) {
            const data = await response.json();
            let supplierID = data.supplierId;
            setAuth(supplierID);
            ChangePage(`vieworders/${supplierID}`);
            resetForm();
        }
        else {
            alert("please choose another password")
        }
    }

    async function loginFunction(event) {
        event.preventDefault();
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ companyName: userName, password: password }),
        });
        if (response.ok) {
            const data = await response.json();
            let supplierID = data.supplierId;
            setAuth(supplierID);
            ChangePage(`vieworders/${supplierID}`);
        }
        else {
            alert("company name or password incorrect ,if you don't have an acount please signup")
        }
    }

    return (
        <>
            {type === "signup" ? (
                <form className="register-form" onSubmit={signUpFunction}>
                    <input
                        className="user-name"
                        name="userName"
                        placeholder="User name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />
                    <input
                        className="user-password"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                    />
                    <input
                        className="user-phone"
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                    <input
                        className="user-rep"
                        type="text"
                        name="rep"
                        placeholder="Representative Name"
                        value={rep}
                        onChange={(e) => setRep(e.target.value)}
                        required
                    />
                    <h4>items:</h4>
                    {goods.map((item, index) => (
                        <div key={index}>
                            <li>Name: {item.name} | Price: {item.price} | Minimum: {item.min}</li>
                        </div>
                    ))}

                    <button type="button" onClick={() => setAdd(true)}>add item</button>
                    {add ? <AddItem goods={goods} setGoods={setGoods} setAdd={setAdd} /> : null}
                    <input
                        className="register-input"
                        type="submit"
                        value="Sign Up"
                    />
                    <button className="register-button" onClick={() => ChangePage("login")}>
                        Already have an account? Log in
                    </button>
                </form>
            ) : (
                <form className="register-form" onSubmit={loginFunction}>
                    <input
                        className="user-name"
                        name="userName"
                        placeholder="User name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />
                    <input
                        className="user-password"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        className="register-input"
                        type="submit"
                        value="Log In"
                    />
                    <button className="register-button" type="button" onClick={() => ChangePage("signup")}>
                        Don't have an account? Sign up
                    </button>
                </form>
            )}
        </>
    );
}

export default Register;
