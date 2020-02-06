import React, { Component } from 'react';
import { AUTHORITY_STATUS_ENUM } from '../../env';

export default class extends Component {
  state = {
    obj: null,
    status: null
  };

  componentDidMount = async() => {
    try {
      const certifyingAuthority = await window.certificateContractInstance.functions.certifyingAuthorities(this.props.address);
      // console.log(certifyingAuthority);
      const obj = window._z.decodeCertifyingAuthority(certifyingAuthority.data);
      this.setState({ obj, status: certifyingAuthority.status });
    } catch (error) {
      console.error(error);
      this.setState({ name: 'Failed to load details...' });
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
      <p>Status: {this.state.status === null ? 'Loading...' : (
        (() => {
          switch(this.state.status) {
            case AUTHORITY_STATUS_ENUM.AUTHORISED:
              return <>Authorised</>;
            case AUTHORITY_STATUS_ENUM.MIGRATED:
              return <>Migrated</>;
            case AUTHORITY_STATUS_ENUM.SUSPENDED:
              return <>Suspended</>;
            default:
              return <>Not Authorised</>;
          }
        })()
      )}</p>
      </>
    );

    return (
      <>
        <div className="form-group mono row">
          {this.state.obj && this.state.obj.image ? <div>
            <div className="column2">
              <img style={{maxHeight:'200px', maxWidth:'200px'}} src={'https://ipfs.infura.io/ipfs/'+this.state.obj.image} />
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
