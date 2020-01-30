import React, { Component } from 'react';
import './CertificateBox.css';

const ethers = require('ethers');

export default class extends Component {
  state = {
    loading: true,
    signerAddress: null,
    name: null,
    website: null,
    isAuthorised: null
  };

  componentDidMount = async() => {
    const signerAddress = ethers.utils.recoverAddress(this.props.certificateHash, this.props.signature);
    this.setState({ signerAddress });
    // console.log({signer});
    const certifyingAuthority = await window.certificateContractInstance.certifyingAuthorities(signerAddress);
    // console.log('certifyingAuthority', certifyingAuthority);

    let caObj;
    if(certifyingAuthority.data !== '0x') {
      caObj = window._z.decodeCertifyingAuthority(certifyingAuthority.data);
    } else {
      caObj = { name: null, website: null };
    }

    this.setState({
      name: caObj.name,
      website: caObj.website ? window._z.toWebsiteURL(caObj.website) : null,
      isAuthorised: certifyingAuthority.isAuthorised,
      loading: false
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

  render = () => {
    let signerAuthorisedClass;
    if(this.state.loading) {
      signerAuthorisedClass = 'loading';
    } else if(this.state.isAuthorised) {
      signerAuthorisedClass = 'valid';
    } else {
      signerAuthorisedClass = 'invalid';
    }

    return (
      <div className={['signer-box', signerAuthorisedClass].filter(className=>!!className).join(' ')}>
        <p>Signer {this.props.serial}: {this.state.name ? <><span className="mono">{this.state.name}</span>{this.state.website ? <a href={this.state.website} rel="noopenner noreferrer" target="_blank" style={{textDecoration: 'none'}}>↗️</a> : null} (<span className="mono">{this.state.signerAddress.slice(0,6)}</span>...<span className="mono">{this.state.signerAddress.slice(38)}</span>)</> : (this.state.signerAddress ? <><span className="mono">{this.state.signerAddress}</span></> : <>Computing address...</>)}</p>
        <p>Signature: <span className="mono">{this.props.signature.slice(0,10)}</span>...<span className="mono">{this.props.signature.slice(122)}</span></p>
      </div>
    );
  }
}
