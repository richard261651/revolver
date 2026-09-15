// js/components/tambor.js - Tambor de 3 Recámaras Tácticas

class TamborRevolver {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onChamberClick = options.onChamberClick || null;
    this.currentRotation = 0;
  }

  render(estadoBalas) {
    if (!this.container) return;

    const width = 320;
    const height = 320;
    const centerX = 160;
    const centerY = 160;
    const chamberDistance = 90;
    const chamberRadius = 34;

    let chambersSVG = '';
    const totalChambers = estadoBalas.length; // 3 bullets

    estadoBalas.forEach((b, index) => {
      // Angle for 3 chambers: 0°, 120°, 240° (starting top at -90 deg)
      const angleDeg = index * (360 / totalChambers) - 90;
      const angleRad = (angleDeg * Math.PI) / 180;

      const cx = centerX + chamberDistance * Math.cos(angleRad);
      const cy = centerY + chamberDistance * Math.sin(angleRad);

      let strokeColor = '#333346';
      let fillColor = '#161622';
      let textColor = '#8888a0';
      let glowFilter = '';
      let iconInner = `<text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="${textColor}" font-size="18" font-weight="800" font-family="'Cinzel', sans-serif">${b.id}</text>`;
      let statusBadge = '';

      if (b.estado === 'cargada') {
        strokeColor = '#FB8500';
        fillColor = 'url(#goldGlowGradient)';
        glowFilter = 'filter="url(#goldGlowFilter)"';
        iconInner = `
          <circle cx="${cx}" cy="${cy}" r="${chamberRadius - 4}" fill="#FFB703" />
          <path d="M ${cx - 7} ${cy + 9} L ${cx - 7} ${cy - 3} L ${cx} ${cy - 12} L ${cx + 7} ${cy - 3} L ${cx + 7} ${cy + 9} Z" fill="#0D0D12" />
          <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#FFB703" font-size="12" font-weight="900">${b.id}</text>
        `;
      } else if (b.estado === 'disparada') {
        strokeColor = '#D62828';
        fillColor = 'url(#crimsonGradient)';
        glowFilter = 'filter="url(#crimsonGlowFilter)"';
        iconInner = `
          <circle cx="${cx}" cy="${cy}" r="${chamberRadius - 4}" fill="#400A0D" stroke="#D62828" stroke-width="2" />
          <path d="M ${cx-8} ${cy-8} L ${cx+8} ${cy+8} M ${cx+8} ${cy-8} L ${cx-8} ${cy+8}" stroke="#D62828" stroke-width="3" stroke-linecap="round" />
        `;
        statusBadge = `<circle cx="${cx + 20}" cy="${cy - 20}" r="9" fill="#D62828" /><text x="${cx + 20}" y="${cy - 17}" text-anchor="middle" fill="#FFF" font-size="11" font-weight="bold">✕</text>`;
      } else if (b.estado === 'contenida') {
        strokeColor = '#2A9D8F';
        fillColor = 'url(#emeraldGradient)';
        glowFilter = 'filter="url(#emeraldGlowFilter)"';
        iconInner = `
          <circle cx="${cx}" cy="${cy}" r="${chamberRadius - 4}" fill="#0A332C" stroke="#2A9D8F" stroke-width="2" />
          <path d="M ${cx-7} ${cy+1} L ${cx-2} ${cy+7} L ${cx+8} ${cy-6}" fill="none" stroke="#2A9D8F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        `;
        statusBadge = `<circle cx="${cx + 20}" cy="${cy - 20}" r="9" fill="#2A9D8F" /><text x="${cx + 20}" y="${cy - 17}" text-anchor="middle" fill="#FFF" font-size="11" font-weight="bold">✓</text>`;
      }

      const activeRing = b.activo ? `
        <circle cx="${cx}" cy="${cy}" r="${chamberRadius + 6}" fill="none" stroke="#FFB703" stroke-width="3" stroke-dasharray="5,3" class="pulse-active-chamber" />
      ` : '';

      chambersSVG += `
        <g class="chamber-group ${b.activo ? 'chamber-active' : ''}" data-bullet-id="${b.id}" style="cursor: pointer;">
          ${activeRing}
          <circle cx="${cx}" cy="${cy}" r="${chamberRadius}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="3" ${glowFilter} />
          ${iconInner}
          ${statusBadge}
        </g>
      `;
    });

    const svgHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="tambor-svg" style="transform: rotate(${this.currentRotation}deg); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);">
        <defs>
          <radialGradient id="goldGlowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFE57F" />
            <stop offset="50%" stop-color="#FFB703" />
            <stop offset="100%" stop-color="#FB8500" />
          </radialGradient>
          <radialGradient id="crimsonGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#7A1818" />
            <stop offset="100%" stop-color="#2D0808" />
          </radialGradient>
          <radialGradient id="emeraldGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#2A9D8F" />
            <stop offset="100%" stop-color="#0B3C36" />
          </radialGradient>
          <radialGradient id="metalBody" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#272738" />
            <stop offset="70%" stop-color="#181824" />
            <stop offset="100%" stop-color="#0F0F17" />
          </radialGradient>
          <linearGradient id="metalRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#44445c" />
            <stop offset="50%" stop-color="#1f1f2e" />
            <stop offset="100%" stop-color="#38384d" />
          </linearGradient>
          <filter id="goldGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="crimsonGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="emeraldGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle cx="${centerX}" cy="${centerY}" r="148" fill="url(#metalRing)" stroke="#FFB703" stroke-width="1.5" stroke-opacity="0.4" />
        <circle cx="${centerX}" cy="${centerY}" r="140" fill="url(#metalBody)" stroke="#2D2D42" stroke-width="3" />

        ${this.renderFlutes(centerX, centerY)}

        <circle cx="${centerX}" cy="${centerY}" r="34" fill="#12121A" stroke="#555570" stroke-width="3" />
        <circle cx="${centerX}" cy="${centerY}" r="14" fill="#0D0D12" stroke="#FFB703" stroke-width="2" />
        <circle cx="${centerX}" cy="${centerY}" r="5" fill="#FFB703" />

        ${chambersSVG}
      </svg>
    `;

    this.container.innerHTML = svgHTML;

    const groups = this.container.querySelectorAll('.chamber-group');
    groups.forEach(g => {
      g.addEventListener('click', () => {
        const bulletId = parseInt(g.getAttribute('data-bullet-id'), 10);
        if (this.onChamberClick) {
          this.onChamberClick(bulletId);
        }
      });
    });
  }

  renderFlutes(cx, cy) {
    let flutes = '';
    for (let i = 0; i < 3; i++) {
      const angleDeg = i * 120 + 60 - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const fx = cx + 136 * Math.cos(angleRad);
      const fy = cy + 136 * Math.sin(angleRad);
      flutes += `<circle cx="${fx}" cy="${fy}" r="16" fill="#0D0D12" stroke="#252535" stroke-width="1.5" />`;
    }
    return flutes;
  }

  rotateToBullet(bulletIndex) {
    this.currentRotation = -bulletIndex * 120;
    const svgEl = this.container.querySelector('.tambor-svg');
    if (svgEl) {
      svgEl.style.transform = `rotate(${this.currentRotation}deg)`;
    }
  }
}

window.TamborRevolver = TamborRevolver;
