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

    _hitBuffer: null,

    _loadHitSound() {
        if (this._hitBuffer) return Promise.resolve();
        return fetch('assets/big-boom.wav')
            .then(r => r.arrayBuffer())
            .then(buf => this._ensureCtx().decodeAudioData(buf))
            .then(decoded => { this._hitBuffer = decoded; })
            .catch(() => {});
    },

    hit() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        if (this._hitBuffer) {
            const src = ctx.createBufferSource();
            src.buffer = this._hitBuffer;
            src.connect(ctx.destination);
            src.start(ctx.currentTime);
        } else {
            this._loadHitSound().then(() => {
                if (this._hitBuffer) {
                    const src = ctx.createBufferSource();
                    src.buffer = this._hitBuffer;
                    src.connect(ctx.destination);
                    src.start(ctx.currentTime);
                }
            });
        }
    },

    _missBuffer: null,

    _loadMissSound() {
        if (this._missBuffer) return Promise.resolve();
        return fetch('assets/water-splash.wav')
            .then(r => r.arrayBuffer())
            .then(buf => this._ensureCtx().decodeAudioData(buf))
            .then(decoded => { this._missBuffer = decoded; });
    },

    miss() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        if (this._missBuffer) {
            const src = ctx.createBufferSource();
            src.buffer = this._missBuffer;
            src.connect(ctx.destination);
            src.start(ctx.currentTime);
        } else {
            this._loadMissSound().then(() => {
                if (this._missBuffer) {
                    const src = ctx.createBufferSource();
                    src.buffer = this._missBuffer;
                    src.connect(ctx.destination);
                    src.start(ctx.currentTime);
                }
            });
        }
    },

    _sinkBuffer: null,

    _loadSinkSound() {
        if (this._sinkBuffer) return Promise.resolve();
        return fetch('assets/ship-sink.wav')
            .then(r => r.arrayBuffer())
            .then(buf => this._ensureCtx().decodeAudioData(buf))
            .then(decoded => { this._sinkBuffer = decoded; });
    },

    sink() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        if (this._sinkBuffer) {
            const src = ctx.createBufferSource();
            src.buffer = this._sinkBuffer;
            src.connect(ctx.destination);
            src.start(ctx.currentTime);
        } else {
            this._loadSinkSound().then(() => {
                if (this._sinkBuffer) {
                    const src = ctx.createBufferSource();
                    src.buffer = this._sinkBuffer;
                    src.connect(ctx.destination);
                    src.start(ctx.currentTime);
                }
            });
        }
    },

    _victoryBuffer: null,

    _loadVictorySound() {
        if (this._victoryBuffer) return Promise.resolve();
        return fetch('assets/crowd-applause.wav')
            .then(r => r.arrayBuffer())
            .then(buf => this._ensureCtx().decodeAudioData(buf))
            .then(decoded => { this._victoryBuffer = decoded; });
    },

    victory() {
        if (this.muted) return;
        const ctx = this._ensureCtx();
        if (this._victoryBuffer) {
            const src = ctx.createBufferSource();
            src.buffer = this._victoryBuffer;
            src.connect(ctx.destination);
            src.start(ctx.currentTime);
        } else {
            this._loadVictorySound().then(() => {
                if (this._victoryBuffer) {
                    const src = ctx.createBufferSource();
                    src.buffer = this._victoryBuffer;
                    src.connect(ctx.destination);
                    src.start(ctx.currentTime);
                }
            });
        }
    },

    warHorn() {
        if (this.muted) return;
        const audio = new Audio('assets/war-horn.wav');
        audio.play().catch(() => {});
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
        this.playerFaction = 'rome'; // rome | greece

        // ── DOM refs (splash) ──
        this.splashScreen    = document.getElementById('splash-screen');
        this.splashAudio     = document.getElementById('splash-audio');
        this.splashContinue  = document.getElementById('splash-continue-btn');

        // ── DOM refs (faction) ──
        this.factionScreen   = document.getElementById('faction-screen');

        // ── DOM refs (setup) ──
        this.setupScreen  = document.getElementById('setup-screen');
        this.battleScreen = document.getElementById('battle-screen');
        this.setupBoardEl = document.getElementById('setup-board');
        this.orientBtn    = document.getElementById('orient-btn');
        this.randomBtn    = document.getElementById('random-btn');
        this.clearBtn     = document.getElementById('clear-btn');
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

        this.consecutiveMisses = 0;
        this.usedInsults = new Set();
        this.insults = [
            "Your aim is worse than a blind archer!",
            "The gods mock your poor marksmanship!",
            "Even a child could aim better!",
            "Neptune himself laughs at your failure!",
            "Poseidon weeps at such incompetence!",
            "A drunken sailor could steer truer!",
            "The Spartans would disown you!",
            "Your arrows couldn't hit the Colossus of Rhodes!",
            "Odysseus found his way home faster than you find a ship!",
            "Zeus would strike you down for wasting his time!",
            "The oracle foresaw your defeat — and your poor aim!",
            "Even the Trojan Horse had better aim!",
            "Athena turns away in shame!",
            "You fight like a Persian tax collector!",
            "The Kraken yawns at your feeble attempts!",
            "Ares himself would desert your army!",
            "Your strategy rivals that of Xerxes at Salamis!",
            "The sirens wouldn't bother singing for you!",
            "Hephaestus could forge a better aim blindfolded!",
            "Even Icarus had a better sense of direction!"
        ];
        this.nextInsultThreshold = this._getRandomInsultThreshold();

        // Mute button
        this._createMuteBtn();

        // Setup state
        this.orientation = 'h';          // h | v
        this.setupData   = null;         // grid for placement
        this.setupFleet  = [];           // placed ships
        this.currentShipIdx = 0;         // index into FLEET being placed

        this._bindFaction();
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
       FACTION SELECTION
       ══════════════════════════════════════════ */

    _bindFaction() {
        document.querySelectorAll('.faction-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playerFaction = btn.dataset.faction;
                this.factionScreen.classList.add('hidden');
                this._showSetup();
            });
        });
    }

    _showFaction() {
        this.splashScreen.classList.add('hidden');
        this.factionScreen.classList.remove('hidden');
        this.setupScreen.classList.add('hidden');
        this.battleScreen.classList.add('hidden');
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

        // Clear all ships
        this.clearBtn.addEventListener('click', () => this._clearAllShips());

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
        let audioStarted = false;

        const goToFaction = () => {
            if (transitioned) return;
            transitioned = true;
            SoundEngine._loadHitSound();
            SoundEngine._loadMissSound();
            SoundEngine._loadSinkSound();
            SoundEngine._loadVictorySound();
            this._showFaction();
        };

        const tryPlay = () => {
            if (audioStarted) return;
            audioStarted = true;
            this.splashAudio.play().catch(() => {});
            cleanup();
        };

        const cleanup = () => {
            document.removeEventListener('click', tryPlay, true);
            document.removeEventListener('touchstart', tryPlay, true);
            document.removeEventListener('keydown', tryPlay, true);
        };

        this.splashAudio.addEventListener('ended', goToFaction, { once: true });
        this.splashContinue.addEventListener('click', goToFaction);

        this.splashAudio.play().then(() => {
            audioStarted = true;
        }).catch(() => {
            document.addEventListener('click', tryPlay, true);
            document.addEventListener('touchstart', tryPlay, true);
            document.addEventListener('keydown', tryPlay, true);
        });
    }

    _showSetup() {
        this.splashScreen.classList.add('hidden');
        this.factionScreen.classList.add('hidden');
        this.setupScreen.classList.remove('hidden');
        this.battleScreen.classList.add('hidden');

        const isGreece = this.playerFaction === 'greece';
        document.getElementById('fleet-title').textContent = isGreece ? 'Greek Fleet' : 'Roman Fleet';
        const setupBoardTitle = this.setupScreen.querySelector('.board-title');
        if (setupBoardTitle) setupBoardTitle.textContent = isGreece ? 'Greek Waters' : 'Rome Waters';
        const boardContainer = this.setupScreen.querySelector('.board-container');
        boardContainer.classList.toggle('rome-board-container', !isGreece);
        boardContainer.classList.toggle('greece-board-container', isGreece);
        const shipRack = document.getElementById('ship-rack');
        shipRack.classList.toggle('greece', isGreece);

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

    _clearAllShips() {
        this.setupData = this._emptyGrid();
        this.setupFleet = [];
        this.currentShipIdx = 0;

        const rackShips = document.querySelectorAll('.rack-ship');
        rackShips.forEach((el, i) => {
            el.classList.remove('placed', 'selected');
            if (i === 0) el.classList.add('selected');
        });

        this.startWarBtn.disabled = true;
        this._renderSetupBoard();
        SoundEngine.place();
    }

    _renderSetupBoard() {
        const isGreece = this.playerFaction === 'greece';
        this.setupBoardEl.innerHTML = '';
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell setup-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                if (this.setupData[r][c] === 'ship') cell.classList.add(isGreece ? 'ship-greece' : 'ship-rome');
                this.setupBoardEl.appendChild(cell);
            }
        }
        this._renderShipOverlays(this.setupBoardEl, this.setupFleet, false, isGreece, false);
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
        if (this.splashAudio) {
            this.splashAudio.pause();
            this.splashAudio.currentTime = 0;
        }
        const playerSetup = this.setupData.map(row => [...row]);
        const playerFleet = this.setupFleet.map(s => ({ ...s, positions: s.positions.map(p => [...p]), sunk: false }));

        if (this.playerFaction === 'greece') {
            this.greeceData  = playerSetup;
            this.greeceFleet = playerFleet;
            this.romeData    = this._emptyGrid();
            this.romeFleet   = [];
            this._placeFleetRandom(this.romeData, this.romeFleet);
        } else {
            this.romeData    = playerSetup;
            this.romeFleet   = playerFleet;
            this.greeceData  = this._emptyGrid();
            this.greeceFleet = [];
            this._placeFleetRandom(this.greeceData, this.greeceFleet);
        }

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
        this.greeceBoardEl.addEventListener('click', (e) => this._onBoardClick(e, true));
        this.romeBoardEl.addEventListener('click', (e) => this._onBoardClick(e, false));
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

        const playerIsGreece = this.playerFaction === 'greece';

        // Render boards: player board shows ships, enemy board is hidden
        this._renderBoard(this.romeBoardEl,   this.romeData,   this.romeFleet,   playerIsGreece, false);
        this._renderBoard(this.greeceBoardEl, this.greeceData, this.greeceFleet, !playerIsGreece, true);

        this._updateCounts();
        this._setTurn('rome');
        this.playerMissCount = 0;
        this.logEntriesEl.innerHTML = '';
        this._log('The fleets are assembled. Rome strikes first!');

        document.querySelectorAll('.game-over-overlay').forEach(el => el.remove());
        this._cancelArrow();

        if (playerIsGreece) {
            this.locked = true;
            this._delay(800).then(() => this._aiTurn());
        }
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

    _renderBoard(boardEl, data, fleet, isEnemy, isGreeceFaction) {
        boardEl.innerHTML = '';
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const val = data[r][c];
                if (isEnemy) {
                    cell.classList.add('enemy-cell');
                    if (val === 'hit')  { cell.classList.add('hit'); }
                    if (val === 'miss') { cell.classList.add('miss'); this._createWaveElements(cell); }
                } else {
                    if (val === 'ship') cell.classList.add(isGreeceFaction ? 'ship-greece' : 'ship-rome');
                    if (val === 'hit')  { cell.classList.add('hit'); }
                    if (val === 'miss') { cell.classList.add('miss'); this._createWaveElements(cell); }
                }
                boardEl.appendChild(cell);
            }
        }

        this._syncAdjacentMisses(boardEl, data);

        fleet.filter(s => s.sunk).forEach(s => {
            s.positions.forEach(([sr, sc]) => {
                const sunkCell = boardEl.querySelector(`.cell[data-row="${sr}"][data-col="${sc}"]`);
                if (sunkCell) sunkCell.classList.add('sunk');
            });
        });

        this._renderShipOverlays(boardEl, fleet, isEnemy, isGreeceFaction, false);
    }

    _refreshCell(boardEl, data, r, c, isEnemy, isGreeceFaction) {
        const cell = boardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (!cell) return;
        const val = data[r][c];
        cell.className = 'cell' + (isEnemy ? ' enemy-cell' : '');
        if (!isEnemy && val === 'ship') cell.classList.add(isGreeceFaction ? 'ship-greece' : 'ship-rome');
        if (val === 'hit')       { cell.classList.add('hit'); }
        else if (val === 'miss') { cell.classList.add('miss'); this._createWaveElements(cell); this._updateAdjacentMisses(boardEl, data, r, c); }
        else                     { cell.textContent = ''; }
    }

    _markSunk(boardEl, ship) {
        ship.positions.forEach(([sr, sc]) => {
            const cell = boardEl.querySelector(`.cell[data-row="${sr}"][data-col="${sc}"]`);
            if (cell) cell.classList.add('sunk');
        });
        const isGreeceBoard = (boardEl === this.greeceBoardEl);
        const fleet = isGreeceBoard ? this.greeceFleet : this.romeFleet;
        const isEnemy = (this.playerFaction === 'rome') ? isGreeceBoard : !isGreeceBoard;
        boardEl.querySelectorAll('.ship-overlay').forEach(el => el.remove());
        this._renderShipOverlays(boardEl, fleet, isEnemy, isGreeceBoard, false);
    }

    /* ── Ship SVG Overlays ── */

    _getShipSVG(shipId, length, isGreece, isSunk) {
        // ─── Dimensions ───
        // We define the SVG coordinate system such that height is always 50 units.
        // Width is proportional to length (approx 50 units per cell).
        const H = 50;
        const W = length * 50;
        const CY = H / 2; // Center Y

        // ─── Color Palettes ───
        const romeHull1 = isSunk ? '#3a0808' : '#701010';
        const romeHull2 = isSunk ? '#2a0505' : '#4a0000';
        const romeDeck  = isSunk ? '#2a1a0a' : '#6b3a1a';
        const romeGold  = isSunk ? '#4a3a10' : '#ffd700';
        const romeWood  = isSunk ? '#3a2010' : '#8b4513';
        const romeSail  = isSunk ? '#2a1010' : '#b32424';
        
        const greekHull1 = isSunk ? '#0a1a2e' : '#154360';
        const greekHull2 = isSunk ? '#081428' : '#0a2a40';
        const greekDeck  = isSunk ? '#1a2a3a' : '#cdb490'; 
        const greekBlue  = isSunk ? '#102030' : '#5dade2';
        const greekWood  = isSunk ? '#1a2a3a' : '#a0522d';
        const greekEye   = isSunk ? '#333'    : '#fdfefe';

        const h1 = isGreece ? greekHull1 : romeHull1;
        const h2 = isGreece ? greekHull2 : romeHull2;
        const dk = isGreece ? greekDeck : romeDeck;
        const ac = isGreece ? greekBlue : romeGold;
        const wd = isGreece ? greekWood : romeWood;
        const sl = isGreece ? greekBlue : romeSail;

        const uid = `${shipId}-${isGreece?'g':'r'}${isSunk?'s':''}`;

        // ─── Generators ───

        const oars = (cx, cy, count, widthSpan, side) => {
            let s = '';
            const yDir = side === 'top' ? -1 : 1;
            const startX = cx - widthSpan/2;
            const spacing = widthSpan / (count - 1 || 1);
            
            for(let i=0; i<count; i++) {
                const x = startX + i * spacing;
                const tipX = x - 3;
                const tipY = cy + yDir * 14;
                s += `<line x1="${x}" y1="${cy}" x2="${tipX}" y2="${tipY}" stroke="${wd}" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>`;
                s += `<line x1="${tipX}" y1="${tipY}" x2="${tipX-2}" y2="${tipY + yDir*3}" stroke="${wd}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>`;
            }
            return s;
        };

        const shields = (cx, cy, count, widthSpan, side) => {
            if (!isGreece && !isSunk) return ''; 
            let s = '';
            const yDir = side === 'top' ? -1 : 1;
            const startX = cx - widthSpan/2;
            const spacing = widthSpan / (count - 1 || 1);
            const y = cy + yDir * 5; 

            for(let i=0; i<count; i++) {
                const x = startX + i * spacing;
                if (isGreece) {
                    s += `<circle cx="${x}" cy="${y}" r="3" fill="#cd7f32" stroke="${h2}" stroke-width=".5"/>`;
                    s += `<circle cx="${x}" cy="${y}" r="1.2" fill="${ac}"/>`;
                } else {
                    s += `<rect x="${x-3}" y="${y-3.5}" width="6" height="7" fill="#b32424" stroke="${romeGold}" stroke-width=".5"/>`;
                    s += `<line x1="${x}" y1="${y-3.5}" x2="${x}" y2="${y+3.5}" stroke="${romeGold}" stroke-width=".5"/>`;
                }
            }
            return s;
        };

        const deck = (x, y, w, h) => `
            <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${dk}" opacity=".9"/>
            <line x1="${x}" y1="${CY}" x2="${x+w}" y2="${CY}" stroke="${h2}" stroke-width=".5" opacity=".3"/>
        `;

        const tower = (x) => {
            if (isGreece) return ''; 
            return `
                <rect x="${x-6}" y="${CY-6}" width="12" height="12" fill="${romeWood}" stroke="${romeGold}" stroke-width=".5"/>
                <rect x="${x-5}" y="${CY-5}" width="10" height="10" fill="none" stroke="#3a2010" stroke-width=".5" stroke-dasharray="2,1"/>
                <circle cx="${x}" cy="${CY}" r="2" fill="#111" opacity=".5"/>
            `;
        };

        const sail = (x) => `
            <line x1="${x}" y1="${CY-14}" x2="${x}" y2="${CY+14}" stroke="${wd}" stroke-width="2.5"/>
            <ellipse cx="${x}" cy="${CY}" rx="10" ry="5" fill="${sl}" stroke="${ac}" stroke-width="1"/>
        `;

        // ─── Render ───
        
        let content = '';
        
        // Prow (front) is at Right (width), Stern (back) is at 0
        const bowX = W - 2;
        const sternX = 2;
        const hullW = W - 10;
        
        const oarCount = Math.floor(length * 3.5); 
        const oarSpan = hullW * 0.8;
        const oarCX = W / 2;

        if (isGreece) {
            // Greek Hull: curved stern (aphlaston), battering ram
            content += `<defs><linearGradient id="g-hull-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${h2}"/><stop offset="50%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/></linearGradient></defs>`;
            
            // Oars
            content += oars(oarCX, CY-9, oarCount, oarSpan, 'top');
            content += oars(oarCX, CY+9, oarCount, oarSpan, 'bottom');

            // Hull
            content += `<path d="M${sternX},${CY-10} Q${sternX-5},${CY} ${sternX},${CY+10} L${sternX+15},${CY+14} L${bowX-15},${CY+14} Q${bowX},${CY} ${bowX-15},${CY-14} L${sternX+15},${CY-14} Z" fill="url(#g-hull-${uid})" stroke="${ac}" stroke-width="1"/>`;
            
            // Deck
            content += deck(sternX+15, CY-11, hullW-25, 22);
            
            // Eye (Ophthalmos)
            content += `<circle cx="${bowX-8}" cy="${CY-5}" r="2" fill="${greekEye}"/><circle cx="${bowX-7.5}" cy="${CY-5}" r=".7" fill="#000"/>`;
            content += `<circle cx="${bowX-8}" cy="${CY+5}" r="2" fill="${greekEye}"/><circle cx="${bowX-7.5}" cy="${CY+5}" r=".7" fill="#000"/>`;

            // Ram
            content += `<path d="M${bowX-5},${CY} L${bowX+4},${CY} L${bowX+1},${CY-3} M${bowX+4},${CY} L${bowX+1},${CY+3}" stroke="${h2}" stroke-width="2" fill="none"/>`;

            // Shields
            content += shields(oarCX, CY, Math.floor(length*2.5), hullW*0.7, 'top');
            content += shields(oarCX, CY, Math.floor(length*2.5), hullW*0.7, 'bottom');

            // Sail
            content += sail(W/2);

        } else {
            // Roman Hull: heavy, towers, corvus
            content += `<defs><linearGradient id="g-hull-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${h2}"/><stop offset="50%" stop-color="${h1}"/><stop offset="100%" stop-color="${h2}"/></linearGradient></defs>`;
            
            // Oars
            content += oars(oarCX, CY-10, oarCount, oarSpan, 'top');
            content += oars(oarCX, CY+10, oarCount, oarSpan, 'bottom');

            // Hull
            content += `<path d="M${sternX+5},${CY} Q${sternX+10},${CY-15} ${sternX+25},${CY-16} L${bowX-15},${CY-16} Q${bowX},${CY-14} ${bowX},${CY} Q${bowX},${CY+14} ${bowX-15},${CY+16} L${sternX+25},${CY+16} Q${sternX+10},${CY+15} ${sternX+5},${CY} Z" fill="url(#g-hull-${uid})" stroke="${h2}" stroke-width="1"/>`;
            
            // Deck
            content += deck(sternX+20, CY-12, hullW-35, 24);

            // Shields
            content += shields(oarCX, CY, Math.floor(length*2.5), hullW*0.7, 'top');
            content += shields(oarCX, CY, Math.floor(length*2.5), hullW*0.7, 'bottom');

            // Towers (for large ships)
            if (length >= 4) {
                content += tower(W*0.3);
                content += tower(W*0.7);
            } else if (length >= 3) {
                content += tower(W*0.6);
            }

            // Sail
            content += sail(W/2);

            // Ram (Square/heavy)
            content += `<path d="M${bowX-2},${CY} L${bowX+4},${CY-3} L${bowX+4},${CY+3} Z" fill="${romeGold}"/>`;
        }

        // Sunk damage overlay
        if (isSunk) {
            content += `
                <path d="M${W*0.2},10 L${W*0.3},40 M${W*0.5},8 L${W*0.4},42 M${W*0.8},12 L${W*0.85},38" stroke="#000" stroke-width="1.5" opacity=".6"/>
                <circle cx="${W*0.35}" cy="25" r="4" fill="#000" opacity=".4"/>
                <circle cx="${W*0.65}" cy="25" r="3" fill="#000" opacity=".4"/>
            `;
        }

        return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${content}</svg>`;
    }

    _getShipOrientation(ship) {
        if (ship.positions.length < 2) return 'h';
        return ship.positions[0][0] === ship.positions[1][0] ? 'h' : 'v';
    }

    _renderShipOverlays(boardEl, fleet, isEnemy, isGreeceFaction, forceShow) {
        boardEl.querySelectorAll('.ship-overlay').forEach(el => el.remove());

        for (const ship of fleet) {
            if (isEnemy && !ship.sunk && !forceShow) continue;

            const orient = this._getShipOrientation(ship);
            const startPos = ship.positions[0];
            const startCell = boardEl.querySelector(
                `.cell[data-row="${startPos[0]}"][data-col="${startPos[1]}"]`
            );
            if (!startCell) continue;

            const overlay = document.createElement('div');
            overlay.className = 'ship-overlay';
            overlay.classList.add(ship.sunk ? 'ship-overlay-sunk' : (isGreeceFaction ? 'ship-overlay-greece' : 'ship-overlay-rome'));
            if (orient === 'v') overlay.classList.add('ship-overlay-vertical');
            overlay.dataset.shipId = ship.id;
            overlay.dataset.shipLen = ship.length;
            overlay.innerHTML = this._getShipSVG(ship.id, ship.length, isGreeceFaction, ship.sunk);

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

            if (orient === 'v') {
                overlay.style.left = (left - oarExtend) + 'px';
                overlay.style.top = top + 'px';
                overlay.style.transformOrigin = `${oarExtend}px ${oarExtend}px`;
                overlay.style.transform = `rotate(90deg) translateY(-${cellW}px)`;
            } else {
                overlay.style.left = left + 'px';
                overlay.style.top = (top - oarExtend) + 'px';
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

    _getRandomInsultThreshold() {
        return Math.floor(Math.random() * 4) + 2;
    }

    _getNextInsult() {
        if (this.usedInsults.size >= this.insults.length) {
            this.usedInsults.clear();
        }
        const available = this.insults.filter((_, i) => !this.usedInsults.has(i));
        const pick = Math.floor(Math.random() * available.length);
        const index = this.insults.indexOf(available[pick]);
        this.usedInsults.add(index);
        return this.insults[index];
    }

    /* ══════════════════════════════════════════
       PLAYER ATTACK
       ══════════════════════════════════════════ */

    _onBoardClick(e, isGreeceBoard) {
        if (this.gameOver || this.locked || this.turn !== this.playerFaction) return;
        const isEnemyBoard = (this.playerFaction === 'rome') ? isGreeceBoard : !isGreeceBoard;
        if (!isEnemyBoard) return;
        const cell = e.target.closest('.cell');
        if (!cell || !cell.classList.contains('enemy-cell')) return;
        if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

        const r = +cell.dataset.row, c = +cell.dataset.col;
        this._executePlayerAttack(r, c);
    }

    async _executePlayerAttack(r, c) {
        this.locked = true;
        const isPlayerRome = this.playerFaction === 'rome';
        const enemyBoardEl = isPlayerRome ? this.greeceBoardEl : this.romeBoardEl;
        const enemyData = isPlayerRome ? this.greeceData : this.romeData;
        const enemyFleet = isPlayerRome ? this.greeceFleet : this.romeFleet;
        const archerEl = isPlayerRome ? this.archerRome : this.archerGreece;
        const arrowDir = isPlayerRome ? 'right' : 'left';
        const enemyIsGreece = isPlayerRome;

        if (isPlayerRome) { this.romeShotCount++; } else { this.greeceShotCount++; }

        const targetCell = enemyBoardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);

        this._showArcher(archerEl);
        await this._delay(300);
        SoundEngine.arrowLaunch();
        await this._fireArrow(archerEl, targetCell, arrowDir);
        if (this.gameOver) return;

        const val = enemyData[r][c];
        if (val === 'ship') {
            if (isPlayerRome) { this.romeHitCount++; } else { this.greeceHitCount++; }
            enemyData[r][c] = 'hit';
            this._refreshCell(enemyBoardEl, enemyData, r, c, true, enemyIsGreece);
            this._spawnImpactFlash(enemyBoardEl, r, c);
            this._log('Direct hit!', 'hit-msg');
            this.consecutiveMisses = 0;

            const sunkShip = this._checkSunk(enemyFleet, enemyData);
            if (sunkShip) {
                this._markSunk(enemyBoardEl, sunkShip);
                const isVictory = enemyFleet.every(s => s.sunk);
                if (isVictory) {
                    SoundEngine.victory();
                } else {
                    SoundEngine.sink();
                }
                this._log(`You sank the ${sunkShip.name}!`, 'sunk-msg');
                this._showSunkAnimation(sunkShip);
            } else {
                SoundEngine.hit();
            }
            this._updateCounts();
            if (this._checkVictory()) return;

            this.locked = false;
        } else {
            enemyData[r][c] = 'miss';
            this._refreshCell(enemyBoardEl, enemyData, r, c, true, enemyIsGreece);
            SoundEngine.miss();
            this._spawnSplash(enemyBoardEl, r, c);
            this._log('Splash\u2014miss!', 'miss-msg');

            this.consecutiveMisses++;
            if (this.consecutiveMisses >= this.nextInsultThreshold) {
                const insult = this._getNextInsult();
                this._log(insult, 'insult-msg');
                this._showInsult(insult);
                this.consecutiveMisses = 0;
                this.nextInsultThreshold = this._getRandomInsultThreshold();
            }
            this._updateCounts();

            const aiFaction = isPlayerRome ? 'greece' : 'rome';
            this._setTurn(aiFaction);
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

        const isPlayerRome = this.playerFaction === 'rome';
        const playerBoardEl = isPlayerRome ? this.romeBoardEl : this.greeceBoardEl;
        const playerData = isPlayerRome ? this.romeData : this.greeceData;
        const playerFleet = isPlayerRome ? this.romeFleet : this.greeceFleet;
        const archerEl = isPlayerRome ? this.archerGreece : this.archerRome;
        const arrowDir = isPlayerRome ? 'left' : 'right';
        const playerIsGreece = !isPlayerRome;
        const aiFaction = isPlayerRome ? 'Greece' : 'Rome';

        const [r, c] = this._aiPickTarget();
        this.aiShots.add(r * this.SIZE + c);
        if (isPlayerRome) { this.greeceShotCount++; } else { this.romeShotCount++; }

        const targetCell = playerBoardEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);

        this._showArcher(archerEl);
        await this._delay(300);
        SoundEngine.arrowLaunch();
        await this._fireArrow(archerEl, targetCell, arrowDir);
        if (this.gameOver) return;

        const val = playerData[r][c];
        if (val === 'ship') {
            if (isPlayerRome) { this.greeceHitCount++; } else { this.romeHitCount++; }
            playerData[r][c] = 'hit';
            this._refreshCell(playerBoardEl, playerData, r, c, false, playerIsGreece);
            this._spawnImpactFlash(playerBoardEl, r, c);
            this._log(`${aiFaction} scores a direct hit!`, 'hit-msg');
            this.consecutiveMisses = 0;

            this._aiRegisterHit(r, c);

            const sunkShip = this._checkSunk(playerFleet, playerData);
            if (sunkShip) {
                this._markSunk(playerBoardEl, sunkShip);
                const isVictory = playerFleet.every(s => s.sunk);
                if (isVictory) {
                    SoundEngine.victory();
                } else {
                    SoundEngine.sink();
                }
                this._log(`${aiFaction} sank your ${sunkShip.name}!`, 'sunk-msg');
                this._aiRegisterSunk(sunkShip);
                this._showSunkAnimation(sunkShip);
            } else {
                SoundEngine.hit();
            }
            this._updateCounts();
            if (this._checkVictory()) return;

            await this._delay(600);
            await this._aiTurn();
        } else {
            playerData[r][c] = 'miss';
            this._refreshCell(playerBoardEl, playerData, r, c, false, playerIsGreece);
            SoundEngine.miss();
            this._spawnSplash(playerBoardEl, r, c);
            this._log(`${aiFaction} missed!`, 'miss-msg');
            this._updateCounts();

            this._setTurn(this.playerFaction);
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
        const pData = this.playerFaction === 'rome' ? this.romeData : this.greeceData;
        const hitNeighbours = adj.filter(([ar, ac]) => pData[ar][ac] === 'hit');
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

        const playerIsGreece = this.playerFaction === 'greece';
        const enemyBoardEl = playerIsGreece ? this.romeBoardEl : this.greeceBoardEl;
        const enemyFleet = playerIsGreece ? this.romeFleet : this.greeceFleet;
        const enemyIsGreece = !playerIsGreece;
        this._renderShipOverlays(enemyBoardEl, enemyFleet, true, enemyIsGreece, true);

        const playerWon = winner === this.playerFaction;
        if (winner === 'rome') {
            this._log(playerWon ? '🏛️ VICTORY! Rome conquers the Greek fleet!' : '🏛️ DEFEAT! Rome has destroyed your fleet!', playerWon ? 'win-msg' : 'lose-msg');
            this._showOverlay('Rome Victorious!', 'The Greek fleet lies at the bottom of the sea.', playerWon);
        } else {
            this._log(playerWon ? '🏺 VICTORY! Greece destroys the Roman fleet!' : '🏺 DEFEAT! Greece has destroyed the Roman fleet!', playerWon ? 'win-msg' : 'lose-msg');
            this._showOverlay('Greece Prevails!', 'The Roman fleet has been vanquished.', playerWon);
        }
    }

    _showOverlay(title, subtitle, isWin) {
        document.querySelectorAll('.game-over-overlay').forEach(el => el.remove());

        const romeAcc = this.romeShotCount > 0 ? (this.romeHitCount / this.romeShotCount * 100).toFixed(1) + '%' : '0.0%';
        const greeceAcc = this.greeceShotCount > 0 ? (this.greeceHitCount / this.greeceShotCount * 100).toFixed(1) + '%' : '0.0%';
        const romeSunk = this.greeceFleet.filter(s => s.sunk).length;
        const greeceSunk = this.romeFleet.filter(s => s.sunk).length;
        const diffLabel = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-box ${isWin ? 'win' : 'lose'}">
                <h2>${title}</h2>
                <p>${subtitle}</p>
                <div class="game-over-stats">
                    <div class="stats-difficulty">Difficulty: ${diffLabel}</div>
                    <table class="stats-table">
                        <thead>
                            <tr><th></th><th>Rome</th><th>Greece</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Shots</td><td>${this.romeShotCount}</td><td>${this.greeceShotCount}</td></tr>
                            <tr><td>Hits</td><td>${this.romeHitCount}</td><td>${this.greeceHitCount}</td></tr>
                            <tr><td>Accuracy</td><td>${romeAcc}</td><td>${greeceAcc}</td></tr>
                            <tr><td>Ships Sunk</td><td>${romeSunk}</td><td>${greeceSunk}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="game-over-buttons">
                    <button id="overlay-view">🔍 View Battlefield</button>
                    <button id="overlay-restart">⚔️ Restart War</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#overlay-restart').addEventListener('click', () => {
            overlay.remove();
            this.restart();
        });
        overlay.querySelector('#overlay-view').addEventListener('click', () => {
            overlay.remove();
        });
    }

    _showInsult(text) {
        document.querySelectorAll('.insult-overlay').forEach(el => el.remove());

        if (!text) {
            text = this._getNextInsult();
        }

        const overlay = document.createElement('div');
        overlay.className = 'insult-overlay';
        overlay.innerHTML = `<div class="insult-box"><p>${text}</p></div>`;
        document.body.appendChild(overlay);

        const box = overlay.querySelector('.insult-box');
        const ENTER = 400;
        const HOLD = 2000;
        const EXIT = 600;
        const TOTAL = ENTER + HOLD + EXIT;
        const start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;

            if (elapsed < ENTER) {
                const t = elapsed / ENTER;
                const easeOut = 1 - Math.pow(1 - t, 3);
                box.style.transform = `scale(${0.3 + easeOut * 0.7})`;
                box.style.opacity = String(easeOut);
            } else if (elapsed < ENTER + HOLD) {
                const ht = (elapsed - ENTER) / HOLD;
                const pulse = 1 + Math.sin(ht * Math.PI * 3) * 0.02;
                box.style.transform = `scale(${pulse})`;
                box.style.opacity = '1';
            } else if (elapsed < TOTAL) {
                const t = (elapsed - ENTER - HOLD) / EXIT;
                const easeIn = t * t;
                box.style.transform = `scale(${1 - easeIn * 0.1}) translateY(${-easeIn * 40}px)`;
                box.style.opacity = String(1 - easeIn);
            } else {
                overlay.remove();
                return;
            }

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    _showSunkAnimation(ship) {
        document.querySelectorAll('.sunk-overlay').forEach(el => el.remove());

        const overlay = document.createElement('div');
        overlay.className = 'sunk-overlay';

        let bubbleHTML = '';
        for (let i = 0; i < 10; i++) {
            const left = 20 + Math.random() * 60;
            const bottom = -10 + Math.random() * 20;
            const delay = Math.random() * 1.2;
            const size = 4 + Math.random() * 5;
            bubbleHTML += `<div class="sunk-bubble-particle" style="left:${left}%;bottom:${bottom}%;animation-delay:${delay}s;width:${size}px;height:${size}px;"></div>`;
        }

        overlay.innerHTML = `
            <div class="sunk-overlay-bg"></div>
            <div class="sunk-overlay-content">
                <div class="sunk-ship-graphic">\u2693</div>
                <div class="sunk-ship-name">${ship.name}</div>
                <div class="sunk-ship-subtitle">has been sunk!</div>
                <div class="sunk-bubbles">${bubbleHTML}</div>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => overlay.remove(), 2700);
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
