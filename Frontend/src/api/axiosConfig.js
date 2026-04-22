import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ||
	(window.location.hostname.endsWith('.pages.dev')
		? 'https://assemblytrack-backend.onrender.com'
		: 'http://localhost:9090');

axios.defaults.baseURL = API_BASE_URL;

export default axios;
