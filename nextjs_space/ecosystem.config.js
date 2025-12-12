module.exports = {
  apps: [{
    name: 'impactusall-mvp',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/github_repos/impactusall-mvp/nextjs_space',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
