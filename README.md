# monorepo npm OIDC releases

This example monorepo demonstrates CI-only releases using npm OIDC (OpenID Connect) authentication with [pnpm](https://pnpm.io/) + GitHub Release's [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)

## Key Benefits

- **No npm tokens required** - Uses OIDC authentication instead of npm tokens
- **No secrets leakage risk** - Eliminates the need to store and manage npm tokens in GitHub Secrets
- **Secure CI-only releases** - All releases are performed via GitHub Actions with temporary credentials

## Published Packages

- [@azu/monorepo-sandbox-release-x](https://www.npmjs.com/package/@azu/monorepo-sandbox-release-x)
- [@azu/monorepo-sandbox-release-y](https://www.npmjs.com/package/@azu/monorepo-sandbox-release-y)
- [@azu/monorepo-sandbox-release-z](https://www.npmjs.com/package/@azu/monorepo-sandbox-release-z)

## Setup

### GitHub Actions Configuration

To enable the release workflows, you need to configure the following:

1. **Enable GitHub Actions to create Pull Requests**:
   - Go to Settings → Actions → General
   - Under "Workflow permissions", check "Allow GitHub Actions to create and approve pull requests"

2. **Configure npm OIDC Publishing** (requires npm 11.5.1+):
   - For each package in npmjs.com:
     1. Go to the package page (e.g., https://www.npmjs.com/package/@your-scope/package-name)
     2. Click "Settings" → "Publishing access"
     3. Under "Trusted publishers", click "Add trusted publisher"
     4. Select "GitHub Actions" and configure:
        - Repository: `your-username/monorepo-npm-oidc-releases`
        - Workflow: `release.yml`
        - Environment: (leave empty)
   - **This completely eliminates the need for NPM_TOKEN secrets**
   - **No risk of token leakage or exposure in logs**
   - See [npm docs on trusted publishers](https://docs.npmjs.com/trusted-publishers) for details

## Usage

### Create and Review Release PR

UseCase:

- Review Release Note before publishing
- Secure automated publishing from CI using OIDC
- Zero secrets configuration - no npm tokens needed

Steps:

1. Create Release PR via dispatching [.github/workflows/create-release-pr.yml](https://github.com/azu/monorepo-npm-oidc-releases/actions/workflows/create-release-pr.yml)
   - You can select new version with semver(patch,minor,major)
   - ![Create Release Pull Request Image](./create-release-pr.png)
2. [CI] Create Release PR
   - Update `packages/*/package.json`'s `version`
   - Fill the Pull Request body with [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
   - e.g. https://github.com/azu/monorepo-npm-oidc-releases/pull/18
3. Review Release PR
    - You can modify PR body
4. Merge Release PR
5. [CI] Publish new version to npm and GitHub Release
    - The release note content is same to PR body
    - CI copy to release note from PR body when merge the PR
    - e.g. https://github.com/azu/monorepo-npm-oidc-releases/releases/tag/v1.6.3

> **Warning**
> If the publishing(Step 5) fails, you can re-run the workflow, or use the manual release workflow below.

### Manual Release from CI

If the automatic publishing fails (e.g., npm registry is down or some package is broken), you can manually trigger the release workflow.

UseCase:

- Retry to publish if failed

Steps:

0. [Optional] You can commit to fix broken packages
1. Dispatch [.github/workflows/release.yml](https://github.com/azu/monorepo-npm-oidc-releases/actions/workflows/release.yml) workflow
2. [CI] Publish new version to npm and create new GitHub Release if not published yet
   - The release note content is [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes) by default

> **Warning**
> This manual workflow requires updating version before executing.  
> The most common use-case is retrying a failed automatic publish.  
> If you want to fix something, it is preferable to start again with a new Release PR.

> **Note**
> No matter how many times this workflow is executed, the result is the same.
> - No publish if packages are already published
> - No add tag if git tag is added
> - Overwrite release note if GitHub Release is already created

## Changelog

See [Releases page](https://github.com/azu/monorepo-sandbox/releases).

## Develop

This monorepo uses GitHub Packages Registry.

npm package name link to repository owner on GitHUb Packages Registry.

So, You need to change each `packages/*/package.json` after fork this repository.

- name: `@{you}/<name>`
- repository.url: "https://github.com/{you}/monorepo-npm-oidc-releases.git"

## Related

- [azu/github-label-setup: 📦 Setup GitHub label without configuration.](https://github.com/azu/github-label-setup)
  - This monorepo use this label set for [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
- [azu/monorepo-github-releases: monorepo release flow: lerna + GitHub Release's Automatically generated release notes](https://github.com/azu/monorepo-github-releases)
  - monorepo release flow: lerna + GitHub Release's Automatically generated release notes 
- [azu/lerna-monorepo-github-actions-release: Lerna + monorepo +GitHub Actions Release Flow](https://github.com/azu/lerna-monorepo-github-actions-release)
  - monorepo + conventional commit release flow with GitHub Actions


## Contributing

Pull requests and stars are always welcome!

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
