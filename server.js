if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const path = require('path')
const express = require('express')
const cors = require('cors');
const app = express()
const expressLayouts = require('express-ejs-layouts')
const favicon = require('serve-favicon');
const methodOverride = require('method-override')
const cookieParser = require("cookie-parser");

const indexRouter = require('./routes/index')
const creatorRouter = require('./routes/creators')
const categoryRouter = require('./routes/categories')
const videoRouter = require('./routes/videos')
const promoRouter = require('./routes/promos')
const productRouter = require('./routes/products')
const adminRouter = require('./routes/admins')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: false }))
app.use(favicon(path.join(__dirname, 'public', 'media', 'favicon.ico')))
app.use(cors());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/videos', videoRouter)
app.use('/creators', creatorRouter)
app.use('/categories', categoryRouter)
app.use('/promos', promoRouter)
app.use('/products', productRouter)
app.use('/admins', adminRouter)
 
app.listen(process.env.PORT || 3000)