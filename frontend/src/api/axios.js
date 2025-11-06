import axios from 'axios';
const api = axios.create({
  baseURL: 'https://legtech-thjb.onrender.com/api',
  withCredentials: true
});
export default api;
