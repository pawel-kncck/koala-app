import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDown, User, Settings, BookOpen, LogOut, Folder } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentProject: string;
  onProjectSelect: (project: string) => void;
}

interface Project {
  id: string;
  name: string;
  createdAt: Date;
}

const initialProjects: Project[] = [
  { id: '1', name: 'Q3 Sales Analysis', createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Customer Insights', createdAt: new Date('2024-01-10') },
  { id: '3', name: 'Market Research 2024', createdAt: new Date('2024-01-05') },
];

export function Sidebar({ collapsed, onToggle, currentProject, onProjectSelect }: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleNewProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        createdAt: new Date()
      };
      setProjects([newProject, ...projects]);
      onProjectSelect(newProject.name);
      setNewProjectName('');
      setIsNewProjectDialogOpen(false);
    }
  };

  const handleSettings = () => {
    alert('Settings functionality would be implemented here');
  };

  const handleLearnMore = () => {
    window.open('https://docs.anthropic.com', '_blank');
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
          onClick={() => setIsNewProjectDialogOpen(true)}
          className="text-[#ECECF1] hover:bg-gray-700 mb-4"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex flex-col space-y-2">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant="ghost"
              size="icon"
              onClick={() => onProjectSelect(project.name)}
              className={`text-[#ECECF1] hover:bg-gray-700 text-xs ${
                currentProject === project.name ? 'bg-gray-700' : ''
              }`}
              title={project.name}
            >
              <Folder className="h-4 w-4" />
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
            onClick={() => setIsNewProjectDialogOpen(true)}
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
              key={project.id}
              variant="ghost"
              className={`w-full justify-start text-left text-[#ECECF1] hover:bg-gray-700 ${
                currentProject === project.name ? 'bg-gray-700' : ''
              }`}
              onClick={() => onProjectSelect(project.name)}
            >
              <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="truncate">{project.name}</div>
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

      {/* New Project Dialog */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent className="bg-[#343541] border-gray-600 text-[#ECECF1]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name for your new data analysis project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name" className="text-sm text-gray-300">
                Project Name
              </Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Q3 Sales Analysis"
                className="mt-1 bg-gray-700 border-gray-600 text-[#ECECF1] placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleNewProject()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsNewProjectDialogOpen(false);
                setNewProjectName('');
              }}
              className="text-gray-400 hover:text-[#ECECF1] hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewProject}
              disabled={!newProjectName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}