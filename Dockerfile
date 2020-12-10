FROM node:10.23.0-alpine3.10

WORKDIR /app
# ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 8000

COPY . .
RUN npm install
RUN npm run build
EXPOSE 8000

CMD ["npm", "start"]
COPY . .
