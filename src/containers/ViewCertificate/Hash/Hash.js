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
    try {
      let hash = this.props.match.params.hash.split(' ').join('').split('\n').join('');

      try {
        ethers.utils.hexlify(hash)
      } catch(error) {
        try {
          ethers.utils.hexlify(hash+'0')
        } catch (error) {
          throw new Error('Hash should contain only allowed characters');
        }
      }

      if(hash.length !== 66) throw new Error('Invalid hash length');

      try {
        const certificateObj = await window._z.getCertificateObjFromCertificateHash(this.props.match.params.hash);

        this.setState({ loading: false, displayText: '', certificateObj})
      } catch (error) {
        throw new Error('The certificate is not yet registered or it does not exist.');
      }
    } catch (error) {
      this.setState({ displayText: 'Error: '+error.message });
    }
  };

  render = () => (
    <>
      {this.state.displayText ? <p>{this.state.displayText}</p> : null}
      {!this.state.loading && this.state.certificateObj ? <CertificateBox
        certificateObj={this.state.certificateObj}
        qrDisplay={true}
      /> : null}
    </>
  );
}
