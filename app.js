// Simple GADELA CRM front-end demo (no backend)

const state = {
  leads: [],
  properties: [],
  deals: [],
  tasks: [],
  audit: [],
};

const LS_KEY = "gadela-demo-state-v1";

function loadState() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
      return;
    }
  } catch (e) {
    console.warn("Failed to parse saved state", e);
  }
  seedDemoData();
  saveState();
}

function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state", e);
  }
}

function seedDemoData() {
  state.leads = [
    {
      id: "L-1001",
      name: "ნიკა გიორგაძე",
      phone: "+995 599 123456",
      source: "Facebook Ads",
      status: "New",
      score: 80,
      budget: 250000,
      district: "ვაკე",
      slaMinutes: 15,
      slaRemaining: -5,
    },
    {
      id: "L-1002",
      name: "თამარ ჩხეიძე",
      phone: "+995 555 777222",
      source: "Referral",
      status: "Contacted",
      score: 65,
      budget: 150000,
      district: "საბურთალო",
      slaMinutes: 30,
      slaRemaining: 12,
    },
    {
      id: "L-1003",
      name: "Giga LLC",
      phone: "+995 593 000333",
      source: "MyHome",
      status: "Qualified",
      score: 92,
      budget: 600000,
      district: "დიღომი",
      slaMinutes: 60,
      slaRemaining: 40,
    },
  ];

  state.properties = [
    {
      id: "P-2001",
      title: "ახალი კორპუსი • 3 ოთახი",
      district: "ვაკე",
      type: "SALE",
      price: 240000,
      area: 86,
      status: "Active",
    },
    {
      id: "P-2002",
      title: "ბინა გაქირავებაზე • 2 ოთახი",
      district: "საბურთალო",
      type: "RENT",
      price: 900,
      area: 60,
      status: "Showing",
    },
    {
      id: "P-2003",
      title: "კომერციული ფართი",
      district: "ვერა",
      type: "RENT",
      price: 2800,
      area: 120,
      status: "Reserved",
    },
  ];

  state.deals = [
    {
      id: "D-3001",
      leadId: "L-1001",
      propertyId: "P-2001",
      stage: "Offer",
      value: 240000,
      agent: "თეო ქავთარაძე",
      closeProb: 70,
    },
    {
      id: "D-3002",
      leadId: "L-1002",
      propertyId: "P-2002",
      stage: "Showing",
      value: 900 * 12,
      agent: "გიორგი გაბელია",
      closeProb: 40,
    },
    {
      id: "D-3003",
      leadId: "L-1003",
      propertyId: "P-2003",
      stage: "Won",
      value: 2800 * 12,
      agent: "სოფო დევდარიანი",
      closeProb: 100,
    },
  ];

  state.tasks = [
    {
      id: "T-4001",
      title: "დაუდასტურე ჩვენება თამართან",
      due: "დღეს 18:30",
      type: "Call",
      owner: "გიორგი",
      status: "Open",
    },
    {
      id: "T-4002",
      title: "კონტრაქტის გადაგზავნა Giga LLC-სთვის",
      due: "ხვალ",
      type: "Email",
      owner: "თეო",
      status: "In progress",
    },
  ];

  state.audit = [
    {
      id: "A-1",
      actor: "გიორგი (Director)",
      entity: "Deal D-3003",
      action: "stage_changed Offer → Won",
      time: "დღეს • 11:22",
    },
    {
      id: "A-2",
      actor: "თეო (Agent)",
      entity: "Lead L-1001",
      action: "status_changed New → Contacted",
      time: "გუშინ • 16:05",
    },
  ];
}

/* -------- Rendering -------- */

function $(selector) {
  return document.querySelector(selector);
}

function setView(viewId) {
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("active", v.id === `view-${viewId}`);
  });
  document.querySelectorAll(".sidebar .nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  switch (viewId) {
    case "overview":
      renderOverview();
      break;
    case "leads":
      renderLeads();
      break;
    case "properties":
      renderProperties();
      break;
    case "deals":
      renderDeals();
      break;
    case "tasks":
      renderTasks();
      break;
    case "reports":
      renderReports();
      break;
    case "audit":
      renderAudit();
      break;
  }
}

function renderOverview() {
  const totalLeads = state.leads.length;
  const openDeals = state.deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
  const wonDeals = state.deals.filter((d) => d.stage === "Won");
  const mrr = wonDeals.reduce((sum, d) => sum + d.value, 0) / 12;

  const el = $("#view-overview");
  el.innerHTML = `
    <div class="app-grid3">
      <div class="app-card">
        <div class="metric-title">ღია ლიდები</div>
        <div class="metric-value">${totalLeads}</div>
        <div class="metric-sub">New / Contacted / Qualified</div>
      </div>
      <div class="app-card">
        <div class="metric-title">აქტიური დილები</div>
        <div class="metric-value">${openDeals.length}</div>
        <div class="metric-sub">სტადიები: Showing → Offer → Negotiation</div>
      </div>
      <div class="app-card">
        <div class="metric-title"> სავარაუდო MRR ₾</div>
        <div class="metric-value">₾${mrr.toLocaleString("ka-GE", {
          maximumFractionDigits: 0,
        })}</div>
        <div class="metric-sub">Won დილებიდან</div>
      </div>
    </div>

    <h2 class="mt-lg" style="font-size:14px;color:#9ca3af">Deals pipeline</h2>
    <div class="kanban">
      ${["New", "Showing", "Offer", "Won"].map(renderDealColumn).join("")}
    </div>
  `;
}

