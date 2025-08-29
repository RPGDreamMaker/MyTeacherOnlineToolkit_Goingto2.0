import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface WheelPlan {
  id: string;
  name: string;
  description: string;
  classId: string;
  createdAt: string;
  modifiedAt: string;
  selectedStudents: string[];
}

interface WheelState {
  students: Record<string, Student[]>;
  plans: WheelPlan[];
  currentPlanId: string | null;
  defaultPlan: Record<string, { selectedStudents: string[] }>;
  infiniteMode: boolean;

  // Plan Management
  createPlan: (name: string, description: string, classId: string) => void;
  updatePlan: (planId: string, updates: Partial<Omit<WheelPlan, 'id' | 'createdAt'>>) => void;
  deletePlan: (planId: string) => void;
  switchPlan: (planId: string | null) => void;

  // Student Management
  initialize: (classId: string, students: Student[]) => void;
  selectStudent: (studentId: string) => void;
  returnStudent: (studentId: string) => void;
  returnAllStudents: () => void;
  setInfiniteMode: (enabled: boolean) => void;
  
  // Computed
  getCurrentPlan: () => (WheelPlan & { isDefault: boolean; classId: string }) | null;
  getPlansForClass: (classId: string) => WheelPlan[];
  getAvailableStudents: (classId: string) => Student[];
  getSelectedStudents: (classId: string) => Student[];
}

export const useWheelStore = create<WheelState>()(
  persist(
    (set, get) => ({
      students: {},
      plans: [],
      currentPlanId: null,
      defaultPlan: {},
      infiniteMode: false,

      createPlan: (name, description, classId) => {
        const newPlan: WheelPlan = {
          id: crypto.randomUUID(),
          name,
          description,
          classId,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          selectedStudents: [],
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
          const newPlans = state.plans.filter(p => p.id !== planId);
          return {
            plans: newPlans,
            currentPlanId: state.currentPlanId === planId
              ? null
              : state.currentPlanId
          };
        });
      },

      switchPlan: (planId) => {
        set({ currentPlanId: planId });
      },

      initialize: (classId, students) => {
        set(state => ({
          students: {
            ...state.students,
            [classId]: students
          },
          // Always reset the default plan for this class
          defaultPlan: {
            ...state.defaultPlan,
            [classId]: {
              selectedStudents: []
            }
          },
          currentPlanId: null // Reset to default plan
        }));
      },

      selectStudent: (studentId) => {
        const { infiniteMode, getCurrentPlan } = get();
        const currentPlan = getCurrentPlan();
        if (!currentPlan) return;
        
        if (!infiniteMode) {
          if (currentPlan.isDefault) {
            set(state => ({
              defaultPlan: {
                ...state.defaultPlan,
                [currentPlan.classId]: {
                  ...state.defaultPlan[currentPlan.classId],
                  selectedStudents: [
                    ...state.defaultPlan[currentPlan.classId].selectedStudents,
                    studentId
                  ]
                }
              }
            }));
          } else {
            set(state => ({
              plans: state.plans.map(plan =>
                plan.id === currentPlan.id
                  ? {
                      ...plan,
                      selectedStudents: [...plan.selectedStudents, studentId],
                      modifiedAt: new Date().toISOString()
                    }
                  : plan
              )
            }));
          }
        }
      },

      returnStudent: (studentId) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        if (currentPlan.isDefault) {
          set(state => ({
            defaultPlan: {
              ...state.defaultPlan,
              [currentPlan.classId]: {
                ...state.defaultPlan[currentPlan.classId],
                selectedStudents: state.defaultPlan[currentPlan.classId].selectedStudents
                  .filter(id => id !== studentId)
              }
            }
          }));
        } else {
          set(state => ({
            plans: state.plans.map(plan =>
              plan.id === currentPlan.id
                ? {
                    ...plan,
                    selectedStudents: plan.selectedStudents.filter(id => id !== studentId),
                    modifiedAt: new Date().toISOString()
                  }
                : plan
            )
          }));
        }
      },

      returnAllStudents: () => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        if (currentPlan.isDefault) {
          set(state => ({
            defaultPlan: {
              ...state.defaultPlan,
              [currentPlan.classId]: {
                ...state.defaultPlan[currentPlan.classId],
                selectedStudents: []
              }
            }
          }));
        } else {
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
        }
      },

      setInfiniteMode: (enabled) => {
        set({ infiniteMode: enabled });
      },

      getCurrentPlan: () => {
        const state = get();
        if (!state.currentPlanId) {
          // Return default plan if no plan is selected
          const classId = Object.keys(state.students)[0];
          if (!classId) return null;

          return {
            id: 'default',
            name: 'Default Wheel',
            description: 'Resets every time you visit the page',
            classId,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            selectedStudents: state.defaultPlan[classId]?.selectedStudents || [],
            isDefault: true
          };
        }

        const plan = state.plans.find(p => p.id === state.currentPlanId);
        return plan ? { ...plan, isDefault: false, classId: plan.classId } : null;
      },

      getPlansForClass: (classId) => {
        return get().plans.filter(plan => plan.classId === classId);
      },

      getAvailableStudents: (classId) => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        if (!currentPlan) return [];
        
        // Import classes store to check absent students
        const { useClassesStore } = require('./classes');
        const isStudentAbsent = useClassesStore.getState().isStudentAbsent;

        const classStudents = state.students[classId] || [];
        const selectedIds = new Set(currentPlan.selectedStudents);

        return classStudents.filter(student => 
          !selectedIds.has(student.id) && !isStudentAbsent(classId, student.id)
        );
      },

      getSelectedStudents: (classId) => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        if (!currentPlan) return [];

        const classStudents = state.students[classId] || [];
        return currentPlan.selectedStudents
          .map(id => classStudents.find(s => s.id === id))
          .filter((s): s is Student => s !== undefined);
      }
    }),
    {
      name: 'wheel-storage',
      partialize: (state) => ({
        plans: state.plans,
        defaultPlan: state.defaultPlan,
        infiniteMode: state.infiniteMode
      })
    }
  )
);