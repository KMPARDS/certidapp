import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import { certificateContract } from '../../env';

const ethers = require('ethers');

const HASH_CHECKING_ENUM = {
  NOT_CHECKING: 0,
  CHECKING: 1,
  FOUND_VALID: 2,
  FOUND_INVALID: 3
};

export default class extends Component {
  state = {
    userEnteredHash: '',
    inputError: false,
    recentCertificateHashes: [],
    displayText: '',
    hashCheckStatus: 0
  };

  componentDidMount = async() => {
    const logs = await window.provider.getLogs({
      address: certificateContract.address,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.utils.id('Certified(bytes32,address)')]
    });

    console.log(logs);

    this.setState({
      recentCertificateHashes: logs.map(log => log.topics[1]).filter((item, i, a) => a.indexOf(item) === i).reverse().slice(0,3)
    });

  };

  onVerifyCertificate = async() => {
    this.setState({ inputError: false, hashCheckStatus: HASH_CHECKING_ENUM.CHECKING });
    try {
      const hash = ethers.utils.hexlify(this.state.userEnteredHash.split(' ').join('').split('\n').join(''));

      if(hash.length !== 66) throw new Error('invalid hash length');

      const certificateStruct = await window.certificateContractInstance.functions.certificates(hash);

      // window.certificates[hash] = window._z.decodeCertificateData(certificateObj.data);

      if(certificateStruct.signers === '0x') throw new Error('Certificate not yet registered or it does not exist');

      this.setState({ hashCheckStatus: HASH_CHECKING_ENUM.FOUND_VALID });

      setTimeout(() => {
        this.props.history.push(`view-certificate/${hash}`);
      }, 400);
    } catch(error) {
      this.setState({ inputError: true, displayText: error.message });
    }

  };

  render = () => (
    <>
      <Helmet>
        <title>View Certificate</title>
        <meta
          name="description"
          content="View certificates on Blockchain"
        />
      </Helmet>
      <input
        className={`certificate-textinput${this.state.inputError ? ' invalid' : ''}`}
        type="text"
        placeholder="Enter Certificate Hash"
        onChange={event => this.setState({ userEnteredHash: event.target.value, inputError: false })}
        />
      {this.state.displayText ? <p class={this.state.inputError ? 'error-message' : 'status-message'}>{this.state.displayText}</p> : null}
      <button className="btn" disabled={this.state.hashCheckStatus !== 0} onClick={this.onVerifyCertificate}>{(() => {
        switch(this.state.hashCheckStatus) {
          case HASH_CHECKING_ENUM.CHECKING:
            return 'Checking hash...';
          case HASH_CHECKING_ENUM.FOUND_VALID:
            return 'Accessing certificate fields...';
          default:
            return 'Verify Certificate';
        }
      })()}</button>

      {this.state.recentCertificateHashes.length
        ? <div className="form-group">
        <p>Recent certificates issued...</p>
        {this.state.recentCertificateHashes.map((hash,i) => (
          <p key={`recent-certificates-${hash}`} className="mono">{hash}</p>
        ))}
      </div> : null}
    </>
  );
}
