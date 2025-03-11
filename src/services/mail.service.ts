// services/mail.service.ts
import { Email, EmailCreateRequest, Label, LabelCreateRequest } from "../types/auth";
import { api } from "./api";

export const emails = {
  getAll: async (): Promise<Email[]> => {
    const response = await api.get<Email[]>('/mail/emails/');
    return response.data;
  },

  getSent: async (): Promise<Email[]> => {
    const response = await api.get<Email[]>('/mail/sent-emails/');
    return response.data;
  },

  getReceived: async (): Promise<Email[]> => {
    const response = await api.get<Email[]>('/mail/received-emails/');
    return response.data;
  },

  getFavorites: async (): Promise<Email[]> => {
    const response = await api.get<Email[]>('/mail/favorite-emails/');
    return response.data;
  },

  send: async (data: EmailCreateRequest): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>('/mail/emails/', data);
    return response.data;
  },

  toggleFavorite: async (id: number): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>(`/mail/emails/${id}/toggle-favorite/`);
    return response.data;
  },
};

export const labels = {
  getAll: async (): Promise<Label[]> => {
    const response = await api.get<Label[]>('/mail/labels/');
    return response.data;
  },

  create: async (data: LabelCreateRequest): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>('/mail/labels/', data);
    return response.data;
  },
};