const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const auth = require('../middleware/auth')

const Category = require('../models/category')
const Product = require('../models/product')
const Promo = require('../models/promo')

const uploadPath = path.join('public', Product.thumbnailBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Product Route
router.get('/', auth, async (req, res) => {
    let query = Product.find()
    if (req.query.prodTitle != null && req.query.prodTitle != '') {
        query = query.regex('prodTitle', new RegExp(req.query.prodTitle, 'i'))
    }
    try {
        const categories = await Category.find({})
        const deals = await Promo.find({})
        const products = await query.exec()
        res.render('products/index', {
            categories: categories,
            deals: deals,
            products: products,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Product Route
router.get('/new', auth, async (req, res) => {
    renderNewPage(res, new Product())
})

// Create Product Route
router.post('/', upload.single('thumbnailName'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : 'default.jpg'
    const realCat = req.body.category != '' ? req.body.category : null
    const realDeal = req.body.deal != '' ? req.body.deal : null
    const realStockStatus = req.body.stockStatus == 'on' ? true : false
    const realVisibility = req.body.visibility == 'on' ? true : false
    
    const product  = new Product({
        prodTitle: req.body.prodTitle,
        brand: req.body.brand,
        category: realCat,
        createdAt: new Date(req.body.createdAt),
        deal: realDeal,
        description: req.body.description,
        madeIn: req.body.madeIn,
        position: req.body.position,
        price: req.body.price,
        prodLaunchDate: req.body.prodLaunchDate,
        productUrl: req.body.productUrl,
        qty: req.body.qty,
        rating: req.body.rating,
        shade: req.body.shade,
        size: req.body.size,
        sku: req.body.sku,
        stockStatus: realStockStatus,
        supplier: req.body.supplier,
        thumbnailName: fileName,
        visibility: realVisibility,
        weight: req.body.weight
    })
    try {
        const newProduct = await product.save()
        res.redirect(`products/${newProduct.id}`)

    } catch {
        if (product.thumbnailName != null) {
            removeProductThumbnail(product.thumbnailName)
        }
        renderNewPage(res, product, true)
    }
})

// Show Product Route
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).exec()
        const categories = await Category.find({})
        const deals = await Promo.find({})
        res.render('products/show', {
            categories: categories,
            deals: deals,
            product: product
        })
    } catch {
        res.redirect('/')
    }
})

// Edit Product Route
router.get('/:id/edit', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        renderEditPage(res, product)
    } catch {
        res.redirect('/')
    }
})

// Update Product Route
router.put('/:id', upload.single('thumbnailName'), async (req, res) => {
    let product
    const fileName = req.file != null ? req.file.filename : null 
    const realStockStatus = req.body.stockStatus == 'on' ? true : false
    const realVisibility = req.body.visibility == 'on' ? true : false
    try {
        product = await Product.findById(req.params.id)
        product.prodTitle = req.body.prodTitle,
        product.createdAt = new Date(req.body.createdAt),
        product.brand = req.body.brand,
        product.category = req.body.category != '' ? req.body.category : null,
        product.deal = req.body.deal != '' ? req.body.deal : null,
        product.description = req.body.description,
        product.madeIn = req.body.madeIn,
        product.position = req.body.position,
        product.price = req.body.price,
        product.prodLaunchDate = req.body.prodLaunchDate,
        product.productUrl = req.body.productUrl,
        product.qty = req.body.qty,
        product.rating = req.body.rating,
        product.shade = req.body.shade,
        product.size = req.body.size,
        product.sku = req.body.sku,
        product.stockStatus = realStockStatus,
        product.supplier = req.body.supplier,
        product.visibility = realVisibility,
        product.weight = req.body.weight
        
        if (fileName != null && fileName !=='' ) {
            product.thumbnailName = fileName
        }
        await product.save()
        res.redirect(`/products/${product.id}`)
    } catch (err) {
        if (product != null) {
            renderEditPage(res, product, true)
        } else {
            res.redirect('/')
        }
    }
})

// Delete Product Route
router.delete('/:id', auth, async (req, res) => {
    let product
    try {
        product = await Product.findById(req.params.id)
        await product.remove()
        res.redirect('/products')
    } catch {
        if (product != null) {
            res.render('products/show', {
                product: product,
                errorMessage: 'Could not remove product'
            })
        } else {
            res.redirect('/')
        }
    }
})
function removeProductThumbnail(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err)
    })
}
async function renderNewPage(res, product, hasError = false) {
    renderFormPage(res, product, 'new', hasError)
}

async function renderEditPage(res, product, hasError = false) {
    renderFormPage(res, product, 'edit', hasError)
}

async function renderFormPage(res, product, form, hasError = false) {
    try {
        const categories = await Category.find({})
        const deals = await Promo.find({})
        const params = {
            categories: categories,
            deals: deals,
            product: product
        }
        if (hasError) {
            if (form === 'edit') {
              params.errorMessage = 'Error Updating Product'
            } else {
              params.errorMessage = 'Error Creating Product'
            }
        }
        res.render(`products/${form}`, params)
    } catch {
      res.redirect('/products')
    }
}

router.get('*', async (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/' + '404.html'));
})

module.exports = router