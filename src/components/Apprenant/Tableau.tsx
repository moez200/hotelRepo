import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Clock, CheckCircle, Trophy, Star, Bell, Settings, MessageSquare, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAuthStore } from '../../store/auth';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

// Interfaces
interface Course {
  id: number;
  title: string;
  description: string;
  logo: string;
  grade_name: string;
}

interface CourseQuizData {
  courses: {
    total: number;
    completed: number;
    inProgress: number;
    unread: number;
    toComplete: number;
  };
  quizzes: {
    total: number;
    completed: number;
    inProgress: number;
    unread: number;
    toComplete: number;
  };
  scores: {
    thisMonth: { month: string; score: number }[];
    lastMonth: { month: string; score: number }[];
  };
  recommendations: Course[];
}

const Tableau = () => {
  const token = getAuthStore((state) => state.accessToken);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'courses' | 'quizzes' | 'progress'>('courses');
  const [data, setData] = useState<CourseQuizData>({
    courses: { total: 0, completed: 0, inProgress: 0, unread: 0, toComplete: 0 },
    quizzes: { total: 0, completed: 0, inProgress: 0, unread: 0, toComplete: 0 },
    scores: { thisMonth: [], lastMonth: [] },
    recommendations: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'thisMonth' | 'lastMonth'>('thisMonth');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token || ''}` },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<CourseQuizData>(
          'http://localhost:8000/cours/dashboard/all-data/',
          axiosConfig
        );
        setData(response.data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('401')) {
          setError(t('unauthorized'));
        } else {
          setError(t('fetchError', { message: err instanceof Error ? err.message : 'Unknown error' }));
        }
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token, t]);

  // Course Doughnut Chart Data
  const courseDonutData = {
    labels: [t('completedCourses'), t('inProgressCourses'), t('unreadCourses'), t('availableCourses')],
    datasets: [
      {
        data: [data.courses.completed, data.courses.inProgress, data.courses.unread, data.courses.toComplete],
        backgroundColor: ['#FF6F61', '#FFC107', '#4A90E2', '#6D4C41'],
        borderColor: ['#fff', '#fff', '#fff', '#fff'],
        borderWidth: 1,
      },
    ],
  };

  // Quiz Doughnut Chart Data
  const quizDonutData = {
    labels: [t('completedQuizzes'), t('inProgressQuizzes'), t('unreadQuizzes'), t('availableQuizzes')],
    datasets: [
      {
        data: [data.quizzes.completed, data.quizzes.inProgress, data.quizzes.unread, data.quizzes.toComplete],
        backgroundColor: ['#50C878', '#FF6F61', '#FFC107', '#A78BFA'],
        borderColor: ['#fff', '#fff', '#fff', '#fff'],
        borderWidth: 1,
      },
    ],
  };

  // Line Chart Data (using scores)
  const lineChartData = {
    labels: ['Last Month', 'This Month'],
    datasets: [
      {
        label: t('scoreActivity'),
        data: [data.scores.lastMonth[0]?.score || 0, data.scores.thisMonth[0]?.score || 0],
        fill: false,
        borderColor: '#8B4513',
        backgroundColor: 'rgba(139, 69, 19, 0.2)',
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' as const, labels: { font: { size: 12 } } },
      title: { display: true, text: t('courseDistribution'), font: { size: 16 } },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const, labels: { font: { size: 14 } } },
      tooltip: { enabled: true, mode: 'index' as const, intersect: false },
      title: { display: true, text: t('scoreActivity'), font: { size: 18 } },
    },
    scales: {
      x: { title: { display: true, text: t('period'), font: { size: 14 } } },
      y: {
        title: { display: true, text: t('score'), font: { size: 14 } },
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, callback: (value: any) => `${value}%` },
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
    <div className="min-h-screen w-full bg-gray-50">
      <main className="max-w-[1600px] mx-auto p-6 lg:p-8">
        {/* Sticky Header with Utility Icons */}
        <div className="sticky top-4 right-4 flex justify-end gap-4 mb-6">
          <button className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-8">
          {/* E-Learning Banner */}
          <div className="lg:col-span-1 bg-[#4339CA] rounded-xl p-6 flex flex-col items-center text-white overflow-hidden relative shadow-md">
            <div className="w-full max-w-md relative z-10">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">{t('eLearning')}</h2>
              <p className="text-gray-200 text-base lg:text-lg">{t('platformDescription')}</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
              alt="Student with books"
              className="mt-4 h-40 lg:h-48 rounded-xl shadow-lg object-cover"
            />
          </div>

          {/* Recommended Courses Section */}
          <div className="lg:col-span-1 lg:col-end-3">
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('recommendedCourses')}</h3>
              {data.recommendations.length === 0 ? (
                <p className="text-gray-600">{t('noRecommendations')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.recommendations.map((course) => (
                    <div
                      key={course.id}
                      className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      <img
                        src={course.logo}
                        alt={course.title}
                        className="h-32 w-full object-cover rounded-lg mb-3"
                      />
                      <h4 className="text-lg font-medium text-gray-800">{course.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      <p className="text-sm text-gray-500 mt-1">{t('grade')}: {course.grade_name}</p>
                      <button
                        className="text-blue-500 text-sm mt-2 inline-flex items-center hover:underline"
                        onClick={() => window.location.href = `/course/${course.id}`}
                      >
                        <ArrowUp className="w-4 h-4 mr-1" /> {t('view')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabs and Content */}
          <div className="lg:col-span-1 lg:col-end-3">
            <div className="flex border-b mb-6">
              {(['courses', 'quizzes', 'progress'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-medium ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {t(tab)}
                </button>
              ))}
            </div>

            {/* Existing Tabs Content */}
            {activeTab === 'courses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: data.courses.unread, icon: BookOpen, color: 'bg-blue-500', label: 'unreadCourses' },
                    { value: data.courses.total, icon: BookOpen, color: 'bg-green-500', label: 'numberOfCourses' },
                    { value: data.courses.completed, icon: Trophy, color: 'bg-red-500', label: 'completedCourses' },
                    { value: data.courses.inProgress, icon: Clock, color: 'bg-yellow-500', label: 'coursesInProgress' },
                    { value: data.courses.toComplete, icon: CheckCircle, color: 'bg-amber-700', label: 'availableCourses' },
                  ].map((stat, index) => (
                    <div key={index} className={`${stat.color} p-4 rounded-xl text-white shadow-md`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold">{stat.value}</span>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">{t(stat.label)}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('courseList')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { count: data.courses.toComplete, label: 'availableCourses', status: 'toComplete' },
                      { count: data.courses.completed, label: 'completedCourses', status: 'completed' },
                      { count: data.courses.inProgress, label: 'inProgressCourses', status: 'inProgress' },
                      { count: data.courses.unread, label: 'unreadCourses', status: 'unread' },
                    ].map((item, index) => (
                      <div key={index} className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                        <h4 className="text-lg font-medium text-gray-800">{t(item.label)}</h4>
                        <p className="text-sm text-gray-600">{item.count} {t('items')}</p>
                        <button className="text-blue-500 text-sm mt-2 inline-flex items-center hover:underline">
                          <ArrowUp className="w-4 h-4 mr-1" /> {t('view')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: data.quizzes.total, icon: Star, color: 'bg-blue-500', label: 'numberOfQuizzes' },
                    { value: data.quizzes.completed, icon: Trophy, color: 'bg-green-500', label: 'completedQuizzes' },
                    { value: data.quizzes.inProgress, icon: Clock, color: 'bg-red-500', label: 'quizzesInProgress' },
                    { value: data.quizzes.unread, icon: BookOpen, color: 'bg-yellow-500', label: 'unreadQuizzes' },
                    { value: data.quizzes.toComplete, icon: CheckCircle, color: 'bg-purple-500', label: 'availableQuizzes' },
                  ].map((stat, index) => (
                    <div key={index} className={`${stat.color} p-4 rounded-xl text-white shadow-md`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold">{stat.value}</span>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">{t(stat.label)}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('quizList')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { count: data.quizzes.toComplete, label: 'availableQuizzes', status: 'toComplete' },
                      { count: data.quizzes.completed, label: 'completedQuizzes', status: 'completed' },
                      { count: data.quizzes.inProgress, label: 'inProgressQuizzes', status: 'inProgress' },
                      { count: data.quizzes.unread, label: 'unreadQuizzes', status: 'unread' },
                    ].map((item, index) => (
                      <div key={index} className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                        <h4 className="text-lg font-medium text-gray-800">{t(item.label)}</h4>
                        <p className="text-sm text-gray-600">{item.count} {t('items')}</p>
                        <button className="text-blue-500 text-sm mt-2 inline-flex items-center hover:underline">
                          <ArrowUp className="w-4 h-4 mr-1" /> {t('view')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="ml-0">
                <div className="lg:col-span-1 lg:col-end-3">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex flex-col items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('courseDistribution')}</h3>
                        </div>
                        <div className="h-80 relative">
                          <Doughnut data={courseDonutData} options={donutOptions} id="courseDonut" />
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex flex-col items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('quizDistribution')}</h3>
                        </div>
                        <div className="h-80 relative">
                          <Doughnut data={quizDonutData} options={donutOptions} id="quizDonut" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <div className="flex flex-col items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('scoreActivity')}</h3>
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-500">{t('lastMonth')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-500">{t('thisMonth')}</span>
                          </div>
                          <select
                            className="ml-4 border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white shadow-md"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as 'thisMonth' | 'lastMonth')}
                          >
                            <option value="thisMonth">{t('thisMonth')}</option>
                            <option value="lastMonth">{t('lastMonth')}</option>
                          </select>
                        </div>
                      </div>
                      <div className="h-80 relative">
                        <Line data={lineChartData} options={lineChartOptions} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tableau;