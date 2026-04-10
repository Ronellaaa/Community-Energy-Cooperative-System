import React from 'react';

const MeterReadingFields = ({
  memberId,
  communityId,
  previousReading,
  currentReading,
  previousReadingLocked,
  lookupLoading,
  lookupMessage,
  onPreviousReadingChange,
  onReadingChange,
  onScanDifferent,
  inputsDisabled
}) => {
  return (
    <>
      <div className="f3mr-detailCard">
        <div className="f3mr-detailGrid">
          <label className="f3mr-field">
            <span className="f3mr-fieldLabel">Member ID</span>
            <input
              className="f3mr-readonlyInput"
              type="text"
              value={memberId}
              readOnly
            />
          </label>

          <label className="f3mr-field">
            <span className="f3mr-fieldLabel">Community ID</span>
            <input
              className="f3mr-readonlyInput"
              type="text"
              value={communityId}
              readOnly
            />
          </label>
        </div>

        <div className="f3mr-actions">
          <button
            className="f3mr-secondaryButton"
            type="button"
            onClick={onScanDifferent}
            disabled={inputsDisabled}
          >
            Scan Different Member
          </button>
        </div>
      </div>

      <div className="f3mr-group">
        <label className="f3mr-fieldLabel">
          Previous Meter Reading (kWh)
        </label>
        <input
          className={previousReadingLocked ? 'f3mr-readonlyInput' : 'f3mr-numberInput'}
          type="number"
          value={previousReading}
          onChange={(e) => onPreviousReadingChange(e.target.value)}
          readOnly={previousReadingLocked || inputsDisabled}
          placeholder={lookupLoading ? 'Loading previous reading...' : 'Enter previous reading'}
        />
        <p className="f3mr-helpText">
          {lookupLoading
            ? 'Loading previous reading...'
            : lookupMessage}
        </p>
      </div>

      <div className="f3mr-group">
        <label className="f3mr-fieldLabel">
          Current Meter Reading (kWh)
        </label>
        <input
          className="f3mr-numberInput"
          type="number"
          value={currentReading}
          onChange={(e) => onReadingChange(e.target.value)}
          placeholder="Enter reading from meter"
          autoFocus
          readOnly={inputsDisabled}
          required
        />
        <p className="f3mr-helpText">
          Enter the latest value shown on the meter.
        </p>
      </div>
    </>
  );
};

export default MeterReadingFields;
