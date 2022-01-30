const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const auth = require('../middleware/auth')

const Video = require('../models/video')
const Category = require('../models/category')
const Creator = require('../models/creator')
const Product = require('../models/product')

const uploadPath = path.join('public', Video.thumbnailBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    limits: {
        fileSize: 2000000
    },
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Video Route
router.get('/', auth, async (req, res) => {
    let query = Video.find()
    if (req.query.setTitle != null && req.query.setTitle != '') {
        query = query.regex('setTitle', new RegExp(req.query.setTitle, 'i'))
    }
    try {
        const categories = await Category.find({})
        const creators = await Creator.find({})
        const videos = await query.exec()
        res.render('videos/index', {
            videos: videos,
            categories: categories,
            creators: creators,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Video Route
router.get('/new', auth, async (req, res) => {
    renderNewPage(res, new Video())
})

// Create Video Route
router.post('/', upload.single('thumbnailName'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : 'default.jpg' 
    const realCat = req.body.category != '' ? req.body.category : null
    const realCreator = req.body.creator != '' ? req.body.creator : null
    const realVisibility = req.body.visibility == 'on' ? true : false

    const video  = new Video({
        setTitle: req.body.setTitle,
        category: realCat,
        createdAt: new Date(req.body.createdAt),
        creator: realCreator,
        description: req.body.description,
        position: req.body.position,
        products: req.body.products,
        thumbnailName: fileName,
        videoFileName: req.body.videoFileName,
        videoUrl: req.body.videoUrl,
        visibility: realVisibility
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
router.get('/:id', auth, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('creator').exec()
        const categories = await Category.find({})
        const products = await Product.find({})
        res.render('videos/show', {
            categories: categories,
            video: video, 
            products: products
        })
    } catch {
        res.redirect('/')
    }
})

// Edit Video Route
router.get('/:id/edit', auth, async (req, res) => {
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
    let transitionVidProds = []
    const fileName = req.file != null ? req.file.filename : null
    const realVisibility = req.body.visibility == 'on' ? true : false
    try {
        video = await Video.findById(req.params.id)
        video.setTitle = req.body.setTitle
        video.description = req.body.description
        video.createdAt = new Date(req.body.createdAt)
        video.visibility = realVisibility
        video.position = req.body.position
        video.videoFileName = req.body.videoFileName
        video.creator = req.body.creator != '' ? req.body.creator : null,
        video.category = req.body.category != '' ? req.body.category : null,
        video.videoUrl = req.body.videoUrl
        // if selected None in Products
        if (req.body.products === '') {
            video.products = []
        } else if (req.body.products !== undefined) {
            // if selected many Products
            if (Array.isArray(req.body.products)){
                req.body.products.forEach(item => {
                    transitionVidProds.push(item)
                })
                video.products = transitionVidProds
            } else {
            // if selected only 1 Product
                video.products = req.body.products
            }
        }

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
router.delete('/:id', auth, async (req, res) => {
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
        const products = await Product.find({})
        const params = {
            creators: creators,
            categories: categories,
            products: products,
            video: video
        }
        if (hasError) {
            if (form === 'edit') {
              params.errorMessage = 'Error Updating Video. Check the Categories field as it is mandatory.'
            } else {
              params.errorMessage = 'Error Creating Video'
            }
        }
        res.render(`videos/${form}`, params)
    } catch {
      res.redirect('/videos')
    }
}

router.get('*', async (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/' + '404.html'));
})

module.exports = router