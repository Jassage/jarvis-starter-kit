import axios from 'axios';
import { env } from '../config/env';

// App viewer publique, sans authentification — contrairement à KONEKTE mobile,
// pas de token/refresh à gérer, l'EPG est un endpoint public côté backend.
const api = axios.create({
  baseURL: env.apiUrl,
});

export default api;
