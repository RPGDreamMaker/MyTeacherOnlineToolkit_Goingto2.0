import { useClassesStore } from '../store/classes';
import { useSeatingStore } from '../store/seating';
import { useWheelStore } from '../store/wheel';
import { useLearningWheelsStore } from '../store/learningWheels';
import { useWelcomeStore } from '../store/welcome';

export interface AppData {
  version: string;
  exportDate: string;
  classes: any[];
  seatingPlans: any[];
  seatingCurrentPlanId: string | null;
  wheelPlans: any[];
  wheelCurrentPlanId: string | null;
  wheelDefaultPlan: any;
  wheelInfiniteMode: boolean;
  learningWheels: any[];
  welcomeMessage: string;
}

export function exportAppData(): void {
  try {
    // Get current state from all stores
    const classesState = useClassesStore.getState();
    const seatingState = useSeatingStore.getState();
    const wheelState = useWheelStore.getState();
    const learningWheelsState = useLearningWheelsStore.getState();
    const welcomeState = useWelcomeStore.getState();

    const appData: AppData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      classes: classesState.classes,
      seatingPlans: seatingState.plans,
      seatingCurrentPlanId: seatingState.currentPlanId,
      wheelPlans: wheelState.plans,
      wheelCurrentPlanId: wheelState.currentPlanId,
      wheelDefaultPlan: wheelState.defaultPlan,
      wheelInfiniteMode: wheelState.infiniteMode,
      learningWheels: learningWheelsState.learningWheels,
      welcomeMessage: welcomeState.message,
    };

    // Create and download the file
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `teacher-toolkit-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data. Please try again.');
  }
}

export async function importAppData(file: File): Promise<void> {
  try {
    const text = await file.text();
    const appData: AppData = JSON.parse(text);

    // Validate the data structure
    if (!appData.version || !appData.classes || !Array.isArray(appData.classes)) {
      throw new Error('Invalid file format. Please select a valid Teacher Toolkit backup file.');
    }

    // Migrate old seating plans to new score sets format
    const migratedSeatingPlans = (appData.seatingPlans || []).map((plan: any) => {
      // Add lockedSeats if it doesn't exist
      if (!plan.lockedSeats) {
        plan.lockedSeats = [];
      }
      
      if (plan.scores && !plan.scoreSets) {
        // Old format - migrate to new format
        const defaultScoreSetId = crypto.randomUUID();
        return {
          ...plan,
          scoreSets: {
            [defaultScoreSetId]: {
              name: 'Default Scores',
              scores: plan.scores,
              createdAt: plan.createdAt || new Date().toISOString()
            }
          },
          currentScoreSetId: defaultScoreSetId,
          scores: undefined // Remove old scores property
        };
      }
      return plan;
    });
    // Get store actions
    const classesActions = useClassesStore.getState();
    const seatingActions = useSeatingStore.getState();
    const wheelActions = useWheelStore.getState();
    const learningWheelsActions = useLearningWheelsStore.getState();
    const welcomeActions = useWelcomeStore.getState();

    // Import data to each store
    useClassesStore.setState({
      classes: appData.classes || []
    });

    useSeatingStore.setState({
      plans: migratedSeatingPlans,
      currentPlanId: appData.seatingCurrentPlanId || null,
      students: {} // Will be reinitialized when visiting seating pages
    });

    useWheelStore.setState({
      plans: appData.wheelPlans || [],
      currentPlanId: appData.wheelCurrentPlanId || null,
      defaultPlan: appData.wheelDefaultPlan || {},
      infiniteMode: appData.wheelInfiniteMode || false,
      students: {} // Will be reinitialized when visiting wheel pages
    });

    useLearningWheelsStore.setState({
      learningWheels: appData.learningWheels || []
    });

    if (appData.welcomeMessage) {
      welcomeActions.setMessage(appData.welcomeMessage);
    }

  } catch (error) {
    console.error('Failed to import data:', error);
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON file. Please select a valid Teacher Toolkit backup file.');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to import data. Please try again.');
  }
}