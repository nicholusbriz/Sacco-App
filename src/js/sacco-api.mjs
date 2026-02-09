// SACCO API Service - Centralized data fetching and business logic
class SACCOAPI {
  // Base URL for JSON files
  static BASE_URL = '/json';

  // Generic fetch method with error handling
  static async fetchJSON(endpoint) {
    try {
      const response = await fetch(`${this.BASE_URL}/${endpoint}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      throw err;
    }
  }

  // Get a specific member by ID
  static async getMember(memberId) {
    try {
      const response = await this.fetchJSON('members');
      const members = response.members;
      return members.find(member => member.memberId === memberId) || null;
    } catch (err) {
      console.error('Error fetching member:', err);
      return null;
    }
  }

  // Get all members
  static async getAllMembers() {
    try {
      const response = await this.fetchJSON('members');
      return response.members;
    } catch (err) {
      console.error('Error fetching all members:', err);
      return [];
    }
  }

  // Authenticate user credentials
  static async authenticateUser(memberId, password) {
    try {
      // First check members.json
      const response = await this.fetchJSON('members');
      const members = response.members;
      let user = members.find(member =>
        member.memberId === memberId && member.password === password
      );

      // If not found in members.json, check LocalStorage for new registrations
      if (!user) {
        const registeredMembers = JSON.parse(localStorage.getItem('registeredMembers') || '[]');
        user = registeredMembers.find(member =>
          member.memberId === memberId && member.password === password
        );
      }

      if (user) {
        // Update last login time
        user.lastLogin = new Date().toISOString();
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Authentication error:', err);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Get transactions for a specific member
  static async getMemberTransactions(memberId) {
    try {
      const response = await this.fetchJSON('transactions');
      const transactions = response.transactions;
      return transactions
        .filter(t => t.memberId === memberId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return [];
    }
  }

  // Get all transactions
  static async getAllTransactions() {
    try {
      const response = await this.fetchJSON('transactions');
      return response.transactions;
    } catch (err) {
      console.error('Error fetching all transactions:', err);
      return [];
    }
  }

  // Process a new transaction
  static async processTransaction(transaction) {
    try {
      // Validate transaction
      if (!transaction.memberId || !transaction.amount || !transaction.type) {
        throw new Error('Invalid transaction data');
      }

      // Generate unique transaction ID
      const transactionId = `TXN${Date.now()}`;

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        transactionId,
        status: 'completed',
        message: 'Transaction processed successfully'
      };
    } catch (err) {
      console.error('Error processing transaction:', err);
      return { success: false, error: 'Transaction failed' };
    }
  }

  // Get loans for a specific member
  static async getMemberLoans(memberId) {
    try {
      const response = await this.fetchJSON('loans');
      const loans = response.loans;
      return loans.filter(l => l.memberId === memberId);
    } catch (err) {
      console.error('Error fetching loans:', err);
      return [];
    }
  }

  // Get all loans
  static async getAllLoans() {
    try {
      const response = await this.fetchJSON('loans');
      return response.loans;
    } catch (err) {
      console.error('Error fetching all loans:', err);
      return [];
    }
  }

  // Submit loan application
  static async submitLoanApplication(application) {
    try {
      // Validate application
      if (!application.memberId || !application.amount || !application.type) {
        throw new Error('Invalid loan application');
      }

      // Generate unique loan ID
      const loanId = `LN${Date.now()}`;

      // Simulate approval process
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        success: true,
        loanId,
        status: 'pending',
        message: 'Loan application submitted successfully'
      };
    } catch (err) {
      console.error('Error submitting loan application:', err);
      return { success: false, error: 'Loan application failed' };
    }
  }

  // Get notifications for a specific member
  static async getMemberNotifications(memberId) {
    try {
      const response = await this.fetchJSON('notifications');
      const notifications = response.notifications;
      return notifications
        .filter(n => n.memberId === memberId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return [];
    }
  }

  // Get all notifications
  static async getAllNotifications() {
    try {
      const response = await this.fetchJSON('notifications');
      return response.notifications;
    } catch (err) {
      console.error('Error fetching all notifications:', err);
      return [];
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId) {
    try {
      const response = await this.fetchJSON('notifications');
      const notifications = response.notifications;
      const notification = notifications.find(n => n.notificationId === notificationId);

      if (notification) {
        notification.read = true;
        return { success: true, notification };
      } else {
        return { success: false, error: 'Notification not found' };
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, error: 'Update failed' };
    }
  }

  // Get all branch locations
  static async getBranches() {
    try {
      const response = await this.fetchJSON('branches');
      return response.branches;
    } catch (err) {
      console.error('Error fetching branches:', err);
      return [];
    }
  }

  // Find nearest branch to user location
  static async findNearestBranches(userLat, userLng, limit = 3) {
    try {
      const branches = await this.getBranches();

      // Calculate distance from user to each branch
      const branchesWithDistance = branches.map(branch => {
        const distance = this.calculateDistance(userLat, userLng, branch.coordinates.lat, branch.coordinates.lng);
        return { ...branch, distance };
      });

      // Sort by distance and return nearest
      return branchesWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    } catch (err) {
      console.error('Error finding nearest branches:', err);
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates
   * STEP 1: Use Haversine formula
   * STEP 2: Return distance in kilometers
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a * a) / Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  // Get exchange rates from external API
  static async getExchangeRates() {
    try {
      const response = await fetch(`${import.meta.env.VITE_EXCHANGE_API_URL}/${import.meta.env.VITE_EXCHANGE_API_KEY}/latest/USD`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Convert API response to expected format
      const rates = [];
      for (const [currency, rate] of Object.entries(data.conversion_rates)) {
        rates.push({
          from: 'USD',
          to: currency,
          rate: rate,
          date: new Date().toISOString()
        });
      }
      return rates;
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      // Fallback to local JSON if API fails
      try {
        const response = await this.fetchJSON('exchange-rates');
        return response.rates;
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        return [];
      }
    }
  }

  // Convert currency amount using local rates
  static async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      const rates = await this.getExchangeRates();
      const rate = rates.find(r => r.to === toCurrency && r.from === fromCurrency);

      if (rate) {
        const convertedAmount = amount * rate.rate;
        return {
          success: true,
          amount: convertedAmount,
          rate: rate.rate,
          from: fromCurrency,
          to: toCurrency
        };
      } else {
        return { success: false, error: 'Exchange rate not found' };
      }
    } catch (err) {
      console.error('Error converting currency:', err);
      return { success: false, error: 'Currency conversion failed' };
    }
  }

  // Format currency with proper locale
  static formatCurrency(amount, currency = 'UGX') {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Format date for display
  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get financial news
  static async getFinancialNews() {
    try {
      const response = await fetch(`https://newsapi.org/v2/top-headlines?category=business&country=us&apiKey=${import.meta.env.VITE_NEWS_API_KEY}`);
      const data = await response.json();
      return data.articles.slice(0, 5); // Top 5 articles
    } catch (err) {
      console.error('News fetch failed:', err);
      return [];
    }
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export the API class
export default SACCOAPI;
