import { useEffect, useRef, useState } from 'react';

export const useMeterReading = ({ month, year, lookupPreviousReading, onSubmit, onUpdate, onDelete }) => {
  const [memberId, setMemberId] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [manualMemberId, setManualMemberId] = useState('');
  const [manualCommunityId, setManualCommunityId] = useState('');
  const [previousReading, setPreviousReading] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [previousReadingLocked, setPreviousReadingLocked] = useState(true);
  const [lookupMessage, setLookupMessage] = useState('Scan a QR code to load meter details.');
  const [submitError, setSubmitError] = useState('');
  const [submittedReading, setSubmittedReading] = useState(null);
  const [isEditingSubmitted, setIsEditingSubmitted] = useState(false);
  const lookupRequestIdRef = useRef(0);

  const handleQRScan = ({ memberId, communityId }) => {
    setMemberId(String(memberId).trim());
    setCommunityId(String(communityId).trim());
    setShowScanner(false);
    setShowManualEntry(false);
    setSubmitError('');
    setCurrentReading('');
    setSubmittedReading(null);
    setIsEditingSubmitted(false);
  };

  const submitManualIds = () => {
    const nextMemberId = manualMemberId.trim();
    const nextCommunityId = manualCommunityId.trim();

    if (!nextMemberId || !nextCommunityId) {
      const errorMessage = 'Member ID and Community ID are required';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setMemberId(nextMemberId);
    setCommunityId(nextCommunityId);
    setShowManualEntry(false);
    setShowScanner(false);
    setSubmitError('');
    setCurrentReading('');
    setSubmittedReading(null);
    setIsEditingSubmitted(false);

    return { success: true };
  };

  useEffect(() => {
    const loadPreviousReading = async () => {
      if (!memberId || !communityId || !month || !year) {
        return;
      }

      if (submittedReading && !isEditingSubmitted) {
        return;
      }

      const requestId = lookupRequestIdRef.current + 1;
      lookupRequestIdRef.current = requestId;
      setLookupLoading(true);
      setSubmitError('');

      try {
        const result = await lookupPreviousReading({
          memberId,
          communityId,
          month: parseInt(month, 10),
          year: parseInt(year, 10)
        });

        if (lookupRequestIdRef.current !== requestId) {
          return;
        }

        if (result.previousReadingFound) {
          setPreviousReading(String(result.previousReading));
          setPreviousReadingLocked(true);
          setLookupMessage('Previous reading found automatically and locked for consistency.');
        } else {
          setPreviousReading('');
          setPreviousReadingLocked(false);
          setLookupMessage('No previous reading was found. Enter the previous reading manually to continue.');
        }
      } catch (error) {
        if (lookupRequestIdRef.current !== requestId) {
          return;
        }

        setPreviousReading('');
        setPreviousReadingLocked(false);
        setLookupMessage('Previous reading could not be loaded automatically. Enter it manually and continue.');
        setSubmitError(error.message || 'Failed to fetch previous reading');
      } finally {
        if (lookupRequestIdRef.current === requestId) {
          setLookupLoading(false);
        }
      }
    };

    loadPreviousReading();
  }, [communityId, isEditingSubmitted, lookupPreviousReading, memberId, month, submittedReading, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!month || !year) {
      const errorMessage = 'Billing month and year are required';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    }

    if (previousReading === '' || Number(previousReading) < 0) {
      const errorMessage = 'Please provide a valid previous reading';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    }

    if (!currentReading || Number(currentReading) < 0) {
      const errorMessage = 'Please enter a valid current reading';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    }

    if (Number(currentReading) < Number(previousReading)) {
      const errorMessage = 'Current reading cannot be less than previous reading';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setSubmitError('');
    setLoading(true);

    try {
      const payload = {
        memberId,
        communityId,
        previousReading: parseInt(previousReading, 10),
        currentReading: parseInt(currentReading, 10),
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      };

      const savedReading = submittedReading && isEditingSubmitted
        ? await onUpdate(submittedReading._id, payload)
        : await onSubmit(payload);

      setSubmittedReading(savedReading);
      setPreviousReading(String(savedReading.previousReading));
      setCurrentReading(String(savedReading.currentReading));
      setIsEditingSubmitted(false);

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to submit reading';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMemberId('');
    setCommunityId('');
    setManualMemberId('');
    setManualCommunityId('');
    setPreviousReading('');
    setCurrentReading('');
    setLookupLoading(false);
    setShowScanner(false);
    setShowManualEntry(false);
    setPreviousReadingLocked(true);
    setLookupMessage('Scan a QR code to load meter details.');
    setSubmitError('');
    setSubmittedReading(null);
    setIsEditingSubmitted(false);
  };

  const openScanner = () => {
    setSubmitError('');
    setShowScanner(true);
    setShowManualEntry(false);
  };

  const closeScanner = () => setShowScanner(false);

  const openManualEntry = () => {
    setSubmitError('');
    setShowManualEntry(true);
    setShowScanner(false);
  };

  const closeManualEntry = () => setShowManualEntry(false);

  const startEditing = () => {
    setSubmitError('');
    setIsEditingSubmitted(true);
    setPreviousReadingLocked(false);
  };

  const deleteSubmittedReading = async () => {
    if (!submittedReading) {
      return { success: false, error: 'No submitted reading available to delete' };
    }

    setSubmitError('');
    setLoading(true);

    try {
      await onDelete(submittedReading._id);
      resetForm();
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete reading';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
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
    deleteSubmittedReading
  };
};
