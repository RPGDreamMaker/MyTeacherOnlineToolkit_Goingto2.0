import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningWheel, LearningSlice } from '../types/learningWheel';

interface LearningWheelsState {
  learningWheels: LearningWheel[];
  addLearningWheel: (name: string, description?: string, slices?: Array<{ name: string; url: string }>) => void;
  updateLearningWheel: (wheelId: string, updates: Partial<Omit<LearningWheel, 'id' | 'createdAt'>>) => void;
  deleteLearningWheel: (wheelId: string) => void;
  addSlice: (wheelId: string, name: string, url: string) => void;
  updateSlice: (wheelId: string, sliceId: string, updates: Partial<Omit<LearningSlice, 'id'>>) => void;
  deleteSlice: (wheelId: string, sliceId: string) => void;
  getLearningWheel: (wheelId: string) => LearningWheel | undefined;
}

export const useLearningWheelsStore = create<LearningWheelsState>()(
  persist(
    (set, get) => ({
      learningWheels: [],

      addLearningWheel: (name, description, slices = []) => {
        const wheelSlices: LearningSlice[] = slices.map(slice => ({
          id: crypto.randomUUID(),
          name: slice.name,
          url: slice.url
        }));

        const newWheel: LearningWheel = {
          id: crypto.randomUUID(),
          name,
          description,
          slices: wheelSlices,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        };

        set(state => ({
          learningWheels: [...state.learningWheels, newWheel]
        }));
      },

      updateLearningWheel: (wheelId, updates) => {
        set(state => ({
          learningWheels: state.learningWheels.map(wheel =>
            wheel.id === wheelId
              ? {
                  ...wheel,
                  ...updates,
                  modifiedAt: new Date().toISOString()
                }
              : wheel
          )
        }));
      },

      deleteLearningWheel: (wheelId) => {
        set(state => ({
          learningWheels: state.learningWheels.filter(wheel => wheel.id !== wheelId)
        }));
      },

      addSlice: (wheelId, name, url) => {
        const newSlice: LearningSlice = {
          id: crypto.randomUUID(),
          name,
          url,
        };

        set(state => ({
          learningWheels: state.learningWheels.map(wheel =>
            wheel.id === wheelId
              ? {
                  ...wheel,
                  slices: [...wheel.slices, newSlice],
                  modifiedAt: new Date().toISOString()
                }
              : wheel
          )
        }));
      },

      updateSlice: (wheelId, sliceId, updates) => {
        set(state => ({
          learningWheels: state.learningWheels.map(wheel =>
            wheel.id === wheelId
              ? {
                  ...wheel,
                  slices: wheel.slices.map(slice =>
                    slice.id === sliceId ? { ...slice, ...updates } : slice
                  ),
                  modifiedAt: new Date().toISOString()
                }
              : wheel
          )
        }));
      },

      deleteSlice: (wheelId, sliceId) => {
        set(state => ({
          learningWheels: state.learningWheels.map(wheel =>
            wheel.id === wheelId
              ? {
                  ...wheel,
                  slices: wheel.slices.filter(slice => slice.id !== sliceId),
                  modifiedAt: new Date().toISOString()
                }
              : wheel
          )
        }));
      },

      getLearningWheel: (wheelId) => {
        return get().learningWheels.find(wheel => wheel.id === wheelId);
      },
    }),
    {
      name: 'learning-wheels-storage'
    }
  )
);