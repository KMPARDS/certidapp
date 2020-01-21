import React, { Component } from 'react';
import './CertificateBox.css';

const ethers = require('ethers');

export default class extends Component {
  state = {
    name: null,
    isAuthorised: null,
    boxClassName: null
  };

  componentDidMount = async() => {
    const certifyingAuthority = await window.certificateContractInstance.certifyingAuthorities(this.props.signer);
    console.log('certifyingAuthority', certifyingAuthority);

    this.setState({
      name: ethers.utils.toUtf8String(certifyingAuthority.name).split('\u0000').join(''),
      isAuthorised: certifyingAuthority.isAuthorised,
      boxClassName: certifyingAuthority.isAuthorised ? 'valid' : 'invalid'
    });

    console.log('found', certifyingAuthority.isAuthorised);
    // if(this.props.validCertificate[0] !== false) {
    //   console.log('i marked it', certifyingAuthority.isAuthorised);
    //   this.props.validCertificate[1](certifyingAuthority.isAuthorised);
    // }
    if(certifyingAuthority.isAuthorised) {
      this.props.validCertificate[1]((this.props.validCertificate[0] || 0)+1);
    }
  };

  render = () => (
    <div className={['signer-box', this.state.boxClassName].filter(className=>!!className).join(' ')}>
      <p>Signer {this.props.serial}: {this.state.name ? <>{this.state.name}({this.props.signer.slice(0,6)}...{this.props.signer.slice(38)})</> : <>{this.props.signer}</>}</p>
      <p>Signature: {this.props.signature.slice(0,10)}...{this.props.signature.slice(122)}</p>
    </div>
  );
}
