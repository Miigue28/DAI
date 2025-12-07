# Lab05: Document Object Model

> Author: Miguel Ángel Moreno Castro

## Modify Price Button

We're going to start by adding some functionality to the `Modify Price` button that we previously added to the admin view. Let's first add an input section so we can specify the new product price:

```html
{% if is_admin %}
    <input 
	    type="number" 
	    max="{{product.price_number}}" 
	    step="0.01" 
	    class="form-control form-control-sm my-2 modify-price-input" 
	    data-product-id="{{ product._id }}" 
	    value="{{ product.price_number }}"
	>
{% endif %}
```

> Here the key [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes) are `data-product-id` and `value`. The first one is used to store the product id whereas the second one stores the new price.

Then, we'll need to set up an **event listener** for every card button. This way,  when a `modify-price-button` is clicked, we can identify which product triggered the event and use its attributes to send the appropriate request to our API. 

```js
const modify_buttons = document.getElementsByClassName('modify-price-button');
for (const button of modify_buttons) {
	button.addEventListener('click', modify_price);
}
```

We can access card attributes via **DOM selectors**  and execute API requests using `fetch()` as follows

```js
const modify_price = (event) => {
  try {
    const button = event.target;
    const card = button.closest('.card');
    const input = card.querySelector('.modify-price-input');
    const product_id = input.dataset.productId;
    const new_price = input.value;
    
    fetch('/api/products/' + product_id, {
		method: 'PUT',
		headers: {
	        'Content-Type': 'application/json; charset=UTF-8'
	    },
		body: JSON.stringify({
	        price_number: parseFloat(new_price)
	      })
	    })
    .then(res => res.json())
    .catch(err => {
	    console.error('Error in modify_price fetch:', err);
    });
	} catch (err) {
		console.error(`Error modifying price: ${err}`);
	}
}
```

The last step is to add this script into the `index.html` head as follows

```html
<script defer src="/public/js/cambio-precio.js"></script>
```

> The `defer` parameter waits until the whole DOM is loaded to execute the script

## Anticipated Search with TailwindCSS

The aim of this task is to perform live searches of products while getting in touch with the [TailwindCSS Framework](https://tailwindcss.com/). 

We'll start by creating a new endpoint called `/anticipated-search` where we're going to host a whole new homepage for the online shop using Tailwind instead of Bootstrap.

```js
router.get("/anticipated-search", (req, res) => {
	res.render('anticipated_search.html');
})
```

We're going to use the Play CDN to try Tailwind directly without any build step. The only thing needed is to add the following script tag to the `<head>` of our HTML file:

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

Then, we'll add a new endpoint to our API which will retrieve the products that matches the query written in the search bar.

```js
router.get('/search/:query', async (req, res) => {
	const query = req.params.query;
	const products = await Product.find({
	    $or: [
		    { category: { $regex: query, $options: 'i' } },
	        { subcategory: { $regex: query, $options: 'i' } },
	        { img_alt: { $regex: query, $options: 'i' } },
	        { format_text: { $regex: query, $options: 'i' } }
		]
    }).lean();
    res.json({ n_products : products.length, products: products });
})
```

As we did earlier, we'll need to add an **event listener** for the search bar.

```js
bar.addEventListener('input', anticipated_search);
```

Next, when any new `input` is typed we'll retrieve the products that matches that query.

```js
const anticipated_search = (event) => {
    const input = event.target;
    const query = input.value;
    
    if (query.length > 1) 
    {
	    fetch('/api/search/' + query)
	    .then(res => res.json())
	    .then(data => {
	        const resultsFound = document.getElementById('results-found');
	        // Enseñamos el número de resultados encontrados
	        resultsFound.classList.remove('hidden');
	        resultsFound.classList.add('flex');
	        resultsFound.textContent = `
		        Mostrando ${data.n_products} resultados para "${query}"
		    `;
	        const resultsContainer = document.getElementById(
	        'results-container'
	        );
	        // Eliminamos los resultados anteriores
	        resultsContainer.innerHTML = '';
	        data.products.forEach(product => {
	          muestra_producto(product);
	        });
		})
		    .catch(err => {
		        console.error('Error in modify_price fetch:', err);
		    });
	}
}
```

We'll then modify a card template that we've designed using Tailwind for each of the products

```html
<template id="plantilla">
    <div class="max-w-sm rounded overflow-hidden w-2/12 hover:shadow">
        <img class="tarjeta-imagen w-10/12 h-3/6 bg-gray-400 ml-5" 
	        src="" 
        	alt="">
        <div class="px-6 py-4">
        	<div class="flex flex-col mb-2 text-sm">
		        <span class="tarjeta-texto-1">
		            Name
	            </span>
		        <span class="tarjeta-texto-2 py-2 text-gray-500 text-xs">
			        Packaging
			    </span>
            </div>
	        <div>
		        <span class="tarjeta-precio font-bold text-gray-800">
			        2,60€
			    </span>
	            <span class="text-gray-400">
		            /ud.
		        </span>
	         </div>
    	</div>
        <div class="px-6 pb-2 text-center">
        	<span class="
	        	w-full inline-block rounded-full 
	        	px-3 py-1 text-sm text-yellow-800 
	        	mr-2 mb-2 border border-yellow-600 
	        	hover:bg-yellow-200">
			        Añadir al carro
	        </span>
        </div>
    </div>
</template>
```

using the **DOM selectors** as we did before

```js
const muestra_producto = (product) => {
	// Recuperamos la plantilla del DOM
	const template = document.getElementById('plantilla')
	// Clona el contenido de la plantilla
	const clonado = template.content.cloneNode(true)
	// Rellena los datos del producto en el clonado
	clonado.querySelector('.tarjeta-imagen').src = product.img_src
	clonado.querySelector('.tarjeta-imagen').alt = product.img_alt
	clonado.querySelector('.tarjeta-texto-1').textContent = product.img_alt
	clonado.querySelector('.tarjeta-texto-2').textContent = product.format_text
	clonado.querySelector('.tarjeta-precio').textContent = product.price_number + '€'
	// Se añade el clonado al contenedor de resultados
	const tarjetas = document.getElementById('results-container')	
	tarjetas.append(clonado)
}
```

to finally add them to the `<main>` tag of our HTML file.

```html
<div class="hidden px-4 mx-4 items-baseline" id="results-found">
    <p class="text-xl text-gray-800 font-normal">
        Encontrados 15 productos
    </p>
</div>
<div class="flex flex-wrap gap-6 mt-8 justify-center" id="results-container">
    <!-- Results will be inserted here -->
</div>
```



