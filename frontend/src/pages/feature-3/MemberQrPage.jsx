import React from 'react';
import { useSearchParams } from 'react-router-dom';
import MemberQrViewer from '../../components/feature-3/MemberQrViewer';
import '../../styles/feature-3/meter-reading.css';

export default function MemberQrPage() {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('memberId') || '';
  const communityId = searchParams.get('communityId') || '';

  return (
    <div className="f3mr-page">
      <div className="f3mr-glow f3mr-glow-a" />
      <div className="f3mr-glow f3mr-glow-b" />

      <div className="f3mr-shell">
        <section className="f3mr-hero">
          <div className="f3mr-card f3mr-heroCard">
            <span className="f3mr-kicker">Community Energy</span>
            <h1 className="f3mr-title">
              Member <span className="f3mr-titleAccent">QR Code</span>
            </h1>
            <p className="f3mr-subtitle">
              View and download the QR code linked to a community member.
            </p>
          </div>

          <aside className="f3mr-card f3mr-sideCard">
            <h2 className="f3mr-checklistTitle">Quick Note</h2>
            <div className="f3mr-checklist">
              <div className="f3mr-checkItem">
                <span className="f3mr-checkBadge">i</span>
                <div>
                  <span className="f3mr-checkLabel">Ready for dashboard use</span>
                  <span className="f3mr-checkText">
                    This page is prepared for a future "View QR Code" button on the user dashboard.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <MemberQrViewer memberId={memberId} communityId={communityId} />
      </div>
    </div>
  );
}
