// src/components/Navbar.js
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <AppBar position="static" sx={{ backgroundColor: '#6c63ff' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          My Login Page
        </Typography>
        <Button color="inherit" component={Link} href="/">Home</Button>
        <Button color="inherit" component={Link} href="/login">Login</Button>
        <Button color="inherit" component={Link} href="/info">Info</Button>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography sx={{ mr: 1 }}>{user.displayName || user.email}</Typography>
            <Avatar src={user.photoURL} />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

