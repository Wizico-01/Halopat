import { useState, useEffect, useRef } from "react";
import HalogenLogo from "./HalogenLogo";
import { exportExcel } from "./utils";

export default function ControlRoom({ setPage, reports = [], locations = [] }) {
  const [filter, setFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("ALL");
  const [locFilter, setLocFilter] = useState("ALL");
  const prevCount = useRef(reports.length);
  const [newAlert, setNewAlert] = useState(false);

  useEffect(() => {
    if (reports.length > prevCount.current) {
      setNewAlert(true);
      setTimeout(() => setNewAlert(false), 4000);
    }
    prevCount.current = reports.length;
  }, [reports]);

  const filtered = reports.filter(r => {
    const nameMatch = r.name?.toLowerCase().includes(filter.toLowerCase());
    const locMatch = r.location_name?.toLowerCase().includes(filter.toLowerCase()) || r.locationName?.toLowerCase().includes(filter.toLowerCase());
    const matchText = nameMatch || locMatch;
    const matchRank = rankFilter === "ALL" || r.rank === rankFilter;
    const matchLoc = locFilter === "ALL" || r.location_id === locFilter || r.locationId === locFilter;
    return matchText && matchRank && matchLoc;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReports = reports.filter(r => (r.created_at || r.timestamp || "").startsWith(todayStr));

  return (
    <div className="fade-in">
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid rgba(240,165,0,0.15)", background: "rgba(10,17,40,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <HalogenLogo size={44} />
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 4, color: "#f0a500" }}>HALOPAT</div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#7a8099" }}>CONTROL ROOM</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="nav-btn" onClick={() => setPage("home")}>HOME</button>
          <button className="nav-btn active">CONTROL ROOM</button>
        </div>
      </nav>

      <div style={{ padding: "32px 32px", maxWidth: 1100, margin: "0 auto" }}>
        {newAlert && (
          <div className="fade-in" style={{ background: "rgba(240,165,0,0.12)", border: "1px solid #f0a500", borderRadius: 8, padding: "12px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span className="pulse" style={{ color: "#f0a500", fontSize: 20 }}>🔔</span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: 1 }}>NEW CHECK-IN RECEIVED</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "TOTAL PATROL", value: reports.length, color: "#f0a500" },
            { label: "Today's Patrol", value: todayReports.length, color: "#7ec8ff" },
            { label: "TSL Officers", value: reports.filter(r => r.rank === "TSL").length, color: "#f0a500" },
            { label: "TSS Officers", value: reports.filter(r => r.rank === "TSS").length, color: "#7ec8ff" },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 40, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input placeholder="Search name or location..." style={{ width: 220 }} value={filter} onChange={e => setFilter(e.target.value)} />
            <select style={{ width: 120 }} value={rankFilter} onChange={e => setRankFilter(e.target.value)}>
              <option value="ALL">All Ranks</option>
              <option value="TSL">TSL</option>
              <option value="TSS">TSS</option>
            </select>
            <select style={{ width: 180 }} value={locFilter} onChange={e => setLocFilter(e.target.value)}>
              <option value="ALL">All Locations</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <button className="btn-gold" onClick={() => exportExcel(filtered)}>⬇ EXPORT TO EXCEL</button>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(240,165,0,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: 2 }}>
              ATTENDANCE <span className="gold">RECORDS</span>
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e87a", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1 }}>LIVE</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>REPORT ID</th>
                  <th>OFFICER NAME</th>
                  <th>RANK</th>
                  <th>LOCATION</th>
                  <th>TIMESTAMP</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#7a8099", padding: 32 }}>No records found</td></tr>
                ) : filtered.map((r, index) => (
                  <tr key={r.id || index}>
                    <td style={{ color: "#f0a500", fontFamily: "'Rajdhani', sans-serif", fontSize: 12 }}>{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td><span className={r.rank === "TSL" ? "badge-tsl" : "badge-tss"}>{r.rank}</span></td>
                    <td style={{ color: "#b0b8d0" }}>{r.location_name || r.locationName}</td>
                    <td style={{ color: "#7a8099", fontSize: 12, fontFamily: "monospace" }}>
                      {r.created_at ? new Date(r.created_at).toLocaleString() : r.timestamp}
                    </td>
                    <td><span style={{ color: "#00e87a", fontSize: 12, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>● {r.status || "On Duty"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}