import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActFbTasksComponent } from './act-fb-tasks.component';

describe('ActFbTasksComponent', () => {
  let component: ActFbTasksComponent;
  let fixture: ComponentFixture<ActFbTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActFbTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActFbTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
