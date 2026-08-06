CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticketType` varchar(64) NOT NULL,
	`quantity` int NOT NULL,
	`amountTotal` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`status` enum('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
ALTER TABLE `resales` ADD `type` enum('public','private') DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `resales` ADD `resaleToken` varchar(64);--> statement-breakpoint
ALTER TABLE `resales` ADD `tokenExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `resales` ADD `blockedUntil` timestamp;--> statement-breakpoint
ALTER TABLE `resales` ADD `payoutStatus` enum('pending','paid') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `resales` ADD `payoutPaidAt` timestamp;--> statement-breakpoint
ALTER TABLE `tickets` ADD `originStripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `resales` ADD CONSTRAINT `resales_resaleToken_unique` UNIQUE(`resaleToken`);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;