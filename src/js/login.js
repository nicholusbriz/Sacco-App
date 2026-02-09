// Login functionality
import SACCOAPI from './sacco-api.mjs';
import { handleRouting } from './router.mjs';
import { loadContent } from './contentLoader.mjs';
import { updateHeaderAuth } from './utility.mjs';

export function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.querySelector('.toggle-icon');

  // Password toggle functionality
  if (passwordToggle && passwordInput && toggleIcon) {
    passwordToggle.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);

      // Update icon
      if (type === 'text') {
        toggleIcon.textContent = '🙈'; // Hide password icon
      } else {
        toggleIcon.textContent = '👁️'; // Show password icon
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  const memberId = document.getElementById('memberId').value;
  const password = document.getElementById('password').value;

  if (memberId && password) {
    try {
      // Check if user exists
      const result = await SACCOAPI.authenticateUser(memberId, password);

      if (result.success) {
        // Store user session in LocalStorage
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        localStorage.setItem('loginTime', new Date().toISOString());

        // Update header to show logged-in state
        updateHeaderAuth();

        // Redirect based on user role
        if (result.user.role === 'member') {
          // Member goes to member dashboard
          window.history.pushState({}, '', '/member-dashboard');
        } else if (result.user.role === 'admin') {
          // Admin also goes to member dashboard (simplified)
          window.history.pushState({}, '', '/member-dashboard');
        } else {
          // Default to member dashboard
          window.history.pushState({}, '', '/member-dashboard');
        }

        // Force router to recognize new URL
        setTimeout(() => {
          const page = handleRouting();
          loadContent(page);
        }, 100);
      } else if (result.error === 'User not found') {
        // User doesn't exist - redirect to registration
        alert('User not found. Please register your account first.');
        window.history.pushState({}, '', '/register');
        const page = handleRouting();
        loadContent(page);
      } else {
        // User exists but wrong password
        alert(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  } else {
    alert('Please fill in all fields');
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
