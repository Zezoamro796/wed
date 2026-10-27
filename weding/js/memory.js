/**
 * صفحة الذكريات المحمية بكلمة سر للعروسين يوسف ونورهان
 * Password: 29/10/2026
 */

const CORRECT_PASSWORD = "29/10/2026";
const SESSION_KEY = "wedding_auth_unlocked_yn";
const STORAGE_KEY = "wedding_wishes_db";

let allMessages = [];

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initPasswordGate();
  initMemoryActions();
});

/* ==========================================================================
   1. بوابة كلمة المرور (Password Gate)
   ========================================================================== */
function initPasswordGate() {
  const gateScreen = document.getElementById('passwordGateScreen');
  const memoryWall = document.getElementById('memoryWallContent');
  const gateForm = document.getElementById('passwordGateForm');
  const passInput = document.getElementById('gatePasswordInput');
  const toggleBtn = document.getElementById('togglePasswordView');
  const errorText = document.getElementById('gateErrorMsg');
  const lockBtn = document.getElementById('btnLockSession');

  // التحقق من الجلسة المحفوظة
  const isUnlocked = sessionStorage.getItem(SESSION_KEY) === 'true';
  if (isUnlocked) {
    showMemoryWall();
  } else {
    showGate();
  }

  // تبديل إظهار/إخفاء كلمة المرور
  if (toggleBtn && passInput) {
    toggleBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      toggleBtn.innerHTML = isPass ? `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
        </svg>
      ` : `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
      `;
    });
  }

  // التحقق من النموذج
  if (gateForm) {
    gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let inputVal = passInput.value.trim();

      // تحويل الأرقام العربية إلى إنجليزية إذا لزم الأمر
      inputVal = normalizeNumbers(inputVal);

      if (inputVal === CORRECT_PASSWORD) {
        // نجاح كلمة المرور
        sessionStorage.setItem(SESSION_KEY, 'true');
        if (errorText) errorText.style.display = 'none';
        triggerConfetti();
        showMemoryWall();
      } else {
        // خطأ
        passInput.classList.add('shake');
        setTimeout(() => passInput.classList.remove('shake'), 500);
        if (errorText) {
          errorText.textContent = 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.';
          errorText.style.display = 'block';
        }
      }
    });
  }

  // تسجيل الخروج والقفل
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      if (passInput) passInput.value = '';
      showGate();
    });
  }

  function showGate() {
    if (gateScreen) gateScreen.style.display = 'flex';
    if (memoryWall) memoryWall.style.display = 'none';
  }

  function showMemoryWall() {
    if (gateScreen) gateScreen.style.display = 'none';
    if (memoryWall) {
      memoryWall.style.display = 'block';
      loadAllMessages();
    }
  }
}

function normalizeNumbers(str) {
  const arabicNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return str.replace(/[٠-٩]/g, d => arabicNumerals.indexOf(d).toString());
}

/* ==========================================================================
   2. تحميل وعرض الرسائل والذكريات
   ========================================================================== */
