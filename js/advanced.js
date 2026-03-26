// Advanced Features: Notes, Bonus Sections, Quiz Difficulty

// Notes System — per-chapter notes stored in localStorage
const Notes = {
    STORAGE_KEY: 'finance_academy_notes',

    getAll() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    get(chapter) {
        return this.getAll()[`ch${chapter}`] || '';
    },

    save(chapter, text) {
        const notes = this.getAll();
        if (text.trim()) {
            notes[`ch${chapter}`] = text;
        } else {
            delete notes[`ch${chapter}`];
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    },

    render(chapter) {
        const t = (de, en, fr) => {
            const l = Lang.get();
            return l === 'fr' && fr ? fr : l === 'en' ? en : de;
        };
        const saved = this.get(chapter);
        return `
            <div class="notes-container">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-sm text-gray-300">
                        📝 ${t('Deine Notizen', 'Your Notes', 'Tes notes')}
                    </h4>
                    <span class="text-xs text-gray-500" id="notes-status"></span>
                </div>
                <textarea
                    class="notes-textarea"
                    id="chapter-notes"
                    placeholder="${t('Schreibe hier deine Notizen zu diesem Kapitel...', 'Write your notes for this chapter here...', 'Écris tes notes pour ce chapitre ici...')}"
                    oninput="Notes._onInput(${chapter})"
                >${saved}</textarea>
            </div>
        `;
    },

    _saveTimeout: null,
    _onInput(chapter) {
        const textarea = document.getElementById('chapter-notes');
        const status = document.getElementById('notes-status');
        if (!textarea) return;

        // Debounced auto-save
        clearTimeout(this._saveTimeout);
        if (status) status.textContent = '...';
        this._saveTimeout = setTimeout(() => {
            this.save(chapter, textarea.value);
            const t = (de, en, fr) => {
                const l = Lang.get();
                return l === 'fr' && fr ? fr : l === 'en' ? en : de;
            };
            if (status) status.textContent = t('Gespeichert', 'Saved', 'Enregistré');
            setTimeout(() => { if (status) status.textContent = ''; }, 2000);
        }, 500);
    }
};

// Bonus section toggle
function toggleBonus(el) {
    const section = el.closest('.bonus-section');
    if (section) section.classList.toggle('open');
}

// Family Challenge System
const FamilyChallenges = {
    STORAGE_KEY: 'finance_academy_challenges',

    CHALLENGES: [
        {
            id: 'budget_vacation',
            icon: '✈️',
            title_de: 'Familien-Urlaubsbudget',
            title_en: 'Family Vacation Budget',
            title_fr: 'Budget vacances en famille',
            desc_de: 'Plant zusammen ein realistisches Budget für euren nächsten Familienurlaub. Recherchiert Preise für Anreise, Unterkunft, Essen und Aktivitäten.',
            desc_en: 'Plan a realistic budget for your next family vacation together. Research prices for travel, accommodation, food and activities.',
            desc_fr: 'Planifiez ensemble un budget réaliste pour vos prochaines vacances en famille. Recherchez les prix du transport, de l\'hébergement, de la nourriture et des activités.',
        },
        {
            id: 'supermarket_compare',
            icon: '🛒',
            title_de: 'Supermarkt-Preisvergleich',
            title_en: 'Supermarket Price Comparison',
            title_fr: 'Comparaison de prix supermarché',
            desc_de: 'Vergleicht diese Woche die Preise von 5 Produkten in 3 verschiedenen Supermärkten. Wer findet den günstigsten Einkauf?',
            desc_en: 'Compare the prices of 5 products in 3 different supermarkets this week. Who finds the cheapest shopping?',
            desc_fr: 'Comparez les prix de 5 produits dans 3 supermarchés différents cette semaine. Qui trouve les courses les moins chères ?',
        },
        {
            id: 'etf_research',
            icon: '📊',
            title_de: 'ETF-Sparplan recherchieren',
            title_en: 'Research an ETF Savings Plan',
            title_fr: 'Rechercher un plan d\'épargne ETF',
            desc_de: 'Recherchiert gemeinsam, was ein ETF-Sparplan ist, welche Anbieter es gibt und was ein guter Einstieg wäre.',
            desc_en: 'Research together what an ETF savings plan is, which providers exist and what a good starting point would be.',
            desc_fr: 'Recherchez ensemble ce qu\'est un plan d\'épargne ETF, quels fournisseurs existent et quel serait un bon point de départ.',
        },
        {
            id: 'energy_savings',
            icon: '💡',
            title_de: 'Energiespar-Challenge',
            title_en: 'Energy Saving Challenge',
            title_fr: 'Défi économie d\'énergie',
            desc_de: 'Findet 5 Wege, wie eure Familie im nächsten Monat Energiekosten sparen kann. Schätzt, wie viel ihr sparen könntet.',
            desc_en: 'Find 5 ways your family can save on energy costs next month. Estimate how much you could save.',
            desc_fr: 'Trouvez 5 façons dont votre famille peut économiser sur les coûts d\'énergie le mois prochain. Estimez combien vous pourriez économiser.',
        },
        {
            id: 'insurance_check',
            icon: '🛡️',
            title_de: 'Versicherungs-Check',
            title_en: 'Insurance Check',
            title_fr: 'Vérification des assurances',
            desc_de: 'Geht gemeinsam eure Familienversicherungen durch. Welche habt ihr? Braucht ihr alle? Gibt es günstigere Alternativen?',
            desc_en: 'Go through your family insurances together. Which ones do you have? Do you need them all? Are there cheaper alternatives?',
            desc_fr: 'Passez en revue vos assurances familiales ensemble. Lesquelles avez-vous ? Avez-vous besoin de toutes ? Y a-t-il des alternatives moins chères ?',
        },
        {
            id: 'meal_planning',
            icon: '🍳',
            title_de: 'Wochenplan-Challenge',
            title_en: 'Meal Planning Challenge',
            title_fr: 'Défi planning repas',
            desc_de: 'Plant gemeinsam die Mahlzeiten für eine Woche und erstellt eine Einkaufsliste. Vergleicht die Kosten mit einer normalen Woche.',
            desc_en: 'Plan meals for a week together and create a shopping list. Compare the costs with a normal week.',
            desc_fr: 'Planifiez ensemble les repas pour une semaine et créez une liste de courses. Comparez les coûts avec une semaine normale.',
        },
    ],

    getCompleted() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    toggleComplete(id) {
        let completed = this.getCompleted();
        if (completed.includes(id)) {
            completed = completed.filter(c => c !== id);
        } else {
            completed.push(id);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completed));
    },

    getTitle(challenge) {
        const l = Lang.get();
        return l === 'fr' ? challenge.title_fr : l === 'en' ? challenge.title_en : challenge.title_de;
    },

    getDesc(challenge) {
        const l = Lang.get();
        return l === 'fr' ? challenge.desc_fr : l === 'en' ? challenge.desc_en : challenge.desc_de;
    }
};

