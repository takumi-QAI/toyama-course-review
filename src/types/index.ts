export interface Faculty {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  instructor: string;
  faculty: Faculty;
  year: number;
  semester: string;
  credits: number;
  courseType: string;
  summary?: string | null;
  summaryAt?: Date | null;
  _count?: { reviews: number };
  avgEasyScore?: number | null;
}

export interface Review {
  id: string;
  content: string;
  easyScore: number;
  user: { id: string; name: string };
  courseId: string;
  createdAt: Date;
}

export interface Textbook {
  id: string;
  title: string;
  author?: string | null;
  isbn?: string | null;
  price: number;
  condition: string;
  description?: string | null;
  status: string;
  contact: string;
  seller: { id: string; name: string };
  courseId: string;
  createdAt: Date;
}
