import React from 'react';
import { withRouter } from 'react-router-dom';

const NavigationElement = props => {
  const urlFormat = props.heading.toLowerCase().split(' ').join('-');

  return (
    <button className={`navigation-element${props.location.pathname === `/${urlFormat}` ? ' active' : ''}`} style={{cursor: 'pointer'}} onClick={() => props.history.push(`${process.env.PUBLIC_URL ? '/'+process.env.PUBLIC_URL : ''}/${urlFormat}`)}>{props.heading}</button>
  );
};

export default withRouter(NavigationElement);
