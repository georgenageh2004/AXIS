export interface PlayerStats {
  PlayingTime: PlayingTimeStats;
  Attacking: AttackingStats;
  Defensive: DefensiveStats;
  Goalkeeping: GoalkeepingStats;
  Possession: PossessionStats;
  Miscellaneous: MiscStats;
  Passing: PassingStats;
}
export interface PlayingTimeStats {
  Matchesplayed: number;
  Gamesstarted: number;
  Minutesplayed: number;
  "90s": number;
}
export interface AttackingStats {
  GoalsScored: number;
  AssistsProvided: number;
  "Goals+Assists": number;
  Expectedgoals: number;
  Expectedassists:number;
  npxG: number;
  "G-PK": number;
}
export interface DefensiveStats {
  Totaltackles: number;
  Tackleswon: number;
  Blocksmade: number;
  Interceptions: number;
  "Tkl+Int": number;
  Clearances: number;
  Err: number;
}
export interface GoalkeepingStats {
  GoalsConceded: number;
  Savesmade: number;
  Savepercentage: number;
  Cleansheets: number;
  Cleansheetpercentage: number;
  Penaltiesfaced: number;
  Penaltysaves: number;
}
export interface PossessionStats {
  Touches: number;
  Carries: number;
  Progressiveruns: number;
  Miscontrols: number;
  Dis: number;
}
export interface MiscStats {
  Yellowcards: number;
  Redcards: number;
  Penaltieswon: number;
  Penaltiesconceded: number;
  Ballrecoveries: number;
}
export interface PassingStats {
  ProgressivePasses: number;
  Progressivecarries: number;
  Keypasses: number;
  PPA: number;
}