const API_BASE = "http://localhost:8000/api";

let authToken = localStorage.getItem("mama_token") || "";
let currentUser = null;
let patientesCache = [];
let cpnCache = [];

const loginForm = document.querySelector("#login-form");
const userInfo = document.querySelector("#user-info");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout-button");
const statsSection = document.querySelector("#stats");
const patientTableBody = document.querySelector("#patient-table tbody");
const dossierContent = document.querySelector("#dossier-content");
const consultationForm = document.querySelector("#consultation-form");
const consultationSelect = document.querySelector("#consultation-patiente");
const consultationMessage = document.querySelector("#consultation-message");
const reminderForm = document.querySelector("#reminder-form");
const reminderSelect = document.querySelector("#reminder-cpn");
const reminderMessage = document.querySelector("#reminder-message");
const chatbotForm = document.querySelector("#chatbot-form");
const chatbotResponse = document.querySelector("#chatbot-response");

const defaultHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

async function fetchJSON(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...defaultHeaders(), ...(options.headers || {}) },
  });
  if (response.status === 401) {
    handleLogout();
    throw new Error("Session expirée");
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur API");
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

function toggleAuthUI(isLoggedIn) {
  if (isLoggedIn) {
    loginForm.classList.add("hidden");
    userInfo.classList.remove("hidden");
  } else {
    loginForm.classList.remove("hidden");
    userInfo.classList.add("hidden");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const telephone = document.querySelector("#login-telephone").value.trim();
  const password = document.querySelector("#login-password").value.trim();
  try {
    const data = await fetchJSON("/auth/login", {
      method: "POST",
      body: JSON.stringify({ telephone, password }),
    });
    authToken = data.access_token;
    localStorage.setItem("mama_token", authToken);
    await bootstrap();
  } catch (error) {
    alert("Connexion impossible : " + error.message);
  }
}

function handleLogout() {
  authToken = "";
  localStorage.removeItem("mama_token");
  currentUser = null;
  toggleAuthUI(false);
}

async function fetchCurrentUser() {
  currentUser = await fetchJSON("/auth/me");
  userName.textContent = `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim() || currentUser.telephone;
  toggleAuthUI(true);
}

function renderStats(stats) {
  statsSection.innerHTML = `
    <h2>Indicateurs clés</h2>
    <div class="stats-grid">
      <div>
        <span class="stat-value">${stats.total_patientes}</span>
        <span class="stat-label">Patientes inscrites</span>
      </div>
      <div>
        <span class="stat-value">${stats.cpn_planifiees}</span>
        <span class="stat-label">CPN planifiées</span>
      </div>
      <div>
        <span class="stat-value">${stats.cpn_aujourd_hui}</span>
        <span class="stat-label">CPN du jour</span>
      </div>
      <div>
        <span class="stat-value">${stats.cpn_manquees}</span>
        <span class="stat-label">CPN manquées</span>
      </div>
      <div>
        <span class="stat-value">${stats.consultations_ce_mois}</span>
        <span class="stat-label">Consultations ce mois</span>
      </div>
    </div>
  `;
}

function renderPatientes(patientes) {
  patientTableBody.innerHTML = "";
  patientes.forEach((patiente) => {
    const row = document.createElement("tr");
    const prochaine = patiente.prochaine_cpn
      ? new Date(patiente.prochaine_cpn.date_rdv).toLocaleString()
      : "–";
    const statut = patiente.prochaine_cpn ? patiente.prochaine_cpn.statut : "–";

    row.innerHTML = `
      <td>${patiente.prenom || ""} ${patiente.nom || ""}</td>
      <td>${patiente.age}</td>
      <td>${prochaine}</td>
      <td>${statut}</td>
    `;
    row.addEventListener("click", () => loadDossier(patiente.id));
    patientTableBody.appendChild(row);
  });

  consultationSelect.innerHTML = patientes
    .map((patiente) => `<option value="${patiente.id}">${patiente.prenom || ""} ${patiente.nom || ""}</option>`)
    .join("");
}

function renderReminders(cpnList) {
  reminderSelect.innerHTML = cpnList
    .map((cpn) => {
      const label = `${cpn.patiente.nom || ""} ${cpn.patiente.prenom || ""} – CPN ${cpn.numero_cpn} (${new Date(
        cpn.date_rdv
      ).toLocaleString()})`;
      return `<option value="${cpn.id}">${label}</option>`;
    })
    .join("");
}

function renderDossier(dossier) {
  const consultations = dossier.consultations
    .map(
      (c) => `
        <li>
          <strong>${new Date(c.date_consultation).toLocaleString()} :</strong>
          Poids ${c.poids || "–"} kg, TA ${c.tension_arterielle_systolique || "–"}/${
        c.tension_arterielle_diastolique || "–"
      }
          <br/>${c.notes || ""}
        </li>
      `
    )
    .join("") || "<li>Aucune consultation enregistrée.</li>";

  const vaccinations = dossier.vaccinations
    .map(
      (v) => `
        <li>${v.type_vaccin} – ${new Date(v.date_vaccination).toLocaleDateString()} (${v.site_injection || ""})</li>
      `
    )
    .join("") || "<li>Aucune vaccination enregistrée.</li>";

  const cpnList = dossier.cpn
    .map(
      (cpn) => `
        <li>CPN ${cpn.numero_cpn} – ${new Date(cpn.date_rdv).toLocaleString()} (${cpn.statut})</li>
      `
    )
    .join("") || "<li>Aucun rendez-vous programmé.</li>";

  // Affichage de la prédiction de risque
  let predictionHTML = "";
  if (dossier.prediction_risk && dossier.prediction_risk.available) {
    const risk = dossier.prediction_risk;
    const riskClass = risk.risk_level === "élevé" ? "risk-high" : risk.risk_level === "moyen" ? "risk-medium" : "risk-low";
    const riskPercentage = Math.round(risk.risk_score * 100);
    
    const recommendations = risk.recommendations
      .map((rec) => `<li>${rec}</li>`)
      .join("") || "<li>Aucune recommandation spécifique</li>";

    predictionHTML = `
      <article class="prediction-card ${riskClass}">
        <h4>Prédiction de risque</h4>
        <div class="risk-info">
          <div class="risk-score">
            <span class="risk-value">${riskPercentage}%</span>
            <span class="risk-label">Risque ${risk.risk_level}</span>
          </div>
          <div class="risk-confidence">Confiance: ${Math.round(risk.confidence * 100)}%</div>
        </div>
        <div class="risk-recommendations">
          <h5>Recommandations:</h5>
          <ul>${recommendations}</ul>
        </div>
      </article>
    `;
  } else if (dossier.prediction_risk && !dossier.prediction_risk.available) {
    predictionHTML = `
      <article class="prediction-card">
        <h4>Prédiction de risque</h4>
        <p class="prediction-unavailable">Modèle de prédiction non disponible</p>
      </article>
    `;
  }

  dossierContent.innerHTML = `
    <h3>${dossier.patiente.nom || ""} ${dossier.patiente.prenom || ""}</h3>
    <div class="dossier-grids">
      <article>
        <h4>Consultations</h4>
        <ul>${consultations}</ul>
      </article>
      <article>
        <h4>Rendez-vous CPN</h4>
        <ul>${cpnList}</ul>
      </article>
      <article>
        <h4>Vaccinations</h4>
        <ul>${vaccinations}</ul>
      </article>
      ${predictionHTML}
    </div>
  `;
}

async function loadDossier(patienteId) {
  try {
    const dossier = await fetchJSON(`/patientes/${patienteId}/dossier`);
    renderDossier(dossier);
  } catch (error) {
    dossierContent.textContent = `Erreur lors du chargement : ${error.message}`;
  }
}

async function loadDashboardData() {
  const [stats, patientes, cpn] = await Promise.all([
    fetchJSON("/dashboard/stats"),
    fetchJSON("/dashboard/patientes"),
    fetchJSON("/cpn?statut=planifie"),
  ]);
  patientesCache = patientes;
  cpnCache = cpn;
  renderStats(stats);
  renderPatientes(patientes);
  renderReminders(cpn);
}

async function handleConsultationSubmit(event) {
  event.preventDefault();
  const patienteId = Number(consultationSelect.value);
  const poids = Number(document.querySelector("#consultation-poids").value) || null;
  const tas = Number(document.querySelector("#consultation-tas").value) || null;
  const tad = Number(document.querySelector("#consultation-tad").value) || null;
  const notes = document.querySelector("#consultation-notes").value.trim();

  try {
    await fetchJSON("/consultations", {
      method: "POST",
      body: JSON.stringify({
        patiente_id: patienteId,
        poids,
        tension_arterielle_systolique: tas,
        tension_arterielle_diastolique: tad,
        notes,
      }),
    });
    consultationMessage.textContent = "Consultation enregistrée";
    consultationMessage.className = "message success";
    consultationForm.reset();
    await loadDashboardData();
  } catch (error) {
    consultationMessage.textContent = error.message;
    consultationMessage.className = "message error";
  }
}

async function handleReminderSubmit(event) {
  event.preventDefault();
  const cpnId = Number(reminderSelect.value);
  const selectedTypes = Array.from(reminderForm.querySelectorAll("input[type=checkbox]:checked")).map(
    (input) => input.value
  );
  try {
    await fetchJSON(`/cpn/${cpnId}/rappels`, {
      method: "POST",
      body: JSON.stringify({ types: selectedTypes }),
    });
    reminderMessage.textContent = "Rappels envoyés";
    reminderMessage.className = "message success";
    await loadDashboardData();
  } catch (error) {
    reminderMessage.textContent = error.message;
    reminderMessage.className = "message error";
  }
}

async function handleChatbotSubmit(event) {
  event.preventDefault();
  chatbotResponse.textContent = "Envoi...";
  const numero = document.querySelector("#chatbot-numero").value.trim();
  const langue = document.querySelector("#chatbot-langue").value;
  const message = document.querySelector("#chatbot-message").value.trim();
  try {
    const response = await fetchJSON("/chatbot/messages", {
      method: "POST",
      body: JSON.stringify({ numero_expediteur: numero, message_recu: message, langue }),
    });
    chatbotResponse.textContent = `Réponse: ${response.message_envoye}`;
    chatbotResponse.className = "message success";
    chatbotForm.reset();
  } catch (error) {
    chatbotResponse.textContent = error.message;
    chatbotResponse.className = "message error";
  }
}

async function bootstrap() {
  try {
    if (!authToken) {
      toggleAuthUI(false);
      return;
    }
    await fetchCurrentUser();
    await loadDashboardData();
  } catch (error) {
    handleLogout();
    console.error(error);
  }
}

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", handleLogout);
consultationForm.addEventListener("submit", handleConsultationSubmit);
reminderForm.addEventListener("submit", handleReminderSubmit);
chatbotForm.addEventListener("submit", handleChatbotSubmit);

bootstrap();

