
import { QuestionCour } from "../types/auth";
import { api } from "./api";

const API_URL = "http://127.0.0.1:8000/cours/questions/";

const getAllQuestions = async (quizzId: number) => {
  const response = await api.get(`${API_URL}?quizzecur=${quizzId}`);
  return response.data;
};
const addQuestion = async (question: QuestionCour) => {
  const formData = new FormData();
  formData.append("title", question.title);
  formData.append("op1", question.op1);
  formData.append("op2", question.op2);
  formData.append("op3", question.op3);
  formData.append("op4", question.op4);
  formData.append("rep", question.rep);
  formData.append("quizzecur", question.quizzecur.toString());
  if (question.imagecour instanceof File) {
    formData.append("imagecour", question.imagecour);
  }
  if (question.video instanceof File) {
    formData.append("video", question.video);
  }
  if (question.clickable_regions && question.clickable_regions.length > 0) {
    formData.append('clickable_regions', JSON.stringify(question.clickable_regions));
  }
  if (question.clickable_zones && question.clickable_zones.length > 0) {
    formData.append('clickable_zones', JSON.stringify(question.clickable_zones));
  }
  const response = await api.post('cours/questions/', formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const updateQuestion = async (id: number, question: QuestionCour) => {
  const formData = new FormData();
  formData.append("title", question.title);
  formData.append("op1", question.op1);
  formData.append("op2", question.op2);
  formData.append("op3", question.op3);
  formData.append("op4", question.op4);
  formData.append("rep", question.rep);
  formData.append("quizzecur", question.quizzecur.toString());
  if (question.imagecour instanceof File) {
    formData.append("imagecour", question.imagecour);
  } else if (question.imagecour === "") {
    formData.append("imagecour", ""); // Clear image
  }
  if (question.video instanceof File) {
    formData.append("video", question.video);
  } else if (question.video === "") {
    formData.append("video", ""); // Clear video
  }
  if (question.clickable_regions && question.clickable_regions.length > 0) {
    formData.append('clickable_regions', JSON.stringify(question.clickable_regions));
  } else {
    formData.append('clickable_regions', JSON.stringify([])); // Clear clickable_regions
  }
  if (question.clickable_zones && question.clickable_zones.length > 0) {
    formData.append('clickable_zones', JSON.stringify(question.clickable_zones));
  } else {
    formData.append('clickable_zones', JSON.stringify([])); // Clear clickable_zones
  }
  const response = await api.put(`cours/questions/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const deleteQuestionCour = async (id: number) => {
  await api.delete(`${API_URL}${id}/`);
};

export default {
  getAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestionCour,
};