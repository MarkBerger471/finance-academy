// Language system
const Lang = {
    STORAGE_KEY: 'finance_academy_lang',

    get() {
        return localStorage.getItem(this.STORAGE_KEY) || 'de';
    },

    set(lang) {
        localStorage.setItem(this.STORAGE_KEY, lang);
        this.apply();
    },

    toggle() {
        const order = ['de', 'en', 'fr'];
        const next = order[(order.indexOf(this.get()) + 1) % order.length];
        this.set(next);
    },

    apply() {
        const lang = this.get();
        // Toggle language via class on <html> - CSS handles show/hide
        document.documentElement.setAttribute('data-lang', lang);
        // Update toggle buttons - show next language
        const labels = { de: '🇬🇧 EN', en: '🇫🇷 FR', fr: '🇩🇪 DE' };
        document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(btn => {
            btn.innerHTML = labels[lang] || '🇬🇧 EN';
        });
        // Re-render test if active
        if (TestSystem._render) {
            TestSystem._render();
        }
    }
};

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Apply language on load
    Lang.apply();

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
});

// Test system
const TestSystem = {
    KIDS: ['Luisa', 'Marlene', 'Carla'],
    STORAGE_KEY: 'finance_academy_scores',

    t(de, en, fr) {
        const lang = Lang.get();
        if (lang === 'fr' && fr) return fr;
        if (lang === 'en') return en;
        return de;
    },

    getScores() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    saveScore(chapter, kidIndex, score, total) {
        const scores = this.getScores();
        const key = `ch${chapter}_kid${kidIndex}`;
        scores[key] = { score, total, date: new Date().toISOString(), percentage: Math.round((score / total) * 100) };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
    },

    getScore(chapter, kidIndex) {
        const scores = this.getScores();
        return scores[`ch${chapter}_kid${kidIndex}`] || null;
    },

    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    initTest(chapter, questions) {
        let currentKid = 0;
        let answered = {};
        let difficulty = 'all'; // 'all', 'basis', 'advanced'

        const container = document.getElementById('test-container');
        if (!container) return;

        function getQ(q) {
            const lang = Lang.get();
            if (lang === 'fr' && q.question_fr) {
                return {
                    question: q.question_fr,
                    options: q.options_fr || q.options,
                    explanation: q.explanation_fr || q.explanation,
                    correct: q.correct
                };
            }
            if (lang === 'en' && q.question_en) {
                return {
                    question: q.question_en,
                    options: q.options_en || q.options,
                    explanation: q.explanation_en || q.explanation,
                    correct: q.correct
                };
            }
            return q;
        }

        const hasAdvanced = questions.some(q => q.difficulty === 'advanced');

        function renderKidSelector() {
            const difficultySelector = hasAdvanced ? `
                <div class="flex gap-2 justify-center mb-6">
                    <button class="difficulty-tab ${difficulty === 'all' ? 'active basis' : ''}" onclick="TestSystem._setDifficulty('all')">
                        ${TestSystem.t('Alle Fragen', 'All Questions', 'Toutes les questions')}
                    </button>
                    <button class="difficulty-tab basis ${difficulty === 'basis' ? 'active' : ''}" onclick="TestSystem._setDifficulty('basis')">
                        ${TestSystem.t('Basis', 'Basic', 'Base')}
                    </button>
                    <button class="difficulty-tab advanced ${difficulty === 'advanced' ? 'active' : ''}" onclick="TestSystem._setDifficulty('advanced')">
                        ${TestSystem.t('Fortgeschritten', 'Advanced', 'Avancé')}
                    </button>
                </div>
            ` : '';
            return `
                <div class="flex flex-wrap gap-3 justify-center mb-4">
                    ${TestSystem.KIDS.map((kid, i) => {
                        const existing = TestSystem.getScore(chapter, i);
                        const done = existing ? ` (${existing.percentage}%)` : '';
                        return `<button class="kid-tab ${i === currentKid ? 'active' : ''}" onclick="TestSystem._selectKid(${i})">${kid}${done}</button>`;
                    }).join('')}
                </div>
                ${difficultySelector}
            `;
        }

        function renderQuestions() {
            const existingScore = TestSystem.getScore(chapter, currentKid);
            if (existingScore) {
                return `
                    <div class="glass-card rounded-3xl p-8 text-center">
                        <div class="text-6xl mb-4">${existingScore.percentage >= 80 ? '🏆' : existingScore.percentage >= 60 ? '👍' : '📚'}</div>
                        <h3 class="text-2xl font-bold mb-2">${TestSystem.KIDS[currentKid]}</h3>
                        <p class="text-4xl font-bold mb-2">
                            <span class="${existingScore.percentage >= 80 ? 'text-green-400' : existingScore.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}">${existingScore.percentage}%</span>
                        </p>
                        <p class="text-gray-400 mb-6">${existingScore.score} ${TestSystem.t('von', 'of', 'sur')} ${existingScore.total} ${TestSystem.t('richtig', 'correct', 'correct(s)')}</p>
                        <button class="glass-button-primary px-6 py-3 rounded-xl" onclick="TestSystem._resetKid(${currentKid})">${TestSystem.t('Test wiederholen', 'Retake test', 'Refaire le test')}</button>
                    </div>
                `;
            }

            answered = {};
            const activeQuestions = difficulty === 'all' ? questions :
                questions.filter(q => (q.difficulty || 'basis') === difficulty);
            const displayQuestions = activeQuestions.length > 0 ? activeQuestions : questions;
            return displayQuestions.map((q, displayIdx) => {
                const qi = questions.indexOf(q);
                const lq = getQ(q);
                const diffBadge = q.difficulty === 'advanced' ? `<span class="text-xs text-purple-400 ml-2">[${TestSystem.t('Fortgeschritten', 'Advanced', 'Avancé')}]</span>` : '';
                return `
                <div class="question-card" id="q${qi}">
                    <p class="font-semibold mb-3 text-lg">${displayIdx + 1}. ${lq.question}${diffBadge}</p>
                    <div class="space-y-2">
                        ${lq.options.map((opt, oi) => `
                            <button class="answer-option" data-question="${qi}" data-option="${oi}" onclick="TestSystem._answer(${qi}, ${oi}, ${q.correct})">
                                ${String.fromCharCode(65 + oi)}) ${opt}
                            </button>
                        `).join('')}
                    </div>
                    <div id="explanation-${qi}" class="hidden mt-3 text-sm text-gray-400 italic"></div>
                </div>
            `}).join('') + `
                <div class="text-center mt-8">
                    <button id="submit-test" class="glass-button-primary px-8 py-4 rounded-2xl text-lg font-semibold opacity-50 cursor-not-allowed" disabled onclick="TestSystem._submit(${chapter}, ${currentKid})">
                        ${TestSystem.t('Test abgeben', 'Submit test', 'Soumettre le test')}
                    </button>
                    <p class="text-gray-500 text-sm mt-2" id="answer-count">0 ${TestSystem.t('von', 'of', 'sur')} ${displayQuestions.length} ${TestSystem.t('Fragen beantwortet', 'questions answered', 'questions répondues')}</p>
                </div>
            `;
        }

        function render() {
            container.innerHTML = renderKidSelector() + renderQuestions();
        }

        TestSystem._currentQuestions = questions;
        TestSystem._answered = answered;
        TestSystem._render = render;
        TestSystem._currentKid = currentKid;

        TestSystem._selectKid = function(i) {
            currentKid = i;
            TestSystem._currentKid = i;
            render();
        };

        TestSystem._setDifficulty = function(d) {
            difficulty = d;
            render();
        };

        TestSystem._answer = function(qi, oi, correct) {
            const btns = document.querySelectorAll(`[data-question="${qi}"]`);
            if (btns[0] && btns[0].classList.contains('disabled')) return;

            answered[qi] = oi;
            TestSystem._answered = answered;

            btns.forEach((btn, idx) => {
                btn.classList.add('disabled');
                if (idx === correct) {
                    btn.classList.add('correct-answer');
                }
                if (idx === oi && oi !== correct) {
                    btn.classList.add('wrong-answer');
                }
            });

            const card = document.getElementById(`q${qi}`);
            if (card) {
                card.classList.add(oi === correct ? 'correct' : 'incorrect');
            }

            const explanation = document.getElementById(`explanation-${qi}`);
            const lq = getQ(questions[qi]);
            if (explanation && lq.explanation) {
                explanation.textContent = lq.explanation;
                explanation.classList.remove('hidden');
            }

            const visibleQs = document.querySelectorAll('.question-card');
            const visibleCount = visibleQs.length;
            const count = Object.keys(answered).length;
            const countEl = document.getElementById('answer-count');
            if (countEl) countEl.textContent = `${count} ${TestSystem.t('von', 'of', 'sur')} ${visibleCount} ${TestSystem.t('Fragen beantwortet', 'questions answered', 'questions répondues')}`;

            const submitBtn = document.getElementById('submit-test');
            if (submitBtn && count === visibleCount) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                submitBtn.classList.add('animate-bounce');
            }
        };

        TestSystem._submit = function(ch, kid) {
            let score = 0;
            questions.forEach((q, i) => {
                if (answered[i] === q.correct) score++;
            });
            TestSystem.saveScore(ch, kid, score, questions.length);
            render();
        };

        TestSystem._resetKid = function(kid) {
            const scores = TestSystem.getScores();
            delete scores[`ch${chapter}_kid${kid}`];
            localStorage.setItem(TestSystem.STORAGE_KEY, JSON.stringify(scores));
            render();
        };

        render();
    }
};
