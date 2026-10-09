const router = require("express").Router();
const protect = require("../middlewares/auth.middleware");
const controller = require("../controllers/wishlist.controller");
router.use(protect);
router.get("/", controller.getWishlist);
router.post("/:productId", controller.addWishlist);
router.delete("/:productId", controller.removeWishlist);
module.exports = router;
