const router = require("express").Router();
const { register, login, me, logout } = require("../controllers/customer.controller");
const protect = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", logout);

module.exports = router;
