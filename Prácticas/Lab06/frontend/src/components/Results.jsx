import useSWR from "swr";
import ProductCard from "./ProductCard";

function Results({of}){

  if (of.length < 3){
    return (
      <div>...</div>
    )
  }

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  
  const { data, error, isLoading } = useSWR(
		`http://localhost:8000/api/search/${of}`,
		fetcher
	);

  const displayProducts = (products) => {
    return products.map((product) => (
      <ProductCard key={product._id} product={product}/>
    ));
  }


  return (
    <>
      <div className="flex flex-wrap gap-6 mt-8 justify-center">
			  {
			  	isLoading ? (
			  		<h1>Cargando</h1>
			  	) : data ? (
			  		displayProducts(data.products)
			  	) : error ? (<div>{error}</div>) : (<div>...</div>)
			  }
		  </div>
    </>
  )
}

export default Results;