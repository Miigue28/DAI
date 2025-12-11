function ProductCard({product}){
  return (
    <div className="max-w-sm rounded overflow-hidden w-2/12 hover:shadow">
      <img className="tarjeta-imagen w-10/12 h-3/6 bg-gray-400 ml-5" 
        src={product.img_src} 
        alt={product.img_alt}
      />
      <div className="px-6 py-4">
      	<div className="flex flex-col mb-2 text-sm">
          <span className="tarjeta-texto-1">{product.img_alt}</span>
          <span className="tarjeta-texto-2 py-2 text-gray-500 text-xs">{product.format_text}</span>
        </div>
        <div>
          <span className="tarjeta-precio font-bold text-gray-800">{product.price_number} €</span>
          <span className="text-gray-400">/ud.</span>
        </div>
      </div>
      <div className="px-6 pb-2 text-center">
      	<span className="w-full inline-block rounded-full px-3 py-1 text-sm text-yellow-800 mr-2 mb-2 border border-yellow-600 hover:bg-yellow-200">
          Añadir al carro
        </span>
      </div>
    </div>
  )
}

export default ProductCard;