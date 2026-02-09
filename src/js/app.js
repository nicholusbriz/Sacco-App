// Load header and footer
import { loadHeaderFooter, handleNavigation } from './utility.mjs';

// Import utility modules
import { handleRouting } from './router.mjs';
import { loadContent } from './contentLoader.mjs';
import { initRegisterForm } from './register.mjs';

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  // Load header and footer
  loadHeaderFooter();

  // Handle initial routing
  const page = handleRouting();
  loadContent(page);

  // Initialize page-specific functionality
  if (page === 'register') {
    initRegisterForm();
  }

  // Handle navigation clicks
  document.addEventListener('click', handleNavigation);

  // Handle browser back/forward
  window.addEventListener('popstate', function () {
    const page = handleRouting();
    loadContent(page);
  });
});
