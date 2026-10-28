FROM php:8.3-cli-alpine

# Instalar dependências de sistema e bibliotecas necessárias
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    linux-headers \
    $PHPIZE_DEPS

# Instalar extensões PHP do banco e sistema
RUN docker-php-ext-install pdo pdo_pgsql bcmath pcntl

# Instalar extensão do Redis via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Definir diretório de trabalho
WORKDIR /var/www

# Copiar arquivos do projeto
COPY . /var/www

# Ajustar permissões para storage e bootstrap/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

# Comando padrão: inicia o servidor embutido do Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]