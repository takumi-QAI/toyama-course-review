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
  syllabusCode?: string | null;
  syllabusJscd?: string | null;
  syllabusYear?: number | null;
  department?: string | null;
  summary?: string | null;
  summaryAt?: Date | null;
  _count?: { reviews: number };
  avgEasyScore?: number | null;
  avgInterestScore?: number | null;
}

export interface Review {
  id: string;
  content: string;
  easyScore: number;
  interestScore: number;
  user: { id: string; name: string };
  courseId: string;
  createdAt: Date;
  likeCount?: number;
  likedByMe?: boolean;
}

export interface Textbook {
  id: string;
  title: string;
  author?: string | null;
  isbn?: string | null;
  price: number;
  condition: string;
  description?: string | null;
  imageUrl?: string | null;
  status: string;
  contact: string;
  seller: { id: string; name: string };
  courseId: string;
  createdAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface CourseContribution {
  id: string;
  courseId: string;
  field: string;
  value: string;
  approved: boolean;
  createdAt: string;
  course: { name: string };
  user: { name: string; email: string };
}
