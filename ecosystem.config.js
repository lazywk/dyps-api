module.exports = {
  apps: [
    {
      name: "dyps-api",
      script: "dist/index.js", // <-- build qilingan fayl
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 8080,
        DATABASE_URL: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      },
    },
  ],
};
