const express = require('express')
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router()
// Get All Products
router.route("/products").get(getAllProducts);


// Admin Routes
// Create product
router.route("/admin/product/new").post(isAuthenticatedUser, authorizeRoles("admin"),createProduct);
// Update and delete product
router.route("/admin/product/:id")
.put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
.get(getProductDetails)

//Product details
router.route("/product/:id").get(getProductDetails)

//Product review
router.route("/review").put(isAuthenticatedUser, createProductReview)

//Get All Reviews of product
router.route("/reviews").get(getProductReviews)
module.exports = router