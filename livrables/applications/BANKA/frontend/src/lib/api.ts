import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Les cookies httpOnly sont envoyés automatiquement par le navigateur
});

// Plus d'injection manuelle du token — il est dans le cookie httpOnly, inaccessible au JS

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined' && !error.config._retry) {
      error.config._retry = true;
      try {
        // Le refresh token est dans le cookie httpOnly — pas besoin de le lire
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        // Relancer la requête originale — le nouveau cookie access est posé par le serveur
        return api(error.config);
      } catch {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
