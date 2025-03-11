import axios from "axios";
import { Apprenant } from "../types/auth";
import { api } from "./api";

const API_URL = "http://localhost:8000/users/"; // Remplace par ton URL réelle

export const apprenantService = {
  getAll: async (): Promise<Apprenant[]> => {
    const response = await axios.get<Apprenant[]>(`${API_URL}apprenants/`);
    return response.data as Apprenant[]; // On s'assure que response.data est bien du type Apprenant[]
  },

  getById: async (id: number): Promise<Apprenant> => {
    const response = await axios.get(`${API_URL}apprenants/${id}/`);
    return response.data as Apprenant; // On cast explicitement la réponse à Apprenant
  },

  create: async (data: Partial<Apprenant>): Promise<Apprenant> => {
    const response = await axios.post(`${API_URL}apprenants/`, data);
    return response.data as Apprenant; // Assure que la réponse est bien du type Apprenant
  },

  update: async (id: number, data: Partial<Apprenant>): Promise<Apprenant> => {
    const response = await axios.put(`${API_URL}apprenants/${id}/`, data);
    return response.data as Apprenant; // Assure que la réponse est bien du type Apprenant
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}apprenants/${id}/delete/`);
  },

  recover: async (id: number, company_id: number): Promise<void> => {
    await axios.post(`${API_URL}apprenants/${id}/recover/`, { company_id });
  },

  getHistoriqueSuppression: async (): Promise<any> => {
    const response = await axios.get(`${API_URL}historiques-suppression/`);
    return response.data; // Si tu as un type spécifique pour l'historique, tu peux le définir ici aussi
  }
};



export const deactivateApprenant = async (id: number): Promise<Apprenant> => {
  const response = await api.post(`/apprenants/deactivate/${id}/`);
  return response.data as Apprenant;
};

export const activateAndChangeCompany = async (id: number, company_id: number): Promise<Apprenant> => {
  const response = await api.post(`/apprenants/activate_change_company/${id}/`, { company_id });
  return response.data  as Apprenant;
};


export const getInactiveApprenants = async (): Promise<Apprenant[]> => {
  const response = await api.get("/apprenants/inactifs/");
  return response.data as Apprenant[];
};

