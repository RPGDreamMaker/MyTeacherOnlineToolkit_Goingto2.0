import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useClassesStore } from './classes';

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
  color?: string;
  createdAt: string;
  modifiedAt: string;
  seats: Seat[];
  gridSettings: GridSettings;
  classId: string;
  scoreSets: Record<string, { name: string; scores: Record<string, number>; createdAt: string }>;
  currentScoreSetId: string | null;
  selectedStudents?: string[];
  lockedSeats: Array<{ row: number; col: number }>;
}

interface SeatingState {
  students: Record<string, Student[]>;
  currentPlanId: string | null;
  plans: SeatingPlan[];
  
  // Actions
  createPlan: (name: string, description: string, classId: string, color?: string) => void;
  copyPlan: (sourcePlanId: string, name: string, description: string, resetScores: boolean) => void;
  updatePlan: (planId: string, updates: Partial<Omit<SeatingPlan, 'id' | 'createdAt'>>) => void;
  deletePlan: (planId: string) => void;
  switchPlan: (planId: string | null) => void;
  createScoreSet: (name: string, color?: string) => void;
  switchScoreSet: (scoreSetId: string | null) => void;
  deleteScoreSet: (scoreSetId: string) => void;
  renameScoreSet: (scoreSetId: string, newName: string, newColor?: string) => void;
  updateSeat: (studentId: string, row: number | null, col: number | null) => void;
  updateGridSettings: (settings: GridSettings) => void;
  resetSeating: () => void;
  toggleSeatLock: (row: number, col: number) => void;
  isSeatLocked: (row: number, col: number) => boolean;
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
  getCurrentScoreSet: () => { id: string; name: string; scores: Record<string, number> } | null;
  getUnassignedStudents: (classId: string) => Student[];
  getPlansForClass: (classId: string) => SeatingPlan[];
}

