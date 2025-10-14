import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaceDetailPage } from './place-detail.page';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PlaceDetailPage', () => {
  let component: PlaceDetailPage;
  let fixture: ComponentFixture<PlaceDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceDetailPage, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } }, queryParamMap: { get: () => null } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal when thumbnail clicked (openImage)', () => {
    component.openImage('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1');
    expect(component.showModal).toBeTrue();
    expect(component.selectedImage).toBeTruthy();
  });
});
