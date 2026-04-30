import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { PlayersProfile } from '../Models/Players_profile';
import { ComparisonService } from '../services/comparison.service';
import { ProfileService } from '../services/profile.service';
import { ShortlistPlayer, ShortlistService } from '../services/shortlist.service';

interface CompareStatRow {
  label: string;
  values: number[];
}

interface CompareSection {
  title: string;
  rows: CompareStatRow[];
}

interface CompareMetric {
  label: string;
  value: (profile: PlayersProfile) => number;
}

interface CompareSectionDefinition {
  title: string;
  metrics: CompareMetric[];
}

const COMPARE_SECTIONS: CompareSectionDefinition[] = [
  {
    title: 'Playing Time',
    metrics: [
      { label: 'Matches Played', value: p => p.stats.PlayingTime.Matchesplayed },
      { label: 'Games Started', value: p => p.stats.PlayingTime.Gamesstarted },
      { label: 'Minutes Played', value: p => p.stats.PlayingTime.Minutesplayed },
      { label: '90s', value: p => p.stats.PlayingTime['90s'] }
    ]
  },
  {
    title: 'Attacking',
    metrics: [
      { label: 'Goals', value: p => p.stats.Attacking.GoalsScored },
      { label: 'Assists', value: p => p.stats.Attacking.AssistsProvided },
      { label: 'Goals + Assists', value: p => p.stats.Attacking['Goals+Assists'] },
      { label: 'Expected Goals', value: p => p.stats.Attacking.Expectedgoals },
      { label: 'Expected Assists', value: p => p.stats.Attacking.Expectedassists },
      { label: 'npxG', value: p => p.stats.Attacking.npxG },
      { label: 'G-PK', value: p => p.stats.Attacking['G-PK'] }
    ]
  },
  {
    title: 'Defensive',
    metrics: [
      { label: 'Total Tackles', value: p => p.stats.Defensive.Totaltackles },
      { label: 'Tackles Won', value: p => p.stats.Defensive.Tackleswon },
      { label: 'Blocks', value: p => p.stats.Defensive.Blocksmade },
      { label: 'Interceptions', value: p => p.stats.Defensive.Interceptions },
      { label: 'Tkl + Int', value: p => p.stats.Defensive['Tkl+Int'] },
      { label: 'Clearances', value: p => p.stats.Defensive.Clearances },
      { label: 'Errors', value: p => p.stats.Defensive.Err }
    ]
  },
  {
    title: 'Possession',
    metrics: [
      { label: 'Touches', value: p => p.stats.Possession.Touches },
      { label: 'Carries', value: p => p.stats.Possession.Carries },
      { label: 'Progressive Runs', value: p => p.stats.Possession.Progressiveruns },
      { label: 'Miscontrols', value: p => p.stats.Possession.Miscontrols },
      { label: 'Dispossessed', value: p => p.stats.Possession.Dis }
    ]
  },
  {
    title: 'Passing',
    metrics: [
      { label: 'Progressive Passes', value: p => p.stats.Passing.ProgressivePasses },
      { label: 'Progressive Carries', value: p => p.stats.Passing.Progressivecarries },
      { label: 'Key Passes', value: p => p.stats.Passing.Keypasses },
      { label: 'PPA', value: p => p.stats.Passing.PPA }
    ]
  }
];

@Component({
  selector: 'app-shortlist',
  standalone: true,
  imports: [MatIcon,NgFor,NgIf],
  templateUrl: './shortlist.component.html',
  styleUrl: './shortlist.component.css'
})
export class ShortlistComponent implements OnInit {
  shortlist: ShortlistPlayer[] = [];
  errorMessage = '';
  actionMessage = '';
  isLoading = false;
  isMutating = false;

  isCompareLayerOpen = false;
  isCompareLoading = false;
  compareErrorMessage = '';
  compareActionMessage = '';

  compareIds: number[] = [];
  compareProfiles: PlayersProfile[] = [];
  compareSections: CompareSection[] = [];
  private canSyncCompareWithShortlist = false;

  private shortlistService = inject(ShortlistService);
  private comparisonService = inject(ComparisonService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private readonly userId = this.shortlistService.resolveUserId();

  ngOnInit(): void {
    this.shortlistService
      .watchShortlist()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(list => {
        this.shortlist = list;

        if (this.canSyncCompareWithShortlist) {
          this.syncCompareWithShortlist();
        }
      });

    this.comparisonService
      .watchCompareIds()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ids => {
        this.compareIds = ids;
        this.loadCompareProfiles(ids);
      });

    this.loadShortlist();
  }

