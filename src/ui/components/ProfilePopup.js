// Profile popup: current avatar + username at the top, then Avatar / Frame / Title
// tabs below, each a scrollable list of selectable options.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURES, CREATURE_MAP } from "../../data/creatures.js";
import { getChain, getSkinsForCreature } from "../../core/creatures.js";
import { DEFAULT_AVATAR, FRAME_OPTIONS, FRAME_MAP } from "../../data/profileCosmetics.js";
import { FLAIR_TITLES } from "../../data/flair.js";

const TABS = [
  { id: "avatar", label: "Avatar" },
  { id: "frame", label: "Frame" },
  { id: "title", label: "Title" },
];

const ALL_TITLES = Object.values(FLAIR_TITLES).flat().map((t) => t.name);

function buildAvatarOptions(everOwnedCreatureIds, unlockedSkins) {
  const options = [{ id: "default", emoji: DEFAULT_AVATAR, label: "Default" }];
  const roots = CREATURES.filter((c) => !c.evolutionOf);
  roots.forEach((root) => {
    getChain(root.id).forEach((id) => {
      if (!everOwnedCreatureIds.has(id)) return;
      const def = CREATURE_MAP[id];
      if (!def) return;
      options.push({ id: "base_" + id, emoji: def.emoji, label: def.name });
      getSkinsForCreature(id).forEach((skin) => {
        if (!(unlockedSkins || []).includes(skin.id)) return;
        const appearance = skin.appearances[id];
        if (!appearance) return;
        options.push({ id: skin.id + "_" + id, emoji: appearance.emoji, label: def.name + " (" + skin.name + ")" });
      });
    });
  });
  return options;
}

