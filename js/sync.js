// Firebase Realtime Sync Layer
// Replaces localStorage for shared data — syncs across all devices in real-time

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
    init(firebaseConfig) {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded — falling back to localStorage only');
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this._db = firebase.database();
        this._ready = true;

        // Set up real-time listeners for all synced keys
        this.SYNCED_KEYS.forEach(key => {
            const ref = this._db.ref('data/' + key);
            ref.on('value', snapshot => {
                const val = snapshot.val();
                if (val !== null && val !== undefined) {
                    // Update local cache and localStorage
                    const json = typeof val === 'string' ? val : JSON.stringify(val);
                    this._cache[key] = json;
                    localStorage.setItem(key, json);

                    // Notify listeners
                    if (this._listeners[key]) {
                        this._listeners[key].forEach(fn => fn(json));
                    }
                }
            });
        });

        // Show sync indicator
        this._showSyncStatus('connected');
    },

    // Get data — from cache, then localStorage as fallback
    get(key) {
        return this._cache[key] || localStorage.getItem(key);
    },

    // Set data — write to localStorage + Firebase
    set(key, value) {
        localStorage.setItem(key, value);
        this._cache[key] = value;

        if (this._ready && this.SYNCED_KEYS.includes(key)) {
            // Write to Firebase
            this._db.ref('data/' + key).set(value)
                .then(() => this._showSyncStatus('synced'))
                .catch(err => {
                    console.error('Sync error:', err);
                    this._showSyncStatus('error');
                });
        }
    },

    // Remove data
    remove(key) {
        localStorage.removeItem(key);
        delete this._cache[key];

        if (this._ready && this.SYNCED_KEYS.includes(key)) {
            this._db.ref('data/' + key).remove();
        }
    },

    // Register a listener for data changes
    onChange(key, fn) {
        if (!this._listeners[key]) this._listeners[key] = [];
        this._listeners[key].push(fn);
    },

    // Sync status indicator
    _syncEl: null,
    _hideTimeout: null,
    _showSyncStatus(status) {
        if (!this._syncEl) {
            this._syncEl = document.createElement('div');
            this._syncEl.style.cssText = 'position:fixed;bottom:1rem;right:1rem;z-index:9999;padding:0.4rem 0.8rem;border-radius:9999px;font-size:0.75rem;font-weight:600;transition:opacity 0.3s;pointer-events:none;backdrop-filter:blur(10px);';
            document.body.appendChild(this._syncEl);
        }
        const el = this._syncEl;
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
        this._hideTimeout = setTimeout(() => { el.style.opacity = '0'; }, 2500);
    },

    // Push all local data to Firebase (first-time setup)
    pushLocalToFirebase() {
        if (!this._ready) return;
        this.SYNCED_KEYS.forEach(key => {
            const local = localStorage.getItem(key);
            if (local) {
                this._db.ref('data/' + key).set(local);
            }
        });
    }
};

// Monkey-patch localStorage for synced keys so existing code works without changes
(function() {
    const origGetItem = localStorage.getItem.bind(localStorage);
    const origSetItem = localStorage.setItem.bind(localStorage);
    const origRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.getItem = function(key) {
        if (Sync.SYNCED_KEYS.includes(key)) {
            return Sync.get(key);
        }
        return origGetItem(key);
    };

    localStorage.setItem = function(key, value) {
        origSetItem(key, value);
        if (Sync.SYNCED_KEYS.includes(key)) {
            Sync.set(key, value);
        }
    };

    localStorage.removeItem = function(key) {
        origRemoveItem(key);
        if (Sync.SYNCED_KEYS.includes(key)) {
            Sync.remove(key);
        }
    };
})();
