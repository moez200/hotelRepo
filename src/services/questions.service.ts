import axios from "axios";
import { QuestionCour } from "../types/auth";


const API_URL = "http://127.0.0.1:8000/cours/questions/";

const questionService = {

    getAllQuestions: async (quizId: number) => {
    const response = await axios.get<QuestionCour[]>(`http://127.0.0.1:8000/cours/questions/?quiz_id=${quizId}`);
    return response.data;
  },
  
  

  // Récupérer une question par ID
  getQuestionById: async (id: number): Promise<QuestionCour> => {
    const response = await axios.get<QuestionCour>(`${API_URL}${id}/`);
    return response.data;
  },

  // Ajouter une nouvelle question
  addQuestion: async (questionData: Omit<QuestionCour, "id">): Promise<QuestionCour> => {
    const response = await axios.post<QuestionCour>(API_URL, questionData);
    return response.data;
  },

  // Mettre à jour une question
  updateQuestion: async (id: number, updatedData: Partial<QuestionCour>): Promise<QuestionCour> => {
    const response = await axios.put<QuestionCour>(`${API_URL}${id}/`, updatedData);
    return response.data;
  },

  // Supprimer une question
  deleteQuestion: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}${id}/`);
  },
};

export default questionService;
