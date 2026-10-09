const router = require("express").Router();
const protect = require("../middlewares/auth.middleware");
const controller = require("../controllers/cart.controller");
router.use(protect);
router.get("/", controller.getCart);
router.post("/:productId", controller.addCart);
router.patch("/:productId", controller.updateCart);
router.delete("/:productId", controller.removeCart);
module.exports = router;
