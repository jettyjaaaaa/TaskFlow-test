## Database Schema Documentation

### Overview
TaskFlow uses PostgreSQL (via Supabase) with a relational schema to manage tasks and user assignments. The use of a many-to-many relationship through a junction table provides flexibility for multiple team members per task.

### Why Relational Database?

1. **Data Integrity**: Foreign keys ensure referential integrity between users, tasks, and assignments
2. **Scalability**: Efficient queries with proper indexing
3. **ACID Compliance**: Guarantees data consistency during concurrent operations
4. **Complex Relationships**: Many-to-many relationships handled elegantly with junction tables

### Schema Diagram

```
┌─────────────────┐          ┌──────────────────┐          ┌──────────────┐
│     USERS       │          │     TASKS        │          │ASSIGNMENTS   │
├─────────────────┤          ├──────────────────┤          ├──────────────┤
│ id (PK)         │◄─────────│ created_by (FK)  │          │ id (PK)      │
│ email (UNIQUE)  │          │ id (PK)          │──────────│ task_id (FK) │
│ password        │          │ title            │          │ user_id (FK) │
│ name            │          │ description      │          │ created_at   │
│ role            │          │ project_name     │          └──────────────┘
│ avatar_url      │          │ tag              │
│ created_at      │          │ priority         │
│ updated_at      │          │ status           │
└─────────────────┘          │ progress         │
                             │ due_date         │
                             │ created_at       │
                             │ updated_at       │
                             └──────────────────┘
```

### Table Definitions

#### USERS Table
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique user identifier (auto-incremented)
- `email`: User email (unique, used for login)
- `password`: User password (should be hashed in production)
- `name`: Display name
- `role`: User role (admin, member)
- `avatar_url`: URL to user's avatar image
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- Primary Key on `id`
- Unique constraint on `email`

#### TASKS Table
```sql
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_name VARCHAR(255),
  tag VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'Medium',
  status VARCHAR(50) DEFAULT 'To Do',
  progress INTEGER DEFAULT 0,
  due_date DATE,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique task identifier
- `title`: Task title (required)
- `description`: Detailed task description
- `project_name`: Associated project name
- `tag`: Task category or tag
- `priority`: Task priority (Low, Medium, High)
- `status`: Current status (To Do, In Progress, Done)
- `progress`: Progress percentage (0-100)
- `due_date`: Task deadline
- `created_by`: FK to user who created the task
- `created_at`: Task creation timestamp
- `updated_at`: Last modification timestamp

**Indexes:**
- Primary Key on `id`
- Foreign Key on `created_by`
- Index on `status` (for filtering)
- Index on `priority` (for filtering)

#### TASK_ASSIGNMENTS Table (Many-to-Many Junction)
```sql
CREATE TABLE task_assignments (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, user_id)
);
```

**Columns:**
- `id`: Assignment record identifier
- `task_id`: FK to tasks table
- `user_id`: FK to users table
- `created_at`: Assignment creation timestamp

**Constraints:**
- Unique constraint on (task_id, user_id) prevents duplicate assignments
- Cascading delete: When a task is deleted, all its assignments are removed
- Cascading delete: When a user is deleted, all their assignments are removed

**Indexes:**
- Primary Key on `id`
- Foreign Key on `task_id`
- Foreign Key on `user_id`
- Index on `task_id` (for fetching all assignees of a task)
- Index on `user_id` (for fetching all tasks assigned to a user)

### Query Examples

#### Get all tasks with assignees
```sql
SELECT 
  t.*,
  json_agg(json_build_object('id', u.id, 'name', u.name, 'email', u.email)) AS assignees
FROM tasks t
LEFT JOIN task_assignments ta ON t.id = ta.task_id
LEFT JOIN users u ON ta.user_id = u.id
GROUP BY t.id
ORDER BY t.created_at DESC;
```

#### Get tasks assigned to a specific user
```sql
SELECT DISTINCT t.*
FROM tasks t
JOIN task_assignments ta ON t.id = ta.task_id
WHERE ta.user_id = $1
ORDER BY t.status, t.priority;
```

#### Get task with all details
```sql
SELECT 
  t.*,
  u.name as created_by_name,
  json_agg(json_build_object(
    'user_id', ta.user_id,
    'name', au.name,
    'email', au.email,
    'avatar_url', au.avatar_url
  )) AS task_assignments
FROM tasks t
LEFT JOIN users u ON t.created_by = u.id
LEFT JOIN task_assignments ta ON t.id = ta.task_id
LEFT JOIN users au ON ta.user_id = au.id
WHERE t.id = $1
GROUP BY t.id, u.id;
```

### Seed Data

The `seed.sql` file includes:
- 5 mock users (1 admin + 4 members)
- 6 sample tasks distributed across statuses
- 16 task assignments demonstrating many-to-many relationships

### Performance Optimization

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Pagination**: Limits returned rows to improve response times
3. **Foreign Keys**: Maintains data integrity without application logic
4. **Cascading Deletes**: Automatic cleanup of assignments when tasks/users are deleted

### Scaling Considerations

For production deployment with millions of tasks:
1. Add partitioning on the `tasks` table by creation date
2. Implement archival strategy for completed tasks
3. Use connection pooling (e.g., PgBouncer)
4. Consider read replicas for reporting queries
5. Monitor query performance with EXPLAIN ANALYZE
