
import { Company } from "../types/auth";
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/company/";

export const getCompanies = async (): Promise<Company[]> => {
  const response = await axios.get<Company[]>(`${API_URL}companies/`);
  return response.data;
};

// Fonction pour créer une entreprise



export const createCompany = async (company: Omit<Company, "id">): Promise<Company> => {
  try {
    const response = await axios.post<Company>(`${API_URL}companies/create/`, company);
    return response.data;
  } catch (error: unknown) {
    
    throw error;
  }
};


  export const deleteCompany =async (id: number) =>{
    if (!id) {
      console.error("Erreur : ID est undefined !");

      return;
    }

    try {
      const response = await axios.delete(`${API_URL}companies/delete/${id}/`);
      console.log("company supprimé avec succès :", response.data);
      alert("company supprimé avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la suppression :", error.response?.data || error.message);
      throw error;
    }
  }


  export const updateCompany = async (id: number, domaine: Partial<Company>): Promise<Company> => {
    const response = await axios.put<Company>(`${API_URL}${id}/`, domaine);
    return response.data;
  };