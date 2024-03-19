# Login API 

Login API Rest project built using Nest.js framework.

## Getting Started

Before you begin, make sure you have [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/), and [Docker](https://www.docker.com/) installed on your machine.

### 1. Install Project Packages
Execute the following command to install the required project packages:

```bash
npm install 
```
### 2. Set Up Docker
For the initial setup, run the following command to start the project using Docker:

```bash
docker-compose up -d
```
For subsequent runs, simply start the containers:

```bash
docker-compose start
```
### 3. Configure Environment Variables
Create an `.env` file based on the provided model in `.env.example`.

### 4. Run the Project
Execute either of the following commands to run the project:

```bash
npm run start
```
or for development mode:

```bash
npm run start:dev
```
You are now ready to explore and develop within the project environment.

Check the documentation of the created APIs in [Swagger](http://host/api/documentation) (change host to the application address).