// Hand-tuned gradients for each board color
const GRADIENT_MAP = {
  '#0079BF': 'linear-gradient(135deg, #0093E9 0%, #004D7A 100%)',
  '#D29034': 'linear-gradient(135deg, #E8A838 0%, #8B5E2A 100%)',
  '#519839': 'linear-gradient(135deg, #5DB346 0%, #2E6B23 100%)',
  '#B04632': 'linear-gradient(135deg, #C4503A 0%, #6E2A1E 100%)',
  '#89609E': 'linear-gradient(135deg, #9B72B0 0%, #553668 100%)',
  '#CD5A91': 'linear-gradient(135deg, #E06AA0 0%, #7A3356 100%)',
  '#00AECC': 'linear-gradient(135deg, #00C9DB 0%, #006E7F 100%)',
  '#838C91': 'linear-gradient(135deg, #96A0A6 0%, #4D5B63 100%)',
};

export function getBoardGradient(hex) {
  if (!hex) return GRADIENT_MAP['#0079BF'];
  const upper = hex.toUpperCase();
  if (GRADIENT_MAP[upper]) return GRADIENT_MAP[upper];

  // Fallback for custom colors: darken by ~40%
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.max(0, Math.round(r * 0.55));
  const dg = Math.max(0, Math.round(g * 0.55));
  const db = Math.max(0, Math.round(b * 0.55));
  return `linear-gradient(135deg, ${hex} 0%, rgb(${dr}, ${dg}, ${db}) 100%)`;
}
