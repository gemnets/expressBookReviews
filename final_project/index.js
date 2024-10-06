const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// Set up session
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware
app.use("/customer/auth/*", (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        console.log("No token provided");
        return res.status(401).send("Access Denied: No Token Provided!");
    }

    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(403).send("Access Denied: Invalid Token Format!");
    }

    jwt.verify(tokenParts[1], 'access', (err, decoded) => {
        if (err) {
            console.log("Invalid token", err);
            return res.status(403).send("Access Denied: Invalid Token!");
        }
        req.user = decoded;
        next();
    });
});



const PORT = 5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
