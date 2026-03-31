export interface Note {
  id: number;
  title: string;
  content: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  enjoyment: number | null;
}
