# ScoreMVP

A basketball statistics platform built with FastAPI, PostgreSQL, and React.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Python 3.8+
- PostgreSQL 12+

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/scoremvp.git
cd scoremvp
```

2. Install backend dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Set up environment variables
```bash
# Backend (.env)
cp .env.example .env
# Edit .env with your database credentials

# Frontend (.env)
cp .env.example .env
# Edit .env with your API URL
```

5. Run the development servers
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev
```

## 📁 Project Structure

```
scoremvp/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── tests/
│   └── main.py
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── public/
```

## 📝 Code Standards

### Naming Conventions

#### Backend (Python)

- **Files**: Use snake_case (e.g., `user_service.py`)
- **Classes**: Use PascalCase (e.g., `UserService`)
- **Functions/Methods**: Use snake_case (e.g., `get_user_by_id`)
- **Variables**: Use snake_case (e.g., `user_data`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

#### Frontend (TypeScript/React)

- **Files**: Use PascalCase for components (e.g., `UserProfile.tsx`), camelCase for others (e.g., `api.ts`)
- **Components**: Use PascalCase (e.g., `UserProfile`)
- **Functions**: Use camelCase (e.g., `getUserData`)
- **Variables**: Use camelCase (e.g., `userData`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Interfaces/Types**: Use PascalCase with prefix (e.g., `IUserData`, `UserProps`)

### API Routes

- Use kebab-case for URLs (e.g., `/user-profile`)
- Use camelCase for query parameters (e.g., `?userId=123`)
- Use plural nouns for resources (e.g., `/users` instead of `/user`)

### Database

- Use snake_case for table and column names
- Use plural nouns for table names
- Prefix tables with module name (e.g., `auth_users`, `stats_games`)

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to build process or auxiliary tools

### Code Style

- Use ESLint and Prettier for frontend code
- Use Black and isort for backend code
- Maximum line length: 100 characters
- Use meaningful variable and function names
- Add JSDoc/TypeDoc comments for public APIs
- Write unit tests for critical functionality

### Security

- Never commit sensitive data (passwords, API keys, etc.)
- Use environment variables for configuration
- Validate all user input
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Use HTTPS in production
- Follow OWASP security guidelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 