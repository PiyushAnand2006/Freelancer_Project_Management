CREATE DATABASE IF NOT EXISTS freelanceflow;
USE freelanceflow;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS proposals;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_role CHECK (role IN ('client', 'freelancer', 'admin'))
);

CREATE TABLE projects (
  project_id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  budget_min DECIMAL(12, 2) NOT NULL,
  budget_max DECIMAL(12, 2) NOT NULL,
  deadline DATE NOT NULL,
  project_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_projects_budget CHECK (budget_min >= 0 AND budget_max >= budget_min),
  CONSTRAINT chk_projects_type CHECK (project_type IN ('fixed', 'hourly')),
  CONSTRAINT chk_projects_status CHECK (status IN ('open', 'in_progress', 'completed')),
  CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES users(user_id)
);

CREATE TABLE proposals (
  proposal_id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  bid_amount DECIMAL(12, 2) NOT NULL,
  estimated_days INT NOT NULL,
  cover_letter TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_proposals_amount CHECK (bid_amount > 0),
  CONSTRAINT chk_proposals_days CHECK (estimated_days > 0),
  CONSTRAINT chk_proposals_status CHECK (status IN ('pending', 'accepted', 'rejected')),
  CONSTRAINT fk_proposals_project FOREIGN KEY (project_id) REFERENCES projects(project_id),
  CONSTRAINT fk_proposals_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(user_id),
  CONSTRAINT uq_one_bid UNIQUE (project_id, freelancer_id)
);

CREATE TABLE contracts (
  contract_id INT PRIMARY KEY AUTO_INCREMENT,
  proposal_id INT NOT NULL UNIQUE,
  client_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  agreed_amount DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CONSTRAINT chk_contracts_status CHECK (status IN ('active', 'completed', 'disputed', 'terminated')),
  CONSTRAINT fk_contracts_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id),
  CONSTRAINT fk_contracts_client FOREIGN KEY (client_id) REFERENCES users(user_id),
  CONSTRAINT fk_contracts_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(user_id)
);

CREATE TABLE milestones (
  milestone_id INT PRIMARY KEY AUTO_INCREMENT,
  contract_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  CONSTRAINT chk_milestones_amount CHECK (amount > 0),
  CONSTRAINT chk_milestones_status CHECK (status IN ('pending', 'submitted', 'approved')),
  CONSTRAINT fk_milestones_contract FOREIGN KEY (contract_id) REFERENCES contracts(contract_id)
);

CREATE TABLE invoices (
  invoice_id INT PRIMARY KEY AUTO_INCREMENT,
  contract_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  client_id INT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_invoices_amount CHECK (total_amount >= 0),
  CONSTRAINT chk_invoices_status CHECK (status IN ('unpaid', 'paid', 'overdue')),
  CONSTRAINT fk_invoices_contract FOREIGN KEY (contract_id) REFERENCES contracts(contract_id),
  CONSTRAINT fk_invoices_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(user_id),
  CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES users(user_id)
);

CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL UNIQUE,
  payer_id INT NOT NULL,
  payee_id INT NOT NULL,
  amount_paid DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(100) UNIQUE,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_payments_amount CHECK (amount_paid > 0),
  CONSTRAINT chk_payments_method CHECK (payment_method IN ('UPI', 'Card', 'Bank', 'Wallet')),
  CONSTRAINT chk_payments_status CHECK (payment_status IN ('success', 'pending', 'failed')),
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
  CONSTRAINT fk_payments_payer FOREIGN KEY (payer_id) REFERENCES users(user_id),
  CONSTRAINT fk_payments_payee FOREIGN KEY (payee_id) REFERENCES users(user_id)
);

DELIMITER $$

CREATE PROCEDURE sp_accept_proposal(IN p_proposal_id INT)
BEGIN
  DECLARE v_project_id INT;
  DECLARE v_freelancer_id INT;
  DECLARE v_client_id INT;
  DECLARE v_bid_amount DECIMAL(12, 2);
  DECLARE v_project_status VARCHAR(20);

  START TRANSACTION;

  SELECT p.project_id, p.freelancer_id, p.bid_amount, pr.client_id, pr.status
  INTO v_project_id, v_freelancer_id, v_bid_amount, v_client_id, v_project_status
  FROM proposals p
  JOIN projects pr ON pr.project_id = p.project_id
  WHERE p.proposal_id = p_proposal_id
  FOR UPDATE;

  IF v_project_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Proposal not found';
  END IF;

  IF v_project_status <> 'open' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Project is not open for acceptance';
  END IF;

  UPDATE proposals
  SET status = 'accepted'
  WHERE proposal_id = p_proposal_id;

  UPDATE proposals
  SET status = 'rejected'
  WHERE project_id = v_project_id
    AND proposal_id <> p_proposal_id;

  UPDATE projects
  SET status = 'in_progress'
  WHERE project_id = v_project_id;

  INSERT INTO contracts (proposal_id, client_id, freelancer_id, agreed_amount, start_date, status)
  VALUES (p_proposal_id, v_client_id, v_freelancer_id, v_bid_amount, CURDATE(), 'active');

  COMMIT;
END$$

CREATE PROCEDURE sp_generate_invoice(IN p_contract_id INT)
BEGIN
  DECLARE v_total DECIMAL(12, 2);
  DECLARE v_freelancer INT;
  DECLARE v_client INT;

  SELECT COALESCE(SUM(amount), 0)
  INTO v_total
  FROM milestones
  WHERE contract_id = p_contract_id
    AND status = 'approved';

  IF v_total <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No approved milestones available for invoicing';
  END IF;

  SELECT freelancer_id, client_id
  INTO v_freelancer, v_client
  FROM contracts
  WHERE contract_id = p_contract_id;

  IF v_freelancer IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contract not found';
  END IF;

  INSERT INTO invoices (contract_id, freelancer_id, client_id, total_amount, status, due_date)
  VALUES (p_contract_id, v_freelancer, v_client, v_total, 'unpaid', DATE_ADD(CURDATE(), INTERVAL 7 DAY));
END$$

CREATE TRIGGER trg_contract_completion
AFTER UPDATE ON milestones
FOR EACH ROW
BEGIN
  DECLARE pending_count INT;

  IF NEW.status = 'approved' THEN
    SELECT COUNT(*)
    INTO pending_count
    FROM milestones
    WHERE contract_id = NEW.contract_id
      AND status <> 'approved';

    IF pending_count = 0 THEN
      UPDATE contracts
      SET status = 'completed'
      WHERE contract_id = NEW.contract_id;

      UPDATE projects pr
      JOIN proposals pp ON pp.project_id = pr.project_id
      JOIN contracts c ON c.proposal_id = pp.proposal_id
      SET pr.status = 'completed'
      WHERE c.contract_id = NEW.contract_id;
    END IF;
  END IF;
END$$

DELIMITER ;
