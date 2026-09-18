# Security Specification for Firestore Rules

## 1. Data Invariants
1. A User profile document at `/users/{userId}` can only be created/read/updated by the authenticated user with matching `request.auth.uid == userId`.
2. Users cannot escalate privileges; `isAdmin` field cannot be self-assigned or modified by regular users.
3. Subcollection documents under `/users/{userId}/favorites/{favoriteId}` and `/users/{userId}/builds/{buildId}` strictly inherit ownership from the parent document path variable `{userId}` matching `request.auth.uid`.
4. All incoming payload keys are strictly validated with `hasAll` for required properties and `hasOnly` to prevent arbitrary ghost fields / injection.
5. All document IDs are validated using `isValidId(id)` to prevent path poisoning attacks.
6. All string lengths and boundaries are strictly checked according to `firebase-blueprint.json`.

## 2. The Dirty Dozen Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated User Write**: Anonymous write to `/users/user123` with valid schema.
2. **Identity Spoofing**: Authenticated user `userA` attempting to write to `/users/userB`.
3. **Privilege Escalation**: Authenticated user `userA` writing `isAdmin: true` in `/users/userA`.
4. **Ghost Field Injection**: Authenticated user writing unknown field `__backdoor: true` to `/users/userA`.
5. **ID Poisoning Attack**: Document creation under a malicious 2KB path name.
6. **Subcollection Hijacking**: Authenticated user `userA` creating a favorite summoner under `/users/userB/favorites/fav1`.
7. **Foreign Owner ID Injection**: Payload containing `userId: "userB"` written to `/users/userA/favorites/fav1`.
8. **Invalid String Length Overrun**: `gameName` containing a 5,000 character string in `FavoriteSummoner`.
9. **Blanket Query Scraping**: Attempting unconstrained `list` across all users' private favorites without `userId` filter.
10. **Immutable Timestamp Tampering**: Modifying `createdAt` during an update.
11. **Type Mismatch Injection**: Sending number `1234` for string field `championName` in `SavedBuild`.
12. **Cross-Tenant Deletion**: User `userA` sending delete operation to `/users/userB/builds/build1`.
