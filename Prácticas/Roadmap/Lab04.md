# Lab 04: API REST + Logging

> Author: Miguel Ángel Moreno Castro

# API REST

REST defines a set of architectural principles by which modern web services are designed to communicate over a network. These design principles are:

- Use HTTP methods explicitly.
- Be stateless.
- Expose directory structure-like URIs.
- Transfer XML, JavaScript Object Notation (JSON), or both

In fact, except for the last one, that is exactly the approach we've been following. We'll start by adding a new  `api` router to our project, where we'll define the following endpoints:

- **GET** `/api/status`: Retrieve all products
- **GET** `/api/products/id`: Retrive desired product
- **POST** `/api/products`: Add a new product
- **DELETE** `/api/products/id`: Delete desired product
- **PUT** `/api/products/id`: Modify desired product

Additionally, we've to make sure we handle correctly any kind of error related to any CRUD operation. The endpoint creation just follows as always:

```js
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve products', details: err });
  }
});
```

The next step is to properly document this API with [Swagger](https://dev.to/cuongnp/swagger-nodejs-express-a-step-by-step-guide-4ob). Firstly, we'll need to install

```bash
npm install swagger-ui-express swagger-jsdoc
```

Next, we need to configure Swagger with the following options

```js
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
```

Add it to the correspoding express middleware

```js
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
```

Finally, we just need to document each of the endpoints following this guideline

```js
/**
 * @swagger
 * /api/products:
 *  get:
 *   summary: Retrieve a list of products
 *   responses:
 *    200:
 *     description: List of all products
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         products:
 *          type: array
 *          items:
 *           $ref: '#/components/schemas/Product'
 *    500:
 *     description: Could not retrieve products
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         error:
 *           type: string
 *         details:
 *           type: string
 *       example:
 *         error: Could not retrieve products
 *         details: "Error message..." 
*/
```

## Logger

We'll also include logging through [Winston](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/), that will help us diagnose any future application issues. Firstly, we'll need to install it by

```sh
npm install winston
```

Then, we'll need to create a logger by

```js
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

This `logger.js` file will be added to a new `utils` directory to keep the project organized. We've modified the logger default output by prepending a timestamp and giving each of them the following format:

```
2025-11-14T08:45:10.552Z [INFO]: Retrieved products successfully
```

Additionally, it writes logs either to the console or a file named `app.log`. We just need to call the corresponding level of the logger and add a descriptive message as shown

```js
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    res.json({ products });
    logger.info('Retrieved products successfully');
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve products', details: err });
    logger.error(`Error retrieving products: ${err}`);
  }
});
```