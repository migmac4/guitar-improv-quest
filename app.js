/**
 * Guitar Improvisation Quest — V3
 * Arquitetura orientada a dados com suporte dinâmico a lessons.json
 */

(() => {
  'use strict';

  // --- Constantes e Utilitários de Segurança ---
  const STORAGE_KEY = 'giq-v3';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  // Sanitização estrita contra XSS
  const esc = str => {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, match => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[match]));
  };

  // --- Estado Global da Aplicação ---
  let courseData = null;
  let lessons = [];
  let activeLessonId = 1;
  let activeWeek = 1;

  let state = {
    version: 3,
    xp: 0,
    lastStudyDate: null,
    streak: 0,
    lessons: {},
    quizAnswered: []
  };

  // --- Gerenciamento de Persistência (localStorage) ---
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.version === 3) {
          state = {
            ...state,
            ...parsed,
            lessons: parsed.lessons || {},
            quizAnswered: parsed.quizAnswered || []
          };
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar estado do localStorage:', err);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Erro ao salvar estado no localStorage:', err);
    }
  }

  // --- Sistema de XP, Nível e Streak ---
  function getLevel(xp) {
    return Math.floor((xp || 0) / 350) + 1;
  }

  function registerStudyActivity() {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastStudyDate === today) {
      // Já praticou hoje
      return;
    }

    if (!state.lastStudyDate) {
      state.streak = 1;
    } else {
      const lastDate = new Date(state.lastStudyDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        state.streak = (state.streak || 0) + 1;
      } else if (diffDays > 1) {
        state.streak = 1;
      }
    }
    state.lastStudyDate = today;
  }

  function getLessonMastery(id) {
    const defaultMastery = { know: false, play: false, use: false };
    return state.lessons[String(id)] || defaultMastery;
  }

  function setMastery(id, tier) {
    const key = String(id);
    if (!state.lessons[key]) {
      state.lessons[key] = { know: false, play: false, use: false };
    }

    const currentStatus = state.lessons[key][tier];
    const newStatus = !currentStatus;
    state.lessons[key][tier] = newStatus;

    // Valores de XP por patamar
    const xpValues = { know: 25, play: 50, use: 100 };
    const delta = xpValues[tier] || 0;

    if (newStatus) {
      state.xp = (state.xp || 0) + delta;
      registerStudyActivity();
    } else {
      state.xp = Math.max(0, (state.xp || 0) - delta);
    }

    saveState();
    renderStats();
    renderNav();
    renderLesson(activeLessonId);
  }

  // --- Carregamento dos Dados ---
  async function loadLessons() {
    try {
      const response = await fetch('./lessons.json');
      if (!response.ok) {
        throw new Error(`Falha ao carregar lessons.json (status: ${response.status})`);
      }
      const data = await response.json();
      courseData = data.course;
      lessons = data.lessons || [];

      if (!lessons.length) {
        throw new Error('Nenhuma aula encontrada em lessons.json');
      }

      // Inicializa aula ativa
      activeLessonId = lessons[0].id;
      activeWeek = lessons[0].week || 1;

      renderApp();
    } catch (err) {
      console.error('Erro na inicialização do curso:', err);
      const lessonContainer = $('#lesson');
      if (lessonContainer) {
        lessonContainer.innerHTML = `
          <div class="panel" style="border-left: 4px solid var(--hot); background: #26161d;">
            <h3>Erro ao carregar dados do curso</h3>
            <p class="muted">Não foi possível ler o arquivo <code>lessons.json</code>. Certifique-se de executar o projeto através de um servidor local (ex: <code>python3 -m http.server 8000</code>) para permitir requisições fetch.</p>
            <pre class="tab">${esc(err.message)}</pre>
          </div>
        `;
      }
    }
  }

  // --- Renderização de Estatísticas e Progresso ---
  function renderStats() {
    const xp = state.xp || 0;
    const level = getLevel(xp);
    const xpInLevel = xp % 350;

    $('#xp').textContent = xp;
    $('#level').textContent = `Nível ${level}`;
    $('#levelProgress').textContent = `${xpInLevel} / 350 XP`;
    $('#streak').textContent = state.streak || 0;

    // Contagem de aulas
    const total = lessons.length || 10;
    let masteredCount = 0;
    let inProgressCount = 0;

    lessons.forEach(l => {
      const m = getLessonMastery(l.id);
      if (m.use) {
        masteredCount++;
      } else if (m.know || m.play) {
        inProgressCount++;
      }
    });

    const percent = Math.min(100, Math.round((masteredCount / total) * 100));
    $('#progressText').textContent = `${masteredCount} / ${total} aulas dominadas`;
    $('#progressBar').style.width = `${percent}%`;
    $('#progressBar').parentElement.setAttribute('aria-valuenow', percent);

    const masteryStatsEl = $('#masteryStats');
    if (masteryStatsEl) {
      masteryStatsEl.textContent = `${masteredCount} dominadas (Consigo usar) · ${inProgressCount} em progresso`;
    }
  }

  // --- Renderização da Navegação e Semanas ---
  function renderNav() {
    // Obter lista única de semanas ordenada dinamicamente
    const weekMap = new Map();
    lessons.forEach(l => {
      const w = l.week || 1;
      if (!weekMap.has(w)) {
        weekMap.set(w, []);
      }
      weekMap.get(w).push(l);
    });

    const availableWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);

    // Abas de semanas
    const weekTabsEl = $('#weekTabs');
    if (weekTabsEl) {
      weekTabsEl.innerHTML = availableWeeks.map(w => {
        const isActive = w === activeWeek;
        const weekLessons = weekMap.get(w);
        const startId = weekLessons[0]?.id;
        const endId = weekLessons[weekLessons.length - 1]?.id;
        return `
          <button class="week-tab-btn ${isActive ? 'active' : ''}" data-week="${w}" title="Semana ${w} (Aulas ${startId} a ${endId})">
            <span class="week-tab-label">Semana ${w}</span>
            <span class="week-tab-sub">${startId}–${endId}</span>
          </button>
        `;
      }).join('');

      // Event listeners para as abas
      weekTabsEl.querySelectorAll('button[data-week]').forEach(btn => {
        btn.onclick = () => {
          const w = parseInt(btn.dataset.week, 10);
          activeWeek = w;
          const firstLesson = lessons.find(l => l.week === w);
          if (firstLesson) {
            activeLessonId = firstLesson.id;
          }
          renderNav();
          renderLesson(activeLessonId);
        };
      });
    }

    const currentWeekTitleEl = $('#currentWeekTitle');
    if (currentWeekTitleEl) {
      currentWeekTitleEl.textContent = `Semana ${activeWeek}`;
    }

    // Lista de aulas da semana ativa
    const filteredLessons = lessons.filter(l => l.week === activeWeek);
    const lessonListEl = $('#lessonList');
    if (lessonListEl) {
      lessonListEl.innerHTML = filteredLessons.map(l => {
        const isActive = l.id === activeLessonId;
        const m = getLessonMastery(l.id);

        let statusClass = 'status-not-started';
        let statusLabel = 'Não iniciada';
        if (m.use) {
          statusClass = 'status-mastered';
          statusLabel = 'Consigo usar';
        } else if (m.know || m.play) {
          statusClass = 'status-in-progress';
          statusLabel = 'Em progresso';
        }

        const badges = [];
        if (m.know) badges.push('🟡');
        if (m.play) badges.push('🟠');
        if (m.use) badges.push('🔵');

        return `
          <button class="lesson-item ${isActive ? 'active' : ''}" data-lesson-id="${l.id}">
            <span class="lesson-num">${String(l.id).padStart(2, '0')}</span>
            <div class="lesson-info">
              <span class="lesson-title">${esc(l.title)}</span>
              <div>
                <span class="lesson-status-pill ${statusClass}">${statusLabel}</span>
                ${badges.length ? `<span class="badges-row">${badges.join('')}</span>` : ''}
              </div>
            </div>
          </button>
        `;
      }).join('');

      // Event listeners para os itens da lista
      lessonListEl.querySelectorAll('.lesson-item').forEach(btn => {
        btn.onclick = () => {
          const id = parseInt(btn.dataset.lessonId, 10);
          openLesson(id);
        };
      });
    }
  }

  function openLesson(id) {
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) return;
    activeLessonId = id;
    activeWeek = lesson.week || 1;
    renderNav();
    renderLesson(id);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  }

  // --- Banco de Formatos dos 5 Shapes de Am Pentatônica ---
  const SHAPE_DEFINITIONS = {
    1: {
      startFret: 5,
      endFret: 8,
      notes: [
        { string: 6, fret: 5, note: 'A', interval: '1', role: 'root' },
        { string: 6, fret: 8, note: 'C', interval: 'b3', role: 'third' },
        { string: 5, fret: 5, note: 'D', interval: '4', role: 'four' },
        { string: 5, fret: 7, note: 'E', interval: '5', role: 'fifth' },
        { string: 4, fret: 5, note: 'G', interval: 'b7', role: 'seven' },
        { string: 4, fret: 7, note: 'A', interval: '1', role: 'root' },
        { string: 3, fret: 5, note: 'C', interval: 'b3', role: 'third' },
        { string: 3, fret: 7, note: 'D', interval: '4', role: 'four' },
        { string: 2, fret: 5, note: 'E', interval: '5', role: 'fifth' },
        { string: 2, fret: 8, note: 'G', interval: 'b7', role: 'seven' },
        { string: 1, fret: 5, note: 'A', interval: '1', role: 'root' },
        { string: 1, fret: 8, note: 'C', interval: 'b3', role: 'third' }
      ]
    },
    2: {
      startFret: 7,
      endFret: 10,
      notes: [
        { string: 6, fret: 8, note: 'C', interval: 'b3', role: 'third' },
        { string: 6, fret: 10, note: 'D', interval: '4', role: 'four' },
        { string: 5, fret: 7, note: 'E', interval: '5', role: 'fifth' },
        { string: 5, fret: 10, note: 'G', interval: 'b7', role: 'seven' },
        { string: 4, fret: 7, note: 'A', interval: '1', role: 'root' },
        { string: 4, fret: 10, note: 'C', interval: 'b3', role: 'third' },
        { string: 3, fret: 7, note: 'D', interval: '4', role: 'four' },
        { string: 3, fret: 9, note: 'E', interval: '5', role: 'fifth' },
        { string: 2, fret: 8, note: 'G', interval: 'b7', role: 'seven' },
        { string: 2, fret: 10, note: 'A', interval: '1', role: 'root' },
        { string: 1, fret: 8, note: 'C', interval: 'b3', role: 'third' },
        { string: 1, fret: 10, note: 'D', interval: '4', role: 'four' }
      ]
    },
    3: {
      startFret: 9,
      endFret: 13,
      notes: [
        { string: 6, fret: 10, note: 'D', interval: '4', role: 'four' },
        { string: 6, fret: 12, note: 'E', interval: '5', role: 'fifth' },
        { string: 5, fret: 10, note: 'G', interval: 'b7', role: 'seven' },
        { string: 5, fret: 12, note: 'A', interval: '1', role: 'root' },
        { string: 4, fret: 10, note: 'C', interval: 'b3', role: 'third' },
        { string: 4, fret: 12, note: 'D', interval: '4', role: 'four' },
        { string: 3, fret: 9, note: 'E', interval: '5', role: 'fifth' },
        { string: 3, fret: 12, note: 'G', interval: 'b7', role: 'seven' },
        { string: 2, fret: 10, note: 'A', interval: '1', role: 'root' },
        { string: 2, fret: 13, note: 'C', interval: 'b3', role: 'third' },
        { string: 1, fret: 10, note: 'D', interval: '4', role: 'four' },
        { string: 1, fret: 12, note: 'E', interval: '5', role: 'fifth' }
      ]
    },
    4: {
      startFret: 12,
      endFret: 15,
      notes: [
        { string: 6, fret: 12, note: 'E', interval: '5', role: 'fifth' },
        { string: 6, fret: 15, note: 'G', interval: 'b7', role: 'seven' },
        { string: 5, fret: 12, note: 'A', interval: '1', role: 'root' },
        { string: 5, fret: 15, note: 'C', interval: 'b3', role: 'third' },
        { string: 4, fret: 12, note: 'D', interval: '4', role: 'four' },
        { string: 4, fret: 14, note: 'E', interval: '5', role: 'fifth' },
        { string: 3, fret: 12, note: 'G', interval: 'b7', role: 'seven' },
        { string: 3, fret: 14, note: 'A', interval: '1', role: 'root' },
        { string: 2, fret: 13, note: 'C', interval: 'b3', role: 'third' },
        { string: 2, fret: 15, note: 'D', interval: '4', role: 'four' },
        { string: 1, fret: 12, note: 'E', interval: '5', role: 'fifth' },
        { string: 1, fret: 15, note: 'G', interval: 'b7', role: 'seven' }
      ]
    },
    5: {
      startFret: 14,
      endFret: 17,
      notes: [
        { string: 6, fret: 15, note: 'G', interval: 'b7', role: 'seven' },
        { string: 6, fret: 17, note: 'A', interval: '1', role: 'root' },
        { string: 5, fret: 15, note: 'C', interval: 'b3', role: 'third' },
        { string: 5, fret: 17, note: 'D', interval: '4', role: 'four' },
        { string: 4, fret: 14, note: 'E', interval: '5', role: 'fifth' },
        { string: 4, fret: 17, note: 'G', interval: 'b7', role: 'seven' },
        { string: 3, fret: 14, note: 'A', interval: '1', role: 'root' },
        { string: 3, fret: 17, note: 'C', interval: 'b3', role: 'third' },
        { string: 2, fret: 15, note: 'D', interval: '4', role: 'four' },
        { string: 2, fret: 17, note: 'E', interval: '5', role: 'fifth' },
        { string: 1, fret: 15, note: 'G', interval: 'b7', role: 'seven' },
        { string: 1, fret: 17, note: 'A', interval: '1', role: 'root' }
      ]
    }
  };

  // Frequências para sintetizador de áudio de notas da guitarra
  const OPEN_STRING_FREQS = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]; // Cordas 1 (e) a 6 (E)

  function playNoteTone(stringNum, fret) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const openFreq = OPEN_STRING_FREQS[stringNum - 1] || 110;
      const freq = openFreq * Math.pow(2, fret / 12);

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.85);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Renderizador gráfico do diagrama do braço (Box Fretboard)
  function renderGraphicalFretboard(shapeNum, lesson) {
    const lessonObj = typeof lesson === 'object' && lesson !== null ? lesson : lessons.find(l => l.id === lesson) || {};
    const lessonId = lessonObj.id || (typeof lesson === 'number' ? lesson : 1);
    const shapeDef = SHAPE_DEFINITIONS[shapeNum] || SHAPE_DEFINITIONS[1];
    const startFret = lessonObj.fretboard?.startFret || shapeDef.startFret;
    const endFret = lessonObj.fretboard?.endFret || shapeDef.endFret;
    const fretCount = endFret - startFret + 1;
    const frets = Array.from({ length: fretCount }, (_, i) => startFret + i);

    // Usa as notas customizadas da aula se fornecidas; caso contrário, usa o SHAPE_DEFINITIONS
    const baseNotes = lessonObj.fretboard?.notes || shapeDef.notes;

    // Ajusta destaques específicos de acordo com o tema da aula
    const notes = baseNotes.map(n => {
      let isFeatured = true;
      if (lessonId === 2) {
        // Aula 2: 1, b3 e 5
        isFeatured = ['1', 'b3', '5'].includes(n.interval);
      } else if (lessonId === 3) {
        // Aula 3: 1 e 5
        isFeatured = ['1', '5'].includes(n.interval);
      } else if (lessonId === 4) {
        // Aula 4: foco em b3
        isFeatured = n.interval === 'b3' || ['1', '5'].includes(n.interval);
      } else if (lessonId === 5) {
        // Aula 5: tensões b7 e 4
        isFeatured = ['b7', '4'].includes(n.interval);
      } else if (lessonId === 12) {
        // Aula 12: foco em 4 e b3
        isFeatured = ['4', 'b3'].includes(n.interval);
      } else if (lessonId === 13) {
        // Aula 13: foco em b7 e 1
        isFeatured = ['b7', '1'].includes(n.interval);
      } else if (lessonId === 16) {
        // Aula 16: foco na tríade e silêncio
        isFeatured = ['1', 'b3', '5'].includes(n.interval);
      } else if (lessonId === 18) {
        // Aula 18: pergunta (4, b7) e resposta (1, 5)
        isFeatured = ['1', '4', '5', 'b7'].includes(n.interval);
      } else if (lessonId === 19) {
        // Aula 19: notas de bend (4->5 e b7->1)
        isFeatured = ['4', '5', 'b7', '1'].includes(n.interval);
      }
      return { ...n, isFeatured };
    });

    const stringGauges = [1.5, 2.0, 2.6, 3.2, 3.8, 4.6]; // e até E
    const stringNames = ['e (1ª)', 'B (2ª)', 'G (3ª)', 'D (4ª)', 'A (5ª)', 'E (6ª)'];

    let html = `
      <div class="fretboard-graphical-box">
        <!-- Barra de Cabeçalho de Casas -->
        <div class="fretboard-fret-header" style="grid-template-columns: 80px repeat(${fretCount}, 1fr);">
          <div class="fret-num-label string-head-col">Corda</div>
          ${frets.map(f => {
            const hasInlay = [3, 5, 7, 9, 15, 17, 19, 21].includes(f);
            const isDouble = f === 12;
            let inlayHtml = '';
            if (isDouble) inlayHtml = '<span class="fret-inlay-dot double"></span><span class="fret-inlay-dot double"></span>';
            else if (hasInlay) inlayHtml = '<span class="fret-inlay-dot"></span>';
            return `
              <div class="fret-num-label">
                <span class="fret-num">${f}ª</span>
                ${inlayHtml}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Grade de Cordas e Trastes -->
        <div class="fretboard-strings-grid">
    `;

    // Renderiza cada corda da 1ª (alta e) até a 6ª (baixa E)
    for (let sIdx = 0; sIdx < 6; sIdx++) {
      const stringNum = sIdx + 1;
      const sName = stringNames[sIdx];
      const gauge = stringGauges[sIdx];

      html += `
        <div class="fretboard-string-row" style="grid-template-columns: 80px repeat(${fretCount}, 1fr);">
          <div class="string-indicator">${sName}</div>
      `;

      // Células de trastes para esta corda
      for (let fIdx = 0; fIdx < fretCount; fIdx++) {
        const fret = frets[fIdx];
        const noteFound = notes.find(n => n.string === stringNum && n.fret === fret);

        let noteHtml = '';
        if (noteFound) {
          const featuredClass = noteFound.isFeatured ? 'featured' : 'dimmed-note';
          noteHtml = `
            <button class="fret-note-dot role-${noteFound.role} ${featuredClass}"
                    data-string="${stringNum}"
                    data-fret="${fret}"
                    title="Corda ${stringNum}, Casa ${fret}: ${noteFound.note} (Grau ${noteFound.interval}) - Clique para ouvir">
              <span class="note-interval">${noteFound.interval}</span>
              <span class="note-name">${noteFound.note}</span>
            </button>
          `;
        }

        html += `
          <div class="fret-cell">
            <div class="guitar-wire" style="height: ${gauge}px;"></div>
            ${noteHtml}
          </div>
        `;
      }

      html += `</div>`;
    }

    const legendItems = lessonObj.fretboard?.legend || [
      { role: 'root', label: '1 = Tônica (A)' },
      { role: 'third', label: 'b3 = Terça Menor (C)' },
      { role: 'fifth', label: '5 = Quinta Justa (E)' },
      { role: 'four', label: '4 = Quarta Justa (D)' },
      { role: 'seven', label: 'b7 = Sétima Menor (G)' }
    ];

    html += `
        </div>
        <!-- Legenda de Cores -->
        <div class="fret-box-legend">
          ${legendItems.map(item => `
            <span class="legend-item"><i class="legend-circle role-${item.role}"></i> ${esc(item.label)}</span>
          `).join('')}
          <span class="legend-hint">💡 Dica: Clique nas notas para ouvir o som na guitarra!</span>
        </div>
      </div>
    `;

    return html;
  }

  // Parser e Renderizador Gráfico da Tablatura
  function renderGraphicalTab(tabText, lesson) {
    const lines = tabText.split('\n').map(l => l.trim()).filter(l => /^[eBGDAE]\|/.test(l));
    if (lines.length !== 6) return null;

    const stringOrder = ['e', 'B', 'G', 'D', 'A', 'E'];
    const stringLines = {};
    lines.forEach(l => {
      const sName = l.charAt(0);
      stringLines[sName] = l.slice(2);
    });

    const maxLen = Math.max(...Object.values(stringLines).map(c => c.length));
    const columns = [];

    let col = 0;
    while (col < maxLen) {
      const notesInCol = [];
      let advanced = 1;

      for (let sIdx = 0; sIdx < 6; sIdx++) {
        const sName = stringOrder[sIdx];
        const strContent = stringLines[sName] || '';
        if (col < strContent.length) {
          const char = strContent[col];
          if (/\d/.test(char)) {
            let numStr = char;
            let displayLabel = char;
            const remaining = strContent.slice(col);
            const bendMatch = remaining.match(/^(\d{1,2}(?:b\d{1,2}(?:r\d{1,2})?|~~~)?)/);
            if (bendMatch && bendMatch[1]) {
              displayLabel = bendMatch[1];
              numStr = bendMatch[1].split(/[br~]/)[0];
              advanced = Math.max(advanced, bendMatch[1].length);
            } else if (col + 1 < strContent.length && /\d/.test(strContent[col + 1])) {
              numStr += strContent[col + 1];
              displayLabel = numStr;
              advanced = Math.max(advanced, 2);
            }

            const fret = parseInt(numStr, 10);
            const openPitch = TUNING[sIdx];
            const noteName = NOTES_SCALE[(openPitch + fret) % 12];
            let interval = '';
            let role = 'neutral';

            const keyStr = (lesson?.key || '').toLowerCase();
            if (keyStr.includes('g major')) {
              if (noteName === 'G') { interval = '1'; role = 'root'; }
              else if (noteName === 'B') { interval = '3'; role = 'third'; }
              else if (noteName === 'D') { interval = '5'; role = 'fifth'; }
              else if (noteName === 'C') { interval = '4'; role = 'four'; }
              else if (noteName === 'F#') { interval = '7'; role = 'seven'; }
              else if (noteName === 'A') { interval = '2'; role = 'neutral'; }
              else if (noteName === 'E') { interval = '6'; role = 'neutral'; }
            } else if (keyStr.includes('c major') && !keyStr.includes('a minor')) {
              if (noteName === 'C') { interval = '1'; role = 'root'; }
              else if (noteName === 'E') { interval = '3'; role = 'third'; }
              else if (noteName === 'G') { interval = '5'; role = 'fifth'; }
              else if (noteName === 'F') { interval = '4'; role = 'four'; }
              else if (noteName === 'B') { interval = '7'; role = 'seven'; }
              else if (noteName === 'D') { interval = '2'; role = 'neutral'; }
              else if (noteName === 'A') { interval = '6'; role = 'neutral'; }
            } else if (lesson?.id === 23 || (keyStr.includes('a major') && !keyStr.includes('c major'))) {
              if (noteName === 'A') { interval = '1'; role = 'root'; }
              else if (noteName === 'C#') { interval = '3'; role = 'third'; }
              else if (noteName === 'C') { interval = 'b3'; role = 'third'; }
              else if (noteName === 'E') { interval = '5'; role = 'fifth'; }
              else if (noteName === 'D') { interval = '4'; role = 'four'; }
              else if (noteName === 'G') { interval = 'b7'; role = 'seven'; }
              else if (noteName === 'B') { interval = '2'; role = 'neutral'; }
              else if (noteName === 'F#') { interval = '6'; role = 'neutral'; }
            } else {
              // Padrão A menor / Am
              if (noteName === 'A') { interval = '1'; role = 'root'; }
              else if (noteName === 'C') { interval = 'b3'; role = 'third'; }
              else if (noteName === 'E') { interval = '5'; role = 'fifth'; }
              else if (noteName === 'D') { interval = '4'; role = 'four'; }
              else if (noteName === 'G') { interval = 'b7'; role = 'seven'; }
              else if (noteName === 'B') { interval = '2'; role = 'neutral'; }
              else if (noteName === 'F') { interval = 'b6'; role = 'neutral'; }
            }

            notesInCol.push({
              string: sIdx + 1,
              stringName: sName,
              fret,
              displayLabel,
              noteName,
              interval,
              role
            });
          }
        }
      }

      if (notesInCol.length > 0) {
        columns.push(notesInCol);
      }
      col += advanced;
    }

    if (!columns.length) return null;

    // Renderiza a pauta gráfica da tablatura
    let html = `
      <div class="graphical-tab-container">
        <div class="tab-staff">
          <!-- Cabeçalho TAB -->
          <div class="tab-clef">
            <span>T</span>
            <span>A</span>
            <span>B</span>
          </div>

          <!-- Coluna com os nomes das cordas -->
          <div class="tab-string-names">
            <span>e</span>
            <span>B</span>
            <span>G</span>
            <span>D</span>
            <span>A</span>
            <span>E</span>
          </div>

          <!-- Pauta de cordas com as notas posicionadas -->
          <div class="tab-notes-flow">
            <!-- Linhas horizontais das cordas -->
            <div class="tab-lines-bg">
              <div class="tab-line"></div>
              <div class="tab-line"></div>
              <div class="tab-line"></div>
              <div class="tab-line"></div>
              <div class="tab-line"></div>
              <div class="tab-line"></div>
            </div>

            <!-- Colunas de notas -->
            <div class="tab-columns-container">
              ${columns.map((colNotes, colIdx) => `
                <div class="tab-column" data-step="${colIdx + 1}">
                  ${colNotes.map(n => `
                    <button class="tab-fret-badge role-${n.role} string-pos-${n.string}"
                            data-string="${n.string}"
                            data-fret="${n.fret}"
                            title="Passo ${colIdx + 1}: Corda ${n.stringName}, Casa ${n.displayLabel || n.fret} [${n.noteName} · Grau ${n.interval}] - Clique para ouvir">
                      <span class="tab-fret-number">${esc(n.displayLabel || n.fret)}</span>
                      <span class="tab-hover-pill">${n.noteName} (${n.interval})</span>
                    </button>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="tab-footer-hint">
          <span>🎵 <strong>Notação Gráfica Ativa:</strong> As notas estão dispostas na ordem de execução. Clique em qualquer número para ouvir o som!</span>
        </div>
      </div>
    `;

    return html;
  }

  // --- Renderização da Tela de Detalhes da Aula ---
  function renderLesson(id) {
    const lesson = lessons.find(l => l.id === id);
    const container = $('#lesson');
    if (!lesson || !container) return;

    const m = getLessonMastery(lesson.id);

    // Formatação de Vídeo (sem inventar URLs)
    let videoHtml = '';
    if (lesson.video && lesson.video.url) {
      videoHtml = `
        <div class="video-card">
          <div style="background:#111522; border-radius:8px; display:flex; align-items:center; justify-content:center; aspect-ratio:16/9; border:1px solid var(--line);">
            <span style="font-size:2rem;">🎸</span>
          </div>
          <div>
            <p class="eyebrow">RECURSO DE VÍDEO SELECIONADO</p>
            <h4>${esc(lesson.video.title)}</h4>
            <p class="muted small">${esc(lesson.video.source || 'Vídeo de apoio pedagógico.')}</p>
            <a href="${esc(lesson.video.url)}" target="_blank" rel="noopener noreferrer">Abrir vídeo de apoio ↗</a>
          </div>
        </div>
      `;
    } else {
      videoHtml = `
        <div class="no-video-card">
          <span>🎬</span>
          <div>
            <b>Vídeo de referência:</b>
            <span>Vídeo específico ainda não selecionado.</span>
          </div>
        </div>
      `;
    }

    // Formatação de Backing Track
    let backingTrackHtml = '';
    if (lesson.backingTrack && lesson.backingTrack.url) {
      backingTrackHtml = `<a href="${esc(lesson.backingTrack.url)}" target="_blank" rel="noopener noreferrer">${esc(lesson.backingTrack.title)} ↗</a>`;
    } else {
      backingTrackHtml = `
        <p class="muted small">
          <b>Backing track:</b> ainda não configurado (pesquisa recomendada no YouTube: <code>${esc(lesson.key || 'Am')} backing track 75 bpm</code>).
        </p>
      `;
    }

    // Rotina de Técnica (30 min)
    let techRoutineHtml = '';
    if (lesson.technicalPractice && lesson.technicalPractice.routine) {
      techRoutineHtml = `
        <article class="section wide tech-block">
          <h3>
            <span>Técnica &amp; Articulação</span>
            <span class="tech-split-tag">${esc(lesson.technicalPractice.duration || '30 min')}</span>
          </h3>
          <p class="muted small"><b>Foco:</b> ${esc(lesson.technicalPractice.focus || 'Desenvolvimento motor e precisão.')}</p>
          <ol>
            ${lesson.technicalPractice.routine.map(item => `<li>${esc(item)}</li>`).join('')}
          </ol>
        </article>
      `;
    }

    // Exercícios específicos
    const exercisesList = Array.isArray(lesson.exercises) ? lesson.exercises : [];
    const mistakesList = Array.isArray(lesson.commonMistakes) ? lesson.commonMistakes : [];

    // Botões de navegação Próxima / Anterior
    const currentIndex = lessons.findIndex(l => l.id === id);
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    // Renderização do Diagrama Gráfico do Braço e Tablatura
    const shapeNum = lesson.fretboard?.shape || 1;
    const graphicalFretboardHtml = renderGraphicalFretboard(shapeNum, lesson);
    const graphicalTabHtml = renderGraphicalTab(lesson.fretboard?.tab || '', lesson);

    // Cálculo do XP acumulado na aula ativa
    const currentLessonXp = (m.know ? 25 : 0) + (m.play ? 50 : 0) + (m.use ? 100 : 0);
    const masteryStepsDone = (m.know ? 1 : 0) + (m.play ? 1 : 0) + (m.use ? 1 : 0);
    const masteryPercent = Math.round((currentLessonXp / 175) * 100);

    const weekTotal = lessons.filter(l => l.week === lesson.week).length || 5;

    container.innerHTML = `
      <!-- 1. Semana / Aula kicker -->
      <p class="lesson-kicker">Semana ${lesson.week || 1} · Aula ${lesson.day || 1} de ${weekTotal}</p>

      <!-- 2. Título e Subtítulo -->
      <h2 class="lesson-title-main">${lesson.id}. ${esc(lesson.title)}</h2>
      <p class="lesson-subtitle">${esc(lesson.subtitle || '')}</p>

      <!-- Vídeo ou aviso de ausência -->
      ${videoHtml}

      <div class="sections">
        <!-- 3. Objetivo -->
        <article class="section">
          <h3>Objetivo</h3>
          <p>${esc(lesson.objective)}</p>
        </article>

        <!-- 4. Pré-requisito -->
        <article class="section">
          <h3>Pré-requisito</h3>
          <p>${esc(lesson.prerequisite)}</p>
        </article>

        <!-- 5. Conceito -->
        <article class="section wide">
          <h3>Conceito Fundamental</h3>
          <p>${esc(lesson.concept)}</p>
        </article>

        <!-- 6. Mapa do braço & Shape info (GRÁFICO + TOGGLE ASCII) -->
        <article class="section wide">
          <div class="section-title-bar">
            <h3>
              <span>Mapa de Intervalos no Braço</span>
              <span class="badge phase-badge">Shape ${shapeNum} · ${lesson.fretboard?.position || 5}ª Casa</span>
            </h3>
            <div class="view-toggle-group">
              <button class="view-toggle-btn active" data-toggle-target="#graphicalFretboard_${lesson.id}" data-toggle-hide="#asciiFretboard_${lesson.id}">
                🎨 Visual Gráfico
              </button>
              <button class="view-toggle-btn" data-toggle-target="#asciiFretboard_${lesson.id}" data-toggle-hide="#graphicalFretboard_${lesson.id}">
                📄 Texto ASCII
              </button>
            </div>
          </div>
          <p class="muted small">Visualização anatômica da escala. Clique em qualquer nota para ouvir o tom afinado:</p>
          
          <div id="graphicalFretboard_${lesson.id}">
            ${graphicalFretboardHtml}
          </div>
          <div id="asciiFretboard_${lesson.id}" style="display: none;">
            <pre class="tab">${esc(lesson.fretboard?.intervalMap || '')}</pre>
          </div>
        </article>

        <!-- 7. TAB Oficial (GRÁFICA + TOGGLE ASCII) -->
        <article class="section wide">
          <div class="section-title-bar">
            <h3>
              <span>Digitação &amp; Tablatura Oficial</span>
              <span class="badge phase-badge">Palhetada Alternada</span>
            </h3>
            <div class="view-toggle-group">
              <button class="view-toggle-btn active" data-toggle-target="#graphicalTab_${lesson.id}" data-toggle-hide="#asciiTab_${lesson.id}">
                🎼 Tablatura Gráfica
              </button>
              <button class="view-toggle-btn" data-toggle-target="#asciiTab_${lesson.id}" data-toggle-hide="#graphicalTab_${lesson.id}">
                📄 TAB Texto
              </button>
            </div>
          </div>
          <p class="muted small">Notação moderna com as notas dispostas na pauta de 6 cordas. Clique nos números para ouvir a afinação:</p>

          <div id="graphicalTab_${lesson.id}">
            ${graphicalTabHtml || `<pre class="tab">${esc(lesson.fretboard?.tab || '')}</pre>`}
          </div>
          <div id="asciiTab_${lesson.id}" style="display: none;">
            <pre class="tab">${esc(lesson.fretboard?.tab || '')}</pre>
          </div>
        </article>

        <!-- 8. Exercícios específicos -->
        <article class="section wide">
          <h3>Exercícios Práticos</h3>
          <ul>
            ${exercisesList.map(ex => `<li>${esc(ex)}</li>`).join('')}
          </ul>
        </article>

        <!-- Bloco 1: Teoria, Ouvido & Improvisação (30 min) -->
        <!-- 9. Treino de ouvido -->
        <article class="section routine-block">
          <h3>
            <span>Treino de Ouvido</span>
            <span class="routine-split-tag">Bloco Teoria/Ouvido</span>
          </h3>
          <p>${esc(lesson.earTraining?.instruction || '')}</p>
        </article>

        <!-- 10. Improvisação -->
        <article class="section routine-block">
          <h3>
            <span>Improvisação Guiada</span>
            <span class="routine-split-tag">Aplicação Musical</span>
          </h3>
          <p>${esc(lesson.improvisation?.instruction || '')}</p>
        </article>

        <!-- 11. Backing track -->
        <article class="section">
          <h3>Backing Track</h3>
          ${backingTrackHtml}
        </article>

        <!-- 13. Erros comuns -->
        <article class="section">
          <h3>Erros Comuns</h3>
          <ul>
            ${mistakesList.map(err => `<li>${esc(err)}</li>`).join('')}
          </ul>
        </article>

        <!-- 12. Rotina de Técnica (30 min) -->
        ${techRoutineHtml}

        <!-- 14. Critério de domínio -->
        <article class="section wide">
          <h3>Critério de Domínio</h3>
          <p>${esc(lesson.mastery?.use || 'Capacidade de aplicar os conceitos conscientemente sob pressão e em tempo real.')}</p>
        </article>

        <!-- 15. Mastery (PROGRESSÃO CUMULATIVA EM 3 ETAPAS) -->
        <article class="mastery-container">
          <div class="mastery-banner">
            <div class="mastery-banner-header">
              <div>
                <span class="mastery-badge-tag">PROGRESSÃO CUMULATIVA · ETAPA 1 → ETAPA 2 → ETAPA 3</span>
                <h4>Seu Progresso de Maestria nesta Aula</h4>
                <p class="muted small">
                  Os 3 botões são <strong>cumulativos</strong>! Você deve ir marcando cada etapa de acordo com o seu avanço nos estudos diários. Cada conquista soma pontos até o total de <strong>175 XP</strong> por aula.
                </p>
              </div>
              <div class="mastery-total-box">
                <strong class="xp-earned-counter">${currentLessonXp} / 175 XP</strong>
                <span class="muted small">${masteryStepsDone} de 3 etapas concluídas</span>
              </div>
            </div>

            <!-- Barra de Progresso da Aula -->
            <div class="mastery-progress-track">
              <div class="mastery-progress-fill" style="width: ${masteryPercent}%;"></div>
            </div>

            <div class="mastery-actions-bar">
              <span class="mastery-hint-text">
                ${m.use ? '🏆 <strong>Parabéns!</strong> Você atingiu o domínio pleno (Consigo usar) nesta aula!' : '💡 Marque conforme você aprende, toca e improvisa:'}
              </span>
              <button id="toggleAllMasteryBtn" class="mastery-all-btn">
                ${(m.know && m.play && m.use) ? '↺ Desmarcar Todas' : '✓ Dominar Tudo (+175 XP)'}
              </button>
            </div>
          </div>

          <div class="mastery-grid">
            <!-- Etapa 1: Conheço -->
            <div class="mastery-card ${m.know ? 'active-know' : ''}" data-tier="know">
              <div class="mastery-card-header">
                <span class="mastery-step-num">ETAPA 1</span>
                <span class="mastery-xp-badge">+25 XP</span>
              </div>
              <span class="mastery-title">🟡 Conheço</span>
              <p class="mastery-desc">${esc(lesson.mastery?.know || 'Compreendo a teoria e os intervalos envolvidos.')}</p>
              <div class="mastery-check">${m.know ? '✓ Concluído (+25 XP)' : '+ Marcar Conheço'}</div>
            </div>

            <!-- Etapa 2: Consigo tocar -->
            <div class="mastery-card ${m.play ? 'active-play' : ''}" data-tier="play">
              <div class="mastery-card-header">
                <span class="mastery-step-num">ETAPA 2</span>
                <span class="mastery-xp-badge">+50 XP</span>
              </div>
              <span class="mastery-title">🟠 Consigo tocar</span>
              <p class="mastery-desc">${esc(lesson.mastery?.play || 'Executo os exercícios na velocidade e digitação correta.')}</p>
              <div class="mastery-check">${m.play ? '✓ Concluído (+50 XP)' : '+ Marcar Consigo tocar'}</div>
            </div>

            <!-- Etapa 3: Consigo usar -->
            <div class="mastery-card ${m.use ? 'active-use' : ''}" data-tier="use">
              <div class="mastery-card-header">
                <span class="mastery-step-num">ETAPA 3 (DOMÍNIO)</span>
                <span class="mastery-xp-badge">+100 XP</span>
              </div>
              <span class="mastery-title">🔵 Consigo usar</span>
              <p class="mastery-desc">${esc(lesson.mastery?.use || 'Aplico espontaneamente em improvisos reais.')}</p>
              <div class="mastery-check">${m.use ? '★ Dominado (+100 XP)' : '+ Marcar Consigo usar'}</div>
            </div>
          </div>
        </article>

        <!-- 16. Missão -->
        <article class="section wide" style="border-left-color: var(--cyan); background: #131b2e;">
          <h3 style="color: var(--cyan);">Missão da Aula</h3>
          <p style="font-size: 1.05rem; font-weight: 500;">${esc(lesson.mission)}</p>
        </article>
      </div>

      <!-- 17. Navegação entre aulas -->
      <div class="lesson-nav-footer">
        ${prevLesson
          ? `<button class="prev-btn" data-target="${prevLesson.id}">← Aula ${prevLesson.id}: ${esc(prevLesson.title)}</button>`
          : `<div></div>`
        }
        ${nextLesson
          ? `<button class="next-btn active" data-target="${nextLesson.id}">Próxima: Aula ${nextLesson.id} →</button>`
          : `<button class="active" style="background:var(--cyan); color:#031415;">🏆 Fase 1 Concluída!</button>`
        }
      </div>
    `;

    // Event listeners para alternar Visual Gráfico vs Texto ASCII
    container.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.onclick = () => {
        const group = btn.closest('.view-toggle-group');
        group.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetEl = container.querySelector(btn.dataset.toggleTarget);
        const hideEl = container.querySelector(btn.dataset.toggleHide);
        if (targetEl) targetEl.style.display = 'block';
        if (hideEl) hideEl.style.display = 'none';
      };
    });

    // Event listeners para cliques em notas gráficas (síntese sonora)
    container.querySelectorAll('button[data-string][data-fret]').forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const s = parseInt(btn.dataset.string, 10);
        const f = parseInt(btn.dataset.fret, 10);
        playNoteTone(s, f);
        btn.classList.add('note-plucked');
        setTimeout(() => btn.classList.remove('note-plucked'), 400);
      };
    });

    // Event listeners para os cards de Mastery
    container.querySelectorAll('.mastery-card').forEach(card => {
      card.onclick = () => {
        const tier = card.dataset.tier;
        setMastery(lesson.id, tier);
      };
    });

    // Event listener para botão "Dominar Tudo / Desmarcar Tudo"
    const toggleAllBtn = container.querySelector('#toggleAllMasteryBtn');
    if (toggleAllBtn) {
      toggleAllBtn.onclick = () => {
        const allChecked = m.know && m.play && m.use;
        const key = String(lesson.id);
        if (!state.lessons[key]) {
          state.lessons[key] = { know: false, play: false, use: false };
        }

        if (allChecked) {
          // Desmarcar todas
          if (state.lessons[key].know) { state.xp = Math.max(0, state.xp - 25); state.lessons[key].know = false; }
          if (state.lessons[key].play) { state.xp = Math.max(0, state.xp - 50); state.lessons[key].play = false; }
          if (state.lessons[key].use) { state.xp = Math.max(0, state.xp - 100); state.lessons[key].use = false; }
        } else {
          // Marcar todas
          if (!state.lessons[key].know) { state.xp = (state.xp || 0) + 25; state.lessons[key].know = true; }
          if (!state.lessons[key].play) { state.xp = (state.xp || 0) + 50; state.lessons[key].play = true; }
          if (!state.lessons[key].use) { state.xp = (state.xp || 0) + 100; state.lessons[key].use = true; }
          registerStudyActivity();
        }

        saveState();
        renderStats();
        renderNav();
        renderLesson(activeLessonId);
      };
    }

    // Event listeners de navegação
    container.querySelectorAll('.lesson-nav-footer button[data-target]').forEach(btn => {
      btn.onclick = () => {
        const targetId = parseInt(btn.dataset.target, 10);
        openLesson(targetId);
      };
    });
  }

  // --- Ferramentas de Prática: Metrônomo e Timer ---
  let timerId = null;
  let timerSeconds = 1800; // 30 minutos

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function initTimer() {
    const timerBtn = $('#timer');
    const resetBtn = $('#timerReset');
    if (!timerBtn) return;

    timerBtn.textContent = `⏱ ${formatTime(timerSeconds)}`;

    timerBtn.onclick = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
        timerBtn.classList.remove('running');
      } else {
        timerBtn.classList.add('running');
        timerId = setInterval(() => {
          timerSeconds--;
          if (timerSeconds <= 0) {
            clearInterval(timerId);
            timerId = null;
            timerSeconds = 0;
            timerBtn.classList.remove('running');
            registerStudyActivity();
            saveState();
            renderStats();
            alert('⏱ Parabéns! Sessão de 30 minutos concluída com sucesso.');
          }
          timerBtn.textContent = `⏱ ${formatTime(timerSeconds)}`;
        }, 1000);
      }
    };

    if (resetBtn) {
      resetBtn.onclick = () => {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
          timerBtn.classList.remove('running');
        }
        timerSeconds = 1800;
        timerBtn.textContent = `⏱ 30:00`;
      };
    }
  }

  // Metrônomo via Web Audio API
  let metroInterval = null;
  let audioCtx = null;

  function initMetronome() {
    const metroBtn = $('#metro');
    const bpmInput = $('#bpm');
    if (!metroBtn || !bpmInput) return;

    function playClick() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    }

    metroBtn.onclick = () => {
      if (metroInterval) {
        clearInterval(metroInterval);
        metroInterval = null;
        metroBtn.textContent = '▶ Metrônomo';
        metroBtn.classList.remove('running');
      } else {
        let bpm = parseInt(bpmInput.value, 10);
        if (isNaN(bpm) || bpm < 30) bpm = 30;
        if (bpm > 240) bpm = 240;
        bpmInput.value = bpm;

        playClick();
        metroInterval = setInterval(playClick, (60 / bpm) * 1000);
        metroBtn.textContent = '⏹ Parar';
        metroBtn.classList.add('running');
      }
    };

    bpmInput.onchange = () => {
      if (metroInterval) {
        // Reinicia com o novo BPM
        metroBtn.click();
        metroBtn.click();
      }
    };
  }

  // --- Fretboard Lab Interativo ---
  const NOTES_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // Afinação padrão: 1ª (e=4), 2ª (B=11), 3ª (G=7), 4ª (D=2), 5ª (A=9), 6ª (E=4)
  const TUNING = [4, 11, 7, 2, 9, 4];
  let currentLayer = 'roots';

  function initFretboard() {
    const fretboardEl = $('#fretboard');
    if (!fretboardEl) return;

    function renderFretboard() {
      fretboardEl.innerHTML = TUNING.map((openIndex, stringIdx) => {
        const stringNum = 6 - stringIdx;
        const frets = Array.from({ length: 13 }, (_, fretNum) => {
          const noteIndex = (openIndex + fretNum) % 12;
          const noteName = NOTES_SCALE[noteIndex];

          let noteRoleClass = '';
          let isIncluded = false;

          if (noteName === 'A') {
            noteRoleClass = 'is-root';
            isIncluded = true;
          } else if (noteName === 'C') {
            noteRoleClass = 'is-third';
            isIncluded = currentLayer !== 'roots';
          } else if (noteName === 'E') {
            noteRoleClass = 'is-fifth';
            isIncluded = currentLayer !== 'roots';
          } else if (noteName === 'D' || noteName === 'G') {
            noteRoleClass = 'is-tension';
            isIncluded = currentLayer === 'penta' || currentLayer === 'minor' || currentLayer === 'all';
          } else if (noteName === 'B' || noteName === 'F') {
            isIncluded = currentLayer === 'minor' || currentLayer === 'all';
          } else {
            isIncluded = currentLayer === 'all';
          }

          const dimmedClass = isIncluded ? '' : 'dimmed';
          const roleClass = isIncluded ? noteRoleClass : '';

          return `
            <button
              class="note ${roleClass} ${dimmedClass}"
              data-note="${noteName}"
              title="Corda ${stringNum}, Casa ${fretNum} (${noteName})"
              aria-label="Corda ${stringNum}, Casa ${fretNum}, Nota ${noteName}">
              ${noteName}
            </button>
          `;
        }).join('');

        return `<div class="string">${frets}</div>`;
      }).join('');

      // Event listener para seleção individual de notas
      fretboardEl.querySelectorAll('.note').forEach(btn => {
        btn.onclick = () => btn.classList.toggle('selected');
      });
    }

    renderFretboard();

    // Controles de camadas
    const controls = $('#fretboardControls');
    if (controls) {
      controls.querySelectorAll('button[data-layer]').forEach(btn => {
        btn.onclick = () => {
          controls.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentLayer = btn.dataset.layer;
          renderFretboard();
        };
      });
    }
  }

  // --- Quiz Relâmpago Adaptado à Fase 1 ---
  const QUIZ_QUESTIONS = [
    {
      q: 'Qual nota é a Tônica (grau 1, ponto supremo de repouso) na pentatônica menor de Am?',
      choices: ['A', 'C', 'E', 'G'],
      answer: 0,
      explanation: 'Exato! A é a fundamental e o centro gravitacional tonal de A menor.'
    },
    {
      q: 'Quais notas compõem a tríade e os chord tones fundamentais de Am?',
      choices: ['A, C e E (1, b3, 5)', 'A, D e G (1, 4, b7)', 'A, B e E (1, 2, 5)', 'A, C# e E (1, 3M, 5)'],
      answer: 0,
      explanation: 'Correto! 1 (A), b3 (C) e 5 (E) formam o esqueleto harmônico inabalável do acorde.'
    },
    {
      q: 'Qual intervalo é responsável pela identidade menor e melancólica da escala pentatônica menor?',
      choices: ['Terça menor (b3 = C)', 'Quinta justa (5 = E)', 'Quarta justa (4 = D)', 'Sétima menor (b7 = G)'],
      answer: 0,
      explanation: 'Perfeito! A terça menor (b3) é a cor afetiva que define o acorde e a escala como menor.'
    },
    {
      q: 'Na dinâmica de Pergunta e Resposta, qual grau atua naturalmente como repouso aberto/pergunta?',
      choices: ['Quinta justa (5 = E)', 'Tônica (1 = A)', 'Quarta justa (4 = D)', 'Segunda maior (2 = B)'],
      answer: 0,
      explanation: 'Muito bem! A quinta (E) gera uma semi-cadência que pede a resolução na tônica (A).'
    },
    {
      q: 'Quais são as duas notas de tensão da pentatônica menor e seus caminhos naturais de resolução?',
      choices: [
        'b7 (G) resolve em 1 (A), e 4 (D) resolve em b3 (C)',
        '4 (D) resolve em 5 (E), e b3 (C) resolve em 1 (A)',
        'b7 (G) resolve em 5 (E), e 1 (A) resolve em 4 (D)',
        'Todas as notas resolvem livremente sem gravidade tonal'
      ],
      answer: 0,
      explanation: 'Excelente! b7 puxa para a tônica e 4 puxa para a terça menor.'
    },
    {
      q: 'Em qual região do braço situa-se a posição principal do Shape 1 de Am pentatônica?',
      choices: ['5ª casa', '12ª casa', '8ª casa', '10ª casa'],
      answer: 0,
      explanation: 'Isso aí! O Shape 1 clássico ancora-se na tônica A da 6ª corda, 5ª casa.'
    }
  ];

  let currentQuizIndex = 0;

  function initQuiz() {
    const qEl = $('#quizQuestion');
    const choicesEl = $('#quizChoices');
    const feedbackEl = $('#quizFeedback');
    if (!qEl || !choicesEl || !feedbackEl) return;

    function renderQuestion() {
      const item = QUIZ_QUESTIONS[currentQuizIndex];
      qEl.textContent = item.q;
      feedbackEl.textContent = '';
      feedbackEl.className = 'quiz-feedback';

      choicesEl.innerHTML = item.choices.map((choice, idx) => `
        <button class="quiz-choice-btn" data-index="${idx}">${esc(choice)}</button>
      `).join('');

      choicesEl.querySelectorAll('.quiz-choice-btn').forEach(btn => {
        btn.onclick = () => {
          const selectedIdx = parseInt(btn.dataset.index, 10);
          handleAnswer(selectedIdx);
        };
      });
    }

    function handleAnswer(selectedIdx) {
      const item = QUIZ_QUESTIONS[currentQuizIndex];
      const isCorrect = selectedIdx === item.answer;

      if (isCorrect) {
        feedbackEl.textContent = `✓ ${item.explanation} (+20 XP)`;
        feedbackEl.className = 'quiz-feedback correct';

        // Premiação de XP caso ainda não respondida
        if (!state.quizAnswered.includes(currentQuizIndex)) {
          state.quizAnswered.push(currentQuizIndex);
          state.xp = (state.xp || 0) + 20;
          registerStudyActivity();
          saveState();
          renderStats();
        }

        // Avança pergunta após breve delay
        setTimeout(() => {
          currentQuizIndex = (currentQuizIndex + 1) % QUIZ_QUESTIONS.length;
          renderQuestion();
        }, 1200);
      } else {
        feedbackEl.textContent = 'Ainda não. Analise os intervalos e tente novamente!';
        feedbackEl.className = 'quiz-feedback incorrect';
      }
    }

    renderQuestion();
  }

  // --- Inicialização Geral do App ---
  function renderApp() {
    renderStats();
    renderNav();
    renderLesson(activeLessonId);
  }

  function init() {
    loadState();
    initTimer();
    initMetronome();
    initFretboard();
    initQuiz();
    loadLessons();
  }

  // Executa na carga do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
