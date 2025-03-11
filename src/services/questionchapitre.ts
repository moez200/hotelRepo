import axios from "axios";
import { QuestionChapitre } from "../types/auth";


const API_URL = "http://127.0.0.1:8000/cours";

export const getQuestionsByQuizz = async (quizzId: number): Promise<QuestionChapitre[]> => {
  const response = await axios.get(`${API_URL}/quizz/${quizzId}/questions/`);
  return response.data as QuestionChapitre[];
};

export const addQuestionToQuizz = async (quizzId: string, question: QuestionChapitre): Promise<QuestionChapitre> => {
  const response = await axios.post(`${API_URL}/quizz/${quizzId}/add-question/`, question);
  return response.data as QuestionChapitre ;
};

export const updateQuestion = async (questionId: number, question: QuestionChapitre): Promise<QuestionChapitre> => {
  const response = await axios.put(`${API_URL}/questions/${questionId}/update/`, question);
  return response.data as QuestionChapitre;
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
  await axios.delete(`${API_URL}/questions/${questionId}/delete/`);
};
