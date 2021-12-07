const express = require('express')
const router = express.Router()
const Category = require('../models/category')

// All Categories Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const categories = await Category.find(searchOptions)
        res.render('categories/index', {
            categories: categories, 
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Category Route
router.get('/new', (req, res) => {
    res.render('categories/new', { category: new Category() })
})

// Create Category Route
router.post('/', async (req, res) => {
    const category  = new Category({
        name: req.body.name,
        createdAt: req.body.createdAt
    })
    try {
        const newCategory = await category.save()
        // res.redirect(`videos/${newVideo.id}`)
        res.redirect(`categories`)
    } catch {
        res.render('categories/new', {
            category: category,
            errorMessage: 'Error creating Video'
        })
    }
})

router.delete('/:id', async (req, res) => {
    let category
    try {
      category = await Category.findById(req.params.id)
      await category.remove()
      res.redirect('/categories')
    } catch {
      if (author == null) {
        res.redirect('/')
      } else {
        res.redirect(`/categories/${category.id}`)
      }
    }
})
module.exports = router