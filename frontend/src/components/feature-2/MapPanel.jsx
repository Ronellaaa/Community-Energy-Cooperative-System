import React from "react";
import "./../../styles/feature-2/mapPanel.css";

export default function MapPanel() {
  return (
    <div className="f2-mapWrap f2-glass">
      <div className="f2-mapHeader">
        <div>
          <div className="f2-mapTitle">Community Overview</div>
          <div className="f2-mapSub">Moratuwa • Phase 1 approval monitoring</div>
        </div>
        <button className="f2-btnGhost">Open Map</button>
      </div>

      <div className="f2-fakeMap">
        <div className="f2-gridLines" />
        <div className="f2-pin" />
      </div>

      {/* Floating chips (like the example bottom-right cards) */}
      <div className="f2-floatRow">
        <div className="f2-floatCard">
          <div className="f2-floatSmall">Officer</div>
          <div className="f2-floatBig">Approval Queue</div>
          <div className="f2-floatMeta">6 pending • Today 3:30 PM</div>
        </div>

        <div className="f2-floatCard dark">
          <div className="f2-floatSmall">Meter Check</div>
          <div className="f2-floatBig">Duplicate Guard</div>
          <div className="f2-floatMeta">Unique meter enforced</div>
        </div>
      </div>
    </div>
  );
}