import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureEditorComponent } from './picture-editor.component';

describe('PictureEditorComponent', () => {
  let component: PictureEditorComponent;
  let fixture: ComponentFixture<PictureEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
