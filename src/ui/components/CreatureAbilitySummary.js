// Shared "here are its skills" block: icon placeholder (mirrors the Creature
// Detail page's ability art slot), Basic/Special/Passive tag, mechanic pills,
// and the base-level description. Used anywhere a creature reveal wants to
// show off abilities without the full Creature Detail page (tutorial starter
// pick, single-egg hatch result).
import React from "../../react.js";
import { getAbilityTags, ABILITY_TAG_DEFS } from "../../core/abilityText.js";

const ABILITY_META = {
  basic: { label: "Basic", bg: "#EAF3DE", color: "#173404" },
  special: { label: "Special", bg: "#EEEDFE", color: "#26215C" },
  unique: { label: "Passive", bg: "#FFF3CD", color: "#5A3E00" },
};
const ABILITY_KEYS = ["basic", "special", "unique"];

function CreatureAbilitySummary({ def, maxWidth = 360, flat = false }) {
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth } },
    ABILITY_KEYS.map((key) => {
      const ability = def.abilities[key];
      const meta = ABILITY_META[key];
      const tags = getAbilityTags(def.id, key);
      return React.createElement(
        "div",
        {
          key,
          style: flat ? {
            padding: "6px 0",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            textAlign: "left",
          } : {
            background: "#f7f6ff",
            border: "1px solid #e0ddf7",
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            textAlign: "left",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              width: 36,
              height: 36,
              borderRadius: 8,
              background: flat ? "transparent" : meta.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            },
          },
          ability.icon
            ? React.createElement("img", { src: ability.icon, style: { width: "100%", height: "100%", objectFit: "cover" } })
            : React.createElement("span", { style: { fontSize: 8, fontWeight: 700, color: flat ? "#000" : meta.color, opacity: 0.5, userSelect: "none" } }, "No img")
        ),
        React.createElement(
          "div",
          { style: { flex: 1 } },
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
            React.createElement(
              "span",
              {
                style: {
                  fontSize: 9,
                  fontWeight: 800,
                  color: "#555",
                  background: "#e8e8e8",
                  borderRadius: 20,
                  padding: "2px 7px",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                },
              },
              meta.label
            ),
            React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: flat ? "#000" : "#534AB7" } }, ability.name),
            ...tags.map((tag) =>
              React.createElement(
                "span",
                {
                  key: tag,
                  style: flat ? {
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#000",
                    background: "transparent",
                    border: "1px solid #ccc",
                    borderRadius: 10,
                    padding: "1px 8px",
                    lineHeight: 1.5,
                  } : {
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#534AB7",
                    background: "#EEEDFE",
                    border: "1px solid rgba(83,74,183,0.4)",
                    borderRadius: 10,
                    padding: "1px 8px",
                    lineHeight: 1.5,
                  },
                },
                ABILITY_TAG_DEFS[tag].label
              )
            )
          ),
          React.createElement("div", { style: { fontSize: 12, color: flat ? "#000" : "#555", marginTop: 3 } }, ability.upgrades[0])
        )
      );
    })
  );
}

export default CreatureAbilitySummary;
