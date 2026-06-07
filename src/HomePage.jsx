import { useState } from "react";
import HalogenLogo from "./HalogenLogo";
import { generateId, qrUrl } from "./utils";

export default function HomePage({ setPage, locations = [], setFormLocationId, addLocation, deleteLocation, reports = [] }) {
  const [showQRPanel, setShowQRPanel] = useState(true); // open by default
  const [selectedQR, setSelectedQR] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: "", address: "" });
  const [filter, setFilter] = useState("");

  const filtered = locations.filter(l =>
    l.name?.toLowerCase().includes(filter.toLowerCase()) ||
    l.address?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAdd = () => {
    if (!newLoc.name.trim()) return;
    const loc = { id: generateId(), name: newLoc.name.trim(), address: newLoc.address.trim() };
    addLocation(loc);
    setNewLoc({ name: "", address: "" });
    setShowAddModal(false);
    setShowQRPanel(true);
  };

  // Always use the live GitHub Pages URL for QR codes
  const formUrl = (id) => `https://wizico-01.github.io/Halopat/?loc=${id}`;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="fade-in">
      {/* ── Top Nav ── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid rgba(240,165,0,0.15)", background: "rgba(10,17,40,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <HalogenLogo size={44} />
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 4, color: "#f0a500" }}>HALOPAT</div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#7a8099", marginTop: -2 }}>HALOGEN GROUP · PATROL SYSTEM</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="nav-btn active" onClick={() => setPage("home")}>HOME</button>
          <button className="nav-btn" onClick={() => setPage("control")}>CONTROL ROOM</button>
          <button className="nav-btn" onClick={() => { setFormLocationId(locations[0]?.id || null); setPage("form"); }}>PATROL FORM</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "60px 20px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(240,165,0,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <HalogenLogo size={90} />
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 48, fontWeight: 700, letterSpacing: 6, marginTop: 16, marginBottom: 8 }}>
          HALO<span className="gold">PAT</span>
        </h1>
        <p style={{ color: "#7a8099", fontSize: 14, letterSpacing: 2, marginBottom: 40 }}>PATROL ATTENDANCE TRACKING SYSTEM</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-gold" style={{ fontSize: 16, padding: "14px 36px" }} onClick={() => setShowQRPanel(!showQRPanel)}>MANAGE QR CODES</button>
          <button className="btn-outline" style={{ fontSize: 16, padding: "14px 36px" }} onClick={() => { setFormLocationId(locations[0]?.id || null); setPage("form"); }}>VIEW PATROL FORM</button>
          <button className="btn-outline" style={{ fontSize: 16, padding: "14px 36px" }} onClick={() => setPage("control")}>CONTROL ROOM</button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 700, margin: "0 auto 40px", padding: "0 24px" }}>
        {[
          { label: "Active Locations", value: locations.length, },
          { label: "TODAY'S PATROL", value: reports.filter(r => (r.created_at || "").startsWith(todayStr)).length, },
          { label: "Total Reports", value: reports.length,},
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 36, fontWeight: 700, color: "#f0a500" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* ── QR Code Panel ── */}
      {showQRPanel && (
        <div style={{ maxWidth: 960, margin: "0 auto 60px", padding: "0 24px" }} className="fade-in">
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, letterSpacing: 2 }}>
                <span className="gold">QR CODE</span> MANAGER
              </h2>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="Search locations..." style={{ width: 200, padding: "8px 12px" }} value={filter} onChange={e => setFilter(e.target.value)} />
                <button className="btn-gold" onClick={() => setShowAddModal(true)}>+ ADD LOCATION</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {filtered.map(loc => (
                <div key={loc.id}
                  style={{ background: "rgba(240,165,0,0.05)", border: "1px solid rgba(240,165,0,0.2)", borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer", transition: "all 0.2s", position: "relative" }}
                  onClick={() => setSelectedQR(selectedQR?.id === loc.id ? null : loc)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#f0a500"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(240,165,0,0.2)"}
                >
                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${loc.name}"?`)) deleteLocation(loc.id); }}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.4)", borderRadius: 4, color: "#ff6b6b", fontSize: 11, padding: "2px 7px", cursor: "pointer" }}>
                    ✕
                  </button>

                  <div style={{ fontSize: 11, color: "#f0a500", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1, marginBottom: 6 }}>{loc.id}</div>
                  <img src={qrUrl(formUrl(loc.id), 140)} alt="QR" style={{ width: 140, height: 140, borderRadius: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, color: "#e8e8f0" }}>{loc.name}</div>
                  <div style={{ fontSize: 11, color: "#7a8099", marginTop: 4 }}>{loc.address}</div>
                  <div style={{ marginTop: 12, display: "flex", gap: 6, justifyContent: "center" }}>
                    <a href={qrUrl(formUrl(loc.id), 300)} download={`${loc.id}_QR.png`} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: "#f0a500", textDecoration: "none", border: "1px solid rgba(240,165,0,0.3)", borderRadius: 4, padding: "4px 10px" }}
                      onClick={e => e.stopPropagation()}>
                      ⬇ Download
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {selectedQR && (
              <div className="fade-in" style={{ marginTop: 24, padding: 24, background: "rgba(10,17,40,0.8)", borderRadius: 12, border: "1px solid #f0a500", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                <img src={qrUrl(formUrl(selectedQR.id), 220)} alt="QR Large" style={{ borderRadius: 12, width: 220, height: 220 }} />
                <div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 700, color: "#f0a500", letterSpacing: 2 }}>{selectedQR.name}</div>
                  <div style={{ color: "#7a8099", marginTop: 4, marginBottom: 12 }}>{selectedQR.address}</div>
                  <div style={{ fontSize: 12, color: "#7a8099", marginBottom: 4 }}>Location ID: <span style={{ color: "#f0a500" }}>{selectedQR.id}</span></div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                    <a href={qrUrl(formUrl(selectedQR.id), 400)} download={`HALOPAT_${selectedQR.id}.png`} target="_blank" rel="noreferrer">
                      <button className="btn-gold">⬇ DOWNLOAD QR CODE</button>
                    </a>
                    <button className="btn-outline" onClick={() => { setFormLocationId(selectedQR.id); setPage("form"); }}>PREVIEW FORM</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add Location Modal ── */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card fade-in" style={{ width: 420, maxWidth: "90vw" }}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 20 }}>
              <span className="gold">ADD</span> NEW LOCATION
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1, display: "block", marginBottom: 6 }}>LOCATION NAME *</label>
                <input placeholder="e.g. Apapa Terminal Gate" value={newLoc.name} onChange={e => setNewLoc({ ...newLoc, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1, display: "block", marginBottom: 6 }}>ADDRESS</label>
                <input placeholder="e.g. Marine Road, Apapa, Lagos" value={newLoc.address} onChange={e => setNewLoc({ ...newLoc, address: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button className="btn-gold" style={{ flex: 1 }} onClick={handleAdd}>GENERATE QR CODE</button>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}