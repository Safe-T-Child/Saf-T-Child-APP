// testing.module.ts
import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// Import other common modules, components, pipes, etc., as needed.

@NgModule({
  imports: [
    CommonModule,
    HttpClientTestingModule,
    ReactiveFormsModule,
    RouterTestingModule,
    MatAutocompleteModule,

    // Add other modules here.
  ],
  exports: [
    // Export them so they can be used in the tests.
    CommonModule,
    HttpClientTestingModule,
    ReactiveFormsModule,
    RouterTestingModule,
    MatAutocompleteModule,
    // Add other modules here.
  ],
  // Declare and export components/pipes if needed.
})
export class TestingModule {}
