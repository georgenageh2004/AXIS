export interface StatItem {
  playerName: string;
  metric: string;
  value: number;
}

export interface DashboardResponse {
  team?: {
    id: number;
    name: string;
  };
  teamName?: string;
  attackingStats?: StatItem[];
  goalkeepingStats?: StatItem[];
  possessionStats?: StatItem[];
  passingStats?: StatItem[];
  defensiveStats?: StatItem[];
  miscStats?: StatItem[];
}
