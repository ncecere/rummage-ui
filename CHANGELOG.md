# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.4.0] - 2025-05-11

### Changed
- Refactored `app/page.tsx` by splitting each of the five main feature tabs (Scrape, Crawl, Map, Batch, Search) into its own dedicated component within the `components/features/` directory.
- Centralized shared utility functions (`copyToClipboard`, `downloadFile`, `downloadAsZip`) into `lib/utils.ts`.
- Each feature tab component now manages its own state and uses the `useToast` hook independently.
- This significantly improves code organization, maintainability, and readability of the main page component.

## [v0.3.0] - 2025-05-11

### Added
- Progress bar display for "Entire Site" crawl feature.
- Progress bar display for "Batch Scrape" feature.

### Fixed
- Resolved issue where "Entire Site" crawl status was not correctly updated, preventing results from displaying.
- Corrected "Entire Site" crawl progress bar to display accurately and remain visible during processing.
- Fixed "URL Discovery" (map site) feature to correctly parse API response and display discovered URLs.
- Addressed issues in "Batch Scrape" feature related to API response handling for starting jobs and polling status.
- Corrected "Batch Scrape" progress bar to display accurately and remain visible during processing.
- Improved error message display for site crawl failures.

## [v0.1.0] - 2025-03-22

### Added
- Initial release of Rummage UI
- Single page scraping functionality
- Entire site crawling functionality
- URL discovery (map) functionality
- Batch scraping functionality
- Multiple output formats (markdown, HTML, links)
- Docker support with multi-stage build
- GitHub Actions workflows for Docker image building and releases
- Release automation script

### Changed
- Updated project name to "rummage-ui"
- Improved documentation with detailed usage instructions

[v0.3.0]: https://github.com/ncecere/rummage-ui/compare/v0.1.0...v0.3.0
[v0.1.0]: https://github.com/ncecere/rummage-ui/releases/tag/v0.1.0
