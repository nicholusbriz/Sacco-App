// Dashboard controller
import { handleRouting } from './router.mjs';
import { loadContent } from './contentLoader.mjs';
import SACCOAPI from './sacco-api.mjs';
import { getCurrentUser, logout } from './utility.mjs';

export function initDashboard() {
  // Get current user from LocalStorage
  const user = getCurrentUser();

  if (user) {
    // Update dashboard with user data
    updateDashboardUI(user);

    // Add event listeners to dashboard buttons
    setupDashboardEventListeners();
  } else {
    // No user logged in, redirect to login
    window.history.pushState({}, '', '/login');
    const page = handleRouting();
    loadContent(page);
  }
}

// Setup dashboard event listeners
function setupDashboardEventListeners() {
  // Quick action buttons
  const depositBtn = document.getElementById('depositBtn');
  const withdrawalBtn = document.getElementById('withdrawalBtn');
  const transferBtn = document.getElementById('transferBtn');
  const loanBtn = document.getElementById('loanBtn');
  const billBtn = document.getElementById('billBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Add event listeners
  if (depositBtn) {
    depositBtn.addEventListener('click', () => {
      alert('Deposit feature coming soon!');
    });
  }

  if (withdrawalBtn) {
    withdrawalBtn.addEventListener('click', () => {
      alert('Withdrawal feature coming soon!');
    });
  }

  if (transferBtn) {
    transferBtn.addEventListener('click', () => {
      alert('Transfer feature coming soon!');
    });
  }

  if (loanBtn) {
    loanBtn.addEventListener('click', () => {
      alert('Loan feature coming soon!');
    });
  }

  if (billBtn) {
    billBtn.addEventListener('click', () => {
      alert('Bill payment feature coming soon!');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

async function updateDashboardUI(user) {
  try {
    // Update user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }

    // Get real data from SACCOAPI
    const [transactions, loans, notifications, branches, exchangeRates] = await Promise.all([
      SACCOAPI.getMemberTransactions(user.memberId),
      SACCOAPI.getMemberLoans(user.memberId),
      SACCOAPI.getMemberNotifications(user.memberId),
      SACCOAPI.getBranches(),
      SACCOAPI.getExchangeRates()
    ]);

    // Update Account Summary
    updateAccountSummary(user, loans);

    // Update Recent Transactions
    updateRecentTransactions(transactions);

    // Update Notifications
    updateNotifications(notifications);

    // Update Exchange Rates
    updateExchangeRates(exchangeRates);

    // Update Branch Locations
    updateBranchLocations(branches);

  } catch (err) {
    console.error('Error updating dashboard:', err);
  }
}

// Format currency
function formatCurrency(amount, currency = 'UGX') {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Update Account Summary Card
function updateAccountSummary(user, loans) {
  const totalBalanceElement = document.getElementById('totalBalance');
  const savingsElement = document.getElementById('savings');
  const loanBalanceElement = document.getElementById('loanBalance');
  const creditScoreElement = document.getElementById('creditScore');

  if (totalBalanceElement) {
    totalBalanceElement.textContent = formatCurrency(user.balance);
  }

  if (savingsElement) {
    // Calculate savings (balance minus active loans)
    const activeLoans = loans.filter(l => l.status === 'approved');
    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const savings = Math.max(0, user.balance - totalLoanAmount);
    savingsElement.textContent = formatCurrency(savings);
  }

  if (loanBalanceElement) {
    const activeLoans = loans.filter(l => l.status === 'approved');
    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    loanBalanceElement.textContent = formatCurrency(totalLoanAmount);
  }

  if (creditScoreElement) {
    // Simulate credit score based on account activity
    creditScoreElement.textContent = '720'; // Can be calculated based on history
  }
}

// Update Recent Transactions Card
function updateRecentTransactions(transactions) {
  const transactionsList = document.getElementById('recentTransactions');
  if (!transactionsList) return;

  // Get last 5 transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  let html = '';
  recentTransactions.forEach(transaction => {
    const amountClass = transaction.type === 'deposit' ? 'positive' : 'negative';
    const amountSymbol = transaction.type === 'deposit' ? '+' : '-';

    html += `
      <div class="transaction-item">
        <span class="transaction-type">${transaction.description}</span>
        <span class="transaction-amount ${amountClass}">
          ${amountSymbol}${formatCurrency(transaction.amount)}
        </span>
        <span class="transaction-date">${formatDate(transaction.date)}</span>
      </div>
    `;
  });

  transactionsList.innerHTML = html;
}

// Update Notifications Card
function updateNotifications(notifications) {
  const notificationsList = document.getElementById('notificationsList');
  if (!notificationsList) return;

  // Get unread notifications
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);

  let html = '';
  unreadNotifications.forEach(notification => {
    html += `
      <div class="notification-item unread">
        <span class="notification-title">${notification.title}</span>
        <span class="notification-date">${formatDate(notification.date)}</span>
      </div>
    `;
  });

  notificationsList.innerHTML = html;
}

// Update Exchange Rates Card
function updateExchangeRates(exchangeRates) {
  const ratesList = document.getElementById('exchangeRates');
  if (!ratesList) return;

  // Get major currencies
  const majorRates = exchangeRates.slice(0, 3);

  let html = '';
  majorRates.forEach(rate => {
    html += `
      <div class="exchange-item">
        <span class="currency">${rate.from}/UGX</span>
        <span class="rate">${rate.rate.toLocaleString()}</span>
      </div>
    `;
  });

  ratesList.innerHTML = html;

  // Update time
  const updateTimeElement = document.getElementById('ratesUpdateTime');
  if (updateTimeElement && exchangeRates.length > 0) {
    updateTimeElement.textContent = formatDate(exchangeRates[0].date);
  }
}

// Update Branch Locations Card
function updateBranchLocations(branches) {
  const branchesList = document.getElementById('branchLocations');
  if (!branchesList) return;

  // Get nearest 2 branches (simplified - would use geolocation in real app)
  const nearestBranches = branches.slice(0, 2);

  let html = '';
  nearestBranches.forEach(branch => {
    html += `
      <div class="branch-item">
        <div class="branch-name">${branch.name}</div>
        <div class="branch-address">${branch.address}</div>
        <div class="branch-phone">${branch.phone}</div>
      </div>
    `;
  });

  branchesList.innerHTML = html;
}

// Global logout function
window.logout = logout;
