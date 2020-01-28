import React, { Component } from 'react';
import { certificateContract } from '../../../env';
import CertificateBox from '../../CertificateBox/CertificateBox';

const ethers = require('ethers');

export default class extends Component {
  state = {
    displayText: 'Please wait...',
    loading: true,
    certificateObj: null
  };

  componentDidMount = async() => {
    const certificateObj = await window._z.getCertificateObjFromCertificateHash(this.props.match.params.hash);

    this.setState({ loading: false, displayText: '', certificateObj})
  }
  render = () => (
    <>
      {this.state.displayText ? <p>{this.state.displayText}</p> : null}
      {!this.state.loading && this.state.certificateObj ? <CertificateBox
        certificateObj={this.state.certificateObj}
      /> : null}
    </>
  );
}
