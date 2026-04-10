import React from 'react';

const ScanButton = ({ onClick }) => {
  return (
    <div className="f3mr-scanShell">
      <button
        className="f3mr-scanButton"
        type="button"
        onClick={onClick}
      >
        Open QR Scanner
      </button>
    </div>
  );
};

export default ScanButton;
