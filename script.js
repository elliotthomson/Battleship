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

        // ── DOM refs (splash) ──
        this.splashScreen    = document.getElementById('splash-screen');
        this.splashAudio     = document.getElementById('splash-audio');
        this.splashContinue  = document.getElementById('splash-continue-btn');

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
        this.romeShotsEl   = document.getElementById('rome-shots');
        this.romeHitsEl    = document.getElementById('rome-hits');
        this.romeSunkEl    = document.getElementById('rome-sunk');
        this.greeceShotsEl = document.getElementById('greece-shots');
        this.greeceHitsEl  = document.getElementById('greece-hits');
        this.greeceSunkEl  = document.getElementById('greece-sunk');
        this.arrowLine     = document.getElementById('arrow-line');
        this.restartBtn    = document.getElementById('restart-btn');
        this.diffDisplay   = document.getElementById('diff-display');
        this.archerRome    = document.getElementById('archer-rome');
        this.archerGreece  = document.getElementById('archer-greece');

        // Arrow animation state
        this._arrowRaf = null;
        this._arrowResolve = null;
        this._arrowCancelled = false;

        // Insult overlay state
        this._insultIndex = 0;
        this._insults = [
            'You call that a shot? My grandmother rows harder!',
            'Poseidon weeps at your aim!',
            'Even a blind kraken could hit better!',
            'The fish are laughing at you!',
            'Your fleet is an embarrassment to the sea!',
            'A drunken sailor has better tactics!',
            'Neptune himself is bored watching you!',
            'Did you learn strategy from a barnacle?',
            'The waves themselves dodge your arrows!',
            'Your admiral must be a landlubber!',
        ];

        // Mute button
        this._createMuteBtn();

        // Setup state
        this.orientation = 'h';          // h | v
        this.setupData   = null;         // grid for placement
        this.setupFleet  = [];           // placed ships
        this.currentShipIdx = 0;         // index into FLEET being placed

        this.playerMissCount = 0;

        this._bindSetup();
        this._bindBattle();
        this._showSplash();
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
        // Help button toggle
        const helpBtn = document.getElementById('help-btn');
        const helpDropdown = document.getElementById('help-dropdown');
        helpBtn.addEventListener('click', () => {
            helpDropdown.classList.toggle('hidden');
        });

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

    _showSplash() {
        this.splashScreen.classList.remove('hidden');
        this.setupScreen.classList.add('hidden');
        this.battleScreen.classList.add('hidden');

        let transitioned = false;
        const goToSetup = () => {
            if (transitioned) return;
            transitioned = true;
            if (this.splashAudio) this.splashAudio.pause();
            this.splashScreen.classList.add('hidden');
            this._showSetup();
        };

        this.splashContinue.addEventListener('click', goToSetup, { once: true });
        this.splashAudio.addEventListener('ended', goToSetup, { once: true });

        this.splashAudio.play().catch(() => {});
    }

    _showSetup() {
        this.splashScreen.classList.add('hidden');
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
        this._waveEpoch = Date.now();

        // AI state
        this.aiShots  = new Set();
        this.aiHitQueue = [];       // for medium+ targeting
        this.aiHitStack = [];       // for hard/expert hunt mode

        // Statistics tracking
        this.romeShotCount = 0;
        this.romeHitCount = 0;
        this.greeceShotCount = 0;
        this.greeceHitCount = 0;

        // Render boards
        this._renderBoard(this.romeBoardEl,   this.romeData,   false);
        this._renderBoard(this.greeceBoardEl, this.greeceData, true);

        this._updateCounts();
        this._setTurn('rome');
        this.playerMissCount = 0;
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
                    if (val === 'miss') { cell.classList.add('miss'); this._createWaveElements(cell); }
                } else {
                    if (val === 'ship') cell.classList.add('ship-rome');
                    if (val === 'hit')  { cell.classList.add('hit'); }
                    if (val === 'miss') { cell.classList.add('miss'); this._createWaveElements(cell); }
                }
                boardEl.appendChild(cell);
            }
        }

        this._syncAdjacentMisses(boardEl, data);

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
        else if (val === 'miss') { cell.classList.add('miss'); this._createWaveElements(cell); this._updateAdjacentMisses(boardEl, data, r, c); }
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
            <line x1="20" y1="10" x2="30" y2="40" stroke="#111" stroke-width="1.2" opacity=".5"/>
            <line x1="55" y1="8" x2="48" y2="42" stroke="#111" stroke-width="1.2" opacity=".5"/>
            <line x1="75" y1="12" x2="80" y2="38" stroke="#111" stroke-width="1" opacity=".4"/>
            <circle cx="35" cy="25" r="3" fill="none" stroke="#111" stroke-width=".8" opacity=".3"/>
            <circle cx="65" cy="25" r="2.5" fill="none" stroke="#111" stroke-width=".8" opacity=".3"/>` : '';

        const oarRow = (x1, x2, y, count, side) => {
            let oars = '';
            const spacing = (x2 - x1) / (count - 1);
            for (let i = 0; i < count; i++) {
                const ox = x1 + i * spacing;
                const oy = side === 'top' ? y - 10 : y + 10;
                const angle = side === 'top' ? -0.15 : 0.15;
                const tipX = ox + angle * 10;
                oars += `<line x1="${ox}" y1="${y}" x2="${tipX.toFixed(1)}" y2="${oy}" stroke="${wd}" stroke-width=".8" stroke-linecap="round" opacity=".65"/>`;
                oars += `<line x1="${tipX.toFixed(1)}" y1="${oy}" x2="${(tipX + (side==='top'?-0.5:0.5)).toFixed(1)}" y2="${oy + (side==='top'?-1.5:1.5)}" stroke="${wd}" stroke-width=".5" opacity=".4"/>`;
            }
            return oars;
        };

        const deckPlanks = (x1, x2, y, count) => {
            let planks = '';
            const spacing = (x2 - x1) / (count + 1);
            for (let i = 1; i <= count; i++) {
                const px = x1 + i * spacing;
                planks += `<line x1="${px}" y1="${y - 5}" x2="${px}" y2="${y + 5}" stroke="${wd}" stroke-width=".3" opacity=".2"/>`;
            }
            return planks;
        };

        const svgs = {
            quinquereme: (() => {
                return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="h-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${h2}"/><stop offset="30%" stop-color="${h1}"/><stop offset="70%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                        </linearGradient>
                        <linearGradient id="dk-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${dk}" stop-opacity=".3"/><stop offset="50%" stop-color="${dk}" stop-opacity=".7"/><stop offset="100%" stop-color="${dk}" stop-opacity=".3"/>
                        </linearGradient>
                        <radialGradient id="s1-${uid}" cx=".5" cy=".5" r=".5">
                            <stop offset="0%" stop-color="${sl2}" stop-opacity=".9"/><stop offset="100%" stop-color="${sl}" stop-opacity=".7"/>
                        </radialGradient>
                    </defs>
                    <path d="M-3,25 Q2,20 8,17 Q14,14 22,13 L78,13 Q86,14 92,17 Q98,20 103,25 Q98,30 92,33 Q86,36 78,37 L22,37 Q14,36 8,33 Q2,30 -3,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".6" opacity=".3"/>
                    <path d="M0,25 Q4,20 10,17.5 Q16,15 24,14 L76,14 Q84,15 90,17.5 Q96,20 100,25 Q96,30 90,32.5 Q84,35 76,36 L24,36 Q16,35 10,32.5 Q4,30 0,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                    <path d="M-2,25 L-5,25" stroke="${ac}" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M6,18 L6,32" stroke="${h2}" stroke-width=".4" opacity=".3"/>
                    <path d="M5,25 Q8,21 14,18.5 L86,18.5 Q92,21 95,25 Q92,29 86,31.5 L14,31.5 Q8,29 5,25 Z" fill="url(#dk-${uid})"/>
                    ${deckPlanks(12, 88, 25, 14)}
                    ${oarRow(14, 86, 14, 14, 'top')}
                    ${oarRow(14, 86, 36, 14, 'bottom')}
                    <line x1="30" y1="14" x2="30" y2="36" stroke="${wd}" stroke-width="1" opacity=".5"/>
                    <ellipse cx="30" cy="25" rx="6" ry="5" fill="url(#s1-${uid})" stroke="${ac}" stroke-width=".3" opacity=".8"/>
                    <line x1="30" y1="20" x2="30" y2="30" stroke="${ac}" stroke-width=".3" opacity=".4"/>
                    <line x1="24" y1="25" x2="36" y2="25" stroke="${ac}" stroke-width=".3" opacity=".4"/>
                    <line x1="65" y1="14" x2="65" y2="36" stroke="${wd}" stroke-width="1" opacity=".5"/>
                    <ellipse cx="65" cy="25" rx="5.5" ry="4.5" fill="url(#s1-${uid})" stroke="${ac}" stroke-width=".3" opacity=".8"/>
                    <line x1="65" y1="20.5" x2="65" y2="29.5" stroke="${ac}" stroke-width=".3" opacity=".4"/>
                    <line x1="59.5" y1="25" x2="70.5" y2="25" stroke="${ac}" stroke-width=".3" opacity=".4"/>
                    <rect x="46" y="22" width="4" height="6" rx="1" fill="${wd}" stroke="${ac}" stroke-width=".3" opacity=".5"/>
                    <path d="M99,25 L102,24 L102,26 Z" fill="${ac}" opacity=".5"/>
                    <circle cx="8" cy="25" r="1.5" fill="${ac}" opacity=".3"/>
                    <line x1="7" y1="20" x2="7" y2="30" stroke="${ac}" stroke-width=".3" opacity=".2"/>
                    ${sunkDamage}
                </svg>`;
            })(),

            roman_trireme: (() => {
                return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="h-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${h2}"/><stop offset="30%" stop-color="${h1}"/><stop offset="70%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                        </linearGradient>
                        <linearGradient id="dk-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${dk}" stop-opacity=".3"/><stop offset="50%" stop-color="${dk}" stop-opacity=".7"/><stop offset="100%" stop-color="${dk}" stop-opacity=".3"/>
                        </linearGradient>
                        <radialGradient id="s1-${uid}" cx=".5" cy=".5" r=".5">
                            <stop offset="0%" stop-color="${sl2}" stop-opacity=".9"/><stop offset="100%" stop-color="${sl}" stop-opacity=".7"/>
                        </radialGradient>
                    </defs>
                    <path d="M-2,25 Q3,20 9,17.5 Q16,15 24,14.5 L76,14.5 Q84,15 91,17.5 Q97,20 102,25 Q97,30 91,32.5 Q84,35 76,35.5 L24,35.5 Q16,35 9,32.5 Q3,30 -2,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".6" opacity=".3"/>
                    <path d="M1,25 Q5,20.5 11,18 Q17,16 25,15 L75,15 Q83,16 89,18 Q95,20.5 99,25 Q95,29.5 89,32 Q83,34 75,35 L25,35 Q17,34 11,32 Q5,29.5 1,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                    <path d="M-1,25 L-4,25" stroke="${ac}" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M6,19 L6,31" stroke="${h2}" stroke-width=".4" opacity=".3"/>
                    <path d="M7,25 Q10,21.5 16,19 L84,19 Q90,21.5 93,25 Q90,28.5 84,31 L16,31 Q10,28.5 7,25 Z" fill="url(#dk-${uid})"/>
                    ${deckPlanks(14, 86, 25, 12)}
                    ${oarRow(16, 84, 15, 11, 'top')}
                    ${oarRow(16, 84, 35, 11, 'bottom')}
                    <line x1="48" y1="15" x2="48" y2="35" stroke="${wd}" stroke-width="1" opacity=".5"/>
                    <ellipse cx="48" cy="25" rx="5.5" ry="4.5" fill="url(#s1-${uid})" stroke="${ac}" stroke-width=".3" opacity=".8"/>
                    <line x1="48" y1="20.5" x2="48" y2="29.5" stroke="${ac}" stroke-width=".3" opacity=".4"/>
                    <line x1="42.5" y1="25" x2="53.5" y2="25" stroke="${ac}" stroke-width=".3" opacity=".4"/>
                    <rect x="28" y="22.5" width="3.5" height="5" rx="1" fill="${wd}" stroke="${ac}" stroke-width=".3" opacity=".5"/>
                    <rect x="68" y="22.5" width="3.5" height="5" rx="1" fill="${wd}" stroke="${ac}" stroke-width=".3" opacity=".45"/>
                    <path d="M98,25 L101,24 L101,26 Z" fill="${ac}" opacity=".5"/>
                    <circle cx="9" cy="25" r="1.3" fill="${ac}" opacity=".3"/>
                    ${sunkDamage}
                </svg>`;
            })(),

            greek_trireme: (() => {
                return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="h-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${h2}"/><stop offset="30%" stop-color="${h1}"/><stop offset="70%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                        </linearGradient>
                        <linearGradient id="dk-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${dk}" stop-opacity=".3"/><stop offset="50%" stop-color="${dk}" stop-opacity=".7"/><stop offset="100%" stop-color="${dk}" stop-opacity=".3"/>
                        </linearGradient>
                        <radialGradient id="s1-${uid}" cx=".5" cy=".5" r=".5">
                            <stop offset="0%" stop-color="${sl2}" stop-opacity=".9"/><stop offset="100%" stop-color="${sl}" stop-opacity=".7"/>
                        </radialGradient>
                    </defs>
                    <path d="M-1,25 Q4,20 10,17.5 Q17,15 26,14.5 L74,14.5 Q83,15 90,17.5 Q96,20 101,25 Q96,30 90,32.5 Q83,35 74,35.5 L26,35.5 Q17,35 10,32.5 Q4,30 -1,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".6" opacity=".3"/>
                    <path d="M2,25 Q6,20.5 12,18 Q18,16 27,15.5 L73,15.5 Q82,16 88,18 Q94,20.5 98,25 Q94,29.5 88,32 Q82,34 73,34.5 L27,34.5 Q18,34 12,32 Q6,29.5 2,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                    <path d="M0,25 L-4,25" stroke="${ac}" stroke-width="1.5" stroke-linecap="round"/>
                    <ellipse cx="6" cy="25" rx="1.8" ry="1.5" fill="none" stroke="${ac}" stroke-width=".5" opacity=".5"/>
                    <circle cx="6" cy="25" r=".5" fill="${ac}" opacity=".5"/>
                    <path d="M8,25 Q11,21.5 17,19.5 L83,19.5 Q89,21.5 92,25 Q89,28.5 83,30.5 L17,30.5 Q11,28.5 8,25 Z" fill="url(#dk-${uid})"/>
                    ${deckPlanks(15, 85, 25, 10)}
                    ${oarRow(17, 83, 15.5, 9, 'top')}
                    ${oarRow(17, 83, 34.5, 9, 'bottom')}
                    <line x1="50" y1="15.5" x2="50" y2="34.5" stroke="${wd}" stroke-width="1" opacity=".5"/>
                    <ellipse cx="50" cy="25" rx="5" ry="4" fill="url(#s1-${uid})" stroke="${ac}" stroke-width=".3" opacity=".8"/>
                    <line x1="50" y1="21" x2="50" y2="29" stroke="${ac}" stroke-width=".3" opacity=".4"/>
                    <line x1="45" y1="25" x2="55" y2="25" stroke="${ac}" stroke-width=".3" opacity=".4"/>
                    <rect x="30" y="23" width="3" height="4" rx=".8" fill="${wd}" stroke="${ac}" stroke-width=".3" opacity=".45"/>
                    <path d="M97,25 L100,24 L100,26 Z" fill="${ac}" opacity=".5"/>
                    <path d="M-4,25 L-6,24 L-6,26 Z" fill="${ac}" opacity=".3"/>
                    ${sunkDamage}
                </svg>`;
            })(),

            bireme: (() => {
                return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="h-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${h2}"/><stop offset="30%" stop-color="${h1}"/><stop offset="70%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                        </linearGradient>
                        <linearGradient id="dk-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${dk}" stop-opacity=".3"/><stop offset="50%" stop-color="${dk}" stop-opacity=".7"/><stop offset="100%" stop-color="${dk}" stop-opacity=".3"/>
                        </linearGradient>
                        <radialGradient id="s1-${uid}" cx=".5" cy=".5" r=".5">
                            <stop offset="0%" stop-color="${sl2}" stop-opacity=".9"/><stop offset="100%" stop-color="${sl}" stop-opacity=".7"/>
                        </radialGradient>
                    </defs>
                    <path d="M0,25 Q5,20 11,17.5 Q18,15.5 27,15 L73,15 Q82,15.5 89,17.5 Q95,20 100,25 Q95,30 89,32.5 Q82,34.5 73,35 L27,35 Q18,34.5 11,32.5 Q5,30 0,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".6" opacity=".3"/>
                    <path d="M3,25 Q7,21 13,18.5 Q19,16.5 28,16 L72,16 Q81,16.5 87,18.5 Q93,21 97,25 Q93,29 87,31.5 Q81,33.5 72,34 L28,34 Q19,33.5 13,31.5 Q7,29 3,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".8"/>
                    <path d="M1,25 L-2,25" stroke="${ac}" stroke-width="1.3" stroke-linecap="round"/>
                    <path d="M9,25 Q12,22 18,20 L82,20 Q88,22 91,25 Q88,28 82,30 L18,30 Q12,28 9,25 Z" fill="url(#dk-${uid})"/>
                    ${deckPlanks(16, 84, 25, 9)}
                    ${oarRow(18, 82, 16, 8, 'top')}
                    ${oarRow(18, 82, 34, 8, 'bottom')}
                    <line x1="50" y1="16" x2="50" y2="34" stroke="${wd}" stroke-width=".9" opacity=".5"/>
                    <ellipse cx="50" cy="25" rx="4.5" ry="3.5" fill="url(#s1-${uid})" stroke="${ac}" stroke-width=".3" opacity=".75"/>
                    <line x1="50" y1="21.5" x2="50" y2="28.5" stroke="${ac}" stroke-width=".3" opacity=".35"/>
                    <line x1="45.5" y1="25" x2="54.5" y2="25" stroke="${ac}" stroke-width=".3" opacity=".35"/>
                    <path d="M96,25 L99,24 L99,26 Z" fill="${ac}" opacity=".45"/>
                    <circle cx="8" cy="25" r="1" fill="${ac}" opacity=".25"/>
                    ${sunkDamage}
                </svg>`;
            })(),

            scout_galley: (() => {
                return `<svg viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="h-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${h2}"/><stop offset="30%" stop-color="${h1}"/><stop offset="70%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/>
                        </linearGradient>
                        <linearGradient id="dk-${uid}" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="${dk}" stop-opacity=".3"/><stop offset="50%" stop-color="${dk}" stop-opacity=".6"/><stop offset="100%" stop-color="${dk}" stop-opacity=".3"/>
                        </linearGradient>
                        <radialGradient id="s1-${uid}" cx=".5" cy=".5" r=".5">
                            <stop offset="0%" stop-color="${sl2}" stop-opacity=".85"/><stop offset="100%" stop-color="${sl}" stop-opacity=".65"/>
                        </radialGradient>
                    </defs>
                    <path d="M2,25 Q7,20 14,17.5 Q21,16 30,15.5 L70,15.5 Q79,16 86,17.5 Q93,20 98,25 Q93,30 86,32.5 Q79,34 70,34.5 L30,34.5 Q21,34 14,32.5 Q7,30 2,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".6" opacity=".3"/>
                    <path d="M5,25 Q9,21 15,18.5 Q22,17 31,16.5 L69,16.5 Q78,17 85,18.5 Q91,21 95,25 Q91,29 85,31.5 Q78,33 69,33.5 L31,33.5 Q22,33 15,31.5 Q9,29 5,25 Z" fill="url(#h-${uid})" stroke="${ac}" stroke-width=".7"/>
                    <path d="M3,25 L0,25" stroke="${ac}" stroke-width="1.2" stroke-linecap="round"/>
                    <path d="M11,25 Q14,22 20,20.5 L80,20.5 Q86,22 89,25 Q86,28 80,29.5 L20,29.5 Q14,28 11,25 Z" fill="url(#dk-${uid})"/>
                    ${deckPlanks(18, 82, 25, 7)}
                    ${oarRow(22, 78, 16.5, 6, 'top')}
                    ${oarRow(22, 78, 33.5, 6, 'bottom')}
                    <line x1="50" y1="16.5" x2="50" y2="33.5" stroke="${wd}" stroke-width=".8" opacity=".45"/>
                    <ellipse cx="50" cy="25" rx="3.5" ry="3" fill="url(#s1-${uid})" stroke="${ac}" stroke-width=".3" opacity=".7"/>
                    <path d="M94,25 L97,24 L97,26 Z" fill="${ac}" opacity=".4"/>
                    ${sunkDamage}
                </svg>`;
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

            const oarExtend = Math.round(cellH * 0.35);
            const overlayH = (orient === 'h' ? cellH : cellW) + oarExtend * 2;

            overlay.style.width = spanLen + 'px';
            overlay.style.height = overlayH + 'px';
            overlay.style.left = left + 'px';
            overlay.style.top = (top - oarExtend) + 'px';

            if (orient === 'v') {
                overlay.style.transformOrigin = `${oarExtend}px ${oarExtend}px`;
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
        const romeRemaining = this.romeFleet.filter(s => !s.sunk).length;
        const greeceRemaining = this.greeceFleet.filter(s => !s.sunk).length;
        this.romeShipsEl.textContent   = romeRemaining;
        this.greeceShipsEl.textContent = greeceRemaining;
        this.romeShotsEl.textContent   = this.romeShotCount;
        this.romeHitsEl.textContent    = this.romeHitCount;
        this.romeSunkEl.textContent    = 5 - greeceRemaining;
        this.greeceShotsEl.textContent = this.greeceShotCount;
        this.greeceHitsEl.textContent  = this.greeceHitCount;
        this.greeceSunkEl.textContent  = 5 - romeRemaining;
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
        this._hideArcher(this.archerRome);
        this._hideArcher(this.archerGreece);
    }

    _showArcher(archerEl) {
        archerEl.classList.remove('fading', 'releasing');
        archerEl.classList.add('drawing');
    }

    _releaseArcher(archerEl) {
        archerEl.classList.remove('drawing');
        archerEl.classList.add('releasing');
    }

    _hideArcher(archerEl) {
        archerEl.classList.remove('drawing', 'releasing');
        archerEl.classList.add('fading');
        setTimeout(() => archerEl.classList.remove('fading'), 400);
    }

    _getArcherBowTip(archerEl, direction) {
        const rect = archerEl.getBoundingClientRect();
        if (direction === 'right') {
            return { x: rect.left + rect.width * 0.92, y: rect.top + rect.height * 0.33 };
        } else {
            return { x: rect.left + rect.width * 0.08, y: rect.top + rect.height * 0.33 };
        }
    }

    _fireArrow(archerEl, targetCell, direction) {
        return new Promise((resolve) => {
            this._arrowCancelled = false;
            this._arrowResolve = resolve;

            const arrowSvg = document.getElementById('arrow-svg');
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            arrowSvg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);

            const bowTip = this._getArcherBowTip(archerEl, direction);
            const tgtRect = targetCell.getBoundingClientRect();
            const startX = bowTip.x;
            const startY = bowTip.y;
            const endX = tgtRect.left + tgtRect.width / 2;
            const endY = tgtRect.top + tgtRect.height / 2;

            const dist = Math.hypot(endX - startX, endY - startY);
            const arcHeight = Math.min(dist * 0.40, 160);

            const duration = 480 + Math.random() * 170;

            this.arrowLine.setAttribute('stroke', '#c8a960');
            this.arrowLine.setAttribute('marker-end', 'url(#arrowhead)');
            if (direction === 'right') {
                this.arrowLine.setAttribute('marker-start', 'url(#fl-r)');
            } else {
                this.arrowLine.setAttribute('marker-start', 'url(#fl-l)');
            }

            this.arrowLine.setAttribute('x1', String(startX));
            this.arrowLine.setAttribute('y1', String(startY));
            this.arrowLine.setAttribute('x2', String(startX));
            this.arrowLine.setAttribute('y2', String(startY));
            this.arrowLine.classList.add('flying');

            this._releaseArcher(archerEl);

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
                    this._hideArcher(archerEl);
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
        this.romeShotCount++;

        const targetCell = this.greeceBoardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);

        this._showArcher(this.archerRome);
        await this._delay(300);
        SoundEngine.arrowLaunch();
        await this._fireArrow(this.archerRome, targetCell, 'right');
        if (this.gameOver) return;

        const val = this.greeceData[r][c];
        if (val === 'ship') {
            this.romeHitCount++;
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
            this.playerMissCount++;

            if (this.playerMissCount % 3 === 0) {
                const insults = [
                    "Is that the best you've got?",
                    "Looks like you need more practice!",
                    "Even a blind archer shoots better!",
                    "The gods mock your aim!",
                    "Perhaps try closing your eyes next time?",
                    "Your ancestors weep at this display!",
                    "A child could aim better!",
                    "Neptune himself laughs at you!"
                ];
                const insult = insults[Math.floor(Math.random() * insults.length)];
                this._log(insult, 'insult-msg');
            } else {
                this._log('Splash\u2014miss!', 'miss-msg');
            }
            this._updateCounts();

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
        this.greeceShotCount++;

        const targetCell = this.romeBoardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);

        this._showArcher(this.archerGreece);
        await this._delay(300);
        SoundEngine.arrowLaunch();
        await this._fireArrow(this.archerGreece, targetCell, 'left');
        if (this.gameOver) return;

        const val = this.romeData[r][c];
        if (val === 'ship') {
            this.greeceHitCount++;
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
            this._updateCounts();

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

    _showInsult() {
        document.querySelectorAll('.insult-overlay').forEach(el => el.remove());

        const text = this._insults[this._insultIndex];
        this._insultIndex = (this._insultIndex + 1) % this._insults.length;

        const overlay = document.createElement('div');
        overlay.className = 'insult-overlay';
        overlay.innerHTML = `<div class="insult-box"><p>${text}</p></div>`;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.classList.add('insult-fade-out');
            overlay.addEventListener('animationend', () => overlay.remove());
        }, 2000);
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

    _createWaveElements(cell) {
        cell.textContent = '';
        const waves = document.createElement('div');
        waves.className = 'miss-waves';
        waves.innerHTML = '<div class="wave-1"></div><div class="wave-2"></div><div class="wave-3"></div>';
        const elapsed = Date.now() - (this._waveEpoch || Date.now());
        waves.children[0].style.animationDelay = -(elapsed % 3000) + 'ms';
        waves.children[1].style.animationDelay = -(elapsed % 4200) + 'ms';
        waves.children[2].style.animationDelay = -(elapsed % 2800) + 'ms';
        cell.appendChild(waves);
    }

    _updateAdjacentMisses(boardEl, data, r, c) {
        const dirs = [[-1, 0, 'top', 'bottom'], [1, 0, 'bottom', 'top'], [0, -1, 'left', 'right'], [0, 1, 'right', 'left']];
        const cell = boardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        for (const [dr, dc, dir, opp] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < this.SIZE && nc >= 0 && nc < this.SIZE && data[nr][nc] === 'miss') {
                if (cell) cell.classList.add('miss-adj-' + dir);
                const neighbor = boardEl.querySelector(`.cell[data-row="${nr}"][data-col="${nc}"]`);
                if (neighbor) neighbor.classList.add('miss-adj-' + opp);
            }
        }
    }

    _syncAdjacentMisses(boardEl, data) {
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (data[r][c] === 'miss') {
                    this._updateAdjacentMisses(boardEl, data, r, c);
                }
            }
        }
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NavalWar();
});
