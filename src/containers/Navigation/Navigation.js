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
      const isManager = !!window.web3 && !!window.web3.currentProvider && managerAddress === window.web3.currentProvider.selectedAddress;
      if(isManager !== this.state.isManager) {
        this.setState({ isManager });
      }
    }, 500);
  };

  render = () => (
    <div className="navigation-group">
      <NavigationElement heading="Register Certificate" />
      <NavigationElement heading="View Certificate" />
      {this.state.isManager ? <NavigationElement heading="Add Certifier" /> : null}
      <NavigationElement heading="List Authorities" />
      <NavigationElement heading="Sign Certificate" />
    </div>
  );

}
