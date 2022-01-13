const express = require('express')
const router = express.Router()
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const Creator = require('../models/creator')
const Video = require('../models/video')

const uploadPath = path.join('public', Creator.thumbnailBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath)
    }
})
const upload = multer({
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }, 
    storage: storage
})

// All Creators Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const creators = await Creator.find(searchOptions).sort({name: 1})
        res.render('creators/index', {
            creators: creators, 
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Creator Route
router.get('/new', (req, res) => {
    res.render('creators/new', { creator: new Creator() })
})

// Create Creator Route
router.post('/', upload.single('thumbnailName'), async (req, res) => {
    const { filename: thumbnailName } = req.file;
    // await sharp(req.file.path)
    // .resize({ width: 250, height: 250 })
    // .jpeg()
    // .toFile(
    //     path.resolve(req.file.destination,'resized',thumbnailName)
    // )
    // fs.unlinkSync(req.file.path)
    
    const fileName = req.file != null ? req.file.filename : null
    const creator  = new Creator({
        name: req.body.name,
        createdAt: req.body.createdAt,
        thumbnailName: fileName
    })
    try {
        const newCreator = await creator.save()
        res.redirect(`creators/${newCreator.id}`)

    } catch {
        if (creator.thumbnailName != null) {
            removeCreatorThumbnail(creator.thumbnailName)
        }
        res.render('creators/new', {
            creator: creator,
            errorMessage: 'Error creating Creator'
        })
    }
})

// Show Creator Route
router.get('/:id', async (req, res) => {
    try {
        const creator = await Creator.findById(req.params.id)
        const videos = await Video.find({ creator: creator.id }).limit(6).exec()
        res.render(`creators/show`, {
            creator: creator,
            videosByCreator: videos
        })
    } catch {
        res.redirect('/')
    }
})

// Edit Creator Route
router.get('/:id/edit', async (req, res) => {
    try {
        const creator = await Creator.findById(req.params.id)
        res.render('creators/edit', { creator: creator })
    } catch {
        res.redirect('/creators')
    }
})

// Update Creator Route
router.put('/:id', upload.single('thumbnailName'), async (req, res) => {
    let creator
    const fileName = req.file != null ? req.file.filename : null 
    try {
        creator = await Creator.findById(req.params.id)
        creator.name = req.body.name
        creator.createdAt = req.body.createdAt
        if (fileName != null && fileName !=='' ) {
            creator.thumbnailName = fileName
        }
        await creator.save()
        res.redirect(`/creators/${creator.id}`)
    } catch {
        if (creator == null) {
            res.redirect('/')
        } else {
            res.render('creators/edit', {
                creator: creator,
                errorMessage: 'Error updating Creator'
            })
        }
    }
})

// Delete Creator Route
router.delete('/:id', async (req, res) => {
    let creator
    try {
        creator = await Creator.findById(req.params.id)
        await creator.remove()
        res.redirect('/creators')
    } catch {
        if (creator == null) {
            res.redirect('/')
        } else {
            res.redirect(`/creators/${creator.id}`)
        }
    }
})
function removeCreatorThumbnail(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err)
    })
}
module.exports = router