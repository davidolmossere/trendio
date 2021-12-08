const express = require('express')
const router = express.Router()
const Creator = require('../models/creator')
const Video = require('../models/video')

// All Creators Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const creators = await Creator.find(searchOptions)
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
router.post('/', async (req, res) => {
    const creator  = new Creator({
        name: req.body.name,
        createdAt: req.body.createdAt
    })
    try {
        const newCreator = await creator.save()
        res.redirect(`creators/${newCreator.id}`)
    } catch {
        res.render('creators/new', {
            creator: creator,
            errorMessage: 'Error creating Creator'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const creator = await Creator.findById(req.params.id)
        const videos = await Video.find({ creator: creator.id }).limit(6).exec()
        res.render(`creators/show`, {
            creator: creator,
            videosByCreator: videos
        })
    } catch (err) {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const creator = await Creator.findById(req.params.id)
        res.render('creators/edit', { creator: creator })
    } catch {
        res.redirect('/creators')
    }
})

router.put('/:id', async (req, res) => {
    let creator
    try {
        creator = await Creator.findById(req.params.id)
        creator.name = req.body.name
        creator.createdAt = req.body.createdAt
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

module.exports = router