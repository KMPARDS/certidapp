import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Navigation from './containers/Navigation/Navigation';
import ViewCertificates from './containers/ViewCertificates/ViewCertificates';
import MakeACertificate from './containers/MakeACertificate/MakeACertificate';
import './App.css';

const ethers = require('ethers');
window.ethers = ethers;

// window.provider = ethers.getDefaultProvider();

const App = props => (
  <BrowserRouter>
    <div className="App">
      <header className="App-header">
        <Navigation />
        <div style={{marginTop:'50px', overflow:'scroll'}}>
          <Switch>
            <Route path="/make-a-certificate" exact component={MakeACertificate} />
            <Route path="/view-certificates" exact component={ViewCertificates} />
          </Switch>
        </div>
      </header>
    </div>
  </BrowserRouter>
)

export default App;
