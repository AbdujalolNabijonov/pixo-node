module.exports = {
  apps: [
    {
      name: "Pixo-node",
      script: "./dist/server.js",
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
