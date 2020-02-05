import React, { Component } from 'react';
import { network, certificateContract, networkId } from '../../env';

const METAMASK_ENUM = {
  NOT_INSTALLED: 0,
  INSTALLED_BUT_NOT_CONNECTED: 1,
  CONNECTED: 2,
  OTHER_NETWORK: 3
};

export default class extends Component {
  state = {
    metamaskStatus: METAMASK_ENUM.NOT_INSTALLED
  };

  componentDidMount = () => {
    this.intervalId = setInterval(() => {
      let latestStatus = METAMASK_ENUM.NOT_INSTALLED;
      if(window.ethereum) {
        latestStatus = METAMASK_ENUM.INSTALLED_BUT_NOT_CONNECTED;
      }
      if(window.signer) {
        latestStatus = METAMASK_ENUM.CONNECTED;
      }
      if(window.signer && window.web3.currentProvider.networkVersion != networkId) {
        latestStatus = METAMASK_ENUM.OTHER_NETWORK;
      }
      if(this.state.metamaskStatus !== latestStatus) {
        this.setState({ metamaskStatus: latestStatus });
      }
    }, 300);
  };

  componentWillUnmount = () => {
    clearInterval(this.intervalId);
  }

  render = () => (
    <>
      <div className="status-message">
        <h1>Welcome to CertiÐApp</h1>
        <p>CertiÐApp is an Ethereum Blockchain powered Certificate Issuance and Verification Smart Contract.</p>
        <div style={{padding:'0 10%'}}>
        {(() => {
          switch(this.state.metamaskStatus) {
            case METAMASK_ENUM.NOT_INSTALLED:
              return (
                <p className="error-message">You will need <a class="link" href="https://metamask.io/" rel="noopenner noreferrer" target="_blank">Metamask</a> installed if you want to register your certificate.</p>
              );
            case METAMASK_ENUM.INSTALLED_BUT_NOT_CONNECTED:
              return (
                <p className="error-message">Seems you have Metamask installed, please select Connect in Metamask. If it was previously cancelled, then please refresh the page.</p>
              );
            case METAMASK_ENUM.CONNECTED:
              return (
                <p className="success-message">Metamask is connected! Please select a tab from above.</p>
              );
            case METAMASK_ENUM.OTHER_NETWORK:
              return (
                <p className="error-message">Metamask is connected but the network is different. Please switch to <u>{network}</u> network</p>
              );
          }
        })()}
        </div>
      </div>

      <p>Smart Contract Link: <a class="link" href={`https://${network === 'homestead' ? '' : network+'.'}etherscan.io/address/${certificateContract.address}#code`} target="_blank">GitHub Repository</a></p>

      <div className="home-details">
      <h3>Why CertiÐApp</h3>
CertiÐApp is aims to solve below identified challenges faced by other modes.

<h4>Challenges in traditional certificates</h4>
<p>Though we are used to our traditional way of having certificates printed on a hard copy, it has some unminded challenges.</p>

<p>As a winner or performer or attender, we receive certificates from the organizers stating with various logos on it (for e.g. Microsoft) whose authority probably doesn't even know about that and wouldn't want unauthorized printing of certificates with use of their logo. How easy is it to download a logo from some website and print it on a piece of paper? How many copies can be made? Just like printed fiat can have fake counterparts circulating around which people unknowingly accept, there can be some unauthorized organizations giving certificates (for e.g. Microsoft certified) for fooling students to make some profit.</p>

<p>On the other side, students/candidates themselves can print a fake certificate on a 300 GSM paper and pose for being accepted to an organization (for e.g. job interview or college interview). As an HR or any verifier out there who is looking to filter candidates have only two options, either rely only on that piece of printed paper for accepting the candidate (who might have faked/forged certificate) or do not trust it by doing a retest of the same (which would consume more time in hiring process).</p>

<p>Though still, a possible workaround for certificate authority (issuer like Microsoft) to make a unique standard of printing which is difficult to print by normal printers and only a special printer can print such certificates (just like notes). This process only makes certificates slightly costlier or difficult to print (by using custom plates). This approach is similar to Security by Obscurity, in which it is assumed that the attacker does not have knowledge of the complexity used for printing. But an intelligent attacker might study the printed certificate and reverse engineer to develop a plate to produce similar print, such that it would be difficult to tell the difference in a genuine and fake certificate.</p>

<h4>CertiÐApp as a solution to above problems</h4>
<p>CertiÐApp aims to solve the authenticity-related problems using Kerckhoff's Principle of Cryptography. Here, instead of having complicated and secret printing process, we use a publicly known Elliptic Curve Digital Signature Algorithm (ECDSA). Here every certifier needs to hold a secret key which they will use to generate signature for every certificate they would sign.</p>

<h4>How much secure is it?</h4>
<p>Anyone else trying to fake someone's signature for a particular certificate would find it very difficult because odds of this happening is 1 in 1000000...(154 zeros) tries. An usual laptop is estimated to take around 10143 years to forge a fake signature for a particular certificate. If we assume combination of every computer in the world to fake a signature, it would take around 10130 years. For instance, age of Earth is approximately 1010. Hence it is not feasible to forge a certificate signature.</p>

<p>While with traditional certificates, reverse engineering a complex printing setup to create fake but almost real looking certificates is quick like at most a week or a month for an printing expert. It's pretty easy to conclude our traditional way is broken and CertiÐApp solves these problems.</p>

<p>You can check the technical details in the <a class="link" href="https://github.com/KMPARDS/certificate-contract" rel="noopenner noreferrer" target="_blank">GitHub Repository</a></p>

</div>
    </>
  );
}
