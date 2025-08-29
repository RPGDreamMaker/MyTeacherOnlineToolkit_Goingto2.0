import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClassesStore } from '../store/classes';
import { useSeatingStore } from '../store/seating';
import { useWheelStore } from '../store/wheel';
import { ArrowLeft, Users, Layout, CircleDot } from 'lucide-react';
import StudentsPage from './StudentsPage';
import SeatingPlanPage from './SeatingPlanPage';
import WheelOfNamesPage from './WheelOfNamesPage';

type TabType = 'students' | 'seating' | 'wheel';

export default function ClassDetailsPage() {
  const { classId } = useParams<{ classId: string }>();
  const { classes } = useClassesStore();
  const { initialize: initializeSeating } = useSeatingStore();
  const { initialize: initializeWheel } = useWheelStore();
  const [activeTab, setActiveTab] = useState<TabType>('students');

  const classData = classId ? classes.find(c => c.id === classId) : null;

  // Initialize stores when class data changes
  useEffect(() => {
    if (classData) {
      initializeSeating(classData.id, classData.students);
      initializeWheel(classData.id, classData.students);
    }
  }, [classData, initializeSeating, initializeWheel]);

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">Class not found</p>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'students' as TabType,
      name: 'Manage Students',
      icon: Users,
      count: classData.students.length
    },
    {
      id: 'seating' as TabType,
      name: 'Seating Plan',
      icon: Layout,
      count: null
    },
    {
      id: 'wheel' as TabType,
      name: 'Wheel of Names',
      icon: CircleDot,
      count: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button and class info */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="page-title">{classData.name}</h1>
            {classData.description && (
              <p className="mt-1 text-sm text-gray-500">{classData.description}</p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                    {tab.count !== null && (
                      <span className={`
                        ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                        ${isActive
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'students' && (
            <StudentsPage classId={classId!} classData={classData} />
          )}
          {activeTab === 'seating' && (
            <SeatingPlanPage classId={classId!} classData={classData} />
          )}
          {activeTab === 'wheel' && (
            <WheelOfNamesPage classId={classId!} classData={classData} />
          )}
        </div>
      </div>
    </div>
  );
}