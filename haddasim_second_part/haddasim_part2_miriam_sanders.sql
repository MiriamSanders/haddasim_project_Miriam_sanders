-- Create the Person table 
CREATE TABLE Person (
    Person_Id INT PRIMARY KEY,
    Personal_Name VARCHAR(100) NOT NULL,
    Family_Name VARCHAR(100) NOT NULL,
    Gender ENUM('Male', 'Female', 'Other') NOT NULL,
    Father_Id INT NULL,
    Mother_Id INT NULL,
    Spouse_Id INT NULL,
    FOREIGN KEY (Father_Id) REFERENCES Person(Person_Id),
    FOREIGN KEY (Mother_Id) REFERENCES Person(Person_Id),
    FOREIGN KEY (Spouse_Id) REFERENCES Person(Person_Id)
);

INSERT INTO Person (Person_Id, Personal_Name, Family_Name, Gender) VALUES
(1, 'Yaakov', 'Cohen', 'Male'),
(2, 'Rivka', 'Cohen', 'Female'),
(3, 'Moshe', 'Levi', 'Male'),
(4, 'Miriam', 'Levi', 'Female');

-- set spouses here to avoid setting before declaration
UPDATE Person SET Spouse_Id = 2 WHERE Person_Id = 1;
UPDATE Person SET Spouse_Id = 1 WHERE Person_Id = 2;
UPDATE Person SET Spouse_Id = 4 WHERE Person_Id = 3;
UPDATE Person SET Spouse_Id = 3 WHERE Person_Id = 4;

-- insert childern here to avoid accessing a person before declaring
INSERT INTO Person (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id) VALUES
(5, 'David', 'Cohen', 'Male', 1, 2),
(6, 'Esther', 'Cohen', 'Female', 1, 2),
(7, 'Shmuel', 'Levi', 'Male', 3, 4),
(8, 'Chana', 'Levi', 'Female', 3, 4);

-- Create the Family_Relationships 
CREATE TABLE Family_Relationships (
    Person_Id INT,
    Relative_Id INT,
    Connection_Type VARCHAR(10),
    PRIMARY KEY (Person_Id, Relative_Id),
    FOREIGN KEY (Person_Id) REFERENCES Person(Person_Id),
    FOREIGN KEY (Relative_Id) REFERENCES Person(Person_Id)
);
-- insreting all relationships into the relationship table.
-- Insert father relationships
INSERT INTO Family_Relationships
SELECT p.Person_Id, p.Father_Id, 'father'
FROM Person p
WHERE p.Father_Id IS NOT NULL;

-- Insert mother relationships
INSERT INTO Family_Relationships
SELECT p.Person_Id, p.Mother_Id, 'mother'
FROM Person p
WHERE p.Mother_Id IS NOT NULL;

-- Insert children relationships
INSERT INTO Family_Relationships
SELECT p.Person_Id, c.Person_Id, CASE WHEN c.Gender = 'Male' THEN 'son' ELSE 'daughter' END
FROM Person p
JOIN Person c ON p.Person_Id = c.Father_Id OR p.Person_Id = c.Mother_Id;

-- Insert sibling relationships
INSERT INTO Family_Relationships
SELECT p1.Person_Id, p2.Person_Id, CASE WHEN p2.Gender = 'Male' THEN 'brother' ELSE 'sister' END
FROM Person p1
JOIN Person p2 ON 
    ((p1.Father_Id = p2.Father_Id AND p1.Father_Id IS NOT NULL) OR 
     (p1.Mother_Id = p2.Mother_Id AND p1.Mother_Id IS NOT NULL))
    AND p1.Person_Id != p2.Person_Id;

-- Insert spouse relationships
INSERT INTO Family_Relationships
SELECT p.Person_Id, p.Spouse_Id, CASE 
    WHEN s.Gender = 'Male' THEN 'husband' 
    ELSE 'wife' 
END
FROM Person p
JOIN Person s ON p.Spouse_Id = s.Person_Id
WHERE p.Spouse_Id IS NOT NULL;
--  add spouse in one
UPDATE Person SET Spouse_Id = 7 WHERE Person_Id = 6;
UPDATE Person SET Spouse_Id = 5 WHERE Person_Id = 8;
-- add all spouses that have a mention only in one spouse and  not the other
-- insert the pair from the "point of view" of the not null side
INSERT INTO Family_Relationships (Person_Id, Relative_Id, Connection_Type)
SELECT p2.Person_Id, p1.Person_Id, 
    CASE WHEN p1.Gender = 'Male' THEN 'husband' ELSE 'wife' END
FROM Person p1
JOIN Person p2 ON p1.Spouse_Id = p2.Person_Id
WHERE p1.Spouse_Id IS NOT NULL
   AND p2.Spouse_Id IS NULL;
   
-- insert the pair from the "point of view" of the null side
INSERT INTO Family_Relationships (Person_Id, Relative_Id, Connection_Type)
SELECT p2.Person_Id, p1.Person_Id,  
    CASE WHEN p1.Gender = 'Male' THEN 'husband' ELSE 'wife' END
FROM Person p1
JOIN Person p2 ON p1.Person_Id = p2.Spouse_Id
WHERE p1.Spouse_Id IS NULL
    AND p2.Spouse_Id IS NOT NULL;

-- Update the Person table to make spouse relationships consistent
UPDATE Person p2
JOIN Person p1 ON p1.Spouse_Id = p2.Person_Id
SET p2.Spouse_Id = p1.Person_Id
WHERE p1.Spouse_Id IS NOT NULL
    AND p2.Spouse_Id IS NULL;