export interface LearningSlice {
  id: string;
  name: string;
  url: string;
}

export interface LearningWheel {
  id: string;
  name: string;
  description?: string;
  slices: LearningSlice[];
  createdAt: string;
  modifiedAt: string;
}