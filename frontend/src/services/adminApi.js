// API service for admin dashboard
const API_BASE_URL = 'http://localhost:5000/api';

class AdminAPI {
  // Get authentication token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Fetch dashboard data
  async getDashboardData() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Dashboard API error:', error);
      throw error;
    }
  }

  // Create tournament
  async createTournament(tournamentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tournamentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create tournament API error:', error);
      throw error;
    }
  }

  // Update tournament
  async updateTournament(id, tournamentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tournamentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update tournament API error:', error);
      throw error;
    }
  }

  // Delete tournament
  async deleteTournament(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete tournament API error:', error);
      throw error;
    }
  }

  // Get all tournaments
  async getTournaments(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/tournaments${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get tournaments API error:', error);
      throw error;
    }
  }

  // Get tournament by ID
  async getTournamentById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get tournament API error:', error);
      throw error;
    }
  }

  // Register for tournament
  async registerForTournament(tournamentId, registrationData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Register tournament API error:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  async getUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get users API error:', error);
      throw error;
    }
  }

  // Update user status (admin only)
  async updateUserStatus(userId, isActive) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update user status API error:', error);
      throw error;
    }
  }

  // Get revenue analytics (admin only)
  async getRevenueAnalytics(period = '6months') {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics/revenue?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Revenue analytics API error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const adminAPI = new AdminAPI();
export default adminAPI;