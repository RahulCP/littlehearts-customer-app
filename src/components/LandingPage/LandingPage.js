import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Button, Typography, Avatar } from '@mui/material';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        navigate('/sales'); 
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        console.log("User signed in:", result.user);
      })
      .catch((error) => {
        console.error("Error during Google Sign-In:", error);
      });
  };

  // Handle Sign-Out
  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(() => {
        console.log("User signed out");
      })
      .catch((error) => {
        console.error("Error during Sign-Out:", error);
      });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" textAlign="center">
            Sign in using your Google Account
          </Typography>
        </Grid>
        {user ? (
          <>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Avatar src={user.photoURL} alt="User Avatar" sx={{ width: 80, height: 80 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" textAlign="center">
                Welcome, {user.displayName}
              </Typography>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Button variant="contained" color="secondary" onClick={handleSignOut}>
                Sign out
              </Button>
            </Grid>
          </>
        ) : (
          <Grid item xs={12} display="flex" justifyContent="center">
            <Button variant="contained" color="primary" onClick={handleGoogleSignIn}>
              Sign in with Google
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default LandingPage;
