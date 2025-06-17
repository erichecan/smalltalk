# SmallTalk Deployment Guide

This guide provides step-by-step instructions for deploying the SmallTalk application to various platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Firebase account
- OpenAI API key

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/smalltalk.git
cd smalltalk

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

## 🌐 Deployment Options

### 1. Firebase Hosting (Recommended)

#### Setup Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google Sign-in)
4. Enable Firestore Database
5. Set up Firebase Hosting

#### Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Initialize Firebase
```bash
firebase login
firebase init hosting
```

#### Build and Deploy
```bash
npm run build
firebase deploy
```

### 2. Vercel Deployment

#### Using Vercel CLI
```bash
npm install -g vercel
vercel
```

#### Using Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 3. Netlify Deployment

#### Using Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy
```

#### Using Netlify Dashboard
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your_openai_api_key_here
```

### Setting Environment Variables

#### Firebase Hosting
```bash
firebase functions:config:set openai.api_key="your_openai_api_key"
```

#### Vercel
```bash
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_FIREBASE_API_KEY
# ... add all other variables
```

#### Netlify
- Go to Site Settings > Environment Variables
- Add each variable with its value

## 🔒 Security Considerations

### API Key Protection
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Set up proper Firebase security rules
- Enable CORS restrictions if needed

### Firebase Security Rules
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
npm run optimize-images

# Minify CSS and JS
npm run build -- --minify
```

### Caching Strategy
- Set up proper cache headers for static assets
- Use CDN for global distribution
- Implement service worker for offline support

## 🔍 Monitoring and Analytics

### Firebase Analytics
```javascript
// Initialize Firebase Analytics
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);
```

### Error Tracking
- Set up error boundaries in React
- Configure error reporting services
- Monitor API response times

## 🧪 Testing Before Deployment

### Pre-deployment Checklist
- [ ] All environment variables are set
- [ ] Firebase project is configured
- [ ] OpenAI API key is valid
- [ ] Build completes successfully
- [ ] All features work in development
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Performance metrics are acceptable

### Testing Commands
```bash
# Run all tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
npm run preview
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

#### API Errors
- Verify API keys are correct
- Check API rate limits
- Ensure CORS is configured properly

#### Firebase Issues
- Verify Firebase project configuration
- Check Firestore security rules
- Ensure Authentication is enabled

### Debug Commands
```bash
# Check environment variables
echo $VITE_OPENAI_API_KEY

# Verify Firebase configuration
firebase projects:list

# Test API connectivity
curl -H "Authorization: Bearer $VITE_OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

## 📈 Post-Deployment

### Monitoring
- Set up uptime monitoring
- Configure error alerts
- Monitor user analytics
- Track performance metrics

### Maintenance
- Regular dependency updates
- Security patches
- Performance optimization
- User feedback collection

## 🔄 Continuous Deployment

### GitHub Actions
The project includes a CI/CD pipeline that:
- Runs tests on every push
- Builds the project
- Deploys to Firebase Hosting on main branch

### Manual Deployment
```bash
# Build and deploy
npm run build
firebase deploy

# Or use Vercel
vercel --prod
```

---

For more information, see the [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md) files. 