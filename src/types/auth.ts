export interface GradeType {
  id: number;
  name: string;
  description:string;
  // Add other grade properties from your Django model
}

export interface CourType {
  id: number;
  title: string;
  description: string;
  logo: string;
  grades: number; // Grade ID
}


export interface NewCours {
  title: string;
  description: string;
  logo: string; 
  grades: number;//
  // 
  //  Image sous forme d'URL ou de fichier pour l'upload
}

export interface User {
  id: number;
  cin: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_complet: boolean; 
  gender: string;
  company_id: number ;
  grades: number ;
  phone_number: string | null;
  dob: string;
  password:string;

  is_approved: boolean;
}

export interface Apprenant extends User {
  is_apprenant: boolean;

  
}
export interface AdminEntreprise  extends User  {
  is_admin_enterprise: boolean;
 
}



export interface AuthResponse {
  
 
  access_token: string;
  refresh_token: string;
  error:string;
  ok:string;
  role:string;
 
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}







export interface Company {
 
 
  id: number;
  name: string;
 
  adresse: string;
  phone_number: string;
  nb_emp: number;
  domaine: number; // ID du domaine associé
}

export interface NewCompany {
 
 
  
  name: string;
  email: string;
  adresse: string;
  phone_number: string;
  nb_emp: number;
  domaine: number; // ID du domaine associé
}


export interface Domaines {
  id: number;
  nom: string;
  description: string;
}

export interface Chapitre {
  id: number;
  title: string;
  description: string;
  video: string | null;
  pdf: string | null;
  pptx: string | null;
  cours: number;
  completed: boolean;
  pauses?: Pause[];
}

export interface Pause {
  tempsPause: number | ""; // Correspond à "temps_pause"
  information: string;
  correctGrid?: {
    row: number; // Correspond à "correct_grid_row"
    col: number; // Correspond à "correct_grid_col"
  };
}





export interface NewChapitre {
 
  title: string;
  description: string;
  video: string | null; // URL ou chemin du fichier vidéo, peut être null si non fourni
  pdf: string | null; // URL ou chemin du fichier PDF, peut être null si non fourni
  pptx: string | null; // URL ou chemin du fichier PPTX, peut être null si non fourni
  cours: number; // ID du cours associé (référence à l'objet Cour)
}

export interface Outz {
  id: number;
  title: string;
  cours: number;
}

export interface QuestionCour {
  id?: number; // optionnel si l'objet n'est pas encore créé
  imagecour: string;
  title: string;
  op1: string;
  op2: string;
  op3: string;
  op4: string;
  rep: string;
  quizzecur: number; // ID de la relation
}

export interface AdminMinistere  extends User{

  is_ministere: boolean;
}

export interface QuizzChapitre {
  id: number;
  title: string;
  chapitres: number;  // ou Chapitre si tu veux inclure l'objet entier
}

export interface signup {

  cin: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  phone_number: string | null;
  dob: string;
  password:string;
  confirmPassword?:string;
  role:string | null;

 
}
export interface QuestionChapitre {
  id?: number;
  imagecour: string;
  title: string;
  op1: string;
  op2: string;
  op3: string;
  op4: string;
  rep: string;
  quizz: number;
}
export interface QuizResponse {
  id: number;
  chapter: number ; // Can be either ID or full Chapitre object
  course: number ; // Can be either ID or full Cour object
  title: string;
  date: string; // ISO 8601 date string (e.g., "2025-02-21T20:55:00Z")
  score: number;
  status: string;
}

export interface CourseQuizResponse {
  id: number;
  course: number ; // Can be either ID or full Cour object
  title: string;
  date: string; // ISO 8601 date string
  score: number;
  status: string;
}
export interface ConsultedCourse {
  course_id: number;
  course_name: string;
  chapter_id?: number; // Optional for chapter-level quizzes
  chapter_name?: string; // Optional
  date_consulted: string; // ISO date string
  duration: number | null; // Nullable duration in minutes
  status: string; // e.g., "Completed", "In Progress"
  type: 'course_quiz' | 'chapter_quiz'; // Quiz type
  score: number; // Score out of 100
}
export interface VideoInteraction {
  id: string;
  video_url:string;
  timestamp: number; // En secondes
  duration: number; // En secondes
  position_x: number;
  position_y: number;
  position_width: number;
  position_height: number;
  interaction_type: 'click' | 'hover' | 'drag';
}
export interface InteractionResponse {
  interactionId: string;
  timestamp: number;
  success: boolean;
  position: { row: number; col: number };
}
export interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  received: boolean;
  replyToId?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: { [username: string]: string };
  readBy?: string[];
}


export interface Email {
  id: number;
  sender_id: number;
  sender_username: string;
  sender_email: string;
  subject: string;
  content: string;
  created_at: string;
  read: boolean;
  is_favorite: boolean;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  user_id: number;
}


export interface EmailCreateRequest {
  recipients: string[];
  subject: string;
  content: string;
}

export interface LabelCreateRequest {
  name: string;
  color: string;
}