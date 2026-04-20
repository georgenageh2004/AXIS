import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService, SimilarPlayerCard } from '../../services/profile.service';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-similar-players',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './similar-players.component.html',
  styleUrls: ['./similar-players.component.css']
})
export class SimilarPlayersComponent implements OnChanges {
  @Input() playerId = 0;
  @ViewChild('swiperEl') swiperEl?: ElementRef<HTMLElement>;

  isLoading = false;
  errorMessage = '';
  players: SimilarPlayerCard[] = [];

  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['playerId']) {
      return;
    }

    if (!this.playerId || Number.isNaN(this.playerId)) {
      this.players = [];
      return;
    }

    this.loadSimilarPlayers(this.playerId);
  }

  previousSlide(): void {
    (this.swiperEl?.nativeElement as any)?.swiper?.slidePrev();
  }

  nextSlide(): void {
    (this.swiperEl?.nativeElement as any)?.swiper?.slideNext();
  }

  viewProfile(playerId: number): void {
    if (!playerId || Number.isNaN(playerId)) {
      return;
    }

    this.router.navigate(['/program/profile-details', playerId]);
  }

  getScoreLabel(score: number): string {
    const normalized = Math.max(0, Math.min(100, score));
    return normalized.toFixed(2);
  }

  getScoreFill(score: number): number {
    return Math.max(0, Math.min(100, score));
  }

  private loadSimilarPlayers(playerId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getSimilarPlayers(playerId).subscribe({
      next: players => {
        this.players = players;
        this.isLoading = false;
      },
      error: () => {
        this.players = [];
        this.errorMessage = 'Failed to load similar players.';
        this.isLoading = false;
      }
    });
  }
}
