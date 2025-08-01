'use client';

import { useTranslations } from 'next-intl';
import { getToken } from '@/utils/auth/token';
import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Define types
interface JamaaDTO {
  id: number;
  nom: string;
}

interface MontakhibDTO {
  id: number;
  sex: 'Homme' | 'Femme';
  education: 'SANS' | 'PRIMAIRE' | 'COLLEGE' | 'LYCEE' | 'UNIVERSITAIRE';
  jamaa: JamaaDTO;
  dateNaissance: string;
}

interface StatsData {
  totalMontakhibs: number;
  genderStats: {
    homme: number;
    femme: number;
  };
  jamaaStats: {
    jamaaId: number;
    jamaaName: string;
    count: number;
  }[];
  educationStats: {
    education: string;
    count: number;
  }[];
  ageGroupStats: {
    group: string;
    count: number;
  }[];
}

const backendUrlGraphQL = process.env.NEXT_PUBLIC_API_GraphQL_URL || '';
const backendUrlRest = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const StatisticsPage: React.FC = () => {
  const t = useTranslations('stats');
  const token = getToken();
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch all Montakhibs with Jamaa names directly from GraphQL
        const query = `
          query {
            getAllMontakhibin {
              id
              sex
              education
              jamaa {
                id
                nom
              }
              dateNaissance
            }
          }
        `;
        
        const montakhibsRes = await fetch(backendUrlGraphQL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ query }),
        });
        
        if (!montakhibsRes.ok) throw new Error('Failed to fetch Montakhibs');
        
        const { data } = await montakhibsRes.json();
        const montakhibs: MontakhibDTO[] = data.getAllMontakhibin || [];
        
        // Calculate statistics
        const statsData = calculateStatistics(montakhibs);
        setStats(statsData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Calculate statistics from raw data
  const calculateStatistics = (montakhibs: MontakhibDTO[]): StatsData => {
    const totalMontakhibs = montakhibs.length;
    
    // Gender statistics
    const genderStats = {
      homme: montakhibs.filter(m => m.sex === 'Homme').length,
      femme: montakhibs.filter(m => m.sex === 'Femme').length
    };
    
    // Jamaa statistics - Use names directly from MontakhibDTO
    const jamaaStatsMap = new Map<number, { name: string; count: number }>();
    
    montakhibs.forEach(m => {
      const jamaaId = m.jamaa.id;
      const jamaaName = m.jamaa.nom;
      
      if (jamaaStatsMap.has(jamaaId)) {
        const existing = jamaaStatsMap.get(jamaaId)!;
        jamaaStatsMap.set(jamaaId, { ...existing, count: existing.count + 1 });
      } else {
        jamaaStatsMap.set(jamaaId, { name: jamaaName, count: 1 });
      }
    });
    
    const jamaaStats = Array.from(jamaaStatsMap.entries()).map(([jamaaId, data]) => ({
      jamaaId,
      jamaaName: data.name,
      count: data.count
    }));
    
    // Education statistics
    const educationStatsMap = new Map<string, number>();
    montakhibs.forEach(m => {
      const count = educationStatsMap.get(m.education) || 0;
      educationStatsMap.set(m.education, count + 1);
    });
    
    const educationStats = Array.from(educationStatsMap.entries()).map(([education, count]) => ({
      education,
      count
    }));
    
    // Age group statistics
    const ageGroups = {
      '18-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0,
      '60+': 0
    };
    
    const currentDate = new Date();
    montakhibs.forEach(m => {
      const birthDate = new Date(m.dateNaissance);
      let age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = currentDate.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age >= 18 && age <= 30) ageGroups['18-30']++;
      else if (age >= 31 && age <= 40) ageGroups['31-40']++;
      else if (age >= 41 && age <= 50) ageGroups['41-50']++;
      else if (age >= 51 && age <= 60) ageGroups['51-60']++;
      else if (age > 60) ageGroups['60+']++;
    });
    
    const ageGroupStats = Object.entries(ageGroups).map(([group, count]) => ({
      group,
      count
    }));
    
    return {
      totalMontakhibs,
      genderStats,
      jamaaStats,
      educationStats,
      ageGroupStats
    };
  };

  // Chart data for gender
  const genderChartData = {
    labels: [t('homme'), t('femme')],
    datasets: [
      {
        data: stats ? [stats.genderStats.homme, stats.genderStats.femme] : [0, 0],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for jamaas - Use actual names
  const jamaaChartData = {
    labels: stats?.jamaaStats.map(j => j.jamaaName) || [],
    datasets: [
      {
        data: stats?.jamaaStats.map(j => j.count) || [],
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#F97316', '#8B5CF6', '#EC4899', '#6366F1'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for education
  const educationChartData = {
    labels: stats?.educationStats.map(e => t(e.education.toLowerCase())) || [],
    datasets: [
      {
        data: stats?.educationStats.map(e => e.count) || [],
        backgroundColor: [
          '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for age groups
  const ageGroupChartData = {
    labels: stats?.ageGroupStats.map(a => a.group) || [],
    datasets: [
      {
        label: t('montakhibCount'),
        data: stats?.ageGroupStats.map(a => a.count) || [],
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.getDatasetMeta(0).total;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('ageDistribution'),
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${t('montakhibCount')}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-lg text-gray-600">{t('subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !stats ? (
          <div className="text-center py-10">
            <p className="text-lg text-red-500">{t('noData')}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
                <h3 className="text-lg font-medium text-gray-900">{t('totalMontakhibs')}</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalMontakhibs}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
                <h3 className="text-lg font-medium text-gray-900">{t('hommes')}</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 flex gap-2 items-center">
                  {stats.genderStats.homme}
                  <span className="text-lg font-normal text-gray-600">
                    ({((stats.genderStats.homme / stats.totalMontakhibs) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
                <h3 className="text-lg font-medium text-gray-900">{t('femmes')}</h3>
                <p className="mt-2 text-3xl font-bold text-pink-600 flex gap-2 items-center">
                  {stats.genderStats.femme}
                  <span className="text-lg font-normal text-gray-600">
                    ({((stats.genderStats.femme / stats.totalMontakhibs) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Gender Distribution */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('genderDistribution')}</h2>
                <div className="h-80">
                  <Pie data={genderChartData} options={pieChartOptions} />
                </div>
              </div>

              {/* Jamaa Distribution - Now shows actual jamaa names */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('jamaaDistribution')}</h2>
                <div className="h-80">
                  <Pie data={jamaaChartData} options={pieChartOptions} />
                </div>
              </div>

              {/* Education Distribution */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('educationDistribution')}</h2>
                <div className="h-80">
                  <Pie data={educationChartData} options={pieChartOptions} />
                </div>
              </div>

              {/* Age Group Distribution */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('ageGroupDistribution')}</h2>
                <div className="h-80">
                  <Bar data={ageGroupChartData} options={barChartOptions} />
                </div>
              </div>
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Jamaa Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">{t('jamaaDistribution')}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('jamaa')}
                        </th>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('montakhibCount')}
                        </th>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('percentage')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.jamaaStats.map((jamaa) => (
                        <tr key={jamaa.jamaaId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {jamaa.jamaaName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {jamaa.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {((jamaa.count / stats.totalMontakhibs) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Education Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">{t('educationDistribution')}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('education')}
                        </th>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('montakhibCount')}
                        </th>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('percentage')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.educationStats.map((edu) => (
                        <tr key={edu.education}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {t(edu.education.toLowerCase())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {edu.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {((edu.count / stats.totalMontakhibs) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;