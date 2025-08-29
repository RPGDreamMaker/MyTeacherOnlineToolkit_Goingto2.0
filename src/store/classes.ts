import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  students: Student[];
  absentStudents: string[];
}

interface ClassesState {
  classes: Class[];
  addClass: (newClass: Omit<Class, 'id' | 'displayOrder' | 'students'>) => void;
  updateClass: (classId: string, updates: Partial<Omit<Class, 'id' | 'students'>>) => void;
  deleteClass: (classId: string) => void;
  moveClass: (classId: string, direction: 'left' | 'right') => void;
  addStudent: (classId: string, student: Omit<Student, 'id'>) => void;
  updateStudent: (classId: string, studentId: string, updates: Omit<Student, 'id'>) => void;
  deleteStudent: (classId: string, studentId: string) => void;
  importStudents: (classId: string, students: Omit<Student, 'id'>[]) => void;
  toggleStudentAbsent: (classId: string, studentId: string) => void;
  isStudentAbsent: (classId: string, studentId: string) => boolean;
}

export const useClassesStore = create<ClassesState>()(
  persist(
    (set, get) => ({
      classes: [],
      addClass: (newClass) => set((state) => ({
        classes: [...state.classes, {
          ...newClass,
          id: crypto.randomUUID(),
          displayOrder: (state.classes.length + 1) * 10,
          students: [],
          absentStudents: []
        }]
      })),
      updateClass: (classId, updates) => set((state) => ({
        classes: state.classes.map((c) => 
          c.id === classId ? { ...c, ...updates } : c
        )
      })),
      deleteClass: (classId) => set((state) => ({
        classes: state.classes.filter((c) => c.id !== classId)
      })),
      moveClass: (classId, direction) => set((state) => {
        const index = state.classes.findIndex((c) => c.id === classId);
        if (index === -1) return state;

        const newIndex = direction === 'left' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= state.classes.length) return state;

        const newClasses = [...state.classes];
        const [movedClass] = newClasses.splice(index, 1);
        newClasses.splice(newIndex, 0, movedClass);

        return {
          classes: newClasses.map((c, i) => ({
            ...c,
            displayOrder: (i + 1) * 10
          }))
        };
      }),
      addStudent: (classId, student) => set((state) => ({
        classes: state.classes.map((c) => 
          c.id === classId 
            ? {
                ...c,
                students: [...c.students, { ...student, id: crypto.randomUUID() }]
              }
            : c
        )
      })),
      updateStudent: (classId, studentId, updates) => set((state) => ({
        classes: state.classes.map((c) => 
          c.id === classId 
            ? {
                ...c,
                students: c.students.map((s) => 
                  s.id === studentId ? { ...s, ...updates } : s
                )
              }
            : c
        )
      })),
      deleteStudent: (classId, studentId) => set((state) => ({
        classes: state.classes.map((c) => 
          c.id === classId 
            ? {
                ...c,
                students: c.students.filter((s) => s.id !== studentId)
              }
            : c
        )
      })),
      importStudents: (classId, students) => set((state) => ({
        classes: state.classes.map((c) => 
          c.id === classId 
            ? {
                ...c,
                students: [
                  ...c.students,
                  ...students.map(student => ({
                    ...student,
                    id: crypto.randomUUID()
                  }))
                ]
              }
            : c
        )
      })),
      toggleStudentAbsent: (classId, studentId) => set((state) => ({
        classes: state.classes.map((c) => 
          c.id === classId 
            ? {
                ...c,
                absentStudents: c.absentStudents?.includes(studentId)
                  ? c.absentStudents.filter(id => id !== studentId)
                  : [...(c.absentStudents || []), studentId]
              }
            : c
        )
      })),
      isStudentAbsent: (classId, studentId) => {
        const state = get();
        const classData = state.classes.find(c => c.id === classId);
        return classData?.absentStudents?.includes(studentId) || false;
      }
    }),
    {
      name: 'classes-storage'
    }
  )
);