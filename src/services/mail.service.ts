// services/mail.service.ts
import { getAuthStore } from "../store/auth";
import { Email, EmailCreateRequest, Label, LabelCreateRequest } from "../types/auth";
import { api } from "./api";
import axios from 'axios';




// Fonction utilitaire pour récupérer le token
const getAuthToken = () => {
  return getAuthStore.getState().accessToken; // Accéder directement à l'état du store
};
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

  async send(data: EmailCreateRequest) {
    const formData = new FormData();
    formData.append('recipients', JSON.stringify(data.recipients));
    formData.append('subject', data.subject);
    formData.append('content', data.content);
  
    if (Array.isArray(data.attachments)) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
  
    // DEBUG: Log what you're sending
    console.log('Sending email with data:');
    console.log('Recipients:', data.recipients);
    console.log('Subject:', data.subject);
    console.log('Content:', data.content);
    console.log('Attachments:', data.attachments?.map((f) => f.name));
  
    return api.post('/mail/emails/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  },
  

  async reply(id: number, data: EmailCreateRequest) {
    const formData = new FormData();
    const recipients = Array.isArray(data.recipients) ? data.recipients : [];
    formData.append('recipients', JSON.stringify(recipients.map(Number)));
    formData.append('subject', data.subject);
    formData.append('content', data.content);
    formData.append('parent_email', String(id));
    if (Array.isArray(data.attachments)) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    return axios.post(`http://localhost:8000/mail/${id}/reply/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  },

  async forward(id: number, data: EmailCreateRequest) {
    const formData = new FormData();
    const recipients = Array.isArray(data.recipients) ? data.recipients : [];
  
    // Loguer les données avant de les ajouter à formData
    console.log('Forward request details:', {
      emailId: id,
      recipientsBeforeMapping: data.recipients, // Loguer les recipients originaux
      recipientsAfterMapping: recipients.map(Number), // Loguer après mapping
      subject: data.subject,
      content: data.content,
      parentEmail: String(id),
      attachments: data.attachments, // Loguer les attachments (si présents)
    });
  
    // Ajouter les données à formData
    formData.append('recipients', JSON.stringify(recipients.map(Number)));
    formData.append('subject', data.subject);
    formData.append('content', data.content);
    formData.append('parent_email', String(id));
  
    // Loguer le contenu de formData
    for (let [key, value] of formData.entries()) {
      console.log(`FormData entry - Key: ${key}, Value: ${value}`);
    }
  
    if (Array.isArray(data.attachments)) {
      data.attachments.forEach((file, index) => {
        console.log(`Attachment ${index + 1}:`, {
          name: file.name,
          type: file.type,
          size: file.size,
        });
        formData.append('attachments', file);
      });
    }
  
    // Loguer les headers avant l'envoi
    console.log('Request headers:', {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getAuthToken()}`,
    });
  
    // Envoyer la requête
    return axios.post(`http://localhost:8000/mail/${id}/forward/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  },
  async getThread(id: number) {
    return axios.get(`http://localhost:8000/mail/${id}/thread/`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }).then(response => response.data);
  },

  async getAttachments(id: number) {
    try {
      const response = await axios.get(`http://localhost:8000/mail/${id}/attachments/`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = response.data;
      console.log('getAttachments response:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('getAttachments error:', error);
      return [];
    }
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