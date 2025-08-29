import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Seat {
  studentId: string;
  row: number;
  col: number;
}

interface GridSettings {
  rows: number;
  cols: number;
}

interface SeatingPlan {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
  seats: Seat[];
  gridSettings: GridSettings;
  classId: string;
  scores: Record<string, number>;
  selectedStudents?: string[];
}

interface SeatingState {
  students: Record<string, Student[]>;
  currentPlanId: string | null;
  plans: SeatingPlan[];
  
  // Actions
  createPlan: (name: string, description: string, classId: string) => void;
  copyPlan: (sourcePlanId: string, name: string, description: string, resetScores: boolean) => void;
  updatePlan: (planId: string, updates: Partial<Omit<SeatingPlan, 'id' | 'createdAt'>>) => void;
  deletePlan: (planId: string) => void;
  switchPlan: (planId: string | null) => void;
  updateSeat: (studentId: string, row: number | null, col: number | null) => void;
  updateGridSettings: (settings: GridSettings) => void;
  resetSeating: () => void;
  getStudent: (id: string, classId: string) => Student | undefined;
  initialize: (classId: string, students: Student[]) => void;
  updateStudentScore: (studentId: string, classId: string, delta: number) => void;
  updateAllStudentScores: (delta: number) => void;
  setAllStudentScores: (score: number) => void;
  getRandomStudents: (count: number, minScore: number, maxScore: number) => void;
  getRandomStudentsFromSides: () => void;
  clearSelectedStudents: () => void;
  
  // Computed
  getCurrentPlan: () => SeatingPlan | null;
  getUnassignedStudents: (classId: string) => Student[];
  getPlansForClass: (classId: string) => SeatingPlan[];
}

