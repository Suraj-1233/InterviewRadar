export interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  anonymous: boolean;
  likeCount: number;
  parentId?: string;
  createdAt: string;
  updatedAt?: string;
  replies: Comment[];         // nested tree from backend
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
  anonymous: boolean;
}

export interface VoteStatus {
  upvotes: number;
  downvotes: number;
  userVote: 'Upvote' | 'Downvote' | null;
}
