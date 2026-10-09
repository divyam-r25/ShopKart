const router = require("express").Router();
const protect = require("../middlewares/auth.middleware");
const controller = require("../controllers/order.controller");
router.use(protect);
router.post("/create-payment-order", controller.createPaymentOrder);
router.post("/verify-payment", controller.verifyPayment);
router.get("/", controller.getOrders);
router.get("/:id", controller.getOrder);
module.exports = router;
