function getToken() {
  return localStorage.getItem("token");
}

function redirectToLogin() {
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  redirectToLogin();
}

function createHistoryCard(item) {
  return `
    <div class="col-12">
      <div class="history-card shadow-sm">
        <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
          <h2 class="h5 mb-0">${item.subject}</h2>
          <small class="text-secondary">${new Date(item.createdAt).toLocaleString()}</small>
        </div>
        <p><strong>Question:</strong> ${item.question}</p>
        <p class="mb-0"><strong>Answer:</strong>\n${item.answer}</p>
      </div>
    </div>
  `;
}

async function loadHistory() {
  const token = getToken();
  const historyList = document.getElementById("historyList");

  if (!token) {
    redirectToLogin();
    return;
  }

  historyList.innerHTML = `
    <div class="col-12">
      <div class="alert alert-info">Loading history...</div>
    </div>
  `;

  try {
    const response = await fetch(`${API_BASE_URL}/study/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      historyList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">${result.message || "Could not load history."}</div>
        </div>
      `;
      return;
    }

    if (!result.data.length) {
      historyList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-secondary">No history found yet. Ask your first study question.</div>
        </div>
      `;
      return;
    }

    historyList.innerHTML = result.data.map(createHistoryCard).join("");
  } catch (error) {
    historyList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">Cannot connect to the backend server.</div>
      </div>
    `;
  }
}

loadHistory();

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
