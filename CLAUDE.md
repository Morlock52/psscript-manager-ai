# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

PSScript Manager is a multi-service AI-powered PowerShell script management platform with the following key components:

### Core Services
- **Frontend**: React + TypeScript + Vite (port 3002/5173)
- **Backend**: Node.js + Express + TypeScript (port 4000)
- **AI Service**: Python + FastAPI + LangChain/LangGraph (port 8000)
- **Database**: PostgreSQL with pgvector extension (port 5432)
- **Cache**: Redis (port 6379)
- **Executor** (dev only): PowerShell script execution service (port 5001)

### Key Technologies
- **Vector Search**: pgvector for script similarity and semantic search
- **AI Frameworks**: LangChain, LangGraph, OpenAI Assistants API
- **ORM**: Sequelize for Node.js, direct PostgreSQL for Python
- **Frontend**: React Router, Axios, Monaco Editor, Chart.js
- **Containerization**: Docker with multi-stage builds

## Development Commands

### Monorepo Management
```bash
# Start all services in development mode
npm run dev

# Build all workspaces
npm run build

# Run linting across all workspaces
npm run lint
npm run lint:fix

# Start individual services
npm run frontend:dev
npm run backend:dev
npm run ai:dev  # or: cd src/ai && python -m uvicorn main:app --reload
```

### Frontend Development
```bash
cd src/frontend

# Development server
npm run dev

# Build for production
npm run build
npm run build:prod  # Skip type checking for faster builds

# Linting
npm run lint
npm run lint:fix

# Preview production build
npm run preview
```

### Backend Development
```bash
cd src/backend

# Database connectivity tests
npm run test:db      # PostgreSQL connection
npm run test:redis   # Redis connection
npm run test:conn    # General health check
npm run diagnose:db  # Comprehensive database diagnostics

# TypeScript compilation
npx tsc

# Database utilities
node setup-local-db.js
node test-db.js
node test-redis.js
```

### AI Service Development
```bash
cd src/ai

# Install dependencies
pip install -r requirements.txt

# Start development server
python -m uvicorn main:app --reload

# Run with specific configurations
MOCK_MODE=true python main.py  # Use mock responses
```

### Docker Operations
```bash
# Development profile (includes executor, pgadmin, redis-commander)
docker-compose up -d

# Production profile (includes nginx, no dev tools)
docker-compose --profile prod up -d

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs [service-name]

# Execute commands in containers
docker-compose exec backend npm run diagnose:db
docker-compose exec ai-service python -c "import agents; print('AI service ready')"
```

### Testing
```bash
# Core functionality tests
./test-all-fixes.sh              # Comprehensive test suite
./test-psscript-core.sh          # Core functionality
./test-script-analysis.sh        # AI analysis pipeline
./test-auth-improvements.sh      # Authentication flow
./test-categories.sh             # Category management
./test-upload-script.sh          # File upload functionality

# Database and vector tests
./test-file-hash-vector.sh       # File hash and vector storage
```

## Data Models and Database

### Key Tables
- **users**: User accounts with role-based access
- **scripts**: PowerShell scripts with content, metadata, and file hashes
- **categories**: Script categorization
- **script_analysis**: AI-generated analysis results
- **script_embeddings**: Vector embeddings for similarity search (pgvector)
- **script_versions**: Version control for scripts
- **chat_history**: AI conversation history
- **assistants/threads/messages/runs**: OpenAI Assistants API integration

### Database Schema Management
```bash
# Run migrations
./run-migration.sh [migration-file]
./run-categories-migration.sh
./run-file-hash-migration.sh
./run-script-analysis-migration.sh

# Database utilities
./reset-db.sh                    # Reset development database
node add-admin-user.js           # Create admin user
node update-categories.js        # Update category data
```

## Code Organization Patterns

### Backend (src/backend/src/)
- **controllers/**: Request handlers (e.g., ScriptController.ts, AuthController.ts)
- **models/**: Sequelize models with relationships
- **routes/**: Express route definitions
- **middleware/**: Auth, CORS, error handling, file upload
- **services/**: Business logic (agentic/, AI orchestration)
- **utils/**: Shared utilities (vectorUtils.ts, logger.ts, redis-client.ts)

### Frontend (src/frontend/src/)
- **components/**: Reusable UI components
- **pages/**: Route-based page components
- **contexts/**: React contexts (AuthContext, ThemeContext)
- **hooks/**: Custom React hooks
- **services/**: API clients and external service integrations
- **types/**: TypeScript type definitions

### AI Service (src/ai/)
- **agents/**: Multi-agent system components
- **analysis/**: Script analysis logic
- **main.py**: FastAPI application entry point
- **config.py**: Configuration management

## Configuration and Environment

### Required Environment Variables
```bash
# Database
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD

# AI Services
OPENAI_API_KEY

# Authentication
JWT_SECRET

# Feature Flags
ENABLE_FILE_UPLOAD=true
ENABLE_SCRIPT_ANALYSIS=true
ENABLE_KNOWLEDGE_SECTION=true
VECTOR_SEARCH_ENABLED=true
FILE_HASH_DEDUPLICATION=true
```

### File Locations
- Backend ESLint: `src/backend/.eslintrc.json`
- Frontend ESLint: `src/frontend/eslint.config.js`
- Backend TypeScript: `src/backend/tsconfig.json`
- Frontend TypeScript: `src/frontend/tsconfig.json`
- Docker configs: `docker-compose.yml`, `docker-compose.override.yml`

## Development Workflows

### Adding New Features
1. Update database schema if needed (src/db/migrations/)
2. Create/update Sequelize models (src/backend/src/models/)
3. Implement backend controllers and routes
4. Add frontend components and API integration
5. Update AI service endpoints if AI functionality needed
6. Run test suite to verify integration

### Script Analysis Pipeline
1. Upload via ScriptController → file integrity check → database storage
2. Generate embeddings via vectorUtils → store in script_embeddings
3. AI analysis via AI service → store results in script_analysis
4. Vector similarity search for related scripts
5. Frontend displays analysis results and similar scripts

### Multi-Agent System Integration
- AgentOrchestrator coordinates multiple AI agents
- OpenAI Assistants API for persistent conversations
- LangChain/LangGraph for complex workflows
- Agent types: script analysis, security analysis, documentation generation

## Important Notes

### ESLint Status
- Issues relaxed to warnings to allow builds
- Backend: unused variables, require() vs import, @ts-nocheck directives
- Frontend: unused imports, React hook dependencies, regex escaping

### Security Considerations
- File hash deduplication prevents duplicate uploads
- PowerShell security analysis via powershellSecurityUtils
- Input sanitization and validation throughout
- Role-based access control

### Performance Optimizations
- Redis caching for frequently accessed data
- Vector database for fast similarity searches
- Async operations throughout AI pipeline
- Database connection pooling and monitoring