const Product = require('../models/productModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');

// Create Product - Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
});


// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, resp) => {

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage)
    const products = await apiFeatures.query;

    resp.status(200).json({
        success: true,
        productCount,
        products
    })
});

// Update Product -- Admin

exports.updateProduct = catchAsyncErrors(async (req, resp, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return resp.status(500).json({
            success: false,
            message: "Product Not Found"
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    resp.status(200).json({
        success: true,
        product
    })
});

// Get Product Details

exports.getProductDetails = catchAsyncErrors(async (req, resp, next) => {



    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }


    resp.status(200).json({
        success: true,
        product
    })

});

// Delete Product -- Admin

exports.deleteProduct = catchAsyncErrors(async (req, resp, next) => {



    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }

    await product.remove();

    resp.status(200).json({
        success: true,
        message: "Product deleted successfully"
    })

});

// Create new review or update review 

exports.createProductReview = catchAsyncErrors(async (req, resp, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }


    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler('Product  ot found', 400))
    }

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user.id.toString()) {
                rev.rating = rating
                rev.comment = comment

            }
        })

    } else {
        product.reviews.push(review);
        product.numberOfReview = product.reviews.length
    }

    let sum = 0;

    product.reviews.forEach((rev) => {
        sum += rev.rating;
    }) 

    let avg = sum / product.reviews.length



    product.ratings = Number.parseFloat(avg.toFixed(1))


    await product.save({ validateBeforeSave: false })

    resp.status(200).json({
        success: true,
    })


})


// Get All reviews of product 

exports.getProductReviews = catchAsyncErrors( async(req, resp, next) => {

    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler('Product  ot found', 400))
    }

    resp.status(200).json({
        success:true,
        reviewsCount:product.reviews.length,
        reviews:product.reviews
    })
})