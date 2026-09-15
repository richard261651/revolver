// js/components/qr.js - Standard Valid QR Code Generator

class QRComponent {
  static renderSVG(text, size = 220) {
    const encodedUrl = encodeURIComponent(text);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&color=ffb703&bgcolor=0d0e12&margin=2`;

    return `
      <img src="${qrApiUrl}" width="${size}" height="${size}" 
           style="border-radius:12px; border: 2px solid var(--accent-gold); box-shadow: 0 0 20px rgba(255, 183, 3, 0.4); display: block;" 
           alt="Escanea este Código QR para unirte" />
    `;
  }
}

window.QRComponent = QRComponent;
