# Technical Context

## Technologies Used
- **Frontend**: React.js, TypeScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with pgvector extension
- **AI Services**: Python, FastAPI, LangChain, LangGraph, OpenAI integrations
- **Caching**: Redis
- **Web Server**: Nginx
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest, Playwright, Puppeteer
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana (planned)
- **Logging**: Winston, ELK Stack (planned)
- **Vector Search**: pgvector for PostgreSQL
- **Voice Processing**: Integration with Google Cloud, Amazon AWS, and Microsoft Azure speech services
- **Agentic Framework**: OpenAI Assistants API

## Development Setup
1. Clone the repository
2. Install Docker and Docker Compose
3. Run `docker-compose up` to start all services
4. For local development without Docker:
   - Node.js 16+ for backend and frontend
   - Python 3.9+ for AI services
   - PostgreSQL 15+ with pgvector extension
   - Redis 7.0+

## Technical Constraints
- Must support PowerShell scripts of various versions (5.1+)
- Database must handle vector embeddings for similarity search
- AI analysis must be extensible to accommodate new analysis types
- System must be secure against script injection attacks
- API must be versioned for backward compatibility
- Frontend must be responsive for various device sizes
- Services must be containerized for consistent deployment
- Authentication must use industry-standard security practices
- Voice API must support multiple service providers for redundancy
- Agent framework must maintain conversation state across sessions

## Dependencies
- **OpenAI API**: For advanced script analysis, embeddings, and assistant functionality
- **pgvector**: PostgreSQL extension for vector operations
- **Redis**: For caching and message queuing
- **JWT**: For secure authentication
- **Docker**: For containerization and deployment
- **Nginx**: For routing and SSL termination
- **Node.js**: For backend services
- **Python**: For AI services
- **React**: For frontend UI
- **LangChain**: Framework for building AI applications
- **LangGraph**: Framework for multi-agent orchestration
- **Speech Services**:
  - **Google Cloud Speech-to-Text and Text-to-Speech**: Primary voice service provider
  - **Amazon Polly and Transcribe**: Alternative voice service provider
  - **Microsoft Azure Cognitive Services**: Alternative voice service provider

## Tool Usage Patterns
- **Docker Compose**: Used for local development and testing
- **Shell Scripts**: Used for automation of common tasks
- **Migration Scripts**: Used for database schema updates
- **Test Scripts**: Used for automated testing
- **Deployment Scripts**: Used for production deployment
- **Monitoring Tools**: Used for system health checks
- **Version Control**: Git with GitHub for source code management
- **Issue Tracking**: GitHub Issues for bug and feature tracking
- **Agent Coordinator**: Used for managing multiple AI agents
- **Script Analyzer**: Used for detailed script analysis
- **Vector Embeddings**: Used for semantic search functionality
