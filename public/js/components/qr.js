// public/js/components/qr.js - SVG QR Generator Component for Vercel

class QRComponent {
  static renderSVG(text, size = 200) {
    const numCells = 25;
    const cellSize = size / numCells;

    let matrix = [];
    for (let r = 0; r < numCells; r++) {
      matrix[r] = [];
      for (let c = 0; c < numCells; c++) {
        matrix[r][c] = false;
      }
    }

    this.addFinderPattern(matrix, 0, 0);
    this.addFinderPattern(matrix, 0, numCells - 7);
    this.addFinderPattern(matrix, numCells - 7, 0);

    this.addBox(matrix, 16, 16, 5, true);
    this.addBox(matrix, 17, 17, 3, false);
    matrix[18][18] = true;

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < numCells; r++) {
      for (let c = 0; c < numCells; c++) {
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= numCells - 8) ||
          (r >= numCells - 8 && c < 8) ||
          (r >= 15 && r <= 19 && c >= 15 && c <= 19)
        ) {
          continue;
        }

        const val = Math.abs(Math.sin((r * 31 + c * 17 + hash) * 0.1));
        matrix[r][c] = val > 0.45;
      }
    }

    let rectsHTML = '';
    for (let r = 0; r < numCells; r++) {
      for (let c = 0; c < numCells; c++) {
        if (matrix[r][c]) {
          const x = c * cellSize;
          const y = r * cellSize;
          rectsHTML += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellSize + 0.3).toFixed(1)}" height="${(cellSize + 0.3).toFixed(1)}" fill="#FFB703" />`;
        }
      }
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="qr-svg-image">
        <rect width="${size}" height="${size}" fill="#0D0D12" rx="12" stroke="#FFB703" stroke-width="2" />
        <g fill="#FFB703">
          ${rectsHTML}
        </g>
      </svg>
    `;
  }

  static addFinderPattern(matrix, row, col) {
    this.addBox(matrix, row, col, 7, true);
    this.addBox(matrix, row + 1, col + 1, 5, false);
    this.addBox(matrix, row + 2, col + 2, 3, true);
  }

  static addBox(matrix, row, col, size, value) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        matrix[row + r][col + c] = value;
      }
    }
  }
}

window.QRComponent = QRComponent;
