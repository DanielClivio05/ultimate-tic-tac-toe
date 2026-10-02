# Serves the static game with nginx. No build step needed.
FROM nginx:alpine
COPY index.html style.css game.js ui.js /usr/share/nginx/html/
EXPOSE 80
