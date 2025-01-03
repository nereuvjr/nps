CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY UNIQUE,
    name TEXT NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id)
);