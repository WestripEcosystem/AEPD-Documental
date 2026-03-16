const STORAGE_KEY = 'westrip-content-planner-v1';
const STATUS_ORDER = ['idea', 'grabando', 'editando', 'programado', 'publicado'];
const STATUS_LABEL = {
  idea: '💡 Idea',
  grabando: '🎥 Grabando',
  editando: '✂️ Editando',
  programado: '📅 Programado',
  publicado: '✅ Publicado',
};

const state = {
  posts: loadPosts(),
  current: new Date(),
  selectedDate: null,
  platformFilter: 'all',
  rangeFilter: 'all',
};

const form = document.getElementById('content-form');
const monthLabel = document.getElementById('month-label');
const grid = document.getElementById('calendar-grid');
const dayDetails = document.getElementById('day-details');
const upcomingList = document.getElementById('upcoming-list');
const metricsList = document.getElementById('metrics-list');
const insights = document.getElementById('insights');

function normalizePost(post) {
  const status = post.status || (post.published ? 'publicado' : 'programado');
  return {
    ...post,
    status,
    published: status === 'publicado',
    priority: post.priority || 'media',
    platforms: post.platforms || [],
    slides: post.slides || [],
    metrics: post.metrics || { impressions: 0, likes: 0, comments: 0, saves: 0, shares: 0, clicks: 0 },
  };
}

function loadPosts() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return raw.map(normalizePost);
  } catch {
    return [];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
}

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isThisWeek(isoDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const d = new Date(`${isoDate}T00:00:00`);
  return d >= start && d <= end;
}

function isOverdue(isoDate, status) {
  if (status === 'publicado') return false;
  const today = new Date();
  const d = new Date(`${isoDate}T00:00:00`);
  return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function renderCalendar() {
  grid.innerHTML = '';
  const y = state.current.getFullYear();
  const m = state.current.getMonth();
  monthLabel.textContent = state.current.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const firstDay = new Date(y, m, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  for (let i = 0; i < offset; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'day empty';
    grid.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(y, m, day);
    const dateStr = date.toISOString().slice(0, 10);
    const count = state.posts.filter((p) => p.date === dateStr).length;

    const cell = document.createElement('div');
    cell.className = `day ${state.selectedDate === dateStr ? 'selected' : ''}`;
    cell.innerHTML = `<strong>${day}</strong>${count ? `<div class="badge">${count} pieza(s)</div>` : ''}`;
    cell.addEventListener('click', () => {
      state.selectedDate = dateStr;
      renderCalendar();
      renderDayDetails();
    });
    grid.appendChild(cell);
  }
}

function renderDayDetails() {
  if (!state.selectedDate) {
    dayDetails.innerHTML = '<h3>Publicaciones del día</h3><p>Selecciona un día para ver el detalle.</p>';
    return;
  }
  const posts = state.posts.filter((p) => p.date === state.selectedDate);
  if (!posts.length) {
    dayDetails.innerHTML = `<h3>${formatDate(state.selectedDate)}</h3><p>No hay contenido planificado para este día.</p>`;
    return;
  }

  dayDetails.innerHTML = `<h3>${formatDate(state.selectedDate)}</h3>`;
  posts
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
    .forEach((post) => {
      const slides = post.slides.length
        ? `<details><summary>Slides del carrusel (${post.slides.length})</summary><ul>${post.slides.map((s) => `<li>${s}</li>`).join('')}</ul></details>`
        : '';
      const reminder = isOverdue(post.date, post.status) ? '<p class="alert">⚠️ Recordatorio: esta pieza está vencida.</p>' : '';

      const card = document.createElement('article');
      card.className = `post-card priority-${post.priority}`;
      card.innerHTML = `
      <h4>${post.title}</h4>
      <p class="meta">${post.platforms.join(' · ')} | ${post.format} | ${STATUS_LABEL[post.status]} | Prioridad ${post.priority}</p>
      ${reminder}
      <label>Estado
        <select data-id="${post.id}" class="status-select">
          ${STATUS_ORDER.map((status) => `<option value="${status}" ${post.status === status ? 'selected' : ''}>${STATUS_LABEL[status]}</option>`).join('')}
        </select>
      </label>
      <p><b>Objetivo:</b> ${post.goal || '-'}</p>
      <p><b>Guion:</b><br>${(post.script || '-').replaceAll('\n', '<br>')}</p>
      <p><b>Caption:</b><br>${(post.caption || '-').replaceAll('\n', '<br>')}</p>
      ${slides}
    `;
      dayDetails.appendChild(card);
    });

  dayDetails.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', () => {
      const post = state.posts.find((p) => p.id === select.dataset.id);
      post.status = select.value;
      post.published = select.value === 'publicado';
      savePosts();
      renderAll();
    });
  });
}

