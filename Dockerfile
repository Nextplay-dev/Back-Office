FROM node:24-alpine AS webapp-builder

LABEL maintainer="Nextplay Team"

# create destination directory
WORKDIR /app

# update and install dependency
RUN apk update && apk upgrade

# copy the app, note .dockerignore
COPY package*.json /app/
RUN rm -rf node_modules package-lock.json
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM nginx AS webapp

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/proxy_params /etc/nginx/proxy_params
COPY --from=webapp-builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g daemon off;"]
