import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMemberQrUrl } from '../../services/feature-3/memberQrApi';

export const useMemberQr = ({ memberId, communityId }) => {
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const canFetch = useMemo(() => Boolean(memberId && communityId), [communityId, memberId]);

  const loadQr = useCallback(async () => {
    if (!canFetch) {
      setQrUrl('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setQrUrl(await fetchMemberQrUrl({ memberId, communityId }));
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load QR code');
      setQrUrl('');
    } finally {
      setLoading(false);
    }
  }, [canFetch, communityId, memberId]);

  useEffect(() => {
    loadQr();
  }, [loadQr]);

  const downloadQr = useCallback(async () => {
    if (!qrUrl) {
      return;
    }

    setDownloading(true);
    setError('');

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `member-qr-${memberId || 'code'}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(downloadError.message || 'Failed to download QR code');
    } finally {
      setDownloading(false);
    }
  }, [memberId, qrUrl]);

  return {
    qrUrl,
    loading,
    error,
    downloading,
    canFetch,
    loadQr,
    downloadQr,
  };
};
