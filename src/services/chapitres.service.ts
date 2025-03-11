import axios from "axios";
import { Chapitre, Pause } from "../types/auth";


const API_URL = "http://127.0.0.1:8000/cours/";

export const ChapitreService = {
  // 📌 Récupérer les chapitres d'un cours spécifique
  getChapitresForCours: async (coursId: number) => {
    try {
      const response = await axios.get(`${API_URL}cours/chapitres/${coursId}/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des chapitres :", error);
      throw error;
    }
  },


  getChapitreById: (id: number) => axios.get<Chapitre>(`${API_URL}chapitres/${id}/`),
  

  ajouterChapitre: async (formData: FormData, courseId: number) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`); // Debug contents
    }
    try {
      const response = await axios.post(`${API_URL}cours/chapters/${courseId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Réponse API : ", response);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du chapitre :", error.response?.data || error);
      throw error;
    }
  },



  // 📌 Mettre à jour un chapitre spécifique
  updateChapitre: async (chapitreId: number, formData: FormData, courseId: number) => {
    for (const [key, value] of formData.entries()) {
      console.log("chi5awi",`${key}: ${value}`); // Debug contents
    }
    try {
      const response = await axios.put(`${API_URL}cours/${courseId}/chapitre/${chapitreId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du chapitre :", error);
      throw error;
    }
  },

  // 📌 Supprimer un chapitre
  deleteChapitre: async (coursId: number, chapitreId: number) => {
    try {
      const response = await axios.delete(`${API_URL}cours/${coursId}/chapitre/${chapitreId}/delete/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la suppression du chapitre :", error);
      throw error;
    }
  },
};





export default ChapitreService;
// Ensure Chapitre is imported

interface PauseData {
  temps_pause: number;
  information: string;
  correct_grid_row: number | null;
  correct_grid_col: number | null;
}

export const updateChapitrePauses = async (
  coursId: number,
  chapitreId: number,
  updatedPauses: Pause[]
): Promise<Chapitre> => { // Return Chapitre instead of Pause
  try {
    const pausesData: PauseData[] = updatedPauses
      .filter(pause => pause.tempsPause !== null && pause.tempsPause !== "" && !isNaN(Number(pause.tempsPause)))
      .map(pause => ({
        temps_pause: Number(pause.tempsPause),
        information: pause.information || "",
        correct_grid_row: pause.correctGrid?.row ?? null,
        correct_grid_col: pause.correctGrid?.col ?? null,
      }));

    console.log("Sending updated pauses:", pausesData);

    const response = await axios.put(
      `http://127.0.0.1:8000/cours/cours/${coursId}/chapitre/${chapitreId}/`,
      { pauses: pausesData },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("API Response after update:", response.data);
    return response.data as Chapitre; // Extract the chapitre field
  } catch (error) {
    console.error("Error updating chapitre:", error);
    if (error) {
      console.error("Axios error details:", error);
    }
    throw error;
  }
};