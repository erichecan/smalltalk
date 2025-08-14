# Google OAuth Removal & Cleanup Plan
**Created:** 2025-07-03 14:54:15
**Purpose:** Step-by-step plan to remove current Google OAuth and prepare for fresh configuration

## 🚨 IMPORTANT: Backup Complete
✅ **Complete backup created at:** `backup_google_oauth_20250703_145415/`
✅ **All files safely backed up and documented**

## 📋 Removal Checklist

### Phase 1: External Services Cleanup

#### 1.1 Google Cloud Console
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to **APIs & Services > Credentials**
- [ ] **DELETE** existing OAuth 2.0 Client ID(s) related to SmallTalk
- [ ] **DELETE** any API keys if created specifically for OAuth
- [ ] **Note:** This will immediately break current OAuth functionality

#### 1.2 Supabase Dashboard
- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Select project: `znaacfatlmwotdxcfukp`
- [ ] Navigate to **Authentication > Providers**
- [ ] **DISABLE** Google OAuth provider
- [ ] **CLEAR** Client ID and Client Secret fields
- [ ] **SAVE** changes

### Phase 2: Code Cleanup

#### 2.1 Remove Google OAuth Code from AuthContext.tsx
**File:** `src/contexts/AuthContext.tsx`

**Remove these lines (85-97):**
```typescript
const googleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/topic'
    }
  });
  if (error) {
    console.error('Supabase Google OAuth error:', error);
    throw error;
  }
};
```

**Remove from interface (line 25):**
```typescript
googleLogin: () => Promise<void>;
```

**Remove from value object (line 115):**
```typescript
googleLogin,
```

#### 2.2 Remove Google OAuth from Login.tsx
**File:** `src/pages/Login.tsx`

**Remove import (line 6):**
```typescript
import GoogleIcon from '@mui/icons-material/Google';
```

**Remove from useAuth destructuring (line 16):**
```typescript
const { login, register, googleLogin } = useAuth();
```
**Change to:**
```typescript
const { login, register } = useAuth();
```

**Remove entire Google login handler (lines 20-37):**
```typescript
const handleGoogleLogin = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('Initiating Google OAuth login...');
    await googleLogin();
    console.log('Google login successful, navigating to topic page');
    navigate('/topic');
  } catch (error) {
    console.error('Google login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setError(`${t('login.errors.googleLoginFailed')}: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};
```

**Remove Google OAuth button (lines 100-126):**
```typescript
<Button 
  variant="outlined" 
  fullWidth 
  sx={{ 
    borderColor: '#dadce0', 
    color: '#3c4043', 
    borderRadius: 28, 
    py: 1.5, 
    mb: 2, 
    fontWeight: 500,
    textTransform: 'none',
    '&:hover': { 
      bgcolor: '#f8f9fa',
      borderColor: '#dadce0',
      boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)'
    },
    '&:disabled': {
      borderColor: '#dadce0',
      color: '#5f6368'
    }
  }} 
  onClick={handleGoogleLogin} 
  startIcon={loading ? <CircularProgress size={20} sx={{ color: '#4285f4' }} /> : <GoogleIcon sx={{ color: '#4285f4' }} />}
  disabled={loading}
>
  {loading ? t('login.loggingIn') : t('login.googleButton')}
</Button>
```

**Remove divider section (lines 96-99):**
```typescript
<Box sx={{ my: 2, position: 'relative' }}>
  <Divider sx={{ borderColor: '#D0E0D0' }} />
  <Typography variant="body2" sx={{ bgcolor: '#F9FBF9', px: 2, color: '#708C70', position: 'absolute', left: '50%', top: -14, transform: 'translateX(-50%)' }}>{mode === 'login' ? t('login.orContinueWith') : t('register.orContinueWith')}</Typography>
</Box>
```

#### 2.3 Remove Google OAuth Translations
**File:** `src/locales/en/auth.json`

**Remove these translations:**
```json
{
  "login": {
    "googleButton": "Continue with Google",
    "orContinueWith": "Or continue with",
    "loggingIn": "Logging in...",
    "errors": {
      "googleLoginFailed": "Google login failed"
    }
  },
  "register": {
    "orContinueWith": "Or continue with"
  }
}
```

**File:** `src/locales/zh/auth.json`

**Remove corresponding Chinese translations:**
```json
{
  "login": {
    "googleButton": "使用 Google 继续",
    "orContinueWith": "或继续使用",
    "loggingIn": "登录中...",
    "errors": {
      "googleLoginFailed": "Google 登录失败"
    }
  },
  "register": {
    "orContinueWith": "或继续使用"
  }
}
```

### Phase 3: Clean Build & Test

#### 3.1 Remove Dependencies (Optional)
```bash
# Remove Google icon dependency if not used elsewhere
npm uninstall @mui/icons-material
# Or keep it if used in other parts of the app
```

#### 3.2 Build and Test
```bash
# Clean build
npm run build

# Test locally
npm run dev
```

#### 3.3 Verify Cleanup
- [ ] Login page loads without Google OAuth button
- [ ] No console errors related to Google OAuth
- [ ] Email/password login still works
- [ ] No broken translations

### Phase 4: Documentation Cleanup

#### 4.1 Remove Documentation Files
- [ ] **DELETE** `docs/features/GOOGLE_OAUTH_TROUBLESHOOTING.md`
- [ ] **DELETE** `docs/features/GOOGLE_OAUTH_COMPLETE_SETUP.md`

#### 4.2 Update Other Documentation
- [ ] Update main README.md to remove Google OAuth references
- [ ] Update any other docs that mention Google OAuth

## 🔄 Fresh Configuration Preparation

### After Cleanup, You'll Need:

#### 1. New Google Cloud Console Setup
- Create new project (or use existing)
- Enable Google+ API
- Create new OAuth 2.0 credentials
- Configure proper redirect URIs:
  - `https://znaacfatlmwotdxcfukp.supabase.co/auth/v1/callback`
  - `https://smalltalking.netlify.app`

#### 2. New Supabase Configuration
- Re-enable Google OAuth provider
- Add new Client ID and Client Secret
- Configure proper redirect URLs

#### 3. New Code Implementation
- Add Google OAuth back to AuthContext.tsx
- Add Google OAuth button back to Login.tsx
- Add translations back to auth.json files

## 🚨 Breaking Changes Warning

**After completing this cleanup:**
- ❌ Google OAuth will be completely non-functional
- ❌ Users who previously signed in with Google won't be able to log in
- ✅ Email/password authentication will continue to work
- ✅ All other app functionality remains intact

## 🔧 Quick Commands

### Complete Cleanup Script
```bash
# Remove Google OAuth from AuthContext
# Remove Google OAuth from Login page
# Remove Google OAuth translations
# Remove documentation files
# Build and test

# All manual - follow checklist above
```

### Verification Script
```bash
# After cleanup, verify:
cd /Users/sophie/Desktop/eriche/smalltalk
npm run build
npm run dev
# Test login page - should only show email/password
```

## 📞 Support

If you encounter issues during cleanup:
1. Restore from backup: `backup_google_oauth_20250703_145415/`
2. Follow restoration instructions in `GOOGLE_OAUTH_BACKUP_DOCUMENTATION.md`
3. Test restored functionality

---

**This plan ensures complete removal of Google OAuth while maintaining backup safety.**