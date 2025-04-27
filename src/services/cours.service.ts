import axios from "axios";
import { CourType, GradeType } from "../types/auth";
import { api } from "./api";

const API_URL = "http://127.0.0.1:8000/cours/";

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Configuration de base pour axios

export const CoursService = {

  // Méthode pour obtenir tous les cours
  getAllCours: () => axios.get<CourType[]>(`${API_URL}cours/`),

  // Méthode pour obtenir un cours par ID
  getCoursById: (id: number) => api.get<CourType>(`${API_URL}cours/${id}/`),


  
  
   async addCours(cours: CourType): Promise<CourType> {
    const response = await axios.post<CourType>(`${API_URL}cours/add/`, cours);
    return response.data;
  },



  updateCours: async (id: number, data: Partial<CourType>) => {
    const res = await axios.put(`${API_URL}cours/update/${id}/`, data, axiosConfig);
    return res.data;
  },

  async deleteCours(id: number) {
    if (!id) {
      console.error("Erreur : ID est undefined !");

      return;
    }

    try {
      const response = await axios.delete(`${API_URL}cours/delete/${id}/`);
      console.log("Cours supprimé avec succès :", response.data);
   
    } catch (error: any) {
      console.error("Erreur lors de la suppression :", error.response?.data || error.message);
      throw error;
    }
  },

  async getGrades(): Promise<GradeType[]> {
    const response = await axios.get<GradeType[]>(`${API_URL}grades/`);
    return response.data;
  }

  

  
};
