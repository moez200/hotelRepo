import axios from "axios";
import { AdminEntreprise } from "../types/auth";


const API_URL = "http://localhost:8000/users/admin-entreprises/";

export const adminEntrepriseService = {
  getAll: async (): Promise<AdminEntreprise[]> => {
    const response = await axios.get(API_URL);
    return response.data as AdminEntreprise[];
  },

  getById: async (id: number): Promise<AdminEntreprise> => {
    const response = await axios.get(`${API_URL}${id}/`);
    return response.data as AdminEntreprise;
  },

  create: async (admin: AdminEntreprise): Promise<AdminEntreprise> => {
    const response = await axios.post(API_URL, admin);
    return response.data as AdminEntreprise;
  },

  update: async (id: number, admin:  Partial<AdminEntreprise>): Promise<AdminEntreprise> => {
    const response = await axios.put(`${API_URL}${id}/`, admin);
    return response.data as AdminEntreprise;
  },


  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}${id}/`);
  },
};
