# Project Rules

## Development Standards

### TypeScript Configuration
- Use strict mode in TypeScript
- Enable all strict checks (strictNullChecks, noImplicitAny, etc.)
- Use absolute imports with path aliases

### Code Style
- 2 spaces for indentation
- Single quotes for strings
- No semicolons at end of statements
- Max line length: 100 characters
- Use ES6+ features (const, let, arrow functions, destructuring)

### File Organization
```
src/
  core/          # Core game engine classes
  components/    # Reusable game components
  systems/       # Game systems (rendering, physics, etc.)
  scenes/        # Scene definitions
  utils/         # Utility functions
```

### Naming Conventions
- PascalCase for classes and components
- camelCase for functions and variables
- SCREAMING_SNAKE_CASE for constants
- kebab-case for file names

### Game Framework Architecture
- Entity-Component-System (ECS) pattern
- Scene-based game flow
- Component-based entity composition
- Event-driven communication

### Testing Requirements
- Unit tests for core utilities
- Integration tests for systems
- Minimum 80% code coverage for core modules

### Build & Deployment
- Use Vite for development and production builds
- Support multiple target platforms (Web, Mobile, Desktop)
- Environment-based configuration
- Optimize for performance and bundle size

### Documentation
- All public APIs must be documented
- Use JSDoc comments for TypeScript
- Maintain up-to-date API documentation
- Include usage examples for complex features

### Git Workflow
- Feature branches from develop/main
- Descriptive commit messages
- Pull requests for code review
- Squash commits before merging
