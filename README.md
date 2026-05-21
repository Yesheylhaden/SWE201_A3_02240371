# 📚 LibraryHub — Book & Library Manager
 
A mobile application that helps users keep track of their own book collection. Users can add books to their collection, update reading progress, categorize books, add and remove authors, and keep a record of the books they've read, using a RESTful API.
 
---
 
## Chosen Domain & Main Entities
 
### Primary Entity: `Book`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `title` | string | Title of the book |
| `isbn` | string | ISBN number (optional) |
| `authorId` | string | Foreign key → Author |
| `categoryId` | string | Foreign key → Category |
| `status` | enum | `unread` / `reading` / `completed` |
| `rating` | number | 1–5 star rating (optional) |
| `notes` | string | Personal reading notes (optional) |
| `publishedYear` | number | Year of publication |
| `createdAt` | ISO date string | Record creation timestamp |
| `updatedAt` | ISO date string | Last update timestamp |
 
### Secondary Entity: `Author`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Full name of the author |
| `nationality` | string | Author's nationality (optional) |
| `bio` | string | Short biography (optional) |
 
### Secondary Entity: `Category`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Category name (e.g., Fiction, Science) |
| `description` | string | Short description (optional) |
 
---
 
## State Management Approach
 
**Library used: Zustand**
 
Zustand was selected because of the following reasons:

- **No boilerplate** – Unlike Redux, Zustand needs no action creators, reducers, or providers. All the state and actions are colocated inside a simple store file, which is suitable considering the requirements of this application.
- **Hook-based approach** – Zustand provides access to state through React hooks like `useBookStore` and `useAuthStore`, thus fitting in well within the rest of the React Native code base.
- **Persistence out of the box** – Zustand's `persist` middleware can easily connect to `AsyncStorage` to persist auth tokens and filter states at the start of the application.
- **Suitable scalability for this domain** – The book list, authentication data, and filters are all available in global stores, where individual screens use selectors to avoid unnecessary renders.
**Global stores:**
- `useBookStore` – Stores the book list, loading status, filters and CRUD actions.
- `useAuthStore` – Stores the user session object and JWT token. Stored in `AsyncStorage`.
---
 
## Backend Details
 
### Technology / Service Used
 
**MockAPI.io** — free mock REST backend service.  
Base URL: `https://mockapi.io/projects/<your-project-id>`  
Setup no server, just configure the schema using MockAPI.

> If you’re developing locally, an alternative to JSON Server is available (see Setup Instructions).
 
---
 
### Main API Endpoints
 
#### Books (Primary Entity)
 
| Method | URL | Purpose |
|---|---|---|
| `GET` | `/books` | Fetch all books (supports `?title=`, `?status=`, `?categoryId=`) |
| `GET` | `/books/:id` | Fetch a single book by ID |
| `POST` | `/books` | Create a new book record |
| `PUT` | `/books/:id` | Update an existing book record |
| `DELETE` | `/books/:id` | Delete a book record |
 
#### Authors (Secondary Entity)
 
| Method | URL | Purpose |
|---|---|---|
| `GET` | `/authors` | Fetch all authors |
| `GET` | `/authors/:id` | Fetch a single author |
| `POST` | `/authors` | Create a new author |
| `PUT` | `/authors/:id` | Update an author |
| `DELETE` | `/authors/:id` | Delete an author |
 
#### Categories (Secondary Entity)
 
| Method | URL | Purpose |
|---|---|---|
| `GET` | `/categories` | Fetch all categories |
| `POST` | `/categories` | Create a new category |
| `DELETE` | `/categories/:id` | Delete a category |
 
#### Authentication (Mock)
 
| Method | URL | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Login and receive a mock JWT token |
| `POST` | `/auth/register` | Register a new user account |
 
---
 
## Setup Instructions
 
### Prerequisites
 
- Node.js >= 18.x
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app installed on your physical device (iOS or Android), **or** an Android emulator / iOS Simulator
---
 
### 1. Clone the Repository
 
```bash
git clone https://github.com/<your-username>/libraryhub-app.git
cd libraryhub-app
```
 
---
 
### 2. Install Dependencies
 
```bash
npm install
# or
yarn install
```
 
---
 
### 3. Configure Environment Variables
 
Copy the example environment file and fill in your values:
 
```bash
cp .env.example .env
```
 
Edit `.env`:
 
```env
EXPO_PUBLIC_API_BASE_URL=https://mockapi.io/projects/<your-project-id>
EXPO_PUBLIC_API_TIMEOUT=10000
```
 
> If using the local JSON Server alternative (see below), set:
> ```env
> EXPO_PUBLIC_API_BASE_URL=http://<your-local-ip>:3001
> ```
> Use your machine's local IP address (not `localhost`) when testing on a physical device.
 
---
 
### 4. Run the App
 
**Start the Expo development server:**
 
```bash
npx expo start
```
 
**To Open via Android:**
- Enter the letter `a` in the terminal to launch within an Android emulator, or
- Scan the QR Code using the **Expo Go** app on your Android device.

**To Open via iOS:**
- Tap `i` in the terminal to run within an iOS Simulator (Mac OS only), or
- Scan the QR Code using the **Expo Go** app on your iOS device.

---
 
### 5. Backend — MockAPI.io (Default)
 
The local environment is not necessary. The application connects to the MockAPI.io project in real-time automatically.
 
1. Register on the site [https://mockapi.io](https://mockapi.io).
2. Create a new project and create resources `books`, `authors`, `categories`, and `users` with the attributes above.
3. Enter your project's base URL in the `.env` file like in the example above.
---
 
### 6. Backend — JSON Server (Local Alternative)
 
If you would rather run a pure local backend:

```bash
# Install JSON Server globally
npm install -g json-server

# Go into the mock-backend directory
cd mock-backend

# Run the server at port 3001
json-server --watch db.json --port 3001
```

The `mock-backend/db.json` file is where we store our book seed data.
 
---
 
## Known Limitations & Missing Features
  
- **Mock authentication only** – Mock token login registration without any form of password hashing or session verification on the server-side. Uses AsyncStorage to store JWTs but not for authentication.
- **Image uploading capability missing** – Book cover images are simply URLs, and there is no camera or gallery capability for uploading photos yet in the app.
- **Lacks offline capabilities** – The application will not work without being connected to the internet. Caching or queuing operations while offline have not been implemented.
- **Pagination not fully functional** – The entire book data set gets retrieved at once during one call. Pagination/infinite scrolling has not been completed.
- **Limited iOS testing** – Testing done via Expo Go on Android. There may be some minor differences in the user interface on the iOS platform, such as date picker functionality.
- **Push notifications not available** – Reminders or status notifications for reading books are not available yet.
- **Deleting authors does not cascade** – Deletion of authors from the database will not automatically delete or unchain associated books.