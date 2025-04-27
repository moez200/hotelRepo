import axios from 'axios';
import { QuizzChapitre } from '../types/auth';
import { api } from './api';


const API_URL = 'http://localhost:8000/cours/'; 

export const addQuizzToChapitre = async (chapitreId: number, quizzData: { title: string }): Promise<QuizzChapitre> => {
  try {
    const response = await api.post(`${API_URL}add/chapitre/${chapitreId}/quizz/`, quizzData);
    return response.data as QuizzChapitre ;
  } catch (error) {
    console.error('Error adding quizz:', error);
    throw error;
  }
};


export const updateQuizz = async (quizzId: number, quizzData: Partial<QuizzChapitre>): Promise<QuizzChapitre> => {
  try {
    const response = await axios.put(`${API_URL}quizz/${quizzId}/`, quizzData);
    return response.data as QuizzChapitre;
  } catch (error) {
    console.error('Error updating quizz:', error);
    throw error;
  }
};

// Supprimer un quiz spécifique
export const deleteQuizz = async (quizzId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}quizz/${quizzId}/delete/`);
  } catch (error) {
    console.error('Error deleting quizz:', error);
    throw error;
  }
};

// Obtenir les quizzes d'un chapitre spécifique
export const getQuizzByChapitre = async (chapitreId: number): Promise<QuizzChapitre[]> => {
  try {
    const response = await api.get(`${API_URL}chapitre/${chapitreId}/quizz/`);
    return response.data as QuizzChapitre[];
  } catch (error) {
    console.error('Error fetching quizz by chapitre:', error);
    throw error;
  }
};
