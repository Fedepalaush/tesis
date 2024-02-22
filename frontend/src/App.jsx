import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import "./App.css";

import { ApolloClient, InMemoryCache, ApolloProvider, gql,useQuery } from '@apollo/client';

import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarComp from "../components/NavbarComp";
import SidebarComp from "../components/SidebarComp";
import Plot from "react-plotly.js";

function App() {
  const [activosData, setActivosData] = useState([]);

  const endpoint = `${import.meta.env.VITE_API_URL}/activos/`;

  const [selectedOption, setSelectedOption] = useState("AAPL");
  const [responseMessage, setResponseMessage] = useState("");


  const [stockPrices, setStockPrices] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  const FILMS_QUERY = gql`
  {
    activos {
      id
      ticker
      precio
      
    }
  }
`;


  const { data, loading, error } = useQuery(FILMS_QUERY);

  const parametroValue = 'BA'; // Or any other value you want to send

  axios.get('http://localhost:8000/my_custom_view/', {
    params: {
      parametro: parametroValue
    }
  })
    .then(response => {
      // Handle successful response
      console.log(response.data);
    })
    .catch(error => {
      // Handle error
      console.error('Error fetching data:', error);
    });

  if (loading) return "Loading...";
  if (error) return <pre>{error.message}</pre>
  return (
    <Router>
      <div>
        <div className="navbar">
          <NavbarComp />
        </div>

        <div className="main-content">
          <div className="sidebar">
            <SidebarComp/>
          </div>
          <div>
            <ul></ul>
          </div>
          {/* <button onClick={handleSendData}>Crear Data</button> */}
          
           {/*<Button variant="outline-dark">Presionamee</Button>*/}
          <div>
          </div>
          <div>



            
{/*           <ul>
        {data.activos.map((activo) => (
          <li key={activo.id}>{activo.ticker + activo.precio}</li>
        ))}
      </ul> */}

            <div>
              
                <div>
                  {responseMessage && (
                    <div>
                      <p>Graph:</p>
                      <Plot
                        data={[
                          {
                            x: responseMessage.map((_, index) => index), // Assuming the x-axis is just the index of each data point
                            y: responseMessage,
                            type: "scatter",
                            mode: "lines",
                            marker: { color: "red" }, // Customize marker color if needed
                            line: { shape: "spline" }, // Choose line shape
                          },
                        ]}
                        layout={{ width: 600, height: 400, title: "Response Message Graph" }} // Customize layout as needed
                      />
                    </div>
                  )}                
                </div>

            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
