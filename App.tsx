import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { AuthProvider, useAuth } from './frontend/src/contexts/AuthContext';
import { LoginPage } from './frontend/src/pages/LoginPage';
import { RegisterPage } from './frontend/src/pages/RegisterPage';
import { ProtectedRoute } from './frontend/src/components/ProtectedRoute';
import api from './src/services/api';

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

function MainApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('data-studio');
  const [loading, setLoading] = useState(true);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectList = await api.projects.list();
      setProjects(projectList);
      
      // If no current project and projects exist, select the first one
      if (!currentProject && projectList.length > 0) {
        setCurrentProject(projectList[0]);
      }
      
      // If no projects exist, create a default one
      if (projectList.length === 0) {
        const newProject = await api.projects.create('Q3 Sales Analysis');
        setProjects([newProject]);
        setCurrentProject(newProject);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreate = async (name: string) => {
    try {
      const newProject = await api.projects.create(name);
      setProjects([...projects, newProject]);
      setCurrentProject(newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#343541] text-[#ECECF1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#343541] text-[#ECECF1] overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentProject={currentProject}
        projects={projects}
        onProjectSelect={handleProjectSelect}
        onProjectCreate={handleProjectCreate}
      />
      {currentProject && (
        <MainContent
          project={currentProject}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
