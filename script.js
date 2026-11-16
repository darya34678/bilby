// ============================================
// 🦊 BILBY — Интерактив и анимации
// ============================================

// === Частицы песка ===
function createSandParticles() {
  const container = document.getElementById('sandParticles');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDuration = (5 + Math.random() * 10) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    container.appendChild(p);
  }
}

// === Звёзды ===
function createStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    const size = 1 + Math.random() * 3;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(s);
  }
}

// === Прыжок билби ===
function bilbyJump() {
  const bilby = document.querySelector('.bilby-hero');
  bilby.style.animation = 'none';
  bilby.offsetHeight;
  bilby.style.animation = 'bilbyJump 0.8s ease';
  setTimeout(() => {
    bilby.style.animation = 'bilbyBounce 3s ease-in-out infinite';
  }, 800);
}

// === Scroll reveal ===
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));
}

// ============================================
// 🔄 ВКЛАДКИ ИГР
// ============================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.game-panel');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const targetPanel = document.getElementById('panel-' + targetTab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

// ============================================
// 🎮 ИГРА 1: Защити птенца
// ============================================
let score = 0;
let lives = 3;
let timeLeft = 60;
let gameInterval = null;
let spawnInterval = null;
let timerInterval = null;
let gameRunning = false;

const PREDATOR_TYPES = [
  { emoji: '🦅', size: 60, speed: 2500, points: 10 },
  { emoji: '🦂', size: 50, speed: 3500, points: 15 },
  { emoji: '🦎', size: 55, speed: 3000, points: 12 },
  { emoji: '🐍', size: 65, speed: 2000, points: 20 }
];

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  lives = 3;
  timeLeft = 60;
  updateStats();
  document.querySelectorAll('.predator').forEach(p => p.remove());

  gameInterval = setInterval(spawnPredator, 1200);
  spawnInterval = setInterval(spawnPredator, 2000);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateStats();
    if (timeLeft <= 0) endGame(true);
  }, 1000);
}

function spawnPredator() {
  if (!gameRunning) return;
  const arena = document.getElementById('arena');
  const type = PREDATOR_TYPES[Math.floor(Math.random() * PREDATOR_TYPES.length)];

  const pred = document.createElement('div');
  pred.className = 'predator';
  pred.style.fontSize = type.size + 'px';
  pred.textContent = type.emoji;

  const side = Math.random();
  let startX, startY, endX, endY;

  if (side < 0.5) {
    startX = Math.random() * (arena.clientWidth - 80);
    startY = -80;
    endX = arena.clientWidth / 2 - 30 + (Math.random() - 0.5) * 100;
    endY = arena.clientHeight - 150;
  } else if (side < 0.75) {
    startX = -80;
    startY = Math.random() * (arena.clientHeight - 200);
    endX = arena.clientWidth / 2 - 30;
    endY = arena.clientHeight - 150;
  } else {
    startX = arena.clientWidth;
    startY = Math.random() * (arena.clientHeight - 200);
    endX = arena.clientWidth / 2 - 30;
    endY = arena.clientHeight - 150;
  }

  pred.style.left = startX + 'px';
  pred.style.top = startY + 'px';
  pred.style.transition = `left ${type.speed}ms linear, top ${type.speed}ms linear`;
  arena.appendChild(pred);

  requestAnimationFrame(() => {
    pred.style.left = endX + 'px';
    pred.style.top = endY + 'px';
  });

  pred.onclick = (e) => {
    e.stopPropagation();
    if (pred.classList.contains('dead')) return;
    pred.classList.add('dead');
    score += type.points;
    updateStats();
    showFloatingText(e.clientX, e.clientY, '+' + type.points);
    setTimeout(() => pred.remove(), 500);
  };

  setTimeout(() => {
    if (!pred.classList.contains('dead') && gameRunning) {
      lives--;
      updateStats();
      pred.remove();
      shakeArena();
      if (lives <= 0) endGame(false);
    }
  }, type.speed);
}

function showFloatingText(x, y, text) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    position: fixed; left: ${x}px; top: ${y}px;
    color: #E87A3E; font-weight: bold; font-size: 1.5em;
    pointer-events: none; z-index: 9999;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    animation: floatUp 1s ease-out forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function shakeArena() {
  const arena = document.getElementById('arena');
  arena.style.animation = 'shake 0.4s';
  setTimeout(() => arena.style.animation = '', 400);
}

