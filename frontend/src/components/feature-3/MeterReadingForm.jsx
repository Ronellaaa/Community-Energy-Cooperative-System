import React from "react";
import { useMeterReading } from "../../hooks/feature-3/useMeterReading";
import QRScanner from "./QRScanner";
import ScanButton from "./ScanButton";
import MeterReadingFields from "./MeterReadingFields";
import SubmitButton from "./SubmitButton";

const MeterReadingForm = ({
  month,
  year,
  lookupPreviousReading,
  onSubmit,
  onUpdate,
  onDelete,
}) => {
  const {
    memberId,
    communityId,
    previousReading,
    currentReading,
    manualMemberId,
    manualCommunityId,
    loading,
    lookupLoading,
    showScanner,
    showManualEntry,
    previousReadingLocked,
    lookupMessage,
    submitError,
    submittedReading,
    isEditingSubmitted,
    setPreviousReading,
    setCurrentReading,
    setManualMemberId,
    setManualCommunityId,
    handleQRScan,
    handleSubmit,
    submitManualIds,
    openScanner,
    closeScanner,
    openManualEntry,
    closeManualEntry,
    resetForm,
    startEditing,
    deleteSubmittedReading,
  } = useMeterReading({
    month,
    year,
    lookupPreviousReading,
    onSubmit,
    onUpdate,
    onDelete,
  });

  const handleScanDifferent = () => {
    resetForm();
    openScanner();
  };

  const isLockedAfterSubmit = Boolean(submittedReading) && !isEditingSubmitted;
  const submitButtonLabel = isEditingSubmitted
    ? "Save Changes"
    : "Submit Meter Reading";

  if (!memberId) {
    return (
      <section className="f3mr-card f3mr-formCard">
        <div className="f3mr-formHeader">
          <h3 className="f3mr-formTitle">Enter Meter Reading</h3>
          <p className="f3mr-formText">
            Start by scanning the member QR code or enter the member details
            manually if the scanner is unavailable.
          </p>
        </div>

        {submitError ? (
          <div className="f3mr-status f3mr-statusError">{submitError}</div>
        ) : null}

        <div className="f3mr-entryOptions">
          <div className="f3mr-entryCard">
            <h4 className="f3mr-entryTitle">Scan QR Code</h4>
            <p className="f3mr-entryText">
              Use the member QR code to autofill the member and community IDs.
            </p>
            {!showScanner ? (
              <ScanButton onClick={openScanner} />
            ) : (
              <QRScanner onScanSuccess={handleQRScan} onClose={closeScanner} />
            )}
          </div>

          <div className="f3mr-entryCard">
            <h4 className="f3mr-entryTitle">Enter IDs Manually</h4>
            <p className="f3mr-entryText">
              Use this fallback when the QR scanner cannot be used.
            </p>

            {!showManualEntry ? (
              <button
                className="f3mr-secondaryButton"
                type="button"
                onClick={openManualEntry}
              >
                Enter IDs Manually
              </button>
            ) : (
              <div className="f3mr-manualEntry">
                <label className="f3mr-field">
                  <span className="f3mr-fieldLabel">Member ID</span>
                  <input
                    className="f3mr-input"
                    type="text"
                    value={manualMemberId}
                    onChange={(e) => setManualMemberId(e.target.value)}
                    placeholder="Enter member ID"
                  />
                </label>

                <label className="f3mr-field">
                  <span className="f3mr-fieldLabel">Community ID</span>
                  <input
                    className="f3mr-input"
                    type="text"
                    value={manualCommunityId}
                    onChange={(e) => setManualCommunityId(e.target.value)}
                    placeholder="Enter community ID"
                  />
                </label>

                <div className="f3mr-actions">
                  <button
                    className="f3mr-secondaryButton"
                    type="button"
                    onClick={closeManualEntry}
                  >
                    Cancel
                  </button>
                  <button
                    className="f3mr-submitButton"
                    type="button"
                    onClick={submitManualIds}
                  >
                    Load Member
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="f3mr-card f3mr-formCard">
      <div className="f3mr-formHeader">
        <h3 className="f3mr-formTitle">Reading Details</h3>
        <p className="f3mr-formText">
          Review the member details and enter the latest meter reading for the
          selected billing period.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <MeterReadingFields
          memberId={memberId}
          communityId={communityId}
          previousReading={previousReading}
          currentReading={currentReading}
          previousReadingLocked={previousReadingLocked}
          lookupLoading={lookupLoading}
          lookupMessage={lookupMessage}
          onPreviousReadingChange={setPreviousReading}
          onReadingChange={setCurrentReading}
          onScanDifferent={handleScanDifferent}
          inputsDisabled={isLockedAfterSubmit}
        />

        {submitError ? (
          <div className="f3mr-status f3mr-statusError">{submitError}</div>
        ) : null}

        {submittedReading ? (
          <div className="f3mr-status f3mr-statusSuccess">
            {isEditingSubmitted
              ? "Editing the submitted reading. Save your changes when ready."
              : `Reading saved. ${submittedReading.unitsConsumed} units recorded for this member.`}
          </div>
        ) : null}

        {submittedReading && !isEditingSubmitted ? (
          <div className="f3mr-actions f3mr-actionsWide">
            <button
              className="f3mr-secondaryButton"
              type="button"
              onClick={startEditing}
              disabled={loading}
            >
              Edit Reading
            </button>
            <button
              className="f3mr-dangerButton"
              type="button"
              onClick={deleteSubmittedReading}
              disabled={loading}
            >
              Delete Reading
            </button>
            <button
              className="f3mr-submitButton"
              type="button"
              onClick={handleScanDifferent}
              disabled={loading}
            >
              Next Reader
            </button>
          </div>
        ) : (
          <SubmitButton
            loading={loading || lookupLoading}
            label={submitButtonLabel}
          />
        )}
      </form>
    </section>
  );
};

export default MeterReadingForm;
