import React from "react";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.22)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  box: {
    backgroundColor: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  spinner: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "3px solid rgba(0,0,0,0.16)",
    borderTopColor: "#007bff",
    animation: "spin 0.8s linear infinite",
  },
  text: {
    fontSize: "14px",
    fontWeight: 500,
  },
};

// Inject a simple keyframes animation using a style tag once
const injectSpinKeyframes = () => {
  if (document.getElementById("loader-spin-style")) return;
  const style = document.createElement("style");
  style.id = "loader-spin-style";
  style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};

function Loader({ text = "Processing document…" }) {
  if (typeof document !== "undefined") {
    injectSpinKeyframes();
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.spinner} />
        <span style={styles.text}>{text}</span>
      </div>
    </div>
  );
}

export default Loader;
