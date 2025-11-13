/* GADELA CRM — Demo (Frontend-only)
   მონაცემები ინახება localStorage-ში.
   მოდულები: Auth (role mock), Leads, Properties, Deals, SLA indicator, Audit Trail, Filters.
*/

const LS_KEYS = {
  ROLE: "gadela_role",
  LEADS: "gadela_leads",
  PROPS: "gadela_props",
  DEALS: "gadela_deals",
  AUDIT: "gadela_audit"
};

const state = {
  role: null,
  leads: [],
  props: [],
  deals: [],
  audit: []
};

function loadState(){
  state.role = localStorage.getItem(LS_KEYS.ROLE);
  state.leads = JSON.parse(localStorage.getItem(LS_KEYS.LEADS) || "[]");
  state.props = JSON.parse(localStorage.getItem(LS_KEYS.PROPS) || "[]");
  state.deals = JSON.parse(localStorage.getItem(LS_KEYS.DEALS) || "[]");
  state.audit = JSON.parse(localStorage.getItem(LS_KEYS.AUDIT) || "[]");
}
function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function logAudit(action, payload){
  const item = { ts: new Date().toISOString(), actor: state.role || "GUEST", action, payload };
  state.audit.unshift(item);
  save(LS_KEYS.AUDIT, state.audit);
  renderAudit();
}

/* ---------- Auth ---------- */
const authSection = document.getElementById("authSection");
const appSection  = document.getElementById("appSection");
const roleBadge   = document.getElementById("roleBadge");
const logoutBtn   = document.getElementById("logoutBtn");
const roleSelect  = document.getElementById("roleSelect");
const loginBtn    = document.getElementById("loginBtn");

loginBtn.onclick = () => {
  const role = roleSelect.value || "AGENT";
  localStorage.setItem(LS_KEYS.ROLE, role);
  loadState();
  mountUI();
  logAudit("LOGIN", { role });
};
logoutBtn.onclick = () => {
  localStorage.removeItem(LS_KEYS.ROLE);
  loadState();
  mountUI();
  logAudit("LOGOUT", {});
};

function mountUI(){
  if(state.role){
    authSection.style.display="none";
    appSection.style.display="block";
    roleBadge.textContent = "როლი: " + state.role;
  }else{
    authSection.style.display="block";
    appSection.style.display="none";
    roleBadge.textContent = "როლი: გესტ";
  }
}

/* ---------- Tabs ---------- */
const tabs = document.querySelectorAll(".tab");
const panelLeads = document.getElementById("panelLeads");
const panelProps = document.getElementById("panelProperties");
const panelDeals = document.getElementById("panelDeals");
const panelAudit = document.getElementById("panelAudit");
tabs.forEach(t => t.onclick = () => {
  tabs.forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  const tab = t.dataset.tab;
  panelLeads.style.display   = tab==="leads"      ? "block":"none";
  panelProps.style.display   = tab==="properties" ? "block":"none";
  panelDeals.style.display   = tab==="deals"      ? "block":"none";
  panelAudit.style.display   = tab==="audit"      ? "block":"none";
});

/* ---------- Search & KPI ---------- */
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const clearFilter = document.getElementById("clearFilter");
const kpiLeads = document.getElementById("kpiLeads");
const kpiSLA = document.getElementById("kpiSLA");
const kpiDeals = document.getElementById("kpiDeals");

searchInput.oninput = renderLeads;
filterSelect.onchange = renderLeads;
clearFilter.onclick = () => { searchInput.value=""; filterSelect.value=""; renderLeads(); };

/* ---------- Leads CRUD ---------- */
const leadName  = document.getElementById("leadName");
const leadPhone = document.getElementById("leadPhone");
const leadEmail = document.getElementById("leadEmail");
const leadSource= document.getElementById("leadSource");
const addLeadBtn= document.getElementById("addLeadBtn");
const leadsList = document.getElementById("leadsList");

