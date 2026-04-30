import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { DashboardResponse, StatItem } from '../Models/dashboard.models';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.css']
})
export class DashbordComponent implements OnInit {
  loading = true;
  error: string | null = null;
  data: DashboardResponse | null = null;
  selectedTeamId = '2';
  maxValues: Partial<Record<StatKey, number>> = {};
  defensiveSplit: SplitRows = { left: [], right: [] };
  miscSplit: SplitRows = { left: [], right: [] };

  readonly sections: { key: StatKey; title: string }[] = [
    { key: 'attackingStats', title: 'Attacking Stats' },
    { key: 'goalkeepingStats', title: 'Goalkeeping Stats' },
    { key: 'possessionStats', title: 'Possession Stats' },
    { key: 'passingStats', title: 'Passing Stats' }
  ];

  constructor(private svc: DashboardService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.selectedTeamId = this.resolveTeamId();
    this.load(this.selectedTeamId);
  }

  load(teamId: string): void {
    this.loading = true;
    this.error = null;
    this.svc.fetchDashboard(teamId).subscribe({
      next: (res) => {
        this.data = res;
        this.maxValues = this.computeMaxValues(res);
        this.defensiveSplit = this.splitRows(this.getRows('defensiveStats'), 'tkl');
        this.miscSplit = this.splitRows(this.getRows('miscStats'));
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to load dashboard.';
        this.loading = false;
      }
    });
  }

  hasRows(arr?: StatItem[]): boolean {
    return !!arr && arr.length > 0;
  }

  getRows(key: StatKey): StatItem[] {
    return this.data?.[key] ?? [];
  }

  isTop(row: StatItem, key: StatKey): boolean {
    const max = this.maxValues[key];
    return typeof max === 'number' && row.value === max;
  }

  formatValue(value: number): string {
    return Intl.NumberFormat().format(value);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private resolveTeamId(): string {
    const fromParam = this.route.snapshot.paramMap.get('teamId');
    const fromQuery = this.route.snapshot.queryParamMap.get('teamId');
    const resolved = (fromParam || fromQuery || '2').trim();
    return resolved.length ? resolved : '2';
  }

  private computeMaxValues(data: DashboardResponse): Partial<Record<StatKey, number>> {
    const keys: StatKey[] = [
      'attackingStats',
      'goalkeepingStats',
      'possessionStats',
      'passingStats',
      'defensiveStats',
      'miscStats'
    ];
    return keys.reduce((acc, key) => {
      const rows = data[key] ?? [];
      acc[key] = rows.length ? Math.max(...rows.map((r: StatItem) => r.value)) : undefined;
      return acc;
    }, {} as Partial<Record<StatKey, number>>);
  }

  private splitRows(rows: StatItem[], metricToken?: string): SplitRows {
    if (!rows || rows.length === 0) {
      return { left: [], right: [] };
    }

    let splitIndex = -1;
    if (metricToken) {
      const token = metricToken.toLowerCase();
      splitIndex = rows.findIndex((row) => row.metric.toLowerCase().includes(token));
    }

    if (splitIndex <= 0 || splitIndex >= rows.length) {
      splitIndex = Math.ceil(rows.length / 2);
    }

    return {
      left: rows.slice(0, splitIndex),
      right: rows.slice(splitIndex)
    };
  }
}

type StatKey =
  | 'attackingStats'
  | 'goalkeepingStats'
  | 'possessionStats'
  | 'passingStats'
  | 'defensiveStats'
  | 'miscStats';

interface SplitRows {
  left: StatItem[];
  right: StatItem[];
}
