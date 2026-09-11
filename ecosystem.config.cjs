module.exports = {
  apps: [
    {
      name: 'vigil-backend',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        PORT: 5000,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'vigil-frontend',
      cwd: './frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: '--port 3000 --host',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
