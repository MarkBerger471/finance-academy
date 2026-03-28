// Firebase Configuration
// Replace these values with your own Firebase project config
// Instructions: https://console.firebase.google.com → Create project → Realtime Database → Web app
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyA_4AHENg65AX7VyeSd9yRp6puv5akv_jg",
    authDomain: "finance-academy-5670a.firebaseapp.com",
    databaseURL: "https://finance-academy-5670a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "finance-academy-5670a",
    storageBucket: "finance-academy-5670a.firebasestorage.app",
    messagingSenderId: "809992763267",
    appId: "1:809992763267:web:fbac58909607a0545d28b6"
};

// Initialize sync after page loads
document.addEventListener('DOMContentLoaded', function() {
    if (FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY') {
        Sync.init(FIREBASE_CONFIG);

        // Re-render current page when synced data changes
        Sync.SYNCED_KEYS.forEach(function(key) {
            Sync.onChange(key, function() {
                try {
                    if (typeof window.render === 'function') window.render();
                } catch(e) {}
                try {
                    if (typeof TestSystem !== 'undefined' && TestSystem._render) TestSystem._render();
                } catch(e) {}
            });
        });
    }
});
