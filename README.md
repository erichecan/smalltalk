# SmallTalk - AI-Powered English Conversation Practice App

SmallTalk is a modern web application designed to help users practice English conversations with AI assistance. Built with React, TypeScript, and Firebase, it provides an intuitive interface for interactive language learning.

## 🌟 Features

### Core Functionality
- **AI-Powered Conversations**: Practice English with OpenAI's GPT-3.5-turbo
- **Voice Input**: Speech-to-text functionality for natural conversation flow
- **Topic-Based Learning**: Choose from various conversation topics
- **Conversation History**: Save and review past conversations
- **Bookmark System**: Mark important conversations for easy access

### User Experience
- **Modern UI/UX**: Clean, responsive design with intuitive navigation
- **Real-time Chat**: Instant AI responses for seamless conversation
- **Progress Tracking**: Monitor your learning journey
- **Cross-platform**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend & Services
- **Firebase Authentication** - User authentication and management
- **Firestore** - NoSQL database for conversation storage
- **OpenAI API** - AI conversation generation
- **Web Speech API** - Speech-to-text functionality

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Git** - Version control

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smalltalk.git
   cd smalltalk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication (Email/Password and Google Sign-in)
   - Enable Firestore Database
   - Add your Firebase configuration to the environment variables

5. **OpenAI Setup**
   - Get an API key from [OpenAI Platform](https://platform.openai.com/)
   - Add the API key to your environment variables

## 🚀 Usage

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 App Flow

1. **Welcome Screen**: Introduction and app overview
2. **Topic Selection**: Choose a conversation topic
3. **AI Conversation**: Practice with AI assistant
4. **Voice Input**: Use speech-to-text for natural interaction
5. **Save Conversations**: Store important conversations
6. **History Review**: Access past conversations and bookmarks

## 🏗️ Project Structure

```
smalltalk/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API and external services
│   ├── styles/            # Global styles and themes
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── original-html/         # Original design files
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
```

## 🔧 Configuration

### Firebase Configuration
The app uses Firebase for authentication and data storage. Configure the following services:
- **Authentication**: Email/password and Google sign-in
- **Firestore**: Database for storing conversations and user data

### OpenAI Configuration
- Set up your OpenAI API key in the environment variables
- The app uses GPT-3.5-turbo for conversation generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Write clean, readable code
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI conversation capabilities
- Firebase for backend services
- The React and TypeScript communities for excellent tooling
- Original design inspiration from the provided HTML files

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/smalltalk/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy Learning! 🎉**
