import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CheckCircle, Info } from 'lucide-react';

export function ContextTab() {
  const [context, setContext] = useState('');
  const [savedContext, setSavedContext] = useState('');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(context !== savedContext);
  }, [context, savedContext]);

  const handleSave = () => {
    setSavedContext(context);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
  };

  const placeholderText = `Example context:

This project is for analyzing our Q3 sales. The 'QTY' column represents the number of units sold, and 'RRP' is the recommended retail price.

Key business metrics to track:
• Total revenue (QTY × RRP)
• Average units per transaction
• Top selling products by region
• Month-over-month growth rate

Important notes:
• Sales data is updated weekly
• Exclude returns from analysis
• Focus on products launched this year`;

  return (
    <div className="h-full p-6 flex flex-col space-y-4 max-w-4xl mx-auto">
      <div>
        <h3 className="text-lg text-[#ECECF1] mb-2">Project Context</h3>
        <p className="text-gray-400 text-sm">
          Provide business context about your data to help the AI understand your specific needs and give more relevant insights.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-medium mb-1">Why context matters</p>
          <p className="text-gray-400">
            The AI will use this information to understand your business terminology, goals, and specific requirements. 
            The more context you provide, the more tailored and actionable the insights will be.
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="flex-1 bg-gray-700 border-gray-600 text-[#ECECF1] placeholder-gray-400 resize-none font-mono text-sm"
          placeholder={placeholderText}
        />
        <div className="mt-2 text-xs text-gray-400">
          {context.length} characters
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showSaveConfirmation && (
            <div className="flex items-center space-x-2 text-green-400 animate-fade-in">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Context saved successfully!</span>
            </div>
          )}
          {hasUnsavedChanges && !showSaveConfirmation && (
            <span className="text-sm text-yellow-400">Unsaved changes</span>
          )}
        </div>
        <Button 
          onClick={handleSave}
          disabled={!context.trim() || !hasUnsavedChanges}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Context
        </Button>
      </div>
    </div>
  );
}