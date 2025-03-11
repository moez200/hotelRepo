// services/outzService.js

import axios from 'axios';
import { Outz } from '../types/auth';

const API_URL = 'http://localhost:8000/cours/'; // Remplace avec l'URL de ton API

// Interface pour représenter un quiz


export const getOutzs = async (coursId: number): Promise<Outz[]> => {
    try {
      const response = await axios.get(`${API_URL}cours/${coursId}/outz/`);
      // Assurez-vous que la réponse est bien un tableau de quiz
      return response.data as Outz[]; // Casting explicite ici
    } catch (error) {
      console.error('Erreur lors de la récupération des quiz', error);
      throw new Error('Impossible de récupérer les quiz');
    }
  };

// Créer un nouveau quiz
export const createOutz = async (coursId: number, outzData: Outz): Promise<Outz> => {
try {
  const response = await axios.post(`${API_URL}cours/${coursId}/outz/create/`, outzData);
  return response.data as Outz;
} catch (error) {
    console.error('Erreur lors de la récupération des quiz', error);
    throw new Error('Impossible de récupérer les quiz');
  }
};

// Mettre à jour un quiz existant
export const updateOutz = async (coursId: number, outzId: number, outzData: Partial<Outz>): Promise<Outz> => {
  const response = await axios.put(`${API_URL}cours/${coursId}/outz/${outzId}/update/`, outzData);
  return response.data  as Outz;
};

// Supprimer un quiz
export const deleteOutz = async (coursId: number, outzId: number): Promise<void> => {
  await axios.delete(`${API_URL}cours/${coursId}/outz/${outzId}/delete/`);
};
