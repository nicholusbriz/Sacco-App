/**
 * Load header and footer templates into DOM
 * Partials are always in /partials/ folder (served from public)
 */
import { handleRouting } from './router.mjs';
import { loadContent } from './contentLoader.mjs';

export async function loadHeaderFooter() {
  try {
    // Use root paths since public files are served at root
    const headerPath = '/partials/header.html';
    const footerPath = '/partials/footer.html';

    // Fetch both partials in parallel
    const [header, footer] = await Promise.all([
      fetch(headerPath).then(res => res.text()),
      fetch(footerPath).then(res => res.text())
    ]);

    // Inject directly into DOM
    const headerEl = document.querySelector('#main-header');
    const footerEl = document.querySelector('#main-footer');

    if (headerEl) headerEl.innerHTML = header;
    if (footerEl) footerEl.innerHTML = footer;

    // Update header based on login status
    updateHeaderAuth();
  } catch (err) {
    console.error('Error loading header/footer:', err);
  }
}

// Get current user from LocalStorage
export function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Check if user is logged in
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Centralized logout function
export async function logout() {
  // Remove user session from LocalStorage
  localStorage.removeItem('currentUser');
  localStorage.removeItem('loginTime');

  // Update header immediately
  updateHeaderAuth();

  // Redirect to home page
  window.history.pushState({}, '', '/');

  // Use imported router/content loader
  const page = handleRouting();
  loadContent(page);
}

// Update header authentication state
export async function updateHeaderAuth() {
  const user = getCurrentUser();
  const loggedOutItem = document.querySelector('.nav-item-logged-out');
  const loggedInItem = document.querySelector('.nav-item-logged-in');
  const userNameEl = document.getElementById('headerUserName');

  if (user) {
    // User is logged in
    if (loggedOutItem) loggedOutItem.style.display = 'none';
    if (loggedInItem) loggedInItem.style.display = 'flex';
    if (userNameEl) userNameEl.textContent = user.name;
  } else {
    // User is not logged in
    if (loggedOutItem) loggedOutItem.style.display = 'block';
    if (loggedInItem) loggedInItem.style.display = 'none';
    if (userNameEl) userNameEl.textContent = 'User';
  }
}

// Handle navigation clicks
export function handleNavigation(e) {
  if (e.target.tagName === 'A') {
    const href = e.target.getAttribute('href');

    // Handle internal navigation
    if (href && href.startsWith('/')) {
      e.preventDefault();

      // Update URL and load content
      window.history.pushState({}, '', href);
      const page = handleRouting();
      loadContent(page);
    }
  }
}

// Global logout handler for backward compatibility
window.handleLogout = logout;