function renderUpcoming() {
  const upcoming = state.posts
    .filter((p) => p.status !== 'publicado')
    .filter((p) => state.platformFilter === 'all' || p.platforms.includes(state.platformFilter))
    .filter((p) => state.rangeFilter !== 'week' || isThisWeek(p.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!upcoming.length) {
    upcomingList.innerHTML = '<p>No hay contenido pendiente para los filtros seleccionados.</p>';
    return;
  }

  upcomingList.innerHTML = upcoming
    .map((p) => {
      const reminder = isOverdue(p.date, p.status) || p.priority === 'alta'
        ? '<p class="alert">⚠️ Atención: prioridad alta o fecha vencida.</p>'
        : '';
      return `
      <article class="post-card priority-${p.priority}">
        <h4>${p.title}</h4>
        <p class="meta">${formatDate(p.date)} · ${p.platforms.join(', ')} · ${p.format}</p>
        <p><b>Estado:</b> ${STATUS_LABEL[p.status]} · <b>Prioridad:</b> ${p.priority}</p>
        <p><b>CTA:</b> ${p.goal || '-'}</p>
        ${reminder}
      </article>
    `;
    })
    .join('');
}

function renderMetrics() {
  metricsList.innerHTML = '';
  const published = state.posts.filter((p) => p.status === 'publicado');
  if (!published.length) {
    metricsList.innerHTML = '<p>No hay publicaciones marcadas como publicadas.</p>';
    insights.innerHTML = '';
    return;
  }

  const template = document.getElementById('metric-template');
  published.forEach((post) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('h4').textContent = post.title;
    node.querySelector('.meta').textContent = `${post.platforms.join(', ')} · ${formatDate(post.date)}`;

    node.querySelectorAll('input').forEach((input) => {
      input.value = post.metrics[input.dataset.field] || '';
    });

    node.querySelector('.save-metrics').addEventListener('click', () => {
      node.querySelectorAll('input').forEach((input) => {
        post.metrics[input.dataset.field] = Number(input.value || 0);
      });
      savePosts();
      renderInsights();
    });

    metricsList.appendChild(node);
  });

  renderInsights();
}

function renderInsights() {
  const withData = state.posts.filter((p) => p.status === 'publicado' && p.metrics.impressions > 0);
  if (!withData.length) {
    insights.innerHTML = '<p>Aún no hay datos suficientes para calcular insights.</p>';
    return;
  }

  const rates = withData.map((p) => {
    const totalInteractions = p.metrics.likes + p.metrics.comments + p.metrics.saves + p.metrics.shares;
    return {
      platform: p.platforms[0],
      engagement: (totalInteractions / p.metrics.impressions) * 100,
      clicks: p.metrics.clicks,
    };
  });

  const avgEng = rates.reduce((acc, cur) => acc + cur.engagement, 0) / rates.length;
  const best = [...rates].sort((a, b) => b.engagement - a.engagement)[0];
  const totalClicks = rates.reduce((acc, cur) => acc + cur.clicks, 0);

  insights.innerHTML = `
    <article class="kpi"><span>Engagement promedio</span><b>${avgEng.toFixed(2)}%</b></article>
    <article class="kpi"><span>Mejor plataforma actual</span><b>${best.platform}</b></article>
    <article class="kpi"><span>Clics acumulados</span><b>${totalClicks}</b></article>
  `;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const platforms = [...document.querySelectorAll('#platforms input:checked')].map((cb) => cb.value);
  if (!platforms.length) {
    alert('Selecciona al menos una plataforma.');
    return;
  }

  const status = document.getElementById('status').value;
  const post = {
    id: id(),
    title: document.getElementById('title').value.trim(),
    date: document.getElementById('date').value,
    platforms,
    format: document.getElementById('format').value,
    goal: document.getElementById('goal').value.trim(),
    script: document.getElementById('script').value.trim(),
    caption: document.getElementById('caption').value.trim(),
    slides: document.getElementById('slides').value.split('\n').map((x) => x.trim()).filter(Boolean),
    status,
    published: status === 'publicado',
    priority: document.getElementById('priority').value,
    metrics: { impressions: 0, likes: 0, comments: 0, saves: 0, shares: 0, clicks: 0 },
  };

  state.posts.push(post);
  savePosts();
  form.reset();
  document.getElementById('status').value = 'idea';
  document.getElementById('priority').value = 'media';
  renderAll();
});

document.getElementById('prev-month').addEventListener('click', () => {
  state.current.setMonth(state.current.getMonth() - 1);
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  state.current.setMonth(state.current.getMonth() + 1);
  renderCalendar();
});

document.getElementById('platform-filter').addEventListener('change', (e) => {
  state.platformFilter = e.target.value;
  renderUpcoming();
});

document.getElementById('range-filter').addEventListener('change', (e) => {
  state.rangeFilter = e.target.value;
  renderUpcoming();
});

function renderAll() {
  renderCalendar();
  renderDayDetails();
  renderUpcoming();
  renderMetrics();
}

renderAll();
