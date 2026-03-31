function showAlert(message, type = "danger") {
  const alertBox = document.getElementById("alertBox");
  if (!alertBox) return;

  alertBox.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}

function saveAuthData(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
}

async function handleAuthSubmit(event, endpoint) {
  event.preventDefault();

  const payload =
    endpoint === "signup"
      ? {
          name: document.getElementById("name").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value.trim()
        }
      : {
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value.trim()
        };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await parseJsonResponse(response);

    if (!response.ok) {
      showAlert(result.message || "Authentication failed.");
      return;
    }

    saveAuthData(result);
    window.location.href = "dashboard.html";
  } catch (error) {
    showAlert("Cannot connect to the server. Please try again.");
  }
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (event) => handleAuthSubmit(event, "signup"));
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (event) => handleAuthSubmit(event, "login"));
}
