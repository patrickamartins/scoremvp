// scoremvp-frontend/postcss.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')(),  // Observe os parênteses
    require('autoprefixer')(),           // Também invocamos o autoprefixer
  ],
};
