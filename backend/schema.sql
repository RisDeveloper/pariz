-- Jalankan: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS farish_portfolio
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE farish_portfolio;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
