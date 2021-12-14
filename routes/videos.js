const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Video = require('../models/video')
const Category = require('../models/category')
const Creator = require('../models/creator')

const uploadPath = path.join('public', Video.thumbnailBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Video Route
router.get('/', async (req, res) => {
    let query = Video.find()
    if (req.query.setTitle != null && req.query.setTitle != '') {
        query = query.regex('setTitle', new RegExp(req.query.setTitle, 'i'))
    }
    try {
        const videos = await query.exec()
        res.render('videos/index', {
            videos: videos,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Video Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Video())
})

// Create Video Route
router.post('/', upload.single('thumbnailName'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null 
    const video  = new Video({
        setTitle: req.body.setTitle,
        description: req.body.description,
        category: req.body.category,
        createdAt: new Date(req.body.createdAt),
        // visibility: req.body.visible,
        position: req.body.position,
        thumbnailName: fileName,
        creator: req.body.creator
    })
    try {
        const newVideo = await video.save()
        res.redirect(`videos/${newVideo.id}`)

    } catch {
        if (video.thumbnailName != null) {
            removeVideoThumbnail(video.thumbnailName)
        }
        renderNewPage(res, video, true)
    }
})

// Show Video Route
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('creator').exec()
        res.render('videos/show', {video: video})
    } catch {
        res.redirect('/')
    }
})

// Edit Video Route
router.get('/:id/edit', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
        renderEditPage(res, video)
    } catch {
        res.redirect('/')
    }
})

// Update Video Route
router.put('/:id', upload.single('thumbnailName'), async (req, res) => {
    let video
    const fileName = req.file != null ? req.file.filename : null 
    try {
        video = await Video.findById(req.params.id)
        video.setTitle = req.body.setTitle
        video.creator = req.body.creator
        video.category = req.body.category
        video.createdAt = new Date(req.body.createdAt)
        video.description = req.body.description
        if (fileName != null && fileName !=='' ) {
            video.thumbnailName = fileName
        }
        await video.save()
        res.redirect(`/videos/${video.id}`)
    } catch (err) {
        console.log(err)
        if (video != null) {
            renderEditPage(res, video, true)
        } else {
            res.redirect('/')
        }
    }
})

// Delete Video Route
router.delete('/:id', async (req, res) => {
    let video
    try {
        video = await Video.findById(req.params.id)
        await video.remove()
        res.redirect('/videos')
    } catch {
        if (video != null) {
            res.render('videos/show', {
                video: video,
                errorMessage: 'Could not remove video'
            })
        } else {
            res.redirect('/')
        }
    }
})
function removeVideoThumbnail(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err)
    })
}
async function renderNewPage(res, video, hasError = false) {
    renderFormPage(res, video, 'new', hasError)
}

async function renderEditPage(res, video, hasError = false) {
    renderFormPage(res, video, 'edit', hasError)
}

async function renderFormPage(res, video, form, hasError = false) {
    try {
        const creators = await Creator.find({})
        const categories = await Category.find({})
        const params = {
            creators: creators,
            categories: categories,
            video: video
        }
        if (hasError) {
            if (form === 'edit') {
              params.errorMessage = 'Error Updating Book'
            } else {
              params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`videos/${form}`, params)
    } catch {
      res.redirect('/videos')
    }
}

module.exports = router