import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface faqElement {
  key: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  expandedFaqKey: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      if (params['faq']) {
        this.expandedFaqKey = params['faq'];
      }
    });
  }

  faqs: faqElement[] = [
    {
      key: 'reset-password',
      question: 'How to reset password?',
      answer: `If you have an existing account and need to reset your password, 
        you can visit the <a href="/generate-reset-password">Reset Password</a> page and follow the instructions to reset your password.`,
    },
    {
      key: 'verify-email',
      question: 'How to verify my email?',
      answer: `If your email verificatio link has expired, you can request a new link after logging in.
      If you forgot your password follow these <a  href="/faq?faq=reset-password">instructions</a>.`,
    },
    {
      key: 'create-password',
      question: 'How to create a password?',
      answer: `If you have not created a password yet, you can 
       visit the <a href="/generate-reset-password">Reset Password</a> page and follow the instructions to reset/create your password.`,
    },
  ];
}
