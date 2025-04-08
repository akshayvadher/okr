BEGIN;
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done', 'cancelled')),
    objective_id VARCHAR(255) NOT NULL,
    key_result_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE,
    FOREIGN KEY (key_result_id) REFERENCES key_results(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_objective_id ON tasks(objective_id);
CREATE INDEX idx_tasks_key_result_id ON tasks(key_result_id);

COMMIT;
