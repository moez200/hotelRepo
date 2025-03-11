import axios from 'axios';
import {   User } from '../types/auth';


// Définition de l'URL de l'API
const API_URL = "http://127.0.0.1:8000/users/";




export const fetchUsers = async (page: number): Promise<User[]> => {
    try {
      const response = await axios.get<User[]>(`${API_URL}users/`, {
        params: {
          page: page,  // Paramètre pour la page courante
        },
      });
      return response.data;  // Retourne directement le tableau d'utilisateurs
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;  // On relance l'erreur pour la gérer dans l'appelant
    }
  };
  

    

// Fonction pour approuver un utilisateur
export const approveUser = async (id: number): Promise<void> => {
  await axios.post(`${API_URL}approve/${id}/`, { action: 'approve' });
};

// Fonction pour rejeter un utilisateur
export const rejectUser = async (id: number): Promise<void> => {
  await axios.post(`${API_URL}reject/${id}/`, { action: 'reject' });
};

// Fonction pour supprimer un utilisateur
export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}users/delete/${id}/`);
};


