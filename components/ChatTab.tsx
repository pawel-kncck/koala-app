import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI assistant for data analysis. I can help you understand your data, create visualizations, and generate insights. What would you like to explore today?",
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'user',
      content:
        'Can you analyze the customer data I uploaded and identify the top customer segments?',
      timestamp: new Date(),
    },
    {
      id: '3',
      role: 'assistant',
      content:
        "I've analyzed your customer data and identified several key segments:\n\n1. **High-Value Urban Customers** (30-45 years old, major cities)\n   - Average spend: $2,500/year\n   - Prefer premium products\n   - High brand loyalty\n   - Represent 25% of total revenue\n\n2. **Young Professionals** (25-35 years old)\n   - Tech-savvy and mobile-first\n   - Price-sensitive but quality-conscious\n   - Active on social media\n   - Growth potential: 40% YoY\n\n3. **Family Shoppers** (35-50 years old)\n   - Bulk purchases and subscription preferences\n   - Value-oriented decision making\n   - Seasonal buying patterns\n   - Strong referral behavior\n\n4. **Senior Loyalists** (50+ years old)\n   - Consistent purchasing patterns\n   - Prefer traditional channels\n   - High lifetime value\n   - Brand advocates\n\nWould you like me to dive deeper into any of these segments or analyze their purchasing behaviors?",
      timestamp: new Date(),
    },
    {
      id: '4',
      role: 'user',
      content:
        "That's fascinating! Can you tell me more about the Young Professionals segment? What are their specific preferences and how can we better target them?",
      timestamp: new Date(),
    },
    {
      id: '5',
      role: 'assistant',
      content:
        "Great question! Here's a detailed analysis of the Young Professionals segment:\n\n**Demographics & Behavior:**\n- Age: 25-35 years\n- Income: $45K - $85K annually\n- Education: College-educated (80%+)\n- Location: Urban areas and suburbs\n- Shopping frequency: 2-3x per week\n\n**Digital Preferences:**\n- Mobile usage: 85% of purchases via mobile\n- Social media influence: Instagram (75%), TikTok (45%), LinkedIn (60%)\n- Reviews matter: 90% read reviews before purchasing\n- Speed expectations: Same-day or next-day delivery preferred\n\n**Product Preferences:**\n- Quality over quantity\n- Sustainable and eco-friendly options\n- Tech gadgets and accessories\n- Health and wellness products\n- Experience-based purchases\n\n**Targeting Recommendations:**\n1. **Mobile-First Marketing**: Optimize all campaigns for mobile\n2. **Influencer Partnerships**: Collaborate with micro-influencers\n3. **Social Proof**: Highlight user-generated content and reviews\n4. **Convenience Features**: Offer quick checkout and fast delivery\n5. **Values Alignment**: Emphasize sustainability and social responsibility\n\nWould you like me to create a specific marketing strategy for this segment?",
      timestamp: new Date(),
    },
    {
      id: '6',
      role: 'user',
      content:
        'Yes, please create a comprehensive marketing strategy for the Young Professionals segment. Include budget recommendations and expected ROI.',
      timestamp: new Date(),
    },
    {
      id: '7',
      role: 'assistant',
      content:
        '**Young Professionals Marketing Strategy**\n\n**Campaign Overview:**\n"Smart Choices for Smart Lives" - A 6-month integrated campaign targeting efficiency, quality, and values alignment.\n\n**Channel Strategy & Budget Allocation:**\n\n1. **Social Media Marketing (40% - $120K)**\n   - Instagram & TikTok ads: $80K\n   - LinkedIn professional targeting: $25K\n   - Influencer partnerships: $15K\n   - Expected reach: 2.5M impressions\n\n2. **Mobile App Optimization (25% - $75K)**\n   - UX/UI improvements: $45K\n   - Push notification campaigns: $20K\n   - App store optimization: $10K\n\n3. **Content Marketing (20% - $60K)**\n   - Video content creation: $35K\n   - Blog and educational content: $15K\n   - User-generated content campaigns: $10K\n\n4. **Email & Automation (10% - $30K)**\n   - Personalized email sequences: $20K\n   - Marketing automation setup: $10K\n\n5. **Partnership & Events (5% - $15K)**\n   - Co-marketing with complementary brands\n   - Virtual events and webinars\n\n**Expected ROI:**\n- Investment: $300K over 6 months\n- Projected revenue increase: $1.2M (4:1 ROI)\n- New customer acquisition: 5,000+ customers\n- Customer lifetime value increase: 25%\n\n**Key Metrics to Track:**\n- Mobile conversion rate\n- Social media engagement\n- Cost per acquisition (CPA)\n- Customer lifetime value (CLV)\n- Net Promoter Score (NPS)\n\nWould you like me to break down the implementation timeline or dive deeper into any specific channel?',
      timestamp: new Date(),
    },
    {
      id: '8',
      role: 'user',
      content:
        'This is excellent! Can you also analyze the seasonal trends in our data? I want to understand how to optimize inventory and marketing spend throughout the year.',
      timestamp: new Date(),
    },
    {
      id: '9',
      role: 'assistant',
      content:
        "**Seasonal Trends Analysis**\n\nI've analyzed your historical data to identify key seasonal patterns:\n\n**Q1 (January - March): Recovery & Planning**\n- Sales typically down 15-20% post-holidays\n- Young Professionals: Focus on wellness, productivity tools\n- Family Shoppers: Back-to-school prep begins in March\n- Marketing spend: Reduce by 25%, focus on retention\n\n**Q2 (April - June): Growth & Engagement**\n- Steady growth period: 10-15% increase\n- Spring cleaning drives home goods sales\n- Wedding season affects gift purchases\n- Optimal time for customer acquisition campaigns\n\n**Q3 (July - September): Peak Preparation**\n- Summer surge: 20-25% increase in July-August\n- Back-to-school drives tech and supply sales\n- Travel-related purchases peak\n- Increase inventory by 30% for key categories\n\n**Q4 (October - December): Peak Season**\n- Revenue surge: 40-50% above baseline\n- Holiday shopping dominates\n- Gift cards and premium products perform best\n- Marketing spend should increase 60-70%\n\n**Category-Specific Trends:**\n- **Electronics**: Peak in November (Black Friday) and back-to-school\n- **Home & Garden**: Spring surge (April-May) and fall prep (September)\n- **Health & Wellness**: January spike, summer maintenance\n- **Fashion**: Seasonal transitions (March, June, September, December)\n\n**Inventory Optimization Recommendations:**\n1. **January**: Reduce inventory 20-30%, focus on clearance\n2. **March-April**: Begin building inventory for Q2 growth\n3. **June-July**: Major inventory build-up for Q3/Q4\n4. **September**: Final inventory push for holiday season\n5. **December**: Manage stock-outs while avoiding overstock\n\n**Marketing Spend Optimization:**\n- Q1: 20% of annual budget (retention focus)\n- Q2: 25% of annual budget (growth focus)\n- Q3: 25% of annual budget (acquisition focus)\n- Q4: 30% of annual budget (conversion focus)\n\nWould you like me to create a month-by-month action plan or analyze specific product categories in more detail?",
      timestamp: new Date(),
    },
    {
      id: '10',
      role: 'user',
      content:
        "Perfect! Now I'd like to understand our competitive position. Can you analyze how we stack up against our main competitors in terms of pricing, customer satisfaction, and market share?",
      timestamp: new Date(),
    },
    {
      id: '11',
      role: 'assistant',
      content:
        "**Competitive Analysis Report**\n\nBased on market data and customer feedback analysis:\n\n**Market Position Overview:**\nYou're currently ranked #3 in your primary market with 18% market share.\n\n**Competitor Breakdown:**\n\n**1. MarketLeader Corp (35% market share)**\n- Strengths: Brand recognition, extensive distribution\n- Pricing: 15-20% higher than yours\n- Customer satisfaction: 7.2/10\n- Weakness: Poor digital experience, slow innovation\n\n**2. InnovativeTech Inc (22% market share)**\n- Strengths: Cutting-edge products, strong R&D\n- Pricing: Premium positioning (25-30% higher)\n- Customer satisfaction: 8.1/10\n- Weakness: Limited product range, high prices\n\n**3. Your Company (18% market share)**\n- Strengths: Competitive pricing, good customer service\n- Pricing: Market average (baseline)\n- Customer satisfaction: 7.8/10\n- Opportunities: Digital transformation, brand building\n\n**4. ValueChoice Co (15% market share)**\n- Strengths: Low prices, wide availability\n- Pricing: 20-25% below market average\n- Customer satisfaction: 6.5/10\n- Weakness: Quality concerns, poor support\n\n**5. Others (10% combined)**\n- Various niche and regional players\n\n**Key Insights:**\n\n**Pricing Analysis:**\n- You're well-positioned in the value segment\n- Opportunity to increase prices 5-8% without losing competitiveness\n- Premium products could command 15-20% higher margins\n\n**Customer Satisfaction Gaps:**\n- Your NPS (Net Promoter Score): 42\n- Industry leader: 58\n- Main pain points: Delivery speed, product availability\n- Strengths: Customer service, product quality\n\n**Market Opportunities:**\n1. **Digital-First Strategy**: Competitors lag in mobile experience\n2. **Sustainability Focus**: Growing customer demand, limited competition\n3. **Personalization**: Opportunity to differentiate through AI-driven recommendations\n4. **Subscription Services**: Underdeveloped market segment\n\n**Strategic Recommendations:**\n1. **Short-term (3-6 months)**:\n   - Improve delivery speed and reliability\n   - Launch mobile app optimization\n   - Implement dynamic pricing strategy\n\n2. **Medium-term (6-12 months)**:\n   - Develop subscription service offerings\n   - Expand into underserved geographic markets\n   - Launch sustainability initiative\n\n3. **Long-term (12+ months)**:\n   - Consider strategic acquisitions\n   - Develop proprietary product lines\n   - Expand into adjacent markets\n\n**Expected Impact:**\n- Market share growth potential: 18% → 25% within 18 months\n- Revenue increase: 30-40% over 2 years\n- Customer satisfaction improvement: 7.8 → 8.5+\n\nWould you like me to dive deeper into any specific competitor or develop a detailed competitive response strategy?",
      timestamp: new Date(),
    },
    {
      id: '12',
      role: 'user',
      content:
        'This analysis is incredibly helpful! Can you also look at our customer retention rates and suggest strategies to improve customer lifetime value?',
      timestamp: new Date(),
    },
    {
      id: '13',
      role: 'assistant',
      content:
        '**Customer Retention & Lifetime Value Analysis**\n\n**Current Retention Metrics:**\n- Overall retention rate: 68% (12-month)\n- Industry benchmark: 75%\n- Customer churn rate: 32% annually\n- Average customer lifespan: 2.8 years\n\n**Retention by Segment:**\n1. **High-Value Urban**: 82% retention (Excellent)\n2. **Senior Loyalists**: 79% retention (Strong)\n3. **Family Shoppers**: 71% retention (Good)\n4. **Young Professionals**: 58% retention (Needs improvement)\n\n**Customer Lifetime Value (CLV) Analysis:**\n- Current average CLV: $1,850\n- Industry leader CLV: $2,400\n- Potential CLV with optimization: $2,650\n\n**Churn Analysis - Top Reasons:**\n1. **Price sensitivity** (35% of churned customers)\n2. **Product availability issues** (28%)\n3. **Poor delivery experience** (22%)\n4. **Lack of personalization** (18%)\n5. **Customer service issues** (15%)\n\n**Retention Improvement Strategies:**\n\n**1. Onboarding Optimization (Months 1-3)**\n- Welcome series with product education\n- First purchase incentives\n- Personal shopping assistant assignment\n- Expected impact: 15% improvement in early retention\n\n**2. Loyalty Program Enhancement**\n- Tiered rewards system\n- Exclusive early access to products\n- Birthday and anniversary perks\n- Referral bonuses (double points)\n- Expected impact: 12% retention improvement\n\n**3. Personalization Engine**\n- AI-driven product recommendations\n- Customized email content\n- Dynamic website experience\n- Predictive restocking reminders\n- Expected impact: 20% increase in repeat purchases\n\n**4. Customer Success Program**\n- Proactive outreach for at-risk customers\n- Quarterly check-ins for high-value customers\n- Usage optimization consultations\n- Expected impact: 25% reduction in churn\n\n**5. Subscription & Auto-Replenishment**\n- Subscribe & save programs (5-15% discount)\n- Smart reorder predictions\n- Flexible delivery schedules\n- Expected impact: 40% higher CLV for subscribers\n\n**Implementation Roadmap:**\n\n**Phase 1 (Months 1-2): Foundation**\n- Implement customer health scoring\n- Launch improved onboarding sequence\n- Upgrade loyalty program\n- Investment: $150K\n\n**Phase 2 (Months 3-4): Intelligence**\n- Deploy AI personalization\n- Launch customer success program\n- Implement churn prediction models\n- Investment: $200K\n\n**Phase 3 (Months 5-6): Scale**\n- Roll out subscription services\n- Advanced segmentation campaigns\n- Predictive analytics dashboard\n- Investment: $100K\n\n**Projected Financial Impact:**\n- Year 1 CLV improvement: $1,850 → $2,300 (+24%)\n- Year 2 CLV improvement: $2,300 → $2,650 (+15%)\n- Total program investment: $450K\n- Expected ROI: 380% over 2 years\n- Incremental revenue: $2.8M over 24 months\n\n**Quick Wins (Can implement immediately):**\n1. **Win-back email campaigns** for recent churned customers\n2. **At-risk customer alerts** based on purchase behavior\n3. **Feedback surveys** post-purchase and at key journey points\n4. **VIP treatment** for top 10% of customers\n\n**Success Metrics to Track:**\n- Monthly churn rate\n- Customer lifetime value by cohort\n- Net Promoter Score (NPS)\n- Customer effort score (CES)\n- Subscription adoption rate\n- Repeat purchase rate by segment\n\nWould you like me to create detailed playbooks for any of these strategies or help you prioritize which initiatives to implement first?',
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I understand your question. Let me analyze that for you... [This is a mock response. In a real application, this would be connected to an AI model that would provide actual analysis based on your data.]',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col min-h-0 max-w-4xl mx-auto w-full">
      {/* Messages */}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  /* User message - right aligned bubble */
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="bg-gray-600 rounded-2xl rounded-br-md px-4 py-3">
                        <div className="text-[#ECECF1] whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AI Assistant message - left aligned with avatar */
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600">
                      <Bot className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm text-gray-400">AI Assistant</div>
                      <div className="text-[#ECECF1] whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-6 bg-[#343541]">
        {/* Chat Input Container */}
        <div className="bg-gray-600 rounded-2xl border border-gray-500 p-4">
          <div className="flex items-center space-x-3">
            {/* Plus Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-[#ECECF1] hover:bg-gray-600 h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Input Field */}
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your data..."
                className="bg-transparent border-none text-[#ECECF1] placeholder-gray-400 focus:ring-0 focus:outline-none p-0 h-auto"
              />
            </div>

            {/* Send Button */}
            <div className="flex items-center">
              {input.trim() && (
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-[#ECECF1] hover:bg-gray-300 text-gray-800 h-8 w-8 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
