-- CreateIndex
CREATE INDEX `messages_conversationId_createdAt_idx` ON `messages`(`conversationId`, `createdAt`);

-- CreateIndex
CREATE INDEX `messages_receiverId_status_idx` ON `messages`(`receiverId`, `status`);

-- CreateIndex
CREATE INDEX `notifications_userId_isRead_createdAt_idx` ON `notifications`(`userId`, `isRead`, `createdAt`);

-- CreateIndex
CREATE INDEX `profiles_birthDate_idx` ON `profiles`(`birthDate`);

-- CreateIndex
CREATE INDEX `profiles_gender_idx` ON `profiles`(`gender`);

-- CreateIndex
CREATE INDEX `swipes_receiverId_action_idx` ON `swipes`(`receiverId`, `action`);

-- CreateIndex
CREATE INDEX `swipes_senderId_action_createdAt_idx` ON `swipes`(`senderId`, `action`, `createdAt`);
