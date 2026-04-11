import React from 'react';
import { useMemberQr } from '../../hooks/feature-3/useMemberQr';

const MemberQrViewer = ({ memberId, communityId }) => {
  const {
    qrUrl,
    loading,
    error,
    downloading,
    canFetch,
    loadQr,
    downloadQr,
  } = useMemberQr({ memberId, communityId });

  if (!canFetch) {
    return (
      <section className="f3mr-card f3mr-qrCard">
        <div className="f3mr-formHeader">
          <h2 className="f3mr-formTitle">View QR Code</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="f3mr-card f3mr-qrCard">
      <div className="f3mr-formHeader">
        <h2 className="f3mr-formTitle">Member QR Code</h2>
        <p className="f3mr-formText">
          Use this QR code for quick meter readings.
        </p>
      </div>

      <div className="f3mr-detailCard">
        <div className="f3mr-detailGrid">
          <label className="f3mr-field">
            <span className="f3mr-fieldLabel">Member ID</span>
            <input className="f3mr-readonlyInput" type="text" value={memberId} readOnly />
          </label>

          <label className="f3mr-field">
            <span className="f3mr-fieldLabel">Community ID</span>
            <input className="f3mr-readonlyInput" type="text" value={communityId} readOnly />
          </label>
        </div>
      </div>

      {error ? <div className="f3mr-status f3mr-statusError">{error}</div> : null}

      <div className="f3mr-qrDisplay">
        {loading ? (
          <div className="f3mr-qrPlaceholder">Loading QR code...</div>
        ) : qrUrl ? (
          <img className="f3mr-qrImage" src={qrUrl} alt="Member QR code" />
        ) : (
          <div className="f3mr-qrPlaceholder">QR code is not available right now.</div>
        )}
      </div>

      <div className="f3mr-actions">
        <button className="f3mr-secondaryButton" type="button" onClick={loadQr} disabled={loading}>
          Refresh QR
        </button>
        <button
          className="f3mr-submitButton"
          type="button"
          onClick={downloadQr}
          disabled={!qrUrl || downloading}
        >
          {downloading ? 'Downloading...' : 'Download PNG'}
        </button>
      </div>
    </section>
  );
};

export default MemberQrViewer;
