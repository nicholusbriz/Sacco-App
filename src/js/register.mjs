// Registration functionality
import SACCOAPI from './sacco-api.mjs';
import { handleRouting } from './router.mjs';
import { loadContent } from './contentLoader.mjs';

export function initRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordInput = document.getElementById('password');
  const registerBtn = document.getElementById('registerBtn');

  // Password toggle functionality
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);

      // Update eye icon
      const eyeIcon = passwordToggle.querySelector('.eye-icon');
      eyeIcon.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
  }

  // Form submission
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  // Real-time validation
  addRealTimeValidation();
}

// Handle registration form submission
async function handleRegisterSubmit(e) {
  e.preventDefault();

  const registerBtn = document.getElementById('registerBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const registerForm = document.getElementById('registerForm');

  // Validate form
  if (!validateForm()) {
    return;
  }

  // Get form data
  const formData = getFormData();

  try {
    // Show loading state
    showLoadingState();

    // Check if member ID already exists in LocalStorage
    const existingMembers = getRegisteredMembers();
    const memberExists = existingMembers.some(member => member.memberId === formData.memberId);

    if (memberExists) {
      throw new Error('Member ID already exists. Please choose a different Member ID.');
    }

    // Create new member object
    const newMember = createMemberObject(formData);

    // Save to LocalStorage first
    await saveToLocalStorage(newMember);

    // Then save to members.json (simulated)
    await saveToMembersJson(newMember);

    // Show success message
    showSuccessMessage();

    // Redirect to member dashboard after delay
    setTimeout(() => {
      window.history.pushState({}, '', '/member-dashboard');
      const page = handleRouting();
      loadContent(page);
    }, 3000);

  } catch (error) {
    console.error('Registration error:', error);
    showErrorMessage(error.message);
  } finally {
    // Hide loading state
    hideLoadingState();
  }
}

// Get form data
function getFormData() {
  const form = document.getElementById('registerForm');
  const formData = new FormData(form);

  return {
    memberId: formData.get('memberId'),
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    balance: parseFloat(formData.get('balance')),
    currency: formData.get('currency'),
    terms: formData.get('terms') === 'on'
  };
}

// Create member object
function createMemberObject(formData) {
  const currentDate = new Date().toISOString();

  return {
    memberId: formData.memberId,
    name: formData.name,
    email: formData.email,
    password: formData.password, // No hashing as requested
    balance: formData.balance,
    currency: formData.currency,
    createdAt: currentDate
  };
}

// Generate account number
function generateAccountNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `SACCO${timestamp}${random}`;
}

// Get membership level based on deposit
function getMembershipLevel(deposit) {
  if (deposit >= 1000000) return 'platinum';
  if (deposit >= 500000) return 'gold';
  if (deposit >= 100000) return 'silver';
  return 'bronze';
}

// Save to LocalStorage
async function saveToLocalStorage(member) {
  try {
    // Get existing members from LocalStorage or initialize empty array
    const existingMembers = JSON.parse(localStorage.getItem('registeredMembers') || '[]');

    // Add new member
    existingMembers.push(member);

    // Save back to LocalStorage
    localStorage.setItem('registeredMembers', JSON.stringify(existingMembers));

    // Also save current registration for immediate use
    localStorage.setItem('currentRegistration', JSON.stringify(member));

    console.log('Member saved to LocalStorage:', member);
  } catch (error) {
    console.error('Error saving to LocalStorage:', error);
    throw error;
  }
}

// Save to members.json (simulated)
async function saveToMembersJson(member) {
  try {
    // In a real application, this would make an API call to save to the server
    // For now, we'll simulate this by adding to LocalStorage with a different key

    const serverMembers = JSON.parse(localStorage.getItem('serverMembers') || '[]');
    serverMembers.push(member);
    localStorage.setItem('serverMembers', JSON.stringify(serverMembers));

    console.log('Member saved to simulated server:', member);
  } catch (error) {
    console.error('Error saving to members.json:', error);
    throw error;
  }
}

