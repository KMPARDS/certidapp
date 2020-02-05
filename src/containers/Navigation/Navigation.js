import React, { Component } from 'react';
import NavigationElement from './NavigationElement';
import './Navigation.css';
import { managerAddress } from '../../env';

export default class extends Component {
  state = {
    isManager: false,
    showAllItems: true,
    displayHideButton: false,
    managerAddress: null,
    invalidNetwork: false
  };

  componentDidMount = () => {
    const setManager = async() => {
      if(window.certificateContractInstance) {
        const managerAddress = await window.certificateContractInstance.functions.manager();
        this.state.managerAddress = managerAddress;
        return true;
      }
      return false;
    }

    const intervalId = setInterval(async() => {
      if(await setManager()) {
        // console.log('setManager cleared');
        clearInterval(intervalId);
      }
    }, 100);

    const intervalId2 = setInterval(() => {
      try {
        const navigationGroup = document.querySelector('.navigation-group');
        if(navigationGroup) {
          if(navigationGroup.offsetHeight > 56) {
            this.setState({ displayHideButton: true });
          } else {
            this.setState({ displayHideButton: !this.state.showAllItems });
          }
        }

        /// change the navbar color during incorrect network

        const isManager = !!window.web3 && !!window.web3.currentProvider && !!this.state.managerAddress && this.state.managerAddress.toLowerCase() === window.web3.currentProvider.selectedAddress.toLowerCase();
        if(isManager !== this.state.isManager) {
          this.setState({ isManager });
        }
      } catch (error) {
        // clearInterval(intervalId2);
      }
    }, 100);
  };

  render = () => (
    <div className="navigation-group">
      {this.state.showAllItems ? <>
        <NavigationElement heading="Home" path="" />
        <NavigationElement heading="Register Certificate" />
        <NavigationElement heading="View Certificate" />
        {this.state.isManager ? <NavigationElement heading="Add Certifier" /> : null}
        <NavigationElement heading="List Authorities" />
        <NavigationElement heading="Sign Certificate" />
      </> : null}
      {this.state.displayHideButton ? <button
        className="navigation-element"
        style={{cursor: 'pointer'}}
        onClick={() => this.setState({ showAllItems: !this.state.showAllItems })}
      >
        {this.state.showAllItems
          ? <>Hide Menu Items</>
          : <>Show Menu Items</>}
      </button> : null}
    </div>
  );

}
