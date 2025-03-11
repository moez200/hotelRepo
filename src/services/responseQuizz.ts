// src/services/quizService.ts

import axios from 'axios';

import { QuizResponse, CourseQuizResponse } from "../types/auth";


const API_URL = 'http://127.0.0.1:8000/cours/'; // Adjust based on your API URL

export const quizService = {
  // GET all quiz chapter responses (with optional query params)
  getQuizChapterResponses: async (chapterId?: number, courseId?: number): Promise<QuizResponse[]> => {
    const params: any = {};
    if (chapterId) params.chapter_id = chapterId;
    if (courseId) params.course_id = courseId;

    const response = await axios.get(`${API_URL}quiz-chapter-responses/`, { params });
    return response.data as QuizResponse[];
  },


  createQuizChapterResponse: async (quizResponse: Partial<QuizResponse>): Promise<QuizResponse> => {
    const response= await axios.post(
      `${API_URL}quiz-chapter-responses/`,
      quizResponse,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data as QuizResponse ;
  },

  // GET all course quiz responses (with optional query params)
  getCourseQuizResponses: async (courseId?: number): Promise<CourseQuizResponse[]> => {
    const params: any = {};
    if (courseId) params.course_id = courseId;

    const response = await axios.get(`${API_URL}quiz-course-responses/`, { params });
    return response.data as  CourseQuizResponse [];
  },

  // POST a new course quiz response
  createCourseQuizResponse: async (courseQuizResponse: Partial<CourseQuizResponse>): Promise<CourseQuizResponse> => {
    const response = await axios.post(
      `${API_URL}quiz-course-responses/`,
      courseQuizResponse,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data as CourseQuizResponse ;
  },
};