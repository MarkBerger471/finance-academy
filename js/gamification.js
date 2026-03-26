// Gamification System — Badges, Streaks, Progress
const Gamification = {
    STREAK_KEY: 'finance_academy_streaks',
    BADGE_KEY: 'finance_academy_badges',
    KIDS: ['Luisa', 'Marlene', 'Carla'],

    // Badge definitions
    BADGES: [
        { id: 'first_step', icon: '🎯', name_de: 'Erster Schritt', name_en: 'First Step', name_fr: 'Premier pas', desc_de: 'Ersten Test abgeschlossen', desc_en: 'Completed first test', desc_fr: 'Premier test terminé', check: (kid, scores) => Gamification._completedChapters(kid, scores) >= 1 },
        { id: 'sparfuchs', icon: '🦊', name_de: 'Sparfuchs', name_en: 'Savings Fox', name_fr: 'Renard épargnant', desc_de: 'Kapitel 3 (Sparen) bestanden', desc_en: 'Passed Chapter 3 (Saving)', desc_fr: 'Chapitre 3 (Épargne) réussi', check: (kid, scores) => { const s = scores[`ch3_kid${kid}`]; return s && s.percentage >= 60; } },
        { id: 'bankprofi', icon: '🏦', name_de: 'Bankprofi', name_en: 'Banking Pro', name_fr: 'Pro bancaire', desc_de: 'Kapitel 4 (Banken) mit 80%+ bestanden', desc_en: 'Passed Chapter 4 (Banks) with 80%+', desc_fr: 'Chapitre 4 (Banques) réussi avec 80%+', check: (kid, scores) => { const s = scores[`ch4_kid${kid}`]; return s && s.percentage >= 80; } },
        { id: 'investorin', icon: '📈', name_de: 'Investorin', name_en: 'Investor', name_fr: 'Investisseuse', desc_de: 'Kapitel 6 und 7 bestanden', desc_en: 'Passed Chapters 6 and 7', desc_fr: 'Chapitres 6 et 7 réussis', check: (kid, scores) => { const s6 = scores[`ch6_kid${kid}`]; const s7 = scores[`ch7_kid${kid}`]; return s6 && s7 && s6.percentage >= 60 && s7.percentage >= 60; } },
        { id: 'halfway', icon: '⚡', name_de: 'Halbzeit', name_en: 'Halfway', name_fr: 'Mi-parcours', desc_de: '5 Kapitel abgeschlossen', desc_en: '5 chapters completed', desc_fr: '5 chapitres terminés', check: (kid, scores) => Gamification._completedChapters(kid, scores) >= 5 },
        { id: 'steuerfuchs', icon: '🧾', name_de: 'Steuerfuchs', name_en: 'Tax Expert', name_fr: 'Expert fiscal', desc_de: 'Kapitel 9 (Steuern) mit 80%+ bestanden', desc_en: 'Passed Chapter 9 (Taxes) with 80%+', desc_fr: 'Chapitre 9 (Impôts) réussi avec 80%+', check: (kid, scores) => { const s = scores[`ch9_kid${kid}`]; return s && s.percentage >= 80; } },
        { id: 'graduate', icon: '🎓', name_de: 'Absolventin', name_en: 'Graduate', name_fr: 'Diplômée', desc_de: 'Alle 16 Kapitel abgeschlossen', desc_en: 'All 16 chapters completed', desc_fr: 'Les 16 chapitres terminés', check: (kid, scores) => Gamification._completedChapters(kid, scores) >= 16 },
        { id: 'finance_queen', icon: '👑', name_de: 'Finance Queen', name_en: 'Finance Queen', name_fr: 'Reine des finances', desc_de: 'Alle Kapitel mit 90%+ bestanden', desc_en: 'All chapters passed with 90%+', desc_fr: 'Tous les chapitres réussis avec 90%+', check: (kid, scores) => { for (let c = 1; c <= 16; c++) { const s = scores[`ch${c}_kid${kid}`]; if (!s || s.percentage < 90) return false; } return true; } },
        { id: 'perfectionist', icon: '💎', name_de: 'Perfektionistin', name_en: 'Perfectionist', name_fr: 'Perfectionniste', desc_de: 'Ein Kapitel mit 100% bestanden', desc_en: 'Passed a chapter with 100%', desc_fr: 'Un chapitre réussi à 100%', check: (kid, scores) => { for (let ch = 1; ch <= 16; ch++) { const s = scores[`ch${ch}_kid${kid}`]; if (s && s.percentage === 100) return true; } return false; } },
        { id: 'streak3', icon: '🔥', name_de: '3-Tage-Streak', name_en: '3-Day Streak', name_fr: 'Série de 3 jours', desc_de: '3 Tage in Folge gelernt', desc_en: 'Learned 3 days in a row', desc_fr: '3 jours consécutifs', check: (kid, scores) => Gamification.getStreak(kid).best >= 3 },
        { id: 'streak7', icon: '🌟', name_de: '7-Tage-Streak', name_en: '7-Day Streak', name_fr: 'Série de 7 jours', desc_de: '7 Tage in Folge gelernt', desc_en: 'Learned 7 days in a row', desc_fr: '7 jours consécutifs', check: (kid, scores) => Gamification.getStreak(kid).best >= 7 },
    ],

    _completedChapters(kidIndex, scores) {
        let count = 0;
        for (let ch = 1; ch <= 16; ch++) {
            if (scores[`ch${ch}_kid${kidIndex}`]) count++;
        }
        return count;
    },

    // Streak system
    getStreaks() {
        const data = localStorage.getItem(this.STREAK_KEY);
        return data ? JSON.parse(data) : {};
    },

    getStreak(kidIndex) {
        const streaks = this.getStreaks();
        return streaks[kidIndex] || { current: 0, best: 0, lastDate: null };
    },

    recordActivity(kidIndex) {
        const streaks = this.getStreaks();
        const today = new Date().toISOString().split('T')[0];
        const streak = streaks[kidIndex] || { current: 0, best: 0, lastDate: null };

        if (streak.lastDate === today) return; // Already recorded today

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (streak.lastDate === yesterday) {
            streak.current++;
        } else {
            streak.current = 1;
        }
        streak.best = Math.max(streak.best, streak.current);
        streak.lastDate = today;
        streaks[kidIndex] = streak;
        localStorage.setItem(this.STREAK_KEY, JSON.stringify(streaks));
    },

    // Badge checking
    getEarnedBadges(kidIndex) {
        const scores = TestSystem.getScores();
        return this.BADGES.filter(b => b.check(kidIndex, scores));
    },

    getBadgeName(badge) {
        const l = Lang.get();
        return l === 'fr' ? badge.name_fr : l === 'en' ? badge.name_en : badge.name_de;
    },

    getBadgeDesc(badge) {
        const l = Lang.get();
        return l === 'fr' ? badge.desc_fr : l === 'en' ? badge.desc_en : badge.desc_de;
    },

    // Render badges for a kid
    renderBadges(kidIndex, compact) {
        const earned = this.getEarnedBadges(kidIndex);
        if (compact) {
            if (earned.length === 0) return '';
            return earned.map(b => `<span title="${this.getBadgeName(b)}: ${this.getBadgeDesc(b)}" class="text-lg cursor-help">${b.icon}</span>`).join('');
        }
        return this.BADGES.map(b => {
            const isEarned = earned.includes(b);
            return `
                <div class="glass-card rounded-xl p-3 text-center ${isEarned ? '' : 'opacity-30 grayscale'}" title="${this.getBadgeDesc(b)}">
                    <div class="text-2xl mb-1">${b.icon}</div>
                    <div class="text-xs font-semibold ${isEarned ? 'text-white' : 'text-gray-500'}">${this.getBadgeName(b)}</div>
                </div>
            `;
        }).join('');
    },

    // Render streak display
    renderStreak(kidIndex) {
        const streak = this.getStreak(kidIndex);
        const t = (de, en, fr) => {
            const l = Lang.get();
            return l === 'fr' && fr ? fr : l === 'en' ? en : de;
        };
        if (streak.current === 0 && streak.best === 0) return '';
        return `
            <div class="flex items-center gap-2 text-sm">
                <span class="text-orange-400">🔥 ${streak.current} ${t('Tage', 'days', 'jours')}</span>
                ${streak.best > streak.current ? `<span class="text-gray-500">(${t('Rekord', 'best', 'record')}: ${streak.best})</span>` : ''}
            </div>
        `;
    }
};

// Hook into TestSystem.saveScore to record streak activity
const _origSaveScore = TestSystem.saveScore.bind(TestSystem);
TestSystem.saveScore = function(chapter, kidIndex, score, total) {
    _origSaveScore(chapter, kidIndex, score, total);
    Gamification.recordActivity(kidIndex);
};
