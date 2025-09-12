// API utility functions for frontend
class ExamPrepAPI {
  constructor() {
    const isFileProtocol = window.location.protocol === 'file:';
    const currentHost = window.location.origin;
    // Use same-origin by default; allow override via window.API_BASE_URL; fallback to localhost when opened from filesystem
    const base = window.API_BASE_URL || (isFileProtocol ? 'http://localhost:3000/api' : `${currentHost}/api`);
    this.baseURL = base.replace(/\/$/, '');
    // Prepare fallbacks (handle case where frontend runs on a dev server like :5501)
    this.fallbackBaseURLs = [];
    if (!/localhost:3000\/api$/.test(this.baseURL)) {
      this.fallbackBaseURLs.push('http://localhost:3000/api');
    }
    if (!/localhost:5501\/api$/.test(this.baseURL)) {
      this.fallbackBaseURLs.push('http://localhost:5501/api');
    }
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      let response = await fetch(url, config);
      // If same-origin failed due to wrong port/server, try fallbacks
      if ((!response.ok && (response.status === 404 || response.status === 405)) || response.type === 'opaque') {
        for (const fb of this.fallbackBaseURLs) {
          try {
            const fbResp = await fetch(`${fb}${endpoint}`, config);
            if (fbResp.ok || fbResp.status !== 0) {
              response = fbResp;
              this.baseURL = fb.replace(/\/$/, '');
              break;
            }
          } catch (_) {
            // continue to next fallback
          }
        }
      }
      const contentType = response.headers.get('content-type') || '';

      // Safely parse JSON if present; handle empty or non-JSON bodies
      let data = null;
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (_) {
          data = null;
        }
      } else {
        const text = await response.text();
        if (text && text.trim().length) {
          try {
            data = JSON.parse(text);
          } catch (_) {
            data = { message: text };
          }
        }
      }

      if (!response.ok) {
        const message = (data && (data.error || data.message)) || `${response.status} ${response.statusText}`;
        throw new Error(message);
      }

      return data || {};
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  // Exam methods
  async getExams() {
    return await this.request('/exams');
  }

  async getExam(id) {
    return await this.request(`/exams/${id}`);
  }

  async getExamByCode(code) {
    return await this.request(`/exams/code/${code}`);
  }

  async getExamStats(id) {
    return await this.request(`/exams/${id}/stats`);
  }

  // Video methods
  async getVideos(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/videos?${params}`);
  }

  async getVideo(id) {
    return await this.request(`/videos/${id}`);
  }

  async getVideosByExam(examCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/videos/exam/${examCode}?${params}`);
  }

  async searchVideos(query, filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/videos/search/${encodeURIComponent(query)}?${params}`);
  }

  async getVideoCategories() {
    return await this.request('/videos/categories/list');
  }

  // Paper methods
  async getPapers(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/papers?${params}`);
  }

  async getPaper(id) {
    return await this.request(`/papers/${id}`);
  }

  async getPapersByExam(examCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/papers/exam/${examCode}?${params}`);
  }

  async downloadPaper(id) {
    return await this.request(`/papers/${id}/download`, { method: 'POST' });
  }

  async searchPapers(query, filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/papers/search/${encodeURIComponent(query)}?${params}`);
  }

  async getPaperYears(exam = null) {
    const params = exam ? new URLSearchParams({ exam }) : '';
    return await this.request(`/papers/years/list?${params}`);
  }

  async getPaperTypes(exam = null) {
    const params = exam ? new URLSearchParams({ exam }) : '';
    return await this.request(`/papers/types/list?${params}`);
  }

  // Schedule methods
  async getSchedules(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/schedules?${params}`);
  }

  async getSchedule(id) {
    return await this.request(`/schedules/${id}`);
  }

  async getSchedulesByExam(examCode, filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/schedules/exam/${examCode}?${params}`);
  }

  async getUpcomingSchedules(exam = null, limit = 10) {
    const params = new URLSearchParams({ limit });
    if (exam) params.append('exam', exam);
    return await this.request(`/schedules/upcoming/list?${params}`);
  }

  async getCalendarData(year, month, exam = null) {
    const params = exam ? new URLSearchParams({ exam }) : '';
    return await this.request(`/schedules/calendar/${year}/${month}?${params}`);
  }

  async getEventTypes() {
    return await this.request('/schedules/types/list');
  }

  // User methods
  async getUserProgress(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/users/progress?${params}`);
  }

  async getBookmarks(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/users/bookmarks?${params}`);
  }

  async addBookmark(videoId = null, paperId = null, bookmarkType) {
    return await this.request('/users/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ videoId, paperId, bookmarkType })
    });
  }

  async removeBookmark(bookmarkId) {
    return await this.request(`/users/bookmarks/${bookmarkId}`, {
      method: 'DELETE'
    });
  }

  async getUserStats() {
    return await this.request('/users/stats');
  }

  async getDashboard() {
    return await this.request('/users/dashboard');
  }
}

// Create global API instance
window.api = new ExamPrepAPI();

// Initialize token from localStorage
window.api.token = localStorage.getItem('authToken');


