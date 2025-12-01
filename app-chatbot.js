const chatbotMessages = document.querySelector("#chatbot-messages");
const chatbotInput = document.querySelector("#chatbot-input");
const chatbotSendBtn = document.querySelector("#chatbot-send-btn");
const suggestionBtns = document.querySelectorAll(".suggestion-btn");

// Réponses prédéfinies du chatbot
const chatbotResponses = {
  "nutrition": "Pendant la grossesse, il est important de consommer des aliments riches en acide folique, fer, calcium et protéines. Privilégiez les fruits et légumes, les protéines maigres, et les produits laitiers. Évitez l'alcool, la caféine excessive, et les aliments crus.",
  "signes": "Les signes d'alerte à surveiller incluent : saignements vaginaux, douleurs abdominales intenses, perte de liquide amniotique, absence de mouvements du bébé, maux de tête sévères, ou fièvre élevée. En cas de doute, consultez immédiatement un professionnel de santé.",
  "consultation": "Vous devriez consulter un médecin immédiatement en cas de saignements, douleurs intenses, perte de liquide, ou absence de mouvements du bébé. Pour les urgences, appelez le +223 70 00 00 00.",
  "exercices": "Pendant la grossesse, les exercices doux sont recommandés : marche, natation, yoga prénatal. Évitez les sports de contact et les activités à haut risque. Consultez votre médecin avant de commencer un nouveau programme d'exercice."
};

// Réponses pour les symptômes (messages d'alerte)
const symptomResponses = {
  "saignement": "🚨 Signe d'alerte. Veuillez consulter immédiatement. Les saignements pendant la grossesse nécessitent une évaluation médicale urgente. Contactez votre médecin ou rendez-vous aux urgences.",
  "maux-tete": "🚨 Signe d'alerte. Veuillez consulter immédiatement. Des maux de tête forts pendant la grossesse peuvent indiquer un problème sérieux. Contactez votre médecin sans délai.",
  "fievre": "🚨 Signe d'alerte. Veuillez consulter immédiatement. La fièvre pendant la grossesse nécessite une attention médicale urgente. Contactez votre médecin ou rendez-vous aux urgences.",
  "vomissements": "🚨 Signe d'alerte. Veuillez consulter immédiatement. Des vomissements persistants peuvent entraîner une déshydratation et nécessitent une évaluation médicale. Contactez votre médecin sans délai."
};

function addMessage(text, isBot = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chatbot-message ${isBot ? "bot" : "user"}`;
  
  if (isBot) {
    messageDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <p>${text}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-content user-message">
        <p>${text}</p>
      </div>
    `;
  }
  
  chatbotMessages.appendChild(messageDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotResponse(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Détection des symptômes
  if (lowerQuestion.includes("saignement") || lowerQuestion.includes("sang")) {
    return symptomResponses.saignement;
  }
  
  if (lowerQuestion.includes("maux de tête") || lowerQuestion.includes("mal de tête") || lowerQuestion.includes("céphalée")) {
    return symptomResponses["maux-tete"];
  }
  
  if (lowerQuestion.includes("fièvre") || lowerQuestion.includes("fievre") || lowerQuestion.includes("température")) {
    return symptomResponses.fievre;
  }
  
  if (lowerQuestion.includes("vomissement") || lowerQuestion.includes("vomir") || lowerQuestion.includes("nausée")) {
    return symptomResponses.vomissements;
  }
  
  // Recherche de mots-clés
  if (lowerQuestion.includes("nutrition") || lowerQuestion.includes("aliment") || lowerQuestion.includes("manger")) {
    return chatbotResponses.nutrition;
  }
  
  if (lowerQuestion.includes("signe") || lowerQuestion.includes("alerte") || lowerQuestion.includes("danger")) {
    return chatbotResponses.signes;
  }
  
  if (lowerQuestion.includes("consult") || lowerQuestion.includes("médecin") || lowerQuestion.includes("docteur")) {
    return chatbotResponses.consultation;
  }
  
  if (lowerQuestion.includes("exercice") || lowerQuestion.includes("sport") || lowerQuestion.includes("activité")) {
    return chatbotResponses.exercices;
  }
  
  // Réponse par défaut
  return "Merci pour votre question. Pour des informations plus spécifiques, je vous recommande de consulter votre professionnel de santé. Vous pouvez également consulter la page 'Conseils' pour plus d'informations sur la nutrition et les signes d'alerte.";
}

function sendMessage() {
  const question = chatbotInput.value.trim();
  if (!question) return;
  
  // Ajouter le message de l'utilisateur
  addMessage(question, false);
  chatbotInput.value = "";
  
  // Simuler un délai de réponse
  setTimeout(() => {
    const response = getBotResponse(question);
    addMessage(response, true);
  }, 500);
}

// Événements
if (chatbotSendBtn) {
  chatbotSendBtn.addEventListener("click", sendMessage);
}

if (chatbotInput) {
  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

// Gestion du bouton "Je ressens un symptôme"
const symptomBtn = document.querySelector("#symptom-btn");
const symptomsList = document.querySelector("#symptoms-list");
const symptomItemBtns = document.querySelectorAll(".symptom-item-btn");
const suggestionsList = document.querySelector(".suggestions-list");

if (symptomBtn) {
  symptomBtn.addEventListener("click", () => {
    // Afficher/masquer la liste des symptômes
    if (symptomsList) {
      symptomsList.classList.toggle("hidden");
      
      // Si on affiche la liste, masquer les autres suggestions
      if (suggestionsList) {
        suggestionsList.style.display = symptomsList.classList.contains("hidden") ? "flex" : "none";
      }
    }
  });
}

// Gestion des boutons de symptômes
symptomItemBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const symptom = btn.getAttribute("data-symptom");
    const symptomText = btn.textContent.trim();
    
    // Ajouter le message de l'utilisateur
    addMessage(symptomText, false);
    
    // Masquer la liste des symptômes
    if (symptomsList) {
      symptomsList.classList.add("hidden");
    }
    
    // Réafficher les suggestions
    if (suggestionsList) {
      suggestionsList.style.display = "flex";
    }
    
    // Simuler un délai de réponse
    setTimeout(() => {
      const response = symptomResponses[symptom] || "🚨 Signe d'alerte. Veuillez consulter immédiatement.";
      addMessage(response, true);
    }, 500);
  });
  
  // Effet hover
  btn.addEventListener("mouseenter", () => {
    btn.style.background = "#fee2e2";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "white";
  });
});

// Suggestions
suggestionBtns.forEach(btn => {
  // Ignorer le bouton symptôme qui a son propre gestionnaire
  if (btn.id === "symptom-btn") return;
  
  btn.addEventListener("click", () => {
    const question = btn.getAttribute("data-question");
    if (question) {
      chatbotInput.value = question;
      sendMessage();
    }
  });
});

