import React, { Component } from 'react';
import SignerBox from './SignerBox';
import './CertificateBox.css';

const ethers = require('ethers');

export default class extends Component {
  render = () => (
    <div className="certificate-box">
      <p className="name">{this.props.certificateObj.parsedCertificate.name}</p>
      <p><span className="course">{this.props.certificateObj.parsedCertificate.course}</span>
      {this.props.certificateObj.parsedCertificate.score
        ? <> (<span className="score">{this.props.certificateObj.parsedCertificate.score}%</span>)</>
        : null}</p>
      {this.props.certificateObj.parsedCertificate.extraData !== ethers.utils.hexZeroPad('0x', 32)
        ? <p><b>ExtraData:</b> {this.props.certificateObj.parsedCertificate.extraData}</p>
        : null}

      {this.props.certificateObj.signatures.length
      ? <>
        {this.props.certificateObj.signatures.map((entry, i) => (
          <SignerBox
            serial={i+1}
            signer={entry.signer}
            signature={entry.rawSignature}
            validCertificate={this.props.validCertificate}
            />
        ))}
      </>
      : null}
    </div>
  );
}
