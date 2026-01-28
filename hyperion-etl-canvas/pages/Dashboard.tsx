
import React, { memo, useEffect, useMemo, useState } from 'react';
import TopNav from '../components/TopNav';
import { useNavigate } from 'react-router-dom';
import { pipelineApi } from '../services/api'; // Real API
import { Icon } from '../components/common/Icon';
import { Loader } from '../components/common/Loader';
import { getStatusColor, getPipelineIconInfo } from '../utils/common';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  colorClass: string;
  isError?: boolean;
}

interface PipelineCardProps {
  pipeline: any; // Using backend Pipeline type
  onEdit: () => void;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Call real backend API
        const pipelinesData = await pipelineApi.getAll();
        setPipelines(pipelinesData);
      } catch (error: any) {
        console.error("Failed to fetch pipelines", error);
        setError(error.message || 'Failed to connect to backend');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute stats from pipelines
  const stats = useMemo(() => {
    return {
      totalPipelines: pipelines.length,
      runningNow: pipelines.filter(p => p.status === 'Running').length,
      criticalErrors: pipelines.filter(p => p.status === 'Error').length
    };
  }, [pipelines]);

  if (loading) {
    return <Loader fullScreen label="Loading Dashboard..." />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <TopNav />

      <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ETL Pipelines</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage, monitor, and configure your data extraction, transformation, and loading workflows.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/builder')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors"
            >
              <Icon name="add_circle" className="mr-2 text-lg" />
              New Pipeline
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon="schema"
            label="Total Pipelines"
            value={stats?.totalPipelines || 0}
            colorClass="bg-blue-50 text-primary-600 dark:bg-blue-900/30"
          />
          <StatCard
            icon="motion_photos_on"
            label="Running Now"
            value={stats?.runningNow || 0}
            colorClass="bg-green-50 text-green-600 dark:bg-green-900/30"
          />
          <StatCard
            icon="report_problem"
            label="Critical Errors"
            value={stats?.criticalErrors || 0}
            colorClass="bg-red-50 text-red-600 dark:bg-red-900/30"
            isError
          />
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search pipelines..."
            />
          </div>
          <div className="flex gap-4">
            <SelectDropdown label="All Sources" />
            <SelectDropdown label="All Destinations" />
            <SelectDropdown label="Status" />
          </div>
        </div>

        {/* Pipelines Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {pipelines.map(pipeline => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onEdit={() => navigate('/builder')}
            />
          ))}
        </div>

      </main>
    </div>
  );
};

// Sub-components for Dashboard
const StatCard = memo(({ icon, label, value, colorClass, isError }: StatCardProps) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border ${isError ? 'border-l-4 border-l-red-500 border-y border-r border-gray-200 dark:border-gray-700' : 'border border-gray-200 dark:border-gray-700'} flex items-center`}>
    <div className={`flex-shrink-0 p-3 rounded-lg ${colorClass}`}>
      <Icon name={icon} className="text-2xl" />
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{label}</p>
      <p className={`text-3xl font-bold ${isError ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{value}</p>
    </div>
  </div>
));

const SelectDropdown = memo(({ label }: { label: string }) => (
  <select className="bg-white block w-40 pl-3 pr-8 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
    <option>{label}</option>
  </select>
));

const PipelineCard = memo(({ pipeline, onEdit }: PipelineCardProps) => {
  const { name, id, status, source, dest, lastRun, dataSize } = pipeline;

  const { icon, bg: iconBg } = getPipelineIconInfo(name);
  const statusColor = getStatusColor(status);

  const getStatusIconElement = (s: string) => {
    if (s === 'Running') return <span className="animate-pulse w-2 h-2 mr-1.5 bg-blue-500 rounded-full"></span>;
    if (s === 'Success') return <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>;
    if (s === 'Error') return <Icon name="error_outline" className="text-sm mr-1" />;
    return <span className="w-2 h-2 mr-1.5 bg-gray-500 rounded-full"></span>;
  }

  return (
    <div
      onClick={onEdit}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconBg}`}>
              <Icon name={icon} className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID: {id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {getStatusIconElement(status)}
            {status}
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Icon name="login" className="text-gray-400 text-lg" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{source}</span>
          </div>
          <Icon name="arrow_forward" className="text-gray-400 text-sm" />
          <div className="flex items-center gap-2">
            <Icon name="logout" className="text-gray-400 text-lg" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{dest}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-5">
          <div className="flex items-center gap-1">
            <Icon name="schedule" className="text-sm" />
            {lastRun}
          </div>
          <div className="flex items-center gap-1">
            <Icon name="storage" className="text-sm" />
            {dataSize}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between">
          <button className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
            <Icon name="play_arrow" className="text-lg" />
            Run Now
          </button>
          <div className="flex gap-4">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-white">
              <Icon name="settings" className="text-lg" />
              Config
            </button>
            <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-white">
              <Icon name="history" className="text-lg" />
              History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
