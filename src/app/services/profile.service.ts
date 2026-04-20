import { inject, Injectable } from '@angular/core';
import { PlayersProfile } from '../Models/Players_profile';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

interface PlayerProfileApiResponse {
  playerId: number;
  name: string;
  position: string;
  age: number;
  nationality: string;
  imageUrl: string;
  clubName: string;
  leagueName?: string;
  playingTime: {
    matchesPlayed: number;
    minutesPlayed: number;
    ninetiesCompleted: number;
    gamesStarted: number;
  };
  attacking: {
    goals: number;
    assists: number;
    gPlusA: number;
    expectedGoals: number;
    expectedAssists: number;
    npxG: number;
    gMinusPK: number;
  };
  defensive: {
    totalTackles: number;
    tacklesWon: number;
    blocksMade: number;
    interceptions: number;
    tklPlusInt: number;
    clearances: number;
    err: number;
  };
  goalkeeping: {
    goalsConceded: number;
    savesMade: number;
    savePercentage: number;
    cleanSheets: number;
    cleanSheetPercentage: number;
    penaltiesFaced: number;
    penaltySaves: number;
  };
  possession: {
    touches: number;
    carries: number;
    progressiveRuns: number;
    miscontrols: number;
    timeDispossessed: number;
  };
  miscellaneous: {
    yellowCards: number;
    redCards: number;
    penaltiesWon: number;
    penaltiesConceded: number;
    ballRecoveries: number;
  };
  passing: {
    progressivePasses: number;
    progressiveCarries: number;
    keyPasses: number;
    ppa: number;
  };
}

interface SimilarPlayerApiResponse {
  playerId: number;
  name: string;
  position: string;
  nationality: string;
  imageUrl: string;
  clubName: string;
  similarityScore: number;
}

interface SimilarPlayersApiEnvelope {
  data?: SimilarPlayerApiResponse[];
  Data?: SimilarPlayerApiResponse[];
  items?: SimilarPlayerApiResponse[];
  Items?: SimilarPlayerApiResponse[];
  similarPlayers?: SimilarPlayerApiResponse[];
  SimilarPlayers?: SimilarPlayerApiResponse[];
}

export interface SimilarPlayerCard {
  id: number;
  name: string;
  position: string;
  nationality: string;
  image: string;
  club: string;
  similarityScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE_URL = `${environment.apiBaseUrl}/api/PlayerProfile`;

  getPlayerById(id: number) {
    return this.http
      .get<PlayerProfileApiResponse>(`${this.API_BASE_URL}/${id}`)
      .pipe(map(response => this.mapApiToProfile(response)));
  }

  getSimilarPlayers(id: number) {
    return this.http
      .get<SimilarPlayerApiResponse[] | SimilarPlayersApiEnvelope | SimilarPlayerApiResponse>(`${this.API_BASE_URL}/${id}/similar`)
      .pipe(
        map(response => {
          const players = this.normalizeSimilarPlayersResponse(response);

          return players.map(player => ({
            id: player.playerId,
            name: player.name,
            position: player.position,
            nationality: player.nationality,
            image: player.imageUrl,
            club: player.clubName,
            similarityScore: Number(player.similarityScore ?? 0)
          }));
        })
      );
  }

  private normalizeSimilarPlayersResponse(
    response: SimilarPlayerApiResponse[] | SimilarPlayersApiEnvelope | SimilarPlayerApiResponse
  ): SimilarPlayerApiResponse[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (this.isSimilarPlayer(response)) {
      return [response];
    }

    const directEnvelope =
      response.data ??
      response.Data ??
      response.items ??
      response.Items ??
      response.similarPlayers ??
      response.SimilarPlayers;

    const fromDirectEnvelope = this.extractSimilarPlayersFromUnknown(directEnvelope);
    if (fromDirectEnvelope.length > 0) {
      return fromDirectEnvelope;
    }

    return this.extractSimilarPlayersFromUnknown(response);
  }

  private extractSimilarPlayersFromUnknown(value: unknown): SimilarPlayerApiResponse[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter(item => this.isSimilarPlayer(item)) as SimilarPlayerApiResponse[];
    }

    if (this.isSimilarPlayer(value)) {
      return [value];
    }

    if (typeof value !== 'object') {
      return [];
    }

    const record = value as Record<string, unknown>;

    const valuesArray = record['$values'];
    if (Array.isArray(valuesArray)) {
      const mapped = valuesArray.filter(item => this.isSimilarPlayer(item)) as SimilarPlayerApiResponse[];
      if (mapped.length > 0) {
        return mapped;
      }
    }

    for (const nestedValue of Object.values(record)) {
      const extracted = this.extractSimilarPlayersFromUnknown(nestedValue);
      if (extracted.length > 0) {
        return extracted;
      }
    }

    return [];
  }

  private isSimilarPlayer(value: unknown): value is SimilarPlayerApiResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<SimilarPlayerApiResponse>;
    return typeof candidate.playerId === 'number' && typeof candidate.name === 'string';
  }

  private mapApiToProfile(api: PlayerProfileApiResponse): PlayersProfile {
    return {
      id: api.playerId,
      name: api.name,
      position: api.position,
      image: api.imageUrl,
      age: api.age,
      nationality: api.nationality,
      club: api.clubName,
      league: api.leagueName ?? '-',
      stats: {
        PlayingTime: {
          Matchesplayed: api.playingTime.matchesPlayed,
          Gamesstarted: api.playingTime.gamesStarted,
          Minutesplayed: api.playingTime.minutesPlayed,
          '90s': api.playingTime.ninetiesCompleted
        },
        Attacking: {
          GoalsScored: api.attacking.goals,
          AssistsProvided: api.attacking.assists,
          'Goals+Assists': api.attacking.gPlusA,
          Expectedgoals: api.attacking.expectedGoals,
          Expectedassists: api.attacking.expectedAssists,
          npxG: api.attacking.npxG,
          'G-PK': api.attacking.gMinusPK
        },
        Defensive: {
          Totaltackles: api.defensive.totalTackles,
          Tackleswon: api.defensive.tacklesWon,
          Blocksmade: api.defensive.blocksMade,
          Interceptions: api.defensive.interceptions,
          'Tkl+Int': api.defensive.tklPlusInt,
          Clearances: api.defensive.clearances,
          Err: api.defensive.err
        },
        Goalkeeping: {
          GoalsConceded: api.goalkeeping.goalsConceded,
          Savesmade: api.goalkeeping.savesMade,
          Savepercentage: api.goalkeeping.savePercentage,
          Cleansheets: api.goalkeeping.cleanSheets,
          Cleansheetpercentage: api.goalkeeping.cleanSheetPercentage,
          Penaltiesfaced: api.goalkeeping.penaltiesFaced,
          Penaltysaves: api.goalkeeping.penaltySaves
        },
        Possession: {
          Touches: api.possession.touches,
          Carries: api.possession.carries,
          Progressiveruns: api.possession.progressiveRuns,
          Miscontrols: api.possession.miscontrols,
          Dis: api.possession.timeDispossessed
        },
        Miscellaneous: {
          Yellowcards: api.miscellaneous.yellowCards,
          Redcards: api.miscellaneous.redCards,
          Penaltieswon: api.miscellaneous.penaltiesWon,
          Penaltiesconceded: api.miscellaneous.penaltiesConceded,
          Ballrecoveries: api.miscellaneous.ballRecoveries
        },
        Passing: {
          ProgressivePasses: api.passing.progressivePasses,
          Progressivecarries: api.passing.progressiveCarries,
          Keypasses: api.passing.keyPasses,
          PPA: api.passing.ppa
        }
      }
    };
  }

}
