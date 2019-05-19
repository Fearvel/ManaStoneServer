--Copyright (c) 2018, Andreas Schreiner
--For Manastone 1.0.0.0
--This program is made for a Case sensitive MySql Server
--this requires the creation of an user for the openMPS server on this server,
--which needs select permission on this view
--`[USER]`@`%` has to be replaced with a valid user
--run this after the db creation and the stored procedure script

use Manastone;
CREATE ALGORITHM=UNDEFINED DEFINER=`[USER]`@`%` SQL SECURITY DEFINER VIEW `OpenMPSTokens`
  AS select `tok`.`Token` AS `Token` from
  (((`Token` `tok` join `Activation` `act` on((`tok`.`Id` = `act`.`TokenId`)))
    join `SerialNumber` `ser` on((`act`.`Id` = `ser`.`ActivationId`)))
    join `Product` `prod` on((`prod`.`Id` = `ser`.`ProductId`)))
  where (`prod`.`ProductUUID` = '5d1ae2a2-6ef3-4abd-86b8-905686dc6567');


select 'DONE' AS '';
