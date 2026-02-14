// public/js/main.js

document.addEventListener("DOMContentLoaded", () => {
  checkAuthState();
  setupLogout();
});

/**
 * Checks if the user is authenticated and redirects based on the current page.
 * This runs on every page load.
 */
function checkAuthState() {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const path = window.location.pathname;

  // Define public routes (pages that don't require login)
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(path);

  // 1. If User is NOT logged in
  if (!token) {
    // If trying to access a protected page, redirect to login
    if (!isPublicRoute) {
      window.location.href = "/login";
    }
    // Update UI for logged-out state
    toggleNavLinks(false);
  }

  // 2. If User IS logged in
  else {
    // If trying to access Login/Register, redirect to landing
    if (isPublicRoute) {
      window.location.href = "/";
    }

    // Role-Based Authorization (REMOVED: Now all users can access dashboard)
    /*
    if (path === "/admin" && userRole !== "admin") {
      alert("Access Denied: You do not have admin privileges.");
      window.location.href = "/";
    }
    */

    // Update UI for logged-in state
    toggleNavLinks(true);
  }
}

/**
 * Toggles navigation links based on auth state
 */
function toggleNavLinks(isLoggedIn) {
  const loginLink = document.getElementById("nav-login");
  const registerLink = document.getElementById("nav-register");
  const logoutBtn = document.getElementById("nav-logout");
  const adminLink = document.getElementById("nav-admin");

  // Get stored role to decide if we show Admin link
  const role = localStorage.getItem("role");

  if (isLoggedIn) {
    if (loginLink) loginLink.classList.add("hidden");
    if (registerLink) registerLink.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");

    // Show Admin/Dashboard link for ALL logged-in users
    if (adminLink) {
      adminLink.classList.remove("hidden");
    }
  } else {
    if (loginLink) loginLink.classList.remove("hidden");
    if (registerLink) registerLink.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (adminLink) adminLink.classList.add("hidden");
  }
}

/**
 * Handles Logout Logic
 */
function setupLogout() {
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Clear Auth Data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      // Redirect to Login
      window.location.href = "/login";
    });
  }
}
