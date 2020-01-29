import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import { certOrder } from '../../env';
import CSVReader from './CSVReader';
import CertificateBox from '../CertificateBox/CertificateBox';
import copy from 'copy-to-clipboard';

const ethers = require('ethers');

const CURRENT_PAGE_ENUM = {
  SELECT_MODE: 0,
  SIGN_FRESH_CERTIFICATE: 1,
  SIGN_ENCODED_CERTIFICATE: 2,
  SIGN_CSV: 3
};

export default class extends Component {
  state = {
    currentScreen: CURRENT_PAGE_ENUM.SELECT_MODE,
    name: '',
    subject: '',
    score: '',
    category: '',
    certificateHex: null,
    copied: false,
    authorityName: '',
    isAuthorised: true,
    certificatesToSign: [],
    errorsInCSV: '',
    csvSigning: false,
    certificatesSigned: []
  };

  intervalId = null;
  signerAddress = null;

  componentDidMount = () => {
    this.intervalId = setInterval(async() => {
      if(window.signer) {
        const currentAddress = await window.signer.getAddress();
        if(currentAddress !== this.signerAddress) {
          try {
            const certifyingAuthority = await window.certificateContractInstance.functions.certifyingAuthorities(currentAddress);

            if(certifyingAuthority.isAuthorised) {
              const authorityName = window._z.decodeCertifyingAuthority(certifyingAuthority.data).name;

              this.setState({ authorityName, isAuthorised: true });
            } else {
              this.setState({ authorityName: null, isAuthorised: false });
            }


          } catch(error) {
            console.error(error);
          }
          this.signerAddress = currentAddress;
        }
      }
    }, 100);
  }

  componentWillUnmount = () => {
    clearInterval(this.intervalId);
  }

  signNewCertificate = async() => {
    try {
      let encodedCertificate = window._z.encodeCertificateObject({
        name: this.state.name,
        subject: this.state.subject,
        score: this.state.score,
        category: this.state.category
      });

      const signature = await window.signer.signMessage(ethers.utils.arrayify(encodedCertificate.dataRLP));

      encodedCertificate = window._z.addSignaturesToCertificateRLP(encodedCertificate, signature);

      this.setState({
        certificateHex: encodedCertificate.fullRLP
      });

      // console.log('signed',ethers.utils.hexlify(signedCertificateConcat));
    } catch (error) {
      console.error(error.message);
    }
  };

