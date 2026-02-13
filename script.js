/* ═══════════════════════════════════════════════════════════════
   Naval War: Rome vs Greece — Game Engine
   ═══════════════════════════════════════════════════════════════ */

/* ── Sound Manager (Web Audio API) ── */
const SoundEngine = {
    ctx: null,
    muted: false,

    _ensureCtx() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    },

    _noise(duration, gain) {
        const ctx = this._ensureCtx();
        const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        src.connect(g).connect(ctx.destination);
        return { src, gain: g };
    },

    arrowLaunch() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        const t = ctx.currentTime;
        const { src } = this._noise(0.25, 0.12);
        const bpf = ctx.createBiquadFilter();
        bpf.type = 'bandpass';
        bpf.frequency.setValueAtTime(800, t);
        bpf.frequency.exponentialRampToValueAtTime(2400, t + 0.15);
        bpf.Q.value = 1.5;
        src.disconnect();
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        src.connect(bpf).connect(g).connect(ctx.destination);
        src.start(t);
        src.stop(t + 0.25);
    },

    hit() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
        const { src } = this._noise(0.15, 0.18);
        src.start(t);
        src.stop(t + 0.15);
    },

    miss() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        const t = ctx.currentTime;
        const { src } = this._noise(0.35, 0.08);
        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(1200, t);
        lpf.frequency.exponentialRampToValueAtTime(200, t + 0.35);
        src.disconnect();
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        src.connect(lpf).connect(g).connect(ctx.destination);
        src.start(t);
        src.stop(t + 0.35);
    },

    sink() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.8);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.2);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.8);
        const { src } = this._noise(0.5, 0.06);
        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(600, t);
        lpf.frequency.exponentialRampToValueAtTime(100, t + 0.5);
        src.disconnect();
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.08, t + 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        src.connect(lpf).connect(g2).connect(ctx.destination);
        src.start(t + 0.1);
        src.stop(t + 0.6);
    },

    warHorn() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.linearRampToValueAtTime(180, t + 0.4);
        osc.frequency.linearRampToValueAtTime(160, t + 1.0);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.3);
        g.gain.linearRampToValueAtTime(0.1, t + 0.8);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 400;
        osc.connect(lpf).connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
    },

    place() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    },

    toggle() {
        this.muted = !this.muted;
        return this.muted;
    }
};

class NavalWar {
    constructor() {
        this.SIZE = 10;

        this.FLEET = [
            { id: 'quinquereme',   name: 'Quinquereme',   length: 5 },
            { id: 'roman_trireme', name: 'Roman Trireme', length: 4 },
            { id: 'greek_trireme', name: 'Greek Trireme', length: 3 },
            { id: 'bireme',        name: 'Bireme',        length: 3 },
            { id: 'scout_galley',  name: 'Scout Galley',  length: 2 },
        ];

        this.difficulty = 'easy'; // easy | medium | hard | expert

        // ── DOM refs (setup) ──
        this.setupScreen  = document.getElementById('setup-screen');
        this.battleScreen = document.getElementById('battle-screen');
        this.setupBoardEl = document.getElementById('setup-board');
        this.orientBtn    = document.getElementById('orient-btn');
        this.randomBtn    = document.getElementById('random-btn');
        this.startWarBtn  = document.getElementById('start-war-btn');

        // ── DOM refs (battle) ──
        this.romeBoardEl   = document.getElementById('rome-board');
        this.greeceBoardEl = document.getElementById('greece-board');
        this.logEntriesEl  = document.getElementById('log-entries');
        this.turnEl        = document.getElementById('turn-indicator');
        this.romeShipsEl   = document.getElementById('rome-ships');
        this.greeceShipsEl = document.getElementById('greece-ships');
        this.arrowLine     = document.getElementById('arrow-line');
        this.restartBtn    = document.getElementById('restart-btn');
        this.diffDisplay   = document.getElementById('diff-display');

        // Arrow animation state
        this._arrowRaf = null;
        this._arrowResolve = null;
        this._arrowCancelled = false;

        // Mute button
        this._createMuteBtn();

        // Setup state
        this.orientation = 'h';          // h | v
        this.setupData   = null;         // grid for placement
        this.setupFleet  = [];           // placed ships
        this.currentShipIdx = 0;         // index into FLEET being placed

        this._bindSetup();
        this._bindBattle();
        this._showSetup();
    }

    _createMuteBtn() {
        const btn = document.createElement('button');
        btn.className = 'mute-btn';
        btn.setAttribute('aria-label', 'Toggle sound');
        btn.innerHTML = '&#x1f50a;';
        btn.addEventListener('click', () => {
            const muted = SoundEngine.toggle();
            btn.innerHTML = muted ? '&#x1f507;' : '&#x1f50a;';
        });
        document.body.appendChild(btn);
    }

    /* ══════════════════════════════════════════
       SETUP PHASE
       ══════════════════════════════════════════ */

