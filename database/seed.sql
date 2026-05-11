-- Seed data for TaskFlow

-- Insert 5 mock users
INSERT INTO users (email, password, name, role, avatar_url) VALUES
('user1@taskflow.com', 'password123', 'Alice Johnson', 'admin', 'https://i.pravatar.cc/150?img=1'),
('user2@taskflow.com', 'password123', 'Bob Smith', 'member', 'https://i.pravatar.cc/150?img=2'),
('user3@taskflow.com', 'password123', 'Carol Williams', 'member', 'https://i.pravatar.cc/150?img=3'),
('user4@taskflow.com', 'password123', 'David Brown', 'member', 'https://i.pravatar.cc/150?img=4'),
('user5@taskflow.com', 'password123', 'Emma Davis', 'member', 'https://i.pravatar.cc/150?img=5');

-- Insert sample tasks for "To Do" column
INSERT INTO tasks (title, description, project_name, tag, priority, status, progress, due_date, created_by) VALUES
('Implement Dark Mode', 'Add dark mode toggle and styling to the web app', 'Web App Redesign', 'Feature', 'Medium', 'To Do', 0, '2026-10-28', 1),
('Implement annoliance', 'Add analytics tracking throughout the application', 'Web App Redesign', 'Feature', 'Low', 'To Do', 0, '2026-10-28', 1);

-- Insert sample tasks for "In Progress" column
INSERT INTO tasks (title, description, project_name, tag, priority, status, progress, due_date, created_by) VALUES
('Implement Dark Mode Toggle', 'Complete the dark mode implementation with user preferences', 'Web App Redesign', 'Feature', 'Medium', 'In Progress', 45, '2026-10-28', 1),
('Implement Dark Mode litora', 'Additional styling and polish for dark mode', 'Web App Redesign', 'Feature', 'Medium', 'In Progress', 45, '2026-10-28', 1);

-- Insert sample tasks for "Done" column
INSERT INTO tasks (title, description, project_name, tag, priority, status, progress, due_date, created_by) VALUES
('Promist t:lear determination', 'Complete implementation of task clarity feature', 'Web App Redesign', 'Feature', 'High', 'Done', 100, '2026-10-28', 1),
('Implement Dark Mode Toggle', 'Final dark mode implementation completed', 'Web App Redesign', 'Feature', 'High', 'Done', 100, '2026-10-28', 1);

-- Assign users to tasks
INSERT INTO task_assignments (task_id, user_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 3),
(3, 1), (3, 3), (3, 4),
(4, 1), (4, 2), (4, 5),
(5, 1), (5, 2),
(6, 1), (6, 3), (6, 4);
