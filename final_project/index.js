const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use('/customer/auth/*', function auth(req, res, next) {
  const authorization = req.session.authorization;

  if (!authorization || !authorization.accessToken) {
    return res.status(401).json({
      message: 'Please log in first'
    });
  }

  jwt.verify(authorization.accessToken, 'access', (err, decoded) => {
    if (err) {
      req.session.authorization = null;

      return res.status(401).json({
        message: 'Invalid or expired token. Please log in again'
      });
    }

    req.user = decoded;
    next();
  });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
