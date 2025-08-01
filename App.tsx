import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentProject, setCurrentProject] = useState('Data Analysis Project');
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="h-screen flex bg-[#343541] text-[#ECECF1] overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentProject={currentProject}
        onProjectSelect={setCurrentProject}
      />
      <MainContent
        projectName={currentProject}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
