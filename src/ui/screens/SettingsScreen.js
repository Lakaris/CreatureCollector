// Settings screen: profile info plus basic app preferences.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { FRAME_MAP } from "../../data/profileCosmetics.js";
import ProfilePopup from "../components/ProfilePopup.js";
import ScreenHeader from "../components/ScreenHeader.js";

function ToggleRow({ label, value, onChange }) {
  return React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 4px" } },
    React.createElement("div", { style: { fontSize: 15, color: "#333" } }, label),
    React.createElement("button", {
      onClick: () => onChange(!value),
      style: { width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: value ? "#7c4dff" : "#ddd", position: "relative", padding: 0 }
    },
      React.createElement("div", { style: { position: "absolute", top: 2, left: value ? 20 : 2, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transition: "left .15s ease" } })
    )
  );
}

function SettingsScreen({ onBack }) {
  const { username, profileEmoji, profileFrame, profileTitle } = useGame();
  const [sound, setSound] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [showProfilePopup, setShowProfilePopup] = React.useState(false);
  const frame = FRAME_MAP[profileFrame] || FRAME_MAP.none;

  return React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column" } },
    React.createElement(ScreenHeader, { title: "Settings", onBack, edgeToEdge: false }),
    React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 16 } },
      React.createElement("div", { className: "card", style: { marginBottom: 16 } },
        React.createElement("button", {
          onClick: () => setShowProfilePopup(true),
          style: { width: "100%", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }
        },
          React.createElement("div", {
            style: { width: 56, height: 56, borderRadius: "50%", background: "#EEEDFE", border: frame.border, borderImage: frame.borderImage || "none", boxShadow: frame.shadow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }
          }, profileEmoji),
          React.createElement("div", { style: { flex: 1, minWidth: 0 } },
            React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "#111" } }, username || "Player"),
            React.createElement("div", { style: { fontSize: 10, fontWeight: 600, color: "#7c4dff", letterSpacing: 1, textTransform: "uppercase", marginTop: 2, minHeight: 13, lineHeight: "13px" } }, profileTitle || "")
          ),
          React.createElement("div", { style: { fontSize: 18, color: "#bbb" } }, "›")
        )
      ),
      React.createElement("div", { className: "card" },
        React.createElement(ToggleRow, { label: "🔊 Sound", value: sound, onChange: setSound }),
        React.createElement(ToggleRow, { label: "🔔 Notifications", value: notifications, onChange: setNotifications })
      ),
      React.createElement("div", { style: { marginTop: 16, textAlign: "center", fontSize: 12, color: "#aaa" } }, "Creature Collector v1.0.0")
    ),
    showProfilePopup && React.createElement(ProfilePopup, { onClose: () => setShowProfilePopup(false) })
  );
}

export default SettingsScreen;
