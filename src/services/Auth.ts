
import { getAuthStore } from '../store/auth';
import { ConsultedCourse, signup } from '../types/auth';
import { api } from './api';
import axios from 'axios';

export const authService = {
  async login(email: string, password: string, recaptchaToken: string) {
    try {
      const response = await api.post('users/login/', { email, password ,recaptchaToken });
    
      return response.data;
    } catch (error: any) {
    
      console.log('API Error:', error.response);
      throw new Error('Failed to connect to the server.');
    }
  },

  async googleLogin(idToken: string) {
    try {
      const response = await api.post('auth/google/', { idToken });
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error.response || error.message || error);
      throw new Error('Failed to connect to the server.');
    }
  },



   /**
   * Configure les en-têtes d'autorisation pour inclure le token JWT.
   * @param token - Le token d'accès JWT.
   */
   async setAuthHeader(token: string | null) {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  },

    /**
   * Déconnecte l'utilisateur.
   */
    async logout() {
        getAuthStore.getState().logout();
        this.setAuthHeader(null);
      }
};



export const updateProfile = async (userData: Omit<signup, 'id'>) => {
  try {
    // Log des données envoyées au serveur
    console.log('Sending updateProfile request with data:', userData);

    const response = await axios.put('http://localhost:8000/users/update-profile/', userData);

    // Log de la réponse reçue du serveur
    console.log('updateProfile response:', response.data);

    return response.data;  // Retourne la réponse du serveur
  } catch (error) {
    // Log de l'erreur avec des détails
    console.error('Error in updateProfile:', {
     // Code HTTP, si disponible
    });

    throw new Error('Erreur lors de l\'inscription');
  }
};


  export const getConsultedCourses = async (): Promise<ConsultedCourse[]> => {
    try {
      const response = await api.get<{ data: ConsultedCourse[] }>('cours/consulted-courses/');
      console.log('Consulted courses response:', response.data); // Debug
      return response.data.data; // Return the 'data' array from response
    } catch (error) {
      console.error('Error fetching consulted courses:', error);
      throw error;
    }
  };
