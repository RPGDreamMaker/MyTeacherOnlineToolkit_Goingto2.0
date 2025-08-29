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
  absentees: string[];
}

interface WheelState {
  students: Record<string, Student[]>;
  plans: WheelPlan[];
  currentPlanId: string | null;
  defaultPlan: Record<string, { selectedStudents: string[]; absentees: string[] }>;
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
  toggleAttendance: (studentId: string) => void;
  setInfiniteMode: (enabled: boolean) => void;
  
  // Computed
  getCurrentPlan: () => (WheelPlan & { isDefault: boolean }) | null;
  getPlansForClass: (classId: string) => WheelPlan[];
  getAvailableStudents: (classId: string) => Student[];
  getSelectedStudents: (classId: string) => Student[];
  isAbsent: (studentId: string) => boolean;
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
          absentees: []
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
              selectedStudents: [],
              absentees: []
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

      toggleAttendance: (studentId) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        if (currentPlan.isDefault) {
          set(state => {
            const defaultClassPlan = state.defaultPlan[currentPlan.classId];
            const newAbsentees = new Set(defaultClassPlan.absentees);
            
            if (newAbsentees.has(studentId)) {
              newAbsentees.delete(studentId);
            } else {
              newAbsentees.add(studentId);
              // Remove from selected if marked as absent
              defaultClassPlan.selectedStudents = defaultClassPlan.selectedStudents
                .filter(id => id !== studentId);
            }

            return {
              defaultPlan: {
                ...state.defaultPlan,
                [currentPlan.classId]: {
                  ...defaultClassPlan,
                  absentees: Array.from(newAbsentees)
                }
              }
            };
          });
        } else {
          set(state => ({
            plans: state.plans.map(plan => {
              if (plan.id !== currentPlan.id) return plan;

              const newAbsentees = new Set(plan.absentees);
              if (newAbsentees.has(studentId)) {
                newAbsentees.delete(studentId);
              } else {
                newAbsentees.add(studentId);
                plan.selectedStudents = plan.selectedStudents
                  .filter(id => id !== studentId);
              }

              return {
                ...plan,
                absentees: Array.from(newAbsentees),
                modifiedAt: new Date().toISOString()
              };
            })
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
            absentees: state.defaultPlan[classId]?.absentees || [],
            isDefault: true
          };
        }

        const plan = state.plans.find(p => p.id === state.currentPlanId);
        return plan ? { ...plan, isDefault: false } : null;
      },

      getPlansForClass: (classId) => {
        return get().plans.filter(plan => plan.classId === classId);
      },

      getAvailableStudents: (classId) => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        if (!currentPlan) return [];

        const classStudents = state.students[classId] || [];
        const selectedIds = new Set(currentPlan.selectedStudents);
        const absentees = new Set(currentPlan.absentees);

        return classStudents.filter(student => 
          !selectedIds.has(student.id) && !absentees.has(student.id)
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
      },

      isAbsent: (studentId) => {
        const currentPlan = get().getCurrentPlan();
        return currentPlan ? currentPlan.absentees.includes(studentId) : false;
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