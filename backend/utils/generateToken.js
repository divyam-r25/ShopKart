const jwt = require("jsonwebtoken");
module.exports = (customerId) => jwt.sign({ id: customerId }, process.env.JWT_SECRET || "shopkart-development-secret", { expiresIn: "7d" });
