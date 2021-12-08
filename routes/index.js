const express = require('express')
const router = express.Router()
const Video = require('../models/video')

router.get('/', async (req, res) => {
    let videos
    try {
      videos = await Video.find().sort({ createdAt: 'desc' }).limit(10).exec()
    } catch {
      videos = []
    }
    res.render('index', { videos: videos })
})

module.exports = router