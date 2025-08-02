# Koala - AI-Powered Data Co-Pilot

## Overview

Koala is an AI-powered data analysis platform that bridges the critical gap between your data and meaningful insights. While generic LLMs lack business context and traditional data tools require specialized expertise, Koala creates a project-based environment where AI understands YOUR specific business logic, metrics, and goals.

### The Problem We Solve

Modern businesses are data-rich but insight-poor. Current solutions force you to choose between:

- **Generic AI tools** (like ChatGPT) that can't provide meaningful insights about your specific dataset
- **Complex data tools** that require coding expertise, creating bottlenecks and slowing decision-making

### Our Solution: Context-Aware Data Analysis

Koala provides an AI co-pilot that understands your business context through a simple three-step process:

1. **Upload your data** securely to a project workspace
2. **Teach the AI** your specific business context, metrics, and goals
3. **Analyze through chat** - ask questions in plain language and get relevant, actionable insights

### Key MVP Features

- **Project-Based Environment**: Organize your data and context by project
- **Context Definition**: Teach the AI about your specific business logic and metrics
- **Conversational Analysis**: Natural language interface for data exploration
- **Smart Insights**: AI that suggests relevant metrics and generates testable hypotheses
- **Secure Data Handling**: Your data stays private and secure within your project

### Target Audience: The "Citizen Data Analyst"

Our primary users are data-savvy professionals who:

- Are deeply familiar with their business domain but not programmers
- Work comfortably with data in Excel or Google Sheets
- Understand their KPIs and business questions
- Find coding in Python/SQL a significant barrier to quick insights
- Have been frustrated by generic AI tools' lack of specific, actionable results

**Typical Roles**: Marketing Analysts, Business Analysts, Product Managers, Operations Managers, Founders

## Development Phases

### Current Status: MVP Development

The project follows a five-phase iterative development approach:

1. **Phase 1: "Ugly Duckling"** - Clean, functional UI foundation
2. **Phase 2: "Baby Shark"** - Core functionality with data upload, context saving, and basic chat
3. **Phase 3: "Growing Panda"** - Data intelligence with Python/Pandas execution
4. **Phase 4: "Mysterious Owl"** - Proactive insights and automated analysis
5. **Phase 5: MVP Deployment** - Cloud deployment with full CI/CD

### Core User Experience (MVP)

The MVP centers around three interconnected flows:

1. **Data Studio**: Upload and manage CSV files within projects
2. **Context Definition**: Provide business context that makes the AI understand your specific data
3. **Conversational Analysis**: Chat interface where you ask questions and receive contextualized insights

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for backend services)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Koala
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
# Create .env file
cp .env.example .env

# Add your Supabase credentials
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up Supabase configuration in `utils/supabase/info.tsx`:

```typescript
export const supabaseInfo = {
  projectId: 'your-project-id',
  publicAnonKey: 'your-public-anon-key',
};
```

### Running Locally

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Development Setup with Claude Code

### Setting Up CLAUDE.md

This project includes specific configuration for Claude Code to ensure consistent development practices. Before starting development:

1. **Ensure CLAUDE.md exists in the project root** - This file contains critical instructions for commit practices and logging

2. **Create the logging directory structure**:

```bash
# Create .claude directory and log files
mkdir -p .claude
touch .claude/development-log.md
touch .claude/debugging-log.md
touch .claude/decision-log.md
```

3. **Initialize log files** with the templates provided in CLAUDE.md

4. **Run Claude Code init**:

```bash
claude /init
```

### Critical Development Requirements

#### 🔴 Granular Commit Strategy (MANDATORY)

**Every completed task requires its own commit.** This is non-negotiable.

- Commit after EVERY todo item completion
- Never batch multiple changes into one commit
- Even small changes (typos, comments) get their own commits

**Commit Message Format**:

```
<type>(<scope>): <description>

Todo: <completed todo item>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `config`

#### 📝 Comprehensive Logging System (MANDATORY)

Three log files must be maintained throughout development:

1. **Development Log** (`.claude/development-log.md`):

   - Updated after EVERY code change
   - Includes commit hash, files modified, and implementation details
   - Documents architectural decisions

2. **Debugging Log** (`.claude/debugging-log.md`):
   - Documents all debugging sessions
   - Tracks symptoms, hypotheses, actions, and resolutions
   - Includes post-mortem lessons learned

3. **Decision Log** (`.claude/decision-log.md`):
   - Records ALL instances where Claude asks for permission or decisions
   - Tracks what action was intended and why permission was needed
   - Documents human decisions and settings to prevent future asks
   - Helps identify patterns in permission requests

#### Example Workflow

```bash
# 1. Start session - Update todo list in development log
# 2. Work on first todo item
# 3. Complete todo item
# 4. IMMEDIATELY:
   - git add .
   - git commit -m "feat(component): add new feature"
   - Update development log with changes
# 5. Move to next todo item
```

## Project Architecture

### Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Mantine UI with Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Python/FastAPI
- **Database**: PostgreSQL with Redis caching
- **AI Integration**: OpenAI API
- **Infrastructure**: Docker/Kubernetes on AWS

### Core Components

1. **Data Upload & Processing**: Intelligent data ingestion with AI-assisted cleaning
2. **Analysis Canvas**: Interactive workspace for data exploration
3. **Visualization Engine**: AI-powered chart generation with full transparency
4. **Collaboration System**: Real-time multi-user editing and sharing
5. **Export & Reporting**: Professional report generation with data lineage

## Contributing

### Before You Start

1. Read and understand `CLAUDE.md` completely
2. Set up the logging system
3. Configure your development environment
4. Review the commit and logging requirements

### Development Process

1. **Plan**: Create a detailed todo list in the development log
2. **Implement**: Complete one task at a time
3. **Commit**: Make a commit after each completed task
4. **Log**: Update the development log immediately after committing
5. **Debug**: Use the debugging log for any issues encountered

### Quality Standards

- Every commit must represent one logical change
- All code changes must be logged
- Debugging sessions must be fully documented
- No debugging code (console.logs) in commits

## Support

For questions about:

- Product features: Check [https://support.anthropic.com](https://support.anthropic.com)
- API documentation: Visit [https://docs.anthropic.com](https://docs.anthropic.com)
- Development setup: Review `CLAUDE.md` and this README

## License

[License information to be added]

---

**Remember**: Commits are cheap, lost work is expensive. Follow the logging and commit requirements religiously - your future self will thank you!