  remove(playerId: number): void {
    if (this.isMutating) {
      return;
    }

    this.isMutating = true;
    this.actionMessage = '';
    this.errorMessage = '';

    this.shortlistService
      .removeFromShortlist(this.userId, playerId)
      .pipe(
        finalize(() => {
          this.isMutating = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: message => {
          this.actionMessage = message;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }

  clearAll(): void {
    if (this.isMutating || this.shortlist.length === 0) {
      return;
    }

    this.isMutating = true;
    this.actionMessage = '';
    this.errorMessage = '';

    this.shortlistService
      .clearShortlist(this.userId)
      .pipe(
        finalize(() => {
          this.isMutating = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: message => {
          this.actionMessage = message;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }

  viewProfile(playerId: number): void {
    if (!playerId) {
      return;
    }

    this.router.navigate(['/program/profile-details', playerId]);
  }

  openCompareLayer(playerId?: number): void {
    this.compareErrorMessage = '';
    this.compareActionMessage = '';

    if (playerId) {
      const result = this.comparisonService.addPlayer(playerId);
      if (!result.success) {
        this.compareErrorMessage = result.message;
      } else {
        this.compareActionMessage = result.message;
      }
    }

    this.isCompareLayerOpen = true;
  }

  closeCompareLayer(): void {
    this.isCompareLayerOpen = false;
  }

  addToComparison(playerId: number): void {
    this.compareErrorMessage = '';
    this.compareActionMessage = '';

    const result = this.comparisonService.addPlayer(playerId);
    if (!result.success) {
      this.compareErrorMessage = result.message;
      return;
    }

    this.compareActionMessage = result.message;
  }

  removeFromComparison(playerId: number): void {
    this.comparisonService.removePlayer(playerId);
    this.compareErrorMessage = '';
    this.compareActionMessage = 'Player removed from comparison.';
  }

  clearComparison(): void {
    this.comparisonService.clear();
    this.compareErrorMessage = '';
    this.compareActionMessage = 'Comparison cleared.';
  }

  isInComparison(playerId: number): boolean {
    return this.compareIds.includes(playerId);
  }

  isCompareFull(): boolean {
    return this.compareIds.length >= 4;
  }

  canAddToComparison(playerId: number): boolean {
    return !this.isInComparison(playerId) && !this.isCompareFull();
  }

  getCompareProfileById(playerId: number): PlayersProfile | undefined {
    return this.compareProfiles.find(profile => profile.id === playerId);
  }

  get compareCanRenderTable(): boolean {
    return this.compareProfiles.length >= 2;
  }

  private loadShortlist(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.shortlistService
      .getUserShortlist(this.userId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.canSyncCompareWithShortlist = true;
          this.syncCompareWithShortlist();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }

  private syncCompareWithShortlist(): void {
    const shortlistIds = new Set(this.shortlist.map(item => item.playerId));
    const filtered = this.compareIds.filter(id => shortlistIds.has(id));

    if (filtered.length !== this.compareIds.length) {
      this.comparisonService.replaceIds(filtered);
    }
  }

  private loadCompareProfiles(ids: number[]): void {
    if (ids.length === 0) {
      this.compareProfiles = [];
      this.compareSections = [];
      return;
    }

    this.isCompareLoading = true;
    this.compareErrorMessage = '';

    const requests = ids.map(id =>
      this.profileService.getPlayerById(id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.isCompareLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(results => {
        const loadedProfiles = results.filter((profile): profile is PlayersProfile => profile !== null);

        this.compareProfiles = ids
          .map(id => loadedProfiles.find(profile => profile.id === id))
          .filter((profile): profile is PlayersProfile => profile !== undefined);

        this.compareSections = this.buildCompareSections(this.compareProfiles);

        if (loadedProfiles.length !== ids.length) {
          this.compareErrorMessage = 'Some players could not be loaded with full details.';
        }
      });
  }

  private buildCompareSections(profiles: PlayersProfile[]): CompareSection[] {
    return COMPARE_SECTIONS.map(section => ({
      title: section.title,
      rows: section.metrics.map(metric => ({
        label: metric.label,
        values: profiles.map(profile => metric.value(profile))
      }))
    }));
  }
}

