import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, CheckCircle, Trophy, Star, Bell, Settings, MessageSquare, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAuthStore } from '../../store/auth';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

// Define interfaces for the API responses
interface MinistryDashboardData {
  global: {
    totalUsers: number;
    totalCourses: number;
    followedCourses: number;
    totalCompanies: number;
    totalQuizzes: number;
    followedQuizzes: number;
    usersByGrade: { grade: string; count: number }[];
  };
  scores: {
    thisMonth: { month: string; score: number }[];
    lastMonth: { month: string; score: number }[];
  };
}

interface CompanyDashboardData {
  company: {
    totalUsers: number;
    availableCourses: number;
    followedCourses: number;
    availableQuizzes: number;
    followedQuizzes: number;
    usersByGrade: { grade: string; count: number }[];
  };
  scores: {
    thisMonth: { month: string; score: number }[];
    lastMonth: { month: string; score: number }[];
  };
}

type DashboardData = MinistryDashboardData | CompanyDashboardData;

const MainContent = () => {
  const token = getAuthStore((state) => state.accessToken);
  const userRole = getAuthStore((state) => state.role);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'courses' | 'quizzes' | 'progress'>('courses');
  const [data, setData] = useState<DashboardData | null>(null);
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
        const url = userRole === 'Admin Ministère' 
          ? 'http://localhost:8000/cours/admin/ministry/dashboard/all-data/' 
          : 'http://localhost:8000/cours/admin/company/dashboard/company-data/';
        
        const response = await axios.get<DashboardData>(url, axiosConfig);
        setData(response.data);
      } catch (err) {
        setError(t(err instanceof Error ? err.message : 'fetchError'));
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token, t, userRole]);

  // Helper to safely get dashboard metrics
  const getDashboardMetrics = () => {
    if (!data) return { totalUsers: 0, totalCourses: 0, followedCourses: 0, totalQuizzes: 0, followedQuizzes: 0, usersByGrade: [], availableCourses: 0, availableQuizzes: 0 };

    if ('global' in data) { // Ministry data
      return {
        totalUsers: data.global.totalUsers,
        totalCourses: data.global.totalCourses,
        followedCourses: data.global.followedCourses,
        totalQuizzes: data.global.totalQuizzes,
        followedQuizzes: data.global.followedQuizzes,
        usersByGrade: data.global.usersByGrade,
        availableCourses: data.global.totalCourses, // For ministry, use totalCourses as available
        availableQuizzes: data.global.totalQuizzes, // For ministry, use totalQuizzes as available
        totalCompanies: data.global.totalCompanies, // Add totalCompanies for ministry
      };
    } else { // Company data
      return {
        totalUsers: data.company.totalUsers,
        totalCourses: data.company.availableCourses, // Rename for consistency
        followedCourses: data.company.followedCourses,
        totalQuizzes: data.company.availableQuizzes, // Rename for consistency
        followedQuizzes: data.company.followedQuizzes,
        usersByGrade: data.company.usersByGrade,
        availableCourses: data.company.availableCourses,
        availableQuizzes: data.company.availableQuizzes,
      };
    }
  };

  const metrics = getDashboardMetrics();

  // Chart data configurations
  const courseDonutData = {
    labels: [t('availableCourses'), t('followedCourses')],
    datasets: [{
      data: [metrics.availableCourses, metrics.followedCourses],
      backgroundColor: ['#4F46E5', '#10B981'],
      borderColor: ['#fff', '#fff'],
      borderWidth: 1,
    }],
  };

  const quizDonutData = {
    labels: [t('availableQuizzes'), t('followedQuizzes')],
    datasets: [{
      data: [metrics.availableQuizzes, metrics.followedQuizzes],
      backgroundColor: ['#F59E0B', '#EC4899'],
      borderColor: ['#fff', '#fff'],
      borderWidth: 1,
    }],
  };

  const lineChartData = {
    labels: (data?.scores?.[selectedPeriod] || []).map((item: { month: any; }) => item.month),
    datasets: [{
      label: t('scoreActivity'),
      data: (data?.scores?.[selectedPeriod] || []).map((item: { score: any; }) => item.score),
      fill: true,
      borderColor: '#8B4513',
      backgroundColor: 'rgba(139, 69, 19, 0.2)',
      tension: 0.4,
    }],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const },
      title: { display: true, text: userRole === 'Admin Ministère' ? t('globalMetrics') : t('companyMetrics') },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: t('scoreActivity') },
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { callback: (value: any) => `${value}%` } }
    },
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">{t('loading')}</div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="max-w-[1600px] mx-auto p-6 lg:p-8">
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

          {/* Main Content */}
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

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: metrics.totalUsers, icon: BookOpen, color: 'bg-blue-500', label: userRole === 'Admin Ministère' ? 'totalUsers' : 'companyUsers' },
                    { value: metrics.totalCourses, icon: BookOpen, color: 'bg-green-500', label: 'totalCourses' },
                    { value: metrics.followedCourses, icon: CheckCircle, color: 'bg-yellow-500', label: 'followedCourses' },
                    ...(userRole === 'Admin Ministère' ? [{ value: metrics.totalCompanies, icon: Trophy, color: 'bg-purple-500', label: 'totalCompanies' }] : []),
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {userRole === 'Admin Ministère' ? t('usersByGradeGlobal') : t('usersByGradeCompany')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metrics.usersByGrade.map((item, index) => (
                      <div key={index} className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                        <h4 className="text-lg font-medium text-gray-800">{item.grade}</h4>
                        <p className="text-sm text-gray-600">{item.count} {t('users')}</p>
                        <div className="w-full bg-gray-300 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${(item.count / metrics.totalUsers) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: metrics.totalQuizzes, icon: Star, color: 'bg-blue-500', label: userRole === 'Admin Ministère' ? 'totalQuizzes' : 'availableQuizzes' },
                    { value: metrics.followedQuizzes, icon: CheckCircle, color: 'bg-green-500', label: 'followedQuizzes' },
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('quizStats')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { count: metrics.totalQuizzes, label: userRole === 'Admin Ministère' ? 'totalQuizzes' : 'availableQuizzes', status: 'available' },
                      { count: metrics.followedQuizzes, label: 'followedQuizzes', status: 'followed' },
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

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="ml-0">
                <div className="lg:col-span-1 lg:col-end-3">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('courseDistribution')}</h3>
                        <div className="h-80 relative">
                          <Doughnut data={courseDonutData} options={donutOptions} />
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('quizDistribution')}</h3>
                        <div className="h-80 relative">
                          <Doughnut data={quizDonutData} options={donutOptions} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">{t('scoreActivity')}</h3>
                        <select
                          className="border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white shadow-md"
                          value={selectedPeriod}
                          onChange={(e) => setSelectedPeriod(e.target.value as 'thisMonth' | 'lastMonth')}
                        >
                          <option value="thisMonth">{t('thisMonth')}</option>
                          <option value="lastMonth">{t('lastMonth')}</option>
                        </select>
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

export default MainContent;