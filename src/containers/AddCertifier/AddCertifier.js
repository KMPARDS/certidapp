import React, { Component } from 'react';
import { Helmet } from "react-helmet";

const ethers = require('ethers');

export default class extends Component {
  state = {
    address: '',
    name: '',
    website: '',
    image: '',
    errorMessage: '',
    statusMessage: ''
  };

  onConfirmClick = async() => {
    this.setState({ errorMessage: '', statusMessage: '' })
    try {
      const address = ethers.utils.getAddress(this.state.address);
      const encoded = window._z.encodeCertifyingAuthority({
        name: this.state.name,
        website: this.state.website.split(' ').join(''),
        image: this.state.image
      });

      const tx = await window.certificateContractInstance.functions.addCertifyingAuthority(
        address, encoded
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
      <p className="status-message">Using this section, the CertiÐApp Manager can update KYC of certifying authorities.</p>
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
          onChange={event => this.setState({name: event.target.value})}/>
      </div>

      <div className="form-group">
        <p>Enter Website of new certifier:</p>
        <input
          className="certificate-textinput"
          type="text"
          placeholder="Certifier Website"
          onChange={event => this.setState({website: event.target.value})}/>
      </div>

      <div className="form-group">
        <p>Enter IPFS Hash of Logo of Certifying Authority (optional):</p>
        <input
          className="certificate-textinput"
          type="text"
          placeholder="IPFS Hash of Logo"
          onChange={event => this.setState({image: event.target.value})}/>
        {this.state.image ? <img style={{maxHeight:'200px', maxWidth:'200px'}} src={`https://ipfs.infura.io/ipfs/${this.state.image}`} /> : null}
      </div>

      {this.state.errorMessage ? <p className="error-message">Error: {this.state.errorMessage}</p> : null}

      {this.state.statusMessage ? <p className="status-message">Status: {this.state.statusMessage}</p> : null}

      <button className="btn" onClick={this.onConfirmClick}>Confirm New Certifier</button>
    </div>
  );
}
