import fetch from 'node-fetch';
import json from 'node:json';

const BASE = 'http://localhost:5000/api';

const register = async () => {
  const response = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'GH Connect Debug', email: 'ghconnect_debug@example.com', password: 'password123'}),
  });
  console.log('register', response.status);
  console.log(await response.text());
  return response;
};

const login = async () => {
  const response = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'ghconnect_debug@example.com', password: 'password123'}),
  });
  console.log('login', response.status);
  const data = await response.json();
  console.log(data);
  return data;
};

const connect = async (token) => {
  const response = await fetch(`${BASE}/github/connect`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
    body: JSON.stringify({username: 'octocat'}),
  });
  console.log('connect', response.status);
  const text = await response.text();
  console.log(text);
};

const run = async () => {
  await register();
  const loginData = await login();
  await connect(loginData.token);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
