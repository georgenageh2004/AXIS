// export interface Player {
//     id: number;
//   name: string;
//   position: string;
//   club:string;
//   age: number;
//   goals: number;
//   nationality: string;
//   assists: number;
//   tackles: number;
//   matchesPlayed: number;

//   image: string;   // path of image (assets/players/p1.png)

  
// }
export interface Player {
  id: number;
  name: string;
  position: string;
  age?: number;
  goals: number;
  nationality?: string;
  club?: string;
  image?: string;
  maxZScore?: number;
  assists: number;
  tackles: number;
  matchesPlayed: number;
}

export interface ShortlistItem {
  id: number;       // id العنصر في Shortlist (فريد)
  playerId: number; // الربط مع Player
  addedAt?: string;
  player?: Player;  // optional للعرض
}