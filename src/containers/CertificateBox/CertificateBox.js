import React, { Component } from 'react';
import SignerBox from './SignerBox';
import './CertificateBox.css';

const ethers = require('ethers');

export default class extends Component {
  state = {
    validCertificate: this.props.validCertificate[0] || null
  };

  componentDidMount = () => {
    setInterval(() => {
      if(this.state.validCertificate !== this.props.validCertificate[0]) {
        this.setState({ validCertificate: this.props.validCertificate[0] });
      }
    }, 100);
  }

  render = () => (
    <div className="certificate-box">
    {console.log(this.state.validCertificate, this.props.certificateObj.signatures.length)}
      <p className="hash">Hash: {this.props.certificateObj.certificateHash}</p>
      <p className="name">{this.props.certificateObj.parsedCertificate.name}</p>
      <p><span className="course">{this.props.certificateObj.parsedCertificate.course}</span>
      {this.props.certificateObj.parsedCertificate.score
        ? <> (<span className="score">{this.props.certificateObj.parsedCertificate.score}%</span>)</>
        : null}</p>
      {this.props.certificateObj.parsedCertificate.extraData !== ethers.utils.hexZeroPad('0x', 32)
        ? <p><b>ExtraData:</b> {this.props.certificateObj.parsedCertificate.extraData}</p>
        : null}

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
        {this.props.certificateObj.signatures.map((entry, i) => (
          <SignerBox
            key={'signer-'+i}
            serial={i+1}
            signer={entry.signer}
            signature={entry.rawSignature}
            validCertificate={this.props.validCertificate || [this.state.validCertificate, newStatus => this.setState({ validCertificate: newStatus })]}
            />
        ))}
      </>
      : null}
    </div>
  );
}
