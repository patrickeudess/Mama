const API_BASE = "http://localhost:8000/api";

let selectedUserType = null;

// Fonction pour tester la connexion au serveur avec affichage visuel
async function testServerConnection(showStatus = true) {
  const serverStatus = document.querySelector("#server-status");
  const serverStatusText = document.querySelector("#server-status-text");
  const serverHelpBox = document.querySelector("#server-help-box");
  const registerSubmitBtn = document.querySelector("#register-submit-btn");
  
  if (showStatus && serverStatus) {
    serverStatus.classList.remove("hidden", "connected", "disconnected");
    serverStatus.classList.add("checking");
    if (serverStatusText) {
      serverStatusText.textContent = "Vérification du serveur...";
    }
  }
  
  let timeoutId;
  try {
    const healthUrl = `${API_BASE.replace('/api', '')}/health`;
    console.log("Test de connexion au serveur:", healthUrl);
    
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout de 3 secondes
    
    const response = await fetch(healthUrl, {
      method: "GET",
      mode: "cors",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log("✅ Serveur backend accessible");
      if (showStatus && serverStatus) {
        serverStatus.classList.remove("checking", "disconnected");
        serverStatus.classList.add("connected");
        if (serverStatusText) {
          serverStatusText.textContent = "✅ Serveur connecté";
        }
        if (serverHelpBox) {
          serverHelpBox.classList.add("hidden");
        }
        if (registerSubmitBtn) {
          registerSubmitBtn.disabled = false;
        }
      }
      return true;
    } else {
      console.error("❌ Serveur répond mais avec erreur:", response.status);
      if (showStatus && serverStatus) {
        serverStatus.classList.remove("checking", "connected");
        serverStatus.classList.add("disconnected");
        if (serverStatusText) {
          serverStatusText.textContent = "❌ Serveur inaccessible";
        }
        if (serverHelpBox) {
          serverHelpBox.classList.remove("hidden");
        }
        if (registerSubmitBtn) {
          registerSubmitBtn.disabled = true;
        }
      }
      return false;
    }
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    console.error("❌ Serveur backend non accessible:", error);
    console.error("Type d'erreur:", error.name);
    console.error("Message:", error.message);
    
    if (showStatus && serverStatus) {
      serverStatus.classList.remove("checking", "connected");
      serverStatus.classList.add("disconnected");
      if (serverStatusText) {
        if (error.name === "AbortError") {
          serverStatusText.textContent = "⏱️ Timeout - Le serveur ne répond pas";
        } else {
          serverStatusText.textContent = "❌ Serveur non accessible";
        }
      }
      if (serverHelpBox) {
        serverHelpBox.classList.remove("hidden");
      }
      if (registerSubmitBtn) {
        registerSubmitBtn.disabled = true;
      }
    }
    return false;
  }
}

// Attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", () => {
const patienteCard = document.querySelector("#patiente-card");
const professionnelCard = document.querySelector("#professionnel-card");
const loginSection = document.querySelector("#login-section");
const loginForm = document.querySelector("#login-form");
const loginTitle = document.querySelector("#login-title");
const errorMessage = document.querySelector("#error-message");
  const registerSection = document.querySelector("#register-section");
  const registerForm = document.querySelector("#register-form");
  const registerTitle = document.querySelector("#register-title");
  const registerErrorMessage = document.querySelector("#register-error-message");
  const registerSuccessMessage = document.querySelector("#register-success-message");
  const showRegisterBtn = document.querySelector("#show-register");
  const showLoginBtn = document.querySelector("#show-login");

  // Vérifier que les éléments existent
  if (!patienteCard || !professionnelCard || !loginSection || !loginForm || !registerSection || !registerForm) {
    console.error("Éléments HTML manquants");
    return;
  }

  // Fonction pour gérer la sélection patiente
  function selectPatiente() {
  selectedUserType = "patiente";
  patienteCard.classList.add("selected");
  professionnelCard.classList.remove("selected");
  showLoginSection("Patiente");
  }

  // Fonction pour gérer la sélection professionnel
  function selectProfessionnel() {
  selectedUserType = "professionnel";
  professionnelCard.classList.add("selected");
  patienteCard.classList.remove("selected");
  showLoginSection("Professionnel de santé");
  }

  // Mode accès direct : les cartes redirigent directement vers les interfaces
  // Le code ci-dessous est désactivé pour permettre l'accès direct
  // Si vous voulez réactiver les formulaires de connexion, décommentez ce code :
  
  /*
  // Sélection du type d'utilisateur - Patiente (clic)
  patienteCard.addEventListener("click", (e) => {
    e.preventDefault();
    selectPatiente();
  });

  // Support clavier pour patiente (Enter/Space)
  patienteCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectPatiente();
    }
  });

  // Sélection du type d'utilisateur - Professionnel (clic)
  professionnelCard.addEventListener("click", (e) => {
    e.preventDefault();
    selectProfessionnel();
  });

  // Support clavier pour professionnel (Enter/Space)
  professionnelCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectProfessionnel();
    }
  });
  */

function showLoginSection(userType) {
    if (loginTitle) {
  loginTitle.textContent = `Connexion - ${userType}`;
    }
    if (loginSection) {
  loginSection.classList.remove("hidden");
    }
    if (registerSection) {
      registerSection.classList.add("hidden");
    }
    if (errorMessage) {
  errorMessage.textContent = "";
    }
    // Scroll vers le formulaire de connexion
    loginSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function showRegisterSection(userType) {
    if (registerTitle) {
      registerTitle.textContent = `Créer un compte - ${userType}`;
    }
    if (registerSection) {
      registerSection.classList.remove("hidden");
    }
    if (loginSection) {
      loginSection.classList.add("hidden");
    }
    if (registerErrorMessage) {
      registerErrorMessage.textContent = "";
    }
    if (registerSuccessMessage) {
      registerSuccessMessage.textContent = "";
    }
    // Vérifier la connexion au serveur quand on affiche le formulaire
    testServerConnection(true);
    // Scroll vers le formulaire d'inscription
    registerSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Basculer entre connexion et inscription
  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (selectedUserType) {
        showRegisterSection(selectedUserType === "patiente" ? "Patiente" : "Professionnel de santé");
      } else {
        if (registerErrorMessage) {
          registerErrorMessage.textContent = "Veuillez d'abord sélectionner un type d'utilisateur";
        }
      }
    });
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (selectedUserType) {
        showLoginSection(selectedUserType === "patiente" ? "Patiente" : "Professionnel de santé");
      }
    });
}

