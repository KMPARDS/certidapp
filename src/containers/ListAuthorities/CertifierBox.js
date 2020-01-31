import React, { Component } from 'react';

export default class extends Component {
  state = {
    obj: null,
    isAuthorised: null
  };

  componentDidMount = async() => {
    try {
      const certifyingAuthority = await window.certificateContractInstance.functions.certifyingAuthorities(this.props.address);
      // console.log(certifyingAuthority);
      const obj = window._z.decodeCertifyingAuthority(certifyingAuthority.data);
      this.setState({ obj, isAuthorised: certifyingAuthority.isAuthorised });
    } catch (error) {
      console.error(error);
      this.setState({ name: 'Failed to load name...' });
    }
  }

  render = () => {
    const certifierElement = (
      <>
      {this.state.obj ? <>
        {Object.entries(this.state.obj).map((entry, i) => (
          <p key={'ca-property-'+i}>{window._z.toTitleCase(entry[0])}: {entry[0] === 'website' ? <a className="link" href={window._z.toWebsiteURL(entry[1])} rel="noopenner noreferrer" target="_blank">{entry[1]}</a> : <>{entry[1]}</>}</p>
        ))}
      </> : <>Loading...</>}
      <p>Signing Address: {this.props.address}</p>
      <p>Is Authorized: {this.state.isAuthorised === null ? 'Loading...' : (
        this.state.isAuthorised ? 'Yes' : 'No'
      )}</p>
      </>
    );

    return (
      <>
        <div className="form-group mono row">
          {this.state.obj && this.state.obj.logo ? <div>
            <div className="column2">
              <img src={'https://ipfs.infura.io/ipfs/'+this.state.obj.logo} />
            </div>
            <div className="column1" style={{textAlign: 'left'}}>
              <div style={{marginLeft: '1rem'}}>
                {certifierElement}
              </div>
            </div>
          </div> : certifierElement}
        </div>
      </>
    );
  }
}
