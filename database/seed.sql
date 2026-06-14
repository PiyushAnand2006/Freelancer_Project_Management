USE freelanceflow;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE invoices;
TRUNCATE TABLE milestones;
TRUNCATE TABLE contracts;
TRUNCATE TABLE proposals;
TRUNCATE TABLE projects;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (user_id, name, email, password, role, is_verified) VALUES
  (1, 'Arjun Sharma', 'arjun@email.com', '$2a$12$SFQwTQrhr4amJpOElbknCekqlszW8S9h4jJ.95nhx1FfY8jc0sJz2', 'client', TRUE),
  (2, 'Priya Mehta', 'priya@email.com', '$2a$12$SFQwTQrhr4amJpOElbknCekqlszW8S9h4jJ.95nhx1FfY8jc0sJz2', 'freelancer', TRUE),
  (3, 'Riya Kapoor', 'riya@email.com', '$2a$12$SFQwTQrhr4amJpOElbknCekqlszW8S9h4jJ.95nhx1FfY8jc0sJz2', 'freelancer', TRUE),
  (4, 'FreeLanceFlow Admin', 'admin@freelanceflow.local', '$2a$12$SFQwTQrhr4amJpOElbknCekqlszW8S9h4jJ.95nhx1FfY8jc0sJz2', 'admin', TRUE);

INSERT INTO projects (project_id, client_id, title, description, budget_min, budget_max, deadline, project_type, status) VALUES
  (1, 1, 'Design a premium SaaS landing page', 'Create a polished landing page and dashboard concept for a new analytics product.', 18000, 35000, DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'fixed', 'in_progress'),
  (2, 1, 'Build invoice automation API', 'Develop REST endpoints for invoice generation, payment tracking, and reporting.', 25000, 55000, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'fixed', 'open'),
  (3, 1, 'React dashboard optimization', 'Improve loading states, data charts, and mobile responsiveness for an existing dashboard.', 900, 1600, DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'hourly', 'open');

INSERT INTO proposals (proposal_id, project_id, freelancer_id, bid_amount, estimated_days, cover_letter, status) VALUES
  (1, 1, 2, 29500, 14, 'I can deliver a refined SaaS interface with responsive components and production-ready styling.', 'accepted'),
  (2, 1, 3, 32000, 16, 'I specialize in polished product dashboards and conversion-focused landing pages.', 'rejected'),
  (3, 2, 2, 46000, 20, 'I will build the invoice API with clean Express routes, MySQL procedures, and API documentation.', 'pending');

INSERT INTO contracts (contract_id, proposal_id, client_id, freelancer_id, agreed_amount, start_date, status) VALUES
  (1, 1, 1, 2, 29500, CURDATE(), 'active');

INSERT INTO milestones (milestone_id, contract_id, title, amount, due_date, status) VALUES
  (1, 1, 'Information architecture and wireframes', 7500, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'approved'),
  (2, 1, 'Responsive UI implementation', 14000, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'submitted'),
  (3, 1, 'Final polish and handoff', 8000, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'pending');

INSERT INTO invoices (invoice_id, contract_id, freelancer_id, client_id, total_amount, status, due_date) VALUES
  (1, 1, 2, 1, 7500, 'unpaid', DATE_ADD(CURDATE(), INTERVAL 7 DAY));
