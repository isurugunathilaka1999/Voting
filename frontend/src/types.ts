export interface Candidate {
  id: number;
  name: string;
  description: string;
  likes: number;
  dislikes: number;
  created_at: string;
}

export type VoteType = 'like' | 'dislike';
