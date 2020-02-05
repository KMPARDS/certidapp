import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import { certificateContract } from '../../env';
import CertifierBox from './CertifierBox';

const ethers = require('ethers');

export default class extends Component {
  state = {
    certifiers: [],
    loading: true,
    errorMessage: ''
  };

  componentDidMount = async() => {
    try {
      const logs = await window.provider.getLogs({
        address: certificateContract.address,
        fromBlock: 0,
        toBlock: 'latest',
        topics: [ethers.utils.id('AuthorityStatusUpdated(address,uint8)')]
      });
      // console.log(logs);
      this.setState({
        certifiers: logs.map(log => ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(log.topics[1]), 20)).filter((address, i, self) => self.indexOf(address) === i),
        loading: false
      });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
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
      <p className="status-message">This page contains list of all verified certifying authority wallets who have completed their KYC.</p>

      {this.state.loading
        ? <>Please wait loading certifying authorities...</>
        : <>
          {this.state.certifiers.length ? <>{this.state.certifiers.map((address,i) => (
            <CertifierBox key={`certifier-${address}${i}`} address={address} />
          ))}</> : <>No certifying authorities currently.</>}
        </>}
    </>
  );
}