export const useSeatingStore = create<SeatingState>()(
  persist(
    (set, get) => ({
      students: {},
      currentPlanId: null,
      plans: [],

      createPlan: (name, description, classId) => {
        const newPlan: SeatingPlan = {
          id: crypto.randomUUID(),
          name,
          description,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          seats: [],
          gridSettings: { rows: 4, cols: 8 },
          classId,
          scores: {}
        };

        set(state => ({
          plans: [...state.plans, newPlan],
          currentPlanId: newPlan.id
        }));
      },

      copyPlan: (sourcePlanId, name, description, resetScores) => {
        const sourcePlan = get().plans.find(p => p.id === sourcePlanId);
        if (!sourcePlan) return;

        const newPlan: SeatingPlan = {
          id: crypto.randomUUID(),
          name,
          description,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          seats: [...sourcePlan.seats],
          gridSettings: { ...sourcePlan.gridSettings },
          classId: sourcePlan.classId,
          scores: resetScores ? {} : { ...sourcePlan.scores }
        };

        set(state => ({
          plans: [...state.plans, newPlan],
          currentPlanId: newPlan.id
        }));
      },

      updatePlan: (planId, updates) => {
        set(state => ({
          plans: state.plans.map(plan => 
            plan.id === planId
              ? {
                  ...plan,
                  ...updates,
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      deletePlan: (planId) => {
        set(state => {
          const planToDelete = state.plans.find(p => p.id === planId);
          if (!planToDelete) return state;

          const newPlans = state.plans.filter(p => p.id !== planId);
          const nextPlan = newPlans.find(p => p.classId === planToDelete.classId);

          return {
            plans: newPlans,
            currentPlanId: state.currentPlanId === planId
              ? (nextPlan?.id ?? null)
              : state.currentPlanId
          };
        });
      },

      switchPlan: (planId) => {
        if (planId === null) {
          set({ currentPlanId: null });
          return;
        }

        const plan = get().plans.find(p => p.id === planId);
        if (plan) {
          set({ currentPlanId: planId });
        }
      },

      updateGridSettings: (settings) => {
        if (settings.rows < 1 || settings.cols < 1 || 
            settings.rows > 20 || settings.cols > 20) {
          return;
        }

        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        const validSeats = currentPlan.seats.filter(
          seat => seat.row < settings.rows && seat.col < settings.cols
        );

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  seats: validSeats,
                  gridSettings: settings,
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      updateSeat: (studentId, row, col) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        const newSeats = currentPlan.seats.filter(s => s.studentId !== studentId);
        
        if (row === null || col === null) {
          set(state => ({
            plans: state.plans.map(plan =>
              plan.id === currentPlan.id
                ? {
                    ...plan,
                    seats: newSeats,
                    modifiedAt: new Date().toISOString()
                  }
                : plan
            )
          }));
          return;
        }

        if (row >= currentPlan.gridSettings.rows || 
            col >= currentPlan.gridSettings.cols || 
            row < 0 || col < 0) {
          return;
        }

        if (newSeats.some(s => s.row === row && s.col === col)) {
          return;
        }

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  seats: [...newSeats, { studentId, row, col }],
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      resetSeating: () => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  seats: [],
                  selectedStudents: undefined,
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      clearSelectedStudents: () => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  selectedStudents: [],
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      getStudent: (id, classId) => {
        const classStudents = get().students[classId] || [];
        return classStudents.find(s => s.id === id);
      },

      initialize: (classId, students) => {
        set(state => {
          const newState = {
            students: {
              ...state.students,
              [classId]: students
            }
          };
      
          const validStudentIds = new Set(students.map(s => s.id));
          const updatedPlans = state.plans.map(plan => {
            if (plan.classId === classId) {
              return {
                ...plan,
                seats: plan.seats.filter(seat => validStudentIds.has(seat.studentId)),
                modifiedAt: new Date().toISOString()
              };
            }
            return plan;
          });
      
          const currentPlan = state.currentPlanId ? state.plans.find(p => p.id === state.currentPlanId) : null;
          const shouldResetCurrentPlan = !currentPlan || currentPlan.classId !== classId;
          
          return {
            ...newState,
            plans: updatedPlans,
            currentPlanId: shouldResetCurrentPlan ? null : state.currentPlanId
          };
        });
      },

      updateStudentScore: (studentId, classId, delta) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan || currentPlan.classId !== classId) return;
      
        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scores: {
                    ...plan.scores,
                    [studentId]: Math.max(0, (plan.scores[studentId] || 0) + delta)
                  },
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      updateAllStudentScores: (delta) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scores: Object.fromEntries(
                    currentPlan.seats.map(seat => [
                      seat.studentId,
                      Math.max(0, (plan.scores[seat.studentId] || 0) + delta)
                    ])
                  ),
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      setAllStudentScores: (score) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scores: Object.fromEntries(
                    currentPlan.seats.map(seat => [
                      seat.studentId,
                      Math.max(0, score)
                    ])
                  ),
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      getRandomStudents: (count, minScore, maxScore) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        const seatedStudents = currentPlan.seats.map(seat => ({
          studentId: seat.studentId,
          score: currentPlan.scores[seat.studentId] || 0
        }));

        const eligibleStudents = seatedStudents.filter(student => 
          student.score >= minScore && student.score < maxScore
        );

        const selectedStudents: string[] = [];
        const availableStudents = [...eligibleStudents];
        
        while (selectedStudents.length < count && availableStudents.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableStudents.length);
          const [student] = availableStudents.splice(randomIndex, 1);
          selectedStudents.push(student.studentId);
        }

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  selectedStudents,
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      getRandomStudentsFromSides: () => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        const midCol = Math.floor(currentPlan.gridSettings.cols / 2);
        
        const leftSideStudents = currentPlan.seats
          .filter(seat => seat.col < midCol)
          .map(seat => seat.studentId);

        const rightSideStudents = currentPlan.seats
          .filter(seat => seat.col >= midCol)
          .map(seat => seat.studentId);

        const selectedStudents: string[] = [];

        if (leftSideStudents.length > 0) {
          const leftIndex = Math.floor(Math.random() * leftSideStudents.length);
          selectedStudents.push(leftSideStudents[leftIndex]);
        }

        if (rightSideStudents.length > 0) {
          const rightIndex = Math.floor(Math.random() * rightSideStudents.length);
          selectedStudents.push(rightSideStudents[rightIndex]);
        }

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  selectedStudents,
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      getCurrentPlan: () => {
        const state = get();
        if (!state.currentPlanId) return null;
        return state.plans.find(p => p.id === state.currentPlanId) ?? null;
      },

      getUnassignedStudents: (classId) => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        const classStudents = state.students[classId] || [];
        
        if (!currentPlan || currentPlan.classId !== classId) return classStudents;

        const assignedStudentIds = new Set(currentPlan.seats.map(s => s.studentId));
        return classStudents.filter(student => !assignedStudentIds.has(student.id));
      },

      getPlansForClass: (classId) => {
        return get().plans.filter(plan => plan.classId === classId);
      }
    }),
    {
      name: 'seating-storage',
      partialize: (state) => ({
        plans: state.plans,
        currentPlanId: state.currentPlanId,
        students: state.students
      })
    }
  )
);