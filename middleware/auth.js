require('dotenv').config();

const jwt = require('jsonwebtoken')
const Admin = require('../models/admin')

const auth = async (req, res, next) => {
    try {
        let token
        let token_header = req.header('Authorization')
        if (token_header) {
            token = token_header.replace('Bearer ','')
        } else {
            token = req.cookies.access_token;
            if (!token) {
                return res.status(403).redirect('/admins/login')
            }
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const admin = await Admin.findOne({_id: decoded._id, 'tokens.token': token})
        
        if (!admin) {
            throw new Error('Try again...');
        }
        req.token = token
        req.admin = admin
        next()
    }
    catch (e) {
        res.status(401).send({error: 'Please authenticate'})
    }
}

module.exports = auth