function renderDealColumn(stage) {
  const deals = state.deals.filter((d) =>
    stage === "New" ? d.stage === "New" : d.stage === stage
  );
  return `
    <div class="kanban-column">
      <div class="kanban-title">
        <span>${stage}</span>
        <span class="kanban-count">${deals.length}</span>
      </div>
      ${deals
        .map(
          (d) => `
        <div class="card-sm">
          <div class="card-sm-title">${d.id}</div>
          <div class="card-sm-meta">
            ₾${d.value.toLocaleString("ka-GE")} • ${d.agent}<br>
            Close prob: ${d.closeProb}%
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function renderLeads() {
  const el = $("#view-leads");
  const rows = state.leads
    .map((lead) => {
      let badgeClass = "badge-open";
      if (lead.status === "Contacted") badgeClass = "badge-warm";
      if (lead.status === "Qualified") badgeClass = "badge-open";
      if (lead.status === "Cold") badgeClass = "badge-cold";
      const slaBadge =
        lead.slaRemaining < 0
          ? `<span class="badge-xs badge-sla">SLA −${Math.abs(
              lead.slaRemaining
            )} წთ</span>`
          : `<span class="badge-xs badge-open">SLA +${lead.slaRemaining} წთ</span>`;
      return `
      <tr>
        <td>${lead.id}</td>
        <td>${lead.name}</td>
        <td>${lead.phone}</td>
        <td>${lead.district}</td>
        <td>₾${lead.budget.toLocaleString("ka-GE")}</td>
        <td><span class="badge-xs ${badgeClass}">${lead.status}</span></td>
        <td>${lead.source}</td>
        <td>${slaBadge}</td>
      </tr>
    `;
    })
    .join("");

  el.innerHTML = `
    <h2 style="font-size:15px;margin-bottom:4px;">Leads &amp; SLA</h2>
    <p class="xs" style="color:#9ca3af">
      ეს არის demo მონაცემები. Production ვერსიაში ლიდები შემოვა ვებ-ფორმიდან,
      FB Lead Ads-იდან, WhatsApp-იდან და სხვა არხებიდან.
    </p>

    <div class="filters-row">
      <select class="select" id="leadStatusFilter">
        <option value="">სტატუსი — ყველა</option>
        <option value="New">New</option>
        <option value="Contacted">Contacted</option>
        <option value="Qualified">Qualified</option>
      </select>
      <select class="select" id="leadDistrictFilter">
        <option value="">უბანი — ყველა</option>
        <option value="ვაკე">ვაკე</option>
        <option value="საბურთალო">საბურთალო</option>
        <option value="დიღომი">დიღომი</option>
      </select>
    </div>

    <div class="table-wrapper">
      <table class="table" id="leadsTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>კლიენტი</th>
            <th>ტელეფონი</th>
            <th>უბანი</th>
            <th>ბიუჯეტი</th>
            <th>სტატუსი</th>
            <th>წყარო</th>
            <th>SLA</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  $("#leadStatusFilter").addEventListener("change", filterLeads);
  $("#leadDistrictFilter").addEventListener("change", filterLeads);
}

function filterLeads() {
  const status = $("#leadStatusFilter").value;
  const district = $("#leadDistrictFilter").value;

  const tbody = $("#leadsTable tbody");
  tbody.innerHTML = state.leads
    .filter((l) => (status ? l.status === status : true))
    .filter((l) => (district ? l.district === district : true))
    .map((lead) => {
      let badgeClass = "badge-open";
      if (lead.status === "Contacted") badgeClass = "badge-warm";
      if (lead.status === "Qualified") badgeClass = "badge-open";
      if (lead.status === "Cold") badgeClass = "badge-cold";
      const slaBadge =
        lead.slaRemaining < 0
          ? `<span class="badge-xs badge-sla">SLA −${Math.abs(
              lead.slaRemaining
            )} წთ</span>`
          : `<span class="badge-xs badge-open">SLA +${lead.slaRemaining} წთ</span>`;

      return `
        <tr>
          <td>${lead.id}</td>
          <td>${lead.name}</td>
          <td>${lead.phone}</td>
          <td>${lead.district}</td>
          <td>₾${lead.budget.toLocaleString("ka-GE")}</td>
          <td><span class="badge-xs ${badgeClass}">${lead.status}</span></td>
          <td>${lead.source}</td>
          <td>${slaBadge}</td>
        </tr>
      `;
    })
    .join("");
}

function renderProperties() {
  const el = $("#view-properties");
  const rows = state.properties
    .map(
      (p) => `
    <tr>
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>${p.district}</td>
      <td>${p.type === "SALE" ? "გაყიდვა" : "ქირავნება"}</td>
      <td>${p.area} მ²</td>
      <td>₾${p.price.toLocaleString("ka-GE")}</td>
      <td>${p.status}</td>
    </tr>
  `
    )
    .join("");

  el.innerHTML = `
    <h2 style="font-size:15px;margin-bottom:4px;">Properties Catalog</h2>
    <p class="xs" style="color:#9ca3af">
      V1 demo: ობიექტების სტრუქტურირებული სია. Production ვერსიაში იქნება
      ფოტოების გალერეა, სტატუსები, მეპი და პორტალებთან სინქი.
    </p>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ობიექტი</th>
            <th>უბანი</th>
            <th>ტიპი</th>
            <th>ფართი</th>
            <th>ფასი</th>
            <th>სტატუსი</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderDeals() {
  const el = $("#view-deals");
  el.innerHTML = `
    <h2 style="font-size:15px;margin-bottom:4px;">Deals Pipeline</h2>
    <p class="xs" style="color:#9ca3af">
      კანბანი სტადიებით: New → Showing → Offer → Won/Lost.
    </p>
    <div class="kanban">
      ${["New", "Showing", "Offer", "Won"].map(renderDealColumn).join("")}
    </div>
  `;
}

function renderTasks() {
  const el = $("#view-tasks");
  const rows = state.tasks
    .map(
      (t) => `
    <tr>
      <td>${t.id}</td>
      <td>${t.title}</td>
      <td>${t.type}</td>
      <td>${t.owner}</td>
      <td>${t.due}</td>
      <td>${t.status}</td>
    </tr>
  `
    )
    .join("");

  el.innerHTML = `
    <h2 style="font-size:15px;margin-bottom:4px;">Tasks &amp; Calendar</h2>
    <p class="xs" style="color:#9ca3af">
      GA4 / Outlook Calendar ინტეგრაცია იქნება შემდეგ ეტაპზე. ახლა ხედავ
      demo task-ებს ტაბულარულ სახეში.
    </p>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Task</th>
            <th>ტიპი</th>
            <th>პასუხისმგებელი</th>
            <th>ვადა</th>
            <th>სტატუსი</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderReports() {
  const el = $("#view-reports");
  const leadToDealRate =
    state.leads.length ? ((state.deals.length / state.leads.length) * 100).toFixed(1) : 0;

  el.innerHTML = `
    <h2 style="font-size:15px;margin-bottom:4px;">Reporting &amp; KPI</h2>
    <p class="xs" style="color:#9ca3af">
      ეს არის მხოლოდ high-level demo. სრულ ვერსიაში იქნება ფილტრირებადი დეშბორდები,
      ექსპორტი და source-ების ROI.
    </p>
    <div class="app-grid3 mt-lg">
      <div class="app-card">
        <div class="metric-title">Lead → Deal Conversion</div>
        <div class="metric-value">${leadToDealRate}%</div>
        <div class="metric-sub">ყველა ღია ლიდიდან</div>
      </div>
      <div class="app-card">
        <div class="metric-title">Deals count</div>
        <div class="metric-value">${state.deals.length}</div>
        <div class="metric-sub">Pipeline stages + Won</div>
      </div>
      <div class="app-card">
        <div class="metric-title">Properties in catalog</div>
        <div class="metric-value">${state.properties.length}</div>
        <div class="metric-sub">SALE + RENT</div>
      </div>
    </div>
  `;
}

function renderAudit() {
  const el = $("#view-audit");
  const items = state.audit
    .map(
      (a) => `
    <div class="audit-item">
      <strong>${a.actor}</strong> • <span style="color:#9ca3af">${a.time}</span><br>
      <span style="color:#9ca3af">${a.entity}</span> — ${a.action}
    </div>
  `
    )
    .join("");

  el.innerHTML = `
    <h2 style="font-size:15px;margin-bottom:4px;">Audit Log</h2>
    <p class="xs" style="color:#9ca3af">
      Production ვერსიაში AuditLog შეინახება Postgres-ში, ამოიტვირთება მხოლოდ
      Director/Auditor როლისთვის და ექნება გაფილტვრა entity-ებისა და თარიღის მიხედვით.
    </p>
    <div class="audit-list">
      ${items}
    </div>
  `;
}

/* -------- Global search (Ctrl+K) -------- */

function activateGlobalSearch() {
  const input = document.getElementById("globalSearch");
  if (!input) return;
  input.focus();
  input.select();
}

function handleGlobalSearch() {
  const q = $("#globalSearch").value.toLowerCase();
  if (!q) return;

  const foundLead = state.leads.find(
    (l) =>
      l.id.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q)
  );
  if (foundLead) {
    setView("leads");
    // პატარა highlight-ს უბრალოდ ვტოვებთ search-ზე
    return;
  }

  const foundProp = state.properties.find(
    (p) =>
      p.id.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
  );
  if (foundProp) {
    setView("properties");
    return;
  }
}

/* -------- Init -------- */

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setView("overview");

  document.querySelectorAll(".sidebar .nav-item").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  const searchInput = $("#globalSearch");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleGlobalSearch();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      activateGlobalSearch();
    }
  });
});
