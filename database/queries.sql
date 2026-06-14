USE freelanceflow;

-- Q1: View all open projects in the marketplace.
SELECT project_id, title, budget_min, budget_max, deadline, project_type
FROM projects
WHERE status = 'open'
ORDER BY deadline ASC;

-- Q2: Get all proposals for a specific project with freelancer profiles.
SELECT p.proposal_id, u.name AS freelancer, p.bid_amount, p.estimated_days, p.status
FROM proposals p
JOIN users u ON p.freelancer_id = u.user_id
WHERE p.project_id = 1
ORDER BY p.bid_amount ASC;

-- Q3: Track milestone progress for an active contract.
SELECT milestone_id, title, amount, due_date, status
FROM milestones
WHERE contract_id = 1
ORDER BY due_date ASC;

-- Q4: Calculate accumulated earnings per freelancer.
SELECT u.name, SUM(py.amount_paid) AS total_earned
FROM payments py
JOIN users u ON py.payee_id = u.user_id
WHERE py.payment_status = 'success'
GROUP BY u.name;

-- Q5: Audit contract summary with both legal parties.
SELECT c.contract_id, cl.name AS client, fl.name AS freelancer, c.agreed_amount, c.start_date, c.status
FROM contracts c
JOIN users cl ON c.client_id = cl.user_id
JOIN users fl ON c.freelancer_id = fl.user_id;

-- Q6: Filter unpaid overdue invoices.
SELECT invoice_id, contract_id, total_amount, due_date
FROM invoices
WHERE status = 'unpaid'
  AND due_date < CURDATE();
