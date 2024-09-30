import { useState } from 'react'
import './App.css'

function App() {
  const [name, setName] = useState('')
  const handleChange = () => {
    console.log(name);

  };

  return (
    <>
      <input
        name="name"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" onClick={() => handleChange()}>save</button>
    </>
  )
}

export default App
