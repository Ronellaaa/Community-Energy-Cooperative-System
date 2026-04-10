import React from 'react';
import { useQRScanner } from '../../hooks/feature-3/useQRScanner';
import ScannerUI from './ScannerUI';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const {
    scanning,
    error,
    scannedData,
    startScanning,
    handleScan,
    handleError,
    reset
  } = useQRScanner();

  React.useEffect(() => {
    if (scannedData) {
      onScanSuccess(scannedData);
      reset();
    }
  }, [scannedData, onScanSuccess, reset]);

  React.useEffect(() => {
    startScanning();
    return () => reset();
  }, []);

  if (!scanning) {
    return null;
  }

  return (
    <div className="f3mr-scannerShell">
      {error ? <p className="f3mr-errorText">{error}</p> : null}
      <ScannerUI
        onScan={handleScan}
        onError={handleError}
        onClose={onClose}
      />
    </div>
  );
};

export default QRScanner;
