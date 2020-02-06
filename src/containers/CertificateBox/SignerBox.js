import React, { Component } from 'react';
import { AUTHORITY_STATUS_ENUM } from '../../env';
import './CertificateBox.css';

const ethers = require('ethers');

export default class extends Component {
  state = {
    loading: true,
    signerAddress: null,
    name: null,
    website: null,
    status: null,
    image: null
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

    await this.setState({
      name: caObj.name,
      website: caObj.website ? window._z.toWebsiteURL(caObj.website) : null,
      status: certifyingAuthority.status,
      image: caObj.image || null,
      loading: false
    });

    console.log('found', certifyingAuthority.isAuthorised);
    // if(this.props.validCertificate[0] !== false) {
    //   console.log('i marked it', certifyingAuthority.isAuthorised);
    //   this.props.validCertificate[1](certifyingAuthority.isAuthorised);
    // }
    if(certifyingAuthority.status === AUTHORITY_STATUS_ENUM.AUTHORISED) {
      this.props.validCertificate[1]((this.props.validCertificate[0] || 0)+1);
    }

    this.props.updateStatus(certifyingAuthority.status);
  };

  render = () => {
    let signerAuthorisedClass;
    if(this.state.loading) {
      signerAuthorisedClass = 'loading';
    } else if(
      this.state.status === AUTHORITY_STATUS_ENUM.AUTHORISED
        || this.state.status === AUTHORITY_STATUS_ENUM.MIGRATED
    ) {
      signerAuthorisedClass = 'valid';
    } else if(this.state.status === AUTHORITY_STATUS_ENUM.SUSPENDED) {
      signerAuthorisedClass = 'suspended';
    } else {
      signerAuthorisedClass = 'invalid';
    }

    const signerElement = (
      <>
        <p>Signer {this.props.serial}: {this.state.name ? <><span className="mono">{this.state.name}</span>{this.state.website ? <a href={this.state.website} rel="noopenner noreferrer" target="_blank" style={{textDecoration: 'none'}}> <img style={{display:'inline',height: '1rem'}} src={'share.png'} /></a> : null} (<span className="mono">{this.state.signerAddress.slice(0,6)}</span>...<span className="mono">{this.state.signerAddress.slice(38)}</span>)</> : (this.state.signerAddress ? <><span className="mono">{this.state.signerAddress}</span></> : <>Computing address...</>)}</p>
        <p>Signature: <span className="mono">{this.props.signature.slice(0,10)}</span>...<span className="mono">{this.props.signature.slice(122)}</span></p>
      </>
    );

    return (
      <div className={['signer-box', signerAuthorisedClass].filter(className=>!!className).join(' ')}>
        {this.state.image ? <div className="row" style={{display:'inline-block', width:'80%'}}>
          <div className="column2" style={{textAlign: 'right'}}>
            <img className="certificate-signer-img" src={'https://ipfs.infura.io/ipfs/'+this.state.image} />
          </div>
          <div className="column1">
            <div style={{textAlign: 'left', marginLeft: '1rem'}}>
              {signerElement}
            </div>
          </div>
        </div> : signerElement}
        {this.state.status === AUTHORITY_STATUS_ENUM.NOT_AUTHORISED ? <p>This signature is in RED because this signer address is not KYC verified. To make it GREEN, signer has to complete their KYC.</p> : null}
      </div>
    );
  }
}
