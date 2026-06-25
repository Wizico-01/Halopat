import { useState, useEffect, useRef, useMemo } from "react";
import HalogenLogo from "./HalogenLogo";

export default function ControlRoom({ setPage, reports = [], locations = [] }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [filter, setFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("ALL");
  const [locFilter, setLocFilter] = useState("ALL");
  const prevCount = useRef(reports.length);
  const [newAlert, setNewAlert] = useState(false);

  useEffect(() => {
    if (reports.length > prevCount.current) {
      setNewAlert(true);
      const timer = setTimeout(() => setNewAlert(false), 4000);
      return () => clearTimeout(timer); // Clean up timeout to prevent memory leaks
    }
    prevCount.current = reports.length;
  }, [reports]);

  // Combined filters into a single useMemo loop for ultimate performance
  const filtered = useMemo(() => {
    const searchLower = filter.toLowerCase();
    
    return reports.filter(r => {
      // 1. Date Filter
      const ts = r.created_at ? r.created_at.slice(0, 10) : (r.timestamp || "").slice(0, 10);
      if (ts !== selectedDate) return false;

      // 2. Text Search Filter
      const nameMatch = r.name?.toLowerCase().includes(searchLower);
      const locMatch = (r.location_name || r.locationName)?.toLowerCase().includes(searchLower);
      if (filter && !nameMatch && !locMatch) return false;

      // 3. Rank Filter
      if (rankFilter !== "ALL" && r.rank !== rankFilter) return false;

      // 4. Location Filter
      const currentLocId = r.location_id || r.locationId;
      if (locFilter !== "ALL" && String(currentLocId) !== String(locFilter)) return false;

      return true;
    });
  }, [reports, selectedDate, filter, rankFilter, locFilter]);

  // Derive stats directly from filtered array without re-looping entirely
  const stats = useMemo(() => {
    let tslCount = 0;
    let tssCount = 0;
    const activeLocs = new Set();

    filtered.forEach(r => {
      if (r.rank === "TSL") tslCount++;
      if (r.rank === "TSS") tssCount++;
      const locId = r.location_id || r.locationId;
      if (locId) activeLocs.add(locId);
    });

    return {
      total: filtered.length,
      tsl: tslCount,
      tss: tssCount,
      locationsCount: activeLocs.size
    };
  }, [filtered]);

  const exportDaily = () => {
    const headers = ["Report ID", "Officer Name", "Rank", "Location", "GPS Lat", "GPS Lng", "Timestamp", "Status"];
    const rows = filtered.map(r => [
      r.id,
      r.name,
      r.rank,
      r.location_name || r.locationName,
      r.gps_lat || "",
      r.gps_lng || "",
      r.created_at ? new Date(r.created_at).toLocaleString() : r.timestamp,
      r.status || "On Duty",
    ]);
    
    // Safely escape commas for CSV safety
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `HALOPAT_Report_${selectedDate}.csv`;
    a.click();
  };

  const stepDay = (direction) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + direction);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

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

      <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>

        {newAlert && (
          <div className="fade-in" style={{ background: "rgba(240,165,0,0.12)", border: "1px solid #f0a500", borderRadius: 8, padding: "12px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span className="pulse" style={{ color: "#f0a500", fontSize: 20 }}>🔔</span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: 1 }}>PATROL RECEIVED</span>
          </div>
        )}

        {/* ── Date Selector ── */}
        <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1.5, marginBottom: 6 }}>VIEWING REPORT FOR</div>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ width: 180, padding: "10px 14px", cursor: "pointer" }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn-gold" onClick={() => setSelectedDate(todayStr)}>📅 TODAY</button>
            <button className="btn-outline" onClick={() => stepDay(-1)}>← PREV DAY</button>
            <button className="btn-outline" onClick={() => stepDay(1)}>NEXT DAY →</button>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1 }}>SELECTED DATE</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, color: "#f0a500", fontWeight: 700 }}>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* ── Stats for selected date ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "TOTAL PATROL", value: stats.total, color: "#f0a500" },
            { label: "TSL Officers", value: stats.tsl, color: "#f0a500" },
            { label: "TSS Officers", value: stats.tss, color: "#7ec8ff" },
            { label: "Locations Active", value: stats.locationsCount, color: "#7ec8ff" },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 40, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#7a8099", letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters + Export ── */}
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
          <button className="btn-gold" onClick={exportDaily}>
            ⬇ EXPORT {selectedDate} REPORT
          </button>
        </div>

        {/* ── Table ── */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(240,165,0,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: 2 }}>
              ATTENDANCE <span className="gold">RECORDS</span>
              <span style={{ fontSize: 12, color: "#7a8099", fontWeight: 400, marginLeft: 12 }}>
                {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
              </span>
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
                  <th>GPS COORDINATES</th>
                  <th>TIMESTAMP</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#7a8099", padding: 48 }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: 1 }}>
                        No patrols recorded for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((r, index) => (
                  <tr key={r.id || index}>
                    <td style={{ color: "#f0a500", fontFamily: "'Rajdhani', sans-serif", fontSize: 12 }}>{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td><span className={r.rank === "TSL" ? "badge-tsl" : "badge-tss"}>{r.rank}</span></td>
                    <td style={{ color: "#b0b8d0" }}>{r.location_name || r.locationName}</td>
                    <td style={{ fontSize: 11, fontFamily: "monospace" }}>
                      {r.gps_lat && r.gps_lng
                        ? <a href={`https://www.google.com/maps/search/?api=1&query=${r.gps_lat},${r.gps_lng}`} target="_blank" rel="noreferrer"
                            style={{ color: "#f0a500", textDecoration: "none" }}>
                            📍 {r.gps_lat}, {r.gps_lng}
                          </a>
                        : <span style={{ color: "#444" }}>No GPS</span>
                      }
                    </td>
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
