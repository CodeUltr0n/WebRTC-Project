import * as React from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../components/Customicons1';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  position: 'relative',
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  overflowY: 'auto',
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

export default function SignUp(props) {
  const [formState, setFormState] = React.useState({
    name: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = React.useState({
    name: '',
    username: '',
    password: '',
  });
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const { handleRegister } = useContext(AuthContext);

  const validateInputs = () => {
    const newErrors = {
      name: '',
      username: '',
      password: '',
    };
    let isValid = true;

    if (!formState.name.trim()) {
      newErrors.name = 'Name is required.';
      isValid = false;
    }

    if (!formState.username.trim()) {
      newErrors.username = 'Username is required.';
      isValid = false;
    }

    if (!formState.password || formState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setIsSubmitted(true);

    if (!validateInputs()) {
      return;
    }

    try {
      await handleRegister({
        name: formState.name,
        username: formState.username,
        password: formState.password,
      });
      setSnackbar({
        open: true,
        message: 'Sign up successful!',
        severity: 'success',
      });
    } catch (error) {
      let errorMessage = 'Sign up failed. Please try again.';
      if (
        error &&
        (typeof error === 'string' ||
          (typeof error === 'object' && error.message))
      ) {
        errorMessage = error.message || error.toString();
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined" component="section" aria-labelledby="signup-title">
          <SitemarkIcon />
          <Typography
            component="h1"
            id="signup-title"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleAuth}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            noValidate
          >
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Jon Snow"
                value={formState.name}
                onChange={handleChange('name')}
                error={isSubmitted && Boolean(errors.name)}
                helperText={isSubmitted && errors.name ? errors.name : ''}
                color={isSubmitted && errors.name ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <TextField
                required
                fullWidth
                id="username"
                placeholder="yourusername"
                name="username"
                autoComplete="username"
                variant="outlined"
                value={formState.username}
                onChange={handleChange('username')}
                error={isSubmitted && Boolean(errors.username)}
                helperText={isSubmitted && errors.username ? errors.username : ''}
                color={isSubmitted && errors.username ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                value={formState.password}
                onChange={handleChange('password')}
                error={isSubmitted && Boolean(errors.password)}
                helperText={isSubmitted && errors.password ? errors.password : ''}
                color={isSubmitted && errors.password ? 'error' : 'primary'}
              />
            </FormControl>
            <Button type="submit" fullWidth variant="contained" aria-label="Sign up">
              Sign up
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setSnackbar({ open: true, message: 'Coming soon', severity: 'info' })}
              startIcon={<GoogleIcon />}
              aria-label="Sign up with Google"
            >
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setSnackbar({ open: true, message: 'Coming soon', severity: 'info' })}
              startIcon={<FacebookIcon />}
              aria-label="Sign up with Facebook"
            >
              Sign up with Facebook
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/auth" variant="body2" sx={{ alignSelf: 'center' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppTheme>
  );
}