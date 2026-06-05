export default function HalogenLogo({ size = 60 }) {
  const rays = 36;
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: rays }).map((_, i) => {
        const angle = (Math.PI / (rays - 1)) * i - Math.PI;
        const cx = 100, cy = 95, r1 = 42, r2 = 95;
        const x1 = cx + r1 * Math.cos(angle);
        const y1 = cy + r1 * Math.sin(angle);
        const x2 = cx + r2 * Math.cos(angle);
        const y2 = cy + r2 * Math.sin(angle);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#f0a500" strokeWidth="1.4" opacity={0.85 - Math.abs(i - rays / 2) * 0.018} />
        );
      })}
      <circle cx="100" cy="95" r="38" fill="#0a1128" />
      <circle cx="100" cy="95" r="38" stroke="#f0a500" strokeWidth="1.5" fill="none" />
    </svg>
  );
}