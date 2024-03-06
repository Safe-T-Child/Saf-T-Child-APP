import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TestingModule } from './testing.module';
import { FooterComponent } from './_components/footer/footer.component';
import { DesktopHeaderComponent } from './desktop-view/_components/desktop-header/desktop-header.component';
import { MobileHeaderComponent } from './mobile-view/_components/mobile-header/mobile-header.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, TestingModule],
      declarations: [
        AppComponent,
        FooterComponent,
        DesktopHeaderComponent,
        MobileHeaderComponent,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'saf-t-child'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('saf-t-child');
  });
});
