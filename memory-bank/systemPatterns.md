# System Patterns

## System Architecture
PSScript Manager follows a microservices architecture with containerized components:

1. **Frontend**: Web interface built with React.js, TypeScript, and modern UI components
2. **Backend API**: RESTful service built with Node.js and Express handling business logic and data operations
3. **AI Service**: Specialized Python service with FastAPI for script analysis and recommendations
4. **Database**: PostgreSQL with pgvector extension for persistent storage and vector operations
5. **Redis**: Caching and message queue for performance optimization
6. **Nginx**: Web server and reverse proxy for routing requests

The system is containerized using Docker and orchestrated with Docker Compose, allowing for easy deployment and scaling.

## Key Technical Decisions
- Microservices architecture for modularity and scalability
- Docker containerization for consistent environments
- RESTful API design for interoperability
- AI-powered script analysis for automated insights
- PostgreSQL with pgvector for efficient vector search capabilities
- Redis for caching and message queuing
- JWT-based authentication for security
- File hashing for script integrity verification
- Multi-agent AI system for comprehensive analysis
- OpenAI Assistants API for persistent, agentic conversations
- Voice API integration for speech-based interaction

## Design Patterns in Use
- Repository pattern for data access abstraction
- Factory pattern for creating AI agents
- Strategy pattern for different analysis approaches
- Observer pattern for event handling
- MVC pattern in the frontend
- Middleware pattern for request processing
- Dependency injection for component coupling
- Command pattern for script execution
- Coordinator pattern for managing multiple AI agents
- Adapter pattern for integrating external services
- Facade pattern for simplifying complex subsystems

## Component Relationships
- Frontend communicates with Backend API via RESTful endpoints
- Backend API orchestrates requests to AI Service and Database
- AI Service processes scripts and returns analysis results
- Database stores all persistent data including scripts, users, and analysis results
- Redis facilitates caching and message passing between services
- Nginx routes external requests to appropriate internal services
- Voice API integrates with both Frontend and Backend components:
  - Frontend components include VoiceRecorder, VoicePlayback, VoiceChatInterface, and VoiceSettings
  - Backend components include VoiceRoutes and VoiceController
  - AI Service components include VoiceService, VoiceEndpoints, and VoiceAgent
- Agent Coordinator manages different AI agents and their interactions, including the Voice Agent

## Critical Implementation Paths
1. **Authentication Flow**: User login → JWT generation → Token validation
2. **Script Upload**: File upload → Hash generation → Storage → Analysis queuing
3. **Script Analysis**: Queue processing → AI analysis → Results storage → Notification
4. **Script Execution**: Validation → Secure environment preparation → Execution → Results capture
5. **Vector Search**: Query embedding → Vector similarity search → Results ranking
6. **Voice Interaction**: Voice input → Speech recognition → Command processing → Voice response
7. **Agentic Conversation**: User query → Thread management → Assistant processing → Response generation
8. **Documentation Integration**: Command identification → Documentation lookup → Reference formatting
