import { useState } from 'react';

export const useQRScanner = () => {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const startScanning = () => {
    setScanning(true);
    setError('');
    setScannedData(null);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const handleScan = (result) => {
    if (result) {
      const scannedText = result.text;
      const [memberId, communityId] = scannedText.split('|');
      
      if (memberId && communityId) {
        setScannedData({ memberId, communityId });
        stopScanning();
      } else {
        setError('Invalid QR code format');
      }
    }
  };

  const handleError = (err) => {
    const message = String(err || '');
    console.error('QR Scan Error:', err);

    // html5-qrcode may emit frequent decode errors while the camera is working.
    // We only surface likely camera/setup failures and keep the scanner open.
    const isExpectedScanMiss =
      message.toLowerCase().includes('not found') ||
      message.toLowerCase().includes('no barcode') ||
      message.toLowerCase().includes('no multiformat readers') ||
      message.toLowerCase().includes('code not found');

    if (isExpectedScanMiss) {
      setError('');
      return;
    }

    setError('Scanner is active. If the preview is blank, recheck camera permission and refresh.');
  };

  const reset = () => {
    setError('');
    setScannedData(null);
    setScanning(false);
  };

  return {
    scanning,
    error,
    scannedData,
    startScanning,
    stopScanning,
    handleScan,
    handleError,
    reset
  };
};
