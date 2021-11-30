const express = require('express')
const router = express.Router()
const Video = require('../models/video')

// All Video Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const videos = await Video.find(searchOptions)
        res.render('videos/index', {
            videos: videos, 
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Video Route
router.get('/new', (req, res) => {
    res.render('videos/new', { video: new Video() })
})

// Create Video Route
router.post('/', async (req, res) => {
    const video  = new Video({
        name: req.body.name
    })
    try {
        const newVideo = await video.save()
        // res.redirect(`videos/${newVideo.id}`)
        res.redirect(`videos`)
    } catch {
        res.render('videos/new', {
            video: video,
            errorMessage: 'Error creating Video'
        })
    }
})

module.exports = router