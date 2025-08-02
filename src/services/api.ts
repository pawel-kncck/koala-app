// API client for backend communication

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function for API calls
async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// Project API
export const projectsApi = {
  create: async (name: string) => {
    return apiCall(`/projects?name=${encodeURIComponent(name)}`, {
      method: 'POST',
    });
  },

  list: async () => {
    return apiCall('/projects');
  },

  get: async (projectId: string) => {
    return apiCall(`/projects/${projectId}`);
  },
};

// Files API
export const filesApi = {
  upload: async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `Upload Error: ${response.status}`);
    }

    return response.json();
  },

  list: async (projectId: string) => {
    return apiCall(`/projects/${projectId}/files`);
  },

  preview: async (projectId: string, fileId: string, rows: number = 100) => {
    return apiCall(`/projects/${projectId}/files/${fileId}/preview?rows=${rows}`);
  },

  delete: async (projectId: string, fileId: string) => {
    return apiCall(`/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
    });
  },
};

// Context API
export const contextApi = {
  get: async (projectId: string) => {
    return apiCall(`/projects/${projectId}/context`);
  },

  update: async (projectId: string, content: string) => {
    const formData = new FormData();
    formData.append('context', content);

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/context`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Update failed' }));
      throw new Error(error.detail || `Update Error: ${response.status}`);
    }

    return response.json();
  },
};

// Chat API
export const chatApi = {
  sendMessage: async (projectId: string, message: string) => {
    return apiCall(`/projects/${projectId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        message: message,
      }),
    });
  },
};

export default {
  projects: projectsApi,
  files: filesApi,
  context: contextApi,
  chat: chatApi,
};