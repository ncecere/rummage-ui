# Rummage UI

A Next.js application for converting web pages to markdown and other formats using the Rummage API.

![Version](https://img.shields.io/github/v/release/ncecere/rummage-ui?include_prereleases)
![Docker](https://img.shields.io/github/actions/workflow/status/ncecere/rummage-ui/docker-build.yml?label=docker)

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

## GitHub Container Registry

You can pull the Docker image directly from GitHub Container Registry:

```bash
# Pull the latest version
docker pull ghcr.io/ncecere/rummage-ui:latest

# Pull a specific version
docker pull ghcr.io/ncecere/rummage-ui:v0.1.0

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_RUMMAGE_API_URL=https://rummage.thebitop.net ghcr.io/ncecere/rummage-ui:v0.1.0
```

## Releases

### Creating a New Release

You can create a new release using the provided script:

```bash
# Make sure the script is executable
chmod +x scripts/release.sh

# Create a new release (don't include the 'v' prefix)
./scripts/release.sh 0.2.0
```

This script will:
1. Update the version in `package.json`
2. Prompt you to update the `CHANGELOG.md` file
3. Commit the changes to both files
4. Create a new git tag (e.g., `v0.2.0`)
5. Push the changes and tag to GitHub

The `CHANGELOG.md` file follows the [Keep a Changelog](https://keepachangelog.com/) format and should be updated for each release with details about what was added, changed, or fixed.

Alternatively, you can manually create a release:

1. Update the version in `package.json`
2. Commit your changes
3. Create and push a new tag:

```bash
# Create a new tag
git tag -a v0.1.0 -m "Release v0.1.0"

# Push the tag
git push origin v0.1.0
```

This will trigger the GitHub Actions workflows to:
1. Build and push a Docker image to GitHub Container Registry
2. Create a GitHub release with auto-generated changelog

### GitHub Workflows

This project includes two GitHub workflows that **only run when a tag is pushed**:

1. **Docker Build** (`.github/workflows/docker-build.yml`): Builds and pushes the Docker image to GitHub Container Registry.
2. **Create Release** (`.github/workflows/release.yml`): Creates a GitHub release with auto-generated changelog.

These workflows will not run on regular commits to branches, only when you create and push a tag starting with 'v' (e.g., v0.1.0).

You can simulate the release process without actually pushing a tag by running:

```bash
# Make the script executable
chmod +x scripts/simulate-release.sh

# Run the simulation
./scripts/simulate-release.sh
```

This will show you what happens when a tag is pushed to GitHub, including the workflows that are triggered and the actions they perform.
