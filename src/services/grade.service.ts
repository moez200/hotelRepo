import axios from "axios";
import { GradeType } from "../types/auth";


const API_URL = "http://localhost:8000/cours/grades/";

export const getGrades = async (): Promise<GradeType[]> => {
  const response = await axios.get<GradeType[]>(API_URL);
  return response.data;
};

export const getGradeById = async (id: number): Promise<GradeType> => {
  const response = await axios.get<GradeType>(`${API_URL}${id}/`);
  return response.data;
};

export const createGrade = async (grade: Omit<GradeType, "id">): Promise<GradeType> => {
  const response = await axios.post<GradeType>(API_URL, grade);
  return response.data;
};

export const updateGrade = async (id: number, grade: Partial<GradeType>): Promise<GradeType> => {
  const response = await axios.put<GradeType>(`${API_URL}${id}/`, grade);
  return response.data;
};



export const deleteGrade = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`);
};
