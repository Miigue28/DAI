import { useState } from 'react'
import Navigation from './components/Navigation'
import Results from './components/Results'
import './App.css'

function App() {
  const [query, setQuery] = useState('')

  const handleChange = (event) => {
    const value = event.target.value
    console.info("Search query:" + value)
    setQuery(value)
  }

  return (
    <>
      <Navigation onChange={handleChange} />
      <Results of={query} />
    </>
  )
}

export default App
