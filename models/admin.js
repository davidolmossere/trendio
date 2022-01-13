const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
    name: { 
        type: String
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

// Response cleaning method
adminSchema.methods.toJSON = function () {
    const admin = this
    const adminObject = admin.toObject()

    delete adminObject.password
    delete adminObject.tokens
    
    return adminObject
}

// Token generator method
adminSchema.methods.generateAuthToken = async function () {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString() }, 'delaboetieetgeorgespompidoudoubidou')
    admin.tokens = admin.tokens.concat({ token })
    await admin.save()
    return token
}

// Password comparator
adminSchema.statics.findByCredentials = async (email, password) => {
    const admin = await mongoose.model('Admin').findOne( {email: email} )
    if (!admin) {
        throw new Error ('This admin does not exist')
    }
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
        throw new Error ('Unable to log in')
    }
    return admin
}

// Hash the plain text password before saving
adminSchema.pre('save', async function(next) {
    const admin = this
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }
    next()
})
module.exports = mongoose.model('Admin', adminSchema)
