function Navigation({onChange}) {
  return (
    <nav className="w-full bg-white py-3 px-4 border-b border-gray-200 font-sans">
      <div className="mx-auto flex items-center justify-between gap-4">
        <a className="flex items-center gap-2 shrink-0">
          <span className="text-3xl font-black text-[#549746] tracking-tight p">Mercamona</span>
        </a>
      
        <div className="flex-1 max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input 
            type="text" 
            className="block w-full pl-12 pr-4 py-2.5 bg-gray-100 border-transparent text-gray-600 placeholder-gray-500 rounded-full focus:bg-white focus:border-gray-300 focus:ring-0 transition-colors sm:text-base" 
            placeholder="Buscar productos"
            id="search-bar"
            onChange={onChange}
          />
        </div>
      
        <div className="hidden lg:flex items-center gap-8 text-gray-600 font-medium ml-4">
          <a href="#" className="hover:text-[#549746]">Categorías</a>
          <a href="#" className="hover:text-[#549746]">Listas</a>
        </div>
      
        <div className="flex items-center gap-6 ml-auto shrink-0">
          <button className="hidden md:flex items-center gap-1 text-gray-600 font-bold hover:text-[#549746]">
            <span>Identifícate</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        
          <button className="relative text-gray-400 hover:text-[#549746]">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation;