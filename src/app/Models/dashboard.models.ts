export interface StatItem {
  playerName: string;
  metric: string;
  value: number;
}

export interface DashboardResponse {
  teamName?: string;
  attackingStats?: StatItem[];
  goalkeepingStats?: StatItem[];
  possessionStats?: StatItem[];
  passingStats?: StatItem[];
  defensiveStats?: StatItem[];
  miscStats?: StatItem[];
}
