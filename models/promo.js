const mongoose = require('mongoose')
const promoTypes = ['discount', 'credit', 'bundle']
  
const promoSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    expirationDate: {
        type: Date
    },
    dealType: {
        type: String
    },
    value: {
        type: Number
    }
})

module.exports = mongoose.model('Promo', promoSchema)
module.exports.promoTypes = promoTypes
