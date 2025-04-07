
require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = 3000;
app.use(express.json());
const authRoutes = require('./routes/authenticationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const minimalItemRoutes = require('./routes/itemRoutes');

app.use(authRoutes);
app.use(orderRoutes);
app.use(supplierRoutes);
app.use(minimalItemRoutes)
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