export const useSeatingStore = create<SeatingState>()(
  persist(
    (set, get) => ({
      students: {},
      currentPlanId: null,
      plans: [],

      createPlan: (name, description, classId, color = '#d50f25') => {
        const defaultScoreSetId = crypto.randomUUID();
        const newPlan: SeatingPlan = {
          id: crypto.randomUUID(),
          name,
          description,
          color,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          seats: [],
          gridSettings: { rows: 4, cols: 8 },
          classId,
          scoreSets: {
            [defaultScoreSetId]: {
              name: 'Default Scores',
              scores: {},
              createdAt: new Date().toISOString(),
              color: '#3369e8' // Default blue color
            }
          },
          currentScoreSetId: defaultScoreSetId,
          lockedSeats: []
        };

        set(state => ({
          plans: [...state.plans, newPlan],
          currentPlanId: newPlan.id
        }));
      },

      copyPlan: (sourcePlanId, name, description, resetScores) => {
        const sourcePlan = get().plans.find(p => p.id === sourcePlanId);
        if (!sourcePlan) return;

        const defaultScoreSetId = crypto.randomUUID();
        let newScoreSets;
        
        if (resetScores) {
          newScoreSets = {
            [defaultScoreSetId]: {
              name: 'Default Scores',
              scores: {},
              createdAt: new Date().toISOString()
            }
          };
        } else {
          // Copy all score sets
          newScoreSets = Object.fromEntries(
            Object.entries(sourcePlan.scoreSets).map(([_, scoreSet]) => {
              const newId = crypto.randomUUID();
              return [newId, {
                ...scoreSet,
                createdAt: new Date().toISOString()
              }];
            })
          );
        }
        const newPlan: SeatingPlan = {
          id: crypto.randomUUID(),
          name,
          description,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          seats: [...sourcePlan.seats],
          gridSettings: { ...sourcePlan.gridSettings },
          classId: sourcePlan.classId,
          scoreSets: newScoreSets,
          currentScoreSetId: resetScores ? defaultScoreSetId : Object.keys(newScoreSets)[0],
          lockedSeats: [...sourcePlan.lockedSeats]
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

      createScoreSet: (name, color = '#3369e8') => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        const newScoreSetId = crypto.randomUUID();
        const newScoreSet = {
          name,
          scores: {},
          createdAt: new Date().toISOString(),
          color
        };

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scoreSets: {
                    ...plan.scoreSets,
                    [newScoreSetId]: newScoreSet
                  },
                  currentScoreSetId: newScoreSetId,
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      switchScoreSet: (scoreSetId) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan || !scoreSetId) return;

        if (currentPlan.scoreSets[scoreSetId]) {
          set(state => ({
            plans: state.plans.map(plan =>
              plan.id === currentPlan.id
                ? {
                    ...plan,
                    currentScoreSetId: scoreSetId,
                    modifiedAt: new Date().toISOString()
                  }
                : plan
            )
          }));
        }
      },

      deleteScoreSet: (scoreSetId) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        const scoreSetIds = Object.keys(currentPlan.scoreSets);
        if (scoreSetIds.length <= 1) return; // Don't delete the last score set

        const { [scoreSetId]: deleted, ...remainingScoreSets } = currentPlan.scoreSets;
        const newCurrentScoreSetId = currentPlan.currentScoreSetId === scoreSetId
          ? Object.keys(remainingScoreSets)[0]
          : currentPlan.currentScoreSetId;

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scoreSets: remainingScoreSets,
                  currentScoreSetId: newCurrentScoreSetId,
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      renameScoreSet: (scoreSetId, newName, newColor) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan || !currentPlan.scoreSets[scoreSetId]) return;

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scoreSets: {
                    ...plan.scoreSets,
                    [scoreSetId]: {
                      ...plan.scoreSets[scoreSetId],
                      name: newName,
                      ...(newColor && { color: newColor })
                    }
                  },
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
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

        const validLockedSeats = currentPlan.lockedSeats.filter(
          lockedSeat => lockedSeat.row < settings.rows && lockedSeat.col < settings.cols
        );
        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  seats: validSeats,
                  gridSettings: settings,
                  lockedSeats: validLockedSeats,
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

      toggleSeatLock: (row, col) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return;

        // Check if there's already a student in this seat
        const isOccupied = currentPlan.seats.some(s => s.row === row && s.col === col);
        if (isOccupied) return; // Can't lock occupied seats

        const isLocked = currentPlan.lockedSeats.some(s => s.row === row && s.col === col);
        
        let newLockedSeats;
        if (isLocked) {
          // Unlock the seat
          newLockedSeats = currentPlan.lockedSeats.filter(s => !(s.row === row && s.col === col));
        } else {
          // Lock the seat
          newLockedSeats = [...currentPlan.lockedSeats, { row, col }];
        }

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  lockedSeats: newLockedSeats,
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      isSeatLocked: (row, col) => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan) return false;
        return currentPlan.lockedSeats.some(s => s.row === row && s.col === col);
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

      selectStudentsByScore: (targetScore) => {
        const currentPlan = get().getCurrentPlan();
        const currentScoreSet = get().getCurrentScoreSet();
        if (!currentPlan || !currentScoreSet) return;
        
        const isStudentAbsent = useClassesStore.getState().isStudentAbsent;

        const studentsWithScore = currentPlan.seats
          .filter(seat => {
            const score = currentScoreSet.scores[seat.studentId] || 0;
            return score === targetScore && !isStudentAbsent(currentPlan.classId, seat.studentId);
          })
          .map(seat => seat.studentId);

        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  selectedStudents: studentsWithScore,
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
        const currentScoreSet = get().getCurrentScoreSet();
        if (!currentPlan || !currentScoreSet || currentPlan.classId !== classId) return;
        
        const isStudentAbsent = useClassesStore.getState().isStudentAbsent;
        
        // Don't update scores for absent students
        if (isStudentAbsent(classId, studentId)) return;
      
        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scoreSets: {
                    ...plan.scoreSets,
                    [currentScoreSet.id]: {
                      ...plan.scoreSets[currentScoreSet.id],
                      scores: {
                        ...currentScoreSet.scores,
                        [studentId]: Math.max(0, (currentScoreSet.scores[studentId] || 0) + delta)
                      }
                    }
                  },
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      updateAllStudentScores: (delta) => {
        const currentPlan = get().getCurrentPlan();
        const currentScoreSet = get().getCurrentScoreSet();
        if (!currentPlan || !currentScoreSet) return;
        
        const isStudentAbsent = useClassesStore.getState().isStudentAbsent;

        // Only update scores for students who are currently assigned to seats (not unassigned)
        const assignedStudentIds = new Set(currentPlan.seats.map(seat => seat.studentId));
        const updatedScores = { ...currentScoreSet.scores };
        
        // Only modify scores for students who are currently assigned to seats
        currentPlan.seats
          .filter(seat => !isStudentAbsent(currentPlan.classId, seat.studentId))
          .forEach(seat => {
            updatedScores[seat.studentId] = Math.max(0, (currentScoreSet.scores[seat.studentId] || 0) + delta);
          });
        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scoreSets: {
                    ...plan.scoreSets,
                    [currentScoreSet.id]: {
                      ...plan.scoreSets[currentScoreSet.id],
                      scores: updatedScores
                    }
                  },
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      setAllStudentScores: (score) => {
        const currentPlan = get().getCurrentPlan();
        const currentScoreSet = get().getCurrentScoreSet();
        if (!currentPlan || !currentScoreSet) return;
        
        const isStudentAbsent = useClassesStore.getState().isStudentAbsent;

        // Only update scores for students who are currently assigned to seats (not unassigned)
        const updatedScores = { ...currentScoreSet.scores };
        
        // Only modify scores for students who are currently assigned to seats
        currentPlan.seats
          .filter(seat => !isStudentAbsent(currentPlan.classId, seat.studentId))
          .forEach(seat => {
            updatedScores[seat.studentId] = Math.max(0, score);
          });
        set(state => ({
          plans: state.plans.map(plan =>
            plan.id === currentPlan.id
              ? {
                  ...plan,
                  scoreSets: {
                    ...plan.scoreSets,
                    [currentScoreSet.id]: {
                      ...plan.scoreSets[currentScoreSet.id],
                      scores: updatedScores
                    }
                  },
                  modifiedAt: new Date().toISOString()
                }
              : plan
          )
        }));
      },

      getRandomStudents: (count, minScore, maxScore) => {
        const currentPlan = get().getCurrentPlan();
        const currentScoreSet = get().getCurrentScoreSet();
        if (!currentPlan || !currentScoreSet) return;
        
        const isStudentAbsent = useClassesStore.getState().isStudentAbsent;

        const seatedStudents = currentPlan.seats.map(seat => ({
          studentId: seat.studentId,
          score: currentScoreSet.scores[seat.studentId] || 0
        }));

        const eligibleStudents = seatedStudents.filter(student => 
          student.score >= minScore && 
          student.score <= maxScore && 
          !isStudentAbsent(currentPlan.classId, student.studentId)
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
        
        const isStudentAbsent = useClassesStore.getState().isStudentAbsent;

        const midCol = Math.floor(currentPlan.gridSettings.cols / 2);
        
        const leftSideStudents = currentPlan.seats
          .filter(seat => seat.col < midCol)
          .filter(seat => !isStudentAbsent(currentPlan.classId, seat.studentId))
          .map(seat => seat.studentId);

        const rightSideStudents = currentPlan.seats
          .filter(seat => seat.col >= midCol)
          .filter(seat => !isStudentAbsent(currentPlan.classId, seat.studentId))
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
        const plan = state.plans.find(p => p.id === state.currentPlanId) ?? null;
        if (!plan) return null;
        
        // Ensure lockedSeats is always an array for backward compatibility
        if (!plan.lockedSeats) {
          plan.lockedSeats = [];
        }
        
        return plan;
      },

      getCurrentScoreSet: () => {
        const currentPlan = get().getCurrentPlan();
        if (!currentPlan || !currentPlan.currentScoreSetId) return null;
        
        const scoreSet = currentPlan.scoreSets[currentPlan.currentScoreSetId];
        if (!scoreSet) return null;
        
        return {
          id: currentPlan.currentScoreSetId,
          name: scoreSet.name,
          scores: scoreSet.scores,
          color: scoreSet.color
        };
      },
      getUnassignedStudents: (classId) => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        const classStudents = state.students[classId] || [];
        
        if (!currentPlan || currentPlan.classId !== classId) return classStudents;

        const assignedStudentIds = new Set(currentPlan.seats.map(s => s.studentId));
        
        const isStudentAbsent = useClassesStore.getState().isStudentAbsent;
        
        return classStudents.filter(student => 
          !assignedStudentIds.has(student.id) && !isStudentAbsent(classId, student.id)
        );
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