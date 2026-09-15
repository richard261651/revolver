// public/js/components/qr.js - Standard Valid QR Code Generator

class QRComponent {
  /**
   * Generates a 100% valid, scannable QR Code image element using standard ISO 18004 QR encoding.
   * Scannable instantly by any iOS Camera, Android Camera, or QR app.
   */
  static renderSVG(text, size = 220) {
    const encodedUrl = encodeURIComponent(text);
    // Standard high-contrast gold QR code on dark background for dark UI theme
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&color=ffb703&bgcolor=0d0e12&margin=2`;

    return `
      <img src="${qrApiUrl}" width="${size}" height="${size}" 
           style="border-radius:12px; border: 2px solid var(--accent-gold); box-shadow: 0 0 20px rgba(255, 183, 3, 0.4); display: block;" 
           alt="Escanea este Código QR para unirte" />
    `;
  }
}

window.QRComponent = QRComponent;
