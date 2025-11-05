import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const useAuthRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only perform redirection once the authentication status is confirmed
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/st-admin/dashboard', { replace: true });
      } else if (user.role === 'retailer') {
        navigate('/retailer/dashboard', { replace: true }); // Assuming retailer dashboard route
      }
    }
  }, [user, loading, navigate]);

  return loading;
};

export default useAuthRedirect;