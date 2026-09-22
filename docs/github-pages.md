# Publish with GitHub Desktop

Repository: https://github.com/Daisy91222/NashZone

1. In the repository web page, open Settings > Pages. Under Build and deployment, set Source to GitHub Actions. GitHub Free requires a public repository for Pages; other plans may support private repositories. This project does not change repository visibility automatically.
2. In GitHub Desktop, select NashZone and the main branch. Review the Changes list, enter a summary such as `Add height study demo and GitHub Pages deployment`, and click Commit to main.
3. Click Push origin. Open the repository Actions tab and select `Deploy NashZone to GitHub Pages`.
4. Once build and deploy succeed, open https://daisy91222.github.io/NashZone/ . This URL is expected after deployment, not confirmation that it is live already.

If the first run occurred before Pages was enabled, enable it and re-run the failed workflow, or choose Actions > Deploy NashZone to GitHub Pages > Run workflow (main). Future pushes to main redeploy automatically.

The workflow runs npm ci, numerical tests and the production build, then uploads only dist. No API key, paid backend or manually committed build output is needed for this geometry demo. Original PDF/AI inputs, dependencies, local extraction output and temporary screenshots are ignored. Public source includes derived parcel geometry, source hashes and project documentation.

## Local checks

```sh
npm ci
npm test
npm run build
npm run preview
```

Optional browser check (requires installed Microsoft Edge): `node scripts/test_browser.mjs --production`. This serves the actual build at a /NashZone/ subpath and verifies the app there. The source development server is now Vite; `server.mjs` is retained as a legacy file and is no longer used by npm scripts.
