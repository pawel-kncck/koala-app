# CLAUDE.md Placement Guide for Claude Code

## Where to Place CLAUDE.md

### Option 1: Project Root (Recommended)
Place the `CLAUDE.md` file in your project's root directory:

```
your-project/
├── CLAUDE.md          <-- Here
├── src/
├── tests/
├── package.json
└── README.md
```

**When it's used**: Claude Code automatically looks for and reads `CLAUDE.md` in the project root when you:
- Run `/init` command
- Start working on the project
- Open the project with Claude Code

### Option 2: Global Configuration
For rules you want to apply to ALL projects, create a global CLAUDE.md:

**macOS/Linux:**
```bash
~/.config/claude/CLAUDE.md
```

**Windows:**
```
%APPDATA%\claude\CLAUDE.md
```

### Option 3: Template Repository
Create a template repository with your standard setup:

```
my-claude-template/
├── CLAUDE.md
├── .claude/
│   ├── development-log.md
│   └── debugging-log.md
├── .gitignore
└── README.md
```

## Setting Up for /init Command

### Step 1: Create the CLAUDE.md file
Before running `/init`, create the CLAUDE.md file in your project root:

```bash
# Navigate to your project
cd /path/to/your/project

# Create CLAUDE.md with the commit and logging instructions
touch CLAUDE.md
# Then paste the content from the artifact above
```

### Step 2: Pre-create the .claude directory structure
```bash
# Create the .claude directory and log files
mkdir -p .claude
touch .claude/development-log.md
touch .claude/debugging-log.md

# Add initial content to the log files
echo "# Development Log

Project: $(basename $(pwd))
Started: $(date '+%Y-%m-%d')

## Session Guidelines
- Each session starts with a todo list
- Each completed todo gets a commit
- Each commit gets a log entry
- No exceptions to the above rules

---" > .claude/development-log.md

echo "# Debugging Log

Project: $(basename $(pwd))
Purpose: Track all debugging sessions and their resolutions

## Debugging Protocol
1. Document symptoms first
2. Form hypothesis before acting
3. Log every debugging action
4. Document the fix and verification
5. Include lessons learned

---" > .claude/debugging-log.md
```

### Step 3: Update .gitignore
Add appropriate entries to `.gitignore`:

```gitignore
# Claude Code logs (if you want them private)
# .claude/

# Or keep logs but ignore temporary files
.claude/tmp/
.claude/*.tmp

# Keep the logs in version control (recommended)
# This helps team members understand project history
```

### Step 4: Run Claude Code init
Now when you run the `/init` command:

```bash
claude /init
```

Claude Code will:
1. Detect and read the CLAUDE.md file
2. Follow the commit and logging instructions throughout the session
3. Create commits after each todo item
4. Maintain both log files

## Verification Checklist

After setup, verify:
- [ ] `CLAUDE.md` exists in project root
- [ ] `.claude/` directory exists
- [ ] `.claude/development-log.md` exists
- [ ] `.claude/debugging-log.md` exists
- [ ] CLAUDE.md contains commit frequency instructions
- [ ] CLAUDE.md contains logging requirements

## Pro Tips

### 1. Project-Specific Overrides
You can have both global and project-specific CLAUDE.md files. The project-specific one takes precedence:

```
~/.config/claude/CLAUDE.md     # Global defaults
/your-project/CLAUDE.md         # Project-specific (overrides global)
```

### 2. Team Consistency
For team projects, commit CLAUDE.md to version control:

```bash
git add CLAUDE.md
git add .claude/development-log.md
git add .claude/debugging-log.md
git commit -m "chore: add Claude Code configuration and logs"
```

### 3. Automation Script
Create a script to set up new projects with your Claude configuration:

```bash
#!/bin/bash
# setup-claude.sh

# Create CLAUDE.md
cp ~/.config/claude/templates/CLAUDE.md ./CLAUDE.md

# Create log structure
mkdir -p .claude
cp ~/.config/claude/templates/development-log.md .claude/
cp ~/.config/claude/templates/debugging-log.md .claude/

echo "Claude Code setup complete!"
```

### 4. Existing Project Integration
For existing projects, you can add the configuration without disrupting current work:

```bash
# Add CLAUDE.md and logs
# Update .gitignore if needed
# Commit the new configuration
git add CLAUDE.md .claude/
git commit -m "chore: add Claude Code configuration for granular commits and logging"
```

## Important Notes

1. **CLAUDE.md is case-sensitive** - It must be exactly `CLAUDE.md`, not `claude.md` or `Claude.md`

2. **File must be readable** - Ensure proper permissions:
   ```bash
   chmod 644 CLAUDE.md
   ```

3. **UTF-8 encoding** - Save the file in UTF-8 format to avoid parsing issues

4. **Markdown formatting** - Use proper Markdown syntax for best results

5. **Clear instructions** - Be explicit about requirements (as shown in the previous artifact)

## Testing Your Setup

After placing CLAUDE.md, test it:

1. Run `claude /init` in your project
2. Ask Claude to make a small change
3. Check if:
   - A commit was made after the change
   - Development log was updated
   - The commit message follows your format

If Claude Code doesn't follow the instructions, check:
- File location and name
- File permissions
- Markdown syntax
- Clear, unambiguous instructions