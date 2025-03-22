# Rummage UI

A Next.js application for converting web pages to markdown and other formats.

## Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_RUMMAGE_API_URL`: The base URL for the Rummage API (default: https://rummage.thebitop.net)

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env` and update the values as needed:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

## Docker

### Using Docker Compose

1. Copy `.env.example` to `.env.docker` and update the values as needed:
   ```bash
   cp .env.example .env.docker
   ```

2. Build and start the container:
   ```bash
   docker-compose up -d
   ```

### Using Docker directly

1. Build the Docker image:
   ```bash
   docker build -t rummage-ui .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 -e NEXT_PUBLIC_RUMMAGE_API_URL=https://rummage.thebitop.net rummage-ui
   ```

## Production

For production deployment, make sure to set the `NEXT_PUBLIC_RUMMAGE_API_URL` environment variable to your production API URL.
# rummage-ui
