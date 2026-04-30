import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('loanTrackerToken');
    const savedUser = localStorage.getItem('loanTrackerUser');

    if (savedToken && savedUser) {
      setUserToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, user) => {
    localStorage.setItem('loanTrackerToken', token);
    localStorage.setItem('loanTrackerUser', JSON.stringify(user));
    setUserToken(token);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('loanTrackerToken');
    localStorage.removeItem('loanTrackerUser');
    setUserToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
