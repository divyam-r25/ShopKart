const jwt = require("jsonwebtoken");
module.exports = (customerId) => jwt.sign({ id: customerId }, process.env.JWT_SECRET, { expiresIn: "7d" });
