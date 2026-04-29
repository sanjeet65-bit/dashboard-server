CREATE TABLE greythr.logins (
  UserId VARCHAR(8) NOT NULL,
  EmpNo VARCHAR(10) NOT NULL,
  UserName VARCHAR(30) NOT NULL,
  SlDivCd VARCHAR(5),
  MgCd varchar(7),
  Password VARCHAR(200),
  PassUpdateOn DATETIME,
  IsLocked TINYINT(1) DEFAULT 0,
  IsActive TINYINT(1) DEFAULT 1,
  LastModified DATETIME,
  CrDt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (UserId),
  UNIQUE (UserId)
);


CREATE TABLE rolemst (
    role_id VARCHAR(20) primary key,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissionmst (
    permission_id varchar(20) primary key,
    description VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE role_permissions (
    role_id VARCHAR(20) NOT NULL,
    permission_id VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);





CREATE TABLE rxrcrd (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EmpNo VARCHAR(10),
    MgCd VARCHAR(7),
    MclCode INT,
    DrName VARCHAR(30),
    ItemCd Varchar(10),
    ItemName VARCHAR(100),
    Specialty VARCHAR(10),
    SubDt DATETIME,
    Status INT CHECK (Status IN (0, 1, 2)) default 0,
    FilePath VARCHAR(255),
    CrDt DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE pobrcrd (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EmpNo VARCHAR(10),
    MgCd VARCHAR(7),
    MclCode INT,
    DrName VARCHAR(30),
    ItemCd Varchar(10),
    ItemName VARCHAR(100),
    Specialty VARCHAR(10),
    ChemistName varchar(100),
    ChemistAddress varchar(255),
    DLNo Varchar(30),
    StateCd varchar(5),
    Email varchar(40),
    PhoneNo varchar(15),    
    SubDt DATETIME,
    Status INT CHECK (Status IN (0, 1, 2)) default 0,
    FilePath VARCHAR(255),
    CrDt DATETIME DEFAULT CURRENT_TIMESTAMP
);





CREATE TABLE api_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    method VARCHAR(10) NOT NULL,          -- GET, POST, PUT, DELETE
    route VARCHAR(255) NOT NULL,           -- /api/sales, /api/incentive
    permission_key VARCHAR(100) NOT NULL,  -- sales.view, incentive.edit

    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_api (method, route)
);


CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    label VARCHAR(100) NOT NULL,            -- Dashboard, Incentive
    path VARCHAR(255) NOT NULL,             -- /dashboard, /incentive
    icon VARCHAR(50) DEFAULT NULL,          -- optional (mui icon name)
    permission_key VARCHAR(100) NOT NULL,   -- dashboard.view
    parent_id INT DEFAULT NULL,             -- for nested menus
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_id) REFERENCES menu_items(id)
);