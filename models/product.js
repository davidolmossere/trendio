const mongoose = require('mongoose')
const path = require('path')
const thumbnailBasePath = 'uploads/thumbnails/products'

const productSchema = new mongoose.Schema({
    prodTitle: { 
        type: String, 
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    brand: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promo'
    },
    description: {
        type: String
    },
    madeIn: {
        type: String
    },
    position: {
        type: Number
    },
    price: {
        type: Number
    },
    prodLaunchDate: {
        type: Date
    },
    productUrl: {
        type: String
    },
    qty: {
        type: Number
    },
    rating: {
        type: Number
    },
    shade: {
        type: String
    },
    size: {
        type: String
    },
    sku: {
        type: String
    },
    stockStatus: {
        type: Boolean,
        default: true
    },
    supplier: {
        type: String
    },
    thumbnailName: {
        type: String
    },
    visibility: {
        type: Boolean, 
        default: true
    },
    weight: {
        type: Number
    }
})

productSchema.virtual('thumbnailPath').get(function() {
    if (this.thumbnailName != null) {
      return path.join('/', thumbnailBasePath, this.thumbnailName)
    }
})

module.exports = mongoose.model('Product', productSchema)
module.exports.thumbnailBasePath = thumbnailBasePath
