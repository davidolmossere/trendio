const express = require('express')
const router = express.Router()
const path = require('path')

const Video = require('../models/video')
const Creator = require('../models/creator')

router.get('/', async (req, res) => {
    let videos
    let creators
    try {
      creators = await Creator.find({})
      videos = await Video.find().sort({ createdAt: 'desc' }).limit(10).exec()
    } catch {
      videos = []
    }
    res.render('index', { 
      layout: 'layouts/public-layout',
      videos: videos,
      creators: creators
    })
})

// router.get('*', async (req, res) => {
//   res.status(404).sendFile(path.join(__dirname, '../public/' + '404.html'));
// })

module.exports = router