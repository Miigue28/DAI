import express from 'express'
import nunjucks from 'nunjucks'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import swaggerUi from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'


import { connect_db } from './model/db.js'
import ShopRouter from './routes/router_tienda.js'
import UserRouter from './routes/router_usuarios.js'
import APIRouter from './routes/router_api.js'

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
    req.is_admin = data.admin
		app.locals.name = data.name
		res.locals.is_admin = data.admin
	} else {
		app.locals.name = undefined
		res.locals.is_admin = undefined
	}
	next()
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0', 
    info: {
      title: 'Mercamona API',
      version: '1.0.0',
      description: 'API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:8000',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated product ID',
              example: '60d5f3f7a1b7e3001f0e4b8c'
            },
            category: {
              type: 'string',
              example: 'Frutas'
            },
            subcategory: {
              type: 'string',
              example: 'Fruta de hueso'
            },
            img_src: {
              type: 'string',
              example: 'https://example.com/image.jpg'
            },
            img_alt: {
              type: 'string',
              example: 'Melocotón'
            },
            format_text: {
              type: 'string',
              example: 'Bolsa 1 kg'
            },
            price_text: {
              type: 'string',
              example: '1,99 €/kg'
            },
            price_number: {
              type: 'number',
              format: 'float',
              example: 1.99
            },
            discount: {
              type: 'boolean',
              example: false
            },
            discount_price_number: {
              type: 'number',
              format: 'float',
              example: 1.75
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/', ShopRouter)
app.use('/user', UserRouter)
app.use('/api', APIRouter)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})