// Validate form
function validateForm() {
  const formData = getFormData();
  let isValid = true;

  // Reset previous error states
  clearValidationErrors();

  // Validate required fields
  if (!formData.name || formData.name.trim().length < 2) {
    showFieldError('name', 'Full name must be at least 2 characters');
    isValid = false;
  }

  if (!SACCOAPI.validateEmail(formData.email)) {
    showFieldError('email', 'Please enter a valid email address');
    isValid = false;
  }

  if (!formData.memberId || formData.memberId.length < 3) {
    showFieldError('memberId', 'Member ID must be at least 3 characters');
    isValid = false;
  }

  if (!formData.password || formData.password.length < 6) {
    showFieldError('password', 'Password must be at least 6 characters');
    isValid = false;
  }

  if (!formData.balance || formData.balance < 10000) {
    showFieldError('balance', 'Minimum deposit is 10,000 UGX');
    isValid = false;
  }

  if (!formData.currency) {
    showFieldError('currency', 'Please select a currency');
    isValid = false;
  }

  if (!formData.terms) {
    alert('You must agree to the terms and conditions');
    isValid = false;
  }

  return isValid;
}

// Show field error
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const formGroup = field.closest('.form-group');

  formGroup.classList.add('error');

  // Create or update error message
  let errorText = formGroup.querySelector('.error-text');
  if (!errorText) {
    errorText = document.createElement('div');
    errorText.className = 'error-text';
    formGroup.appendChild(errorText);
  }
  errorText.textContent = message;
}

// Clear validation errors
function clearValidationErrors() {
  const errorGroups = document.querySelectorAll('.form-group.error');
  errorGroups.forEach(group => {
    group.classList.remove('error');
    const errorText = group.querySelector('.error-text');
    if (errorText) {
      errorText.remove();
    }
  });
}

// Check password strength
function checkPasswordStrength(password) {
  const strengthBar = document.querySelector('.password-strength-bar');
  const strengthText = document.querySelector('.password-strength-text');

  if (!strengthBar || !strengthText) return;

  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^a-zA-Z0-9]/)) strength++;

  // Remove all strength classes
  strengthBar.className = 'password-strength-bar';

  if (password.length === 0) {
    strengthBar.style.width = '0%';
    strengthText.textContent = '';
  } else if (strength <= 1) {
    strengthBar.classList.add('password-strength-weak');
    strengthText.textContent = 'Weak password';
    strengthText.style.color = '#e74c3c';
  } else if (strength === 2) {
    strengthBar.classList.add('password-strength-medium');
    strengthText.textContent = 'Medium password';
    strengthText.style.color = '#f39c12';
  } else {
    strengthBar.classList.add('password-strength-strong');
    strengthText.textContent = 'Strong password';
    strengthText.style.color = '#27ae60';
  }
}

// Validate password match
function validatePasswordMatch() {
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const confirmGroup = document.getElementById('confirmPassword').closest('.form-group');

  if (confirmPassword && password !== confirmPassword) {
    confirmGroup.classList.add('error');
    showFieldError('confirmPassword', 'Passwords do not match');
  } else {
    confirmGroup.classList.remove('error');
    const errorText = confirmGroup.querySelector('.error-text');
    if (errorText) {
      errorText.remove();
    }
  }
}

// Add real-time validation
function addRealTimeValidation() {
  const fields = ['name', 'email', 'memberId', 'password', 'balance', 'currency'];

  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', function () {
        validateSingleField(fieldId);
      });

      field.addEventListener('input', function () {
        const formGroup = field.closest('.form-group');
        if (formGroup.classList.contains('error')) {
          validateSingleField(fieldId);
        }
      });
    }
  });
}

