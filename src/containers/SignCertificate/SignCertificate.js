import React, { Component } from 'react';
// import { certificateContract } from '../../env';

const ethers = require('ethers');

const CURRENT_PAGE_ENUM = {
  SELECT_MODE: 0,
  SIGN_FRESH_CERTIFICATE: 1,
  SIGN_ENCODED_CERTIFICATE: 2
};

export default class extends Component {
  state = {
    currentScreen: CURRENT_PAGE_ENUM.SELECT_MODE,
    name: '',
    course: '',
    score: '',
    extraData: '',
    encodedCertificate: '',
    isAuthorised: true
  };

  componentDidMount = async() => {
    try {
      const certifyingAuthority = await window.certificateContractInstance.functions.certifyingAuthorities(await window.signer.getAddress());

      if(!certifyingAuthority.isAuthorised) {
        this.setState({ isAuthorised: false });
      }
    } catch(error) {
      console.error(error);
      setTimeout(this.componentDidMount, 1000);
    }
  }

  signThisCertificate = async() => {
    try {
      const nameBytes32 = window._z.stringToBytes32(this.state.name);
      const qualificationBytes32 = window._z.encodeQualification(
        this.state.course,
        +this.state.score
      );
      const extraData = ethers.utils.hexlify(this.state.extraData || '0x');
      if(extraData.length > 66) throw new Error('Extra Data Overflow, limit is 32 bytes');
      const extraDataBytes32 = ethers.utils.hexZeroPad(extraData, 32);

      const unsignedCertificateConcat = ethers.utils.hexlify(ethers.utils.concat([
        nameBytes32,
        qualificationBytes32,
        extraDataBytes32
      ]));

      const unsignedCertificateHash = ethers.utils.keccak256(
        ethers.utils.concat([ethers.utils.toUtf8Bytes('\x19Ethereum Signed Message:\n96'),unsignedCertificateConcat])
      );

      let signedCertificateConcat = unsignedCertificateConcat;

      const signature = await window.signer.signMessage(ethers.utils.arrayify(unsignedCertificateConcat));
      signedCertificateConcat = ethers.utils.concat([signedCertificateConcat, signature]);

      this.setState({
        encodedCertificate: ethers.utils.hexlify(signedCertificateConcat)
      });

      console.log('signed',ethers.utils.hexlify(signedCertificateConcat));
    } catch (error) {

    }
  };

  render = () => (
    <>
      {!this.state.isAuthorised ? <p className="error-message">Looks like {window.userAddress} is not authorised as a certifying authority, hence the smart contract will not accept certificates signed by this private key.</p> : null}

      <div className="form-group">
        <p>Enter Name:</p>
        <input
          className="certificate-textinput"
          type="text"
          placeholder="Enter Certifiee Name (Max 30 chars)"
          onChange={event => this.setState({name: event.target.value})}/>
      </div>

      <div className="form-group">
        <p>Enter Course:</p>
        <input
          className="certificate-textinput"
          type="text"
          placeholder="Enter Certifiee Course (Max 30 chars)"
          maxLength="30"
          onChange={event => this.setState({course: event.target.value})}/>
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
        <p>Extra Data:</p>
        <input
          className="certificate-textinput"
          type="text"
          placeholder="Enter Hex String 0x or can leave empty"
          onChange={event => this.setState({extraData: event.target.value})}/>
      </div>

      <button className="btn" onClick={this.signThisCertificate}>Sign this Certificate</button>
    </>
  );
}
