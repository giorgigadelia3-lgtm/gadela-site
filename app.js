// GADELA CRM – Frontend MVP (pure JS, no backend yet)

const STORAGE_KEYS = {
  leads: 'gadelacrm_leads',
  properties: 'gadelacrm_properties',
  contacts: 'gadelacrm_contacts',
  deals: 'gadelacrm_deals',
  tasks: 'gadelacrm_tasks',
  activity: 'gadelacrm_activity'
};

const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Showing',
  'Offer',
  'Won',
  'Lost'
];

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uuid() {
  return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowISO() {
  return new Date().toISOString();
}

/* === STATE === */
let state = {
  leads: [],
  properties: [],
  contacts: [],
  deals: [],
  tasks: [],
  activity: []
};

function initState() {
  state.leads = loadFromStorage(STORAGE_KEYS.leads, []);
  state.properties = loadFromStorage(STORAGE_KEYS.properties, []);
  state.contacts = loadFromStorage(STORAGE_KEYS.contacts, []);
  state.deals = loadFromStorage(STORAGE_KEYS.deals, []);
  state.tasks = loadFromStorage(STORAGE_KEYS.tasks, []);
  state.activity = loadFromStorage(STORAGE_KEYS.activity, []);

  // If empty – seed with small demo data
  if (!state.leads.length && !state.properties.length) {
    seedDemoData();
  }
}

function persistState() {
  saveToStorage(STORAGE_KEYS.leads, state.leads);
  saveToStorage(STORAGE_KEYS.properties, state.properties);
  saveToStorage(STORAGE_KEYS.contacts, state.contacts);
  saveToStorage(STORAGE_KEYS.deals, state.deals);
  saveToStorage(STORAGE_KEYS.tasks, state.tasks);
  saveToStorage(STORAGE_KEYS.activity, state.activity);
}

function seedDemoData() {
  const lead1 = {
    id: uuid(),
    name: 'გიორგი ბეგაშვილი',
    phone: '+995 555 123 456',
    email: 'giorgi@example.com',
    budget: 220000,
    district: 'ვაკე',
    status: 'Qualified',
    source: 'Facebook',
    notes: 'მეტწილად ახალ აშენებულს ეძებს.',
    createdAt: nowISO()
  };
  const lead2 = {
    id: uuid(),
    name: 'ნინო ქავთარაძე',
    phone: '+995 577 000 111',
    email: 'nino@example.com',
    budget: 1500,
    district: 'საბურთალო',
    status: 'Showing',
    source: 'Website',
    notes: 'ქირავნობა, 2 ოთახი.',
    createdAt: nowISO()
  };
  const lead3 = {
    id: uuid(),
    name: 'სანდრო ონიანი',
    phone: '+995 593 555 777',
    email: '',
    budget: 320000,
    district: 'დიღომი',
    status: 'New',
    source: 'Referral',
    notes: '',
    createdAt: nowISO()
  };

  const prop1 = {
    id: uuid(),
    code: 'G-00123',
    address: 'ჭავჭავაძის 15',
    district: 'ვაკე',
    type: 'SALE',
    price: 230000,
    status: 'Active',
    owner: 'სალომე საღინაძე',
    tags: '3 ოთახი, აივანი, პარკინგი'
  };
  const prop2 = {
    id: uuid(),
    code: 'G-00124',
    address: 'ცაგარელის 4',
    district: 'საბურთალო',
    type: 'RENT',
    price: 1600,
    status: 'Showing',
    owner: 'ნია ქარუმიძე',
    tags: '2 ოთახი, ავეჯით'
  };

  const contact1 = {
    id: uuid(),
    name: lead1.name,
    type: 'Buyer',
    phone: lead1.phone,
    email: lead1.email,
    channel: 'WhatsApp'
  };

  const deal1 = {
    id: uuid(),
    title: 'გიორგი ბეგაშვილი • G-00123',
    leadName: lead1.name,
    propertyCode: prop1.code,
    stage: 'Offer',
    price: 230000,
    commissionPct: 3
  };

  const task1 = {
    id: uuid(),
    date: new Date().toISOString().slice(0, 10),
    time: '15:00',
    type: 'Showing',
    who: 'ნინო ქავთარაძე',
    related: 'G-00124'
  };

  state.leads = [lead1, lead2, lead3];
  state.properties = [prop1, prop2];
  state.contacts = [contact1];
  state.deals = [deal1];
  state.tasks = [task1];
  state.activity = [
    {
      id: uuid(),
      time: nowISO(),
      message: 'დაემატა demo მონაცემები (3 ლიდი, 2 ობიექტი, 1 deal).'
    }
  ];

  persistState();
}

/* === UI HELPERS === */
function formatGel(n) {
  if (n == null || isNaN(n)) return '-';
  return (
    new Intl.NumberFormat('ka-GE', {
      maximumFractionDigits: 0
    }).format(n) + ' ₾'
  );
}

function addActivity(message) {
  state.activity.unshift({ id: uuid(), time: nowISO(), message });
  state.activity = state.activity.slice(0, 20);
  saveToStorage(STORAGE_KEYS.activity, state.activity);
  renderActivityFeed();
}

/* === NAVIGATION === */
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  const titleEl = document.getElementById('view-title');

  const titles = {
    dashboard: 'მთავარი დაფა',
    leads: 'ლიდების მართვა',
    properties: 'ობიექტების კატალოგი',
    contacts: 'კონტაქტების ბაზა',
    deals: 'Deals & საკომისიოები',
    tasks: 'დავალებები & კალენდარი',
    reports: 'რეპორტები & KPI',
    settings: 'პარამეტრები'
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;

      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      views.forEach(v => v.classList.remove('visible'));
      const target = document.getElementById(`view-${view}`);
      if (target) target.classList.add('visible');

      titleEl.textContent = titles[view] || 'GADELA CRM';
    });
  });
}

