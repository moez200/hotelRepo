import axios from "axios";
import { AdminMinistere } from "../types/auth";


import { api } from "./api";


const API_URL = "http://localhost:8000/users/admin-ministere"; // Modifier selon votre backend


export const createAdminMinistere = async (admin: AdminMinistere): Promise<AdminMinistere> => {
  const response = await axios.post(`${API_URL}/create/`, admin, {
    withCredentials: true,
  });
  return response.data  as AdminMinistere;
};

export const updateAdminMinistere = async (
  id: number,
  admin: Partial<AdminMinistere>
  
): Promise<AdminMinistere> => {
  
    const response = await api.put(`${API_URL}/${id}/`, admin );
  return response.data  as AdminMinistere;
};

export const deleteAdminMinistere = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/delete/${id}/`, {
    withCredentials: true,
  });
};

export const getAdminMinistereProfile = async (): Promise<AdminMinistere> => {
    try {
    
      const response = await api.get(`${API_URL}/profile/`);
      console.log("Réponse de l'API:", response.data); 
      return response.data as AdminMinistere;
    } catch (error) {
  
      throw new Error("Erreur lors de la récupération des données du candidat.");
    }
  }


 