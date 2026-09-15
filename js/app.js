// js/app.js - Controlador Táctico para 3 Dilemas y 3 Intentos de Disparo

class OperacionAmatistaApp {
  constructor() {
    this.teamName = localStorage.getItem('amatista_team') || '';
    this.currentDilemmaIndex = 0; // 0 to 2
    this.currentShotIndex = 0; // 0 to 2
    this.viewMode = 'mobile';

    // 3 Bullets State
    this.bulletsState = [
      { id: 1, estado: 'vacia', activo: true, decisionFinal: null },
      { id: 2, estado: 'vacia', activo: false, decisionFinal: null },
      { id: 3, estado: 'vacia', activo: false, decisionFinal: null }
    ];

    const saved = localStorage.getItem('amatista_state_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
          this.bulletsState = parsed;
        }
      } catch (e) {
        console.warn("Could not restore state:", e);
      }
    }

    this.tambor = null;
  }

  init() {
    this.tambor = new TamborRevolver('tambor-container', {
      onChamberClick: (bulletId) => this.handleChamberClick(bulletId)
    });

    this.bindEvents();
    this.checkInitialScreen();
  }

  saveState() {
    localStorage.setItem('amatista_team', this.teamName);
    localStorage.setItem('amatista_state_v3', JSON.stringify(this.bulletsState));
  }

  bindEvents() {
    const teamForm = document.getElementById('team-form');
    if (teamForm) {
      teamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('team-name-input');
        if (input && input.value.trim()) {
          this.teamName = input.value.trim();
          this.saveState();
          this.updateHeaderBadge();
          this.startDilemmaPhase();
        }
      });
    }

    const btnActionHub = document.getElementById('btn-action-hub');
    if (btnActionHub) {
      btnActionHub.addEventListener('click', () => {
        this.renderShootingScreen();
      });
    }

    const btnFire = document.getElementById('btn-shoot-fire');
    if (btnFire) {
      btnFire.addEventListener('click', () => this.handleShootingDecision('disparar'));
    }

    const btnHold = document.getElementById('btn-shoot-hold');
    if (btnHold) {
      btnHold.addEventListener('click', () => this.handleShootingDecision('guardar'));
    }

    const btnRestart = document.getElementById('btn-restart-app');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        localStorage.removeItem('amatista_state_v3');
        this.bulletsState = [
          { id: 1, estado: 'vacia', activo: true, decisionFinal: null },
          { id: 2, estado: 'vacia', activo: false, decisionFinal: null },
          { id: 3, estado: 'vacia', activo: false, decisionFinal: null }
        ];
        this.currentDilemmaIndex = 0;
        this.currentShotIndex = 0;
        this.saveState();
        this.showScreen('welcome-screen');
      });
    }

    const btnToggleMode = document.getElementById('btn-toggle-mode');
    if (btnToggleMode) {
      btnToggleMode.addEventListener('click', () => this.toggleViewMode());
    }
  }

  checkInitialScreen() {
    if (this.teamName) {
      this.updateHeaderBadge();
      const allShotsDone = this.bulletsState.every(b => b.estado === 'disparada' || b.estado === 'contenida');
      if (allShotsDone) {
        this.showDebriefScreen();
      } else {
        const allLoaded = this.bulletsState.every(b => b.estado !== 'vacia');
        if (allLoaded) {
          this.showHubScreen();
        } else {
          this.startDilemmaPhase();
        }
      }
    } else {
      this.showScreen('welcome-screen');
    }
  }

  updateHeaderBadge() {
    const badge = document.getElementById('header-team-badge');
    if (badge) {
      badge.textContent = this.teamName || 'EQUIPO TÁCTICO';
    }
  }

  showScreen(screenId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- FASE 1: CARGA DE DILEMAS (3 DILEMAS SIN DECIR "ESTÁ MALA") ---
  startDilemmaPhase() {
    // Find first unselected dilemma
    const firstEmpty = this.bulletsState.findIndex(b => b.estado === 'vacia');
    this.currentDilemmaIndex = firstEmpty !== -1 ? firstEmpty : 0;
    this.renderDilemmaScreen();
  }

  renderDilemmaScreen() {
    const dilema = DILEMAS_DATA[this.currentDilemmaIndex];
    if (!dilema) return;

    const tagEl = document.getElementById('dilemma-tag');
    const titleEl = document.getElementById('dilemma-title');
    const textEl = document.getElementById('dilemma-text');
    const optionsContainer = document.getElementById('dilemma-options');

    if (tagEl) tagEl.textContent = `Fase 1 • Carga de Bala ${this.currentDilemmaIndex + 1} de 3`;
    if (titleEl) titleEl.textContent = dilema.titulo;
    if (textEl) textEl.textContent = dilema.dilema;

    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      dilema.opciones.forEach((op, idx) => {
        const card = document.createElement('div');
        card.className = 'opcion-card';
        card.innerHTML = `
          <div class="opcion-num">${String.fromCharCode(65 + idx)}</div>
          <div class="opcion-text">${op.texto}</div>
        `;

        card.addEventListener('click', () => {
          this.handleDilemmaChoice(idx);
        });

        optionsContainer.appendChild(card);
      });
    }

    this.showScreen('dilemma-screen');
  }

  handleDilemmaChoice(optionIdx) {
    // Mark bullet loaded in cylinder without judgmental warning!
    this.bulletsState[this.currentDilemmaIndex].estado = 'cargada';
    this.saveState();

    if (window.audioController) {
      window.audioController.playBulletLoaded();
    }

    // Auto-advance to next dilemma or Hub
    if (this.currentDilemmaIndex < 2) {
      this.currentDilemmaIndex++;
      this.renderDilemmaScreen();
    } else {
      this.showHubScreen();
    }
  }

  // --- FASE 2: HUB DEL TAMBOR Y REVISIÓN ---
  showHubScreen() {
    this.bulletsState.forEach((b, i) => {
      b.activo = (i === this.currentShotIndex);
    });

    this.tambor.render(this.bulletsState);
    this.tambor.rotateToBullet(this.currentShotIndex);

    const titleEl = document.getElementById('hub-bullet-title');
    const descEl = document.getElementById('hub-bullet-desc');
    const btnAction = document.getElementById('btn-action-hub');

    const intento = INTENTOS_DISPARO[this.currentShotIndex];
    if (titleEl) titleEl.textContent = intento ? intento.momento : 'Revolver Listo';
    if (descEl) descEl.textContent = "Las 3 recámaras están cargadas. Ingresa al enfrentamiento crítico.";

    if (btnAction) {
      btnAction.textContent = `🔥 ENFRENTAR INTENTO ${this.currentShotIndex + 1}`;
    }

    this.showScreen('hub-screen');
  }

  handleChamberClick(bulletId) {
    const idx = bulletId - 1;
    if (idx >= 0 && idx < 3) {
      this.currentShotIndex = idx;
      this.showHubScreen();
    }
  }

  // --- FASE 3: LOS 3 INTENTOS DE DISPARO ---
  renderShootingScreen() {
    const intento = INTENTOS_DISPARO[this.currentShotIndex];
    if (!intento) return;

    const tagEl = document.getElementById('shoot-tag');
    const titleEl = document.getElementById('shoot-title');
    const sitEl = document.getElementById('shoot-situation');

    if (tagEl) tagEl.textContent = `Intento Crítico ${this.currentShotIndex + 1} de 3`;
    if (titleEl) titleEl.textContent = intento.momento;
    if (sitEl) sitEl.textContent = intento.situación;

    this.showScreen('shooting-screen');
  }

  handleShootingDecision(decision) {
    const intento = INTENTOS_DISPARO[this.currentShotIndex];
    const bulletObj = this.bulletsState[this.currentShotIndex];

    const overlay = document.getElementById('feedback-overlay');
    const modal = document.getElementById('feedback-modal-content');

    if (decision === 'disparar') {
      bulletObj.estado = 'disparada';
      bulletObj.decisionFinal = 'disparar';

      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 200, 50, 300]);
      }
      this.triggerFlashFX();
      if (window.audioController) {
        window.audioController.playGunshot();
      }

      if (modal) {
        modal.className = 'feedback-modal crimson-modal';
        modal.innerHTML = `
          <div class="feedback-icon">💥</div>
          <div class="feedback-title">APRETASTE EL GATILLO</div>
          <div class="feedback-body">${intento.feedbackDisparar}</div>
          <button id="btn-close-feedback" class="btn btn-crimson">CONTINUAR ⚡</button>
        `;
      }
    } else {
      bulletObj.estado = 'contenida';
      bulletObj.decisionFinal = 'guardar';

      if (window.navigator.vibrate) {
        window.navigator.vibrate([150]);
      }
      if (window.audioController) {
        window.audioController.playContainmentSuccess();
      }

      if (modal) {
        modal.className = 'feedback-modal emerald-modal';
        modal.innerHTML = `
          <div class="feedback-icon">🛡️</div>
          <div class="feedback-title">DISUASIÓN LATENTE (CONTENCIÓN)</div>
          <div class="feedback-body">${intento.feedbackGuardar}</div>
          <button id="btn-close-feedback" class="btn btn-emerald">CONTINUAR ⚡</button>
        `;
      }
    }

    this.saveState();

    const btnClose = document.getElementById('btn-close-feedback');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (overlay) overlay.classList.remove('active');
        this.advanceNextShot();
      });
    }

    if (overlay) overlay.classList.add('active');
  }

  triggerFlashFX() {
    const flashEl = document.getElementById('flash-fx');
    if (flashEl) {
      flashEl.classList.add('trigger-flash');
      setTimeout(() => {
        flashEl.classList.remove('trigger-flash');
      }, 150);
    }
  }

  advanceNextShot() {
    if (this.currentShotIndex < 2) {
      this.currentShotIndex++;
      this.showHubScreen();
    } else {
      this.showDebriefScreen();
    }
  }

  // --- FASE 4: RESULTADO FINAL & MARVEL MORENO ---
  showDebriefScreen() {
    const countContenida = this.bulletsState.filter(b => b.estado === 'contenida').length;
    const countDisparada = this.bulletsState.filter(b => b.estado === 'disparada').length;

    const valContenida = document.getElementById('debrief-count-green');
    const valDisparada = document.getElementById('debrief-count-red');
    const textRatio = document.getElementById('debrief-ratio-text');
    const listSummary = document.getElementById('debrief-bullets-list');

    if (valContenida) valContenida.textContent = `${countContenida}/3`;
    if (valDisparada) valDisparada.textContent = `${countDisparada}/3`;

    if (textRatio) {
      if (countContenida === 3) {
        textRatio.textContent = "🏆 ESTRATEGIA PERFECTA (MARVEL MORENO): Mantuvieron el revólver guardado en los 3 intentos. Lograron 30 años de paz y sumisión del agresor sin disparar un tiro.";
        textRatio.style.color = "var(--emerald-success)";
      } else if (countContenida > 0) {
        textRatio.textContent = "⚡ RESULTADO MIXTO: Ejercieron la disuasión en algunos momentos, pero los disparos efectuados trajeron repercusiones legales y pérdida de control.";
        textRatio.style.color = "var(--gold-primary)";
      } else {
        textRatio.textContent = "💥 ALTO COSTO DE VIOLENCIA: Dispararon en los 3 intentos. La agresión reactiva destruyó la tranquilidad y convirtió a la víctima en acusada.";
        textRatio.style.color = "var(--crimson-danger)";
      }
    }

    if (listSummary) {
      listSummary.innerHTML = '';
      this.bulletsState.forEach((b, idx) => {
        const intento = INTENTOS_DISPARO[idx];
        const item = document.createElement('div');
        item.style.padding = '10px 12px';
        item.style.marginBottom = '6px';
        item.style.borderRadius = '8px';
        item.style.background = 'rgba(255,255,255,0.03)';
        item.style.borderLeft = b.estado === 'contenida' ? '4px solid var(--emerald-success)' : '4px solid var(--crimson-danger)';

        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--text-bright); font-size:0.88rem;">${intento.momento}</strong>
            <span style="font-size:0.75rem; padding:2px 6px; border-radius:8px; font-weight:bold; background:${b.estado === 'contenida' ? 'rgba(42,157,143,0.2)' : 'rgba(214,40,40,0.2)'}; color:${b.estado === 'contenida' ? 'var(--emerald-success)' : 'var(--crimson-danger)'}">
              ${b.estado === 'contenida' ? '🛡️ DISUASIÓN' : '💥 DISPARO'}
            </span>
          </div>
        `;
        listSummary.appendChild(item);
      });
    }

    this.showScreen('debrief-screen');
  }

  toggleViewMode() {
    const container = document.getElementById('app-container');
    const btnToggle = document.getElementById('btn-toggle-mode');

    if (this.viewMode === 'mobile') {
      this.viewMode = 'projector';
      container.classList.add('projector-mode');
      if (btnToggle) btnToggle.textContent = '📱 VISTA MÓVIL';
      this.renderProjectorView();
      this.showScreen('projector-screen');
    } else {
      this.viewMode = 'mobile';
      container.classList.remove('projector-mode');
      if (btnToggle) btnToggle.textContent = '🖥️ VISTA PROYECTOR';
      this.showHubScreen();
    }
  }

  renderProjectorView() {
    const qrContainer = document.getElementById('projector-qr-container');
    if (qrContainer && window.QRComponent) {
      qrContainer.innerHTML = QRComponent.renderSVG(window.location.href, 200);
    }

    const gridTeams = document.getElementById('projector-teams-grid');
    if (gridTeams) {
      gridTeams.innerHTML = '';
      for (let i = 1; i <= 6; i++) {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-score-card';

        const isCurrentTeam = (this.teamName && (this.teamName === `Equipo ${i}` || this.teamName.includes(String(i))));
        const dotsHTML = this.bulletsState.map(b => {
          let cls = 'dot';
          if (b.estado === 'cargada') cls += ' dot-cargada';
          else if (b.estado === 'disparada') cls += ' dot-disparada';
          else if (b.estado === 'contenida') cls += ' dot-contenida';
          return `<span class="${cls}"></span>`;
        }).join('');

        teamCard.innerHTML = `
          <div>
            <strong style="color: ${isCurrentTeam ? 'var(--gold-primary)' : 'var(--text-bright)'}; font-size:0.95rem;">
              EQUIPO ${i} ${isCurrentTeam ? ' (TU GRUPO)' : ''}
            </strong>
          </div>
          <div class="bullet-mini-dots">${dotsHTML}</div>
        `;
        gridTeams.appendChild(teamCard);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new OperacionAmatistaApp();
  window.app.init();
});
