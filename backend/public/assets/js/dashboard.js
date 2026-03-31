const RESOURCE_STORAGE_KEY = "studyResources";

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function redirectToLogin() {
  window.location.href = "login.html";
}

function showAlert(message, type = "danger") {
  const alertBox = document.getElementById("alertBox");
  if (!alertBox) return;

  alertBox.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}

function getStoredResources() {
  const raw = localStorage.getItem(RESOURCE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveResources(resources) {
  localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(resources));
}

let resources = getStoredResources();

function normalizeValue(value) {
  return value.trim().replace(/\s+/g, " ");
}

function setupPage() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    redirectToLogin();
    return;
  }

  const studentName = document.getElementById("studentName");
  if (studentName) {
    studentName.textContent = user.name;
  }
}

function switchPanel(panelId) {
  document.querySelectorAll(".dashboard-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });

  document.querySelectorAll(".quick-nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.panelTarget === panelId);
  });
}

function getResourceTypeLabel(type) {
  const labels = {
    youtube: "YouTube",
    pdf: "PDF",
    image: "Image",
    link: "Link",
    notes: "Notes"
  };

  return labels[type] || "Resource";
}

function getResourceTypeEmoji(type) {
  const icons = {
    youtube: "YT",
    pdf: "PDF",
    image: "IMG",
    link: "WEB",
    notes: "NOTE"
  };

  return icons[type] || "DOC";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getYouTubeEmbedUrl(url) {
  if (!url) return "";

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/i,
    /(?:youtu\.be\/)([^?&]+)/i,
    /(?:youtube\.com\/embed\/)([^?&]+)/i
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return "";
}

function getFileKind(url) {
  if (!url) return "";

  const lowerUrl = url.toLowerCase();
  if (/\.(pdf)(\?|#|$)/.test(lowerUrl)) return "pdf";
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(lowerUrl)) return "image";
  return "";
}

function buildResourcePreview(resource) {
  const safeTitle = escapeHtml(resource.title);

  if (resource.type === "youtube") {
    const embedUrl = getYouTubeEmbedUrl(resource.url);
    if (embedUrl) {
      return `
        <div class="resource-preview media-frame">
          <iframe
            src="${embedUrl}"
            title="${safeTitle}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
  }

  const fileKind = resource.type === "link" ? getFileKind(resource.url) : getFileKind(resource.url);

  if (fileKind === "pdf") {
    return `
      <div class="resource-preview resource-preview-note">
        <strong>PDF detected.</strong>
        <span>Use the quick action below to open the PDF directly.</span>
      </div>
    `;
  }

  if (fileKind === "image") {
    return `
      <div class="resource-preview image-frame">
        <img src="${resource.url}" alt="${safeTitle}" loading="lazy" />
      </div>
    `;
  }

  return "";
}

function buildResourceLinkActions(resource) {
  if (!resource.url) {
    return "";
  }

  const actions = [
    `<a class="btn btn-sm btn-primary" href="${resource.url}" target="_blank" rel="noopener noreferrer">Open resource</a>`
  ];

  if (resource.type === "link") {
    const fileKind = getFileKind(resource.url);

    if (fileKind === "pdf") {
      actions.push(
        `<a class="btn btn-sm btn-outline-secondary" href="${resource.url}" target="_blank" rel="noopener noreferrer">Go to PDF</a>`
      );
    }

    if (fileKind === "image") {
      actions.push(
        `<a class="btn btn-sm btn-outline-secondary" href="${resource.url}" target="_blank" rel="noopener noreferrer">Go to Photo</a>`
      );
    }
  }

  return actions.join("");
}

function updateStats() {
  const subjects = new Set(resources.map((resource) => resource.category));
  const subcategories = new Set(
    resources.map((resource) => `${resource.category}::${resource.subcategory}`)
  );

  document.getElementById("subjectCount").textContent = subjects.size;
  document.getElementById("subcategoryCount").textContent = subcategories.size;
  document.getElementById("resourceCount").textContent = resources.length;
}

function populateCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selected = categoryFilter.value || "all";
  const categories = [...new Set(resources.map((resource) => resource.category))].sort();

  categoryFilter.innerHTML = '<option value="all">All subjects</option>';
  categories.forEach((category) => {
    categoryFilter.insertAdjacentHTML(
      "beforeend",
      `<option value="${category}">${category}</option>`
    );
  });

  categoryFilter.value = categories.includes(selected) ? selected : "all";
}

function populateSubcategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");
  const subcategoryFilter = document.getElementById("subcategoryFilter");
  const selectedCategory = categoryFilter.value;
  const previousValue = subcategoryFilter.value || "all";

  const filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter((resource) => resource.category === selectedCategory);

  const subcategories = [...new Set(filteredResources.map((resource) => resource.subcategory))].sort();

  subcategoryFilter.innerHTML = '<option value="all">All subcategories</option>';
  subcategories.forEach((subcategory) => {
    subcategoryFilter.insertAdjacentHTML(
      "beforeend",
      `<option value="${subcategory}">${subcategory}</option>`
    );
  });

  subcategoryFilter.value = subcategories.includes(previousValue) ? previousValue : "all";
}

function populateResourcePromptSelect() {
  const select = document.getElementById("resourcePromptSelect");
  const previous = select.value;

  select.innerHTML = '<option value="">No saved resource selected</option>';
  resources.forEach((resource) => {
    select.insertAdjacentHTML(
      "beforeend",
      `<option value="${resource.id}">${resource.category} / ${resource.subcategory} / ${resource.title}</option>`
    );
  });

  if (resources.some((resource) => resource.id === previous)) {
    select.value = previous;
  }
}

function buildResourceCard(resource) {
  const linkActions = buildResourceLinkActions(resource);
  const preview = buildResourcePreview(resource);
  const actionButton = linkActions
    ? linkActions
    : `<button class="btn btn-sm btn-outline-secondary" type="button" disabled>No external link</button>`;

  return `
    <article class="resource-card">
      <div class="resource-card-top">
        <div class="resource-badge">${getResourceTypeEmoji(resource.type)}</div>
        <div>
          <p class="resource-meta mb-1">${resource.category} / ${resource.subcategory}</p>
          <h3 class="resource-title">${resource.title}</h3>
        </div>
      </div>
      <div class="resource-tags">
        <span class="resource-chip">${getResourceTypeLabel(resource.type)}</span>
        <span class="resource-chip muted">${new Date(resource.createdAt).toLocaleDateString()}</span>
      </div>
      <p class="resource-description">
        ${resource.description || "No note added yet. Use this card to keep the resource visible and searchable."}
      </p>
      ${preview}
      ${
        resource.url
          ? `<p class="resource-link"><a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.url}</a></p>`
          : ""
      }
      <div class="resource-actions">
        ${actionButton}
        <button class="btn btn-sm btn-outline-primary" type="button" data-study-resource="${resource.id}">
          Study with AI
        </button>
        <button class="btn btn-sm btn-outline-danger" type="button" data-delete-resource="${resource.id}">
          Delete
        </button>
      </div>
    </article>
  `;
}

function renderResources() {
  const grid = document.getElementById("resourceGrid");
  const category = document.getElementById("categoryFilter").value;
  const subcategory = document.getElementById("subcategoryFilter").value;

  let filtered = resources;

  if (category !== "all") {
    filtered = filtered.filter((resource) => resource.category === category);
  }

  if (subcategory !== "all") {
    filtered = filtered.filter((resource) => resource.subcategory === subcategory);
  }

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3 class="h5 fw-bold">No resources found</h3>
        <p class="mb-0 text-secondary">
          Save your first study resource or change the filters to see more cards.
        </p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(buildResourceCard).join("");
}

function refreshResourceUI() {
  updateStats();
  populateCategoryFilter();
  populateSubcategoryFilter();
  populateResourcePromptSelect();
  renderResources();
}

function buildQuestionFromResource(resource) {
  return [
    `I am studying ${resource.category}.`,
    `Current topic: ${resource.subcategory}.`,
    `Resource title: ${resource.title}.`,
    resource.description ? `Notes: ${resource.description}.` : "",
    resource.url ? `Resource link: ${resource.url}.` : "",
    "Explain this topic clearly for a beginner, highlight the key idea, and give revision points."
  ]
    .filter(Boolean)
    .join("\n");
}

function fillAiPromptFromResource(resourceId) {
  const resource = resources.find((item) => item.id === resourceId);
  if (!resource) return;

  document.getElementById("subject").value = resource.category;
  document.getElementById("question").value = buildQuestionFromResource(resource);
  document.getElementById("resourcePromptSelect").value = resource.id;
  switchPanel("aiPanel");
}

function handleResourceSubmit(event) {
  event.preventDefault();

  const category = normalizeValue(document.getElementById("resourceCategory").value);
  const subcategory = normalizeValue(document.getElementById("resourceSubcategory").value);
  const title = normalizeValue(document.getElementById("resourceTitle").value);
  const type = document.getElementById("resourceType").value;
  const url = normalizeValue(document.getElementById("resourceUrl").value);
  const description = normalizeValue(document.getElementById("resourceDescription").value);

  const resource = {
    id: `resource-${Date.now()}`,
    category,
    subcategory,
    title,
    type,
    url,
    description,
    createdAt: new Date().toISOString()
  };

  resources.unshift(resource);
  saveResources(resources);
  refreshResourceUI();
  document.getElementById("resourceForm").reset();
  showAlert("Resource saved successfully.", "success");
  switchPanel("resourcesPanel");
}

function handleResourceGridClick(event) {
  const studyButton = event.target.closest("[data-study-resource]");
  if (studyButton) {
    fillAiPromptFromResource(studyButton.dataset.studyResource);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-resource]");
  if (deleteButton) {
    resources = resources.filter((resource) => resource.id !== deleteButton.dataset.deleteResource);
    saveResources(resources);
    refreshResourceUI();
    showAlert("Resource deleted.", "success");
  }
}

function handleDraftToAi() {
  const category = normalizeValue(document.getElementById("resourceCategory").value);
  const subcategory = normalizeValue(document.getElementById("resourceSubcategory").value);
  const title = normalizeValue(document.getElementById("resourceTitle").value);
  const type = document.getElementById("resourceType").value;
  const url = normalizeValue(document.getElementById("resourceUrl").value);
  const description = normalizeValue(document.getElementById("resourceDescription").value);

  document.getElementById("subject").value = category;
  document.getElementById("question").value = [
    `Subject: ${category || "General studies"}`,
    `Subcategory: ${subcategory || "Not specified"}`,
    `Resource title: ${title || "Untitled resource"}`,
    `Resource type: ${getResourceTypeLabel(type)}`,
    url ? `Resource link: ${url}` : "",
    description ? `Notes: ${description}` : "",
    "Teach me this topic in a simple way and tell me how to study it efficiently."
  ]
    .filter(Boolean)
    .join("\n");

  switchPanel("aiPanel");
}

async function submitQuestion(event) {
  event.preventDefault();

  const question = document.getElementById("question").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const answerBox = document.getElementById("answerBox");

  answerBox.textContent = "Generating explanation...";

  try {
    const response = await fetch(`${API_BASE_URL}/study/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ question, subject })
    });

    const result = await response.json();

    if (!response.ok) {
      answerBox.textContent = "Your AI-generated explanation will appear here after you submit a question.";
      showAlert(result.message || "Could not generate an explanation.");
      return;
    }

    answerBox.textContent = result.data.answer;
    showAlert("Answer generated and saved successfully.", "success");
  } catch (error) {
    answerBox.textContent = "Your AI-generated explanation will appear here after you submit a question.";
    showAlert("Cannot connect to the backend server.");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  redirectToLogin();
}

setupPage();
refreshResourceUI();

document.querySelectorAll(".quick-nav-btn").forEach((button) => {
  button.addEventListener("click", () => switchPanel(button.dataset.panelTarget));
});

document.getElementById("resourceForm").addEventListener("submit", handleResourceSubmit);
document.getElementById("resourceGrid").addEventListener("click", handleResourceGridClick);
document.getElementById("fillAiFromDraftBtn").addEventListener("click", handleDraftToAi);
document.getElementById("questionForm").addEventListener("submit", submitQuestion);
document.getElementById("categoryFilter").addEventListener("change", () => {
  populateSubcategoryFilter();
  renderResources();
});
document.getElementById("subcategoryFilter").addEventListener("change", renderResources);
document.getElementById("clearFiltersBtn").addEventListener("click", () => {
  document.getElementById("categoryFilter").value = "all";
  populateSubcategoryFilter();
  renderResources();
});
document.getElementById("loadResourcePromptBtn").addEventListener("click", () => {
  const resourceId = document.getElementById("resourcePromptSelect").value;
  if (!resourceId) {
    showAlert("Select a saved resource first.");
    return;
  }

  fillAiPromptFromResource(resourceId);
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
