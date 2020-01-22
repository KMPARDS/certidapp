import React, { Component } from 'react';
import { Helmet } from "react-helmet";

const ethers = require('ethers');

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
      const nameBytes32 = window._z.stringToBytes32(this.state.name);

      const tx = await window.certificateContractInstance.functions.addCertifyingAuthority(
        address, nameBytes32
      );

      this.setState({
        statusMessage: 'Tx sent waiting for confirmation...',
        errorMessage: ''
      });

      await tx.wait();

      this.setState({ statusMessage: 'Certifier is Added!', errorMessage: '' })
    } catch(error) {
      this.setState({ errorMessage: error.message, statusMessage: '' })
    }
  }

  render = () => (
    <div>
      <Helmet>
        <title>Add Certifier</title>
        <meta
          name="description"
          content="Add Certification Authority to certify."
        />
      </Helmet>
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
          maxLength="32"
          onChange={event => this.setState({name: event.target.value})}/>
      </div>

      {this.state.errorMessage ? <p className="error-message">Error: {this.state.errorMessage}</p> : null}

      {this.state.statusMessage ? <p className="status-message">Status: {this.state.statusMessage}</p> : null}

      <button className="btn" onClick={this.onConfirmClick}>Confirm New Certifier</button>
    </div>
  );
}
