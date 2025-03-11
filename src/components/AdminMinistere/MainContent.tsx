import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity,  BookOpen, Building2, Users } from 'lucide-react';
import { Card, Title, BarChart, DonutChart } from '@tremor/react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, Bar } from 'recharts';
import {  Clock, Award,  BookMarked, HelpCircle, Settings, Menu, X,  TrendingUp, Star, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';


// Définition de l'interface pour la réponse API
interface ApiResponse {
  count: number;
}

const MainContent = () => {
  // États pour stocker les données récupérées depuis l'API
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [entreprisesCount, setEntreprisesCount] = useState<number>(0);
  const [utilisateursCount, setUtilisateursCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, entreprisesRes, utilisateursRes] = await Promise.all([
          axios.get<ApiResponse>('http://localhost:8000/courses/count/'),
          axios.get<ApiResponse>('http://localhost:8000/entreprises/count/'),
          axios.get<ApiResponse>('http://localhost:8000/utilisateurs/count/')
        ]);

        setCoursesCount(coursesRes.data.count);
        setEntreprisesCount(entreprisesRes.data.count);
        setUtilisateursCount(utilisateursRes.data.count);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Erreur lors de la récupération des données:', error.message);
        } else {
          console.error('Une erreur inconnue est survenue');
        }
      }
    };

    fetchData();
  }, []);

  const courseData = [
    { name: 'Design', value: 40, color: '#8b5cf6' },
    { name: 'Code', value: 30, color: '#6366f1' },
    { name: 'Business', value: 20, color: '#ec4899' },
    { name: 'Data', value: 10, color: '#14b8a6' },
  ];
  
  const monthlyActiveUsers = [
    { month: 'Jan', users: 2400 },
    { month: 'Feb', users: 3600 },
    { month: 'Mar', users: 4000 },
    { month: 'Apr', users: 3800 },
    { month: 'May', users: 4200 },
    { month: 'Jun', users: 5000 },
  ];
  
  const completionRates = [
    { category: 'Design', rate: 85 },
    { category: 'Code', rate: 78 },
    { category: 'Business', rate: 92 },
    { category: 'Data', rate: 88 },
  ];
  
  const quizPerformance = [
    { month: 'Jan', average: 82 },
    { month: 'Feb', average: 85 },
    { month: 'Mar', average: 83 },
    { month: 'Apr', average: 87 },
    { month: 'May', average: 89 },
    { month: 'Jun', average: 88 },
  ];
  
  const userFeedback = [
    { rating: 5, count: 450 },
    { rating: 4, count: 320 },
    { rating: 3, count: 120 },
    { rating: 2, count: 40 },
    { rating: 1, count: 20 },
  ];
  
  const regions = [
    { name: 'North America', students: 4500 },
    { name: 'Europe', students: 3800 },
    { name: 'Asia', students: 5200 },
    { name: 'South America', students: 2100 },
    { name: 'Africa', students: 1800 },
    { name: 'Oceania', students: 900 },
  ];
  
 
  
  function StatsCard({ icon: Icon, label, value, subtext, color }: any) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
            {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
          </div>
        </div>
      </div>
    );
  }
  
  function FeedbackCard({ rating, count, total }: { rating: number; count: number; total: number }) {
    const percentage = Math.round((count / total) * 100);
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 w-24">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          <span className="font-medium">{rating}</span>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-yellow-400 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="w-16 text-right text-sm text-gray-600">
          {percentage}%
        </div>
      </div>
    );
  }
  

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const totalFeedback = userFeedback.reduce((acc, curr) => acc + curr.count, 0);
    const averageRating = userFeedback.reduce((acc, curr) => acc + (curr.rating * curr.count), 0) / totalFeedback;
  
    return (
      <div className="p-6 bg-gray-50 min-h-screen ">
            
          
        
        <main className="w-full flex flex-col">
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between max-w-[1920px] mx-auto">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold">Dashboard</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search courses..."
                    className="w-full lg:w-[300px] px-4 py-2 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
               
              </div>
            </div>
          </header>
  
          <div className="w-full flex flex-col">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={Users}
                label="Active Learners"
                value="18,492"
                subtext="+12% this month"
                color="bg-blue-500"
              />
              <StatsCard
                icon={TrendingUp}
                label="Completion Rate"
                value="85.7%"
                subtext="Course average"
                color="bg-green-500"
              />
              <StatsCard
                icon={Award}
                label="Quiz Performance"
                value="87.2%"
                subtext="Average score"
                color="bg-orange-500"
              />
              <StatsCard
                icon={MessageCircle}
                label="User Satisfaction"
                value={`${averageRating.toFixed(1)}/5.0`}
                subtext={`${totalFeedback} reviews`}
                color="bg-purple-500"
              />
            </div>
  
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Active Users Trend */}
              <Card>
                <Title>Active Users Trend</Title>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyActiveUsers}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
  
              {/* Course Completion Rates */}
              <Card>
                <Title>Course Completion Rates</Title>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completionRates} categories={[]} index={''}>
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
  
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Distribution */}
              <Card>
                <Title>Course Distribution</Title>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {courseData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
  
              {/* Quiz Performance Trend */}
              <Card>
                <Title>Quiz Performance Trend</Title>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quizPerformance}>
                      <XAxis dataKey="month" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="average" stroke="#ec4899" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
  
              {/* User Feedback */}
              <Card>
                <Title>User Feedback</Title>
                <div className="mt-6 space-y-4">
                  {userFeedback.map((feedback) => (
                    <FeedbackCard
                      key={feedback.rating}
                      rating={feedback.rating}
                      count={feedback.count}
                      total={totalFeedback}
                    />
                  ))}
                </div>
              </Card>
            </div>
  
            {/* Regional Distribution */}
            <div className="mt-8">
              <Card>
                <Title>Regional Distribution</Title>
                <DonutChart
                  className="mt-6"
                  data={regions}
                  category="students"
                  index="name"
                  valueFormatter={(number: number | bigint) => Intl.NumberFormat('us').format(number).toString()}
                  colors={['slate', 'violet', 'indigo', 'rose', 'cyan', 'amber']}
                />
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  };
  




export default MainContent;