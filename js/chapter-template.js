// Shared chapter page template generator
function generateChapterPage(config) {
    const { number, title, icon, color, prevChapter, nextChapter, sections, testQuestions } = config;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kapitel ${number}: ${title} - Finance Academy</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
        <div class="absolute top-1/3 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float-slow"></div>
        <div class="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float-slower"></div>
    </div>

    <nav class="fixed top-0 w-full z-50 glass-nav">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <a href="../index.html" class="flex items-center space-x-2">
                    <span class="text-2xl">💰</span>
                    <span class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Finance Academy</span>
                </a>
                <div class="hidden md:flex items-center space-x-4">
                    <a href="../index.html" class="nav-link">Home</a>
                    <a href="chapter1.html" class="nav-link active">Kapitel</a>
                    <a href="../tests/scoreboard.html" class="nav-link">Ergebnisse</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="pt-24 pb-16 px-4 relative z-10">
        <div class="max-w-4xl mx-auto">
            <div class="text-center mb-12 animate-fade-in">
                <span class="inline-block text-6xl mb-4">${icon}</span>
                <div class="inline-block px-4 py-1 glass-badge rounded-full text-sm text-${color}-400 mb-4">Kapitel ${number} von 10</div>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">${title}</h1>
                <div class="flex items-center justify-center gap-4 text-gray-400 text-sm">
                    <span>⏱ 1-1,5 Stunden</span>
                    <span>|</span>
                    <span>📝 ${testQuestions.length} Testfragen</span>
                </div>
                <div class="progress-bar max-w-md mx-auto mt-6">
                    <div class="progress-fill" style="width: ${number * 10}%"></div>
                </div>
                <p class="text-gray-500 text-xs mt-2">${number * 10}% des Kurses</p>
            </div>

            ${sections}

            <!-- Test Section -->
            <div class="content-section mt-12" id="test-section">
                <h2 class="text-3xl font-bold mb-2 text-center">📝 Kapitel-Test</h2>
                <p class="text-gray-400 text-center mb-8">Teste dein Wissen! Wähle zuerst deinen Namen und beantworte dann alle Fragen.</p>
                <div id="test-container"></div>
            </div>

            <!-- Chapter Navigation -->
            <div class="chapter-nav">
                ${prevChapter ? `<a href="chapter${prevChapter}.html">← Kapitel ${prevChapter}</a>` : '<div></div>'}
                <a href="../index.html">Übersicht</a>
                ${nextChapter ? `<a href="chapter${nextChapter}.html">Kapitel ${nextChapter} →</a>` : '<a href="../tests/scoreboard.html">Ergebnisse →</a>'}
            </div>
        </div>
    </main>

    <script src="../js/main.js"><\/script>
    <script>
        TestSystem.initTest(${number}, ${JSON.stringify(testQuestions)});
    <\/script>
</body>
</html>`;
}
