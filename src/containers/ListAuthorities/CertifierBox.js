import React, { Component } from 'react';

export default class extends Component {
  state = {
    name: null,
    isAuthorised: null
  };

  componentDidMount = async() => {
    try {
      const certifyingAuthority = await window.certificateContractInstance.functions.certifyingAuthorities(this.props.address);
      // console.log(certifyingAuthority);
      const name = window._z.bytesToString(certifyingAuthority.name);
      this.setState({ name, isAuthorised: certifyingAuthority.isAuthorised });
    } catch (error) {
      console.error(error);
      this.setState({ name: 'Failed to load name...' });
    }
  }

  render = () => (
    <>
      <div className="form-group">
        <p>Name: {this.state.name === null ? 'Loading...' : this.state.name}</p>
        <p>Signing Address: {this.props.address}</p>
        <p>Is Authorized: {this.state.isAuthorised === null ? 'Loading...' : (
          this.state.isAuthorised ? 'Yes' : 'No'
        )}</p>
      </div>
    </>
  );
}
