import React from 'react';

const IconHyperlink = ({ href, onClick, icon, iconSize = 'large', text, additionalClasses = '' }) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`waves-effect waves-light  ${additionalClasses}`}
    >
      <i className={`${iconSize} material-icons`}>{icon}</i>
      {text}
    </a>
  );
};

export default IconHyperlink;
