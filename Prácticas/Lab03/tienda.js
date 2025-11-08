import express from 'express'
import nunjucks from 'nunjucks'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

import { connect_db } from './model/db.js'
import ShopRouter from './routes/router_tienda.js'
import UserRouter from './routes/router_usuarios.js'

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

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))

// Middleware to initialize cart in session
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = []
  }
  next()
});

// Middleware for authentication status
app.use((req, res, next) => {
  const token = req.cookies.access_token;
	if (token) {
    // Verify JWT token
		const data = jwt.verify(token, process.env.SECRET_KEY);

    // Attach name to request and locals (for templates)
		req.name = data.name
		app.locals.name = data.name
	} else {
		app.locals.name = undefined
	}
	next()
});

app.use('/', ShopRouter)
app.use('/user', UserRouter)


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