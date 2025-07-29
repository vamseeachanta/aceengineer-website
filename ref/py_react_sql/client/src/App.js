import React, { useState, useEffect } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import Plot from 'react-plotly.js';

import logo from './logo.svg';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [resPress, setresPress] = useState({"data": null, "layout": null});
  const [correlations, setcorrelations] = useState({"data": null, "layout": null});

  useEffect(() => {
    fetch('/api/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);

  useEffect(() => {
    fetch('/api/reservoir_pressure_maturity').then(res => res.json()).then(data => {
      setresPress(data);
    });
  }, []);

  useEffect(() => {
    fetch('/api/correlations').then(res => res.json()).then(data => {
      setcorrelations(data);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <div>
            <Link className="App-link" to="/">Home</Link>
            &nbsp;|&nbsp;
            <Link className="App-link" to="/resPress">Reservoir Pressure</Link>
            &nbsp;|&nbsp;
            <Link className="App-link" to="/correlations">Correlations</Link>
          </div>
          <Switch>
            <Route exact path="/">
                <p> Click on other tabs </p>
                <p>The current time is {currentTime}.</p>
            </Route>

            <Route path="/resPress">
                <p>Reservoir Pressure Plot</p>
                <p>Size of bubble dependent on 12 Month Cummulative Oil. Hover text contains additional information.</p>
                <Plot
                data={resPress.data}
                layout={resPress.layout}
               />
            </Route>

            <Route path="/correlations">
                <p>Correlation Plot. Pearson used for demo</p>
                <Plot
                data={correlations.data}
                layout={correlations.layout}
               />
            </Route>
          </Switch>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
