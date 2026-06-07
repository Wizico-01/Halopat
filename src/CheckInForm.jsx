import { useState } from "react";
import HalogenLogo from "./HalogenLogo";
import { now } from "./utils"; // Fixed import name to match your utils file helper

export default function PatrolForm({ setPage, locationId, locations = [], addReport, submitted, setSubmitted }) {
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [error, setError] = useState("");

  const location = locations.find(l => l.id === locationId) || locations[0];

  const handleSubmit = () => {
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!rank) { setError("Please select your rank."); return; }
    if (!location) { setError("No valid location selected."); return; }
    setError("");
    
    addReport({
      locationId: location.id,
      locationName: location.name,
      name: name.trim(),
      rank,
      timestamp: nowStr(), // Updated to nowStr()
      status: "On Duty",
    });
  };

  const handleResetAndHome = () => {
    // Safely clear form memory and bounce back to operational dashboard
    setName("");
    setRank("");
    setSubmitted(false);
    setPage("home");
  };

  if (submitted) {
    return (
      <div className="fade-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#0a1128" }}>
        <HalogenLogo size={80} />
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 64, color: "#00e87a", marginTop: 16 }}>✓</div>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, letterSpacing: 3, marginTop: 8 }}>
          REPORT <span className="gold">SUBMISSION</span> SUCCESSFUL
        </h2>
        <p style={{ color: "#7a8099", marginTop: 8, textAlign: "center" }}>
          Your attendance has been recorded at <strong style={{ color: "#f0a500" }}>{location?.name}</strong>
        </p>
        <p style={{ fontSize: 12, color: "#7a8099", marginTop: 4 }}>Time: {nowStr()}</p>
        
        {/* Wired up action buttons so users can exit the screen cleanly */}
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn-gold" style={{ padding: "12px 32px" }} onClick={handleResetAndHome}>
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(160deg, #0a1128 0%, #0d1a3a 100%)" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, background: "radial-gradient(circle, rgba(240,165,0,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <HalogenLogo size={70} />
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: 5, marginTop: 12 }}>
            HALO<span className="gold">PAT</span>
          </h1>
          <p style={{ fontSize: 11, color: "#7a8099", letterSpacing: 2, marginTop: 4 }}>PATROL FORM</p>
        </div>

        {location ? (
          <div style={{ background: "rgba(240,165,0,0.08)", border: "1px solid rgba(240,165,0,0.25)", borderRadius: 8, padding: "12px 16px", marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1, marginBottom: 4 }}>LOCATION</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#f0a500" }}>{location.name}</div>
            <div style={{ fontSize: 12, color: "#7a8099", marginTop: 2 }}>{location.address}</div>
          </div>
        ) : null}

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>FULL NAME *</label>
            <input placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>RANK *</label>
            <select value={rank} onChange={e => setRank(e.target.value)}>
              <option value="">-- Select your rank --</option>
              <option value="TSL">TSL – Team Supervisor/Leader</option>
              <option value="TSS">TSS – Team Security Staff</option>
            </select>
          </div>
          {error && (
            <div style={{ color: "#ff6b6b", fontSize: 13, padding: "8px 12px", background: "rgba(255,107,107,0.1)", borderRadius: 6, border: "1px solid rgba(255,107,107,0.3)" }}>
              {error}
            </div>
          )}
          <button className="btn-gold" style={{ marginTop: 6 }} onClick={handleSubmit}>SUBMIT ATTENDANCE</button>
          <button className="btn-outline" style={{ border: "none", color: "#7a8099" }} onClick={() => setPage("home")}>BACK TO HOME</button>
        </div>
      </div>
    </div>
  );
}