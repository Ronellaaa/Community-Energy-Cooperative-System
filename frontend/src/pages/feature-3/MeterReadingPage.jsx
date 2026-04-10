import React from 'react';
import MeterReadingForm from '../../components/feature-3/MeterReadingForm';
import { useMeterReadingPage } from '../../hooks/feature-3/useMeterReadingPage';
import '../../styles/feature-3/meter-reading.css';

export default function MeterReadingPage() {
  const {
    month,
    setMonth,
    year,
    setYear,
    status,
    lookupPreviousReading,
    handleSubmit,
    handleUpdate,
    handleDelete,
  } = useMeterReadingPage();

  return (
    <div className="f3mr-page">
      <div className="f3mr-glow f3mr-glow-a" />
      <div className="f3mr-glow f3mr-glow-b" />

      <div className="f3mr-shell">
        <section className="f3mr-hero">
          <div className="f3mr-card f3mr-heroCard">
            <span className="f3mr-kicker">Community Energy</span>
            <h1 className="f3mr-title">
              Smart <span className="f3mr-titleAccent">Meter Reading</span>
            </h1>
            <p className="f3mr-subtitle">
              Record monthly electricity meter readings quickly and accurately for your community.
            </p>

            <div className="f3mr-metrics">
              <div className="f3mr-metric">
                <span className="f3mr-metricLabel">Billing Period</span>
                <span className="f3mr-metricValue">{month}/{year}</span>
              </div>
              <div className="f3mr-metric">
                <span className="f3mr-metricLabel">Status</span>
                <span className="f3mr-metricValue">Ready for entry</span>
              </div>
            </div>
          </div>

          <aside className="f3mr-card f3mr-sideCard">
            <h2 className="f3mr-checklistTitle">Before You Start</h2>
            <div className="f3mr-checklist">
              <div className="f3mr-checkItem">
                <span className="f3mr-checkBadge">1</span>
                <div>
                  <span className="f3mr-checkLabel">Choose the billing period</span>
                  <span className="f3mr-checkText">
                    Make sure the month and year match the reading you are about to record.
                  </span>
                </div>
              </div>
              <div className="f3mr-checkItem">
                <span className="f3mr-checkBadge">2</span>
                <div>
                  <span className="f3mr-checkLabel">Scan the member QR code</span>
                  <span className="f3mr-checkText">
                    This helps open the correct member record before you enter the meter value.
                  </span>
                </div>
              </div>
              <div className="f3mr-checkItem">
                <span className="f3mr-checkBadge">3</span>
                <div>
                  <span className="f3mr-checkLabel">Enter and submit the reading</span>
                  <span className="f3mr-checkText">
                    Review the details on the screen, then save the reading when everything looks right.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="f3mr-card f3mr-controlsCard">
          <div className="f3mr-sectionHead">
            <div>
              <h2 className="f3mr-sectionTitle">Reading Details</h2>
              <p className="f3mr-sectionNote">Select the billing month and year before continuing.</p>
            </div>
            <span className="f3mr-badge">Meter Reading</span>
          </div>

          <div className="f3mr-grid">
            <label className="f3mr-field">
              <span className="f3mr-fieldLabel">Billing Month</span>
              <input
                className="f3mr-numberInput"
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </label>

            <label className="f3mr-field">
              <span className="f3mr-fieldLabel">Billing Year</span>
              <input
                className="f3mr-numberInput"
                type="number"
                min="2000"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              />
            </label>
          </div>
        </section>

        {status.message ? (
          <div className={`f3mr-status ${status.type === 'success' ? 'f3mr-statusSuccess' : 'f3mr-statusError'}`}>
            {status.message}
          </div>
        ) : null}

        <MeterReadingForm
          month={month}
          year={year}
          lookupPreviousReading={lookupPreviousReading}
          onSubmit={handleSubmit}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
