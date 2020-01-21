import React, { Component } from 'react';
import NavigationElement from './NavigationElement';
import './Navigation.css';
import { managerAddress } from '../../env';

export default class extends Component {
  state = {
    isManager: false
  };

  componentDidMount = () => {
    setInterval(() => {
      const isManager = managerAddress === window.web3.currentProvider.selectedAddress;
      if(isManager !== this.state.isManager) {
        this.setState({ isManager });
      }
    }, 500);
  };

  render = () => (
    <div className="navigation-group">
      <NavigationElement heading="Register Certificate" />
      {this.state.isManager ? <NavigationElement heading="Add Certifier" /> : null}
      <NavigationElement heading="List Certifiers" />
    </div>
  );

}
