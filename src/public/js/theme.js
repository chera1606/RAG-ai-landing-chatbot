// public/js/theme.js

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const htmlElement = document.documentElement;

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        htmlElement.classList.add("dark");
    } else {
        htmlElement.classList.remove("dark");
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            htmlElement.classList.toggle("dark");
            const isDark = htmlElement.classList.contains("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }
});
