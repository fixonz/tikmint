import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function AdminLaunch() {
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    ca: '',
    time: new Date().toLocaleString()
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  
  // Fetch the current list of tokens
  const fetchTokens = async () => {
    try {
      setIsLoadingTokens(true);
      const response = await fetch('/api/launches');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setError('Failed to fetch tokens. Please refresh the page.');
    } finally {
      setIsLoadingTokens(false);
    }
  };
  
  // Load tokens on page load
  useEffect(() => {
    fetchTokens();
  }, []);
  
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
    if (!formData.name || !formData.ticker || !formData.ca) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/addToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      
      await response.json();
      setSuccess(`Token "${formData.name}" added successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        ticker: '',
        ca: '',
        time: new Date().toLocaleString()
      });
      
      // Refresh the token list
      fetchTokens();
      
    } catch (error) {
      console.error('Error adding token:', error);
      setError(error.message || 'Failed to add token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (ca, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/admin/deleteToken?ca=${encodeURIComponent(ca)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      
      await response.json();
      setSuccess(`Token "${name}" deleted successfully!`);
      
      // Refresh the token list
      fetchTokens();
      
    } catch (error) {
      console.error('Error deleting token:', error);
      setError(error.message || 'Failed to delete token. Please try again.');
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
          <span className="nav-title">TikMint Admin</span>
        </div>
        <div className="nav-links">
          <Link to="/launchtoken">Launch Token</Link>
          <Link to="/">Back to Main Site</Link>
        </div>
      </nav>
      
      <div className="tikmint-page-content" style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="admin-page">
          <div className="admin-card glass-card">
            <h2 className="neon-text">Admin Launch</h2>
            <p className="admin-instruction">Add new tokens to the tracked list</p>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit} className="admin-form">
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
                  placeholder="e.g. $TOAST"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ca">Contract Address*</label>
                <input
                  type="text"
                  id="ca"
                  name="ca"
                  value={formData.ca}
                  onChange={handleChange}
                  placeholder="e.g. ALcYrZ4A41JUoDGKCbhUkjkcUiRjs2sbrUhmTJXMpump"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Launch Time</label>
                <input
                  type="text"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="e.g. 5/18/2024, 10:30:45 AM"
                />
              </div>
              
              <button type="submit" className="admin-submit-btn" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Token'}
              </button>
            </form>
            
            <div className="admin-tokens-list">
              <h3 className="admin-tokens-header">Current Tokens</h3>
              
              {isLoadingTokens ? (
                <div className="admin-loading">Loading tokens...</div>
              ) : tokens.length > 0 ? (
                <div className="admin-tokens-grid">
                  {tokens.map((token, idx) => (
                    <div className="admin-token-item" key={idx}>
                      <div className="admin-token-details">
                        <div className="admin-token-info">
                          <div className="admin-token-name">{token.name} <span className="admin-token-ticker">{token.ticker}</span></div>
                          <div className="admin-token-ca">{token.ca}</div>
                          <div className="admin-token-time">{token.time}</div>
                          {token.description && <div className="admin-token-description">{token.description}</div>}
                        </div>
                        {token.image && (
                          <div className="admin-token-image">
                            <img src={token.image} alt={token.name} />
                          </div>
                        )}
                      </div>
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(token.ca, token.name)}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-no-tokens">No tokens found. Add your first token using the form above.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLaunch; 