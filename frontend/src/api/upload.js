import api from './axios';

export const uploadSingle = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
