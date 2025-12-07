# Lab 03: Authentication

> Author: Miguel Ángel Moreno Castro

## Authentication

In this lab we're going to focus on user management and how to deal with it's authentication when using our web. Firstly, we're going to make use of our **user icon** to provide it with some functionality. To do so, we're going to start by creating a new Mongoose Schema for our users

```js
const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	surname: {
		type: String,
		required: false,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true,
		minLength: 6
	},
	created_at: {
		type: Date,
		default: Date.now
	}
});
```

To deal with security concerns we'll need to hash the password of each user so we don't store them in plain text. We'll use `bcrypt` for that, so you install it by

```sh
npm install bcrypt
```

We'll require two main operations when dealing with users in our database. The first of them is hashing the password before introducing any new user to the database.

```js
userSchema.pre('save', async function(next) {
	try {
		// Check if the password has been modified
		if (!this.isModified('password')) return next();
		// Generate a salt and hash the password
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		// Proceed to save operation
		next();
	} catch (error) {
		next(error);
	}
});
```

Then, for every logging, we'll need to check if the provided password when hashed matches the stored hash. This is archieved with the `compare()` method from `bcrypt`

```js
userSchema.methods.is_valid_password = async function(password) {
	try {
		return await bcrypt.compare(password, this.password);
	} catch (error) {
		throw new Error("Password comparison failed");
	}
};
```

The next phase is to create a new router to manage user operations like `/login`, `/register` and `/logout`.  Given the methods described above to manage user creation the registration steps are then straightforward, we just retrieve the user information from the `POST` body and create a new User document.

```js
// Register
router.post('/register', async (req, res) => {
	try {
		const { name, surname, email, password } = req.body;
		const user = new User({ name, surname, email, password });
		await user.save();
		res.redirect('/');
	} catch (err) {
		res.status(500).send(`Registration failed: ${err}`);
	}
});
```

However, the login operation is more delicate because we need to implement a way to authenticate the user. This ensures that once logged in, every subsequent HTTP request can be recognized as originated from them. This can be achieved by using  [JWT](https://auth0.com/docs/secure/tokens/json-web-tokens) tokens stored in [HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies). With this method, the browser automatically sends the token back to the server as a cookie with each HTTP request, allowing the application to authenticate the user. 

```js
// Login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		// Find user by email
		const user = await User.findOne({email});
		if (!user) {
			return res.status(401).send('User not found');
		}
		// Validate password
		const is_match = await user.is_valid_password(password);
		if (!is_match) {
			return res.status(401).send('Invalid password');
		}
		// Sign JWT token
		const token = jwt.sign({email: user.email}, process.env.SECRET_KEY);
		// Set cookie with token
		res.cookie("access_token", token, {
			httpOnly: true,
			// In production, set secure flag
			secure: process.env.IN === 'production'
		}).redirect("/")
	} catch (err) {
		res.status(500).send(`Login failed: ${err}`);
	}
});
```

Finally, the logout operation consits of clearing the authentication cookie.

```js
// Logout
router.get('/logout', (req, res) => {
	// Manage cookie destruction
	res.clearCookie('access_token');
	res.redirect('/')
});
```

We've previously mentioned that once a user is authenticated, each subsequent HTTP request contains a cookie with their token. On the server side, the verification of this token is performed by the following middleware:

```js
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
```

## Authorization

In this section, we aim to introduce some user with **administrator** permissions. We'll first modify the `User` schema to contain a new `admin` attribute.

```js
const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	surname: {
		type: String,
		required: false,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true,
		minLength: 6
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	admin: {
		type: Boolean,
		default: false,
		required: false
	}
});
```

We'll then need to add the admin attribute to the JWT token to provide with certain permisions to those users. The following line is modified from the `/login` route:

```js
const token = jwt.sign({email: user.email, admin: user.admin}, process.env.SECRET_KEY)
```

Analogously, the following lines are added to the authentication middleware

```js
req.is_admin = data.admin
res.locals.is_admin = data.admin
```

> Here we use `res.locals` instead of `app.locals` because we don't want allow admin status leakage to the UI.

Finally, we add a new button to the `item_card.html` macro that is only visible to admin users.

```html
{% if is_admin %}
	<a class="btn w-100 btn-outline-warning rounded-pill mt-2">
		<i class="fa-solid fa-pen-to-square me-2"></i>
	</a>
{% endif %}
```

> To allow macros see app context is required to add `with context` in the macro import

