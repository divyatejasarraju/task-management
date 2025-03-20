import { useEffect, useState } from 'react'
import axios from 'axios';
import './App.css'

function App() {
  useEffect(() => {
    axios.get('http://localhost:5001/')
        .then(response => console.log(response.data))
        .catch(error => console.error('Error:', error));
}, []);

return <h1>Hello MERN Vite!</h1>;
}

export default App
