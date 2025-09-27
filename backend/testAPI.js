#!/usr/bin/env node

// Test script to verify admin authentication and API endpoints
const https = require('http');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing PlaySwiftPay Admin API...\n');

  try {
    // Test 1: Admin Login
    console.log('🔐 Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@playswiftpay.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.token) {
      console.log('✅ Admin login successful!');
      console.log(`👤 User: ${loginData.user.name} (${loginData.user.role})`);
      
      const token = loginData.token;
      
      // Test 2: Admin Dashboard
      console.log('\n📊 Testing admin dashboard...');
      const dashboardResponse = await fetch(`${BASE_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('✅ Admin dashboard data retrieved!');
        console.log(`📈 Stats: ${JSON.stringify(dashboardData, null, 2)}`);
      } else {
        console.log('❌ Admin dashboard failed:', await dashboardResponse.text());
      }

      // Test 3: Tournaments API
      console.log('\n🏆 Testing tournaments API...');
      const tournamentsResponse = await fetch(`${BASE_URL}/api/tournaments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (tournamentsResponse.ok) {
        const tournamentsData = await tournamentsResponse.json();
        console.log('✅ Tournaments data retrieved!');
        console.log(`🎯 Found ${Array.isArray(tournamentsData) ? tournamentsData.length : 'N/A'} tournaments`);
      } else {
        console.log('❌ Tournaments API failed:', await tournamentsResponse.text());
      }

    } else {
      console.log('❌ Admin login failed:', loginData);
    }

  } catch (error) {
    console.error('❌ API test error:', error.message);
    console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
    console.log('   Run: cd backend && node server.js');
  }
}

// Add fetch polyfill for Node.js if needed
if (!globalThis.fetch) {
  console.log('⚠️ Installing fetch polyfill...');
  require('dotenv').config();
  globalThis.fetch = require('node-fetch');
}

testAPI();