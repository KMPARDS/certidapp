import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import SignerBox from './SignerBox';
import './CertificateBox.css';
import { network, certOrder } from '../../env';

const QRCode = require('qrcode');
const ethers = require('ethers');

export default class extends Component {
  state = {
    validCertificate: (this.props.validCertificate&&this.props.validCertificate[0]) || null,
    isAlreadyRegistered: null
  };

  componentDidMount = async() => {
    setInterval(() => {
      if(this.props.validCertificate && this.state.validCertificate !== this.props.validCertificate[0]) {
        this.setState({ validCertificate: this.props.validCertificate[0] });
      }
    }, 100);
    if(this.props.qrDisplay) QRCode.toCanvas(document.getElementById('qrcode-canvas'), window.location.href);

    const certificate = await window.certificateContractInstance.certificates(this.props.certificateObj.certificateHash);

    this.setState({ isAlreadyRegistered: certificate.signers !== '0x' });
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
      <div className="certificate-container">
        {this.props.preview ? <p className="preview">{this.state.isAlreadyRegistered ? <>Seems that this certificate is already registered and available at <a style={{cursor: 'pointer'}} onClick={() => this.props.history.push(`view-certificate/${this.props.certificateObj.certificateHash}`)}>https://kmpards.github.io/certidapp/view-certificate/{this.props.certificateObj.certificateHash}</a>. The smart contract will again accept this certificate only if there are more signers otherwise it will raise an exception.</> : <>{(this.props.certificateObj.signatures ? this.props.certificateObj.signatures.length : 0) ? <>Note: This is only a preview of the certificate, please register the certificate.</> : <>This is a preview of the entered certificate hex data.</>}</>}</p> : null}
        <p className="category">Certificate of <span className="category mono">{this.props.certificateObj.parsedCertificate.category}</span></p>
        <p className="category-subtext">is awarded to</p>
        <p className="name mono">{this.props.certificateObj.parsedCertificate.name}</p>
        <p>For acheiving <span className="score mono">{this.props.certificateObj.parsedCertificate.score}%</span> <span className="mono">{this.props.certificateObj.parsedCertificate.category}</span> in <span className="subject mono">{this.props.certificateObj.parsedCertificate.subject}</span></p>

        {Object.keys(this.props.certificateObj.parsedCertificate).filter(key => !certOrder.includes(key)).map(key => (
          <p key={'cert-'+key} className={key}>{this.props.certificateObj.parsedCertificate[key]}</p>
        ))}


        <p>{this.state.validCertificate === (this.props.certificateObj.signatures ? this.props.certificateObj.signatures.length : 0)
          ? <>The above certificate information is signed by following <span className="mono">{this.state.validCertificate}</span> <span className="mono">signer{this.state.validCertificate > 1 ? <>s</>:null}
          </span> which is cryptographically verified by the certificate smart contract.</>
          : (
            0 < this.state.validCertificate
            && this.state.validCertificate < (this.props.certificateObj.signatures ? this.props.certificateObj.signatures.length : 0)
            ? <>Seems that this certificate is signed by only {this.state.validCertificate} valid signers out of {this.props.certificateObj.signatures ? this.props.certificateObj.signatures.length : 0} total signers, you can remove signatures of unauthorised signers.</>
            : <>Seems that this certificate is not signed by any authorised signers.</>
          )}</p>

        {(this.props.certificateObj.signatures ? this.props.certificateObj.signatures.length : 0)
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
            <p className="hash">Certificate Hash: <span className="mono">{this.props.certificateObj.certificateHash}</span></p>
            {this.props.certificateObj.txHashArray ? <p>Created at transaction{this.props.certificateObj.txHashArray.length > 1 ? <>s</> : null}
            {this.props.certificateObj.txHashArray.map(txHash => (
              <span key={'txHash-'+txHash}><br />
                <span className="mono">{txHash.slice(0,6)}</span>...<span className="mono">{txHash.slice(62)}</span>. <a className="link-black" target="_blank" rel="noopenner noreferrer" href={`https://${network === 'homestead' ? '' : network+'.'}etherscan.io/tx/${txHash}`}>View on EtherScan</a></span>
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
                <div className="column2">
                  <div className="qrcode-canvas-container">
                  <canvas id="qrcode-canvas" />
                  </div>
                </div>
              </div>
            );
          }

          return content;
        })()}
      </div>
    </div>
  );
}
