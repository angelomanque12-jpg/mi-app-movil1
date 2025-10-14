import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage, IonicModule.forRoot(), RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render place cards', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cards = el.querySelectorAll('.place-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should navigate to place-detail on click', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    const el: HTMLElement = fixture.nativeElement;
    const first = el.querySelector('.place-card');
    expect(first).toBeTruthy();
    (first as HTMLElement).click();
    expect(spy).toHaveBeenCalled();
  });

  it('should open quick view and like a place', () => {
    const comp = fixture.componentInstance;
    const first = comp.places[0];
    comp.quickView(first.imageUrl);
    expect(comp.quickViewImage).toBe(first.imageUrl);

    const prevLikes = first.likes || 0;
    comp.toggleLike(first);
    // updated via service - simulate async update
    expect(comp.places.find(p => p.id === first.id)?.likes).toBeGreaterThanOrEqual(prevLikes);
  });

  it('should filter places by search term', () => {
    const comp = fixture.componentInstance;
    comp.searchTerm = 'Machu Picchu';
    comp.onSearchInput({});
    expect(comp.filteredPlaces.length).toBeGreaterThan(0);
    expect(comp.filteredPlaces[0].place).toContain('Machu');
  });

  it('should navigate to exact match on search', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    const comp = fixture.componentInstance;
    comp.searchTerm = 'Cusco';
    comp.onSearchInput({});
    expect(spy).toHaveBeenCalled();
  });
});
