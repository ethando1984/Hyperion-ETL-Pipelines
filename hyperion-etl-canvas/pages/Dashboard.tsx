import React, { memo, useEffect, useMemo, useState } from 'react';
import TopNav from '../components/TopNav';
import { useNavigate } from 'react-router-dom';
import { pipelineApi } from '../services/api';
import { Icon } from '../components/common/Icon';
import { Loader } from '../components/common/Loader';
import { getStatusColor, getPipelineIconInfo } from '../utils/common';
import { PipelineFormModal } from '../components/PipelineFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useToast } from '../contexts/ToastContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const data = await pipelineApi.getAll();
      setPipelines(data);
    } catch (err: any) {
      console.error("Failed to fetch pipelines", err);
      showError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  // Filtered pipelines
  const filteredPipelines = useMemo(() => {
    return pipelines.filter(p => {
      const matchesSearch = !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = !domainFilter || p.domain === domainFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [pipelines, searchQuery, domainFilter, statusFilter]);

  const stats = useMemo(() => ({
    totalPipelines: pipelines.length,
    runningNow: pipelines.filter(p => p.status === 'Running').length,
    criticalErrors: pipelines.filter(p => p.status === 'Error').length
  }), [pipelines]);

  const uniqueDomains = useMemo(() =>
    Array.from(new Set(pipelines.map(p => p.domain).filter(Boolean))),
    [pipelines]
  );

  const handleCreate = () => {
    setSelectedPipeline(null);
    setShowFormModal(true);
  };

  const handleEdit = (pipeline: any) => {
    setSelectedPipeline(pipeline);
    setShowFormModal(true);
  };

  const handleDelete = (pipeline: any) => {
    setSelectedPipeline(pipeline);
    setShowDeleteModal(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDomainFilter('');
    setStatusFilter('');
  };

  if (loading) return <Loader fullScreen label="Loading Dashboard..." />;

  const hasFilters = searchQuery || domainFilter || statusFilter;
  const showEmpty = pipelines.length === 0 && !hasFilters;
  const showNoResults = filteredPipelines.length === 0 && hasFilters;

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
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors"
            >
              <Icon name="add_circle" className="mr-2 text-lg" />
              New Pipeline
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon="schema" label="Total Pipelines" value={stats.totalPipelines} colorClass="bg-blue-50 text-primary-600 dark:bg-blue-900/30" />
          <StatCard icon="motion_photos_on" label="Running Now" value={stats.runningNow} colorClass="bg-green-50 text-green-600 dark:bg-green-900/30" />
          <StatCard icon="report_problem" label="Critical Errors" value={stats.criticalErrors} colorClass="bg-red-50 text-red-600 dark:bg-red-900/30" isError />
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search pipelines..."
            />
          </div>
          <div className="flex gap-4">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="bg-white block w-40 pl-3 pr-8 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All Domains</option>
              {uniqueDomains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white block w-40 pl-3 pr-8 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="Success">Success</option>
              <option value="Running">Running</option>
              <option value="Error">Error</option>
              <option value="Paused">Paused</option>
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {showEmpty && (
          <div className="text-center py-12">
            <Icon name="post_add" className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pipelines yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first ETL pipeline</p>
            <button onClick={handleCreate} className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
              <Icon name="add_circle" className="mr-2" />
              Create Pipeline
            </button>
          </div>
        )}

        {/* No Results */}
        {showNoResults && (
          <div className="text-center py-12">
            <Icon name="search_off" className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No matching pipelines</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters</p>
            <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 font-medium">
              Clear all filters
            </button>
          </div>
        )}

        {/* Pipelines Grid */}
        {!showEmpty && !showNoResults && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredPipelines.map(pipeline => (
              <PipelineCard
                key={pipeline.id}
                pipeline={pipeline}
                onEdit={() => handleEdit(pipeline)}
                onDelete={() => handleDelete(pipeline)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <PipelineFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        pipeline={selectedPipeline}
        onSuccess={fetchPipelines}
      />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        pipeline={selectedPipeline}
        onSuccess={fetchPipelines}
      />
    </div>
  );
};

const StatCard = memo(({ icon, label, value, colorClass, isError }: any) => (
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

const PipelineCard = memo(({ pipeline, onEdit, onDelete }: any) => {
  const { name, id, status } = pipeline;
  const { icon, bg: iconBg } = getPipelineIconInfo(name);
  const statusColor = getStatusColor(status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-300 transition-all group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconBg}`}>
              <Icon name={icon} className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID: {id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {status}
          </span>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between">
          <button onClick={onEdit} className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
            <Icon name="edit" className="text-lg" />
            Edit
          </button>
          <button onClick={onDelete} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
            <Icon name="delete" className="text-lg" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
