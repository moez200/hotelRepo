import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, BrainCircuit, CheckCircle, Clock, GraduationCap, Trophy, Book, MessageSquare, Star, Bell, Settings, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAuthStore } from '../../store/auth';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Interfaces
interface CourseCompletionResponse {
  total_courses: number;
  completed_courses: number;
  courses_to_complete: number;
  unread_courses: number;
  courses_in_progress: number;
}

interface ApiResponse {
  count: number;
}

interface ScoreData {
  month: string;
  score: number;
}

const MainContent = () => {
  const token = getAuthStore((state) => state.accessToken);
  const { t } = useTranslation();

  // State declarations
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [entreprisesCount, setEntreprisesCount] = useState<number>(0);
  const [utilisateursCount, setUtilisateursCount] = useState<number>(0);
  const [completedCoursesCount, setCompletedCoursesCount] = useState<number>(0);
  const [coursesToCompleteCount, setCoursesToCompleteCount] = useState<number>(0);
  const [unreadCoursesCount, setUnreadCoursesCount] = useState<number>(0);
  const [coursesInProgressCount, setCoursesInProgressCount] = useState<number>(0);
  const [scoreData, setScoreData] = useState<{ thisMonth: ScoreData[]; lastMonth: ScoreData[] }>({
    thisMonth: [],
    lastMonth: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'thisMonth' | 'lastMonth'>('thisMonth');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Axios config with token
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token || ''}` },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [entreprisesRes, utilisateursRes, completionRes, scoreRes] = await Promise.all([
          axios.get<ApiResponse>('http://localhost:8000/company/entreprises/count/'),
          axios.get<ApiResponse>('http://localhost:8000/users/effectifs/count/'),
          axios.get<CourseCompletionResponse>('http://localhost:8000/cours/course-completion/', axiosConfig),
          axios.get<{ thisMonth: ScoreData[]; lastMonth: ScoreData[] }>('http://localhost:8000/cours/score-activity/', axiosConfig),
        ]);

        setEntreprisesCount(entreprisesRes.data.count);
        setUtilisateursCount(utilisateursRes.data.count);
        setCoursesCount(completionRes.data.total_courses);
        setCompletedCoursesCount(completionRes.data.completed_courses);
        setCoursesToCompleteCount(completionRes.data.courses_to_complete);
        setUnreadCoursesCount(completionRes.data.unread_courses);
        setCoursesInProgressCount(completionRes.data.courses_in_progress);
        setScoreData(scoreRes.data);
      } catch (err) {
        if (err) {
          if (err === 401) {
            setError(t('unauthorized'));
          } else {
            setError(t('fetchError', { message: err }));
          }
        } else {
          setError(t('unknownError'));
        }
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token, t]);

  // Chart configuration
  const chartData = {
    labels: ['Last Month', 'This Month'],
    datasets: [
      {
        label: t('lastMonth'),
        data: [scoreData.lastMonth[0]?.score || 0, scoreData.thisMonth[0]?.score || 0],
        fill: false,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        hidden: selectedPeriod === 'thisMonth',
      },
      {
        label: t('thisMonth'),
        data: [scoreData.lastMonth[0]?.score || 0, scoreData.thisMonth[0]?.score || 0],
        fill: false,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        hidden: selectedPeriod === 'lastMonth',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: t('period') } },
      y: {
        title: { display: true, text: t('score') },
        beginAtZero: true,
        max: 100,
      },
    },
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">{t('loading')}</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[1600px] mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Section */}
          <div className="space-y-8">
            {/* E-Learning Banner */}
            <div className="bg-[#4339CA] rounded-xl p-8 flex justify-between items-center text-white overflow-hidden relative">
              <div className="max-w-xl relative z-10">
                <h2 className="text-3xl font-bold mb-3">{t('eLearning')}</h2>
                <p className="text-gray-200 text-lg">{t('platformDescription')}</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                alt="Student with books"
                className="h-48 rounded-xl shadow-lg object-cover"
              />
            </div>

            {/* Buttons/Icons */}
            <div className="flex justify-end gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <Settings className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <MessageSquare className="w-6 h-6" />
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-[#4339CA] p-5 rounded-xl text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl font-bold">{entreprisesCount}</span>
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{t('numberOfCompanies')}</p>
              </div>
              <div className="bg-[#F59E0B] p-5 rounded-xl text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl font-bold">{utilisateursCount}</span>
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{t('numberOfStaff')}</p>
              </div>
              <div className="bg-gray-800 p-5 rounded-xl text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl font-bold">{coursesCount}</span>
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{t('numberOfCourses')}</p>
              </div>
              <div className="bg-blue-500 p-5 rounded-xl text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl font-bold">{completedCoursesCount}</span>
                  <Trophy className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{t('completedCourses')}</p>
              </div>
              <div className="bg-orange-500 p-5 rounded-xl text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl font-bold">{coursesInProgressCount}</span>
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{t('coursesInProgress')}</p>
              </div>
              <div className="bg-green-500 p-5 rounded-xl text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl font-bold">{unreadCoursesCount}</span>
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{t('unreadCourses')}</p>
              </div>
            </div>

            {/* Original Donut Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">{t('courses')}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="12"
                    strokeDasharray="251.3"
                    strokeDashoffset={
                      coursesCount ? (251.3 * (1 - completedCoursesCount / coursesCount)) : 251.3
                    }
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-gray-800">
                  {coursesCount ? `${Math.round((completedCoursesCount / coursesCount) * 100)}%` : '0%'}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{t('completedCourses')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{t('coursesInProgress')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{t('unreadCourses')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-8">
            {/* Line Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-gray-800">{t('scoreActivity')}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">{t('lastMonth')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">{t('thisMonth')}</span>
                  </div>
                  <select
                    className="ml-4 border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as 'thisMonth' | 'lastMonth')}
                  >
                    <option value="thisMonth">{t('thisMonth')}</option>
                    <option value="lastMonth">{t('lastMonth')}</option>
                  </select>
                </div>
              </div>
              <div className="h-64 relative">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* New Three Donut Charts */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">{t('courseBreakdown')}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Completed Courses Circle */}
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="12"
                      strokeDasharray="251.3"
                      strokeDashoffset={
                        coursesCount ? (251.3 * (1 - completedCoursesCount / coursesCount)) : 251.3
                      }
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-800">
                    {coursesCount ? `${Math.round((completedCoursesCount / coursesCount) * 100)}%` : '0%'}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">{t('completedCourses')}</p>
                </div>

                {/* Courses in Progress Circle */}
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="12"
                      strokeDasharray="251.3"
                      strokeDashoffset={
                        coursesCount ? (251.3 * (1 - coursesInProgressCount / coursesCount)) : 251.3
                      }
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-800">
                    {coursesCount ? `${Math.round((coursesInProgressCount / coursesCount) * 100)}%` : '0%'}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">{t('coursesInProgress')}</p>
                </div>

                {/* Unread Courses Circle */}
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="12"
                      strokeDasharray="251.3"
                      strokeDashoffset={
                        coursesCount ? (251.3 * (1 - unreadCoursesCount / coursesCount)) : 251.3
                      }
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-800">
                    {coursesCount ? `${Math.round((unreadCoursesCount / coursesCount) * 100)}%` : '0%'}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">{t('unreadCourses')}</p>
                </div>
              </div>
          
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainContent;