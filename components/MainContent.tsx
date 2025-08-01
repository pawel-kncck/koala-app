import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DataStudioTab } from './DataStudioTab';
import { ContextTab } from './ContextTab';
import { ChatTab } from './ChatTab';

interface MainContentProps {
  projectName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MainContent({
  projectName,
  activeTab,
  onTabChange,
}: MainContentProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl text-[#ECECF1]">{projectName}</h1>
      </div>
      <div className="border-b border-gray-600 mx-6"></div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="bg-transparent rounded-none px-6">
          <TabsTrigger
            value="data-studio"
            className="data-[state=active]:bg-gray-600 data-[state=active]:text-[#ECECF1] text-gray-400"
          >
            Data Studio
          </TabsTrigger>
          <TabsTrigger
            value="context"
            className="data-[state=active]:bg-gray-600 data-[state=active]:text-[#ECECF1] text-gray-400"
          >
            Context
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-gray-600 data-[state=active]:text-[#ECECF1] text-gray-400"
          >
            Chat
          </TabsTrigger>
        </TabsList>
        <div className="border-b border-gray-600 mx-6"></div>

        <TabsContent value="data-studio" className="h-full m-0">
          <DataStudioTab />
        </TabsContent>
        <TabsContent value="context" className="h-full m-0">
          <ContextTab />
        </TabsContent>
        <TabsContent value="chat" className="flex-1 m-0 min-h-0">
          <ChatTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
