import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthModalDialog({ onClose, initialMode = 'signin' }) {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      try {
        setLoading(true);
        await resetPassword(email);
        setSuccessMsg('Password reset instructions have been sent to your email.');
      } catch (err) {
        setErrorMsg(err.message || 'Failed to send reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'signup') {
        const data = await signUp(email, password);
        if (data?.user && !data?.session) {
          setSuccessMsg('Account created! Please check your email to confirm your account before logging in.');
        } else {
          setSuccessMsg('Account created and signed in successfully!');
          setTimeout(() => onClose(), 1000);
        }
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="modal auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-modal__header">
          <h2 id="auth-modal-title" className="modal__title">
            {mode === 'signin' && 'Sign In to Your Account'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <p className="modal__message">
          {mode === 'signin' && 'Access and sync your UNILAG CGPA records from any device.'}
          {mode === 'signup' && 'Sign up to securely back up your academic records to the cloud.'}
          {mode === 'forgot' && 'Enter your email to receive a password reset link.'}
        </p>

        {errorMsg && (
          <div className="alert alert--error" role="alert">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="alert alert--success" role="status">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="e.g. student@live.unilag.edu.ng"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="auth-password" className="form-label">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password" className="form-label">Confirm Password</label>
              <input
                id="auth-confirm-password"
                type="password"
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          <div className="auth-modal__submit-row">
            <button
              type="submit"
              className="btn btn--primary auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Account'
                : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <div className="auth-modal__footer">
          {mode === 'signin' && (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  if (!isOpen) return null;
  return <AuthModalDialog onClose={onClose} initialMode={initialMode} />;
}
