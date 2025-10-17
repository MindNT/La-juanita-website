import React from 'react';
import { assetUrl, handleImgError } from '../utils/imageHelpers';

const GreenButton = ({ onClick, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 
      flex items-center justify-center transition-colors duration-200 ${className}`}
      {...props}
    >
      <img 
        src={assetUrl('/assets/check-circle.svg')}
        alt="Check"
        className="w-6 h-6"
        onError={handleImgError}
      />
    </button>
  );
};

export default GreenButton;

