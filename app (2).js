/* ═══════════════════════════════════════════════════════════════ */
/* PHARMARECIPE TRAINER — app.js                                  */
/* Vanilla JS SPA for pharmacology exam preparation               */
/* ═══════════════════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════════════════════════════════════════
// APP NAMESPACE & CONFIG
// ═══════════════════════════════════════════════════════════════

const App = {
  // Current state
  state: {
    currentView: 'dashboard',
    theme: 'dark',
    learnedIds: [],
    stats: {
      totalAnswered: 0,
      correctAnswers: 0,
      sessions: []
    },
    flashcard: {
      queue: [],
      currentIndex: 0,
      category: 'all',
      shuffle: false
    },
    quiz: {
      questions: [],
      currentIndex: 0,
      score: 0,
      answers: []
    },
    matching: {
      pairs: [],
      selected: null,
      found: 0,
      attempts: 0,
      startTime: null
    },
    write: {
      current: null,
      history: []
    },
    exam: {
      questions: [],
      currentIndex: 0,
      answers: [],
      startTime: null,
      timerInterval: null,
      timeLeft: 30 * 60 // 30 minutes in seconds
    }
  },

  // DOM cache
  dom: {},

  // Initialize application
  init() {
    this.loadState();
    this.cacheDOM();
    this.bindEvents();
    this.populateCategories();
    this.applyTheme();
    this.router();
    this.updateDashboard();
    console.log('🚀 PharmaRecipe Trainer initialized');
  },

  // Cache frequently accessed DOM elements
  cacheDOM() {
    this.dom = {
      navMenu: document.getElementById('navMenu'),
      navToggle: document.getElementById('navToggle'),
      mobileOverlay: document.getElementById('mobileOverlay'),
      themeToggle: document.getElementById('themeToggle'),
      mainContainer: document.getElementById('mainContainer'),

      // Dashboard
      statTotal: document.getElementById('statTotal'),
      statLearned: document.getElementById('statLearned'),
      statPercent: document.getElementById('statPercent'),
      statAccuracy: document.getElementById('statAccuracy'),
      activityList: document.getElementById('activityList'),

      // Flashcards
      fcCategory: document.getElementById('fcCategory'),
      fcShuffle: document.getElementById('fcShuffle'),
      fcReset: document.getElementById('fcReset'),
      fcProgressFill: document.getElementById('fcProgressFill'),
      fcProgressText: document.getElementById('fcProgressText'),
      flashcard: document.getElementById('flashcard'),
      fcFrontCategory: document.getElementById('fcFrontCategory'),
      fcFrontIndication: document.getElementById('fcFrontIndication'),
      fcBackCategory: document.getElementById('fcBackCategory'),
      fcBackDrug: document.getElementById('fcBackDrug'),
      fcBackLatin: document.getElementById('fcBackLatin'),
      fcBackRecipe: document.getElementById('fcBackRecipe'),
      fcBackNote: document.getElementById('fcBackNote'),
      fcShow: document.getElementById('fcShow'),
      fcKnow: document.getElementById('fcKnow'),
      fcAgain: document.getElementById('fcAgain'),

      // Quiz
      quizCategory: document.getElementById('quizCategory'),
      quizStart: document.getElementById('quizStart'),
      quizSetup: document.getElementById('quizSetup'),
      quizGame: document.getElementById('quizGame'),
      quizResults: document.getElementById('quizResults'),
      quizProgressFill: document.getElementById('quizProgressFill'),
      quizProgressText: document.getElementById('quizProgressText'),
      quizTypeBadge: document.getElementById('quizTypeBadge'),
      quizQuestion: document.getElementById('quizQuestion'),
      quizContext: document.getElementById('quizContext'),
      quizOptions: document.getElementById('quizOptions'),
      quizFeedback: document.getElementById('quizFeedback'),
      feedbackIcon: document.getElementById('feedbackIcon'),
      feedbackText: document.getElementById('feedbackText'),
      feedbackExplanation: document.getElementById('feedbackExplanation'),
      quizNext: document.getElementById('quizNext'),
      quizScore: document.getElementById('quizScore'),
      quizStats: document.getElementById('quizStats'),
      quizRestart: document.getElementById('quizRestart'),

      // Matching
      matchStart: document.getElementById('matchStart'),
      matchSetup: document.getElementById('matchingSetup'),
      matchGame: document.getElementById('matchingGame'),
      matchResults: document.getElementById('matchingResults'),
      matchPairsFound: document.getElementById('matchPairsFound'),
      matchPairsTotal: document.getElementById('matchPairsTotal'),
      matchBoard: document.getElementById('matchingBoard'),
      matchShuffle: document.getElementById('matchShuffle'),
      matchGiveUp: document.getElementById('matchGiveUp'),
      matchScore: document.getElementById('matchScore'),
      matchRestart: document.getElementById('matchRestart'),

      // Write
      writeCategory: document.getElementById('writeCategory'),
      writeStart: document.getElementById('writeStart'),
      writeSetup: document.getElementById('writeSetup'),
      writeGame: document.getElementById('writeGame'),
      writeIndication: document.getElementById('writeIndication'),
      writeDrug: document.getElementById('writeDrug'),
      writeLatin: document.getElementById('writeLatin'),
      writeRecipeInput: document.getElementById('writeRecipeInput'),
      writeHint: document.getElementById('writeHint'),
      writeCheck: document.getElementById('writeCheck'),
      writeNext: document.getElementById('writeNext'),
      writeFeedback: document.getElementById('writeFeedback'),
      writeFeedbackHeader: document.getElementById('writeFeedbackHeader'),
      writeFeedbackDetails: document.getElementById('writeFeedbackDetails'),
      writeCorrectRecipe: document.getElementById('writeCorrectRecipe'),

      // Exam
      examStart: document.getElementById('examStart'),
      examSetup: document.getElementById('examSetup'),
      examGame: document.getElementById('examGame'),
      examResults: document.getElementById('examResults'),
      examTimer: document.getElementById('examTimer'),
      examQuestionNum: document.getElementById('examQuestionNum'),
      examQuestion: document.getElementById('examQuestion'),
      examContext: document.getElementById('examContext'),
      examOptions: document.getElementById('examOptions'),
      examNext: document.getElementById('examNext'),
      examResultIcon: document.getElementById('examResultIcon'),
      examScore: document.getElementById('examScore'),
      examGrade: document.getElementById('examGrade'),
      examTimeSpent: document.getElementById('examTimeSpent'),
      breakdownList: document.getElementById('breakdownList'),
      examRestart: document.getElementById('examRestart'),

      // Recipes
      recipeSearch: document.getElementById('recipeSearch'),
      recipeFilter: document.getElementById('recipeFilter'),
      recipeSort: document.getElementById('recipeSort'),
      recipesCount: document.getElementById('recipesCount'),
      recipesGrid: document.getElementById('recipesGrid'),
      resetProgress: document.getElementById('resetProgress'),
      recipeModal: document.getElementById('recipeModal'),
      modalOverlay: document.getElementById('modalOverlay'),
      modalClose: document.getElementById('modalClose'),
      modalBody: document.getElementById('modalBody')
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT (localStorage)
  // ═══════════════════════════════════════════════════════════════

  loadState() {
    try {
      const saved = localStorage.getItem('pharmaRecipeState');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.learnedIds = parsed.learnedIds || [];
        this.state.stats = parsed.stats || { totalAnswered: 0, correctAnswers: 0, sessions: [] };
        this.state.theme = parsed.theme || 'dark';
      }
    } catch (e) {
      console.warn('Failed to load state:', e);
    }
  },

  saveState() {
    try {
      const toSave = {
        learnedIds: this.state.learnedIds,
        stats: this.state.stats,
        theme: this.state.theme
      };
      localStorage.setItem('pharmaRecipeState', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  },

  resetProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
      this.state.learnedIds = [];
      this.state.stats = { totalAnswered: 0, correctAnswers: 0, sessions: [] };
      this.saveState();
      this.updateDashboard();
      this.renderRecipes();
      this.showToast('🗑️ Прогресс сброшен');
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ROUTER & NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  bindEvents() {
    // Hash change routing
    window.addEventListener('hashchange', () => this.router());

    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        this.closeMobileMenu();
      });
    });

    // Mobile menu
    this.dom.navToggle.addEventListener('click', () => this.toggleMobileMenu());
    this.dom.mobileOverlay.addEventListener('click', () => this.closeMobileMenu());

    // Theme toggle
    this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());

    // Dashboard
    this.dom.resetProgress.addEventListener('click', () => this.resetProgress());

    // Flashcards
    this.dom.fcCategory.addEventListener('change', () => this.initFlashcards());
    this.dom.fcShuffle.addEventListener('change', () => this.initFlashcards());
    this.dom.fcReset.addEventListener('click', () => this.resetFlashcardProgress());
    this.dom.flashcard.addEventListener('click', () => this.flipFlashcard());
    this.dom.fcShow.addEventListener('click', () => this.flipFlashcard());
    this.dom.fcKnow.addEventListener('click', () => this.markFlashcardKnown());
    this.dom.fcAgain.addEventListener('click', () => this.markFlashcardAgain());

    // Quiz
    this.dom.quizStart.addEventListener('click', () => this.startQuiz());
    this.dom.quizNext.addEventListener('click', () => this.nextQuizQuestion());
    this.dom.quizRestart.addEventListener('click', () => this.restartQuiz());

    // Matching
    this.dom.matchStart.addEventListener('click', () => this.startMatching());
    this.dom.matchShuffle.addEventListener('click', () => this.shuffleMatching());
    this.dom.matchGiveUp.addEventListener('click', () => this.giveUpMatching());
    this.dom.matchRestart.addEventListener('click', () => this.restartMatching());

    // Write
    this.dom.writeStart.addEventListener('click', () => this.startWrite());
    this.dom.writeHint.addEventListener('click', () => this.showWriteHint());
    this.dom.writeCheck.addEventListener('click', () => this.checkWriteRecipe());
    this.dom.writeNext.addEventListener('click', () => this.nextWriteRecipe());

    // Exam
    this.dom.examStart.addEventListener('click', () => this.startExam());
    this.dom.examNext.addEventListener('click', () => this.nextExamQuestion());
    this.dom.examRestart.addEventListener('click', () => this.restartExam());

    // Recipes
    this.dom.recipeSearch.addEventListener('input', () => this.renderRecipes());
    this.dom.recipeFilter.addEventListener('change', () => this.renderRecipes());
    this.dom.recipeSort.addEventListener('change', () => this.renderRecipes());
    this.dom.modalOverlay.addEventListener('click', () => this.closeModal());
    this.dom.modalClose.addEventListener('click', () => this.closeModal());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Escape to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  router() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const viewMap = {
      'dashboard': 'view-dashboard',
      'flashcards': 'view-flashcards',
      'quiz': 'view-quiz',
      'matching': 'view-matching',
      'write': 'view-write',
      'exam': 'view-exam',
      'recipes': 'view-recipes'
    };

    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

    // Show target view
    const targetId = viewMap[hash];
    if (targetId) {
      document.getElementById(targetId).classList.remove('hidden');
      this.state.currentView = hash;

      // Update nav active state
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === hash);
      });

      // View-specific initialization
      if (hash === 'dashboard') this.updateDashboard();
      if (hash === 'recipes') this.renderRecipes();
      if (hash === 'flashcards') this.initFlashcards();

      window.scrollTo(0, 0);
    }
  },

  toggleMobileMenu() {
    this.dom.navMenu.classList.toggle('active');
    this.dom.navToggle.classList.toggle('active');
    this.dom.mobileOverlay.classList.toggle('active');
    document.body.style.overflow = this.dom.navMenu.classList.contains('active') ? 'hidden' : '';
  },

  closeMobileMenu() {
    this.dom.navMenu.classList.remove('active');
    this.dom.navToggle.classList.remove('active');
    this.dom.mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  // ═══════════════════════════════════════════════════════════════
  // THEME MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.saveState();
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.dom.themeToggle.querySelector('.theme-icon').textContent = 
      this.state.theme === 'dark' ? '☀️' : '🌙';
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY POPULATION
  // ═══════════════════════════════════════════════════════════════

  populateCategories() {
    const selects = [
      this.dom.fcCategory,
      this.dom.quizCategory,
      this.dom.writeCategory,
      this.dom.recipeFilter
    ];

    CATEGORIES.forEach(cat => {
      selects.forEach(select => {
        if (select) {
          const option = document.createElement('option');
          option.value = cat;
          option.textContent = cat;
          select.appendChild(option);
        }
      });
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  updateDashboard() {
    const total = RECIPES.length;
    const learned = this.state.learnedIds.length;
    const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
    const accuracy = this.state.stats.totalAnswered > 0 
      ? Math.round((this.state.stats.correctAnswers / this.state.stats.totalAnswered) * 100) 
      : 0;

    this.dom.statTotal.textContent = total;
    this.dom.statLearned.textContent = learned;
    this.dom.statPercent.textContent = percent + '%';
    this.dom.statAccuracy.textContent = accuracy + '%';

    // Recent activity
    this.renderActivity();
  },

  renderActivity() {
    const sessions = this.state.stats.sessions.slice(-5).reverse();

    if (sessions.length === 0) {
      this.dom.activityList.innerHTML = '<p class="empty-state">Начните обучение, чтобы увидеть прогресс</p>';
      return;
    }

    this.dom.activityList.innerHTML = sessions.map(s => {
      const date = new Date(s.date);
      const timeStr = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const score = Math.round((s.correct / s.total) * 100);

      let icon = '📝';
      if (s.type === 'exam') icon = '🎓';
      else if (s.type === 'quiz') icon = '❓';
      else if (s.type === 'matching') icon = '🔗';
      else if (s.type === 'write') icon = '✍️';

      return `
        <div class="activity-item">
          <div class="activity-icon">${icon}</div>
          <div class="activity-content">
            <div class="activity-title">${s.name} — ${s.correct}/${s.total} правильно</div>
            <div class="activity-time">${timeStr}</div>
          </div>
          <div class="activity-score">${score}%</div>
        </div>
      `;
    }).join('');
  },

  addSession(type, name, correct, total) {
    this.state.stats.sessions.push({
      type, name, correct, total,
      date: new Date().toISOString()
    });
    // Keep only last 20 sessions
    if (this.state.stats.sessions.length > 20) {
      this.state.stats.sessions = this.state.stats.sessions.slice(-20);
    }
    this.saveState();
  },

  // ═══════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 12px 24px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      font-weight: 500;
      animation: slideUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },

  handleKeyboard(e) {
    // Flashcard shortcuts
    if (this.state.currentView === 'flashcards') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.flipFlashcard();
      } else if (e.key === '1' || e.key === 'ArrowLeft') {
        this.markFlashcardAgain();
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        this.markFlashcardKnown();
      }
    }

    // Quiz shortcuts
    if (this.state.currentView === 'quiz' && !this.dom.quizFeedback.classList.contains('hidden')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.nextQuizQuestion();
      }
    }

    // Exam shortcuts
    if (this.state.currentView === 'exam') {
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key) - 1;
        const options = this.dom.examOptions.querySelectorAll('.exam-option');
        if (options[idx]) {
          options.forEach(o => o.classList.remove('selected'));
          options[idx].classList.add('selected');
        }
      } else if (e.key === 'Enter') {
        this.nextExamQuestion();
      }
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// FLASHCARDS MODULE
// ═══════════════════════════════════════════════════════════════

App.initFlashcards = function() {
  const category = this.dom.fcCategory.value;
  const shuffle = this.dom.fcShuffle.checked;

  let queue = category === 'all' 
    ? [...RECIPES] 
    : RECIPES.filter(r => r.category === category);

  if (shuffle) {
    queue = this.shuffleArray(queue);
  }

  this.state.flashcard = {
    queue,
    currentIndex: 0,
    category,
    shuffle
  };

  this.renderFlashcard();
};

App.renderFlashcard = function() {
  const { queue, currentIndex } = this.state.flashcard;

  if (queue.length === 0) {
    this.dom.fcFrontIndication.textContent = 'Нет рецептов в выбранной категории';
    this.dom.fcFrontCategory.textContent = '';
    return;
  }

  if (currentIndex >= queue.length) {
    // Finished
    this.dom.fcFrontIndication.textContent = '🎉 Вы просмотрели все карточки!';
    this.dom.fcFrontCategory.textContent = 'Готово';
    this.dom.flashcard.classList.remove('flipped');
    this.dom.fcShow.classList.add('hidden');
    this.dom.fcKnow.classList.add('hidden');
    this.dom.fcAgain.classList.add('hidden');
    this.updateProgress(100);
    return;
  }

  const recipe = queue[currentIndex];
  const isLearned = this.state.learnedIds.includes(recipe.id);

  // Reset flip
  this.dom.flashcard.classList.remove('flipped');

  // FRONT: Only indication
  this.dom.fcFrontCategory.textContent = recipe.category;
  this.dom.fcFrontIndication.textContent = recipe.indication;

  // BACK: Drug + Latin + Recipe + Note
  this.dom.fcBackCategory.textContent = recipe.category;
  this.dom.fcBackDrug.textContent = recipe.drug;
  this.dom.fcBackLatin.textContent = recipe.latinName;
  this.dom.fcBackRecipe.textContent = recipe.recipe;
  this.dom.fcBackNote.textContent = recipe.note;

  // Buttons
  this.dom.fcShow.classList.remove('hidden');
  this.dom.fcKnow.classList.remove('hidden');
  this.dom.fcAgain.classList.remove('hidden');

  if (isLearned) {
    this.dom.fcKnow.textContent = '✅ Уже выучено';
    this.dom.fcKnow.disabled = true;
  } else {
    this.dom.fcKnow.textContent = '✅ Знаю';
    this.dom.fcKnow.disabled = false;
  }

  // Progress
  const progress = ((currentIndex) / queue.length) * 100;
  this.updateProgress(progress);
  this.dom.fcProgressText.textContent = `${currentIndex + 1} / ${queue.length}`;
};

App.updateProgress = function(percent) {
  this.dom.fcProgressFill.style.width = percent + '%';
};

App.flipFlashcard = function() {
  if (this.state.flashcard.currentIndex >= this.state.flashcard.queue.length) return;
  this.dom.flashcard.classList.toggle('flipped');
  this.dom.fcShow.classList.add('hidden');
};

App.markFlashcardKnown = function() {
  const { queue, currentIndex } = this.state.flashcard;
  if (currentIndex >= queue.length) return;

  const recipe = queue[currentIndex];
  if (!this.state.learnedIds.includes(recipe.id)) {
    this.state.learnedIds.push(recipe.id);
    this.saveState();
  }

  this.state.flashcard.currentIndex++;
  this.renderFlashcard();
  this.updateDashboard();
};

App.markFlashcardAgain = function() {
  const { queue, currentIndex } = this.state.flashcard;
  if (currentIndex >= queue.length) return;

  // Remove from learned if present
  const recipe = queue[currentIndex];
  this.state.learnedIds = this.state.learnedIds.filter(id => id !== recipe.id);
  this.saveState();

  // Move to end of queue for repetition
  const current = queue.splice(currentIndex, 1)[0];
  queue.push(current);

  this.renderFlashcard();
  this.updateDashboard();
};

App.resetFlashcardProgress = function() {
  if (confirm('Сбросить прогресс карточек?')) {
    this.state.flashcard.currentIndex = 0;
    this.initFlashcards();
    this.showToast('🔄 Прогресс карточек сброшен');
  }
};

// ═══════════════════════════════════════════════════════════════
// QUIZ MODULE
// ═══════════════════════════════════════════════════════════════

App.startQuiz = function() {
  const count = parseInt(document.querySelector('input[name="quizCount"]:checked').value);
  const category = this.dom.quizCategory.value;

  let pool = category === 'all' ? [...RECIPES] : RECIPES.filter(r => r.category === category);
  pool = this.shuffleArray(pool);

  const selected = pool.slice(0, Math.min(count, pool.length));
  const questions = selected.map(recipe => this.generateQuestion(recipe));

  this.state.quiz = {
    questions,
    currentIndex: 0,
    score: 0,
    answers: []
  };

  this.dom.quizSetup.classList.add('hidden');
  this.dom.quizResults.classList.add('hidden');
  this.dom.quizGame.classList.remove('hidden');

  this.renderQuizQuestion();
};

App.generateQuestion = function(recipe) {
  const types = ['indication_to_drug', 'recipe_select', 'recipe_write'];
  const type = types[Math.floor(Math.random() * types.length)];
  const distractors = getDistractors(recipe.id, 3);

  switch (type) {
    case 'indication_to_drug':
      return {
        type: 'indication_to_drug',
        typeName: 'Показание → Препарат',
        question: `Какое средство назначают при данном показании?\n"${recipe.indication}"`,
        context: `Выберите правильный препарат`,
        correct: recipe.drug,
        options: this.shuffleArray([recipe.drug, ...distractors.map(d => d.drug)]),
        explanation: `Правильный ответ: ${recipe.drug}. ${recipe.note}`,
        recipe: recipe
      };

    case 'recipe_select':
      return {
        type: 'recipe_select',
        typeName: 'Выбор рецепта',
        question: `Выберите правильный рецепт для препарата "${recipe.drug}" (${recipe.latinName})`,
        context: `Показание: ${recipe.indication}`,
        correct: recipe.recipe,
        options: this.shuffleArray([recipe.recipe, ...distractors.map(d => d.recipe)]),
        explanation: `Правильный рецепт:\n${recipe.recipe}`,
        recipe: recipe
      };

    case 'recipe_write':
      return {
        type: 'recipe_write',
        typeName: 'Форма выписки',
        question: `Как правильно выписывается препарат "${recipe.drug}"?`,
        context: `Показание: ${recipe.indication} | Форма: ${recipe.form} | Путь: ${recipe.route}`,
        correct: `${recipe.form} — ${recipe.route}`,
        options: this.shuffleArray([
          `${recipe.form} — ${recipe.route}`,
          ...distractors.slice(0, 3).map(d => `${d.form} — ${d.route}`)
        ]),
        explanation: `Правильно: ${recipe.form} — ${recipe.route}. Полный рецепт:\n${recipe.recipe}`,
        recipe: recipe
      };
  }
};

App.renderQuizQuestion = function() {
  const { questions, currentIndex } = this.state.quiz;
  const q = questions[currentIndex];

  // Progress
  const progress = ((currentIndex) / questions.length) * 100;
  this.dom.quizProgressFill.style.width = progress + '%';
  this.dom.quizProgressText.textContent = `${currentIndex + 1} / ${questions.length}`;

  // Question
  this.dom.quizTypeBadge.textContent = q.typeName;
  this.dom.quizQuestion.textContent = q.question;
  this.dom.quizContext.textContent = q.context;

  // Options
  this.dom.quizOptions.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('div');
    btn.className = 'quiz-option';
    btn.innerHTML = `
      <div class="option-letter">${String.fromCharCode(65 + idx)}</div>
      <div class="option-text">${this.escapeHtml(opt).replace(/\n/g, '<br>')}</div>
    `;
    btn.addEventListener('click', () => this.selectQuizOption(btn, opt, q));
    this.dom.quizOptions.appendChild(btn);
  });

  // Reset feedback
  this.dom.quizFeedback.classList.add('hidden');
  this.dom.quizNext.classList.add('hidden');
};

App.selectQuizOption = function(btn, selected, question) {
  // Prevent multiple selections
  if (this.dom.quizFeedback.classList.contains('hidden') === false) return;

  const isCorrect = selected === question.correct;
  const options = this.dom.quizOptions.querySelectorAll('.quiz-option');

  // Mark all options
  options.forEach(opt => {
    const text = opt.querySelector('.option-text').textContent.replace(/\s+/g, ' ').trim();
    const correctText = question.correct.replace(/\s+/g, ' ').trim();
    opt.classList.add('disabled');

    if (text === correctText || opt === btn) {
      if (text === correctText) {
        opt.classList.add('correct');
      }
      if (opt === btn && !isCorrect) {
        opt.classList.add('incorrect');
      }
    }
  });

  // Update score
  if (isCorrect) {
    this.state.quiz.score++;
    this.state.stats.correctAnswers++;
  }
  this.state.stats.totalAnswered++;
  this.saveState();

  this.state.quiz.answers.push({
    question: question.question,
    correct: isCorrect,
    selected,
    correctAnswer: question.correct
  });

  // Show feedback
  this.dom.feedbackIcon.textContent = isCorrect ? '✅' : '❌';
  this.dom.feedbackText.textContent = isCorrect ? 'Правильно!' : 'Неправильно';
  this.dom.feedbackText.className = 'feedback-text ' + (isCorrect ? 'correct' : 'incorrect');
  this.dom.feedbackExplanation.innerHTML = this.escapeHtml(question.explanation).replace(/\n/g, '<br>');
  this.dom.quizFeedback.classList.remove('hidden');

  // Show next button
  this.dom.quizNext.classList.remove('hidden');

  if (this.state.quiz.currentIndex >= this.state.quiz.questions.length - 1) {
    this.dom.quizNext.textContent = 'Завершить →';
  }
};

App.nextQuizQuestion = function() {
  this.state.quiz.currentIndex++;

  if (this.state.quiz.currentIndex >= this.state.quiz.questions.length) {
    this.showQuizResults();
    return;
  }

  this.renderQuizQuestion();
};

App.showQuizResults = function() {
  const { score, questions, answers } = this.state.quiz;
  const percent = Math.round((score / questions.length) * 100);

  this.dom.quizGame.classList.add('hidden');
  this.dom.quizResults.classList.remove('hidden');

  this.dom.quizScore.textContent = `${score} / ${questions.length}`;

  const correct = answers.filter(a => a.correct).length;
  const incorrect = answers.length - correct;

  this.dom.quizStats.innerHTML = `
    <div>✅ Правильно: ${correct}</div>
    <div>❌ Неправильно: ${incorrect}</div>
    <div>📊 Процент: ${percent}%</div>
  `;

  this.addSession('quiz', 'Тест', score, questions.length);
  this.updateDashboard();
};

App.restartQuiz = function() {
  this.dom.quizResults.classList.add('hidden');
  this.dom.quizSetup.classList.remove('hidden');
};

// ═══════════════════════════════════════════════════════════════
// MATCHING MODULE
// ═══════════════════════════════════════════════════════════════

App.startMatching = function() {
  const difficulty = document.querySelector('input[name="matchDiff"]:checked').value;
  const pairCounts = { easy: 3, medium: 5, hard: 8 };
  const count = pairCounts[difficulty];

  const selected = getRandomRecipes(count);

  this.state.matching = {
    pairs: selected.map(r => ({ ...r })),
    selected: null,
    found: 0,
    attempts: 0,
    startTime: Date.now()
  };

  this.dom.matchSetup.classList.add('hidden');
  this.dom.matchResults.classList.add('hidden');
  this.dom.matchGame.classList.remove('hidden');

  this.renderMatchingBoard();
};

App.renderMatchingBoard = function() {
  const { pairs, found } = this.state.matching;

  this.dom.matchPairsFound.textContent = found;
  this.dom.matchPairsTotal.textContent = pairs.length;

  // Create left column (indications) and right column (drugs)
  const leftItems = this.shuffleArray(pairs.map((p, i) => ({ ...p, side: 'left', originalIndex: i })));
  const rightItems = this.shuffleArray(pairs.map((p, i) => ({ ...p, side: 'right', originalIndex: i })));

  this.dom.matchBoard.innerHTML = '';

  // Create two columns
  const leftCol = document.createElement('div');
  leftCol.className = 'match-column';
  leftCol.innerHTML = '<div class="match-column-title">Показание / Препарат</div>';

  const rightCol = document.createElement('div');
  rightCol.className = 'match-column';
  rightCol.innerHTML = '<div class="match-column-title">Рецепт / Действие</div>';

  leftItems.forEach(item => {
    const el = document.createElement('div');
    el.className = 'match-item';
    el.dataset.id = item.id;
    el.dataset.side = 'left';
    el.textContent = item.indication;
    el.addEventListener('click', () => this.handleMatchClick(el, item));
    leftCol.appendChild(el);
  });

  rightItems.forEach(item => {
    const el = document.createElement('div');
    el.className = 'match-item';
    el.dataset.id = item.id;
    el.dataset.side = 'right';
    // Show drug name or abbreviated recipe
    el.textContent = item.drug;
    el.addEventListener('click', () => this.handleMatchClick(el, item));
    rightCol.appendChild(el);
  });

  this.dom.matchBoard.appendChild(leftCol);
  this.dom.matchBoard.appendChild(rightCol);
};

App.handleMatchClick = function(el, item) {
  const { selected, found, pairs } = this.state.matching;

  // Ignore if already matched
  if (el.classList.contains('matched')) return;

  // If nothing selected, select this
  if (!selected) {
    this.state.matching.selected = { el, item };
    el.classList.add('selected');
    return;
  }

  // If clicking same side, switch selection
  if (selected.item.side === item.side) {
    selected.el.classList.remove('selected');
    this.state.matching.selected = { el, item };
    el.classList.add('selected');
    return;
  }

  // Check match
  this.state.matching.attempts++;
  const isMatch = selected.item.id === item.id;

  if (isMatch) {
    selected.el.classList.remove('selected');
    selected.el.classList.add('matched');
    el.classList.add('matched');
    this.state.matching.found++;
    this.state.matching.selected = null;

    // Check completion
    if (this.state.matching.found >= pairs.length) {
      setTimeout(() => this.showMatchingResults(), 500);
    }
  } else {
    selected.el.classList.remove('selected');
    selected.el.classList.add('wrong');
    el.classList.add('wrong');
    this.state.matching.selected = null;

    setTimeout(() => {
      selected.el.classList.remove('wrong');
      el.classList.remove('wrong');
    }, 600);
  }
};

App.shuffleMatching = function() {
  this.renderMatchingBoard();
};

App.giveUpMatching = function() {
  if (confirm('Завершить игру досрочно?')) {
    this.showMatchingResults();
  }
};

App.showMatchingResults = function() {
  const { found, attempts, startTime, pairs } = this.state.matching;
  const timeSpent = Math.round((Date.now() - startTime) / 1000);
  const accuracy = attempts > 0 ? Math.round((found / attempts) * 100) : 0;

  this.dom.matchGame.classList.add('hidden');
  this.dom.matchResults.classList.remove('hidden');

  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  this.dom.matchScore.innerHTML = `
    <div style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem;">${found} / ${pairs.length}</div>
    <div style="color: var(--text-secondary); font-size: 1rem;">
      <div>⏱️ Время: ${minutes}:${seconds.toString().padStart(2, '0')}</div>
      <div>🎯 Точность: ${accuracy}%</div>
      <div>🔄 Попыток: ${attempts}</div>
    </div>
  `;

  this.addSession('matching', 'Соответствие', found, pairs.length);
};

App.restartMatching = function() {
  this.dom.matchResults.classList.add('hidden');
  this.dom.matchSetup.classList.remove('hidden');
};

// ═══════════════════════════════════════════════════════════════
// WRITE RECIPE MODULE
// ═══════════════════════════════════════════════════════════════

App.startWrite = function() {
  const category = this.dom.writeCategory.value;

  let pool = category === 'all' ? [...RECIPES] : RECIPES.filter(r => r.category === category);
  pool = this.shuffleArray(pool);

  this.state.write = {
    queue: pool,
    currentIndex: 0,
    category
  };

  this.dom.writeSetup.classList.add('hidden');
  this.dom.writeGame.classList.remove('hidden');
  this.dom.writeFeedback.classList.add('hidden');
  this.dom.writeNext.classList.add('hidden');
  this.dom.writeCheck.classList.remove('hidden');

  this.renderWriteRecipe();
};

App.renderWriteRecipe = function() {
  const { queue, currentIndex } = this.state.write;

  if (currentIndex >= queue.length) {
    this.dom.writeIndication.textContent = '🎉 Все рецепты пройдены!';
    this.dom.writeDrug.textContent = '';
    this.dom.writeLatin.textContent = '';
    this.dom.writeRecipeInput.value = '';
    this.dom.writeRecipeInput.disabled = true;
    this.dom.writeCheck.classList.add('hidden');
    this.dom.writeHint.classList.add('hidden');
    return;
  }

  const recipe = queue[currentIndex];

  this.dom.writeIndication.textContent = recipe.indication;
  this.dom.writeDrug.textContent = recipe.drug;
  this.dom.writeLatin.textContent = recipe.latinName;
  this.dom.writeRecipeInput.value = '';
  this.dom.writeRecipeInput.disabled = false;
  this.dom.writeRecipeInput.focus();
  this.dom.writeFeedback.classList.add('hidden');
  this.dom.writeNext.classList.add('hidden');
  this.dom.writeCheck.classList.remove('hidden');
};

App.showWriteHint = function() {
  const { queue, currentIndex } = this.state.write;
  const recipe = queue[currentIndex];

  // Show first line of recipe as hint
  const lines = recipe.recipe.split('\n');
  const hint = lines[0] + '\n...';

  this.dom.writeRecipeInput.value = hint;
  this.dom.writeRecipeInput.focus();
};

App.checkWriteRecipe = function() {
  const { queue, currentIndex } = this.state.write;
  const recipe = queue[currentIndex];
  const userInput = this.dom.writeRecipeInput.value.trim();

  if (!userInput) {
    this.showToast('⚠️ Напишите рецепт перед проверкой');
    return;
  }

  // Parse and check key elements
  const checks = this.validateRecipe(userInput, recipe);
  const passedChecks = checks.filter(c => c.passed).length;
  const totalChecks = checks.length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  // Determine result
  let resultClass, resultText;
  if (score >= 90) {
    resultClass = 'correct';
    resultText = '✅ Отлично! Рецепт написан правильно';
    this.state.stats.correctAnswers++;
  } else if (score >= 60) {
    resultClass = 'partial';
    resultText = '⚠️ Хорошо, но есть недочёты';
  } else {
    resultClass = 'incorrect';
    resultText = '❌ Нужно подучить рецепт';
  }
  this.state.stats.totalAnswered++;
  this.saveState();

  // Mark as learned if score >= 80
  if (score >= 80 && !this.state.learnedIds.includes(recipe.id)) {
    this.state.learnedIds.push(recipe.id);
    this.saveState();
    this.updateDashboard();
  }

  // Render feedback
  this.dom.writeFeedbackHeader.textContent = resultText;
  this.dom.writeFeedbackHeader.className = 'feedback-header ' + resultClass;

  this.dom.writeFeedbackDetails.innerHTML = checks.map(c => `
    <div class="feedback-item">
      <span class="${c.passed ? 'check' : 'cross'}">${c.passed ? '✓' : '✗'}</span>
      ${c.label}
    </div>
  `).join('');

  this.dom.writeCorrectRecipe.innerHTML = `
    <div class="correct-recipe-label">Правильный рецепт:</div>
    <div class="correct-recipe">${this.escapeHtml(recipe.recipe)}</div>
  `;

  this.dom.writeFeedback.classList.remove('hidden');
  this.dom.writeCheck.classList.add('hidden');
  this.dom.writeNext.classList.remove('hidden');

  this.state.write.history.push({
    recipeId: recipe.id,
    score,
    timestamp: new Date().toISOString()
  });
};

App.validateRecipe = function(input, recipe) {
  const checks = [];
  const lower = input.toLowerCase();
  const recipeLower = recipe.recipe.toLowerCase();

  // Check Rp.: presence
  checks.push({
    label: 'Начало рецепта (Rp.:)',
    passed: lower.includes('rp.:') || lower.includes('rp:') || lower.includes('rp.')
  });

  // Check D.t.d. presence
  checks.push({
    label: 'Указание количества (D.t.d.)',
    passed: lower.includes('d.t.d.') || lower.includes('dtd') || lower.includes('d.t.d')
  });

  // Check S. presence
  checks.push({
    label: 'Указание способа применения (S.)',
    passed: lower.includes('s.') && (lower.includes('s. ') || lower.includes('s.\n'))
  });

  // Check drug name (latin)
  const latinParts = recipe.latinName.toLowerCase().split(' ');
  const hasLatin = latinParts.some(part => 
    part.length > 3 && lower.includes(part)
  );
  checks.push({
    label: 'Латинское название препарата',
    passed: hasLatin
  });

  // Check dosage
  const dosageMatch = recipe.recipe.match(/[\d,]+\s*(?:г|мг|мкг|мл|ед|%)/gi);
  const hasDosage = dosageMatch && dosageMatch.some(d => lower.includes(d.toLowerCase()));
  checks.push({
    label: 'Дозировка препарата',
    passed: hasDosage
  });

  // Check route
  const routeKeywords = {
    'per os': ['per os', 'внутрь'],
    'п/к': ['п/к', 'подкожно'],
    'в/м': ['в/м', 'внутримышечно'],
    'в/в': ['в/в', 'внутривенно'],
    'ингаляционно': ['ингаляционно', 'ингаляция'],
    'sublingual': ['sublingual', 'сублингвально']
  };
  const routeChecks = routeKeywords[recipe.route] || [recipe.route];
  const hasRoute = routeChecks.some(r => lower.includes(r));
  checks.push({
    label: `Путь введения (${recipe.route})`,
    passed: hasRoute
  });

  // Check form
  const formKeywords = {
    'tab': ['tab', 'таблетк'],
    'amp': ['amp', 'ампул'],
    'caps': ['caps', 'капсул'],
    'aerosol': ['aerosol', 'аэрозол'],
    'susp': ['susp', 'суспенз'],
    'fl': ['fl', 'флакон'],
    'syr': ['syr', 'шприц']
  };
  const formChecks = formKeywords[recipe.form] || [recipe.form];
  const hasForm = formChecks.some(f => lower.includes(f));
  checks.push({
    label: `Лекарственная форма (${recipe.form})`,
    passed: hasForm
  });

  return checks;
};

App.nextWriteRecipe = function() {
  this.state.write.currentIndex++;
  this.renderWriteRecipe();
};

// ═══════════════════════════════════════════════════════════════
// EXAM MODE MODULE
// ═══════════════════════════════════════════════════════════════

App.startExam = function() {
  const selected = getRandomRecipes(25);
  const questions = selected.map(recipe => this.generateQuestion(recipe));

  this.state.exam = {
    questions,
    currentIndex: 0,
    answers: [],
    startTime: Date.now(),
    timerInterval: null,
    timeLeft: 30 * 60
  };

  this.dom.examSetup.classList.add('hidden');
  this.dom.examResults.classList.add('hidden');
  this.dom.examGame.classList.remove('hidden');

  this.startExamTimer();
  this.renderExamQuestion();
};

App.startExamTimer = function() {
  this.updateExamTimerDisplay();

  this.state.exam.timerInterval = setInterval(() => {
    this.state.exam.timeLeft--;
    this.updateExamTimerDisplay();

    if (this.state.exam.timeLeft <= 0) {
      this.finishExam();
    }
  }, 1000);
};

App.updateExamTimerDisplay = function() {
  const minutes = Math.floor(this.state.exam.timeLeft / 60);
  const seconds = this.state.exam.timeLeft % 60;
  this.dom.examTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Visual warnings
  this.dom.examTimer.classList.remove('warning', 'danger');
  if (this.state.exam.timeLeft <= 300) { // 5 minutes
    this.dom.examTimer.classList.add('danger');
  } else if (this.state.exam.timeLeft <= 600) { // 10 minutes
    this.dom.examTimer.classList.add('warning');
  }
};

App.renderExamQuestion = function() {
  const { questions, currentIndex } = this.state.exam;
  const q = questions[currentIndex];

  this.dom.examQuestionNum.textContent = currentIndex + 1;
  this.dom.examQuestion.textContent = q.question;
  this.dom.examContext.textContent = q.context;

  this.dom.examOptions.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('div');
    btn.className = 'exam-option';
    btn.innerHTML = `
      <div class="option-letter">${String.fromCharCode(65 + idx)}</div>
      <div class="option-text">${this.escapeHtml(opt).replace(/\n/g, '<br>')}</div>
    `;
    btn.addEventListener('click', () => {
      this.dom.examOptions.querySelectorAll('.exam-option').forEach(o => o.classList.remove('selected'));
      btn.classList.add('selected');
    });
    this.dom.examOptions.appendChild(btn);
  });
};

App.nextExamQuestion = function() {
  const selected = this.dom.examOptions.querySelector('.exam-option.selected');

  if (!selected) {
    this.showToast('⚠️ Выберите ответ');
    return;
  }

  const { questions, currentIndex } = this.state.exam;
  const q = questions[currentIndex];
  const selectedText = selected.querySelector('.option-text').textContent.replace(/\s+/g, ' ').trim();
  const isCorrect = selectedText === q.correct.replace(/\s+/g, ' ').trim();

  this.state.exam.answers.push({
    question: q.question,
    correct: isCorrect,
    selected: selectedText,
    correctAnswer: q.correct,
    recipe: q.recipe
  });

  this.state.exam.currentIndex++;

  if (this.state.exam.currentIndex >= questions.length) {
    this.finishExam();
  } else {
    this.renderExamQuestion();
  }
};

App.finishExam = function() {
  clearInterval(this.state.exam.timerInterval);

  const { answers, startTime, questions } = this.state.exam;
  const correct = answers.filter(a => a.correct).length;
  const percent = Math.round((correct / questions.length) * 100);
  const timeSpent = Math.round((Date.now() - startTime) / 1000);

  this.dom.examGame.classList.add('hidden');
  this.dom.examResults.classList.remove('hidden');

  // Score
  this.dom.examScore.textContent = `${correct} / ${questions.length}`;

  // Time
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  this.dom.examTimeSpent.textContent = `Время: ${minutes} мин ${seconds} сек`;

  // Grade
  let grade, gradeClass;
  if (percent >= 90) {
    grade = 'Отлично 🌟';
    gradeClass = 'excellent';
    this.dom.examResultIcon.textContent = '🏆';
  } else if (percent >= 75) {
    grade = 'Хорошо 👍';
    gradeClass = 'good';
    this.dom.examResultIcon.textContent = '👍';
  } else if (percent >= 60) {
    grade = 'Удовлетворительно 📋';
    gradeClass = 'satisfactory';
    this.dom.examResultIcon.textContent = '📋';
  } else {
    grade = 'Неудовлетворительно ❌';
    gradeClass = 'fail';
    this.dom.examResultIcon.textContent = '❌';
  }

  this.dom.examGrade.textContent = grade;
  this.dom.examGrade.className = 'exam-grade ' + gradeClass;

  // Breakdown
  const incorrectAnswers = answers.filter(a => !a.correct);

  if (incorrectAnswers.length === 0) {
    this.dom.breakdownList.innerHTML = '<p style="text-align: center; color: var(--accent-success); font-weight: 600;">🎉 Все ответы правильные! Отличная работа!</p>';
  } else {
    this.dom.breakdownList.innerHTML = incorrectAnswers.map((a, i) => `
      <div class="breakdown-item incorrect">
        <div class="breakdown-question">${i + 1}. ${this.escapeHtml(a.question)}</div>
        <div class="breakdown-answer">
          <span class="label">Ваш ответ:</span> <span class="user-ans">${this.escapeHtml(a.selected)}</span><br>
          <span class="label">Правильно:</span> <span class="correct-ans">${this.escapeHtml(a.correctAnswer)}</span>
        </div>
      </div>
    `).join('');
  }

  // Save stats
  this.state.stats.correctAnswers += correct;
  this.state.stats.totalAnswered += questions.length;
  this.saveState();

  this.addSession('exam', 'Экзамен', correct, questions.length);
  this.updateDashboard();
};

App.restartExam = function() {
  clearInterval(this.state.exam.timerInterval);
  this.dom.examResults.classList.add('hidden');
  this.dom.examSetup.classList.remove('hidden');
};

// ═══════════════════════════════════════════════════════════════
// ALL RECIPES MODULE
// ═══════════════════════════════════════════════════════════════

App.renderRecipes = function() {
  const query = this.dom.recipeSearch.value;
  const category = this.dom.recipeFilter.value;
  const sort = this.dom.recipeSort.value;

  let recipes = searchRecipes(query, category);

  // Sort
  switch (sort) {
    case 'id':
      recipes.sort((a, b) => a.id - b.id);
      break;
    case 'category':
      recipes.sort((a, b) => a.category.localeCompare(b.category) || a.id - b.id);
      break;
    case 'drug':
      recipes.sort((a, b) => a.drug.localeCompare(b.drug));
      break;
    case 'learned':
      recipes.sort((a, b) => {
        const aLearned = this.state.learnedIds.includes(a.id);
        const bLearned = this.state.learnedIds.includes(b.id);
        return aLearned - bLearned;
      });
      break;
  }

  this.dom.recipesCount.textContent = `Показано: ${recipes.length} / ${RECIPES.length}`;

  if (recipes.length === 0) {
    this.dom.recipesGrid.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1;">Ничего не найдено</p>';
    return;
  }

  this.dom.recipesGrid.innerHTML = recipes.map(r => {
    const isLearned = this.state.learnedIds.includes(r.id);
    return `
      <div class="recipe-card ${isLearned ? 'learned' : ''}" data-id="${r.id}">
        <div class="recipe-card-category">${this.escapeHtml(r.category)}</div>
        <div class="recipe-card-indication">${this.escapeHtml(r.indication)}</div>
        <div class="recipe-card-drug">${this.escapeHtml(r.drug)}</div>
        <div class="recipe-card-latin">${this.escapeHtml(r.latinName)}</div>
        <div class="recipe-card-meta">
          <span>💊 ${r.form}</span>
          <span>📍 ${r.route}</span>
          <span>№${r.id}</span>
        </div>
      </div>
    `;
  }).join('');

  // Add click handlers
  this.dom.recipesGrid.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      this.openRecipeModal(id);
    });
  });
};

App.openRecipeModal = function(id) {
  const recipe = RECIPES.find(r => r.id === id);
  if (!recipe) return;

  const isLearned = this.state.learnedIds.includes(id);

  this.dom.modalBody.innerHTML = `
    <div class="modal-category">${this.escapeHtml(recipe.category)}</div>
    <div class="modal-indication">${this.escapeHtml(recipe.indication)}</div>
    <div class="modal-drug">${this.escapeHtml(recipe.drug)}</div>
    <div class="modal-latin">${this.escapeHtml(recipe.latinName)}</div>
    <div class="modal-recipe">${this.escapeHtml(recipe.recipe)}</div>
    <div class="modal-note">${this.escapeHtml(recipe.note)}</div>
    <div class="modal-actions">
      <button class="btn ${isLearned ? 'btn-secondary' : 'btn-success'}" id="modalLearnBtn">
        ${isLearned ? '✓ Выучено (отменить)' : '✅ Отметить как выученное'}
      </button>
      <button class="btn btn-primary" id="modalPracticeBtn">🎴 Практиковать</button>
    </div>
  `;

  this.dom.recipeModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Learn button
  document.getElementById('modalLearnBtn').addEventListener('click', () => {
    if (this.state.learnedIds.includes(id)) {
      this.state.learnedIds = this.state.learnedIds.filter(lid => lid !== id);
    } else {
      this.state.learnedIds.push(id);
    }
    this.saveState();
    this.updateDashboard();
    this.renderRecipes();
    this.openRecipeModal(id); // Refresh modal
    this.showToast(isLearned ? '❌ Снято отметку "выучено"' : '✅ Отмечено как выученное');
  });

  // Practice button - go to flashcards with this recipe
  document.getElementById('modalPracticeBtn').addEventListener('click', () => {
    this.closeModal();
    this.dom.fcCategory.value = 'all';
    this.dom.fcShuffle.checked = false;

    // Set up flashcards to start with this recipe
    this.state.flashcard.queue = [recipe, ...RECIPES.filter(r => r.id !== id)];
    this.state.flashcard.currentIndex = 0;
    this.state.flashcard.category = 'all';
    this.state.flashcard.shuffle = false;

    window.location.hash = 'flashcards';
  });
};

App.closeModal = function() {
  this.dom.recipeModal.classList.add('hidden');
  document.body.style.overflow = '';
};

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
