import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ScannerUI = ({ onScan, onError, onClose }) => {
  const scannerRef = useRef(null);
  const readerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2, 10)}`);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  }, [onScan, onError]);

  useEffect(() => {
    let isMounted = true;
    let localScanner = null;

    const startScanner = async () => {
      const readerElement = document.getElementById(readerIdRef.current);
      if (readerElement) {
        readerElement.innerHTML = '';
      }

      const scanner = new Html5Qrcode(readerIdRef.current);
      localScanner = scanner;
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isMounted) {
              return;
            }
            onScanRef.current({ text: decodedText });
          },
          (errorMessage) => {
            if (!isMounted) {
              return;
            }
            onErrorRef.current(errorMessage);
          }
        );
      } catch (error) {
        if (isMounted) {
          onErrorRef.current(error);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;

      const stopScanner = async () => {
        const scannerInstance = localScanner || scannerRef.current;
        if (!scannerInstance) {
          return;
        }

        try {
          if (scannerInstance.isScanning) {
            await scannerInstance.stop();
          }
        } catch (error) {
          console.error('Error stopping scanner:', error);
        }

        try {
          await scannerInstance.clear();
        } catch (error) {
          console.error('Error clearing scanner:', error);
        }

        const readerElement = document.getElementById(readerIdRef.current);
        if (readerElement) {
          readerElement.innerHTML = '';
        }

        if (scannerRef.current === scannerInstance) {
          scannerRef.current = null;
        }
      };

      stopScanner();
    };
  }, []);

  return (
    <div className="f3mr-scannerShell">
      <div
        id={readerIdRef.current}
        className="f3mr-scannerFrame"
      />
      <button
        className="f3mr-scannerButton"
        type="button"
        onClick={onClose}
      >
        Stop Scanning
      </button>
    </div>
  );
};

export default ScannerUI;
