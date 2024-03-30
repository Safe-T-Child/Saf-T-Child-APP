import { Component, HostListener, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../environment';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isMobile: boolean = window.innerWidth < windowBreakpoint;

  constructor(public matDialog: MatDialog) {}

  ngOnInit() {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
}
