import React, { Component } from 'react';
import { certificateContract } from '../../../env';
import CertificateBox from '../../CertificateBox/CertificateBox';

const ethers = require('ethers');

export default class extends Component {
  state = {
    displayText: 'Please wait...',
    loading: true
  };

  componentDidMount = async() => {
    const logs = await window.provider.getLogs({
      address: certificateContract.address,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.utils.id('Certified(bytes32,address)'), this.props.match.params.hash]
    });

    if(!logs.length) this.setState({ displayText: 'Certificate not yet registered or it does not exist' });

    const txHash = logs[0].transactionHash;
    const transaction = await window.provider.getTransaction(txHash);
    const decoded = window.certificateContractInstance.interface.decodeFunctionData('registerCertificate(bytes)',transaction.data)[0];
    window.certificates[this.props.match.params.hash] = window._z.parseCertificate(decoded);
    window.certificates[this.props.match.params.hash].txHash = txHash;
    console.log({decoded, transaction});
    this.setState({ loading: false, displayText: ''})
  }
  render = () => (
    <>
      {this.state.displayText ? <p>{this.state.displayText}</p> : null}
      {!this.state.loading && window.certificates[this.props.match.params.hash] ? <CertificateBox
        certificateObj={window.certificates[this.props.match.params.hash]}
      /> : null}
    </>
  );
}
