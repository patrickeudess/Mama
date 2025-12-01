/**
 * Utilitaires pour créer des micro-graphiques sparklines
 */

// Créer un sparkline SVG pour une courbe
function createSparkline(data, width = 100, height = 30, color = '#3b82f6') {
  if (!data || data.length === 0) return '';
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  
  const points = data.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return `
    <svg width="${width}" height="${height}" style="display: block;">
      <polyline
        points="${points}"
        fill="none"
        stroke="${color}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

// Créer un graphique en barres verticales
function createBarChart(data, width = 100, height = 30, color = '#ef4444') {
  if (!data || data.length === 0) return '';
  
  const max = Math.max(...data, 1);
  const barWidth = width / data.length;
  const gap = 2;
  const actualBarWidth = barWidth - gap;
  
  const bars = data.map((value, index) => {
    const barHeight = (value / max) * height;
    const x = index * barWidth;
    const y = height - barHeight;
    return `<rect x="${x + gap/2}" y="${y}" width="${actualBarWidth}" height="${barHeight}" fill="${color}" rx="2"/>`;
  }).join('');
  
  return `
    <svg width="${width}" height="${height}" style="display: block;">
      ${bars}
    </svg>
  `;
}

// Exposer les fonctions globalement
window.createSparkline = createSparkline;
window.createBarChart = createBarChart;

