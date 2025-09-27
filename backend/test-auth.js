const axios = require('axios');

async function testRegistration() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.log('Registration error:', error.response?.data || error.message);
  }
}

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login successful:', response.data);
  } catch (error) {
    console.log('Login error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('Testing registration...');
  await testRegistration();
  
  console.log('\nTesting login...');
  await testLogin();
}

runTests();