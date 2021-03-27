# Travel Cost API

An API service to calculate various travel cost parameters between two locations and suggesting the cleanest path among available options

## Setup Instructions

- Clone this repository

### Environment Setup

- Install [Node.js](https://nodejs.dev/learn/how-to-install-nodejs)
- Install [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Setup react and express app

- cd into the directory of client and backend in different terminals and follow their setup instructions

## Additional Development Instructions

- After installing dependencies check whether the pre-commit hook is configured.  
  Check if `husky.sh` exist in `.git/hooks/` directory

- If not, delete the node_modules directory

```sh
rm -rf node_modules
```

- Then reinstall packages

```sh
yarn install
```