/* === RENDER FUNCTIONS === */

// Dashboard
function renderMetrics() {
  const openStatuses = ['New', 'Contacted', 'Qualified', 'Showing', 'Offer'];
  const openLeads = state.leads.filter(l => openStatuses.includes(l.status));
  const activeProps = state.properties.filter(p =>
    ['Active', 'Showing'].includes(p.status)
  );
  const activeDeals = state.deals.filter(d =>
    ['Showing', 'Offer', 'Closing'].includes(d.stage || 'Offer')
  );

  document.getElementById('metric-open-leads').textContent = openLeads.length;
  document.getElementById('metric-active-properties').textContent =
    activeProps.length;
  document.getElementById('metric-active-deals').textContent =
    activeDeals.length;
}

function renderPipelineMini() {
  const container = document.getElementById('pipeline-mini');
  container.innerHTML = '';
  const total = state.leads.length || 1;
  LEAD_STATUSES.forEach(status => {
    const count = state.leads.filter(l => l.status === status).length;
    const bar = document.createElement('div');
    bar.className = 'pipeline-mini-bar';

    const fill = document.createElement('div');
    fill.className = 'pipeline-mini-fill';

    let color = '#22c55e';
    if (status === 'New') color = '#38bdf8';
    else if (status === 'Contacted') color = '#a855f7';
    else if (status === 'Lost') color = '#ef4444';

    fill.style.background = color;
    fill.style.transform = `scaleX(${count / total})`;
    fill.style.transformOrigin = 'left';

    bar.appendChild(fill);
    container.appendChild(bar);
  });
}

function renderActivityFeed() {
  const ul = document.getElementById('activity-feed');
  if (!ul) return;
  ul.innerHTML = '';
  state.activity.forEach(a => {
    const li = document.createElement('li');
    const dt = new Date(a.time);
    li.innerHTML = `
      <div>${a.message}</div>
      <div class="activity-time">${dt.toLocaleString('ka-GE')}</div>
    `;
    ul.appendChild(li);
  });
}

