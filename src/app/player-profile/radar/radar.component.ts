import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ChartComponent as NgApexChartComponent,
  NgApexchartsModule,
  ApexYAxis
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis:ApexYAxis
  // title: ApexTitleSubtitle;
 
};

@Component({
  selector: 'app-radar',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.css']
})
export class RadarComponent {
  @ViewChild('chart') chart!: NgApexChartComponent;

  public chartOptions: ChartOptions; // ✅ مهم: مش Partial

  constructor() {
    this.chartOptions = {
  series: [
    { name: 'MO Salah', data: [85, 92, 78, 88, 70, 95] }
  ],
  chart: {
    height:300,//هيكبر مع container
  width: 600,
  type: 'radar',
 
  toolbar: { show: false}
},
  // title: {
  //   text: 'Player Performance',
  //   align: 'center',
  //   style: {
  //     fontSize: '12px',
  //     fontWeight: 'bold',
  //     color: '#6ddc6d'
  //   }
  //},
  xaxis: {
    categories: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'],
    labels: {
      style: { colors: ['#bfbfbf'], fontSize: '12px', fontWeight: '600' }
    }
  },
  yaxis: {
    tickAmount: 5, // عدد الخطوط الداخلية
    labels: {
      style: { colors: ['#bfbfbf'], fontSize: '14px' }
    }
  },
  

};
  }
}