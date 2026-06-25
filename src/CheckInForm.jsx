import { useState, useEffect } from "react";
import HalogenLogo from "./HalogenLogo";
import { now } from "./utils";

export default function PatrolForm({ setPage, locationId, locations = [], addReport, submitted, setSubmitted }) {
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [error, setError] = useState("");
  const [gps, setGps] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("requesting");

  const location = locations.find(l => l.id === locationId) || locations[0];

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy),
        });
        setGpsStatus("granted");
      },
      () => {
        setGpsStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!rank) { setError("Please select your rank."); return; }
    if (!location) { setError("No valid location selected."); return; }
    if (gpsStatus === "requesting") { setError("Waiting for GPS location. Please wait..."); return; }
    setError("");
    addReport({
      locationId: location.id,
      locationName: location.name,
      name: name.trim(),
      rank,
      timestamp: now(),
      status: "On Duty",
      gpsLat: gps?.lat || null,
      gpsLng: gps?.lng || null,
      gpsAccuracy: gps?.accuracy || null,
    });
  };

  const handleResetAndHome = () => {
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
        <p style={{ fontSize: 12, color: "#7a8099", marginTop: 4 }}>Time: {now()}</p>
        {gps && (
          <p style={{ fontSize: 12, color: "#7a8099", marginTop: 4 }}>
            📍 GPS: {gps.lat}, {gps.lng} (±{gps.accuracy}m)
          </p>
        )}
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

        {/* GPS Status Banner */}
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, textAlign: "center", fontSize: 12,
          background: gpsStatus === "granted" ? "rgba(0,232,122,0.08)" : gpsStatus === "denied" ? "rgba(255,107,107,0.08)" : "rgba(240,165,0,0.08)",
          border: `1px solid ${gpsStatus === "granted" ? "rgba(0,232,122,0.3)" : gpsStatus === "denied" ? "rgba(255,107,107,0.3)" : "rgba(240,165,0,0.3)"}`,
          color: gpsStatus === "granted" ? "#00e87a" : gpsStatus === "denied" ? "#ff6b6b" : "#f0a500"
        }}>
          {gpsStatus === "requesting" && "📡 Requesting your GPS location..."}
          {gpsStatus === "granted" && `✅ GPS locked: ${gps?.lat}, ${gps?.lng} (±${gps?.accuracy}m)`}
          {gpsStatus === "denied" && "⚠️ Location denied — check-in will proceed without GPS"}
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>FULL NAME *</label>
            <input placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>RANK *</label>
            <select value={rank} onChange={e => setRank(e.target.value)}>
              <option value="">-- Select your rank --</option>
              <option value="TSL">TSL – Team Security Leader</option>
              <option value="TSS">TSS – Territory Security Supervisor</option>
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
