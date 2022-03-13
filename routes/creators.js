const express = require('express')
const router = express.Router()

const path = require('path')
const fs = require('fs')
const crypto = require('crypto');
const auth = require('../middleware/auth')

const Creator = require('../models/creator')
const Video = require('../models/video')

const uploadPath = path.join('public', Creator.thumbnailBasePath)

// All Creators Route
router.get('/', auth, async (req, res) => {
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

// Create Creator Route
router.post('/', async (req, res) => {
    const {name,createdAt, filepond} = req.body
    const fileName = filepond != null ? crypto.randomUUID() : 'default.jpg' 
    if (filepond != null) {
        saveImage(fileName,filepond)
    }
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

// New Creator Route
router.get('/new', auth, (req, res) => {
    res.render('creators/new', { creator: new Creator() })
})

// Show Creator Route
router.get('/:id', auth, async (req, res) => {
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
router.get('/:id/edit', auth, async (req, res) => {
    try {
        const creator = await Creator.findById(req.params.id)
        res.render('creators/edit', { creator: creator })
    } catch {
        res.redirect('/creators')
    }
})

// Update Creator Route
router.put('/:id', async (req, res) => {
    const filepond = req.body.filepond
    const fileName = filepond != null ? crypto.randomUUID() : 'default.jpg' 
    if (filepond != null) {
        saveImage(fileName,filepond)
    }
    let creator
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
router.delete('/:id', auth, async (req, res) => {
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

router.get('/*', async (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/' + '404.html'));
})

function saveImage(fileName,imgEncoded) {
    if (imgEncoded == null) return;
    const pathToSave = uploadPath + "/" + fileName
    const img = JSON.parse(imgEncoded);
    if (img != null) {
        imgBuffered = new Buffer.from(img.data, "base64");
        fs.writeFile( pathToSave, imgBuffered, function (err) {
            if (err) {
                console.log("An error occurred while writing to File.");
                return console.log(err);
            }
        });
    }
}
  
function removeCreatorThumbnail(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err)
    })
}
module.exports = router