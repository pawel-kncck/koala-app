import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDown, User, Settings, BookOpen, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentProject: string;
  onProjectSelect: (project: string) => void;
}

const projects = [
  'Data Analysis Project',
  'Customer Insights',
  'Sales Dashboard',
  'ML Model Training',
  'Market Research',
];

export function Sidebar({ collapsed, onToggle, currentProject, onProjectSelect }: SidebarProps) {
  const [newProject, setNewProject] = useState('');

  const handleNewProject = () => {
    // For now, just show an alert - in a real app this would create a new project
    alert('New project functionality would be implemented here');
  };

  const handleSettings = () => {
    alert('Settings functionality would be implemented here');
  };

  const handleLearnMore = () => {
    alert('Learn more functionality would be implemented here');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      alert('Logout functionality would be implemented here');
    }
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-[#202123] border-r border-gray-600 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-[#ECECF1] hover:bg-gray-700 mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewProject}
          className="text-[#ECECF1] hover:bg-gray-700 mb-4"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex flex-col space-y-2">
          {projects.map((project, index) => (
            <Button
              key={project}
              variant="ghost"
              size="icon"
              onClick={() => onProjectSelect(project)}
              className={`text-[#ECECF1] hover:bg-gray-700 text-xs ${
                currentProject === project ? 'bg-gray-700' : ''
              }`}
              title={project}
            >
              {project.split(' ').map(word => word[0]).join('').substring(0, 2)}
            </Button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#ECECF1] hover:bg-gray-700 mt-4"
            >
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="right" 
            className="bg-[#343541] border-gray-600 text-[#ECECF1]"
          >
            <DropdownMenuItem 
              onClick={handleSettings}
              className="hover:bg-gray-700 cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLearnMore}
              className="hover:bg-gray-700 cursor-pointer"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Learn more
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLogout}
              className="hover:bg-gray-700 cursor-pointer text-red-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#202123] border-r border-gray-600 flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={handleNewProject}
            className="flex-1 bg-transparent border border-gray-600 text-[#ECECF1] hover:bg-gray-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-[#ECECF1] hover:bg-gray-700 ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        <div className="space-y-1">
          {projects.map((project) => (
            <Button
              key={project}
              variant="ghost"
              className={`w-full justify-start text-left text-[#ECECF1] hover:bg-gray-700 ${
                currentProject === project ? 'bg-gray-700' : ''
              }`}
              onClick={() => onProjectSelect(project)}
            >
              <div className="truncate">{project}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="flex-shrink-0 p-4 border-t border-gray-600">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 hover:bg-gray-700 rounded-lg p-2 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-[#ECECF1]" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#ECECF1]">John Doe</div>
                <div className="text-xs text-gray-400">john@example.com</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            className="bg-[#343541] border-gray-600 text-[#ECECF1] mb-2"
          >
            <DropdownMenuItem 
              onClick={handleSettings}
              className="hover:bg-gray-700 cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLearnMore}
              className="hover:bg-gray-700 cursor-pointer"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Learn more
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLogout}
              className="hover:bg-gray-700 cursor-pointer text-red-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}