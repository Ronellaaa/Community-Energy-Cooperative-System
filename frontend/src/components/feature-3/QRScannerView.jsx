import React from 'react';
import { QrReader } from 'react-qr-reader';

const QRScannerView = ({ onScan, onError, onClose }) => {
  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-frame">
        <QrReader
          onResult={onScan}
          onError={onError}
          style={{ width: '100%' }}
        />
        <div className="qr-scanner-overlay" />
      </div>
      
      <button onClick={onClose} className="qr-scanner-cancel-btn">
        Cancel
      </button>
    </div>
  );
};

export default QRScannerView;