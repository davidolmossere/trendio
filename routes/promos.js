const express = require('express')
const router = express.Router()
const Promo = require('../models/promo')

// All Promos Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const promos = await Promo.find(searchOptions)
        res.render('promos/index', {
            promos: promos, 
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Promo Route
router.get('/new', (req, res) => {
    res.render('promos/new', { 
        promo: new Promo(), 
        promoTypes: Promo.promoTypes
    })
})

// Create Promo Route
router.post('/', async (req, res) => {
    const promo  = new Promo({
        label: req.body.label,
        createdAt: req.body.createdAt,
        expirationDate: req.body.expirationDate,
        dealType: req.body.dealType,
        value: req.body.value
    })
    try {
        const newPromo = await promo.save()
        res.redirect(`promos/`)
    } catch {
        res.render('promos/new', {
            promo: promo,
            errorMessage: 'Error creating Promo'
        })
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id)
        res.render('promos/edit', { 
            promo: promo,
            promoTypes: Promo.promoTypes
        })
    } catch {
        res.redirect('/promos')
    }
})

router.put('/:id', async (req, res) => {
    let category
    try {
        promo = await Promo.findById(req.params.id)
        promo.label = req.body.label
        promo.createdAt = req.body.createdAt
        promo.expirationDate = req.body.expirationDate
        promo.dealType = req.body.dealType
        promo.value = req.body.value
        await promo.save()
        res.redirect(`/promos/`)
    } catch {
        if (promo == null) {
            res.redirect('/')
        } else {
            res.render('promos/edit', {
                promo: promo,
                errorMessage: 'Error updating Promo'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let promo
    try {
        promo = await Promo.findById(req.params.id)
        await promo.remove()
        res.redirect('/promos')
    } catch {
        if (promo == null) {
            res.redirect('/')
        } else {
            res.redirect(`/promos/${promo.id}`)
        }
    }
})

module.exports = router