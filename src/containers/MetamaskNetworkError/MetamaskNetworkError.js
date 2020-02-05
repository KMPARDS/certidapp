import React, { Component } from 'react';
import { METAMASK_ENUM, network } from '../../env';

export default class extends Component {
  state = {
    allowed: null,
    metamaskStatus: null
  }

  componentDidMount = () => {
    this.intervalId = setInterval(() => {
      let allowed = false;
      let metamaskStatus = METAMASK_ENUM.NOT_INSTALLED;
      if(window.ethereum) {
        metamaskStatus = METAMASK_ENUM.INSTALLED_BUT_NOT_CONNECTED
      }
      if(window.signer) {
        allowed = true;
        metamaskStatus = METAMASK_ENUM.CONNECTED;
        if(!window.onCorrectNetwork) {
          allowed= false;
          metamaskStatus = METAMASK_ENUM.OTHER_NETWORK;
        }
      }

      if(allowed !== this.state.allowed || metamaskStatus !== this.state.metamaskStatus) {
        this.setState({ metamaskStatus });
        if(this.props.updateAllowed) this.props.updateAllowed(allowed);
      }
    }, 300);
  }

  componentWillUnmount = () => {
    clearInterval(this.intervalId);
  }

  render = () => {
    switch(this.state.metamaskStatus) {
      case METAMASK_ENUM.NOT_INSTALLED:
        return (
          <p className="error-message">If you want to register your certificate, you will need <a className="link" href="https://metamask.io/" rel="noopenner noreferrer" target="_blank">Metamask</a> installed. If you are here only to view certificates, installing Metamask is not necessary.</p>
        );
      case METAMASK_ENUM.INSTALLED_BUT_NOT_CONNECTED:
        return (
          <p className="error-message">Seems you have Metamask installed, please select Connect in Metamask. If it was previously cancelled, then please refresh the page.</p>
        );
      case METAMASK_ENUM.CONNECTED:
        if(this.props.showSuccess) {
          return (
            <p className="success-message">Metamask is connected! Please select a tab from above.</p>
          );
        } else {
          return null
        }
      case METAMASK_ENUM.OTHER_NETWORK:
        return (
          <p className="error-message">Metamask is connected but the network is different. Please switch to <u>{network}</u> network</p>
        );
      default:
        return null;
    }
  };
}