function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = '❤'.repeat(Math.max(0, lives)) || '💀';
  document.getElementById('time').textContent = timeLeft;
}

function endGame(won) {
  gameRunning = false;
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.querySelectorAll('.predator').forEach(p => p.remove());

  const arena = document.getElementById('arena');
  const msg = document.createElement('div');
  msg.style.cssText = `
    position: absolute; inset: 0;
    background: rgba(61, 40, 23, 0.9);
    color: #FFF8EE;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 20; font-size: 2em;
    border-radius: 20px;
  `;
  msg.innerHTML = `
    <div style="font-size: 1.5em; margin-bottom: 20px;">${won ? '🏆' : '💔'}</div>
    <div>${won ? 'Птенец спасён!' : 'Птенец в опасности...'}</div>
    <div style="font-size: 0.7em; margin-top: 15px; opacity: 0.8;">Счёт: ${score}</div>
  `;
  arena.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// ============================================
// 🧠 ИГРА 2: Мемори
// ============================================
const MEMORY_EMOJIS = ['🦊', '🐣', '🦅', '🌵', '☀️', '⭐', '🦂', '🏜️'];
let memoryFlipped = [];
let memoryMatched = 0;
let memoryMoves = 0;
let memoryTimer = null;
let memorySeconds = 0;
let memoryLocked = false;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startMemory() {
  memoryMatched = 0;
  memoryMoves = 0;
  memorySeconds = 0;
  memoryFlipped = [];
  memoryLocked = false;
  clearInterval(memoryTimer);
  
  document.getElementById('memory-moves').textContent = '0';
  document.getElementById('memory-pairs').textContent = '0';
  document.getElementById('memory-time').textContent = '0';
  
  const cards = shuffleArray([...MEMORY_EMOJIS, ...MEMORY_EMOJIS]);
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  
  cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = index;
    card.dataset.emoji = emoji;
    card.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-front"></div>
        <div class="memory-card-back">${emoji}</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card));
    grid.appendChild(card);
  });
  
  memoryTimer = setInterval(() => {
    memorySeconds++;
    document.getElementById('memory-time').textContent = memorySeconds;
  }, 1000);
}

function flipCard(card) {
  if (memoryLocked) return;
  if (card.classList.contains('flipped')) return;
  if (card.classList.contains('matched')) return;
  if (memoryFlipped.length >= 2) return;
  
  card.classList.add('flipped');
  memoryFlipped.push(card);
  
  if (memoryFlipped.length === 2) {
    memoryMoves++;
    document.getElementById('memory-moves').textContent = memoryMoves;
    
    const [c1, c2] = memoryFlipped;
    
    if (c1.dataset.emoji === c2.dataset.emoji) {
      c1.classList.add('matched');
      c2.classList.add('matched');
      memoryMatched++;
      document.getElementById('memory-pairs').textContent = memoryMatched;
      memoryFlipped = [];
      
      if (memoryMatched === 8) {
        clearInterval(memoryTimer);
        setTimeout(() => {
          alert(`🎉 Победа! Все пары найдены!\nХодов: ${memoryMoves}\nВремя: ${memorySeconds}с`);
        }, 500);
      }
    } else {
      memoryLocked = true;
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        memoryFlipped = [];
        memoryLocked = false;
      }, 1000);
    }
  }
}

// ============================================
// ⭐ ИГРА 3: Лови звёзды
// ============================================
let starsScore = 0;
let starsTime = 30;
let starsInterval = null;
let starsTimer = null;
let starsRunning = false;
let starsBest = parseInt(localStorage.getItem('bilby-stars-best') || '0');

function startStars() {
  if (starsRunning) return;
  starsRunning = true;
  starsScore = 0;
  starsTime = 30;
  document.getElementById('stars-score').textContent = '0';
  document.getElementById('stars-time').textContent = '30';
  document.getElementById('stars-best').textContent = starsBest;
  
  const arena = document.getElementById('stars-arena');
  arena.querySelectorAll('.falling-item').forEach(el => el.remove());
  
  starsInterval = setInterval(spawnFallingItem, 600);
  starsTimer = setInterval(() => {
    starsTime--;
    document.getElementById('stars-time').textContent = starsTime;
    if (starsTime <= 0) endStars();
  }, 1000);
}

