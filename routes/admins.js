const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Admin = require('../models/admin')

// All Admins Route
router.get('/', auth, async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const admins = await Admin.find(searchOptions)
        res.render('admins/index', {
            admins: admins, 
            searchOptions: req.query
        })
    } catch (err) {
        res.redirect('/')
    }
})

// New Admin Route
router.get('/new', auth, (req, res) => {
    res.render('admins/new', { 
        admin: new Admin()
    })
})

// Login Route
router.get('/login', (req, res) => {
    res.render('admins/login', { 
        layout: 'layouts/login-layout'
      })
})

//  Login  Route
router.post('/login', async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await admin.generateAuthToken()
        // res.send({admin, token})
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
             })
            .status(200)
            .redirect('/admins');
    }
    catch (err) {
        res.status(400)
        .render('admins/login', {
            errorMessage: err.message
        })
    }
})

//  Logout  Route
router.post('/logout', auth, async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save()

        res.send()
    }
    catch (err) {
        res.status(500)
        .render('admins/login', {
            errorMessage: err.message
        })
    }
})

// Create Admin Route
router.post('/', auth, async (req, res) => {
    const admin  = new Admin({
        name: req.body.name,
        createdAt: req.body.createdAt,
        email: req.body.email,
        password: req.body.password
    })
    try {
        const newAdmin = await admin.save()
        res.redirect(`admins/`)
    } catch (err) {
        res.render('admins/new', {
            admin: admin,
            errorMessage: err.message
        })
    }
})

router.get('/:id/edit', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id)
        res.render('admins/edit', { 
            admin: admin
        })
    } catch {
        res.redirect('/admins')
    }
})

router.put('/:id', async (req, res) => {
    try {
        admin = await Admin.findById(req.params.id)
        admin.name = req.body.name
        admin.createdAt = req.body.createdAt
        admin.email = req.body.email
        admin.password = req.body.password
        await admin.save()
        res.redirect(`/admins/`)
    } catch (err) {
        if (admin == null) {
            res.redirect('/')
        } else {
            res.render('admins/edit', {
                admin: admin, 
                errorMessage: err.message
            })
        }
    }
})

router.delete('/:id', auth, async (req, res) => {
    let admin
    try {
        admin = await Admin.findById(req.params.id)
        await admin.remove()
        res.redirect('/admins')
    } catch {
        if (admin == null) {
            res.redirect('/')
        } else {
            res.redirect(`/admins/${admin.id}`)
        }
    }
})

router.get('/logout', auth, async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save()

        res
        .clearCookie("access_token")
        .status(200)
        .redirect('/admins/login');
    }
    catch (e) {
        res.status(500).send()
    }
  });

router.get('*', async (req, res) => {
    res.redirect('/admins/login');
})

module.exports = router