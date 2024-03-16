import { Component, HostListener, Input, OnInit } from '@angular/core';
import { windowBreakpoint } from '../../../../environment';
import { SafTChildProxyService } from '../../_services/saft-t-child.service.proxy';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  providers: [SafTChildProxyService],
})
export class AboutComponent implements OnInit {
  // Class binding property
  contentActive = false;
  showInvalidLogin = false;
  isLoading = false;

  isMobile: boolean = window.innerWidth < windowBreakpoint; // Example breakpoint

  ngOnInit() {
    this.contentActive = true;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < windowBreakpoint;
  }
  constructor(
    private SafTChildProxyService: SafTChildProxyService,
    private fb: FormBuilder,
    private router: Router,
  ) {}
}
