--Copyright (c) 2018, Andreas Schreiner
--For Manastone 1.0.0.0
--This program is made for a Case sensitive MySql Server

CREATE Manastone;
use Manastone;

--Creates the Directory Table, used for saving of key value pairs
CREATE TABLE `ServerLog` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SocketId` varchar(100) DEFAULT NULL,
  `Message` text NOT NULL,
  `DateOfIncident` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--Creates the internal logging Table ServerLog
CREATE TABLE `ServerLog` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SocketId` varchar(100) DEFAULT NULL,
  `Message` text NOT NULL,
  `DateOfIncident` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--Creates the Product table, used to differ a SerialNumber of one product to another
CREATE TABLE `Product` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ProductName` varchar(400) NOT NULL,
  `ProductVendor` varchar(400) NOT NULL,
  `ProductUUID` varchar(36) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--Creates the Customer table
CREATE TABLE `Customer` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `CustomerName` varchar(400) NOT NULL,
  `CustomerReference` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--Creates the Token table
CREATE TABLE `Token` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Token` varchar(36) DEFAULT NULL,
  `DateOfCreation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `DateOfExpiry` varchar(45) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Token_UNIQUE` (`Token`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--Creates the Activation table
CREATE TABLE `Activation` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ActivationKey` varchar(36) DEFAULT NULL,
  `ActivationDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `HardwareId` varchar(500) DEFAULT NULL,
  `TokenId` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `ActivationKey_UNIQUE` (`ActivationKey`),
  KEY `tokenforeignkey_idx` (`TokenId`),
  CONSTRAINT `tokenforeignkey` FOREIGN KEY (`TokenId`) REFERENCES `Token` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--Creates the SerialNumber table
CREATE TABLE `SerialNumber` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `SerialNumber` varchar(36) NOT NULL,
  `ProductId` bigint(20) DEFAULT NULL,
  `CustomerId` bigint(20) DEFAULT NULL,
  `ActivationId` bigint(20) DEFAULT NULL,
  `DeactivationCount` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `SerialNumber_UNIQUE` (`SerialNumber`),
  KEY `ProductId` (`ProductId`),
  KEY `SerialNumberCustomerId_idx` (`CustomerId`),
  KEY `SerialNumberActivationKey_idx` (`ActivationId`),
  CONSTRAINT `SerialNumberActivationKey` FOREIGN KEY (`ActivationId`) REFERENCES `Activation` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `SerialNumberCustomerId` FOREIGN KEY (`CustomerId`) REFERENCES `Customer` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `SerialNumber_ibfk_1` FOREIGN KEY (`ProductId`) REFERENCES `Product` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

select 'DB created' AS '';
