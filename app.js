// app.js – GADELA Real Estate CRM dashboard demo logic

// ---- Demo data ---------------------------------------------------------

const demoLeads = [
  {
    id: "G-00125",
    name: "თამარ კობახიძე",
    stage: "new", // new, contacted, qualified, showing, offer, closed
    budgetGel: 250000,
    createdAt: "2025-11-13T12:45:00",
    lastContactAt: null,
    slaDueAt: "2025-11-13T13:00:00",
  },
  {
    id: "G-00126",
    name: "დათო ბერიძე",
    stage: "contacted",
    budgetGel: 180000,
    createdAt: "2025-11-12T10:10:00",
    lastContactAt: "2025-11-13T09:30:00",
    slaDueAt: "2025-11-13T12:00:00",
  },
  {
    id: "G-00127",
    name: "ნინო თეთრაძე",
    stage: "qualified",
    budgetGel: 350000,
    createdAt: "2025-11-11T15:20:00",
    lastContactAt: "2025-11-12T17:40:00",
    slaDueAt: "2025-11-13T16:00:00",
  },
  {
    id: "G-00128",
    name: "ლაშა ქავთარაძე",
    stage: "showing",
    budgetGel: 420000,
    createdAt: "2025-11-10T11:00:00",
    lastContactAt: "2025-11-13T10:00:00",
    slaDueAt: "2025-11-13T18:00:00",
  },
];

const demoProperties = [
  {
    id: "P-VAKE-001",
    address: "ვაკე, ჭავჭავაძის გამზირი 15",
    district: "ვაკე",
    type: "sale", // sale | rent
    status: "active",
    priceGel: 320000,
  },
  {
    id: "P-SAB-004",
    address: "საბურთალო, უნივერსიტეტის ქ.",
    district: "საბურთალო",
    type: "rent",
    status: "active",
    priceGel: 1500,
  },
  {
    id: "P-NUT-003",
    address: "ნუცუბიძე, III პლატო",
    district: "ნუცუბიძე",
    type: "sale",
    status: "reserved",
    priceGel: 280000,
  },
];

const demoDeals = [
  {
    id: "D-1001",
    leadId: "G-00127",
    propertyId: "P-VAKE-001",
    stage: "offer",
    expectedCloseAt: "2025-11-20T00:00:00",
    valueGel: 9600, // საკომისიო
  },
  {
    id: "D-1002",
    leadId: "G-00128",
    propertyId: "P-SAB-004",
    stage: "showing",
    expectedCloseAt: "2025-11-18T00:00:00",
    valueGel: 2100,
  },
];

const demoShowings = [
  {
    time: "10:30",
    contact: "ლაშა ქავთარაძე",
    property: "ვაკე, ჭავჭავაძის 15",
  },
  {
    time: "14:00",
    contact: "ნინო თეთრაძე",
    property: "საბურთალო, უნივერსიტეტის ქ.",
  },
];

const demoTasks = [
  {
    time: "11:30",
    title: "დარეკვა ახალი ლიდთან – G-00125",
    type: "call",
  },
  {
    time: "16:00",
    title: "შეთავაზების გამოკვეთა მფლობელთან",
    type: "followup",
  },
];

let demoActivities = [
  {
    time: "10:55",
    text: "დაემატა ახალი ლიდი: G-00125",
    type: "lead",
  },
  {
    time: "10:40",
    text: "მოინიშნა ჩვენება ობიექტზე P-VAKE-001",
    type: "showing",
  },
  {
    time: "10:15",
    text: "განახლდა სტატუსი: ლიდი G-00128 → Showing",
    type: "status",
  },
];

// ---- Helpers -----------------------------------------------------------

function formatGel(num) {
  if (!num && num !== 0) return "–";
  return num.toLocaleString("ka-GE", {
    maximumFractionDigits: 0,
  });
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ---- Dashboard rendering -----------------------------------------------

function renderKpis() {
  const openStages = ["new", "contacted", "qualified", "showing", "offer"];
  const openLeads = demoLeads.filter((l) => openStages.includes(l.stage));

  document.getElementById("kpiOpenLeads").textContent = openLeads.length;

  const activeProps = demoProperties.filter((p) => p.status === "active");
  document.getElementById("kpiActiveProperties").textContent =
    activeProps.length;

  document.getElementById("kpiTodayShowings").textContent =
    demoShowings.length;

  const pipelineValue = demoDeals
    .filter((d) => d.stage !== "closed")
    .reduce((sum, d) => sum + d.valueGel, 0);

  document.getElementById(
    "kpiPipelineValue"
  ).textContent = `₾ ${formatGel(pipelineValue)}`;
}

function renderPipeline() {
  const stages = [
    { id: "new", label: "ახალი", color: "#4ade80" },
    { id: "contacted", label: "კონტაქტი", color: "#22c55e" },
    { id: "qualified", label: "ქოლიფიცირებული", color: "#22d3ee" },
    { id: "showing", label: "ჩვენება", color: "#38bdf8" },
    { id: "offer", label: "შეთავაზება", color: "#f97316" },
    { id: "closed", label: "დასრულებული", color: "#a855f7" },
  ];

  const container = document.getElementById("pipelineStages");
  container.innerHTML = "";

  stages.forEach((stage) => {
    const leadsInStage = demoLeads.filter((l) => l.stage === stage.id);
    const dealsInStage = demoDeals.filter((d) => d.stage === stage.id);

    const el = document.createElement("div");
    el.className = "pipeline-stage";
    el.innerHTML = `
      <div class="pipeline-stage-header">
        <span class="pipeline-dot" style="background:${stage.color}"></span>
        <span class="pipeline-title">${stage.label}</span>
      </div>
      <div class="pipeline-counts">
        <div><span class="pipeline-count">${leadsInStage.length}</span> ლიდი</div>
        <div><span class="pipeline-count">${dealsInStage.length}</span> Deal</div>
      </div>
    `;
    container.appendChild(el);
  });
}

function renderShowingsAndTasks() {
  const showingsList = document.getElementById("todayShowingsList");
  showingsList.innerHTML = "";

  if (demoShowings.length === 0) {
    showingsList.innerHTML = `<li class="list-empty">დღეს ჩვენებები არ არის დაგეგმილი.</li>`;
  } else {
    demoShowings.forEach((s) => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.innerHTML = `
        <div class="list-main">
          <div class="list-title">${s.time} – ${s.contact}</div>
          <div class="list-sub">${s.property}</div>
        </div>
      `;
      showingsList.appendChild(li);
    });
  }

  const tasksList = document.getElementById("todayTasksList");
  tasksList.innerHTML = "";

  if (demoTasks.length === 0) {
    tasksList.innerHTML = `<li class="list-empty">დღეს დავალებები არ არის.</li>`;
  } else {
    demoTasks.forEach((t) => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.innerHTML = `
        <div class="list-main">
          <div class="list-title">${t.time} – ${t.title}</div>
          <div class="list-tag">${t.type}</div>
        </div>
      `;
      tasksList.appendChild(li);
    });
  }
}

