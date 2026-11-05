(() => {
  "use strict";

  const config = window.APP_CONFIG || {};
  const apiBase = String(config.API_BASE_URL || "").trim().replace(/\/$/, "");
  const apiConfigured = Boolean(apiBase);

  let state = { plans: [], students: [] };
  let currentForm = null;
  let noticeTimeout;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const asArray = (value) => Array.isArray(value) ? value : (value?.items || value?.data || []);

  function normalizePlan(plan) {
    return { ...plan, id: Number(plan.id), nome: plan.nome ?? plan.name ?? "Plano", descricao: plan.descricao ?? plan.description ?? "", preco: Number(plan.preco ?? plan.price ?? 0), duracao_dias: Number(plan.duracao_dias ?? plan.durationDays ?? 30), ativo: Boolean(plan.ativo ?? plan.active ?? true) };
  }
  function normalizeStudent(student) {
    return { ...student, id: Number(student.id), plano_id: Number(student.plano_id ?? student.planId ?? student.plano?.id), nome: student.nome ?? student.name ?? "Aluno", email: student.email ?? "", telefone: student.telefone ?? student.phone ?? "", data_nascimento: student.data_nascimento ?? student.birthDate ?? "", ativo: Boolean(student.ativo ?? student.active ?? true), criado_em: student.criado_em ?? student.createdAt ?? new Date().toISOString() };
  }
  async function request(path, options = {}) {
    if (!apiConfigured) throw new Error("API_BASE_URL não está configurada em frontend/config.js.");
    const response = await fetch(`${apiBase}${path}`, { ...options, headers: { ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) } });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
    if (!response.ok) throw new Error(payload?.mensagem || payload?.message || payload?.error || `Falha na API (${response.status}).`);
    return payload;
  }
  const sendJson = (method, body) => ({ method, body: JSON.stringify(body) });

  async function loadState() {
    if (!apiConfigured) {
      state = { plans: [], students: [] };
      return;
    }
    const [plans, students] = await Promise.all([request("/planos"), request("/alunos")]);
    state.plans = asArray(plans).map(normalizePlan);
    state.students = asArray(students).map(normalizeStudent);
  }
  const planById = (id) => state.plans.find((plan) => Number(plan.id) === Number(id));
  const studentById = (id) => state.students.find((student) => Number(student.id) === Number(id));
  const formatPrice = (price) => Number(price || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const formatDate = (value) => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(" de ", " ") : "—";
  const initials = (name = "A") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const avatarColor = (id) => `color-${Number(id) % 4}`;
  const studentName = (id) => studentById(id)?.nome || "Aluno";
  const statusLabel = (active) => active ? '<span class="status active">Ativo</span>' : '<span class="status inactive">Inativo</span>';
  const countLabel = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;

  function toast(message, error = false) {
    const notice = $("#notice");
    notice.textContent = message;
    notice.classList.toggle("error", error);
    notice.classList.add("show");
    clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(() => notice.classList.remove("show"), 3600);
  }

  function setView(name) {
    const view = $(`#view-${name}`);
    if (!view) return;
    $$(".view").forEach((item) => item.classList.toggle("active", item === view));
    $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === name));
    $("#breadcrumb-current").textContent = view.dataset.title;
    history.replaceState(null, "", `#${name}`);
    $("#sidebar").classList.remove("open");
    if (name === "relatorios") refreshReport();
    if (name === "alunos") renderStudents();
  }

  function renderDashboard() {
    const activeStudents = state.students.filter((student) => student.ativo);
    const activePlans = state.plans.filter((plan) => plan.ativo);
    $("#metric-students").textContent = state.students.length;
    $("#metric-active").textContent = activeStudents.length;
    $("#metric-plans").textContent = activePlans.length;
    $("#metric-documents").textContent = "—";
    $("#student-nav-count").textContent = state.students.length;
    const planCounts = activePlans.map((plan) => ({ plan, count: activeStudents.filter((student) => Number(student.plano_id) === Number(plan.id)).length }));
    const maxCount = Math.max(1, ...planCounts.map((row) => row.count));
    $("#overview-chart").innerHTML = planCounts.length ? planCounts.slice(0, 5).map(({ plan, count }) => `<div class="bar-column"><span class="bar-amount">${count}</span><div class="bar-track"><div class="bar-fill" style="height:${Math.max(4, (count / maxCount) * 100)}%"></div></div><span class="bar-name" title="${esc(plan.nome)}">${esc(plan.nome)}</span></div>`).join("") : '<div class="empty-state">Cadastre um plano para visualizar o relatório.</div>';
    $("#chart-caption").textContent = `${activeStudents.length} ${activeStudents.length === 1 ? "aluno ativo" : "alunos ativos"}`;
    const recent = [...state.students].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 5);
    $("#recent-students").innerHTML = recent.length ? recent.map((student) => `<tr><td>${personMarkup(student)}</td><td>${esc(planById(student.plano_id)?.nome || "Plano removido")}</td><td>${formatDate(student.criado_em)}</td><td>${statusLabel(student.ativo)}</td><td><button class="row-action" data-detail-student="${student.id}" aria-label="Ver ${esc(student.nome)}">···</button></td></tr>`).join("") : '<tr><td class="empty-cell" colspan="5">Ainda não há alunos cadastrados.</td></tr>';
    renderPlanFilters();
  }

  function personMarkup(student) {
    return `<div class="person-cell"><span class="student-avatar ${avatarColor(student.id)}">${esc(initials(student.nome))}</span><span><strong>${esc(student.nome)}</strong><small>${esc(student.email)}</small></span></div>`;
  }

  function renderPlanFilters() {
    const select = $("#student-plan-filter");
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="todos">Todos os planos</option>' + state.plans.map((plan) => `<option value="${plan.id}">${esc(plan.nome)}</option>`).join("");
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  }

  function renderStudents() {
    if (!$("#students-table")) return;
    renderPlanFilters();
    const term = $("#student-search").value.trim().toLocaleLowerCase("pt-BR");
    const status = $("#student-status-filter").value;
    const planId = $("#student-plan-filter").value;
    const filtered = state.students.filter((student) => {
      const matchesTerm = !term || `${student.nome} ${student.email}`.toLocaleLowerCase("pt-BR").includes(term);
      const matchesStatus = status === "todos" || (status === "ativo" ? student.ativo : !student.ativo);
      const matchesPlan = planId === "todos" || Number(planId) === Number(student.plano_id);
      return matchesTerm && matchesStatus && matchesPlan;
    });
    $("#students-table").innerHTML = filtered.length ? filtered.map((student) => `<tr><td>${personMarkup(student)}</td><td>${esc(planById(student.plano_id)?.nome || "Plano removido")}</td><td>${esc(student.telefone || "—")}</td><td>${statusLabel(student.ativo)}</td><td><button class="row-action" data-detail-student="${student.id}" aria-label="Ver ${esc(student.nome)}">···</button></td></tr>`).join("") : '<tr><td class="empty-cell" colspan="5">Nenhum aluno encontrado. Ajuste os filtros ou cadastre um aluno.</td></tr>';
    $("#student-count-label").textContent = countLabel(filtered.length, "aluno");
  }

  function renderPlans() {
    $("#plans-grid").innerHTML = state.plans.length ? state.plans.map((plan, index) => {
      const count = state.students.filter((student) => Number(student.plano_id) === Number(plan.id) && student.ativo).length;
      return `<article class="plan-card ${plan.ativo ? "" : "inactive-plan"}"><div class="plan-card-head"><span class="plan-symbol">${index % 3 === 0 ? "↗" : index % 3 === 1 ? "✳" : "◇"}</span>${statusLabel(plan.ativo)}</div><h2>${esc(plan.nome)}</h2><p class="plan-description">${esc(plan.descricao || "Sem descrição cadastrada.")}</p><div class="plan-price">${formatPrice(plan.preco)} <small>/ ${Number(plan.duracao_dias) === 30 ? "mês" : `${Number(plan.duracao_dias)} dias`}</small></div><div class="plan-card-bottom"><span>${countLabel(count, "aluno ativo", "alunos ativos")}</span><span class="plan-actions"><button class="tiny-button" data-edit-plan="${plan.id}">Editar</button><button class="tiny-button danger-link" data-delete-plan="${plan.id}">Excluir</button></span></div></article>`;
    }).join("") : '<div class="panel empty-state"><strong>Nenhum plano por aqui.</strong>Crie o primeiro plano da academia.</div>';
  }

  function renderReportRows(data) {
    const rows = asArray(data).map((row) => ({ name: row.plano_nome ?? row.nome_plano ?? row.nome ?? row.planName ?? planById(row.plano_id ?? row.planId)?.nome ?? "Plano", count: Number(row.quantidade_alunos ?? row.total_alunos ?? row.total ?? row.count ?? 0) }));
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    $("#report-total").textContent = total;
    const maxCount = Math.max(1, ...rows.map((row) => row.count));
    $("#report-rows").innerHTML = rows.length ? rows.map((row) => `<div class="report-row"><span class="report-name">${esc(row.name)}</span><div class="report-track"><div class="report-fill" style="width:${row.count ? Math.max(4, (row.count / maxCount) * 100) : 0}%"></div></div><strong class="report-value">${row.count}</strong></div>`).join("") : '<div class="empty-state"><strong>Não há planos ativos.</strong>Ative ou cadastre um plano para ver a distribuição.</div>';
  }

  async function refreshReport() {
    $("#report-rows").innerHTML = '<div class="empty-state">Carregando relatório…</div>';
    try { renderReportRows(await request("/relatorios/alunos-ativos-por-plano")); }
    catch (error) { $("#report-rows").innerHTML = `<div class="empty-state"><strong>Não foi possível carregar o relatório.</strong>${esc(error.message)}</div>`; toast(error.message, true); }
  }

  function renderAll() { renderDashboard(); renderStudents(); renderPlans(); }

  function dialogFor(form, title, eyebrow = "CADASTRO") {
    currentForm = form;
    $("#dialog-title").textContent = title;
    $("#dialog-eyebrow").textContent = eyebrow;
    $("#dialog-fields").innerHTML = form.fields;
    $("#dialog-submit").textContent = form.submit || "Salvar cadastro";
    $("#form-dialog").showModal();
  }

  const planOptions = (selected = "") => state.plans.filter((plan) => plan.ativo || Number(plan.id) === Number(selected)).map((plan) => `<option value="${plan.id}" ${Number(plan.id) === Number(selected) ? "selected" : ""}>${esc(plan.nome)}${plan.ativo ? "" : " (inativo)"}</option>`).join("");
  function studentForm(student = null) {
    const editing = Boolean(student);
    dialogFor({
      type: "student", id: student?.id,
      fields: `<div class="form-grid"><div class="form-field full"><label for="student-name">Nome completo <span>*</span></label><input id="student-name" name="nome" required maxlength="120" value="${esc(student?.nome || "")}" placeholder="Ex.: Ana Clara Ribeiro" /></div><div class="form-field"><label for="student-email">E-mail <span>*</span></label><input id="student-email" name="email" type="email" required maxlength="160" value="${esc(student?.email || "")}" placeholder="nome@email.com" /></div><div class="form-field"><label for="student-phone">Telefone</label><input id="student-phone" name="telefone" type="tel" value="${esc(student?.telefone || "")}" placeholder="(11) 99999-9999" /></div><div class="form-field"><label for="student-birth">Data de nascimento</label><input id="student-birth" name="data_nascimento" type="date" value="${esc(student?.data_nascimento || "")}" /></div><div class="form-field"><label for="student-plan">Plano <span>*</span></label><select id="student-plan" name="plano_id" required><option value="">Selecione um plano</option>${planOptions(student?.plano_id)}</select></div><div class="form-field full"><label class="check-field"><input name="ativo" type="checkbox" ${student?.ativo === false ? "" : "checked"} /><span>Aluno com matrícula ativa</span></label></div></div>`,
      submit: editing ? "Salvar alterações" : "Cadastrar aluno"
    }, editing ? "Editar aluno" : "Novo aluno", editing ? "ATUALIZAR CADASTRO" : "NOVA MATRÍCULA");
  }

  function planForm(plan = null) {
    const editing = Boolean(plan);
    dialogFor({
      type: "plan", id: plan?.id,
      fields: `<div class="form-grid"><div class="form-field full"><label for="plan-name">Nome do plano <span>*</span></label><input id="plan-name" name="nome" required maxlength="80" value="${esc(plan?.nome || "")}" placeholder="Ex.: Movimento+" /></div><div class="form-field full"><label for="plan-description">Descrição</label><textarea id="plan-description" name="descricao" maxlength="500" placeholder="O que está incluído neste plano?">${esc(plan?.descricao || "")}</textarea></div><div class="form-field"><label for="plan-price">Preço mensal (R$) <span>*</span></label><input id="plan-price" name="preco" type="number" min="0.01" step="0.01" required value="${esc(plan?.preco ?? "")}" placeholder="129,90" /></div><div class="form-field"><label for="plan-duration">Duração (dias) <span>*</span></label><input id="plan-duration" name="duracao_dias" type="number" min="1" step="1" required value="${esc(plan?.duracao_dias ?? 30)}" /></div><div class="form-field full"><label class="check-field"><input name="ativo" type="checkbox" ${plan?.ativo === false ? "" : "checked"} /><span>Plano disponível para novas matrículas</span></label></div></div>`,
      submit: editing ? "Salvar alterações" : "Criar plano"
    }, editing ? "Editar plano" : "Novo plano", editing ? "ATUALIZAR OPÇÃO" : "NOVA OPÇÃO");
  }

  async function saveEntity(event) {
    event.preventDefault();
    if (!currentForm) return;
    const data = new FormData(event.currentTarget);
    const button = $("#dialog-submit");
    button.disabled = true;
    try {
      if (currentForm.type === "student") {
        const payload = { nome: String(data.get("nome") || "").trim(), email: String(data.get("email") || "").trim(), telefone: String(data.get("telefone") || "").trim(), data_nascimento: data.get("data_nascimento") || null, plano_id: Number(data.get("plano_id")), ativo: data.has("ativo") };
        if (!payload.nome || !payload.email || !payload.plano_id) throw new Error("Preencha nome, e-mail e plano.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error("Informe um e-mail válido.");
        if (!planById(payload.plano_id)?.ativo) throw new Error("Selecione um plano ativo.");
        const path = currentForm.id ? `/alunos/${currentForm.id}` : "/alunos";
        await request(path, sendJson(currentForm.id ? "PUT" : "POST", payload));
        toast(currentForm.id ? "Cadastro do aluno atualizado." : "Aluno cadastrado.");
      } else {
        const payload = { nome: String(data.get("nome") || "").trim(), descricao: String(data.get("descricao") || "").trim(), preco: Number(data.get("preco")), duracao_dias: Number(data.get("duracao_dias")), ativo: data.has("ativo") };
        if (!payload.nome || !(payload.preco > 0) || !(payload.duracao_dias >= 1)) throw new Error("Informe nome, preço maior que zero e duração de pelo menos um dia.");
        const path = currentForm.id ? `/planos/${currentForm.id}` : "/planos";
        await request(path, sendJson(currentForm.id ? "PUT" : "POST", payload));
        toast(currentForm.id ? "Plano atualizado." : "Plano criado.");
      }
      await loadState();
      $("#form-dialog").close();
      renderAll();
    } catch (error) { toast(error.message, true); }
    finally { button.disabled = false; }
  }

  async function deletePlan(id) {
    const plan = planById(id);
    if (!plan) return;
    if (state.students.some((student) => Number(student.plano_id) === Number(id))) { toast("Este plano tem alunos associados. Transfira ou inative os cadastros antes de excluir.", true); return; }
    if (!confirm(`Excluir o plano “${plan.nome}”?`)) return;
    try {
      await request(`/planos/${id}`, { method: "DELETE" });
      await loadState();
      renderAll(); toast("Plano removido.");
    } catch (error) { toast(error.message, true); }
  }

  async function deleteStudent(id) {
    const student = studentById(id);
    if (!student || !confirm(`Excluir o cadastro de ${student.nome}?`)) return;
    try {
      await request(`/alunos/${id}`, { method: "DELETE" });
      await loadState();
      $("#student-dialog").close(); renderAll(); toast("Cadastro do aluno removido.");
    } catch (error) { toast(error.message, true); }
  }

  async function openStudentDetail(id) {
    const student = studentById(id);
    if (!student) return;
    const plan = planById(student.plano_id);
    $("#detail-title").textContent = student.nome;
    $("#student-detail").innerHTML = `<div class="detail-hero"><span class="student-avatar ${avatarColor(student.id)}">${esc(initials(student.nome))}</span><div><h3>${esc(student.nome)}</h3><p>${esc(student.email)}</p></div>${statusLabel(student.ativo)}</div><div class="detail-grid"><div class="detail-item"><small>PLANO</small><strong>${esc(plan?.nome || "Plano removido")}</strong></div><div class="detail-item"><small>TELEFONE</small><strong>${esc(student.telefone || "Não informado")}</strong></div><div class="detail-item"><small>NASCIMENTO</small><strong>${formatDate(student.data_nascimento)}</strong></div><div class="detail-item"><small>CADASTRO</small><strong>${formatDate(student.criado_em)}</strong></div></div><div class="document-head"><h3>Documentos de matrícula</h3><span class="eyebrow">PENDENTE</span></div><div class="document-list"><div class="empty-state">A integração de documentos com S3 ainda não foi implantada.</div></div><div class="dialog-actions detail-actions"><button class="button button-secondary danger-link" data-delete-student="${student.id}">Excluir aluno</button><button class="button button-primary" data-edit-student="${student.id}">Editar cadastro</button></div>`;
    $("#student-dialog").showModal();
  }

  function dispatchAction(action, id) {
    if (action === "new-student") {
      if (!state.plans.some((plan) => plan.ativo)) { toast("Cadastre primeiro um plano ativo.", true); setView("planos"); return; }
      studentForm();
    }
    if (action === "new-plan") planForm();
    if (action === "edit-plan") planForm(planById(id));
    if (action === "delete-plan") deletePlan(id);
    if (action === "detail-student") { openStudentDetail(id).then(() => { $("#student-dialog").dataset.studentId = id; }).catch((error) => toast(error.message, true)); }
    if (action === "edit-student") { const student = studentById(id); if (student) { $("#student-dialog").close(); studentForm(student); } }
    if (action === "delete-student") deleteStudent(id);
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const viewButton = event.target.closest("[data-view]");
      if (viewButton) { setView(viewButton.dataset.view); return; }
      const actionButton = event.target.closest("[data-action]");
      if (actionButton) { dispatchAction(actionButton.dataset.action); return; }
      const detail = event.target.closest("[data-detail-student]");
      if (detail) { dispatchAction("detail-student", detail.dataset.detailStudent); return; }
      const editStudent = event.target.closest("[data-edit-student]");
      if (editStudent) { dispatchAction("edit-student", editStudent.dataset.editStudent); return; }
      const deleteStudentButton = event.target.closest("[data-delete-student]");
      if (deleteStudentButton) { dispatchAction("delete-student", deleteStudentButton.dataset.deleteStudent); return; }
      const editPlan = event.target.closest("[data-edit-plan]");
      if (editPlan) { dispatchAction("edit-plan", editPlan.dataset.editPlan); return; }
      const deletePlanButton = event.target.closest("[data-delete-plan]");
      if (deletePlanButton) { dispatchAction("delete-plan", deletePlanButton.dataset.deletePlan); return; }
      if (event.target.closest("[data-close-dialog]")) event.target.closest("dialog")?.close();
    });
    $("#entity-form").addEventListener("submit", saveEntity);
    $("#student-search").addEventListener("input", renderStudents);
    $("#student-status-filter").addEventListener("change", renderStudents);
    $("#student-plan-filter").addEventListener("change", renderStudents);
    $("#refresh-report").addEventListener("click", refreshReport);
    $("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
    window.addEventListener("hashchange", () => { const view = location.hash.slice(1); if ($(`#view-${view}`)) setView(view); });
    for (const dialog of $$("dialog")) dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  }

  async function init() {
    $("#today-label").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(new Date());
    $("#api-status-banner").hidden = apiConfigured;
    bindEvents();
    try { localStorage.removeItem("movimento-academia-prototype-v1"); } catch { /* storage may be unavailable for file:// pages */ }
    if (!apiConfigured) {
      $("#api-status-banner").querySelector("div").innerHTML = "<strong>API não configurada</strong><span>Configure a URL da API em <code>frontend/config.js</code> para carregar dados reais.</span>";
      await loadState();
    } else {
      try { await loadState(); }
      catch (error) { $("#api-status-banner").hidden = false; $("#api-status-banner").querySelector("div").innerHTML = `<strong>Não foi possível conectar à API</strong><span>${esc(error.message)} Verifique a URL e o CORS em <code>config.js</code>.</span>`; toast(error.message, true); }
    }
    renderAll();
    const hashView = location.hash.slice(1);
    if (hashView && $(`#view-${hashView}`)) setView(hashView);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
