import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import SignerBox from './SignerBox';
import './CertificateBox.css';
import { network, certOrder } from '../../env';

const QRCode = require('qrcode');
const ethers = require('ethers');

export default class extends Component {
  state = {
    validCertificate: (this.props.validCertificate&&this.props.validCertificate[0]) || null
  };

  componentDidMount = () => {
    setInterval(() => {
      if(this.props.validCertificate && this.state.validCertificate !== this.props.validCertificate[0]) {
        this.setState({ validCertificate: this.props.validCertificate[0] });
      }
    }, 100);
    if(this.props.qrDisplay) QRCode.toCanvas(document.getElementById('qrcode-canvas'), window.location.href);
  }

  render = () => (
    <div className="certificate-box" id="printable">
      <Helmet>
        <title>{this.props.certificateObj.parsedCertificate.name} is certified on Blockchain</title>
        <meta
          name="description"
          content="View certifications on blockchain"
        />
      </Helmet>
      <p>Certificate of {this.props.certificateObj.parsedCertificate.category}</p>
      <p className="name">{this.props.certificateObj.parsedCertificate.name}</p>
      <p><span className="subject">{this.props.certificateObj.parsedCertificate.subject}</span>
      {this.props.certificateObj.parsedCertificate.score
        ? <> (<span className="score">{this.props.certificateObj.parsedCertificate.score}%</span>)</>
        : null}</p>

      {Object.keys(this.props.certificateObj.parsedCertificate).filter(key => !certOrder.includes(key)).map(key => (
        <p key={'cert-'+key} className={key}>{this.props.certificateObj.parsedCertificate[key]}</p>
      ))}


      <p>{this.state.validCertificate === this.props.certificateObj.signatures.length
        ? <>This is to certify that the above certificate information is signed by following {this.state.validCertificate} signer{this.state.validCertificate > 1 ? <>s</>:null} which is cryptographically verified by the certificate smart contract.</>
        : (
          0 < this.state.validCertificate
          && this.state.validCertificate < this.props.certificateObj.signatures.length
          ? <>Seems that this certificate is signed by only {this.state.validCertificate} valid signers out of {this.props.certificateObj.signatures.length} total signers, you can remove signatures of unauthorised signers.</>
          : <>Seems that this certificate is not signed by any authorised signers.</>
        )}</p>

      {this.props.certificateObj.signatures.length
      ? <>
        {this.props.certificateObj.signatures.map((signature, i) => (
          <SignerBox
            key={'signer-'+i}
            serial={i+1}
            certificateHash={this.props.certificateObj.certificateHash}
            signature={signature}
            validCertificate={this.props.validCertificate || [this.state.validCertificate, newStatus => this.setState({ validCertificate: newStatus })]}
            />
        ))}
      </>
      : null}

      {(() => {
        let content = (
          <>
          <p className="hash">Certificate Hash: {this.props.certificateObj.certificateHash}</p>
          {this.props.certificateObj.txHashArray ? <p>Created at transaction{this.props.certificateObj.txHashArray.length > 1 ? <>s</> : null}
          {this.props.certificateObj.txHashArray.map(txHash => (
            <span key={'txHash-'+txHash}><br />
              {txHash.slice(0,6)}...{txHash.slice(62)}. <a target="_blank" rel="noopenner noreferrer" href={`https://${network === 'homestead' ? '' : network+'.'}etherscan.io/tx/${txHash}`}>View on EtherScan</a></span>
          ))}
          </p> : null}
            </>
        );

        if(this.props.qrDisplay) {
          content = (
            <div className="row">
              <div className="column1">
                {content}
              </div>
              <div className="column2"><canvas id="qrcode-canvas" /></div>
            </div>
          );
        }

        return content;
      })()}

    </div>
  );
}