async function loadAllMessages() {
  const container = document.getElementById('memoryCardsContainer');
  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-accent-gold);">
        <p>جاري تحميل رسائل المحبين والتهاني...</p>
      </div>
    `;
  }

  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      allMessages = await res.json();
    } else {
      throw new Error('API unavailable');
    }
  } catch (err) {
    // Fallback to localStorage or sample messages
    console.log('Using local storage messages fallback');
    allMessages = getLocalStorageMessages();
  }

  renderMessages(allMessages);
  updateStats(allMessages);
}

function getLocalStorageMessages() {
  let list = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    list = [];
  }

  // إذا كانت فارغة، نضع بعض التهاني الترحيبية
  if (list.length === 0) {
    list = [
      {
        id: "msg-init-1",
        name: "محمود إبراهيم (أخو العريس)",
        relation: "عائلة العريس",
        message: "ألف ألف مبروك يا أغلى يوسف في الدنيا، بارك الله لكما وبارك عليكما وجمع بينكما في خير. ربنا يتمم لكم على خير ويسعد قلوبكم ويهنيكم يا رب ❤️💍",
        date: "2026-10-25T14:30:00Z"
      },
      {
        id: "msg-init-2",
        name: "سارة أحمد",
        relation: "صديقة العروسة",
        message: "أجمل وأرق عروسة في الكون نورهان، ألف مبروك ليكي ولأخونا يوسف، يا رب حياتكم كلها فرحة وسعادة وهنا دايماً، فرحانة ليكم من كل قلبي ✨👰‍♀️🤵‍♂️",
        date: "2026-10-26T09:15:00Z"
      },
      {
        id: "msg-init-3",
        name: "د. عادل القاضي",
        relation: "صديق العائلة",
        message: "خالص التهاني القلبية للأستاذ يوسف والأنسة نورهان بمناسبة الخطوبة السعيدة. بارك الله لكما ورزقكم المحبة والمودة والذرية الصالحة.",
        date: "2026-10-26T18:45:00Z"
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  return list;
}

function renderMessages(list) {
  const container = document.getElementById('memoryCardsContainer');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-memory-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </div>
        <h3 style="font-family: var(--font-arabic-serif); font-size: 1.5rem; margin-bottom: 8px;">لا توجد رسائل مطابقة حالياً</h3>
        <p style="color: var(--color-text-muted);">بإمكان الضيوف كتابة رسائلهم من صفحة الدعوة الرئيسية، وستظهر فوراً هنا.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(msg => {
    const initial = (msg.name || 'م').trim().charAt(0);
    const dateFormatted = formatArabicDate(msg.date);

    return `
      <div class="memory-card" id="card-${msg.id}">
        <div>
          <div class="memory-card-header">
            <div class="guest-info">
              <div class="guest-avatar">${escapeHTML(initial)}</div>
              <div class="guest-meta">
                <h4>${escapeHTML(msg.name)}</h4>
                <span class="guest-relation-tag">${escapeHTML(msg.relation || 'مهنئ كريم')}</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn-card-del" title="حذف الرسالة" onclick="deleteMessage('${msg.id}')">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="memory-card-body">
            "${escapeHTML(msg.message)}"
          </div>
        </div>
        <div class="memory-card-footer">
          <span class="memory-date">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            ${dateFormatted}
          </span>
          <span style="color: var(--color-accent-gold); font-size: 1.1rem;">🤍</span>
        </div>
      </div>
    `;
  }).join('');
}

function updateStats(list) {
  const totalEl = document.getElementById('statTotalWishes');
  const familyEl = document.getElementById('statFamilyWishes');
  const friendsEl = document.getElementById('statFriendsWishes');

  if (totalEl) totalEl.textContent = list.length;

  const familyCount = list.filter(m => (m.relation || '').includes('عائلة')).length;
  const friendsCount = list.filter(m => (m.relation || '').includes('صديق') || (m.relation || '').includes('صديقة')).length;

  if (familyEl) familyEl.textContent = familyCount;
  if (friendsEl) friendsEl.textContent = friendsCount;
}

/* ==========================================================================
   3. أدوات البحث، الطباعة، والتصدير
   ========================================================================== */
function initMemoryActions() {
  const searchInput = document.getElementById('memorySearchInput');
  const btnPrint = document.getElementById('btnPrintAlbum');
  const btnExport = document.getElementById('btnExportJson');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allMessages.filter(m => 
        (m.name || '').toLowerCase().includes(query) ||
        (m.message || '').toLowerCase().includes(query) ||
        (m.relation || '').toLowerCase().includes(query)
      );
      renderMessages(filtered);
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      exportMessagesAsJSON();
    });
  }
}

// حذف رسالة
window.deleteMessage = async function(id) {
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذه التهنئة؟')) return;

  try {
    const res = await fetch(`/api/messages?id=${id}`, {
      method: 'DELETE',
      headers: { 'X-Wedding-Pass': CORRECT_PASSWORD }
    });

    if (res.ok) {
      allMessages = allMessages.filter(m => m.id !== id);
      renderMessages(allMessages);
      updateStats(allMessages);
      return;
    }
  } catch (e) {
    console.log('Falling back to localStorage deletion...');
  }

  // Deletion from local storage fallback
  allMessages = allMessages.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages));
  renderMessages(allMessages);
  updateStats(allMessages);
};

function exportMessagesAsJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allMessages, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `wedding-wishes-yousef-norhan-${Date.now()}.json`);
  dlAnchorElem.click();
}

function formatArabicDate(dateStr) {
  if (!dateStr) return 'مؤخراً';
  try {
    const d = new Date(dateStr);
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

function escapeHTML(str) {
  if (!str) return '';
  const p = document.createElement('p');
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}

function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.5 + 0.2
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y > height) { p.y = -10; p.x = Math.random() * width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(render);
  }
  render();
}

function triggerConfetti() {
  const count = 35;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.style.left = (Math.random() * 100) + 'vw';
    el.style.top = '-20px';
    el.style.width = '10px';
    el.style.height = '14px';
    el.style.backgroundColor = ['#ffd700', '#cba135', '#ffffff', '#e6c229'][Math.floor(Math.random() * 4)];
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    el.style.transition = 'all 2.2s ease-out';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.transform = `translate(${(Math.random() - 0.5) * 160}px, 105vh) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = '0';
    }, 50);

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2500);
  }
}
