import axios from "axios";
import { Domaines } from "../types/auth";



const API_URL = "http://localhost:8000/company/domaines/";

export const getDomaines = async (): Promise<Domaines[]> => {
  const response = await axios.get<Domaines[]>(API_URL);
  return response.data;
};

export const getDomaineById = async (id: number): Promise<Domaines> => {
  const response = await axios.get<Domaines>(`${API_URL}${id}/`);
  return response.data;
};

export const createDomaine = async (domaine: Omit<Domaines, "id">): Promise<Domaines> => {
  const response = await axios.post<Domaines>(API_URL, domaine);
  return response.data;
};

export const updateDomaine = async (id: number, domaine: Partial<Domaines>): Promise<Domaines> => {
    const response = await axios.put<Domaines>(`${API_URL}${id}/`, domaine);
    return response.data;
  };
  
export const deleteDomaine = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`);
};
