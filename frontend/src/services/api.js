import axios from 'axios';

// Ensure the backend URL matches the FastAPI server port (default is 8000)
const API_URL = 'http://localhost:8000';

export const loadRepo = async (repoUrl) => {
  const response = await axios.post(`${API_URL}/load-repo`, { repo_url: repoUrl });
  return response.data;
};

export const askQuestion = async (query) => {
  const response = await axios.post(`${API_URL}/ask`, { query });
  return response.data;
};

export const summarizeRepo = async () => {
  const response = await axios.get(`${API_URL}/summarize`);
  return response.data;
};
