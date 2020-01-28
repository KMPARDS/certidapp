import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import CertificateBox from '../CertificateBox/CertificateBox';
import { TX_STATUS_ENUM } from '../../env';

export default class extends Component {
  state = {
    certificateString: '',
    textAreaClass: null,
    parsingWait: false,
    certificateObj: null,
    validCertificate: null,
    txStatus: TX_STATUS_ENUM.NOT_INITIATED
  };

  timeoutId = null;

  onTextAreaChange = event => {
    const spacesRemoved = event.target.value.split(' ').join('').split('\n').join('');
    // console.log(spacesRemoved);
    try {
      const certificateObj = window._z.decodeCertificateData(spacesRemoved);

      this.setState({
        certificateString: spacesRemoved,
        textAreaClass: 'valid',
        parsingWait: true,
        validCertificate: null
      });

      this.timeoutId = setTimeout(() => {
        this.setState({
          parsingWait: false,
          certificateObj
        });
      }, 500);
    } catch (error) {
      clearTimeout(this.timeoutId);
      this.setState({
        textAreaClass: 'invalid',
        parsingWait: false,
        certificateObj: null
      });
    }
  }

  onRegister = async() => {
    this.setState({ txStatus: TX_STATUS_ENUM.SIGNING });
    const tx = await window.certificateContractInstance.functions.registerCertificate(this.state.certificateString);
    this.setState({ txStatus: TX_STATUS_ENUM.WAITING_FOR_CONFIRMATION });
    await tx.wait();
    this.setState({ txStatus: TX_STATUS_ENUM.CONFIRMED });
    setTimeout(() => {
      this.props.history.push(`view-certificate/${this.state.certificateObj.certificateHash}`);
    },1000);
  }

  render = () => (
    <>
      <Helmet>
        <title>Register Certificate</title>
        <meta
          name="description"
          content="Register your certificate on Blockchain"
        />
      </Helmet>
      <p>Paste your signed certificate in the below box:</p>
      <textarea className={['certificate-textarea', this.state.textAreaClass].filter(className=>!!className).join(' ')} onChange={this.onTextAreaChange} />

      {this.state.parsingWait
        ? <p>Please wait parsing your certificate...</p>
        : null}

      {this.state.certificateObj
        ? <>
          <p>Your certificate preview:</p>
          <CertificateBox
            certificateObj={this.state.certificateObj}
            qrDisplay={false}
            validCertificate={[this.state.validCertificate, newStatus => this.setState({ validCertificate: newStatus })]}
            />
        </>
        : null}

      {this.state.validCertificate
        ? <>

        </>
        : <></>}

        <button
          className="btn"
          disabled={this.state.txStatus !== TX_STATUS_ENUM.NOT_INITIATED || this.state.validCertificate !== (this.state.certificateObj && this.state.certificateObj.signatures.length)}
          onClick={this.onRegister}
        >
          {(() => {
            switch(this.state.txStatus) {
              case TX_STATUS_ENUM.NOT_INITIATED:
                return 'Register Certificate';
              case TX_STATUS_ENUM.SIGNING:
                return 'Signing transaction..';
              case TX_STATUS_ENUM.WAITING_FOR_CONFIRMATION:
                return 'Waiting for confirmation...';
              case TX_STATUS_ENUM.CONFIRMED:
                return 'Certificate is registered!';
            }
          })()}
        </button>
    </>
  );
}
