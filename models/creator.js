const mongoose = require('mongoose')
const path = require('path')
const thumbnailBasePath = 'uploads/thumbnails/creators'
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
    },
    thumbnailName: {
        type: String
    }
})

creatorSchema.virtual('thumbnailPath').get(function() {
    if (this.thumbnailName != null) {
      return path.join('/', thumbnailBasePath, this.thumbnailName)
    }
})

creatorSchema.pre('remove', function(next) {
    Video.find({ creator: this.id }, (err, videos) => {
        if (err) {
            next(err)
        } else if (videos.length > 0) {
            next(new Error('This creator has videos still'))
        } else {
            next()
        }
    })
})
module.exports = mongoose.model('Creator', creatorSchema)
module.exports.thumbnailBasePath = thumbnailBasePath