function spawnFallingItem() {
  if (!starsRunning) return;
  const arena = document.getElementById('stars-arena');
  const isEnemy = Math.random() < 0.3;
  
  const item = document.createElement('div');
  item.className = 'falling-item ' + (isEnemy ? 'enemy' : 'star');
  item.textContent = isEnemy 
    ? ['🦅', '🦂', '🐍', '🦎'][Math.floor(Math.random() * 4)]
    : ['⭐', '🌟', '✨', '💫'][Math.floor(Math.random() * 4)];
  item.style.left = Math.random() * (arena.clientWidth - 40) + 'px';
  item.style.animationDuration = (2 + Math.random() * 2) + 's';
  arena.appendChild(item);
  
  setTimeout(() => item.remove(), 4000);
}

function endStars() {
  starsRunning = false;
  clearInterval(starsInterval);
  clearInterval(starsTimer);
  
  if (starsScore > starsBest) {
    starsBest = starsScore;
    localStorage.setItem('bilby-stars-best', starsBest);
  }
  
  const arena = document.getElementById('stars-arena');
  const msg = document.createElement('div');
  msg.style.cssText = `
    position: absolute; inset: 0;
    background: rgba(26, 26, 46, 0.9);
    color: #FFF8EE;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 20; font-size: 1.5em;
    border-radius: 20px;
  `;
  msg.innerHTML = `
    <div style="font-size: 2em; margin-bottom: 15px;">${starsScore > 100 ? '🏆' : '⭐'}</div>
    <div>Игра окончена!</div>
    <div style="font-size: 0.8em; margin-top: 10px;">Счёт: ${starsScore}</div>
    <div style="font-size: 0.7em; margin-top: 5px; opacity: 0.8;">Рекорд: ${starsBest}</div>
  `;
  arena.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// Динамические keyframes
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
  @keyframes floatUp {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-60px); opacity: 0; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(dynamicStyles);

// ============================================
// 🚀 Инициализация
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  createSandParticles();
  createStars();
  initReveal();
  initTabs();
  
  // Движение билби в игре "Лови звёзды"
  const arena = document.getElementById('stars-arena');
  const bilby = document.getElementById('stars-bilby');
  
  if (arena && bilby) {
    arena.addEventListener('mousemove', (e) => {
      if (!starsRunning) return;
      const rect = arena.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(30, Math.min(rect.width - 30, x));
      bilby.style.left = x + 'px';
      bilby.style.transform = 'translateX(-50%)';
    });
    
    arena.addEventListener('touchmove', (e) => {
      if (!starsRunning) return;
      e.preventDefault();
      const rect = arena.getBoundingClientRect();
      let x = e.touches[0].clientX - rect.left;
      x = Math.max(30, Math.min(rect.width - 30, x));
      bilby.style.left = x + 'px';
      bilby.style.transform = 'translateX(-50%)';
    }, { passive: false });
  }
  
  // Проверка столкновений
  setInterval(() => {
    if (!starsRunning) return;
    const bilby = document.getElementById('stars-bilby');
    if (!bilby) return;
    const bRect = bilby.getBoundingClientRect();
    
    document.querySelectorAll('.falling-item').forEach(item => {
      const iRect = item.getBoundingClientRect();
      if (
        bRect.left < iRect.right &&
        bRect.right > iRect.left &&
        bRect.top < iRect.bottom &&
        bRect.bottom > iRect.top
      ) {
        if (item.classList.contains('star')) {
          starsScore += 10;
          document.getElementById('stars-score').textContent = starsScore;
          item.remove();
        } else if (item.classList.contains('enemy')) {
          starsScore = Math.max(0, starsScore - 15);
          document.getElementById('stars-score').textContent = starsScore;
          item.remove();
          bilby.style.filter = 'drop-shadow(0 0 20px red)';
          setTimeout(() => bilby.style.filter = '', 300);
        }
      }
    });
  }, 100);
});
// === Кнопка Play для видео ===
const videoOverlay = document.getElementById('videoOverlay');
const bilbyVideo = document.getElementById('bilbyVideo');

if (videoOverlay && bilbyVideo) {
  videoOverlay.addEventListener('click', () => {
    bilbyVideo.play();
    videoOverlay.classList.add('hidden');
  });

  bilbyVideo.addEventListener('pause', () => {
    if (!bilbyVideo.ended) {
      videoOverlay.classList.remove('hidden');
    }
  });

  bilbyVideo.addEventListener('play', () => {
    videoOverlay.classList.add('hidden');
  });

  bilbyVideo.addEventListener('ended', () => {
    videoOverlay.classList.remove('hidden');
  });
}