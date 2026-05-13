FROM node:20-slim

WORKDIR /app

# skopiuj package.json i zainstaluj zależności
COPY package*.json .
RUN npm install

# skopiuj kod frontendu
COPY . .

# port na którym działa Vite
EXPOSE 5173

# komenda startowa
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]