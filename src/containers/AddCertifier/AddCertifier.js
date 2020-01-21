import React, { Component } from 'react';
import CertificateBox from '../CertificateBox/CertificateBox';
import { network, certificateContract } from '../../env';

const ethers = require('ethers');

function stringToBytes32(text) {
  // text = text.slice(0,32);
  if(text.length >= 32) throw new Error('only 32 chars allowed in bytes32');
  var result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));
  while (result.length < 66) { result += '0'; }
  if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
  return result;
}

export default class extends Component {
  state = {
    address: '',
    name: '',
    errorMessage: '',
    statusMessage: ''
  };

  onConfirmClick = async() => {
    this.setState({ errorMessage: '', statusMessage: '' })
    try {
      const address = ethers.utils.getAddress(this.state.address);
      const nameBytes32 = stringToBytes32(this.state.name);

      const tx = await window.certificateContractInstance.functions.addCertifyingAuthority(
        address, nameBytes32
      );

      this.setState({ statusMessage: 'Tx sent waiting for confirmation...' });

      await tx.wait();

      this.setState({ statusMessage: 'Certifier is Added!' })
    } catch(error) {
      this.setState({ errorMessage: error.message })
    }
  }

  render = () => (
    <div>
      <div className="form-group">
        <p>Enter Address of new certifier:</p>
        <input
          className="certificate-textinput"
          type="text"
          placeholder="New Certifier Address"
          onChange={event => this.setState({address: event.target.value})}/>
      </div>

      <div className="form-group">
        <p>Enter Name of new certifier:</p>
        <input
          className="certificate-textinput"
          type="text"
          placeholder="New Certifier Name"
          maxlength="32"
          onChange={event => this.setState({name: event.target.value})}/>
      </div>

      {this.state.errorMessage ? <p className="error-message">Error: {this.state.errorMessage}</p> : null}

      {this.state.statusMessage ? <p className="status-message">Status: {this.state.statusMessage}</p> : null}

      <button className="btn" onClick={this.onConfirmClick}>Confirm New Certifier</button>
    </div>
  );
}
