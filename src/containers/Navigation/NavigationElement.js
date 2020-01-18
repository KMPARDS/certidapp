import React from 'react';
import { withRouter } from 'react-router-dom';

const NavigationElement = props => {
  const urlFormat = props.heading.toLowerCase().split(' ').join('-');

  return (
    <a className={`navigation-element${props.location.pathname === `/${urlFormat}` ? ' active' : ''}`} style={{cursor: 'pointer'}} onClick={() => props.history.push(`${urlFormat}`)}>{props.heading}</a>
  );
};

export default withRouter(NavigationElement);
