import React, { Component } from 'react';
import CertificateBox from '../CertificateBox/CertificateBox';
import { network, certificateContract } from '../../env';

const ethers = require('ethers');

export default class extends Component {
  state = {
    userEnteredString: '',
    textAreaClass: null,
    parsingWait: false,
    certificateObj: null,
    validCertificate: null
  };

  timeoutId = null;

  onUserEnter = event => {
    const spacesRemoved = event.target.value.split(' ').join('').split('\n').join('');
    console.log(spacesRemoved);
    try {
      const certificateObj = window.parseCertificate(spacesRemoved);

      this.setState({
        textAreaClass: 'valid',
        parsingWait: true,
        validCertificate: null
      });

      this.timeoutId = setTimeout(() => {
        this.setState({
          parsingWait: false,
          certificateObj
        });
      }, 500);
    } catch (error) {
      clearTimeout(this.timeoutId);
      this.setState({
        textAreaClass: 'invalid',
        parsingWait: false,
        certificateObj: null
      });
    }
  }

  render = () => (
    <>
      <p>Paste your signed certificate in the below box:</p>
      <textarea className={['certificate-textarea', this.state.textAreaClass].filter(className=>!!className).join(' ')} onChange={this.onUserEnter} />

      {this.state.parsingWait
        ? <p>Please wait parsing your certificate...</p>
        : null}

      {this.state.certificateObj
        ? <>
          <p>Your certificate preview:</p>
          <CertificateBox
            certificateObj={this.state.certificateObj}
            validCertificate={[this.state.validCertificate, newStatus => this.setState({ validCertificate: newStatus })]}
            />
        </>
        : null}

      {this.state.validCertificate
        ? <>

        </>
        : <></>}

        <button className="btn" disabled={!this.state.validCertificate}>Register Certificate</button>
    </>
  );
}
