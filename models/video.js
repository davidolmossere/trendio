const mongoose = require('mongoose')
const path = require('path')
const thumbnailBasePath = 'uploads/thumbnails/videos'
const videoBasePath = 'uploads/videos'

const videoSchema = new mongoose.Schema({
    setTitle: { 
        type: String, 
        required: true
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    visibility: {
        type: Boolean,
        default: true
    },
    position: {
        type: Number
    },
    videoFileName: {
        type: String
    },
    thumbnailName: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Creator'
    },
    videoUrl: {
        type: String
    }
})

videoSchema.virtual('thumbnailPath').get(function() {
    if (this.thumbnailName != null) {
      return path.join('/', thumbnailBasePath, this.thumbnailName)
    }
})
videoSchema.virtual('videoPath').get(function() {
    if (this.videoFileName != null) {
      return path.join('/', videoBasePath, this.videoFileName)
    }
})

module.exports = mongoose.model('Video', videoSchema)
module.exports.thumbnailBasePath = thumbnailBasePath
module.exports.videoBasePath = videoBasePath