addLeadBtn.onclick = () => {
  const name = leadName.value.trim();
  if(!name){ alert("სახელი აუცილებელია"); return; }
  const phone = leadPhone.value.trim() || null;
  const email = leadEmail.value.trim() || null;

  // Duplicate guard by phone/email
  if(phone && state.leads.some(l => l.phone === phone)){ alert("დუბლიკატი (ტელეფონი)"); return; }
  if(email && state.leads.some(l => l.email === email)){ alert("დუბლიკატი (ელფოსტა)"); return; }

  const lead = {
    id: crypto.randomUUID(),
    contact_name: name,
    phone, email,
    source: leadSource.value.trim() || null,
    status: "NEW",
    created_at: Date.now(),
    // SLA due 15 minutes
    sla_due_at: Date.now() + 15*60*1000,
    owner: state.role || "AGENT"
  };
  state.leads.unshift(lead);
  save(LS_KEYS.LEADS, state.leads);
  logAudit("LEAD_CREATE", {id: lead.id, name});
  leadName.value = ""; leadPhone.value=""; leadEmail.value=""; leadSource.value="";
  renderLeads();
  renderKPI();
};

function changeLeadStatus(id, status){
  const l = state.leads.find(x => x.id===id); if(!l) return;
  l.status = status;
  save(LS_KEYS.LEADS, state.leads);
  logAudit("LEAD_STATUS", {id, status});
  renderLeads(); renderKPI();
}

function renderLeads(){
  const term = (searchInput.value || "").toLowerCase();
  const filter = filterSelect.value;
  const now = Date.now();
  leadsList.innerHTML = "";
  state.leads
    .filter(l => {
      const inTerm = [l.contact_name, l.phone, l.email].filter(Boolean).some(v => (v+"").toLowerCase().includes(term));
      const inFilter = !filter || l.status === filter;
      return inTerm && inFilter;
    })
    .forEach(l => {
      const breach = l.status==="NEW" && l.sla_due_at && l.sla_due_at < now;
      const card = document.createElement("div");
      card.className = "card row between center";
      card.innerHTML = `
        <div>
          <div class="row gap center">
            <b>${escapeHtml(l.contact_name)}</b>
            ${breach ? '<span class="badge-sla">SLA</span>' : ''}
          </div>
          <div class="xs muted">${l.phone || ""} ${l.email ? " · "+escapeHtml(l.email):""} ${l.source? " · "+escapeHtml(l.source):""}</div>
          <div class="xs muted">სტატუსი: ${l.status}</div>
        </div>
        <div class="row gap">
          ${["NEW","CONTACTED","QUALIFIED","SHOWING","OFFER","WON","LOST"].map(s => `
            <button class="tab ${l.status===s?"active":""}" data-s="${s}">${s}</button>
          `).join("")}
        </div>
      `;
      card.querySelectorAll("button.tab").forEach(btn=>{
        btn.onclick = ()=> changeLeadStatus(l.id, btn.dataset.s);
      });
      leadsList.appendChild(card);
    });
}

/* ---------- Properties CRUD ---------- */
const propAddress = document.getElementById("propAddress");
const propDistrict= document.getElementById("propDistrict");
const propRooms   = document.getElementById("propRooms");
const propFloor   = document.getElementById("propFloor");
const addPropBtn  = document.getElementById("addPropBtn");
const propsList   = document.getElementById("propsList");

addPropBtn.onclick = () => {
  const address = propAddress.value.trim();
  if(!address){ alert("მისამართი აუცილებელია"); return; }
  const p = {
    id: crypto.randomUUID(),
    address,
    district: propDistrict.value.trim() || null,
    rooms: parseInt(propRooms.value || "0") || null,
    floor: parseInt(propFloor.value || "0") || null,
    status: "ACTIVE",
    created_at: Date.now()
  };
  state.props.unshift(p);
  save(LS_KEYS.PROPS, state.props);
  logAudit("PROPERTY_CREATE", {id: p.id, address});
  propAddress.value=""; propDistrict.value=""; propRooms.value=""; propFloor.value="";
  renderProps();
};

function changePropStatus(id, status){
  const p = state.props.find(x=>x.id===id); if(!p) return;
  p.status = status;
  save(LS_KEYS.PROPS, state.props);
  logAudit("PROPERTY_STATUS", {id, status});
  renderProps();
}

