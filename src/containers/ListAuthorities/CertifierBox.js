import React, { Component } from 'react';

export default class extends Component {
  state = {
    data: null,
    isAuthorised: null
  };

  componentDidMount = async() => {
    try {
      const certifyingAuthority = await window.certificateContractInstance.functions.certifyingAuthorities(this.props.address);
      // console.log(certifyingAuthority);
      const data = window._z.decodeCertifyingAuthority(certifyingAuthority.data);
      this.setState({ data, isAuthorised: certifyingAuthority.isAuthorised });
    } catch (error) {
      console.error(error);
      this.setState({ name: 'Failed to load name...' });
    }
  }

  render = () => (
    <>
      <div className="form-group">
        {this.state.data ? <>
          {Object.entries(this.state.data).map((entry, i) => (
            <p key={'ca-property-'+i}>{window._z.toTitleCase(entry[0])}: {entry[0] === 'website' ? <a href={window._z.toWebsiteURL(entry[1])} rel="noopenner noreferrer" target="_blank">{entry[1]}</a> : <>{entry[1]}</>}</p>
          ))}
        </> : <>Loading...</>}
        <p>Signing Address: {this.props.address}</p>
        <p>Is Authorized: {this.state.isAuthorised === null ? 'Loading...' : (
          this.state.isAuthorised ? 'Yes' : 'No'
        )}</p>
      </div>
    </>
  );
}
