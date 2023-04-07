import axios from 'axios';

const BASE_URL = 'https://api.github.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
  // params: {
  //   access_token: process.env.REACT_APP_GITHUB_API_TOKEN,
  // },
});

export default api;
