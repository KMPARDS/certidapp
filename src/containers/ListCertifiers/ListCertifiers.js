import React, { Component } from 'react';
import { certificateContract } from '../../env';
import CertifierBox from './CertifierBox';

const ethers = require('ethers');

export default class extends Component {
  state = {
    certifiers: [],
    loading: true
  };

  componentDidMount = async() => {
    const logs = await window.provider.getLogs({
      address: certificateContract.address,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.utils.id('Authorization(address,bool)')]
    });
    // console.log(logs);
    this.setState({
      certifiers: logs.map(log => ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(log.topics[1]), 20)),
      loading: false
    });
  }

  render = () => (
    <>
      {this.state.loading ? <>Please wait loading certifiers</> : null}
      {this.state.certifiers.map((address,i) => (
        <CertifierBox key={`certifier-${address}${i}`} address={address} />
      ))}
    </>
  );
}
