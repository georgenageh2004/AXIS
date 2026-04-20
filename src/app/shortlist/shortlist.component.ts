import { Component, inject } from '@angular/core';
import { ShortlistItem } from '../Models/players';
import { MatIcon } from '@angular/material/icon';
import { CartService } from '../services/cart.service';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shortlist',
  standalone: true,
  imports: [MatIcon,NgFor,NgIf],
  templateUrl: './shortlist.component.html',
  styleUrl: './shortlist.component.css'
})
export class ShortlistComponent {
shortlist: ShortlistItem[] = [];
  private shortlistService = inject(CartService);
  private router = inject(Router);

   ngOnInit(): void {
    this.shortlistService.getShortlist().subscribe(list => this.shortlist = list);
  }

  remove(playerId: number) {
    this.shortlistService.removeFromShortlist(playerId);
  }

  clearAll() {
    this.shortlistService.clearShortlist();
  }

  viewProfile(playerId: number): void {
    if (!playerId) {
      return;
    }

    this.router.navigate(['/program/profile-details', playerId]);
  }
  }

