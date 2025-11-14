# ---- BUILD FLUTTER WEB ----
FROM debian:stable-slim AS builder

RUN apt-get update && apt-get install -y curl unzip xz-utils git

# Instalar Flutter
RUN git clone https://github.com/flutter/flutter.git /flutter && \
    /flutter/bin/flutter --version

ENV PATH="/flutter/bin:/flutter/bin/cache/dart-sdk/bin:${PATH}"

WORKDIR /app

COPY . .
RUN flutter pub get
RUN flutter build web --release

# ---- SERVIDOR NGINX ----
FROM nginx:alpine

COPY --from=builder /app/build/web /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
