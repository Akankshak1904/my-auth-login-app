// src/pages/dashboard.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase';
import { Typography, Container, CircularProgress } from '@mui/material';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to your Dashboard!
      </Typography>
      <Typography variant="body1">Logged in as: {user.email}</Typography>
    </Container>
  );
}
