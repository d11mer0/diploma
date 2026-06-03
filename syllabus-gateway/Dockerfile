# Бекенд (NestJS)
# Етап 1: Збірка (Build)
FROM node:20-alpine AS build

WORKDIR /app

# Необхідно для Prisma (для генерації клієнта потрібні деякі системні бібліотеки в Alpine)
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Встановлюємо залежності та генеруємо Prisma Client
RUN npm install
RUN npx prisma generate

COPY . .

# Будуємо NestJS додаток
RUN npm run build

# Етап 2: Production образ
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Копіюємо лише те, що потрібно для роботи
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma
# ДОДАНО: Копіюємо файл з даними для сідінгу
COPY --from=build /app/ecf_data.json ./

# Створюємо директорію для завантажень
RUN mkdir -p /app/uploads

EXPOSE 3000

# Команда для запуску (застосування міграцій перед стартом)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
