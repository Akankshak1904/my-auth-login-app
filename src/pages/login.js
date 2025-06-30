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
} from 'firebase/auth';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Login() {
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleSignup = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await logLogin(result.user, 'email-signup');
      enqueueSnackbar('Account created & logged in!', { variant: 'success' });
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

  const logout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'loginLogs'), {
          type: 'logout',
          uid: user.uid,
          name: user.displayName || '',
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      await signOut(auth);
      enqueueSnackbar('Logged out', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Paper elevation={5} sx={{ overflow: 'hidden', borderRadius: 3 }}>
        <Grid container>
          {/* Left Side */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ p: 4, backgroundColor: '#f9f9f9' }}
            component={motion.div}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h5" fontWeight="bold">
              {isSignup ? 'Create Account' : 'Login'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
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
              label="Email Address"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                }
                label="Remember me"
              />
              {!isSignup && (
                <Typography
                  variant="caption"
                  sx={{ color: '#6c63ff', cursor: 'pointer' }}
                  onClick={handleReset}
                >
                  Forgot Password?
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={isSignup ? handleSignup : handleEmailLogin}
              sx={{ backgroundColor: '#6c63ff', mt: 1 }}
            >
              {isSignup ? 'Create Account' : 'LOGIN'}
            </Button>

            <Divider sx={{ my: 3 }}>or login with</Divider>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => loginWithProvider(googleProvider, 'Google')}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => loginWithProvider(outlookProvider, 'Microsoft')}
              >
                Outlook
              </Button>
            </Box>

            <Button variant="text" onClick={logout} fullWidth sx={{ mt: 3 }}>
              Logout
            </Button>
          </Grid>

          {/* Right Side */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              minHeight: 500,
              backgroundImage: 'url(/login.jpg)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            component={motion.div}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          ></Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
