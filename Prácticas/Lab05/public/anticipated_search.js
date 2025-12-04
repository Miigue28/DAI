const bar = document.getElementById('search-bar');

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

const anticipated_search = (event) => {
  try {
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
        resultsFound.textContent = `Mostrando ${data.n_products} resultados para "${query}"`;
        
        const resultsContainer = document.getElementById('results-container');
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
    else
    {
      const resultsFound = document.getElementById('results-found');
      resultsFound.classList.remove('flex');
      resultsFound.classList.add('hidden');

      const resultsContainer = document.getElementById('results-container');
      // Eliminamos los resultados anteriores
      resultsContainer.innerHTML = '';
    }
  } catch (err) {
    console.error(`Error performing query: ${err}`);
  }
}

bar.addEventListener('input', anticipated_search);