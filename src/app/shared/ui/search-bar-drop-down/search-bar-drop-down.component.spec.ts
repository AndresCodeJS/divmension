import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarDropDownComponent } from './search-bar-drop-down.component';

describe('SearchBarDropDownComponent', () => {
  let component: SearchBarDropDownComponent;
  let fixture: ComponentFixture<SearchBarDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarDropDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBarDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
