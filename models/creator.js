const mongoose = require('mongoose')
const Video = require('./video')

const creatorSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

creatorSchema.pre('remove', function(next) {
    Video.find({ creator: this.id }, (err, videos) => {
        if (err) {
            next(err)
        } else if (books.length > 0) {
            next(new Error('This creator has videos still'))
        } else {
            next()
        }
    })
})
module.exports = mongoose.model('Creator', creatorSchema)