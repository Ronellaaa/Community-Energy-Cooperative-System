import React from 'react';
import { useSearchParams } from 'react-router-dom';
import BackButton from '../../components/feature-3/BackButton';
import MemberQrViewer from '../../components/feature-3/MemberQrViewer';
import { fetchCurrentUser } from '../../services/feature-3/currentUserApi';
import '../../styles/feature-3/meter-reading.css';

export default function MemberQrPage() {
  const [searchParams] = useSearchParams();
  const [sessionIdentity, setSessionIdentity] = React.useState({
    memberId: '',
    communityId: '',
  });

  const memberId = searchParams.get('memberId') || sessionIdentity.memberId || '';
  const communityId = searchParams.get('communityId') || sessionIdentity.communityId || '';

  React.useEffect(() => {
    const syncCurrentUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();

        if (currentUser.id) {
          localStorage.setItem("user", JSON.stringify(currentUser));
        }

        setSessionIdentity({
          memberId: String(currentUser.memberId || ''),
          communityId: String(currentUser.communityId || ''),
        });
      } catch {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          setSessionIdentity({
            memberId: String(storedUser.memberId || storedUser.id || ''),
            communityId: String(storedUser.communityId || ''),
          });
        } catch {
          setSessionIdentity({ memberId: '', communityId: '' });
        }
      }
    };

    syncCurrentUser();
  }, []);

  return (
    <div className="f3mr-page">
      <div className="f3mr-glow f3mr-glow-a" />
      <div className="f3mr-glow f3mr-glow-b" />

      <div className="f3mr-shell">
        <section className="f3mr-hero">
          <div className="f3mr-card f3mr-heroCard">
            <div className="f3mr-heroHeader">
              <BackButton className="f3mr-backButton" />
              <div className="f3mr-heroContent">
                <span className="f3mr-kicker">Community Energy</span>
                <h1 className="f3mr-title">
                  Member <span className="f3mr-titleAccent">QR Code</span>
                </h1>
                <p className="f3mr-subtitle">
                  View and download the QR code linked to your community membership.
                </p>
              </div>
            </div>
          </div>
        </section>

        <MemberQrViewer memberId={memberId} communityId={communityId} />
      </div>
    </div>
  );
}
