export interface Post {
  id?: string;
  title: string;
  content: string;
  // Used when CREATING a post (sent to backend)
  companyId?: string;
  tagIds?: string[];
  // Returned by API (mirrors PostResponseDTO)
  authorId?: string;
  authorName?: string;
  companyName?: string;
  companySlug?: string;
  companyLogo?: string;
  type: PostType;
  role?: string;
  location?: string;
  salaryPackage?: number;
  difficulty?: DifficultyLevel | string;
  result?: ResultStatus | string;
  anonymous: boolean;
  draft?: boolean;
  viewCount?: number;
  trendingScore?: number;
  createdAt?: string;
  currency?: string;
  rounds?: Round[];
}

export interface Round {
  roundNumber: number;
  roundName: string;
  description?: string;
  difficulty?: DifficultyLevel;
  questions?: Question[];
}

export interface Question {
  questionText: string;
  topicTags?: string[];
}

export interface PostFilter {
  page?: number;
  size?: number;
  sort?: 'latest' | 'trending';
  company?: string;
  tag?: string;
  difficulty?: DifficultyLevel;
  role?: string;
}

export type PostType = 'InterviewExperience' | 'SalaryDiscussion' | 'HiringUpdate' | 'OAReport';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type ResultStatus = 'Selected' | 'Rejected' | 'Waitlisted' | 'Pending';