function ProfilePopup({ onClose }) {
  const {
    everOwnedCreatureIds, owned, unlockedSkins, username, setUsername,
    profileEmoji, setProfileEmoji, profileAvatarId, setProfileAvatarId,
    profileFrame, setProfileFrame,
    profileTitle, setProfileTitle,
  } = useGame();
  const [tab, setTab] = React.useState("avatar");
  const [editingName, setEditingName] = React.useState(false);

  const avatarOptions = React.useMemo(() => buildAvatarOptions(everOwnedCreatureIds, unlockedSkins), [everOwnedCreatureIds, unlockedSkins]);
  const unlockedTitles = React.useMemo(() => {
    const set = new Set();
    Object.values(owned).forEach((o) => (o.unlockedFlair || []).forEach((name) => set.add(name)));
    return set;
  }, [owned]);
  const sortedTitles = React.useMemo(
    () => [...ALL_TITLES].sort((a, b) => unlockedTitles.has(b) - unlockedTitles.has(a)),
    [unlockedTitles]
  );
  const frame = FRAME_MAP[profileFrame] || FRAME_MAP.none;

  return React.createElement("div", {
    style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 },
    onClick: onClose,
  },
    React.createElement("div", {
      style: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 360, height: "min(560px, 85vh)", display: "flex", flexDirection: "column", overflow: "hidden" },
      onClick: (e) => e.stopPropagation(),
    },
      React.createElement("div", { style: { padding: "20px 20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, borderBottom: "1px solid #f0f0f0" } },
        React.createElement("div", {
          style: { width: 84, height: 84, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, border: frame.border, borderImage: frame.borderImage || "none", boxShadow: frame.shadow }
        }, profileEmoji),
        editingName
          ? React.createElement("input", {
              autoFocus: true,
              value: username,
              maxLength: 20,
              onChange: (e) => setUsername(e.target.value),
              onBlur: () => setEditingName(false),
              onKeyDown: (e) => { if (e.key === "Enter") setEditingName(false); },
              style: { fontSize: 17, fontWeight: 700, color: "#111", border: "1.5px solid #d0d0d0", borderRadius: 8, padding: "4px 10px", outline: "none", textAlign: "center" }
            })
          : React.createElement("div", {
              onClick: () => setEditingName(true),
              style: { fontSize: 17, fontWeight: 700, color: "#111", cursor: "pointer", padding: "4px 10px" }
            }, username || "Player"),
        React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "#7c4dff", letterSpacing: 1, textTransform: "uppercase", minHeight: 14, lineHeight: "14px" } }, profileTitle || "")
      ),
      React.createElement("div", { style: { display: "flex", borderBottom: "1px solid #f0f0f0" } },
        TABS.map((t) =>
          React.createElement("button", {
            key: t.id,
            onClick: () => setTab(t.id),
            style: { flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #7c4dff" : "2px solid transparent", fontSize: 13, fontWeight: 700, color: tab === t.id ? "#7c4dff" : "#888", cursor: "pointer" }
          }, t.label)
        )
      ),
      React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 16 } },
        tab === "avatar" && React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 } },
          avatarOptions.map((opt) =>
            React.createElement("button", {
              key: opt.id,
              onClick: () => { setProfileEmoji(opt.emoji); setProfileAvatarId(opt.id); },
              title: opt.label,
              style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 2px", borderRadius: 10, border: opt.id === profileAvatarId ? "2px solid #7c4dff" : "2px solid #e8e8e8", background: opt.id === profileAvatarId ? "#f3eeff" : "#fafafa", cursor: "pointer" }
            },
              React.createElement("div", { style: { fontSize: 26, lineHeight: 1 } }, opt.emoji),
              React.createElement("div", { style: { fontSize: 9, fontWeight: 600, color: "#333", textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" } }, opt.label)
            )
          )
        ),
        tab === "frame" && React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 } },
          FRAME_OPTIONS.map((f) =>
            React.createElement("button", {
              key: f.id,
              onClick: () => setProfileFrame(f.id),
              style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 4px", borderRadius: 10, border: f.id === profileFrame ? "2px solid #7c4dff" : "2px solid #e8e8e8", background: f.id === profileFrame ? "#f3eeff" : "#fafafa", cursor: "pointer" }
            },
              React.createElement("div", { style: { width: 40, height: 40, borderRadius: "50%", background: "#EEEDFE", border: f.border, borderImage: f.borderImage || "none", boxShadow: f.shadow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 } }, profileEmoji),
              React.createElement("div", { style: { fontSize: 10, fontWeight: 600, color: "#333" } }, f.label)
            )
          )
        ),
        tab === "title" && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
          React.createElement("button", {
            onClick: () => setProfileTitle(null),
            style: { textAlign: "left", padding: "8px 12px", borderRadius: 8, border: !profileTitle ? "2px solid #7c4dff" : "2px solid #e8e8e8", background: !profileTitle ? "#f3eeff" : "#fafafa", fontSize: 13, fontWeight: 600, color: "#333", cursor: "pointer" }
          }, "None"),
          sortedTitles.map((name) => {
            const unlocked = unlockedTitles.has(name);
            return React.createElement("button", {
              key: name,
              onClick: () => { if (unlocked) setProfileTitle(name); },
              disabled: !unlocked,
              title: unlocked ? undefined : "Unlock this title on a creature first",
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", padding: "8px 12px", borderRadius: 8, border: profileTitle === name ? "2px solid #7c4dff" : "2px solid #e8e8e8", background: !unlocked ? "#f5f5f5" : (profileTitle === name ? "#f3eeff" : "#fafafa"), fontSize: 13, fontWeight: 600, color: !unlocked ? "#bbb" : "#333", cursor: unlocked ? "pointer" : "default" }
            },
              name,
              !unlocked && React.createElement("span", { style: { fontSize: 13 } }, "🔒")
            );
          })
        )
      ),
      React.createElement("div", { style: { padding: 14, borderTop: "1px solid #f0f0f0" } },
        React.createElement("button", {
          onClick: onClose,
          style: { width: "100%", padding: "10px 0", borderRadius: 12, border: "none", background: "#7c4dff", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }
        }, "Done")
      )
    )
  );
}

export default ProfilePopup;
