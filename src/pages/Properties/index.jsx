import { useState } from 'react';
import ProjectsTab from './ProjectsTab';
import BuildingsTab from './BuildingsTab';
import UnitsTab from './UnitsTab';

const PropertiesModule = () => {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="space-y-6 h-full flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Properties Hub</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage projects, buildings, and property inventory</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 animate-slide-up" style={{animationDelay: '100ms'}}>
        <nav className="-mb-px flex space-x-8">
          {['projects', 'buildings', 'units'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                ${activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 py-4 animate-slide-up" style={{animationDelay: '200ms'}}>
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'buildings' && <BuildingsTab />}
        {activeTab === 'units' && <UnitsTab />}
      </div>
    </div>
  );
};

export default PropertiesModule;
