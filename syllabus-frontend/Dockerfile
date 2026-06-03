# Фронтенд (React)
# Етап 1: Збірка (Build)
FROM node:18-alpine AS build

# Робоча директорія всередині контейнера
WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо залежності (використовуємо npm ci для більш надійної збірки, якщо є package-lock.json, інакше npm install)
RUN npm install

# Копіюємо весь код
COPY . .

# Будуємо оптимізований production білд
RUN npm run build

# Етап 2: Сервірування (Nginx)
FROM nginx:alpine

# Копіюємо зібрані файли з попереднього етапу у стандартну папку Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Замінюємо дефолтний конфіг Nginx (для підтримки React Router)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# Відкриваємо 80 порт
EXPOSE 80

# Запускаємо Nginx
CMD ["nginx", "-g", "daemon off;"]
