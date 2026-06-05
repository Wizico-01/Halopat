import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import HomePage from "./HomePage";
import ControlRoom from "./ControlRoom";
import CheckInForm from "./CheckInForm";

// Smart URL scanner that checks both query strings and path segments for the location ID
const getInitialLocationId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let loc = urlParams.get("loc");
  
  // Fallback: If query parameter is empty, parse the full URL text directly
  if (!loc) {
    const match = window.location.href.match(/[?&]loc=([^&#]*)/);
    loc = match ? match[1] : null;
  }
  return loc;
};

const _initialLocId = getInitialLocationId();

export default function App() {
  const [page, setPage] = useState(_initialLocId ? "form" : "home");
  const [formLocationId, setFormLocationId] = useState(_initialLocId);
  const [locations, setLocations] = useState([]);
  const [reports, setReports] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from("locations").select("*").order("name", { ascending: true });
      if (data) setLocations(data);
    };
    const fetchReports = async () => {
      const { data } = await supabase.from("reports").select("*").order("id", { ascending: false });
      if (data) setReports(data);
    };
    fetchLocations();
    fetchReports();
  }, []);

  useEffect(() => {
    const reportSubscription = supabase
      .channel("realtime-reports")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, (payload) => {
        setReports((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(reportSubscription); };
  }, []);

  const addLocation = async (loc) => {
    // 1. Instantly update the local display array so the QR code appears right away
    setLocations((prev) => [...prev, loc]);

    // 2. Safely sync it with your remote Supabase infrastructure
    const { error } = await supabase
      .from("locations")
      .insert([{ id: loc.id, name: loc.name, address: loc.address }]);

    if (error) {
      console.error("Supabase Database Sync Error:", error.message);
      alert(`Database Sync Warning: ${error.message}`);
    }
  };

  const addReport = async (r) => {
    const { error } = await supabase.from("reports").insert([{
      location_id: r.locationId,
      location_name: r.locationName,
      name: r.name,
      rank: r.rank,
      status: "On Duty",
    }]);
    if (!error) {
      setSubmitted(true);
    } else {
      console.error("Error saving report:", error.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a1128", fontFamily: "'Segoe UI', sans-serif", color: "#e8e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Exo+2:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a1128; }
        ::-webkit-scrollbar-thumb { background: #f0a500; border-radius: 3px; }
        .gold { color: #f0a500; }
        .btn-gold { background: linear-gradient(135deg, #f0a500, #d48b00); color: #0a1128; border: none; padding: 10px 22px; border-radius: 6px; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
        .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(240,165,0,0.4); }
        .btn-outline { background: transparent; color: #f0a500; border: 1.5px solid #f0a500; padding: 10px 22px; border-radius: 6px; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
        .btn-outline:hover { background: rgba(240,165,0,0.1); transform: translateY(-1px); }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(240,165,0,0.18); border-radius: 12px; padding: 24px; }
        .nav-btn { background: transparent; border: none; color: #aaa; font-family: 'Rajdhani', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 1.5px; cursor: pointer; padding: 8px 16px; border-radius: 6px; transition: all 0.2s; }
        .nav-btn:hover, .nav-btn.active { color: #f0a500; background: rgba(240,165,0,0.08); }
        input, select, textarea { background: rgba(255,255,255,0.06); border: 1px solid rgba(240,165,0,0.25); border-radius: 6px; color: #e8e8f0; padding: 10px 14px; font-family: 'Exo 2', sans-serif; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: #f0a500; }
        select option { background: #0d1a3a; color: #e8e8f0; }
        table { width: 100%; border-collapse: collapse; }
        th { color: #f0a500; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 1.5px; text-align: left; padding: 12px 14px; border-bottom: 1px solid rgba(240,165,0,0.2); }
        td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        tr:hover td { background: rgba(240,165,0,0.04); }
        .badge-tsl { background: rgba(240,165,0,0.2); color: #f0a500; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
        .badge-tss { background: rgba(100,180,255,0.15); color: #7ec8ff; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {page === "home" && <HomePage setPage={setPage} locations={locations} setFormLocationId={setFormLocationId} addLocation={addLocation} reports={reports} />}
      {page === "control" && <ControlRoom setPage={setPage} reports={reports} locations={locations} />}
      {page === "form" && <CheckInForm setPage={setPage} locationId={formLocationId} locations={locations} addReport={addReport} submitted={submitted} setSubmitted={setSubmitted} />}
    </div>
  );
}