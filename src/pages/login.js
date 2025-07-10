'use client';

import {
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Divider,
  Grid,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  auth,
  googleProvider,
  outlookProvider,
  db,
} from '../firebase';
import {
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Login() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        router.push('/dashboard'); // ✅ Redirect after login
      }
    });
    return () => unsubscribe();
  }, [router]);

  const logLogin = async (user, provider = 'email') => {
    await addDoc(collection(db, 'loginLogs'), {
      type: 'login',
      uid: user.uid,
      name: user.displayName || '',
      email: user.email,
      timestamp: serverTimestamp(),
      provider,
    });
  };

  const loginWithProvider = async (provider, providerName) => {
    try {
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await logLogin(user, providerName);
      enqueueSnackbar(`Logged in with ${providerName}`, { variant: 'success' });
      router.push('/dashboard');
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const pendingCred =
          providerName === 'Google'
            ? GoogleAuthProvider.credentialFromError(error)
            : OAuthProvider.credentialFromError(error);
        const email = error.customData?.email;
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.includes('google.com')) {
          try {
            const googleResult = await signInWithPopup(auth, new GoogleAuthProvider());
            await linkWithCredential(googleResult.user, pendingCred);
            enqueueSnackbar('Accounts linked successfully!', { variant: 'success' });
            await logLogin(googleResult.user, providerName);
            router.push('/dashboard');
          } catch (linkError) {
            enqueueSnackbar(`Linking failed: ${linkError.message}`, { variant: 'error' });
          }
        } else {
          enqueueSnackbar(`Please sign in with: ${methods.join(', ')}`, { variant: 'warning' });
        }
      } else {
        enqueueSnackbar(`Login failed: ${error.message}`, { variant: 'error' });
      }
    }
  };

  const handleEmailLogin = async () => {
    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
      const result = await signInWithEmailAndPassword(auth, email, password);
      await logLogin(result.user, 'email');
      enqueueSnackbar(`Logged in as ${result.user.email}`, { variant: 'success' });
      router.push('/dashboard');
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleSignup = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await logLogin(result.user, 'email-signup');
      enqueueSnackbar('Account created & logged in!', { variant: 'success' });
      router.push('/dashboard');
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      enqueueSnackbar('Password reset email sent!', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={5} sx={{ width: '100%', p: 4, borderRadius: 3 }}>
        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : user ? (
          <Typography variant="h6" align="center">
            Redirecting to your dashboard...
          </Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight="bold">
                {isSignup ? 'Create Account' : 'Login'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {isSignup ? 'Already have an account? ' : 'New here? '}
                <span
                  style={{ color: '#6c63ff', cursor: 'pointer' }}
                  onClick={() => setIsSignup(!isSignup)}
                >
                  {isSignup ? 'Login' : 'Sign Up'}
                </span>
              </Typography>

              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
                  label="Remember me"
                />
                {!isSignup && (
                  <Typography variant="caption" sx={{ cursor: 'pointer' }} onClick={handleReset}>
                    Forgot Password?
                  </Typography>
                )}
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={isSignup ? handleSignup : handleEmailLogin}
                sx={{ mt: 2 }}
              >
                {isSignup ? 'Create Account' : 'Login'}
              </Button>

              <Divider sx={{ my: 3 }}>or login with</Divider>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button fullWidth variant="outlined" onClick={() => loginWithProvider(googleProvider, 'Google')}>
                  Google
                </Button>
                <Button fullWidth variant="outlined" onClick={() => loginWithProvider(outlookProvider, 'Microsoft')}>
                  Outlook
                </Button>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              sx={{
                minHeight: 400,
                backgroundImage: 'url(/login.jpg)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              component={motion.div}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            />
          </Grid>
        )}
      </Paper>
    </Container>
  );
}
