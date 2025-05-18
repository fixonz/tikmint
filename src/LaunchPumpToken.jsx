import { useState } from 'react';
import { Link } from 'react-router-dom';
import { launchPumpFunToken } from './utils/launchToken';
import './App.css';

function LaunchPumpToken() {
  const [formData, setFormData] = useState({
    privateKey: '',
    name: '',
    ticker: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.privateKey || !formData.name || !formData.ticker) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setTokenAddress(null);
      
      // Launch the token
      const result = await launchPumpFunToken(
        formData.privateKey,
        formData.name,
        formData.ticker
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to launch token');
      }
      
      setTokenAddress(result.tokenAddress);
      setSuccess(`Token "${formData.name}" launched successfully!`);
      
      // Reset sensitive data
      setFormData(prev => ({
        ...prev,
        privateKey: ''
      }));
      
    } catch (error) {
      console.error('Error launching token:', error);
      setError(error.message || 'Failed to launch token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="tikmint-outer">
      <nav className="tikmint-navbar">
        <div className="nav-logo-title">
          <Link to="/">
            <img src="/music-note.png" className="nav-logo" alt="TikMint Note" />
          </Link>
          <span className="nav-title">TikMint Admin Launcher</span>
        </div>
        <div className="nav-links">
          <Link to="/adminlaunch">Admin Panel</Link>
          <Link to="/">Back to Main Site</Link>
        </div>
      </nav>
      
      <div className="tikmint-page-content" style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="admin-page">
          <div className="admin-card glass-card">
            <h2 className="neon-text">Launch PumpFun Token</h2>
            <p className="admin-instruction">Create a new token on PumpFun and add it to the tracked list</p>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {tokenAddress && (
              <div className="success-message">
                <p>Token Address: <a href={`https://solscan.io/token/${tokenAddress}`} target="_blank" rel="noopener noreferrer">{tokenAddress}</a></p>
                <p>Your token has been added to the website listings automatically!</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="privateKey">Private Key (will not be stored)*</label>
                <input
                  type="password"
                  id="privateKey"
                  name="privateKey"
                  value={formData.privateKey}
                  onChange={handleChange}
                  placeholder="Enter your wallet's private key"
                  required
                />
                <small className="input-help">Your private key is only used for signing the transaction and is not stored or transmitted to our servers.</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Token Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Toast"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ticker">Token Ticker*</label>
                <input
                  type="text"
                  id="ticker"
                  name="ticker"
                  value={formData.ticker}
                  onChange={handleChange}
                  placeholder="e.g. TOAST"
                  required
                />
                <small className="input-help">Don't include $ in the ticker</small>
              </div>
              
              <button type="submit" className="admin-submit-btn" disabled={isLoading}>
                {isLoading ? 'Launching...' : 'Launch Token'}
              </button>
            </form>
            
            <div className="security-note">
              <h4>Security Note</h4>
              <p>
                Your private key never leaves your browser and is only used to sign the transaction locally.
                For maximum security, consider using a new wallet with only enough SOL for the transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaunchPumpToken; 