// Bonus content per chapter (advanced sections for older teens)
const BonusContent = {
    chapters: {
        1: { title_de: 'Für Fortgeschrittene: Geldpolitik', title_en: 'Advanced: Monetary Policy', title_fr: 'Avancé : Politique monétaire',
             content_de: '<p>Die <strong>Geldmenge</strong> einer Volkswirtschaft wird von der Zentralbank gesteuert. Über den <strong>Leitzins</strong> beeinflusst die EZB, wie teuer es für Banken ist, sich Geld zu leihen. Niedrige Zinsen = mehr Geld im Umlauf = höheres Inflationsrisiko. Hohe Zinsen = weniger Geld im Umlauf = Wirtschaft kann sich verlangsamen.</p><p class="mt-2">Die <strong>M1, M2, M3 Geldmengen</strong> beschreiben verschiedene Stufen der Liquidität: M1 ist Bargeld + Sichteinlagen, M2 fügt Spareinlagen hinzu, M3 umfasst auch größere Termineinlagen.</p>',
             content_en: '<p>The <strong>money supply</strong> of an economy is controlled by the central bank. Through the <strong>key interest rate</strong>, the ECB influences how expensive it is for banks to borrow money. Low rates = more money in circulation = higher inflation risk. High rates = less money in circulation = economy may slow down.</p><p class="mt-2">The <strong>M1, M2, M3 money supplies</strong> describe different levels of liquidity: M1 is cash + sight deposits, M2 adds savings deposits, M3 also includes larger time deposits.</p>',
             content_fr: '<p>La <strong>masse monétaire</strong> d\'une économie est contrôlée par la banque centrale. À travers le <strong>taux directeur</strong>, la BCE influence le coût d\'emprunt pour les banques. Taux bas = plus d\'argent en circulation = risque d\'inflation plus élevé. Taux élevés = moins d\'argent = l\'économie peut ralentir.</p><p class="mt-2">Les <strong>agrégats monétaires M1, M2, M3</strong> décrivent différents niveaux de liquidité : M1 = espèces + dépôts à vue, M2 ajoute les dépôts d\'épargne, M3 inclut aussi les dépôts à terme.</p>' },
        3: { title_de: 'Für Fortgeschrittene: Die 50/30/20-Regel', title_en: 'Advanced: The 50/30/20 Rule', title_fr: 'Avancé : La règle 50/30/20',
             content_de: '<p>Die <strong>50/30/20-Regel</strong> ist ein bewährtes Budget-System: 50% für Bedürfnisse (Miete, Essen), 30% für Wünsche (Freizeit, Shopping), 20% zum Sparen und Investieren.</p><p class="mt-2">Für Teenager mit Taschengeld könnte das so aussehen: Bei 50€/Monat → 25€ für Notwendiges (Schulessen, Bus), 15€ für Spaß, 10€ sparen. Der Trick: <strong>Zuerst sparen, dann ausgeben</strong> ("Pay yourself first").</p>',
             content_en: '<p>The <strong>50/30/20 rule</strong> is a proven budget system: 50% for needs (rent, food), 30% for wants (leisure, shopping), 20% for saving and investing.</p><p class="mt-2">For teenagers with an allowance, this could look like: With 50€/month → 25€ for necessities (school lunch, bus), 15€ for fun, 10€ saved. The trick: <strong>Save first, then spend</strong> ("Pay yourself first").</p>',
             content_fr: '<p>La <strong>règle 50/30/20</strong> est un système de budget éprouvé : 50% pour les besoins (loyer, nourriture), 30% pour les envies (loisirs, shopping), 20% pour l\'épargne et l\'investissement.</p><p class="mt-2">Pour un ado avec de l\'argent de poche : avec 50€/mois → 25€ pour les nécessités, 15€ pour le plaisir, 10€ d\'épargne. L\'astuce : <strong>Épargner d\'abord, dépenser ensuite</strong>.</p>' },
        5: { title_de: 'Für Fortgeschrittene: Die 72er-Regel', title_en: 'Advanced: The Rule of 72', title_fr: 'Avancé : La règle de 72',
             content_de: '<p>Mit der <strong>72er-Regel</strong> kannst du schnell berechnen, wie lange es dauert, bis sich dein Geld verdoppelt: <strong>72 ÷ Zinssatz = Jahre bis zur Verdopplung</strong>.</p><p class="mt-2">Beispiele: Bei 3% Zinsen → 72÷3 = 24 Jahre. Bei 7% Rendite → 72÷7 ≈ 10 Jahre. Bei 12% → 72÷12 = 6 Jahre.</p><p class="mt-2">Das funktioniert auch umgekehrt für Inflation: Bei 3% Inflation halbiert sich die Kaufkraft deines Geldes in 24 Jahren!</p>',
             content_en: '<p>With the <strong>Rule of 72</strong> you can quickly calculate how long it takes for your money to double: <strong>72 ÷ interest rate = years to double</strong>.</p><p class="mt-2">Examples: At 3% interest → 72÷3 = 24 years. At 7% return → 72÷7 ≈ 10 years. At 12% → 72÷12 = 6 years.</p><p class="mt-2">This also works in reverse for inflation: At 3% inflation, the purchasing power of your money halves in 24 years!</p>',
             content_fr: '<p>Avec la <strong>règle de 72</strong>, tu peux calculer rapidement combien de temps il faut pour doubler ton argent : <strong>72 ÷ taux d\'intérêt = années pour doubler</strong>.</p><p class="mt-2">Exemples : À 3% → 72÷3 = 24 ans. À 7% → 72÷7 ≈ 10 ans. À 12% → 72÷12 = 6 ans.</p><p class="mt-2">Ça marche aussi pour l\'inflation : à 3% d\'inflation, le pouvoir d\'achat de ton argent est divisé par deux en 24 ans !</p>' },
        6: { title_de: 'Für Fortgeschrittene: Echte ETF-Auswahl', title_en: 'Advanced: Real ETF Selection', title_fr: 'Avancé : Sélection réelle d\'ETF',
             content_de: '<p>Die beliebtesten ETFs für Anfänger in Deutschland:</p><ul><li><strong>MSCI World</strong> — ca. 1.500 Unternehmen aus 23 Industrieländern. Der "Klassiker".</li><li><strong>MSCI All Country World (ACWI)</strong> — wie MSCI World, aber mit Schwellenländern (~3.000 Unternehmen).</li><li><strong>FTSE All-World</strong> — Alternative zum ACWI von Vanguard.</li></ul><p class="mt-2">Wichtige Kennzahlen: <strong>TER</strong> (Total Expense Ratio, jährliche Kosten, je niedriger desto besser, typisch 0,1-0,3%), <strong>Fondsgröße</strong> (>100 Mio. € ist gut), <strong>Replikation</strong> (physisch ist transparent, synthetisch kann günstiger sein).</p>',
             content_en: '<p>The most popular starter ETFs:</p><ul><li><strong>MSCI World</strong> — ~1,500 companies from 23 developed countries. The "classic".</li><li><strong>MSCI All Country World (ACWI)</strong> — like MSCI World, but including emerging markets (~3,000 companies).</li><li><strong>FTSE All-World</strong> — Vanguard\'s alternative to ACWI.</li></ul><p class="mt-2">Key metrics: <strong>TER</strong> (Total Expense Ratio, annual costs, lower is better, typically 0.1-0.3%), <strong>Fund size</strong> (>100M € is good), <strong>Replication</strong> (physical is transparent, synthetic can be cheaper).</p>',
             content_fr: '<p>Les ETF les plus populaires pour débuter :</p><ul><li><strong>MSCI World</strong> — ~1 500 entreprises de 23 pays développés. Le "classique".</li><li><strong>MSCI ACWI</strong> — comme le MSCI World, mais avec les marchés émergents (~3 000 entreprises).</li><li><strong>FTSE All-World</strong> — alternative de Vanguard.</li></ul><p class="mt-2">Indicateurs clés : <strong>TER</strong> (coûts annuels, plus bas = mieux, typiquement 0,1-0,3%), <strong>Taille du fonds</strong> (>100M € c\'est bien), <strong>Réplication</strong> (physique = transparente, synthétique = parfois moins chère).</p>' },
        8: { title_de: 'Für Fortgeschrittene: SCHUFA & Bonität', title_en: 'Advanced: Credit Scores', title_fr: 'Avancé : Score de crédit',
             content_de: '<p>Die <strong>SCHUFA</strong> (Schutzgemeinschaft für allgemeine Kreditsicherung) sammelt Daten über dein Zahlungsverhalten. Dein <strong>SCHUFA-Score</strong> (0-100%) beeinflusst, ob du Kredite, Mietverträge oder Handyverträge bekommst.</p><p class="mt-2"><strong>Was verbessert den Score:</strong> Rechnungen pünktlich zahlen, wenige Konten, keine offenen Mahnungen. <strong>Was schadet:</strong> Viele Kreditanfragen, unbezahlte Rechnungen, häufiger Kontowechsel.</p><p class="mt-2">Tipp: Du kannst einmal pro Jahr eine <strong>kostenlose SCHUFA-Selbstauskunft</strong> (Datenkopie nach Art. 15 DSGVO) anfordern auf meineschufa.de!</p>',
             content_en: '<p><strong>Credit scores</strong> track your payment behavior. In Germany, <strong>SCHUFA</strong> collects data and creates a score (0-100%) that influences whether you get loans, rental contracts, or phone contracts.</p><p class="mt-2"><strong>What improves your score:</strong> Pay bills on time, few accounts, no open reminders. <strong>What hurts:</strong> Many credit inquiries, unpaid bills, frequent account changes.</p><p class="mt-2">Tip: You can request a <strong>free SCHUFA self-disclosure</strong> once per year (data copy under GDPR Art. 15)!</p>',
             content_fr: '<p>Le <strong>score de crédit</strong> (SCHUFA en Allemagne) suit votre comportement de paiement. Ce score (0-100%) influence l\'obtention de crédits, contrats de location ou contrats téléphone.</p><p class="mt-2"><strong>Ce qui améliore le score :</strong> payer ses factures à temps, peu de comptes, pas de rappels. <strong>Ce qui nuit :</strong> beaucoup de demandes de crédit, factures impayées.</p><p class="mt-2">Astuce : tu peux demander une <strong>copie gratuite de tes données</strong> une fois par an (RGPD Art. 15) !</p>' },
        9: { title_de: 'Für Fortgeschrittene: Steuererklärung', title_en: 'Advanced: Tax Returns', title_fr: 'Avancé : Déclaration d\'impôts',
             content_de: '<p>Auch als Student oder Azubi kann sich eine <strong>Steuererklärung</strong> lohnen! Wenn du z.B. einen Ferienjob hattest, wurde wahrscheinlich Lohnsteuer einbehalten — die kannst du dir oft komplett zurückholen.</p><p class="mt-2"><strong>Was du absetzen kannst:</strong> Fahrtkosten zur Arbeit/Uni, Arbeitsmittel (Laptop für Studium), Fachliteratur, Bewerbungskosten. Software wie WISO Steuer oder Elster Online macht es einfach.</p><p class="mt-2">Der <strong>Grundfreibetrag 2026</strong> liegt bei ca. 12.000€ — bis dahin zahlst du als Ledige/r keine Einkommensteuer.</p>',
             content_en: '<p>Even as a student or trainee, filing a <strong>tax return</strong> can pay off! If you had a summer job, income tax was likely withheld — you can often get it all back.</p><p class="mt-2"><strong>What you can deduct:</strong> commuting costs, work equipment (laptop for studies), specialist literature, application costs. Software like WISO Steuer or Elster Online makes it easy.</p><p class="mt-2">The <strong>basic tax allowance 2026</strong> is about €12,000 — up to that amount, you don\'t pay income tax as a single person.</p>',
             content_fr: '<p>Même en tant qu\'étudiant ou apprenti, faire une <strong>déclaration d\'impôts</strong> peut être rentable ! Si tu as eu un job d\'été, l\'impôt sur le revenu a probablement été retenu — tu peux souvent le récupérer en totalité.</p><p class="mt-2"><strong>Ce que tu peux déduire :</strong> frais de transport, matériel de travail, littérature spécialisée, frais de candidature.</p>' },
    },

    getContent(chapter) {
        return this.chapters[chapter] || null;
    },

    renderHTML(chapter) {
        const bonus = this.getContent(chapter);
        if (!bonus) return '';
        const l = Lang.get();
        const title = l === 'fr' ? bonus.title_fr : l === 'en' ? bonus.title_en : bonus.title_de;
        const content = l === 'fr' ? bonus.content_fr : l === 'en' ? bonus.content_en : bonus.content_de;
        return `
            <div class="bonus-section" id="bonus-section">
                <div class="bonus-header" onclick="toggleBonus(this)">
                    <h4>🎓 ${title}</h4>
                    <svg class="bonus-chevron w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <div class="bonus-content">${content}</div>
            </div>
        `;
    }
};

// Auto-inject notes and bonus into chapter pages
document.addEventListener('DOMContentLoaded', () => {
    // Detect chapter number from URL
    const match = window.location.pathname.match(/chapter(\d+)\.html/);
    if (!match) return;
    const chapterNum = parseInt(match[1]);

    // Find the test section and inject notes + bonus before it
    const testSection = document.getElementById('test-section');
    if (!testSection) return;

    // Inject bonus section
    const bonusHTML = BonusContent.renderHTML(chapterNum);
    if (bonusHTML) {
        const bonusDiv = document.createElement('div');
        bonusDiv.innerHTML = bonusHTML;
        testSection.parentNode.insertBefore(bonusDiv.firstElementChild, testSection);
    }

    // Inject notes section after test
    const notesDiv = document.createElement('div');
    notesDiv.innerHTML = Notes.render(chapterNum);
    testSection.parentNode.insertBefore(notesDiv.firstElementChild, testSection.nextSibling);
});
