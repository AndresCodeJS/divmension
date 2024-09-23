import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikeHeartComponent } from './like-heart.component';

describe('LikeHeartComponent', () => {
  let component: LikeHeartComponent;
  let fixture: ComponentFixture<LikeHeartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikeHeartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LikeHeartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
