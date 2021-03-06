--Copyright (c) 2018, Andreas Schreiner
--For Manastone 1.0.0.0
--This program is made for a Case sensitive MySql Server
--`[USER]`@`%` has to be replaced with a valid user
--second script

use Manastone;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `Activate`(in serialNumber varchar(36), hwId varchar(500))
BEGIN
set @ActivationKey = (SELECT UUID());
insert into Activation (ActivationKey, HardwareId) values (@ActivationKey, hwId);
SET @ActivationId = LAST_INSERT_ID();
update SerialNumber ser set  ser.ActivationId = @ActivationId where ser.SerialNumber = serialNumber;
delete from Activation where Id not in (Select ActivationId from SerialNumber where ActivationId is not null);
Select ActivationKey from Activation where Id = @ActivationId;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `AddCustomer`(in custName varchar(400), custRef varchar(100))
BEGIN
Insert into Customer (CustomerName, CustomerReference) values (custName, custRef);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `AddProduct`(
in productName varchar(400),
productVendor varchar(400),
productUUID varchar(36))
BEGIN
Insert into Product (ProductName, ProductVendor,ProductUUID) values ( productName,productVendor,productUUID);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `AssignCustomerToSerialNumber`(in CustomerIdent bigint, SerialNum varchar(36))
BEGIN
update SerialNumber  ser set ser.CustomerId = CustomerIdent where ser.SerialNumber = SerialNum;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `CheckActivatable`(serialNr varchar(36))
BEGIN
select if ((select exists (select * from SerialNumber where SerialNumber =serialNr )) = 1,
(select not exists (select ActivationId from SerialNumber where SerialNumber =serialNr and ActivationId is not null) as Activatable),
0) as Activatable;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `CheckActivation`(in ActKey varchar(36), HwId varchar(500))
BEGIN
	SELECT exists(Select * from Activation where ActivationKey= ActKey and HardwareId = HwId) as ActivationStatus;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `CheckIfSerialNumberMatchesTheProductUUID`(in prodUUID varchar(36), serNr varchar(36))
BEGIN
select exists( select *  from SerialNumber ser
	join Product prod on ser.ProductId = prod.Id
    where prod.ProductUUID = prodUUID and ser.SerialNumber = serNr) as ProductMatch;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `CheckToken`(in tok varchar(36))
BEGIN
Select EXISTS( SELECT * FROM `DEV-MANASTONE`.Token where Token = tok and now() <= DATE_SUB(DateOfExpiry, INTERVAL +1 Hour)) as TokenCheck;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `CheckTokenServerSide`()
BEGIN
Select EXISTS( SELECT * FROM `DEV-MANASTONE`.Token where Token = tok and now() <=DateOfExpiry) as TokenCheck;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `CleanToken`()
BEGIN
Delete from Token where Id not in (Select TokenId from Activation where TokenId is not null);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `Deactivate`(in serialNr varchar(36))
BEGIN
set @TokenId =  (Select TokenId from Activation where Id = (Select ActivationId from SerialNumber where SerialNumber = serialNr));
set @ActivationId = (Select ActivationId from SerialNumber where SerialNumber = serialNr);
Update SerialNumber set DeactivationCount  = (DeactivationCount + 1), ActivationId =null where SerialNumber = serialNr;
Delete from Activation where Id = @ActivationId;
Delete from Token where Id = @TokenId;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `GenerateSerialNumber`(
in productId BIGINT)
BEGIN
insert into SerialNumber (SerialNumber, ProductId) values ((SELECT UUID()), productId);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `GenerateSerialNumberForExistingCustomer`(in productId bigint,  customerId bigint)
BEGIN
insert into SerialNumber (SerialNumber, ProductId, CustomerId) values ((SELECT UUID()), productId, customerId);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `GenerateSerialNumberWithNewCustomer`(in custName varchar(400), custRef varchar(100), productId bigint)
BEGIN
Insert into Customer (CustomerName, CustomerReference) values (custName, custRef);
SET @CustomerId = LAST_INSERT_ID();
insert into SerialNumber (SerialNumber, ProductId, CustomerId) values ((SELECT UUID()), productId, @CustomerId);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `GenerateToken`(in ActivationId bigint)
BEGIN
if (exists(Select * from Activation where Id = ActivationId))
	then
	set @ExpDate = ( DATE_ADD(CURRENT_TIMESTAMP, INTERVAL +7 DAY));
	set @Token = (SELECT UUID());

	insert into Token (Token, DateOfExpiry) values (@Token, @ExpDate);
	SET @TokenId = LAST_INSERT_ID();
	update Activation set TokenId = @TokenId where Id = ActivationId;

	delete from Token where Id not in (Select TokenId from Activation);
	Select tok.Token from Token tok  where Id = @TokenId;
else
	select ""  as Token;
end if;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `GenerateTokenByActivationKey`(in actKey varchar(36))
BEGIN
if (exists(Select * from Activation where ActivationKey = actKey))
	then
	set @ExpDate = ( DATE_ADD(CURRENT_TIMESTAMP, INTERVAL +7 DAY));
	set @Token = (SELECT UUID());

	insert into Token (Token, DateOfExpiry) values (@Token, @ExpDate);
	SET @TokenId = LAST_INSERT_ID();

	update Activation set TokenId = @TokenId where ActivationKey = actKey;
	delete from Token where Id not in (Select TokenId from Activation);

	Select tok.Token from Token tok  where Id = @TokenId;
else
	select "" as Token;
end if;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `RetrieveAllTokensForAProductUUID`(in prodUUID varchar(36) )
BEGIN
	select tok.Token from Token tok
		join Activation act on tok.Id = act.TokenId
		join SerialNumber ser on act.Id = ser.ActivationId
		join Product prod on prod.Id = ser.ProductId
		where prod.ProductUUID = prodUUID;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `RetrieveCustomerReference`(in serialNum varchar(36))
BEGIN
SELECT IF((SELECT EXISTS(Select cust.CustomerReference from SerialNumber ser join Customer cust on ser.CustomerId = cust.Id where SerialNumber =serialNum)) = 1,
(Select cust.CustomerReference from SerialNumber ser join Customer cust on ser.CustomerId = cust.Id where SerialNumber =serialNum), "NAN") as CustomerReference;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `RetrieveCustomerReferenceViaActivationKey`(in actKey varchar(36))
BEGIN
set @ref =
(Select cust.CustomerReference from Activation act
	join SerialNumber ser on act.Id = ser.ActivationId
    join Customer cust on ser.CustomerId = cust.Id
where act.ActivationKey = actKey);

select if(@ref is not null, @ref, '') as CustomerReference;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `RetrieveManastoneVersion`()
BEGIN
Select DValue as Version from Directory where DKey ='Version';
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`[USER]`@`%` PROCEDURE `RetrieveServerTime`()
BEGIN
select now() as Time;
END$$
DELIMITER ;
