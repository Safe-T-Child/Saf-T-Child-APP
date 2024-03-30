import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalGuardService } from '../../../_services/modal-guard.service';
import _ from 'lodash';
import { CarvanaProxyService } from '../../../_services/carvana.service.proxy';
import { Observable, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import * as Carvana from '../../../_models/carvana';
import { NamedDocumentKey } from '../../../_models/base';
import * as SafTChildCore from '../../../_models/Saf-T-Child';
import { Router } from '@angular/router';
import { SafTChildProxyService } from '../../../_services/saf-t-child.service.proxy';
import { UserAuthenticationService } from '../../../_services/user-authentication.service';

@Component({
  selector: 'app-vehicles-modal',
  templateUrl: './vehicles-modal.component.html',
  styleUrl: './vehicles-modal.component.scss',
  providers: [CarvanaProxyService],
})
export class VehiclesModalComponent implements OnInit, OnDestroy {
  user: NamedDocumentKey = {
    id: this.userAuthenticationService.getUserId() || '',
    name: this.userAuthenticationService.getFirstName() || '',
  };
  name: FormControl<string | null> = new FormControl<string | null>(
    null,
    Validators.required,
  );
  make: FormControl<string | null> = new FormControl<string | null>(
    null,
    Validators.required,
  );
  model: FormControl<string | null> = new FormControl<string | null>(
    null,
    Validators.required,
  );
  year: FormControl<number | null> = new FormControl<number | null>(
    null,
    Validators.required,
  );
  color: FormControl<string | null> = new FormControl<string | null>(
    null,
    Validators.required,
  );
  licensePlate: FormControl<string | null> = new FormControl<string | null>(
    null,
    Validators.required,
  );
  carSuggestion: FormControl<string | null> = new FormControl<string | null>(
    null,
  );

  filteredOptions: Observable<Carvana.Suggestion[]> = of(
    [] as Carvana.Suggestion[],
  );

  form: FormGroup = new FormGroup({
    name: this.name,
    make: this.make,
    model: this.model,
    year: this.year,
    color: this.color,
    licensePlate: this.licensePlate,
  });
  constructor(
    public dialogRef: MatDialogRef<VehiclesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private modalGuardService: ModalGuardService,
    private carvanaProxyService: CarvanaProxyService,
    private safTChildProxyService: SafTChildProxyService,
    private router: Router,
    private userAuthenticationService: UserAuthenticationService,
  ) {
    this.form.valueChanges.subscribe((form) => {
      if (!form) {
        return;
      }
      if (_.every(form, _.isEmpty)) {
        return;
      }
      // Avoid saving empty form state
      // this.saveFormState();
    });
    // this.restoreFormState();

    this.filteredOptions = this.carSuggestion.valueChanges.pipe(
      startWith(''),
      // Use switchMap to handle the observable from getSuggestions
      switchMap((term) =>
        term ? this.filterCars(term) : of([] as Carvana.Suggestion[]),
      ),
    );

    this.carSuggestion.valueChanges.subscribe((value) => {
      //if value is not null or a string
      if (value !== null && typeof value !== 'string') {
        this.populateVehicleData(value);
      }
    });
  }

  populateVehicleData(suggestion: Carvana.Suggestion): void {
    if (suggestion) {
      this.make.setValue(null);
      this.model.setValue(null);
      this.color.setValue(null);
      this.year.setValue(null);

      const make = suggestion.filters.makes
        ? suggestion.filters.makes[0].name
        : '';
      const model =
        suggestion.filters.makes && suggestion.filters.makes[0].parentModels
          ? suggestion.filters.makes[0].parentModels[0].name
          : '';
      const color = suggestion.filters.colors
        ? suggestion.filters.colors[0]
        : '';
      const year = suggestion.filters.year ? suggestion.filters.year.min : '';

      if (make) {
        this.make.setValue(make);
      }
      if (model) {
        this.model.setValue(model);
      }
      if (color) {
        this.color.setValue(color);
      }
      if (year) {
        this.year.setValue(year);
      }
    }
  }

  saveFormState(): void {
    localStorage.setItem('formState', JSON.stringify(this.form.value));
  }

  restoreFormState(): void {
    const savedFormState = JSON.parse(
      localStorage.getItem('formState') || '{}',
    );
    if (!_.isEmpty(savedFormState)) {
      this.form.patchValue(savedFormState);
      this.form.markAsDirty();
    }
  }

  clearDataFromLocalstorage(): void {
    localStorage.removeItem('formState');
  }

  ngOnInit(): void {
    window.addEventListener(
      'beforeunload',
      this.preventUnsavedChanges.bind(this),
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener(
      'beforeunload',
      this.preventUnsavedChanges.bind(this),
    );
  }

  onSave() {
    const formControls = this.form.controls;
    const vehicle: SafTChildCore.Vehicle = {
      name: '',                                                                                               
      make: '',
      model: '',
      year: 0, //just a placeholder
      color: '',
      licensePlate: '',
      owner: { 
        id: '',
        name: '',
      }
    };

    vehicle.name = formControls['name'].value;
    vehicle.make = formControls['make'].value;
    vehicle.model = formControls['model'].value;
    vehicle.year = formControls['year'].value;
    vehicle.color = formControls['color'].value;
    vehicle.licensePlate = formControls['licensePlate'].value;
    vehicle.owner = this.user;

    //Endpoint setup for updating the information, just not working yet
    // this.safTChildProxyService.updateVehicle(vehicle).subscribe({
    //   next: (updatedVehicle) => {
    //     this.clearDataFromLocalstorage();
    //     this.dialogRef.close({
    //       action: 'save',
    //       data: updatedVehicle,
    //     });
    //   },
    //   error: (error) => {
    //     console.error('Error updating vehicle', error);
    //   },
    // });

    this.safTChildProxyService.insertNewVehicle(vehicle).subscribe({
      next: (vehicle) => {
        this.dialogRef.close({
        });
      },
      error: (e) => {
        console.log('error occured');
        console.log(e);
      },
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  preventUnsavedChanges(event: BeforeUnloadEvent): void {
    if (this.form.dirty) {
      event.returnValue = true; // Chrome requires returnValue to be set
    }
  }
  displayFn(suggestion: Carvana.Suggestion): string {
    return suggestion && suggestion.text ? suggestion.text : '';
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      switchMap((term) => (term === '' ? [] : this.filterCars(term))),
    );

  private filterCars(term: string): Observable<Carvana.Suggestion[]> {
    return this.carvanaProxyService
      .getSuggestions(term)
      .pipe(map((results) => results.suggestions.slice(0, 10)));
  }

  onClose(): void {
    if (this.modalGuardService.canDeactivate(this.form)) {
      this.clearDataFromLocalstorage();
      this.dialogRef.close({
        action: 'close',
        data: null, // Or any other data you wish to return
      });
    }
  }
}
