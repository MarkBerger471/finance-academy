// Firebase Realtime Sync Layer
// Replaces localStorage for shared data — syncs across all devices in real-time

// Store original localStorage methods BEFORE patching
const _origLS = {
    getItem: localStorage.getItem.bind(localStorage),
    setItem: localStorage.setItem.bind(localStorage),
    removeItem: localStorage.removeItem.bind(localStorage),
};

const Sync = {
    _db: null,
    _ready: false,
    _listeners: {},
    _cache: {},

    // Keys that should be synced (shared across devices)
    SYNCED_KEYS: [
        'finance_academy_scores',
        'finance_academy_streaks',
        'finance_academy_notes',
        'finance_academy_challenges',
        'finance_academy_budget',
        'finance_academy_goals',
    ],

    // Initialize Firebase
    init: function(firebaseConfig) {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded');
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this._db = firebase.database();
        this._ready = true;

        // Push any existing local data to Firebase first
        var self = this;
        this.SYNCED_KEYS.forEach(function(key) {
            var local = _origLS.getItem(key);
            if (local) {
                self._db.ref('data/' + key).set(local);
            }
        });

        // Set up real-time listeners for all synced keys
        this.SYNCED_KEYS.forEach(function(key) {
            var ref = self._db.ref('data/' + key);
            ref.on('value', function(snapshot) {
                var val = snapshot.val();
                if (val !== null && val !== undefined) {
                    var json = typeof val === 'string' ? val : JSON.stringify(val);
                    self._cache[key] = json;
                    _origLS.setItem(key, json);

                    if (self._listeners[key]) {
                        self._listeners[key].forEach(function(fn) { fn(json); });
                    }
                }
            });
        });

        this._showSyncStatus('connected');
    },

    // Get data
    get: function(key) {
        return this._cache[key] || _origLS.getItem(key);
    },

    // Set data — write to real localStorage + Firebase
    set: function(key, value) {
        _origLS.setItem(key, value);
        this._cache[key] = value;

        if (this._ready && this.SYNCED_KEYS.indexOf(key) !== -1) {
            var self = this;
            this._db.ref('data/' + key).set(value)
                .then(function() { self._showSyncStatus('synced'); })
                .catch(function(err) {
                    console.error('Sync error:', err);
                    self._showSyncStatus('error');
                });
        }
    },

    // Remove data
    remove: function(key) {
        _origLS.removeItem(key);
        delete this._cache[key];

        if (this._ready && this.SYNCED_KEYS.indexOf(key) !== -1) {
            this._db.ref('data/' + key).remove();
        }
    },

    // Register a listener for data changes
    onChange: function(key, fn) {
        if (!this._listeners[key]) this._listeners[key] = [];
        this._listeners[key].push(fn);
    },

    // Sync status indicator
    _syncEl: null,
    _hideTimeout: null,
    _showSyncStatus: function(status) {
        if (!document.body) return;
        if (!this._syncEl) {
            this._syncEl = document.createElement('div');
            this._syncEl.style.cssText = 'position:fixed;bottom:1rem;right:1rem;z-index:9999;padding:0.4rem 0.8rem;border-radius:9999px;font-size:0.75rem;font-weight:600;transition:opacity 0.3s;pointer-events:none;backdrop-filter:blur(10px);';
            document.body.appendChild(this._syncEl);
        }
        var el = this._syncEl;
        clearTimeout(this._hideTimeout);

        if (status === 'connected') {
            el.textContent = '🔄 Sync connected';
            el.style.background = 'rgba(34,197,94,0.2)';
            el.style.color = '#4ade80';
            el.style.border = '1px solid rgba(34,197,94,0.3)';
        } else if (status === 'synced') {
            el.textContent = '✓ Synced';
            el.style.background = 'rgba(34,197,94,0.2)';
            el.style.color = '#4ade80';
            el.style.border = '1px solid rgba(34,197,94,0.3)';
        } else if (status === 'error') {
            el.textContent = '⚠ Sync error';
            el.style.background = 'rgba(239,68,68,0.2)';
            el.style.color = '#f87171';
            el.style.border = '1px solid rgba(239,68,68,0.3)';
        }
        el.style.opacity = '1';
        this._hideTimeout = setTimeout(function() { el.style.opacity = '0'; }, 2500);
    },

    // Push all local data to Firebase (manual trigger)
    pushLocalToFirebase: function() {
        if (!this._ready) return;
        var self = this;
        this.SYNCED_KEYS.forEach(function(key) {
            var local = _origLS.getItem(key);
            if (local) {
                self._db.ref('data/' + key).set(local);
            }
        });
    }
};

// Monkey-patch localStorage for synced keys so existing code works without changes
(function() {
    localStorage.getItem = function(key) {
        if (Sync.SYNCED_KEYS.indexOf(key) !== -1) {
            return Sync.get(key);
        }
        return _origLS.getItem(key);
    };

    localStorage.setItem = function(key, value) {
        _origLS.setItem(key, value);
        if (Sync.SYNCED_KEYS.indexOf(key) !== -1) {
            Sync.set(key, value);
        }
    };

    localStorage.removeItem = function(key) {
        _origLS.removeItem(key);
        if (Sync.SYNCED_KEYS.indexOf(key) !== -1) {
            Sync.remove(key);
        }
    };
})();
