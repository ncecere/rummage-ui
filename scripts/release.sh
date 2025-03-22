#!/bin/bash

# Check if a version is provided
if [ -z "$1" ]; then
  echo "Error: No version specified"
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 0.2.0"
  exit 1
fi

VERSION="$1"
VERSION_TAG="v$VERSION"

# Check if version starts with 'v'
if [[ "$VERSION" == v* ]]; then
  echo "Error: Version should not start with 'v'"
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 0.2.0"
  exit 1
fi

# Check if the current directory is the project root
if [ ! -f "package.json" ]; then
  echo "Error: This script must be run from the project root directory"
  exit 1
fi

# Update version in package.json
echo "Updating version in package.json to $VERSION..."
npm version "$VERSION" --no-git-tag-version

# Update CHANGELOG.md
echo "Don't forget to update CHANGELOG.md with the new version!"
read -p "Press Enter to continue after updating CHANGELOG.md..."

# Commit the changes
echo "Committing changes..."
git add package.json CHANGELOG.md
git commit -m "chore: bump version to $VERSION_TAG"

# Create a new tag
echo "Creating tag $VERSION_TAG..."
git tag -a "$VERSION_TAG" -m "Release $VERSION_TAG"

# Push changes and tag to remote
echo "Pushing changes and tag to remote..."
git push origin main
git push origin "$VERSION_TAG"

echo "Release $VERSION_TAG created and pushed successfully!"
echo "GitHub Actions workflows will now build the Docker image and create a GitHub release."