    _bindSetup() {
        // Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.diff;
            });
        });

        // Ship rack selection
        document.querySelectorAll('.rack-ship').forEach((el, idx) => {
            el.addEventListener('click', () => {
                if (el.classList.contains('placed')) return;
                document.querySelectorAll('.rack-ship').forEach(s => s.classList.remove('selected'));
                el.classList.add('selected');
                this.currentShipIdx = idx;
            });
        });

        // Orientation toggle
        this.orientBtn.addEventListener('click', () => {
            this.orientation = this.orientation === 'h' ? 'v' : 'h';
            this.orientBtn.textContent = this.orientation === 'h' ? '↔ Horizontal' : '↕ Vertical';
        });

        // Random placement
        this.randomBtn.addEventListener('click', () => this._randomPlaceAll());

        // Start war
        this.startWarBtn.addEventListener('click', () => this._beginWar());

        // Setup board events
        this.setupBoardEl.addEventListener('mouseover', (e) => this._setupPreview(e));
        this.setupBoardEl.addEventListener('mouseout',  ()  => this._clearSetupPreview());
        this.setupBoardEl.addEventListener('click',     (e) => this._setupPlace(e));
    }

    _showSetup() {
        this.setupScreen.classList.remove('hidden');
        this.battleScreen.classList.add('hidden');

        // Reset setup state
        this.setupData  = this._emptyGrid();
        this.setupFleet = [];
        this.currentShipIdx = 0;
        this.orientation = 'h';
        this.orientBtn.textContent = '↔ Horizontal';
        this.startWarBtn.disabled = true;

        // Reset rack UI
        const rackShips = document.querySelectorAll('.rack-ship');
        rackShips.forEach((el, i) => {
            el.classList.remove('placed', 'selected');
            if (i === 0) el.classList.add('selected');
        });

        this._renderSetupBoard();
    }

    _renderSetupBoard() {
        this.setupBoardEl.innerHTML = '';
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell setup-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                if (this.setupData[r][c] === 'ship') cell.classList.add('ship-rome');
                this.setupBoardEl.appendChild(cell);
            }
        }
        this._renderShipOverlays(this.setupBoardEl, this.setupFleet, false, false);
    }

    _getPositions(r, c, len, orient) {
        const pos = [];
        for (let i = 0; i < len; i++) {
            pos.push(orient === 'v' ? [r + i, c] : [r, c + i]);
        }
        return pos;
    }

    _isValid(grid, positions) {
        return positions.every(([pr, pc]) =>
            pr >= 0 && pr < this.SIZE && pc >= 0 && pc < this.SIZE && grid[pr][pc] === null
        );
    }

    _setupPreview(e) {
        this._clearSetupPreview();
        if (this.currentShipIdx >= this.FLEET.length) return;
        const rackEl = document.querySelectorAll('.rack-ship')[this.currentShipIdx];
        if (!rackEl || rackEl.classList.contains('placed')) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;
        const r = +cell.dataset.row, c = +cell.dataset.col;
        const ship = this.FLEET[this.currentShipIdx];
        const positions = this._getPositions(r, c, ship.length, this.orientation);
        const valid = this._isValid(this.setupData, positions);

        positions.forEach(([pr, pc]) => {
            if (pr < this.SIZE && pc < this.SIZE) {
                const el = this.setupBoardEl.querySelector(`.cell[data-row="${pr}"][data-col="${pc}"]`);
                if (el) el.classList.add(valid ? 'preview-valid' : 'preview-invalid');
            }
        });
    }

    _clearSetupPreview() {
        this.setupBoardEl.querySelectorAll('.preview-valid, .preview-invalid').forEach(el => {
            el.classList.remove('preview-valid', 'preview-invalid');
        });
    }

    _setupPlace(e) {
        if (this.currentShipIdx >= this.FLEET.length) return;
        const rackEl = document.querySelectorAll('.rack-ship')[this.currentShipIdx];
        if (!rackEl || rackEl.classList.contains('placed')) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;
        const r = +cell.dataset.row, c = +cell.dataset.col;
        const ship = this.FLEET[this.currentShipIdx];
        const positions = this._getPositions(r, c, ship.length, this.orientation);

        if (!this._isValid(this.setupData, positions)) return;

        // Place it
        positions.forEach(([pr, pc]) => (this.setupData[pr][pc] = 'ship'));
        this.setupFleet.push({ id: ship.id, name: ship.name, length: ship.length, positions, sunk: false });
        rackEl.classList.add('placed');
        rackEl.classList.remove('selected');

        SoundEngine.place();
        this._renderSetupBoard();

        positions.forEach(([pr, pc]) => {
            const placedCell = this.setupBoardEl.querySelector(`.cell[data-row="${pr}"][data-col="${pc}"]`);
            if (placedCell) placedCell.classList.add('just-placed');
        });

        // Auto-select next unplaced ship
        this._selectNextShip();
    }

    _selectNextShip() {
        const rackShips = document.querySelectorAll('.rack-ship');
        let found = false;
        for (let i = 0; i < rackShips.length; i++) {
            if (!rackShips[i].classList.contains('placed')) {
                rackShips[i].classList.add('selected');
                this.currentShipIdx = i;
                found = true;
                break;
            }
        }
        if (!found) {
            // All placed
            this.startWarBtn.disabled = false;
        }
    }

    _randomPlaceAll() {
        // Reset
        this.setupData  = this._emptyGrid();
        this.setupFleet = [];
        document.querySelectorAll('.rack-ship').forEach(el => el.classList.remove('placed', 'selected'));

        this._placeFleetRandom(this.setupData, this.setupFleet);

        document.querySelectorAll('.rack-ship').forEach(el => el.classList.add('placed'));
        this.startWarBtn.disabled = false;
        this._renderSetupBoard();
    }

    async _beginWar() {
        this.romeData  = this.setupData.map(row => [...row]);
        this.romeFleet = this.setupFleet.map(s => ({ ...s, positions: s.positions.map(p => [...p]), sunk: false }));

        this.greeceData  = this._emptyGrid();
        this.greeceFleet = [];
        this._placeFleetRandom(this.greeceData, this.greeceFleet);

        const labels = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' };
        this.diffDisplay.textContent = labels[this.difficulty];

        this.startWarBtn.disabled = true;

        await this._playWarTransition();

        this.setupScreen.classList.add('hidden');
        this.battleScreen.classList.remove('hidden');

        this._startBattle();
    }

    _playWarTransition() {
        return new Promise(resolve => {
            SoundEngine.warHorn();

            const overlay = document.createElement('div');
            overlay.className = 'war-transition-overlay';
            overlay.innerHTML = '<div class="war-flash"></div>' +
                '<div class="war-title">War Begins</div>' +
                '<div class="war-subtitle">Rome vs Greece</div>';
            document.body.appendChild(overlay);

            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 1800);
        });
    }

    /* ══════════════════════════════════════════
       BATTLE PHASE
       ══════════════════════════════════════════ */

    _bindBattle() {
        this.restartBtn.addEventListener('click', () => this.restart());
        this.greeceBoardEl.addEventListener('click', (e) => this._onGreeceClick(e));
    }

    _startBattle() {
        this.gameOver = false;
        this.locked   = false;
        this.turn     = 'rome';

        // AI state
        this.aiShots  = new Set();
        this.aiHitQueue = [];       // for medium+ targeting
        this.aiHitStack = [];       // for hard/expert hunt mode

        // Render boards
        this._renderBoard(this.romeBoardEl,   this.romeData,   false);
        this._renderBoard(this.greeceBoardEl, this.greeceData, true);

        this._updateCounts();
        this._setTurn('rome');
        this.logEntriesEl.innerHTML = '';
        this._log('The fleets are assembled. Rome strikes first!');

        document.querySelectorAll('.game-over-overlay').forEach(el => el.remove());
        this._cancelArrow();
    }

    restart() {
        this._cancelArrow();
        this._showSetup();
    }

    /* ── Grid helpers ── */

    _emptyGrid() {
        return Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(null));
    }

    _placeFleetRandom(grid, fleet) {
        fleet.length = 0;
        for (const ship of this.FLEET) {
            let placed = false;
            for (let attempt = 0; attempt < 500 && !placed; attempt++) {
                const orient = Math.random() < 0.5 ? 'h' : 'v';
                const r = Math.floor(Math.random() * this.SIZE);
                const c = Math.floor(Math.random() * this.SIZE);
                const positions = this._getPositions(r, c, ship.length, orient);
                if (this._isValid(grid, positions)) {
                    positions.forEach(([pr, pc]) => (grid[pr][pc] = 'ship'));
                    fleet.push({ id: ship.id, name: ship.name, length: ship.length, positions, sunk: false });
                    placed = true;
                }
            }
        }
    }

    /* ── Rendering ── */

    _renderBoard(boardEl, data, isGreece) {
        boardEl.innerHTML = '';
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const val = data[r][c];
                if (isGreece) {
                    cell.classList.add('greece-cell');
                    if (val === 'hit')  { cell.classList.add('hit'); }
                    if (val === 'miss') { cell.classList.add('miss'); cell.textContent = '•'; }
                } else {
                    if (val === 'ship') cell.classList.add('ship-rome');
                    if (val === 'hit')  { cell.classList.add('hit'); }
                    if (val === 'miss') { cell.classList.add('miss'); cell.textContent = '•'; }
                }
                boardEl.appendChild(cell);
            }
        }

        const fleet = isGreece ? this.greeceFleet : this.romeFleet;
        fleet.filter(s => s.sunk).forEach(s => {
            s.positions.forEach(([sr, sc]) => {
                const sunkCell = boardEl.querySelector(`.cell[data-row="${sr}"][data-col="${sc}"]`);
                if (sunkCell) sunkCell.classList.add('sunk');
            });
        });

        this._renderShipOverlays(boardEl, fleet, isGreece, false);
    }

    _refreshCell(boardEl, data, r, c, isGreece) {
        const cell = boardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (!cell) return;
        const val = data[r][c];
        cell.className = 'cell' + (isGreece ? ' greece-cell' : '');
        if (!isGreece && val === 'ship') cell.classList.add('ship-rome');
        if (val === 'hit')       { cell.classList.add('hit'); }
        else if (val === 'miss') { cell.classList.add('miss'); cell.textContent = '•'; }
        else                     { cell.textContent = ''; }
    }

    _markSunk(boardEl, ship) {
        ship.positions.forEach(([sr, sc]) => {
            const cell = boardEl.querySelector(`.cell[data-row="${sr}"][data-col="${sc}"]`);
            if (cell) cell.classList.add('sunk');
        });
        const isGreece = (boardEl === this.greeceBoardEl);
        const fleet = isGreece ? this.greeceFleet : this.romeFleet;
        boardEl.querySelectorAll('.ship-overlay').forEach(el => el.remove());
        this._renderShipOverlays(boardEl, fleet, isGreece, false);
    }

    /* ── Ship SVG Overlays ── */

    _getShipSVG(shipId, isGreece, isSunk) {
        const romeColor1 = isSunk ? '#3a0808' : '#b22222';
        const romeColor2 = isSunk ? '#2a0505' : '#8B0000';
        const romeAccent = isSunk ? '#4a2a00' : '#d4af37';
        const greekColor1 = isSunk ? '#0a1a2e' : '#2471a3';
        const greekColor2 = isSunk ? '#081428' : '#1a5276';
        const greekAccent = isSunk ? '#2a3a4a' : '#aed6f1';

        const c1 = isGreece ? greekColor1 : romeColor1;
        const c2 = isGreece ? greekColor2 : romeColor2;
        const accent = isGreece ? greekAccent : romeAccent;
        const sunkCracks = isSunk ? `<line x1="20" y1="10" x2="35" y2="40" stroke="${isSunk ? '#111' : 'none'}" stroke-width="1.5" opacity=".6"/><line x1="60" y1="5" x2="50" y2="38" stroke="${isSunk ? '#111' : 'none'}" stroke-width="1.5" opacity=".6"/><line x1="75" y1="12" x2="85" y2="42" stroke="${isSunk ? '#111' : 'none'}" stroke-width="1" opacity=".5"/>` : '';

        const svgs = {
            quinquereme: `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs><linearGradient id="hull-q-${isGreece?'g':'r'}${isSunk?'s':''}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
                </linearGradient></defs>
                <path d="M2,28 Q5,18 15,16 L85,16 Q95,18 98,28 L95,35 Q50,40 5,35 Z" fill="url(#hull-q-${isGreece?'g':'r'}${isSunk?'s':''})"
                      stroke="${accent}" stroke-width="1"/>
                <rect x="20" y="8" width="2" height="18" fill="${accent}" rx="1"/>
                <rect x="40" y="5" width="2" height="21" fill="${accent}" rx="1"/>
                <rect x="60" y="5" width="2" height="21" fill="${accent}" rx="1"/>
                <rect x="80" y="8" width="2" height="18" fill="${accent}" rx="1"/>
                <rect x="13" y="7" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <rect x="33" y="4" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <rect x="53" y="4" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <rect x="73" y="7" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <path d="M5,35 Q50,42 95,35 L92,38 Q50,44 8,38 Z" fill="${c2}" opacity=".5"/>
                ${isGreece ? `<circle cx="50" cy="25" r="4" fill="none" stroke="${accent}" stroke-width=".8" opacity=".6"/>` 
                           : `<rect x="47" y="22" width="6" height="6" fill="none" stroke="${accent}" stroke-width=".8" opacity=".6"/>`}
                ${sunkCracks}
            </svg>`,

            roman_trireme: `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs><linearGradient id="hull-rt-${isGreece?'g':'r'}${isSunk?'s':''}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
                </linearGradient></defs>
                <path d="M3,28 Q8,17 18,15 L82,15 Q92,17 97,28 L93,34 Q50,39 7,34 Z" fill="url(#hull-rt-${isGreece?'g':'r'}${isSunk?'s':''})"
                      stroke="${accent}" stroke-width="1"/>
                <rect x="28" y="6" width="2" height="19" fill="${accent}" rx="1"/>
                <rect x="50" y="4" width="2" height="21" fill="${accent}" rx="1"/>
                <rect x="72" y="6" width="2" height="19" fill="${accent}" rx="1"/>
                <rect x="21" y="5" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <rect x="43" y="3" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <rect x="65" y="5" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <path d="M0,26 L3,28" stroke="${accent}" stroke-width="1.5"/>
                <path d="M7,34 Q50,41 93,34 L91,37 Q50,43 9,37 Z" fill="${c2}" opacity=".5"/>
                ${sunkCracks}
            </svg>`,

            greek_trireme: `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs><linearGradient id="hull-gt-${isGreece?'g':'r'}${isSunk?'s':''}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
                </linearGradient></defs>
                <path d="M4,28 Q10,17 20,15 L80,15 Q90,17 96,28 L92,34 Q50,39 8,34 Z" fill="url(#hull-gt-${isGreece?'g':'r'}${isSunk?'s':''})"
                      stroke="${accent}" stroke-width="1"/>
                <rect x="35" y="5" width="2" height="20" fill="${accent}" rx="1"/>
                <rect x="63" y="5" width="2" height="20" fill="${accent}" rx="1"/>
                <rect x="28" y="4" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <rect x="56" y="4" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <path d="M1,26 L4,28" stroke="${accent}" stroke-width="1.5"/>
                <path d="M8,34 Q50,41 92,34 L90,37 Q50,43 10,37 Z" fill="${c2}" opacity=".5"/>
                ${isGreece ? `<path d="M48,20 L50,16 L52,20 Z" fill="${accent}" opacity=".5"/>` 
                           : `<circle cx="50" cy="22" r="3" fill="none" stroke="${accent}" stroke-width=".7" opacity=".5"/>`}
                ${sunkCracks}
            </svg>`,

            bireme: `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs><linearGradient id="hull-bi-${isGreece?'g':'r'}${isSunk?'s':''}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
                </linearGradient></defs>
                <path d="M5,28 Q12,18 22,16 L78,16 Q88,18 95,28 L90,33 Q50,38 10,33 Z" fill="url(#hull-bi-${isGreece?'g':'r'}${isSunk?'s':''})"
                      stroke="${accent}" stroke-width="1"/>
                <rect x="38" y="6" width="2" height="19" fill="${accent}" rx="1"/>
                <rect x="60" y="6" width="2" height="19" fill="${accent}" rx="1"/>
                <rect x="31" y="5" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <rect x="53" y="5" width="16" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <path d="M2,26 L5,28" stroke="${accent}" stroke-width="1.5"/>
                <path d="M10,33 Q50,39 90,33 L88,36 Q50,42 12,36 Z" fill="${c2}" opacity=".5"/>
                ${sunkCracks}
            </svg>`,

            scout_galley: `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs><linearGradient id="hull-sg-${isGreece?'g':'r'}${isSunk?'s':''}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
                </linearGradient></defs>
                <path d="M6,28 Q15,18 25,16 L75,16 Q85,18 94,28 L88,33 Q50,38 12,33 Z" fill="url(#hull-sg-${isGreece?'g':'r'}${isSunk?'s':''})"
                      stroke="${accent}" stroke-width="1"/>
                <rect x="48" y="6" width="2" height="19" fill="${accent}" rx="1"/>
                <rect x="40" y="5" width="18" height="2" fill="${accent}" opacity=".7" rx="1"/>
                <path d="M3,26 L6,28" stroke="${accent}" stroke-width="1.5"/>
                <path d="M12,33 Q50,39 88,33 L86,36 Q50,42 14,36 Z" fill="${c2}" opacity=".5"/>
                ${sunkCracks}
            </svg>`
        };

        return svgs[shipId] || svgs.scout_galley;
    }

    _getShipOrientation(ship) {
        if (ship.positions.length < 2) return 'h';
        return ship.positions[0][0] === ship.positions[1][0] ? 'h' : 'v';
    }

    _renderShipOverlays(boardEl, fleet, isGreece, forceShow) {
        boardEl.querySelectorAll('.ship-overlay').forEach(el => el.remove());

        for (const ship of fleet) {
            if (isGreece && !ship.sunk && !forceShow) continue;

            const orient = this._getShipOrientation(ship);
            const startPos = ship.positions[0];
            const startCell = boardEl.querySelector(
                `.cell[data-row="${startPos[0]}"][data-col="${startPos[1]}"]`
            );
            if (!startCell) continue;

            const overlay = document.createElement('div');
            overlay.className = 'ship-overlay';
            overlay.classList.add(ship.sunk ? 'ship-overlay-sunk' : (isGreece ? 'ship-overlay-greece' : 'ship-overlay-rome'));
            if (orient === 'v') overlay.classList.add('ship-overlay-vertical');
            overlay.dataset.shipId = ship.id;
            overlay.dataset.shipLen = ship.length;
            overlay.innerHTML = this._getShipSVG(ship.id, isGreece, ship.sunk);

            const cellRect = startCell.getBoundingClientRect();
            const boardRect = boardEl.getBoundingClientRect();
            const cellW = cellRect.width;
            const cellH = cellRect.height;
            const gap = 2;

            const left = startCell.offsetLeft;
            const top = startCell.offsetTop;

            const spanLen = orient === 'h'
                ? (cellW * ship.length + gap * (ship.length - 1))
                : (cellH * ship.length + gap * (ship.length - 1));

            overlay.style.width = spanLen + 'px';
            overlay.style.height = (orient === 'h' ? cellH : cellW) + 'px';
            overlay.style.left = left + 'px';
            overlay.style.top = top + 'px';

            if (orient === 'v') {
                overlay.style.transformOrigin = 'top left';
                overlay.style.transform = `rotate(90deg) translateY(-${cellW}px)`;
            }

            boardEl.appendChild(overlay);
        }
    }

    /* ── Turn indicator ── */

    _setTurn(who) {
        this.turn = who;
        this.turnEl.textContent = who === 'rome' ? "Rome's Turn" : "Greece's Turn";
        this.turnEl.className = 'turn-indicator ' + (who === 'rome' ? 'rome-turn' : 'greece-turn');
    }

    _updateCounts() {
        this.romeShipsEl.textContent   = this.romeFleet.filter(s => !s.sunk).length;
        this.greeceShipsEl.textContent = this.greeceFleet.filter(s => !s.sunk).length;
    }

    /* ── Message Log ── */

    _logIcon(cls) {
        const icons = {
            'hit-msg':  '&#x2694;',
            'miss-msg': '&#x1f4a7;',
            'sunk-msg': '&#x2620;',
            'win-msg':  '&#x1f3c6;',
            'lose-msg': '&#x1f480;',
        };
        return icons[cls] || '&#x25B6;';
    }

    _log(text, cls = '') {
        const p = document.createElement('p');
        p.className = 'log-entry' + (cls ? ' ' + cls : '');
        const iconSpan = document.createElement('span');
        iconSpan.className = 'log-icon';
        iconSpan.innerHTML = this._logIcon(cls);
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        p.appendChild(iconSpan);
        p.appendChild(textSpan);
        this.logEntriesEl.prepend(p);
    }

    /* ══════════════════════════════════════════
       ARROW ANIMATION (bow-and-arrow style)
       ══════════════════════════════════════════ */

    _cancelArrow() {
        this._arrowCancelled = true;
        if (this._arrowRaf) {
            cancelAnimationFrame(this._arrowRaf);
            this._arrowRaf = null;
        }
        if (this.arrowLine) {
            this.arrowLine.classList.remove('flying');
            this.arrowLine.setAttribute('x1', '0');
            this.arrowLine.setAttribute('x2', '0');
        }
        if (this._arrowResolve) {
            this._arrowResolve();
            this._arrowResolve = null;
        }
    }

    _fireArrow(direction) {
        return new Promise((resolve) => {
            this._arrowCancelled = false;
            this._arrowResolve = resolve;

            const duration = 480 + Math.random() * 170; // 480-650ms
            const startX = direction === 'right' ? 40  : 960;
            const endX   = direction === 'right' ? 960 : 40;
            const midY   = 50; // centre of 100-unit viewBox

            // Bow-and-arrow styling: colour, arrowhead marker, fletching marker
            if (direction === 'right') {
                this.arrowLine.setAttribute('stroke', '#c0392b');
                this.arrowLine.setAttribute('marker-end',   'url(#ah-r)');
                this.arrowLine.setAttribute('marker-start', 'url(#fl-r)');
            } else {
                this.arrowLine.setAttribute('stroke', '#2471a3');
                this.arrowLine.setAttribute('marker-end',   'url(#ah-l)');
                this.arrowLine.setAttribute('marker-start', 'url(#fl-l)');
            }

            // Initial position (point)
            this.arrowLine.setAttribute('x1', String(startX));
            this.arrowLine.setAttribute('y1', String(midY));
            this.arrowLine.setAttribute('x2', String(startX));
            this.arrowLine.setAttribute('y2', String(midY));
            this.arrowLine.classList.add('flying');

            const t0 = performance.now();
            const shaftLen = 80; // SVG units for visible shaft length

            const tick = (now) => {
                if (this._arrowCancelled) return;
                const elapsed = now - t0;
                const progress = Math.min(elapsed / duration, 1);

                // Ease-out cubic for natural deceleration
                const ease = 1 - Math.pow(1 - progress, 3);

                // Tip position
                const tipX = startX + (endX - startX) * ease;
                // Parabolic arc (peaks at midpoint, ~25 units up)
                const arc = Math.sin(progress * Math.PI) * -25;
                const tipY = midY + arc;

                // Tail position (follows behind by shaftLen in SVG units)
                const tailEase = 1 - Math.pow(1 - Math.max(0, progress - 0.08), 3);
                const tailX = startX + (endX - startX) * tailEase;
                // Clamp tail so shaft doesn't exceed shaftLen
                const dx = tipX - tailX;
                const clampedTailX = Math.abs(dx) > shaftLen
                    ? tipX - Math.sign(dx) * shaftLen
                    : tailX;
                const tailArc = Math.sin(Math.max(0, progress - 0.08) * Math.PI) * -25;
                const tailY = midY + tailArc;

                this.arrowLine.setAttribute('x2', String(tipX));
                this.arrowLine.setAttribute('y2', String(tipY));
                this.arrowLine.setAttribute('x1', String(clampedTailX));
                this.arrowLine.setAttribute('y1', String(tailY));

                if (progress < 1) {
                    this._arrowRaf = requestAnimationFrame(tick);
                } else {
                    this.arrowLine.classList.remove('flying');
                    this._arrowRaf = null;
                    this._arrowResolve = null;
                    resolve();
                }
            };

            this._arrowRaf = requestAnimationFrame(tick);
        });
    }

    /* ══════════════════════════════════════════
       PLAYER ATTACK
       ══════════════════════════════════════════ */

    _onGreeceClick(e) {
        if (this.gameOver || this.locked || this.turn !== 'rome') return;
        const cell = e.target.closest('.cell');
        if (!cell || !cell.classList.contains('greece-cell')) return;
        if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

        const r = +cell.dataset.row, c = +cell.dataset.col;
        this._executePlayerAttack(r, c);
    }

    async _executePlayerAttack(r, c) {
        this.locked = true;

        SoundEngine.arrowLaunch();
        await this._fireArrow('right');
        if (this.gameOver) return;

        const val = this.greeceData[r][c];
        if (val === 'ship') {
            this.greeceData[r][c] = 'hit';
            this._refreshCell(this.greeceBoardEl, this.greeceData, r, c, true);
            SoundEngine.hit();
            this._spawnImpactFlash(this.greeceBoardEl, r, c);
            this._log('Direct hit!', 'hit-msg');

            const sunkShip = this._checkSunk(this.greeceFleet, this.greeceData);
            if (sunkShip) {
                this._markSunk(this.greeceBoardEl, sunkShip);
                SoundEngine.sink();
                this._log(`You sank the ${sunkShip.name}!`, 'sunk-msg');
            }
            this._updateCounts();
            if (this._checkVictory()) return;

            this.locked = false;
        } else {
            this.greeceData[r][c] = 'miss';
            this._refreshCell(this.greeceBoardEl, this.greeceData, r, c, true);
            SoundEngine.miss();
            this._spawnSplash(this.greeceBoardEl, r, c);
            this._log('Splash\u2014miss!', 'miss-msg');

            this._setTurn('greece');
            await this._delay(500);
            if (this.gameOver) return;
            await this._aiTurn();
        }
    }

    /* ══════════════════════════════════════════
       AI TURN — 4 DIFFICULTY LEVELS
       ══════════════════════════════════════════

       Easy   : Pure random
       Medium : Random, but when it hits, tries adjacent cells
       Hard   : Hunt/Target — systematic adjacent targeting after a hit
       Expert : Hunt/Target + parity (checkerboard) scanning
    ══════════════════════════════════════════ */

    async _aiTurn() {
        if (this.gameOver) return;
        this.locked = true;

        const [r, c] = this._aiPickTarget();
        this.aiShots.add(r * this.SIZE + c);

        SoundEngine.arrowLaunch();
        await this._fireArrow('left');
        if (this.gameOver) return;

        const val = this.romeData[r][c];
        if (val === 'ship') {
            this.romeData[r][c] = 'hit';
            this._refreshCell(this.romeBoardEl, this.romeData, r, c, false);
            SoundEngine.hit();
            this._spawnImpactFlash(this.romeBoardEl, r, c);
            this._log('Greece scores a direct hit!', 'hit-msg');

            this._aiRegisterHit(r, c);

            const sunkShip = this._checkSunk(this.romeFleet, this.romeData);
            if (sunkShip) {
                this._markSunk(this.romeBoardEl, sunkShip);
                SoundEngine.sink();
                this._log(`Greece sank your ${sunkShip.name}!`, 'sunk-msg');
                this._aiRegisterSunk(sunkShip);
            }
            this._updateCounts();
            if (this._checkVictory()) return;

            await this._delay(600);
            await this._aiTurn(); // another turn on hit
        } else {
            this.romeData[r][c] = 'miss';
            this._refreshCell(this.romeBoardEl, this.romeData, r, c, false);
            SoundEngine.miss();
            this._spawnSplash(this.romeBoardEl, r, c);
            this._log('Greece missed!', 'miss-msg');

            this._setTurn('rome');
            this.locked = false;
        }
    }

    _aiPickTarget() {
        switch (this.difficulty) {
            case 'easy':   return this._aiPickRandom();
            case 'medium': return this._aiPickMedium();
            case 'hard':   return this._aiPickHard();
            case 'expert': return this._aiPickExpert();
            default:       return this._aiPickRandom();
        }
    }

    /* Easy: pure random */
    _aiPickRandom() {
        let r, c;
        for (let i = 0; i < 300; i++) {
            r = Math.floor(Math.random() * this.SIZE);
            c = Math.floor(Math.random() * this.SIZE);
            if (!this.aiShots.has(r * this.SIZE + c)) return [r, c];
        }
        return [r, c];
    }

    /* Medium: random, but if there are un-explored neighbours of hits, try those */
    _aiPickMedium() {
        if (this.aiHitQueue.length > 0) {
            // Try queued adjacent cells
            while (this.aiHitQueue.length > 0) {
                const [tr, tc] = this.aiHitQueue.shift();
                if (!this.aiShots.has(tr * this.SIZE + tc)) return [tr, tc];
            }
        }
        return this._aiPickRandom();
    }

    /* Hard: hunt/target with directional awareness */
    _aiPickHard() {
        if (this.aiHitStack.length > 0) {
            while (this.aiHitStack.length > 0) {
                const [tr, tc] = this.aiHitStack.pop();
                if (!this.aiShots.has(tr * this.SIZE + tc)) return [tr, tc];
            }
        }
        return this._aiPickRandom();
    }

    /* Expert: hunt/target + parity scanning (checkerboard) */
    _aiPickExpert() {
        // Target mode first
        if (this.aiHitStack.length > 0) {
            while (this.aiHitStack.length > 0) {
                const [tr, tc] = this.aiHitStack.pop();
                if (!this.aiShots.has(tr * this.SIZE + tc)) return [tr, tc];
            }
        }
        // Parity scan: only shoot cells where (r+c) % 2 === 0 first (checkerboard)
        // This is optimal because the smallest ship is size 2
        const candidates = [];
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if ((r + c) % 2 === 0 && !this.aiShots.has(r * this.SIZE + c)) {
                    candidates.push([r, c]);
                }
            }
        }
        if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
        }
        // Fallback: fill remaining cells
        return this._aiPickRandom();
    }

    _aiRegisterHit(r, c) {
        const adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(
            ([ar, ac]) => ar >= 0 && ar < this.SIZE && ac >= 0 && ac < this.SIZE
        );

        if (this.difficulty === 'medium') {
            // Shuffle and add to queue
            for (const a of adj) {
                if (!this.aiShots.has(a[0] * this.SIZE + a[1])) {
                    this.aiHitQueue.push(a);
                }
            }
        }

        if (this.difficulty === 'hard' || this.difficulty === 'expert') {
            // Add adjacent to stack (LIFO = depth-first targeting)
            const shuffled = adj.sort(() => Math.random() - 0.5);
            for (const a of shuffled) {
                if (!this.aiShots.has(a[0] * this.SIZE + a[1])) {
                    this.aiHitStack.push(a);
                }
            }
        }
    }

    _aiRegisterSunk(ship) {
        // When a ship sinks, remove any queued targets that belonged to it
        // (prevents wasting shots on already-sunk ship neighbours)
        const sunkSet = new Set(ship.positions.map(([r,c]) => r * this.SIZE + c));

        if (this.difficulty === 'medium') {
            this.aiHitQueue = this.aiHitQueue.filter(([r,c]) => {
                // Keep only if not adjacent-only to sunk cells
                return !this._aiAllAdjacentSunk(r, c, sunkSet);
            });
        }

        if (this.difficulty === 'hard' || this.difficulty === 'expert') {
            // Clear stack entries that are only adjacent to the sunk ship
            this.aiHitStack = this.aiHitStack.filter(([r,c]) => {
                return !this._aiAllAdjacentSunk(r, c, sunkSet);
            });
        }
    }

    _aiAllAdjacentSunk(r, c, sunkSet) {
        // Returns true if ALL hit neighbours of (r,c) are in the sunk set
        const adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(
            ([ar, ac]) => ar >= 0 && ar < this.SIZE && ac >= 0 && ac < this.SIZE
        );
        const hitNeighbours = adj.filter(([ar, ac]) => this.romeData[ar][ac] === 'hit');
        if (hitNeighbours.length === 0) return true;
        return hitNeighbours.every(([ar, ac]) => sunkSet.has(ar * this.SIZE + ac));
    }

    /* ── Ship sinking check ── */

    _checkSunk(fleet, grid) {
        for (const ship of fleet) {
            if (ship.sunk) continue;
            if (ship.positions.every(([sr, sc]) => grid[sr][sc] === 'hit')) {
                ship.sunk = true;
                return ship;
            }
        }
        return null;
    }

    /* ── Victory ── */

    _checkVictory() {
        const romeAlive   = this.romeFleet.some(s => !s.sunk);
        const greeceAlive = this.greeceFleet.some(s => !s.sunk);

        if (!greeceAlive) { this._endGame('rome');   return true; }
        if (!romeAlive)   { this._endGame('greece'); return true; }
        return false;
    }

    _endGame(winner) {
        this.gameOver = true;
        this.locked = true;
        this._cancelArrow();

        if (winner === 'rome') {
            this._log('🏛️ VICTORY! Rome conquers the Greek fleet!', 'win-msg');
            this._showOverlay('Rome Victorious!', 'The Greek fleet lies at the bottom of the sea.', true);
        } else {
            this._log('🏺 DEFEAT! Greece has destroyed the Roman fleet!', 'lose-msg');
            this._showOverlay('Greece Prevails!', 'The Roman fleet has been vanquished.', false);
        }
    }

    _showOverlay(title, subtitle, isWin) {
        document.querySelectorAll('.game-over-overlay').forEach(el => el.remove());

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-box ${isWin ? 'win' : 'lose'}">
                <h2>${title}</h2>
                <p>${subtitle}</p>
                <button id="overlay-restart">⚔️ Restart War</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#overlay-restart').addEventListener('click', () => {
            overlay.remove();
            this.restart();
        });
    }

    /* ── Visual Effects ── */

    _spawnSplash(boardEl, r, c) {
        const cell = boardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (!cell) return;
        cell.classList.add('splash-active');
        setTimeout(() => cell.classList.remove('splash-active'), 700);

        for (let i = 0; i < 6; i++) {
            const p = document.createElement('div');
            p.className = 'splash-particle';
            const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
            const dist = 12 + Math.random() * 10;
            p.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
            p.style.left = '50%';
            p.style.top = '50%';
            cell.appendChild(p);
            setTimeout(() => p.remove(), 550);
        }
    }

    _spawnImpactFlash(boardEl, r, c) {
        const cell = boardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (!cell) return;
        const flash = document.createElement('div');
        flash.className = 'impact-flash';
        cell.style.position = 'relative';
        cell.appendChild(flash);
        setTimeout(() => flash.remove(), 400);
    }

    /* ── Utility ── */

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NavalWar();
});