function renderSlaRisks() {
  const now = new Date();
  const list = document.getElementById("slaRiskList");
  list.innerHTML = "";

  const atRisk = demoLeads.filter((l) => {
    if (!l.slaDueAt) return false;
    const due = new Date(l.slaDueAt);
    return due.getTime() - now.getTime() < 60 * 60 * 1000; // <1h
  });

  document.getElementById("slaRiskCountChip").textContent = atRisk.length;
  const slaPill = document.getElementById("slaStatusPill");

  if (atRisk.length === 0) {
    list.innerHTML = `<li class="list-empty">ამ ეტაპზე SLA რისკი არ ფიქსირდება. ✅</li>`;
    slaPill.textContent = "SLA შესრულებულია";
    slaPill.classList.remove("pill-warning");
    slaPill.classList.add("pill-ok");
  } else {
    slaPill.textContent = "SLA რისკის ქვეშ";
    slaPill.classList.remove("pill-ok");
    slaPill.classList.add("pill-warning");

    atRisk.forEach((l) => {
      const due = new Date(l.slaDueAt);
      const minsLeft = Math.round((due.getTime() - now.getTime()) / 60000);
      const li = document.createElement("li");
      li.className = "list-item list-item-warning";
      li.innerHTML = `
        <div class="list-main">
          <div class="list-title">${l.name} · ${l.id}</div>
          <div class="list-sub">დარჩენილია ≈ ${minsLeft} წთ SLA-მდე</div>
        </div>
      `;
      list.appendChild(li);
    });
  }
}

function renderActivityFeed() {
  const feed = document.getElementById("activityFeed");
  feed.innerHTML = "";

  if (!demoActivities.length) {
    feed.innerHTML = `<li class="list-empty">აქტივობები ჯერჯერობით არ არის.</li>`;
    return;
  }

  demoActivities.forEach((a) => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `
      <div class="list-main">
        <div class="list-title">${a.text}</div>
        <div class="list-sub">${a.time}</div>
      </div>
    `;
    feed.appendChild(li);
  });
}

// ---- Quick actions -----------------------------------------------------

function setupQuickActions() {
  const leadBtn = document.getElementById("quickCreateLeadBtn");
  const propBtn = document.getElementById("quickCreatePropertyBtn");
  const clearActivityBtn = document.getElementById("clearActivityBtn");

  leadBtn.addEventListener("click", () => {
    const id = `G-${String(125 + demoLeads.length).padStart(5, "0")}`;
    demoLeads.unshift({
      id,
      name: "ახალი demo ლიდი",
      stage: "new",
      budgetGel: 200000,
      createdAt: new Date().toISOString(),
      lastContactAt: null,
      slaDueAt: new Date(Date.now() + 30 * 60000).toISOString(),
    });
    demoActivities.unshift({
      time: new Date().toLocaleTimeString("ka-GE"),
      text: `დაემატა ახალი demo ლიდი: ${id}`,
      type: "lead",
    });
    refreshDashboard();
  });

  propBtn.addEventListener("click", () => {
    const id = `P-DEMO-${demoProperties.length + 1}`;
    demoProperties.unshift({
      id,
      address: "Demo მისამართი, თბილისი",
      district: "თბილისი",
      type: "sale",
      status: "active",
      priceGel: 300000,
    });
    demoActivities.unshift({
      time: new Date().toLocaleTimeString("ka-GE"),
      text: `დაემატა demo ობიექტი: ${id}`,
      type: "property",
    });
    refreshDashboard();
  });

  clearActivityBtn.addEventListener("click", () => {
    demoActivities = [];
    refreshDashboard();
  });
}

// ---- Refresh all -------------------------------------------------------

function refreshDashboard() {
  renderKpis();
  renderPipeline();
  renderShowingsAndTasks();
  renderSlaRisks();
  renderActivityFeed();
}

// ---- Init --------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  setupQuickActions();
  refreshDashboard();
});
