const tabBtns = document.querySelectorAll(".tab-btn-enhanced, .tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Fonction pour changer d'onglet
function switchTab(btn) {
  const targetTab = btn.getAttribute("data-tab");
  
  // Désactiver tous les onglets
  tabBtns.forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
    b.setAttribute("tabindex", "-1");
  });
  tabContents.forEach(c => {
    c.classList.remove("active");
    c.setAttribute("aria-hidden", "true");
  });
  
  // Activer l'onglet sélectionné
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");
  btn.setAttribute("tabindex", "0");
  btn.focus();
  
  const targetContent = document.querySelector(`#${targetTab}-tab`);
  if (targetContent) {
    targetContent.classList.add("active");
    targetContent.setAttribute("aria-hidden", "false");
    
    // Scroll vers le haut de la section
    targetContent.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Gestion des onglets au clic
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn));
  
  // Navigation au clavier
  btn.addEventListener("keydown", (e) => {
    const tabs = Array.from(tabBtns);
    const currentIndex = tabs.indexOf(btn);
    
    if (e.key === "ArrowLeft" && currentIndex > 0) {
      e.preventDefault();
      switchTab(tabs[currentIndex - 1]);
    } else if (e.key === "ArrowRight" && currentIndex < tabs.length - 1) {
      e.preventDefault();
      switchTab(tabs[currentIndex + 1]);
    } else if (e.key === "Home") {
      e.preventDefault();
      switchTab(tabs[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      switchTab(tabs[tabs.length - 1]);
    }
  });
});

// Gestion des FAQ (expand/collapse)
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        // Fermer tous les autres
        faqItems.forEach(i => i.classList.remove("active"));
        // Ouvrir celui-ci si il n'était pas actif
        if (!isActive) {
          item.classList.add("active");
        }
      });
    }
  });
});

