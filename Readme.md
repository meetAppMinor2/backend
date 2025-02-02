# Backend Project - Minor 2

## Project Overview
This project is a backend service for a web application. It provides APIs for user authentication, data management, and other functionalities.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Token)

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/minor2-backend.git
    ```
2. Navigate to the project directory:
    ```sh
    cd minor2-backend
    ```
3. Install dependencies:
    ```sh
    npm install
    ```

## Configuration
1. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_secret_key
    ```

## Running the Application
1. Start the development server:
    ```sh
    npm run dev
    ```
2. The server will be running at `http://localhost:3000`.

## API Endpoints
- `POST /v1/api/auth/register` - Register a new user
- `POST /v1/api/auth/login` - Login a user
- `POST /v1/api/auth/login` - Logout a user

## License
This project is licensed under the MIT License.

## Contact
For any inquiries, please contact [your email address].
