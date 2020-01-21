import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Navigation from './containers/Navigation/Navigation';
import RegisterCertificate from './containers/RegisterCertificate/RegisterCertificate';
import AddCertifier from './containers/AddCertifier/AddCertifier';
import './App.css';

window.ethers = require('ethers');
window.parseCertificate = require('./functions').parseCertificate;
require('./ethereum');
// window.certificateContractInstance = require('./ethereum').certificateContractInstance;

const App = props => (
  <BrowserRouter>
    <div className="App">
      <header className="App-header">
        <Navigation />
        <div className="container">
          <Switch>
            <Route path="/" exact component={() => (
              <p>Welcome to Certificate UI.<br />Please select an option from above.</p>
            )} />
            <Route path="/register-certificate" exact component={RegisterCertificate} />
            <Route path="/add-certifier" exact component={AddCertifier} />
          </Switch>
        </div>
      </header>
    </div>
  </BrowserRouter>
)

export default App;
