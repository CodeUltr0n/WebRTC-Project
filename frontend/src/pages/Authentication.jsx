import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../components/CustomIcons';
import { AuthContext } from '../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import { Link as RouterLink } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function Authentication(props) {
  const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [message, setMessage] = React.useState();
  const [error, setError] = React.useState();
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const validateInputs = () => {
    let isValid = true;

    if (formState === 1) {
      if (!name.trim()) {
        setNameError(true);
        setNameErrorMessage('Please enter your name.');
        isValid = false;
      } else {
        setNameError(false);
        setNameErrorMessage('');
      }
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!username.trim()) {
      setUsernameError(true);
      setUsernameErrorMessage('Please enter your username.');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        // Sign In
        const result = await handleLogin(username, password);
        setMessage(result);
        setOpen(true);
      } else if (formState === 1) {
        // Sign Up
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
      }
    } catch (err) {
      let message = err.response?.data?.message || err.message || 'An error occurred';
      setError(message);
      setOpen(true);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateInputs()) {
      handleAuth();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessage('');
    setError('');
  };

  const toggleFormState = () => {
    setFormState((prev) => (prev === 0 ? 1 : 0));
    setMessage('');
    setError('');
    setName('');
    setUsername('');
    setPassword('');
    setNameError(false);
    setNameErrorMessage('');
    setUsernameError(false);
    setUsernameErrorMessage('');
    setPasswordError(false);
    setPasswordErrorMessage('');
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            {formState === 0 ? 'Sign in' : 'Sign up'}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            {formState === 1 && (
              <FormControl>
                <FormLabel htmlFor="name">Name</FormLabel>
                <TextField
                  error={nameError}
                  helperText={nameErrorMessage}
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  autoComplete="name"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={nameError ? 'error' : 'primary'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
            )}
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <TextField
                error={usernameError}
                helperText={usernameErrorMessage}
                id="username"
                type="text"
                name="username"
                placeholder="yourusername"
                autoComplete="username"
                autoFocus={formState === 0}
                required
                fullWidth
                variant="outlined"
                color={usernameError ? 'error' : 'primary'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete={formState === 0 ? 'current-password' : 'new-password'}
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p style={{color:"red"}}>{error}</p>

            </FormControl>
            {formState === 0 && (
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
            )}
            <Button type="submit" fullWidth variant="contained">
              {formState === 0 ? 'Sign in' : 'Sign up'}
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              {formState === 0 ? (
                <>
                  Don't have an account?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    sx={{ alignSelf: 'center' }}
                    onClick={toggleFormState}
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/signup"
                    variant="body2"
                    sx={{ alignSelf: 'center' }}
                  >
                    Sign in
                  </Link>{' '}
                  {' '}
                  <Link
                    component="button"
                    variant="body2"
                    sx={{ alignSelf: 'center' }}
                    onClick={toggleFormState}
                  >
                    
                  </Link>
                </>
              )}
            </Typography>
          </Box>
          <Divider>or</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Coming soon')}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Coming soon')}
              startIcon={<FacebookIcon />}
            >
              Sign in with Facebook
            </Button>
          </Box>
        </Card>
      </SignInContainer>

      <Snackbar
      open={open}
      autoHideDuration={4000}
      message={message}></Snackbar>
    </AppTheme>
  );
}