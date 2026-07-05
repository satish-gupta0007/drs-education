/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SubjectsListComponent } from './subjects-list.component';
import { SubjectsService } from '../../core/services/subjects.service';
import { ClassesService } from '../../core/services/classes.service';
import { Subject as SubjectModel, Class as ClassModel } from '../../core/models';

describe('SubjectsListComponent', () => {
  let component: SubjectsListComponent;
  let fixture: ComponentFixture<SubjectsListComponent>;
  let subjectsService: jasmine.SpyObj<SubjectsService>;
  let classesService: jasmine.SpyObj<ClassesService>;

  beforeEach(async () => {
    subjectsService = jasmine.createSpyObj('SubjectsService', [
      'getSubjects',
      'createSubject',
      'updateSubject',
      'deleteSubject',
      'toggleStatus'
    ]);
    classesService = jasmine.createSpyObj('ClassesService', ['getClasses']);

    subjectsService.getSubjects.and.returnValue(of({ success: true, data: [] }));
    subjectsService.createSubject.and.returnValue(of({ success: true, data: {} as SubjectModel }));
    subjectsService.updateSubject.and.returnValue(of({ success: true, data: {} as SubjectModel }));
    subjectsService.deleteSubject.and.returnValue(of({ success: true, data: undefined as any }));
    subjectsService.toggleStatus.and.returnValue(of({ success: true, data: {} as SubjectModel }));
    classesService.getClasses.and.returnValue(of({ success: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [SubjectsListComponent],
      providers: [
        { provide: SubjectsService, useValue: subjectsService },
        { provide: ClassesService, useValue: classesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('maps a subject to its class id when editing from a class name payload', () => {
    component.classes.set([
      { id: 'class-1', name: 'Class 10' } as ClassModel
    ]);

    const subject = {
      id: 'subject-1',
      name: 'Mathematics',
      code: 'MATH',
      className: 'Class 10',
      description: 'Algebra',
      teacherName: 'Mr. Patel',
      color: '#4e73df',
      isActive: true,
      videoCount: 0,
      pdfCount: 0,
      quizCount: 0
    } as SubjectModel;

    component.openEditModal(subject);

    expect(component.currentSubject.classId).toBe('class-1');
  });

  it('allows submission when required values are present', () => {
    component.currentSubject = {
      name: 'Physics',
      code: 'PHY',
      classId: 'class-1',
      isActive: true
    } as Partial<SubjectModel>;

    expect(component.canSubmit()).toBeTrue();
  });

  it('submits a normalized payload for create', () => {
    component.currentSubject = {
      name: '  Chemistry  ',
      code: '  CHEM  ',
      classId: 'class-1',
      description: '  Organic chemistry  ',
      color: '#1cc88a',
      isActive: true
    } as Partial<SubjectModel>;

    component.onSubmit();

    expect(subjectsService.createSubject).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Chemistry',
      code: 'CHEM',
      classId: 'class-1',
      description: 'Organic chemistry',
      color: '#1cc88a',
      isActive: true
    }));
  });
});
