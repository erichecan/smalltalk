# Contributing to SmallTalk

Thank you for your interest in contributing to SmallTalk! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker to report bugs
- Include detailed information about the issue
- Provide steps to reproduce the problem
- Include browser and OS information if relevant

### Suggesting Features
- Use the GitHub issue tracker for feature requests
- Describe the feature in detail
- Explain why the feature would be useful
- Consider the impact on existing functionality

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with a clear message (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Write clean, readable code
- Add comments for complex logic
- Follow the existing code style

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Testing
- Test your changes thoroughly
- Ensure cross-browser compatibility
- Test on different screen sizes
- Verify API integrations work correctly

### Documentation
- Update README.md if needed
- Add comments for new features
- Update type definitions
- Document API changes

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start development server: `npm run dev`

### Environment Configuration
Create a `.env` file with the following variables:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

## 📁 Project Structure

### Key Directories
- `src/pages/`: Main page components
- `src/components/`: Reusable UI components
- `src/services/`: External service integrations
- `src/contexts/`: React contexts
- `src/types/`: TypeScript type definitions

### Adding New Features
1. Create new components in appropriate directories
2. Add TypeScript types if needed
3. Update routing if adding new pages
4. Test thoroughly
5. Update documentation

## 🔧 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

## 💡 Feature Requests

When suggesting features, please include:
- Detailed description of the feature
- Use cases and benefits
- Implementation suggestions if possible
- Impact on existing functionality

## 📞 Getting Help

- Check existing issues and discussions
- Create a new issue for questions
- Join our community discussions
- Contact the maintainers

## 📄 License

By contributing to SmallTalk, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SmallTalk! 🎉 