  signEncodedCertificate = async() => {
    const encoded = window._z.encodeCertificateObject(this.state.certificateObj.parsedCertificate);

    const signature = await window.signer.signMessage(ethers.utils.arrayify(encoded.dataRLP));

    const certificateHex = window._z.addSignaturesToCertificateRLP(this.state.certificateString, signature).fullRLP;
    this.setState({ certificateHex });
  }

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
  };

  onFileLoaded = output => {
    let errorsInCSV = '';
    // csv rows: hex, name, subject, score, category
    let keys = ['hex', ...certOrder];
    const certificatesToSign = output.split('\n').map((row, i) => {
      const columns = row.split(',');
      if(i === 0 && columns[0] === 'hex') {
        keys = columns;
        return;
      }
      try {
        if(columns.length < 1) throw new Error('Not even 1 entry');
        if(isNaN(+columns[3])) throw new Error(`Invalid score: ${columns[3]}`);
        const certObj = {};
        keys.forEach((key, i) => {
          if(i !== 0) {
            certObj[key] = columns[i];
          }
        });
        const encodedCertificate = window._z.encodeCertificateObject(certObj);
        // encodedCertificate.columns = columns;
        return {encodedCertificate, columns};
      } catch (error) {
        errorsInCSV += `Error at row ${i+1}: ${error.message}\n`;
      }
    }).filter(entry => !!entry);
    console.log({certificatesToSign}, errorsInCSV);
    this.setState({ certificatesToSign, errorsInCSV });
  }

  signCSV = async() => {
    this.setState({ csvSigning: true });

    if(!window.signer) return alert('Signer not available, please connect metamask');

    const arrayOfCertificatesSignedPromises = this.state.certificatesToSign.map(async obj => {
      const signature = await window.signer.signMessage(ethers.utils.arrayify(obj.encodedCertificate.dataRLP));

      const columns = [...obj.columns];
      columns[0] = window._z.addSignaturesToCertificateRLP(columns[0] || obj.encodedCertificate.fullRLP, signature).fullRLP;

      // console.log({signature, });

      console.log(signature);
      return {
        ...obj,
        columns
      };
    });

    await Promise.all(arrayOfCertificatesSignedPromises);

    const certificatesSigned = [];

    for(const promise of arrayOfCertificatesSignedPromises) {
      certificatesSigned.push(await promise);
    }

    console.log('certificatesSigned',certificatesSigned);
    this.setState({ certificatesSigned, csvSigning: false });
  };

  downloadCSV = () => {
    const keys = ['hex', ...certOrder];
    const text = keys.join(',')+'\n'+this.state.certificatesSigned.map(c => {
      return [
        ...c.columns,
      ].join(',')
    }).join('\n');

    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'signed_certificates.csv' ;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  render = () => {
    let screen;

    const header = (
      <p style={{textAlign: ''}}><button className="btn" onClick={() => this.setState({ currentScreen: CURRENT_PAGE_ENUM.SELECT_MODE })}>Go Back to Select Mode</button></p>
    );

    if(this.state.currentScreen === CURRENT_PAGE_ENUM.SELECT_MODE) {
      screen = (
        <>
          <button
            className="btn"
            onClick={() => this.setState({ currentScreen: CURRENT_PAGE_ENUM.SIGN_FRESH_CERTIFICATE })}
          >New Certificate</button>
          <button
            className="btn"
            onClick={() => this.setState({ currentScreen: CURRENT_PAGE_ENUM.SIGN_ENCODED_CERTIFICATE })}
          >Sign Encoded Certificate</button>
          <button
            className="btn"
            onClick={() => this.setState({ currentScreen: CURRENT_PAGE_ENUM.SIGN_CSV })}
          >CSV Mode</button>
        </>
      );
    } else if(this.state.currentScreen === CURRENT_PAGE_ENUM.SIGN_FRESH_CERTIFICATE) {
      screen = (
        <>
        {this.state.certificateHex
          ? <>
          <p>Below is the signed certificate hex string. Send this hex string to certifiee and they can paste it in the 'Register Certificate' box on this ÐApp.</p>
          <p style={{wordBreak:'break-all'}}>{this.state.certificateHex}</p>
          <p style={{cursor: 'pointer'}} onClick={() => {
            copy(this.state.certificateHex);
            !this.state.copied && setTimeout(() => {
              this.setState({ copied: false });
            }, 1000);
            this.setState({ copied: true });
          }}>{this.state.copied ? '[ Copied! ]' : '[ Copy To Clipboard ]'}</p>
          </>
          : <>
        {header}
        <div className="form-group">
          <p>Enter Name:</p>
          <input
            className="certificate-textinput"
            type="text"
            placeholder="Enter Certifiee Name"
            onChange={event => this.setState({name: event.target.value})}/>
        </div>

        <div className="form-group">
          <p>Enter Subject:</p>
          <input
            className="certificate-textinput"
            type="text"
            placeholder="Enter Subject / Course Name"
            onChange={event => this.setState({subject: event.target.value})}/>
        </div>

        <div className="form-group">
          <p>Enter Score:</p>
          <input
            className="certificate-textinput"
            type="text"
            placeholder="E.g. 74.89"
            onChange={event => this.setState({score: event.target.value})}/>
        </div>

        <div className="form-group">
          <p>Certification Type / Category:</p>
          <input
            className="certificate-textinput"
            type="text"
            placeholder="e.g. Participation / Merit / Appreciation"
            onChange={event => this.setState({category: event.target.value})}/>
        </div>

        <button className="btn" onClick={this.signNewCertificate}>Sign this Certificate</button>
        </>}
        </>
      );
    } else if(this.state.currentScreen === CURRENT_PAGE_ENUM.SIGN_ENCODED_CERTIFICATE) {
      screen = (
        <>
        {this.state.certificateHex
          ? <>
          <p>Below is the signed certificate hex string. Send this hex string to certifiee and they can paste it in the 'Register Certificate' box on this ÐApp.</p>
          <p style={{wordBreak:'break-all'}}>{this.state.certificateHex}</p>
          <p style={{cursor: 'pointer'}} onClick={() => {
            copy(this.state.certificateHex);
            !this.state.copied && setTimeout(() => {
              this.setState({ copied: false });
            }, 1000);
            this.setState({ copied: true });
          }}>{this.state.copied ? '[ Copied! ]' : '[ Copy To Clipboard ]'}</p>
          </>
          : <>
        {header}
        <p>Paste an unsigned or signed certificate in the below box:</p>
        <textarea className={['certificate-textarea', this.state.textAreaClass].filter(className=>!!className).join(' ')} onChange={this.onTextAreaChange} />
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
          <button className="btn" onClick={this.signEncodedCertificate}>Sign this Certificate with your private key</button>
        </>}
        </>
      );
    } else if(this.state.currentScreen === CURRENT_PAGE_ENUM.SIGN_CSV) {
      screen = (
        <>
        {header}
          {this.state.certificatesToSign.length === 0
            ? <>
          <button className="btn" onClick={() => document.getElementById('csv-input').click()}>Select CSV file</button>
          <CSVReader
            inputId="csv-input"
            onFileLoaded={this.onFileLoaded}
            style={{display: 'none'}}
            onError={this.handleDarkSideForce}
          />
          </> : <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Extra Data</th>
                  <th>Signed Certificate</th>
                </tr>
              </thead>
              <tbody>
              {this.state.certificatesToSign.map((obj,i) => (
                <tr key={'sign-'+i}>
                  {obj.columns.map((field, j) => (
                    <td key={'sign-field-'+j}>
                      {field.length > 32
                        ? (field.slice(0,2) === '0x'
                          ? <>{field.slice(0,6)}...{field.slice(field.length - 4, field.length)} ({field.length/2} Bytes)</>
                          : <>{field.slice(0,10)}... ({field.length} chars)</>
                        )
                        : <>{field}</>}
                    </td>
                  ))}
                </tr>
              ))}
              </tbody>
            </table>

            <p>Errors: {this.state.errorsInCSV}</p>

            <button className="btn" onClick={this.signCSV}>{this.state.csvSigning ? 'Signing' : 'Sign'} {this.state.certificatesToSign.length} certificates{this.state.csvSigning ? '...' : null}</button>
          </>}

          {this.state.certificatesSigned.length ? <>
            <button className="btn" onClick={this.downloadCSV}>Download updated CSV</button>
          </> : null}
        </>
      );
    }


    return (
      <>
        <Helmet>
          <title>Sign Certificate</title>
          <meta
            name="description"
            content="Sign Certificate which can be submitted to blockchain"
          />
        </Helmet>
        {this.state.isAuthorised
          ? <p className="status-message">Welcome {this.state.authorityName}! Using this portal you can sign certificates on your half and send the generated certificate hex strings to your students/clients so they can register those certificates.</p>
          : <p className="error-message">Looks like {window.userAddress} is not authorised as a certifying authority, hence the smart contract will not accept certificates signed by this private key.</p>}

        {screen}
      </>
    );
  }
}