// Validate single field
function validateSingleField(fieldId) {
  const field = document.getElementById(fieldId);
  const formGroup = field.closest('.form-group');
  const formData = getFormData();

  // Clear previous error
  formGroup.classList.remove('error');
  const errorText = formGroup.querySelector('.error-text');
  if (errorText) {
    errorText.remove();
  }

  let isValid = true;
  let errorMessage = '';

  switch (fieldId) {
    case 'name':
      if (!formData.name || formData.name.trim().length < 2) {
        errorMessage = 'Full name must be at least 2 characters';
        isValid = false;
      }
      break;
    case 'email':
      if (!SACCOAPI.validateEmail(formData.email)) {
        errorMessage = 'Please enter a valid email address';
        isValid = false;
      }
      break;
    case 'memberId':
      if (!formData.memberId || formData.memberId.length < 3) {
        errorMessage = 'Member ID must be at least 3 characters';
        isValid = false;
      }
      break;
    case 'password':
      if (!formData.password || formData.password.length < 6) {
        errorMessage = 'Password must be at least 6 characters';
        isValid = false;
      }
      break;
    case 'balance':
      if (!formData.balance || formData.balance < 10000) {
        errorMessage = 'Minimum deposit is 10,000 UGX';
        isValid = false;
      }
      break;
    case 'currency':
      if (!formData.currency) {
        errorMessage = 'Please select a currency';
        isValid = false;
      }
      break;
  }

  if (!isValid) {
    showFieldError(fieldId, errorMessage);
  } else {
    formGroup.classList.add('success');
    setTimeout(() => {
      formGroup.classList.remove('success');
    }, 2000);
  }

  return isValid;
}

// Show loading state
function showLoadingState() {
  const registerForm = document.getElementById('registerForm');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const registerBtn = document.getElementById('registerBtn');

  if (registerForm) registerForm.style.display = 'none';
  if (loadingSpinner) loadingSpinner.style.display = 'block';
  if (registerBtn) registerBtn.disabled = true;
}

// Hide loading state
function hideLoadingState() {
  const registerForm = document.getElementById('registerForm');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const registerBtn = document.getElementById('registerBtn');

  if (registerForm) registerForm.style.display = 'block';
  if (loadingSpinner) loadingSpinner.style.display = 'none';
  if (registerBtn) registerBtn.disabled = false;
}

// Show success message
function showSuccessMessage() {
  const registerForm = document.getElementById('registerForm');
  const successMessage = document.getElementById('successMessage');

  if (registerForm) registerForm.style.display = 'none';
  if (successMessage) successMessage.style.display = 'block';
}

// Show error message
function showErrorMessage(message) {
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');

  if (registerForm) registerForm.style.display = 'none';
  if (errorMessage) errorMessage.style.display = 'block';
  if (errorText) errorText.textContent = message;
}

// Get registered members from LocalStorage
export function getRegisteredMembers() {
  try {
    return JSON.parse(localStorage.getItem('registeredMembers') || '[]');
  } catch (error) {
    console.error('Error getting registered members:', error);
    return [];
  }
}

// Check if member exists in LocalStorage
export function checkMemberExists(memberId) {
  const members = getRegisteredMembers();
  return members.some(member => member.memberId === memberId);
}

// Sync LocalStorage with members.json
export async function syncWithMembersJson() {
  try {
    // Get members from LocalStorage
    const localMembers = getRegisteredMembers();

    // Get existing members from JSON
    const response = await fetch('/json/members.json');
    const existingMembers = await response.json();

    // Merge arrays (avoiding duplicates)
    const mergedMembers = [...existingMembers.members];

    localMembers.forEach(localMember => {
      const exists = mergedMembers.some(existing => existing.memberId === localMember.memberId);
      if (!exists) {
        mergedMembers.push(localMember);
      }
    });

    // Save merged array back to LocalStorage (simulating server update)
    localStorage.setItem('registeredMembers', JSON.stringify(mergedMembers));

    console.log('Synced members:', mergedMembers);
    return mergedMembers;
  } catch (error) {
    console.error('Error syncing with members.json:', error);
    return [];
  }
}
