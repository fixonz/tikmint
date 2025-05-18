import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { launchPumpFunToken } from './utils/launchToken';
import './App.css';

function LaunchPumpToken() {
  const [formData, setFormData] = useState({
    privateKey: '',
    name: '',
    ticker: '',
    description: 'Launched on TikMint', // Fixed description
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState(null);
  const [tokenImage, setTokenImage] = useState(null);
  const imageContainerRef = useRef(null);
  
  // Listen for paste events (CTRL+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.items) {
        // Look for image content in the clipboard
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            
            reader.onload = (e) => {
              setTokenImage(e.target.result);
            };
            
            reader.readAsDataURL(blob);
            e.preventDefault();
            break;
          }
        }
      }
    };

    // Add paste event listener to the document
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Don't update description field as it's fixed
    if (name === 'description') return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageClick = () => {
    // Create a file input and trigger it
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setTokenImage(e.target.result);
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };
    fileInput.click();
  };
  
  const handleImageClear = (e) => {
    e.stopPropagation();
    setTokenImage(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.privateKey || !formData.name || !formData.ticker) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!tokenImage) {
      setError('Please add a token image');
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
        formData.ticker,
        formData.description,
        tokenImage
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to launch token');
      }
      
      setTokenAddress(result.tokenAddress);
      setSuccess(`Token "${formData.name}" launched successfully and 0.001 SOL worth of tokens purchased!`);
      
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
            
            <div className="token-warning">
              <strong>Important:</strong> Launching requires approximately 0.01 SOL for transaction fees.
              The system will automatically purchase 0.001 SOL worth of tokens.
              Make sure your wallet has sufficient funds.
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {tokenAddress && (
              <div className="success-message">
                <p>Token Address: <a href={`https://solscan.io/token/${tokenAddress}`} target="_blank" rel="noopener noreferrer">{tokenAddress}</a></p>
                <p>Your token has been added to the website listings automatically!</p>
                <p>The process automatically purchased exactly 0.001 SOL worth of your token to provide initial liquidity.</p>
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
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  readOnly
                  disabled
                  className="readonly-input"
                />
                <small className="input-help">Fixed description for all tokens: "Launched on TikMint"</small>
              </div>
              
              <div className="form-group">
                <label>Token Image (Required)*</label>
                <div 
                  className="token-image-container" 
                  onClick={handleImageClick}
                  ref={imageContainerRef}
                >
                  {tokenImage ? (
                    <div className="token-image-preview">
                      <img src={tokenImage} alt="Token" />
                      <button 
                        type="button" 
                        className="token-image-clear-btn"
                        onClick={handleImageClear}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="token-image-placeholder">
                      <span>Click to upload or CTRL+V to paste</span>
                    </div>
                  )}
                </div>
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