function renderProps(){
  propsList.innerHTML = "";
  const term = (searchInput.value || "").toLowerCase();
  state.props
    .filter(p => [p.address, p.district].filter(Boolean).some(v => (v+"").toLowerCase().includes(term)))
    .forEach(p=>{
      const el = document.createElement("div");
      el.className = "card row between center";
      el.innerHTML = `
        <div>
          <b>${escapeHtml(p.address)}</b>
          <div class="xs muted">${p.district || ""} ${p.rooms? " · "+p.rooms+" ოთახი":""} ${p.floor? " · "+p.floor+" სართული":""}</div>
          <div class="xs muted">სტატუსი: ${p.status}</div>
        </div>
        <div class="row gap">
          ${["ACTIVE","SHOWING","RESERVED","UNDER_OFFER","CLOSED","ARCHIVED"].map(s => `
            <button class="tab ${p.status===s?"active":""}" data-s="${s}">${s}</button>
          `).join("")}
        </div>
      `;
      el.querySelectorAll("button.tab").forEach(btn=>{
        btn.onclick = ()=> changePropStatus(p.id, btn.dataset.s);
      });
      propsList.appendChild(el);
    });
}

/* ---------- Deals (simple) ---------- */
const dealsList = document.getElementById("dealsList");
function ensureDealFromLead(lead){
  // simplistic: create deal when status becomes OFFER/WON (once)
  if(["OFFER","WON"].includes(lead.status) && !state.deals.some(d=>d.lead_id===lead.id)){
    const d = {
      id: crypto.randomUUID(),
      lead_id: lead.id,
      title: `Deal · ${lead.contact_name}`,
      stage: lead.status==="WON" ? "CLOSED_WON" : "UNDER_OFFER",
      created_at: Date.now()
    };
    state.deals.unshift(d);
    save(LS_KEYS.DEALS, state.deals);
    logAudit("DEAL_CREATE", {id: d.id, lead: lead.id});
  }
}
function changeDealStage(id, stage){
  const d = state.deals.find(x=>x.id===id); if(!d) return;
  d.stage = stage;
  save(LS_KEYS.DEALS, state.deals);
  logAudit("DEAL_STAGE", {id, stage});
  renderDeals(); renderKPI();
}
function renderDeals(){
  dealsList.innerHTML = "";
  state.deals.forEach(d=>{
    const el = document.createElement("div");
    el.className="card row between center";
    el.innerHTML = `
      <div>
        <b>${escapeHtml(d.title)}</b>
        <div class="xs muted">სტადია: ${d.stage}</div>
      </div>
      <div class="row gap">
        ${["NEW","UNDER_OFFER","CLOSED_WON","CLOSED_LOST"].map(s=>`
          <button class="tab ${d.stage===s?"active":""}" data-s="${s}">${s}</button>
        `).join("")}
      </div>
    `;
    el.querySelectorAll("button.tab").forEach(b=> b.onclick=()=>changeDealStage(d.id,b.dataset.s));
    dealsList.appendChild(el);
  });
}

/* ---------- Audit ---------- */
const auditList = document.getElementById("auditList");
function renderAudit(){
  auditList.innerHTML = state.audit.map(a => `
    <div class="audit-item">
      <b>${new Date(a.ts).toLocaleString()}</b> — <b>${a.actor}</b> — ${a.action}
      <div class="xs muted">${escapeHtml(JSON.stringify(a.payload))}</div>
    </div>
  `).join("");
}

/* ---------- KPI ---------- */
function renderKPI(){
  const now = Date.now();
  const sla = state.leads.filter(l => l.status==="NEW" && l.sla_due_at && l.sla_due_at<now).length;
  kpiLeads.textContent = state.leads.length;
  kpiSLA.textContent = sla;
  kpiDeals.textContent = state.deals.length;
}

/* ---------- Helpers ---------- */
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* ---------- Boot ---------- */
loadState();
mountUI();
renderLeads();
renderProps();
renderDeals();
renderAudit();
renderKPI();

/* Observe lead status to spawn deals */
const origChange = changeLeadStatus;
changeLeadStatus = (id, status) => {
  origChange(id, status);
  const l = state.leads.find(x=>x.id===id);
  if(l) ensureDealFromLead(l);
};
