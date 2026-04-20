import axios from 'axios';

// Create an instance of axios with the base URL
const Api = axios.create({
  baseURL: "http://localhost:8000"
});

// Export the Axios instance
export default Api;