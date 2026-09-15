const router = require("express").Router();
const { createProduct, getProducts, getProduct } = require("../controllers/product.controller");
router.route("/").post(createProduct).get(getProducts); router.get("/:id", getProduct);
module.exports = router;
