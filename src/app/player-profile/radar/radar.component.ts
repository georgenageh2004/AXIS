import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexMarkers,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ChartComponent as NgApexChartComponent,
  NgApexchartsModule,
  ApexYAxis
} from 'ng-apexcharts';
import { environment } from '../../../environments/environment';

interface TechnicalStatsResponse {
  finishing?: number;
  creativity?: number;
  progression?: number;
  ballSecurity?: number;
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  markers: ApexMarkers;
  plotOptions: ApexPlotOptions;
  colors: string[];
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
};

@Component({
  selector: 'app-radar',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.css']
})
export class RadarComponent implements OnInit {
  @ViewChild('chart') chart!: NgApexChartComponent;

  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly API_BASE_URL = `${environment.apiBaseUrl}/api/PlayerProfile`;

  isLoading = true;
  errorMessage = '';

  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [{ name: 'Technical Stats', data: [0, 0, 0, 0] }],
      chart: {
        height: 360,
        width: '100%',
        type: 'radar',
        toolbar: { show: false },
        animations: {
          enabled: true,
          speed: 500,
          animateGradually: { enabled: true, delay: 80 },
          dynamicAnimation: { enabled: true, speed: 350 }
        }
      },
      colors: ['#6ddc6d'],
      plotOptions: {
        radar: {
          size: 136,
          polygons: {
            strokeColors: '#2f3a2f',
            connectorColors: '#263026',
            fill: {
              colors: ['#171a17', '#1d221d']
            }
          }
        }
      },
      stroke: {
        width: 3,
        curve: 'smooth'
      },
      fill: {
        opacity: 0.4,
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          gradientToColors: ['#4fbf81'],
          opacityFrom: 0.58,
          opacityTo: 0.2,
          stops: [0, 100]
        }
      },
      markers: {
        size: 5,
        strokeWidth: 2,
        strokeColors: '#1a1f1a',
        fillOpacity: 1,
        hover: {
          size: 7
        }
      },
      dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          borderRadius: 4,
          foreColor: '#e4ffe6',
          borderColor: '#356f4f',
          padding: 3,
          opacity: 0.72
        },
        style: {
          fontSize: '10px',
          fontWeight: '600'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: value => `${value.toFixed(1)} / 100`
        }
      },
      xaxis: {
        categories: ['Finishing', 'Creativity', 'Progression', 'Ball Security'],
        labels: {
          style: {
            colors: ['#c7d5c7', '#c7d5c7', '#c7d5c7', '#c7d5c7'],
            fontSize: '12px',
            fontWeight: '600'
          }
        }
      },
      yaxis: {
        tickAmount: 5,
        min: 0,
        max: 100,
        labels: {
          style: { colors: ['#8ea08e'], fontSize: '11px' }
        }
      }
    };
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.isLoading = false;
      this.errorMessage = 'Invalid player id.';
      return;
    }

    this.loadTechnicalStats(id);
  }

  private loadTechnicalStats(playerId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .get<TechnicalStatsResponse>(`${this.API_BASE_URL}/${playerId}/technical-stats`)
      .subscribe({
        next: stats => {
          this.chartOptions = {
            ...this.chartOptions,
            series: [
              {
                name: 'Technical Stats',
                data: [
                  this.toScore(stats.finishing),
                  this.toScore(stats.creativity),
                  this.toScore(stats.progression),
                  this.toScore(stats.ballSecurity)
                ]
              }
            ]
          };
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load technical stats.';
        }
      });
  }

  private toScore(value: number | undefined): number {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Number(value.toFixed(1))));
  }
}