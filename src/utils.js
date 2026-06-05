export function generateId() {
  return "LOC" + String(Math.floor(Math.random() * 90000) + 10000);
}

export function now() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

export function exportExcel(reportsData) {
  const headers = ["Report ID", "Location ID", "Location Name", "Officer Name", "Rank", "Timestamp", "Status"];
  const rows = reportsData.map(r => [
    r.id,
    r.location_id || r.locationId,
    r.location_name || r.locationName,
    r.name,
    r.rank,
    r.created_at || r.timestamp,
    r.status
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `HALOPAT_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export const qrUrl = (text, size = 200) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=0a1128&color=f0a500&format=png`;