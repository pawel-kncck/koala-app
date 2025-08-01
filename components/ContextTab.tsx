import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export function ContextTab() {
  const [context, setContext] = useState(`This project analyzes customer data to identify key patterns and insights for improving our marketing strategy.

Key objectives:
• Understand customer demographics and behavior
• Identify high-value customer segments
• Analyze purchase patterns and trends
• Develop targeted marketing campaigns

Data sources:
• Customer database (CRM)
• Sales transaction data
• Website analytics
• Survey responses`);

  const handleSave = () => {
    // Mock save functionality
    alert('Context saved successfully!');
  };

  return (
    <div className="h-full p-6 flex flex-col space-y-4">
      <div>
        <h3 className="text-lg text-[#ECECF1] mb-2">Project Context</h3>
        <p className="text-gray-400 text-sm">
          Add context, objectives, and notes about your project here.
        </p>
      </div>
      
      <Textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="flex-1 bg-gray-700 border-gray-600 text-[#ECECF1] placeholder-gray-400 resize-none"
        placeholder="Enter your project context, objectives, and notes here..."
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Context
        </Button>
      </div>
    </div>
  );
}