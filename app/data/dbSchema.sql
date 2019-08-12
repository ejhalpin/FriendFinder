drop database if exists friends_db;

create database friends_db;

use friends_db;

create table user_profile
(
  id int not null auto_increment,
  token varchar(32),
  photo varchar(128),
  name varchar(50),
  email varchar(80),
  brand varchar(255),
  status boolean,
  primary key(id)
);

create table surveys(
    name varchar(32),
    author varchar(50),
    nq int,
    id int not null auto_increment,
    q0 varchar(180),
    q1 varchar(180),
    q2 varchar(180),
    q3 varchar(180),
    q4 varchar(180),
    q5 varchar(180),
    q6 varchar(180),
    q7 varchar(180),
    q8 varchar(180),
    q9 varchar(180),
    q10 varchar(180),
    q11 varchar(180),
    q12 varchar(180),
    q13 varchar(180),
    q14 varchar(180),
    primary key(id)
  );

-- seed the survey table with the stock survey
   insert into surveys (name,author,nq,q0,q1,q2,q3,q4,q5,q6,q7,q8,q9)
  values
    (
		"profile survey",
        "friend finder",
        10,
      "You often think about what you should have said in a conversation long after it has taken place.",
      "You enjoy vibrant social events with lots of people.",
      "If your friend is sad about something, your first instinct is to support them emotionally, not try to solve their problem.",
      "You often think about what you should have said in a conversation long after it has taken place.",
      "You often rely on other people to be the ones to start a conversation and keep it going.",
      "You rarely worry if you made a good impression on someone you met.",
      "You are very affectionate with people you care about.",
      "When in a group of people you do not know, you have no problem jumping right into their conversation.",
      "When at a social event, you rarely try to introduce yourself to new people and mostly talk to the ones you already know.",
      "You usually lose interest in a discussion when it gets philosophical."

);

create table scores(
	survey_id int,
    user_id int,
    answers varchar(36)
);


create table matches(
	survey_id int,
    user_id int,
    match_id int,
    score int
);
  
  

 
