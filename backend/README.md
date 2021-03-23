# Travel Cost API

An API service to calculate various travel cost parameters between two locations and suggesting the cleanest path among available options

## Setup Instructions

- Clone this repository

### Environment Setup

- Install [Node.js](https://nodejs.dev/learn/how-to-install-nodejs)
- Install [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Install Dependencies

- In the terminal run the following command

```sh
yarn install
```

### Configuring the App

- Create a file named as `.env` with same contents as file `.env.sample`

```sh
cp .env.sample .env
```

### Run the server

- Run the following command

```sh
yarn start
```

## Usage

- On your browser visit this url http://localhost:8000/

- To get realtime pollution Data from different zones of city, visit http://localhost:8000/aqi/id  
  where id is a number between 0-7

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
