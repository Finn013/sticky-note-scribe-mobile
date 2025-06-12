
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  fontSize: 'small' | 'medium' | 'large';
  isSelected: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  globalFontSize: 'small' | 'medium' | 'large';
  sortBy: 'date' | 'title';
}
