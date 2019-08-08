drop database if exists friends_db;

create database friends_db;

use friends_db;

create table user_profile
(
  id tinyint not null auto_increment,
  token varchar
  (16),
  photo varchar
  (128),
  name varchar
  (80),
  email varchar
  (80),
  status boolean,
  brand varchar
  (255),
  primary key(id)
);

  create table surveys
  (
    name varchar(32),
    num_questions int,
    created_by varchar(80)
  );