// Leads Kanban
function renderLeadsKanban() {
  const container = document.getElementById('leads-kanban');
  container.innerHTML = '';

  LEAD_STATUSES.forEach(status => {
    const column = document.createElement('div');
    column.className = 'kanban-column';
    column.dataset.status = status;

    const header = document.createElement('div');
    header.className = 'kanban-column-header';
    const count = state.leads.filter(l => l.status === status).length;
    header.innerHTML = `
      <span>${status}</span>
      <span class="kanban-count">${count}</span>
    `;

    const list = document.createElement('div');

    state.leads
      .filter(l => l.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(lead => {
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.dataset.id = lead.id;
        card.innerHTML = `
          <div class="lead-name">${lead.name || 'უსახელო ლიდი'}</div>
          <div class="lead-meta">
            ${lead.phone || ''} ${lead.phone && lead.budget ? ' • ' : ''} ${
          lead.budget ? formatGel(lead.budget) : ''
        }
          </div>
          <div class="lead-tags">
            ${
              lead.district
                ? `<span class="lead-tag">${lead.district}</span>`
                : ''
            }
            ${
              lead.source
                ? `<span class="lead-tag">Src: ${lead.source}</span>`
                : ''
            }
          </div>
        `;
        card.addEventListener('dblclick', () => openLeadForEdit(lead.id));
        list.appendChild(card);
      });

    column.appendChild(header);
    column.appendChild(list);
    container.appendChild(column);
  });
}

// Properties
function renderPropertiesTable() {
  const tbody = document.querySelector('#properties-table tbody');
  const search = (document.getElementById('property-search') || {}).value || '';
  const type = (document.getElementById('property-type-filter') || {})
    .value;
  const status = (document.getElementById('property-status-filter') || {})
    .value;

  tbody.innerHTML = '';

  state.properties
    .filter(p => {
      const text =
        (p.code || '') +
        ' ' +
        (p.address || '') +
        ' ' +
        (p.district || '') +
        ' ' +
        (p.owner || '');
      if (search && !text.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (type && p.type !== type) return false;
      if (status && p.status !== status) return false;
      return true;
    })
    .forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.code}</td>
        <td>${p.address}</td>
        <td>${p.district || '-'}</td>
        <td>${p.type === 'SALE' ? 'გაყიდვა' : 'ქირავნება'}</td>
        <td>${formatGel(p.price)}</td>
        <td>${p.status}</td>
        <td>${p.owner || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
}

// Contacts
function renderContactsTable() {
  const tbody = document.querySelector('#contacts-table tbody');
  tbody.innerHTML = '';
  state.contacts.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.type}</td>
      <td>${c.phone || '-'}</td>
      <td>${c.email || '-'}</td>
      <td>${c.channel || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Deals
function renderDealsTable() {
  const tbody = document.querySelector('#deals-table tbody');
  tbody.innerHTML = '';
  state.deals.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.title}</td>
      <td>${d.leadName || '-'}</td>
      <td>${d.propertyCode || '-'}</td>
      <td>${d.stage || 'Offer'}</td>
      <td>${formatGel(d.price)}</td>
      <td>${d.commissionPct || 0}%</td>
    `;
    tbody.appendChild(tr);
  });
}

// Tasks
function renderTasksTable() {
  const tbody = document.querySelector('#tasks-table tbody');
  tbody.innerHTML = '';
  state.tasks.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>${t.time}</td>
      <td>${t.type}</td>
      <td>${t.who}</td>
      <td>${t.related}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Reports
function renderReports() {
  const funnelEl = document.getElementById('kpi-funnel');
  const sourcesEl = document.getElementById('kpi-sources');
  funnelEl.innerHTML = '';
  sourcesEl.innerHTML = '';

  const totalsByStatus = {};
  LEAD_STATUSES.forEach(s => (totalsByStatus[s] = 0));
  state.leads.forEach(l => {
    totalsByStatus[l.status] = (totalsByStatus[l.status] || 0) + 1;
  });

  LEAD_STATUSES.forEach(status => {
    const li = document.createElement('li');
    li.className = 'kpi-item';
    li.innerHTML = `
      <span>${status}</span>
      <span>${totalsByStatus[status] || 0}</span>
    `;
    funnelEl.appendChild(li);
  });

  const bySource = {};
  state.leads.forEach(l => {
    const s = l.source || 'Other';
    bySource[s] = (bySource[s] || 0) + 1;
  });

  Object.entries(bySource).forEach(([src, count]) => {
    const li = document.createElement('li');
    li.className = 'kpi-item';
    li.innerHTML = `
      <span>${src}</span>
      <span>${count}</span>
    `;
    sourcesEl.appendChild(li);
  });
}

/* === FORMS === */

// LEADS
let editingLeadId = null;

function openLeadForm() {
  document.getElementById('lead-form-drawer').classList.add('open');
}

function closeLeadForm() {
  document.getElementById('lead-form-drawer').classList.remove('open');
  editingLeadId = null;
  document.getElementById('lead-form-title').textContent = 'ახალი ლიდი';
  document.getElementById('lead-form').reset();
}

function openLeadForEdit(id) {
  const lead = state.leads.find(l => l.id === id);
  if (!lead) return;
  editingLeadId = id;
  document.getElementById('lead-form-title').textContent =
    'ლიდის რედაქტირება';

  const form = document.getElementById('lead-form');
  form.name.value = lead.name || '';
  form.phone.value = lead.phone || '';
  form.email.value = lead.email || '';
  form.budget.value = lead.budget || '';
  form.district.value = lead.district || '';
  form.status.value = lead.status || 'New';
  form.source.value = lead.source || 'Manual';
  form.notes.value = lead.notes || '';

  openLeadForm();
}

function setupLeadForm() {
  document
    .getElementById('btn-open-lead-form')
    .addEventListener('click', openLeadForm);
  document
    .getElementById('close-lead-form')
    .addEventListener('click', closeLeadForm);
  document
    .getElementById('reset-lead-form')
    .addEventListener('click', () =>
      document.getElementById('lead-form').reset()
    );

  document.getElementById('quick-add-lead').addEventListener('click', () => {
    document
      .querySelector('.nav-item[data-view="leads"]')
      .click();
    openLeadForm();
  });

  const form = document.getElementById('lead-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const budget = data.budget ? Number(data.budget) : null;

    if (editingLeadId) {
      const idx = state.leads.findIndex(l => l.id === editingLeadId);
      if (idx !== -1) {
        state.leads[idx] = {
          ...state.leads[idx],
          ...data,
          budget,
          updatedAt: nowISO()
        };
        addActivity(`განახლდა ლიდი: ${data.name || 'უსახელო'}`);
      }
    } else {
      const lead = {
        id: uuid(),
        ...data,
        budget,
        createdAt: nowISO()
      };
      state.leads.push(lead);
      addActivity(`დაემატა ახალი ლიდი: ${data.name || 'უსახელო ლიდი'}`);
    }

    persistState();
    renderLeadsKanban();
    renderMetrics();
    renderPipelineMini();
    renderReports();
    closeLeadForm();
  });
}

// PROPERTIES
let editingPropertyId = null;

function openPropertyForm() {
  document.getElementById('property-form-drawer').classList.add('open');
}

function closePropertyForm() {
  document.getElementById('property-form-drawer').classList.remove('open');
  editingPropertyId = null;
  document.getElementById('property-form-title').textContent =
    'ახალი ობიექტი';
  document.getElementById('property-form').reset();
}

function setupPropertyForm() {
  document
    .getElementById('btn-open-property-form')
    .addEventListener('click', openPropertyForm);
  document
    .getElementById('close-property-form')
    .addEventListener('click', closePropertyForm);
  document
    .getElementById('reset-property-form')
    .addEventListener('click', () =>
      document.getElementById('property-form').reset()
    );

  document
    .getElementById('quick-add-property')
    .addEventListener('click', () => {
      document
        .querySelector('.nav-item[data-view="properties"]')
        .click();
      openPropertyForm();
    });

  const form = document.getElementById('property-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.price = data.price ? Number(data.price) : null;

    if (editingPropertyId) {
      const idx = state.properties.findIndex(p => p.id === editingPropertyId);
      if (idx !== -1) {
        state.properties[idx] = { ...state.properties[idx], ...data };
        addActivity(`განახლდა ობიექტი: ${data.code}`);
      }
    } else {
      const prop = {
        id: uuid(),
        ...data
      };
      state.properties.push(prop);
      addActivity(`დაემატა ახალი ობიექტი: ${data.code}`);
    }

    persistState();
    renderPropertiesTable();
    renderMetrics();
    closePropertyForm();
  });

  // Filters
  ['property-search', 'property-type-filter', 'property-status-filter'].forEach(
    id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', renderPropertiesTable);
    }
  );
}

// CONTACTS
let editingContactId = null;

function openContactForm() {
  document.getElementById('contact-form-drawer').classList.add('open');
}

function closeContactForm() {
  document.getElementById('contact-form-drawer').classList.remove('open');
  editingContactId = null;
  document.getElementById('contact-form-title').textContent =
    'ახალი კონტაქტი';
  document.getElementById('contact-form').reset();
}

function setupContactForm() {
  document
    .getElementById('btn-open-contact-form')
    .addEventListener('click', openContactForm);
  document
    .getElementById('close-contact-form')
    .addEventListener('click', closeContactForm);
  document
    .getElementById('reset-contact-form')
    .addEventListener('click', () =>
      document.getElementById('contact-form').reset()
    );

  const form = document.getElementById('contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (editingContactId) {
      const idx = state.contacts.findIndex(c => c.id === editingContactId);
      if (idx !== -1) {
        state.contacts[idx] = { ...state.contacts[idx], ...data };
        addActivity(`განახლდა კონტაქტი: ${data.name}`);
      }
    } else {
      const c = {
        id: uuid(),
        ...data
      };
      state.contacts.push(c);
      addActivity(`დაემატა ახალი კონტაქტი: ${data.name}`);
    }

    persistState();
    renderContactsTable();
    closeContactForm();
  });
}

/* === INIT === */
document.addEventListener('DOMContentLoaded', () => {
  initState();
  setupNavigation();
  setupLeadForm();
  setupPropertyForm();
  setupContactForm();

  renderMetrics();
  renderPipelineMini();
  renderActivityFeed();
  renderLeadsKanban();
  renderPropertiesTable();
  renderContactsTable();
  renderDealsTable();
  renderTasksTable();
  renderReports();
});
