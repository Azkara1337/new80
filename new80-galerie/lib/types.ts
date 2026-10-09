export type Couleur = 'rouge' | 'bleu' | 'or' | 'blanc';

export type Soiree = {
  id: string;
  slug: string;
  name: string;
  date: string; // YYYY-MM-DD
  color: Couleur;
  artist: string | null;
  cover_key: string | null;
  cover_thumb_key: string | null;
  cover_color: string | null;
  published: boolean;
  photo_count: number;
  updated_at: string;
};

export type Photo = {
  id: string;
  soiree_id: string;
  thumb_key: string;
  full_key: string;
  width: number;
  height: number;
  color: string;
  position: number;
};

export type GalleryPhoto = {
  id: string;
  thumb: string;
  full: string;
  width: number;
  height: number;
  color: string;
};