// Gestion de la connexion
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
    if (errorMessage) {
  errorMessage.textContent = "";
    }

  const telephone = document.querySelector("#login-telephone").value.trim();
  const password = document.querySelector("#login-password").value.trim();

  if (!selectedUserType) {
      if (errorMessage) {
    errorMessage.textContent = "Veuillez sélectionner un type d'utilisateur";
      }
      return;
    }

    if (!telephone || !password) {
      if (errorMessage) {
        errorMessage.textContent = "Veuillez remplir tous les champs";
      }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telephone, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur de connexion");
    }

    const data = await response.json();
    localStorage.setItem("mama_token", data.access_token);

    // Récupérer les informations de l'utilisateur pour vérifier le rôle
    const userResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error("Impossible de récupérer les informations utilisateur");
    }

    const user = await userResponse.json();

    // Redirection selon le rôle
    if (user.role === "patiente") {
      window.location.href = "index-patriente.html";
    } else if (user.role === "professionnel" || user.role === "admin") {
      window.location.href = "index-professionnel.html";
    } else {
      throw new Error("Rôle non reconnu");
    }
  } catch (error) {
      if (errorMessage) {
    errorMessage.textContent = error.message || "Erreur de connexion";
  }
      console.error("Erreur de connexion:", error);
    }
  });

  // Gestion de l'inscription
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (registerErrorMessage) {
      registerErrorMessage.textContent = "";
    }
    if (registerSuccessMessage) {
      registerSuccessMessage.textContent = "";
    }

    if (!selectedUserType) {
      if (registerErrorMessage) {
        registerErrorMessage.textContent = "Veuillez sélectionner un type d'utilisateur";
      }
      return;
    }

    // Vérifier la connexion au serveur avant de continuer
    const serverAvailable = await testServerConnection(true);
    if (!serverAvailable) {
      // Le message est déjà affiché dans le statut du serveur
      // On ne montre pas de message d'erreur supplémentaire pour éviter la redondance
      return;
    }

    const prenom = document.querySelector("#register-prenom").value.trim();
    const nom = document.querySelector("#register-nom").value.trim();
    const telephone = document.querySelector("#register-telephone").value.trim();
    const email = document.querySelector("#register-email").value.trim();
    const password = document.querySelector("#register-password").value;
    const passwordConfirm = document.querySelector("#register-password-confirm").value;

    // Validation
    if (!telephone || !password) {
      if (registerErrorMessage) {
        registerErrorMessage.textContent = "Le téléphone et le mot de passe sont obligatoires";
      }
      return;
    }

    if (password.length < 6) {
      if (registerErrorMessage) {
        registerErrorMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères";
      }
      return;
    }

    if (password !== passwordConfirm) {
      if (registerErrorMessage) {
        registerErrorMessage.textContent = "Les mots de passe ne correspondent pas";
      }
      return;
    }

    try {
      // Créer le compte utilisateur
      // Convertir le rôle en format attendu par l'API
      const roleValue = selectedUserType === "patiente" ? "patiente" : "professionnel";
      
      const registerPayload = {
        telephone: telephone,
        password: password,
        role: roleValue,
        nom: nom || null,
        prenom: prenom || null,
        email: email || null,
      };
      
      // Nettoyer les valeurs null pour éviter les problèmes
      Object.keys(registerPayload).forEach(key => {
        if (registerPayload[key] === null || registerPayload[key] === "") {
          delete registerPayload[key];
        }
      });

      console.log("Tentative d'inscription avec:", { ...registerPayload, password: "***" });
      console.log("URL:", `${API_BASE}/auth/register`);

      const registerUrl = `${API_BASE}/auth/register`;
      console.log("Envoi de la requête à:", registerUrl);
      console.log("Payload:", JSON.stringify(registerPayload, null, 2));
      
      const response = await fetch(registerUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
        body: JSON.stringify(registerPayload),
      });

      console.log("Réponse reçue:", response.status, response.statusText);

      if (!response.ok) {
        let errorText = "Erreur lors de la création du compte";
        try {
          errorText = await response.text();
          // Essayer de parser comme JSON
          try {
            const errorJson = JSON.parse(errorText);
            errorText = errorJson.detail || errorJson.message || errorText;
          } catch (e) {
            // Ce n'est pas du JSON, garder le texte
          }
        } catch (e) {
          console.error("Erreur lors de la lecture de la réponse:", e);
        }
        throw new Error(errorText);
      }

      const user = await response.json();

      // Si c'est une patiente, créer aussi le profil Patiente
      if (selectedUserType === "patiente") {
        try {
          // Pour créer le profil patiente, on a besoin de plus d'informations
          // On va juste afficher un message de succès et rediriger vers la connexion
          if (registerSuccessMessage) {
            registerSuccessMessage.textContent = "Compte créé avec succès ! Vous pouvez maintenant vous connecter.";
          }
          
          // Attendre 2 secondes puis basculer vers la connexion
          setTimeout(() => {
            showLoginSection("Patiente");
            // Pré-remplir le téléphone
            const loginTelInput = document.querySelector("#login-telephone");
            if (loginTelInput) {
              loginTelInput.value = telephone;
            }
          }, 2000);
        } catch (error) {
          console.error("Erreur lors de la création du profil patiente:", error);
          // Le compte utilisateur est créé, on peut quand même se connecter
          if (registerSuccessMessage) {
            registerSuccessMessage.textContent = "Compte créé avec succès ! Vous pouvez vous connecter. Note: Le profil patiente devra être complété par un professionnel.";
          }
          setTimeout(() => {
            showLoginSection("Patiente");
            const loginTelInput = document.querySelector("#login-telephone");
            if (loginTelInput) {
              loginTelInput.value = telephone;
            }
          }, 2000);
        }
      } else {
        // Pour les professionnels, compte créé directement
        if (registerSuccessMessage) {
          registerSuccessMessage.textContent = "Compte créé avec succès ! Vous pouvez maintenant vous connecter.";
        }
        setTimeout(() => {
          showLoginSection("Professionnel de santé");
          const loginTelInput = document.querySelector("#login-telephone");
          if (loginTelInput) {
            loginTelInput.value = telephone;
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur d'inscription complète:", error);
      let errorMsg = "Erreur lors de la création du compte";
      
      if (error.message) {
        errorMsg = error.message;
      } else if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMsg = "Impossible de contacter le serveur. Vérifiez que le serveur backend est démarré sur http://localhost:8000";
      } else {
        errorMsg = error.toString();
      }
      
      if (registerErrorMessage) {
        registerErrorMessage.textContent = errorMsg;
      }
    }
  });
});
