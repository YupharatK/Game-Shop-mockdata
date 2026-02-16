export interface GameDto {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  release_date: string;
  created_at: string;
  game_type: string;         // มาจาก AS game_type ใน SQL
  purchase_date?: string;    // มาจาก UserLibrary
}

export interface GameUi {
  id: number;
  title: string;
  game_type: string;       // <<< ใช้ชื่อนี้ใน UI
  price: number;
  imageUrl: string;
  isOwned?: boolean; 
}


export interface GameType { id: number; name: string; }