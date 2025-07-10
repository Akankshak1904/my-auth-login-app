// src/components/Navbar.js
'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await signOut(auth);
    handleMenuClose();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#6c63ff' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side: Title */}
        <Typography variant="h6">
          My Login Page
        </Typography>

        {/* Right side: Nav + User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} href="/">Home</Button>
          <Button color="inherit" component={Link} href="/info">Info</Button>

          {!user && (
            <Button color="inherit" component={Link} href="/login">
              Login
            </Button>
          )}

          {user && (
            <>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {user.displayName || user.email}
              </Typography>
              <IconButton onClick={handleMenuOpen}>
                <Avatar src={user.photoURL} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
