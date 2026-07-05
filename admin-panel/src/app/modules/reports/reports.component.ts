import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  selectedPeriod = '30';
  selectedClass  = '';

  classes = ['Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];

  summary = [
    { label:'Total Watch Hours', value:'28,560', change:'+18%', icon:'bi-clock-history',   color:'primary' },
    { label:'Avg Quiz Score',    value:'72.4%',  change:'+4%',  icon:'bi-trophy',          color:'success' },
    { label:'Active Students',   value:'1,142',  change:'+11%', icon:'bi-people',          color:'info'    },
    { label:'Completion Rate',   value:'64%',    change:'+7%',  icon:'bi-check-circle',    color:'warning' },
  ];

  topStudents = [
    { rank:1, name:'Anjali Patel',  class:'Class 12', score:98, videos:52, time:'84h' },
    { rank:2, name:'Sneha Verma',   class:'Class 11', score:95, videos:48, time:'76h' },
    { rank:3, name:'Priya Sharma',  class:'Class 10', score:91, videos:44, time:'68h' },
    { rank:4, name:'Rahul Gupta',   class:'Class 10', score:87, videos:40, time:'62h' },
    { rank:5, name:'Arjun Singh',   class:'Class 9',  score:83, videos:36, time:'55h' },
  ];

  subjectEngagement = [
    { subject:'Mathematics', views:4820, completionRate:71, avgScore:74, color:'#4e73df' },
    { subject:'Physics',     views:3940, completionRate:65, avgScore:68, color:'#f1416c' },
    { subject:'Chemistry',   views:3680, completionRate:60, avgScore:70, color:'#1cc88a' },
    { subject:'Biology',     views:3120, completionRate:75, avgScore:78, color:'#fd7e14' },
    { subject:'English',     views:2840, completionRate:82, avgScore:85, color:'#36b9cc' },
  ];

  weeklyEnrollments = [42, 65, 58, 80, 72, 95, 88, 102, 115, 98, 110, 125];
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  getBarHeight(val: number, max: number): string {
    return Math.round((val / max) * 100) + '%';
  }

  maxEnrollment = 125;
}
