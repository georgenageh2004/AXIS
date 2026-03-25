import { PlayerStats } from "./player_stats";
export interface PlayersProfile{
  id: number;
  name: string;
  position: string;
  image: string;

  age: number;
  nationality: string;
  club: string;
  league: string;

// stats

  stats:PlayerStats;
}