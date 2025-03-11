import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle, BrainCircuit, Trophy, GraduationCap } from 'lucide-react';

function Tableau() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Section: Header and Progress Section */}
      <div className="flex flex-col md:flex-row gap-8 p-8 bg-blue-600 text-white">
        {/* Header */}
        <div className="flex-1 space-y-4 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            {t('eLearningPlatform')}
          </h1>
          <p className="text-blue-100 text-lg">{t('platformDescription')}</p>
        </div>

        {/* Progress Section */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 text-gray-800">
          <div className="flex items-center justify-between">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="stroke-current text-blue-100"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="stroke-current text-yellow-400"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray="352"
                  strokeDashoffset="88"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                75%
              </div>
            </div>
            <div className="flex-1 ml-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span>{t('courseInProgress')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                  <span>{t('completedCourses')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                  <span>{t('notStartedCourses')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Stats Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg text-white hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">{t('availableCourses')}</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">{t('followedCourses')}</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg text-white hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-4">
              <BrainCircuit className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">{t('courseQuiz')}</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-xl shadow-lg text-white hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-4">
              <Trophy className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">{t('completedQuizzes')}</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Tableau;
