import React, { Component } from 'react';
import { Helmet } from "react-helmet";
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
      certifiers: logs.map(log => ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(log.topics[1]), 20)).filter((address, i, self) => self.indexOf(address) === i),
      loading: false
    });
  }

  render = () => (
    <>
      <Helmet>
        <title>List of Certification Authorities</title>
        <meta
          name="description"
          content="See all certification authorities"
        />
      </Helmet>
      {this.state.loading ? <>Please wait loading certifying authorities</> : null}
      {this.state.certifiers.map((address,i) => (
        <CertifierBox key={`certifier-${address}${i}`} address={address} />
      ))}
    </>
  );
}
