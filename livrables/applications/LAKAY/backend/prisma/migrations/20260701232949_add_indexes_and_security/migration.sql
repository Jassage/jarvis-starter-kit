-- CreateIndex
CREATE INDEX "favorites_listingId_idx" ON "favorites"("listingId");

-- CreateIndex
CREATE INDEX "listings_status_department_listingType_propertyType_idx" ON "listings"("status", "department", "listingType", "propertyType");

-- CreateIndex
CREATE INDEX "listings_status_expiresAt_idx" ON "listings"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "listings_status_price_idx" ON "listings"("status", "price");

-- CreateIndex
CREATE INDEX "listings_status_createdAt_idx" ON "listings"("status", "createdAt");

-- CreateIndex
CREATE INDEX "listings_status_isSponsored_isFeatured_idx" ON "listings"("status", "isSponsored", "isFeatured");

-- CreateIndex
CREATE INDEX "listings_ownerId_idx" ON "listings"("ownerId");

-- CreateIndex
CREATE INDEX "listings_agencyId_idx" ON "listings"("agencyId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "visit_requests_listingId_idx" ON "visit_requests"("listingId");

-- CreateIndex
CREATE INDEX "visit_requests_requesterId_idx" ON "visit_requests"("requesterId");
