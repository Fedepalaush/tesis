import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {

const [activosData, setActivosData] = useState([])

const endpoint = `${import.meta.env.VITE_API_URL}/activos/`

const fetchData = async()=> {
  console.log('fetching...')
  const response = await axios.get(endpoint)
  console.log(response)
  const {data} = response
  setActivosData (data)
  console.log(data)
  return data
}

const postData = async() => {
  const ticker = 'MSFT'
  const precio = 320.45
  const body = {ticker, precio}

  const response = await axios.post(endpoint, body)
  console.log(response)
  return response.data
}

const handleSendData = async() =>{
  const newData = await postData()
  if (newData){
    setActivosData(prevState => [...prevState, newData])
  }

}

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
    <ul>
      {activosData.map(el => <li key={el.id}>{el.ticker}</li>)}
    </ul>
      <button onClick={handleSendData}>Crear Data</button>
    </>
  )
}

export default App
