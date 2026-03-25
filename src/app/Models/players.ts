export interface Player {
    id: number;
  name: string;
  position: string;

  age: number;
  fitness: number;
  passAccuracy: number;
  isInjured: boolean;

  assists: number;
  tackles: number;
  matchesPlayed: number;

  image: string;   // path of image (assets/players/p1.png)

  x: number;       // position on pitch (0–100)
  y: number;
}