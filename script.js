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
        const romeHull1 = isSunk ? '#3a0808' : '#8B0000';
        const romeHull2 = isSunk ? '#2a0505' : '#5c0000';
        const romeDeck = isSunk ? '#2a1a0a' : '#6b3a1a';
        const romeAccent = isSunk ? '#4a2a00' : '#d4af37';
        const romeWood = isSunk ? '#3a2010' : '#a0522d';
        const romeSail = isSunk ? '#2a1515' : '#c0392b';
        const romeSailLight = isSunk ? '#3a2020' : '#e74c3c';

        const greekHull1 = isSunk ? '#0a1a2e' : '#1a3a5c';
        const greekHull2 = isSunk ? '#081428' : '#0f2844';
        const greekDeck = isSunk ? '#1a2a3a' : '#3a6688';
        const greekAccent = isSunk ? '#2a3a4a' : '#aed6f1';
        const greekWood = isSunk ? '#1a2a3a' : '#5b8ca8';
        const greekSail = isSunk ? '#0a1828' : '#2471a3';
        const greekSailLight = isSunk ? '#152535' : '#3498db';

        const h1 = isGreece ? greekHull1 : romeHull1;
        const h2 = isGreece ? greekHull2 : romeHull2;
        const dk = isGreece ? greekDeck : romeDeck;
        const ac = isGreece ? greekAccent : romeAccent;
        const wd = isGreece ? greekWood : romeWood;
        const sl = isGreece ? greekSail : romeSail;
        const sl2 = isGreece ? greekSailLight : romeSailLight;

        const uid = `${shipId}-${isGreece?'g':'r'}${isSunk?'s':''}`;

        const sunkDamage = isSunk ? `
            <line x1="18" y1="15" x2="28" y2="38" stroke="#111" stroke-width="1.2" opacity=".5"/>
            <line x1="55" y1="12" x2="48" y2="40" stroke="#111" stroke-width="1.2" opacity=".5"/>
            <line x1="78" y1="18" x2="82" y2="36" stroke="#111" stroke-width="1" opacity=".4"/>
            <circle cx="30" cy="30" r="3" fill="none" stroke="#111" stroke-width=".8" opacity=".3"/>
            <circle cx="65" cy="28" r="2.5" fill="none" stroke="#111" stroke-width=".8" opacity=".3"/>` : '';

        const waterline = `<path d="M8,36 Q25,39 50,40 Q75,39 92,36 L90,38 Q75,41 50,42 Q25,41 10,38 Z" fill="${h2}" opacity=".4"/>`;

        const oarRow = (x1, x2, y, count, side) => {
            let oars = '';
            const spacing = (x2 - x1) / (count - 1);
            for (let i = 0; i < count; i++) {
                const ox = x1 + i * spacing;
                const oy = side === 'top' ? y - 6 : y + 6;
                oars += `<line x1="${ox}" y1="${y}" x2="${ox + (side==='top'?-1.5:1.5)}" y2="${oy}" stroke="${wd}" stroke-width=".6" opacity=".55"/>`;
            }
            return oars;
        };

        const svgs = {
            quinquereme: (() => {
                if (isGreece) {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M1,27 Q3,22 8,20 L14,18 L86,18 Q93,19 96,24 L98,27 L95,34 Q50,39 5,34 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                        <path d="M0,27 L1,27 L-2,26" stroke="${ac}" stroke-width="1.2" fill="none"/>
                        <path d="M-2,26 L-4,25.5" stroke="${ac}" stroke-width="1.8" stroke-linecap="round"/>
                        <ellipse cx="6" cy="25" rx="2" ry="1.8" fill="none" stroke="${ac}" stroke-width=".7" opacity=".8"/>
                        <circle cx="6" cy="25" r=".6" fill="${ac}" opacity=".8"/>
                        <path d="M10,20 L86,20 L84,22 L12,22 Z" fill="${dk}" opacity=".5"/>
                        <line x1="14" y1="21" x2="14" y2="22" stroke="${ac}" stroke-width=".4" opacity=".4"/>
                        <line x1="24" y1="21" x2="24" y2="22" stroke="${ac}" stroke-width=".4" opacity=".4"/>
                        <line x1="34" y1="21" x2="34" y2="22" stroke="${ac}" stroke-width=".4" opacity=".4"/>
                        <line x1="44" y1="21" x2="44" y2="22" stroke="${ac}" stroke-width=".4" opacity=".4"/>
                        <line x1="54" y1="21" x2="54" y2="22" stroke="${ac}" stroke-width=".4" opacity=".4"/>
                        <line x1="64" y1="21" x2="64" y2="22" stroke="${ac}" stroke-width=".4" opacity=".4"/>
                        <line x1="74" y1="21" x2="74" y2="22" stroke="${ac}" stroke-width=".4" opacity=".4"/>
                        ${oarRow(15, 82, 18, 12, 'top')}
                        ${oarRow(15, 82, 34, 12, 'bottom')}
                        <rect x="30" y="4" width="1.5" height="16" fill="${wd}" rx=".5"/>
                        <rect x="55" y="3" width="1.5" height="17" fill="${wd}" rx=".5"/>
                        <path d="M31.5,5 L41,5 L41,13 L31.5,14 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".85"/>
                        <path d="M56.5,4 L66,4 L66,13 L56.5,14 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".85"/>
                        <path d="M36,5 L36,13" stroke="${ac}" stroke-width=".25" opacity=".3"/>
                        <path d="M61,4 L61,13" stroke="${ac}" stroke-width=".25" opacity=".3"/>
                        <path d="M96,24 Q97,22 96,19 Q97,17 98,18 L99,20 Q99,23 98,25 Z" fill="${ac}" opacity=".4"/>
                        <path d="M96,19 Q95,16 96,14 Q97,13 97,14 L97,17 Z" fill="${ac}" opacity=".3"/>
                        ${waterline}
                        <path d="M42,20 L44,17 L46,20" fill="${ac}" opacity=".3" stroke="${ac}" stroke-width=".3"/>
                        ${sunkDamage}
                    </svg>`;
                } else {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M2,28 Q4,22 10,19 L15,17 L85,17 Q92,18 96,23 L98,28 L95,35 Q50,40 5,35 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                        <path d="M0,27 L2,28 L-1,26.5" stroke="${ac}" stroke-width="1.2" fill="none"/>
                        <path d="M-1,26.5 L-3,26" stroke="${ac}" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12,19 L85,19 L83,21 L14,21 Z" fill="${dk}" opacity=".5"/>
                        <rect x="8" y="18" width="3" height="6" fill="${wd}" stroke="${ac}" stroke-width=".4" rx=".5" opacity=".7"/>
                        <rect x="7" y="14" width="5" height="4" fill="${ac}" opacity=".35" rx=".5"/>
                        <path d="M7,14 L12,14 L10,12 L9,12 Z" fill="${ac}" opacity=".25"/>
                        ${oarRow(18, 82, 17, 14, 'top')}
                        ${oarRow(18, 82, 35, 14, 'bottom')}
                        <rect x="35" y="4" width="2" height="15" fill="${wd}" rx=".5"/>
                        <rect x="60" y="3" width="2" height="16" fill="${wd}" rx=".5"/>
                        <path d="M37,5 L48,5 L48,14 L37,15 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".85"/>
                        <path d="M62,4 L73,4 L73,14 L62,15 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".85"/>
                        <path d="M42,5 L42,14" stroke="${ac}" stroke-width=".3" opacity=".35"/>
                        <path d="M67,4 L67,14" stroke="${ac}" stroke-width=".3" opacity=".35"/>
                        <path d="M96,23 Q97,20 96,17 Q98,15 99,17 L99,21 Q99,24 98,26 Z" fill="${ac}" opacity=".35"/>
                        <path d="M96,17 Q95,14 96,12" stroke="${ac}" stroke-width=".6" fill="none" opacity=".4"/>
                        <rect x="88" y="17" width="4" height="5" fill="${wd}" stroke="${ac}" stroke-width=".3" rx=".5" opacity=".6"/>
                        <path d="M88,17 L92,17 L91,15 L89,15 Z" fill="${ac}" opacity=".3"/>
                        <path d="M44,7 L46,5 L48,7" fill="none" stroke="${ac}" stroke-width=".5" opacity=".5"/>
                        <rect x="45" y="7" width="2" height="1" fill="${ac}" opacity=".3" rx=".3"/>
                        ${waterline}
                        ${sunkDamage}
                    </svg>`;
                }
            })(),

            roman_trireme: (() => {
                if (isGreece) {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M2,28 Q5,21 12,19 L16,17 L84,17 Q92,18 96,24 L98,28 L94,34 Q50,39 6,34 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                        <path d="M0,27 L2,28 L-2,26" stroke="${ac}" stroke-width="1" fill="none"/>
                        <path d="M-2,26 L-4,25.5" stroke="${ac}" stroke-width="1.5" stroke-linecap="round"/>
                        <ellipse cx="7" cy="25.5" rx="1.8" ry="1.5" fill="none" stroke="${ac}" stroke-width=".6" opacity=".7"/>
                        <circle cx="7" cy="25.5" r=".5" fill="${ac}" opacity=".7"/>
                        <path d="M14,19 L84,19 L82,21 L16,21 Z" fill="${dk}" opacity=".45"/>
                        ${oarRow(18, 80, 17, 10, 'top')}
                        ${oarRow(18, 80, 34, 10, 'bottom')}
                        <rect x="42" y="4" width="1.5" height="15" fill="${wd}" rx=".5"/>
                        <path d="M43.5,5 L54,5 L54,13 L43.5,14 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".85"/>
                        <path d="M49,5 L49,13" stroke="${ac}" stroke-width=".25" opacity=".3"/>
                        <path d="M96,24 Q97,21 96,18 Q97,16 98,17 L98,22 Z" fill="${ac}" opacity=".35"/>
                        <path d="M96,18 Q95,15 96,13" stroke="${ac}" stroke-width=".5" fill="none" opacity=".35"/>
                        ${waterline}
                        ${sunkDamage}
                    </svg>`;
                } else {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M3,28 Q6,21 13,19 L17,17 L83,17 Q91,18 95,24 L97,28 L93,35 Q50,40 7,35 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                        <path d="M1,27 L3,28 L0,26.5" stroke="${ac}" stroke-width="1" fill="none"/>
                        <path d="M0,26.5 L-2,26" stroke="${ac}" stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M15,19 L83,19 L81,21 L17,21 Z" fill="${dk}" opacity=".45"/>
                        <rect x="10" y="18" width="3" height="5" fill="${wd}" stroke="${ac}" stroke-width=".3" rx=".5" opacity=".65"/>
                        <path d="M10,18 L13,18 L12,16 L11,16 Z" fill="${ac}" opacity=".25"/>
                        ${oarRow(20, 80, 17, 10, 'top')}
                        ${oarRow(20, 80, 35, 10, 'bottom')}
                        <rect x="45" y="4" width="1.8" height="15" fill="${wd}" rx=".5"/>
                        <path d="M46.8,5 L57,5 L57,14 L46.8,15 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".85"/>
                        <path d="M52,5 L52,14" stroke="${ac}" stroke-width=".25" opacity=".3"/>
                        <path d="M95,24 Q96,21 95,18 Q97,16 97,18 L97,22 Z" fill="${ac}" opacity=".3"/>
                        <rect x="86" y="17" width="3.5" height="4.5" fill="${wd}" stroke="${ac}" stroke-width=".3" rx=".5" opacity=".55"/>
                        <path d="M86,17 L89.5,17 L88.5,15 L87,15 Z" fill="${ac}" opacity=".25"/>
                        ${waterline}
                        ${sunkDamage}
                    </svg>`;
                }
            })(),

            greek_trireme: (() => {
                if (isGreece) {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M2,27 Q4,21 10,19 L14,17.5 L86,17.5 Q93,18.5 96,23 L98,27 L95,34 Q50,39 5,34 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                        <path d="M0,26 L2,27 L-2,25.5" stroke="${ac}" stroke-width="1" fill="none"/>
                        <path d="M-2,25.5 L-5,25" stroke="${ac}" stroke-width="1.5" stroke-linecap="round"/>
                        <ellipse cx="6" cy="24.5" rx="2" ry="1.6" fill="none" stroke="${ac}" stroke-width=".7" opacity=".8"/>
                        <circle cx="6" cy="24.5" r=".5" fill="${ac}" opacity=".8"/>
                        <path d="M12,19.5 L86,19.5 L84,21 L14,21 Z" fill="${dk}" opacity=".4"/>
                        ${oarRow(16, 83, 17.5, 9, 'top')}
                        ${oarRow(16, 83, 34, 9, 'bottom')}
                        <rect x="45" y="4" width="1.5" height="15.5" fill="${wd}" rx=".5"/>
                        <path d="M46.5,5 L56,5 L56,13 L46.5,14 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".85"/>
                        <path d="M51,5 L51,13" stroke="${ac}" stroke-width=".25" opacity=".3"/>
                        <path d="M96,23 Q97,20 96,17 Q97,15 98,16 L98,20 Z" fill="${ac}" opacity=".35"/>
                        <path d="M96,17 Q95,14 96,12 Q97,11 97,12" stroke="${ac}" stroke-width=".5" fill="none" opacity=".4"/>
                        <path d="M97,12 L98,11 L96,12" fill="${ac}" opacity=".3"/>
                        ${waterline}
                        ${sunkDamage}
                    </svg>`;
                } else {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M3,28 Q6,22 12,20 L16,18 L84,18 Q91,19 95,24 L97,28 L93,34 Q50,39 7,34 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                        <path d="M1,27 L3,28 L0,26.5" stroke="${ac}" stroke-width="1" fill="none"/>
                        <path d="M0,26.5 L-2,26" stroke="${ac}" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M14,20 L84,20 L82,22 L16,22 Z" fill="${dk}" opacity=".4"/>
                        ${oarRow(18, 82, 18, 9, 'top')}
                        ${oarRow(18, 82, 34, 9, 'bottom')}
                        <rect x="46" y="5" width="1.5" height="15" fill="${wd}" rx=".5"/>
                        <path d="M47.5,6 L57,6 L57,14 L47.5,15 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".85"/>
                        <path d="M52,6 L52,14" stroke="${ac}" stroke-width=".25" opacity=".3"/>
                        <path d="M95,24 Q96,21 95,18" stroke="${ac}" stroke-width=".5" fill="none" opacity=".35"/>
                        ${waterline}
                        ${sunkDamage}
                    </svg>`;
                }
            })(),

            bireme: (() => {
                if (isGreece) {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M3,27 Q6,21 13,19 L17,17.5 L83,17.5 Q90,18.5 94,23 L96,27 L93,33 Q50,38 7,33 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                        <path d="M1,26 L3,27 L-1,25.5" stroke="${ac}" stroke-width="1" fill="none"/>
                        <path d="M-1,25.5 L-3,25" stroke="${ac}" stroke-width="1.3" stroke-linecap="round"/>
                        <ellipse cx="7" cy="24.5" rx="1.6" ry="1.3" fill="none" stroke="${ac}" stroke-width=".6" opacity=".7"/>
                        <circle cx="7" cy="24.5" r=".4" fill="${ac}" opacity=".7"/>
                        <path d="M15,19.5 L83,19.5 L81,21 L17,21 Z" fill="${dk}" opacity=".4"/>
                        ${oarRow(20, 80, 17.5, 8, 'top')}
                        ${oarRow(20, 80, 33, 8, 'bottom')}
                        <rect x="46" y="5" width="1.3" height="14.5" fill="${wd}" rx=".5"/>
                        <path d="M47.3,6 L56,6 L56,13 L47.3,14 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".8"/>
                        <path d="M94,23 Q95,20 94,17 Q95,15 96,16 L96,20 Z" fill="${ac}" opacity=".3"/>
                        <path d="M94,17 Q93,14 94,12" stroke="${ac}" stroke-width=".5" fill="none" opacity=".35"/>
                        <path d="M8,37 Q50,40 92,37 L90,39 Q50,42 10,39 Z" fill="${h2}" opacity=".4"/>
                        ${sunkDamage}
                    </svg>`;
                } else {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M4,28 Q7,22 14,20 L18,18 L82,18 Q89,19 93,24 L95,28 L92,34 Q50,38 8,34 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                        <path d="M2,27 L4,28 L1,26.5" stroke="${ac}" stroke-width="1" fill="none"/>
                        <path d="M1,26.5 L-1,26" stroke="${ac}" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M16,20 L82,20 L80,22 L18,22 Z" fill="${dk}" opacity=".4"/>
                        ${oarRow(20, 80, 18, 8, 'top')}
                        ${oarRow(20, 80, 34, 8, 'bottom')}
                        <rect x="46" y="5" width="1.5" height="15" fill="${wd}" rx=".5"/>
                        <path d="M47.5,6 L56,6 L56,14 L47.5,15 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".8"/>
                        <path d="M93,24 Q94,21 93,18" stroke="${ac}" stroke-width=".5" fill="none" opacity=".3"/>
                        <path d="M8,37 Q50,40 92,37 L90,39 Q50,42 10,39 Z" fill="${h2}" opacity=".4"/>
                        ${sunkDamage}
                    </svg>`;
                }
            })(),

            scout_galley: (() => {
                if (isGreece) {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M4,27 Q8,21 16,19 L20,18 L80,18 Q88,19 93,23 L96,27 L92,33 Q50,37 8,33 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".7"/>
                        <path d="M2,26 L4,27 L0,25.5" stroke="${ac}" stroke-width=".8" fill="none"/>
                        <path d="M0,25.5 L-2,25" stroke="${ac}" stroke-width="1.2" stroke-linecap="round"/>
                        <ellipse cx="9" cy="24.5" rx="1.4" ry="1.1" fill="none" stroke="${ac}" stroke-width=".5" opacity=".6"/>
                        <path d="M18,20 L80,20 L78,21.5 L20,21.5 Z" fill="${dk}" opacity=".35"/>
                        ${oarRow(22, 78, 18, 6, 'top')}
                        ${oarRow(22, 78, 33, 6, 'bottom')}
                        <rect x="48" y="6" width="1.2" height="14" fill="${wd}" rx=".4"/>
                        <path d="M49.2,7 L57,7 L57,13 L49.2,14 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".75"/>
                        <path d="M93,23 Q94,20 93,18" stroke="${ac}" stroke-width=".4" fill="none" opacity=".3"/>
                        <path d="M8,36 Q50,39 92,36 L90,38 Q50,41 10,38 Z" fill="${h2}" opacity=".35"/>
                        ${sunkDamage}
                    </svg>`;
                } else {
                    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="h-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                            </linearGradient>
                            <linearGradient id="s-${uid}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="${sl2}"/><stop offset="100%" stop-color="${sl}"/>
                            </linearGradient>
                        </defs>
                        <path d="M5,28 Q9,22 17,20 L21,18.5 L79,18.5 Q87,19.5 92,24 L95,28 L91,33 Q50,37 9,33 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".7"/>
                        <path d="M3,27 L5,28 L2,26.5" stroke="${ac}" stroke-width=".8" fill="none"/>
                        <path d="M2,26.5 L0,26" stroke="${ac}" stroke-width="1.3" stroke-linecap="round"/>
                        <path d="M19,20.5 L79,20.5 L77,22 L21,22 Z" fill="${dk}" opacity=".35"/>
                        ${oarRow(23, 77, 18.5, 6, 'top')}
                        ${oarRow(23, 77, 33, 6, 'bottom')}
                        <rect x="48" y="6" width="1.3" height="14.5" fill="${wd}" rx=".4"/>
                        <path d="M49.3,7 L57,7 L57,14 L49.3,14.5 Z" fill="url(#s-${uid})" stroke="${ac}" stroke-width=".3" opacity=".75"/>
                        <path d="M92,24 Q93,21 92,19" stroke="${ac}" stroke-width=".4" fill="none" opacity=".3"/>
                        <path d="M9,36 Q50,39 91,36 L89,38 Q50,41 11,38 Z" fill="${h2}" opacity=".35"/>
                        ${sunkDamage}
                    </svg>`;
                }
            })()
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
            this.arrowLine.setAttribute('y1', '0');
            this.arrowLine.setAttribute('x2', '0');
            this.arrowLine.setAttribute('y2', '0');
        }
        if (this._arrowResolve) {
            this._arrowResolve();
            this._arrowResolve = null;
        }
    }

    _pickSourceCell(boardEl, fleet) {
        const alive = fleet.filter(s => !s.sunk);
        if (alive.length > 0) {
            const ship = alive[Math.floor(Math.random() * alive.length)];
            const [r, c] = ship.positions[Math.floor(Math.random() * ship.positions.length)];
            const cell = boardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) return cell;
        }
        const allCells = boardEl.querySelectorAll('.cell');
        return allCells[Math.floor(Math.random() * allCells.length)];
    }

    _fireArrow(sourceCell, targetCell, direction) {
        return new Promise((resolve) => {
            this._arrowCancelled = false;
            this._arrowResolve = resolve;

            const arrowSvg = document.getElementById('arrow-svg');
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            arrowSvg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);

            const srcRect = sourceCell.getBoundingClientRect();
            const tgtRect = targetCell.getBoundingClientRect();
            const startX = srcRect.left + srcRect.width / 2;
            const startY = srcRect.top + srcRect.height / 2;
            const endX = tgtRect.left + tgtRect.width / 2;
            const endY = tgtRect.top + tgtRect.height / 2;

            const dist = Math.hypot(endX - startX, endY - startY);
            const arcHeight = Math.min(dist * 0.25, 120);

            const duration = 480 + Math.random() * 170;

            if (direction === 'right') {
                this.arrowLine.setAttribute('stroke', '#c0392b');
                this.arrowLine.setAttribute('marker-end',   'url(#ah-r)');
                this.arrowLine.setAttribute('marker-start', 'url(#fl-r)');
            } else {
                this.arrowLine.setAttribute('stroke', '#2471a3');
                this.arrowLine.setAttribute('marker-end',   'url(#ah-l)');
                this.arrowLine.setAttribute('marker-start', 'url(#fl-l)');
            }

            this.arrowLine.setAttribute('x1', String(startX));
            this.arrowLine.setAttribute('y1', String(startY));
            this.arrowLine.setAttribute('x2', String(startX));
            this.arrowLine.setAttribute('y2', String(startY));
            this.arrowLine.classList.add('flying');

            const t0 = performance.now();
            const shaftLen = dist * 0.12;

            const tick = (now) => {
                if (this._arrowCancelled) return;
                const elapsed = now - t0;
                const progress = Math.min(elapsed / duration, 1);

                const ease = 1 - Math.pow(1 - progress, 3);

                const tipX = startX + (endX - startX) * ease;
                const tipY = startY + (endY - startY) * ease + Math.sin(progress * Math.PI) * -arcHeight;

                const tailProgress = Math.max(0, progress - 0.08);
                const tailEase = 1 - Math.pow(1 - tailProgress, 3);
                let tailX = startX + (endX - startX) * tailEase;
                let tailY = startY + (endY - startY) * tailEase + Math.sin(tailProgress * Math.PI) * -arcHeight;

                const dx = tipX - tailX;
                const dy = tipY - tailY;
                const segLen = Math.hypot(dx, dy);
                if (segLen > shaftLen && segLen > 0) {
                    tailX = tipX - (dx / segLen) * shaftLen;
                    tailY = tipY - (dy / segLen) * shaftLen;
                }

                this.arrowLine.setAttribute('x2', String(tipX));
                this.arrowLine.setAttribute('y2', String(tipY));
                this.arrowLine.setAttribute('x1', String(tailX));
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

        const sourceCell = this._pickSourceCell(this.romeBoardEl, this.romeFleet);
        const targetCell = this.greeceBoardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);

        SoundEngine.arrowLaunch();
        await this._fireArrow(sourceCell, targetCell, 'right');
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

        const sourceCell = this._pickSourceCell(this.greeceBoardEl, this.greeceFleet);
        const targetCell = this.romeBoardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);

        SoundEngine.arrowLaunch();
        await this._fireArrow(sourceCell, targetCell, 'left');
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
