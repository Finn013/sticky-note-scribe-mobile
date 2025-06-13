
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  fontSize: 'small' | 'medium' | 'large';
  isSelected: boolean;
  tags: string[];
  type: 'note' | 'list';
  listItems?: ListItem[];
}

export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  globalFontSize: 'small' | 'medium' | 'large';
  sortBy: 'date' | 'title' | 'tags';
}
