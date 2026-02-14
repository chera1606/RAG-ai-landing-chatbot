document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const authNav = document.getElementById("auth-nav");
  const loginLink = document.getElementById("login-link");
  const signoutBtn = document.getElementById("signout-btn");

  // 1. Auth & Route Protection
  const path = window.location.pathname;
  const publicRoutes = ["/login", "/register", "/auth/login", "/auth/register"];
  const isPublicRoute = publicRoutes.some(r => path.startsWith(r));

  if (token) {
    // User is logged in
    if (authNav) authNav.classList.remove("hidden");
    if (loginLink) loginLink.classList.add("hidden");

    // Redirect to home if on login/register page
    if (path === "/login" || path === "/register") {
      window.location.href = "/";
    }
  } else {
    // User is NOT logged in
    if (authNav) authNav.classList.add("hidden");
    if (loginLink) loginLink.classList.remove("hidden");

    // Redirect to login if on protected page (including landing page)
    if (!isPublicRoute) {
      window.location.href = "/login";
    }
  }

  // Admin Check
  if (path === "/admin") {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "admin") {
      alert("Access Denied");
      window.location.href = "/";
    }
  }

  // 2. Login Logic
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/admin";
      } else {
        alert(data.error || "Login Failed");
      }
    };
  }

  // 3. Register Logic
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const userData = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/admin";
      } else {
        alert(data.error || "Registration Failed");
      }
    };
  }

  // 4. Sign Out
  if (signoutBtn) {
    signoutBtn.onclick = () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    };
  }
});
