import express from 'express'
import nunjucks from 'nunjucks'
import session from 'express-session'

import { connect_db } from './model/db.js'
import ShopRouter from './routes/router_tienda.js'

await connect_db()

const app = express()
const IN = process.env.IN || 'development'

// Set up Nunjucks configuration flags
nunjucks.configure('views', {
  autoescape: true,
  noCache: IN === 'development',
  watch: IN === 'development',
  express: app
})

app.set('view engine', 'html')
app.use('/static', express.static('public'))
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = []
  }
  next()
})
app.use('/', ShopRouter)


app.get("/hello", (req, res) => {
  res.send({ message: "Hello from an Express API!" })
})

app.get("/test", (req, res) => {
  res.render('base.html')
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})