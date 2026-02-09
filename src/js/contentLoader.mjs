// Load content dynamically
import { initLoginForm } from './login.js';
import { initDashboard } from './member-dashboard.mjs';
import { initRegisterForm } from './register.mjs';

export async function loadContent(page) {
  try {
    // Map page names to file names
    const pageFileMap = {
      'home': 'home-content',
      'login': 'login-content',
      'member-dashboard': 'member-dashboard-content',
      'register': 'register'
    };

    const contentPath = `/partials/${pageFileMap[page] || page + '-content'}.html`;
    const response = await fetch(contentPath);
    const content = await response.text();

    const contentContainer = document.querySelector('#main-content');
    if (contentContainer) {
      contentContainer.innerHTML = content;

      // Initialize page-specific functionality
      switch (page) {
        case 'login':
          initLoginForm();
          break;
        case 'member-dashboard':
          initDashboard();
          break;
        case 'register':
          initRegisterForm();
          break;
        case 'home':
          // Home page doesn't need special initialization
          break;
        // Add more pages as needed
        default:
          // Add more pages as needed
          break;
      }
    } else {
      console.error('Content container not found!');
    }
  } catch (err) {
    console.error('Error loading content:', err);
  }
}
