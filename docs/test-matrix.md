# Ma trận ca kiểm thử – RealEstateHub

> Sinh tự động bằng `node tests/generate-test-matrix.mjs` từ danh sách test thật – chạy lại sau khi thêm/sửa test.
> **Phân hệ:** TV1 = Tin đăng, tìm kiếm & kiểm duyệt · TV2 = Tài khoản, khách hàng & quản trị người dùng.
> Cột *Kỹ thuật* được gán theo tên ca – nhóm nên rà lại và bổ sung mã yêu cầu/biểu mẫu tương ứng khi viết báo cáo.

## Tổng hợp

| Bộ test | Công cụ | Cần gì để chạy | Số ca | TV1 | TV2 |
|---|---|---|---:|---:|---:|
| Unit | xUnit, Fake/Stub tự viết | không cần DB | 63 | 31 | 32 |
| Integration | xUnit + PostgreSQL thật | DB test tự dựng từ `database/*.sql` | 13 | 6 | 7 |
| API | xUnit + WebApplicationFactory | DB test tự dựng | 12 | 6 | 6 |
| Frontend | Vitest + React Testing Library (jsdom) | không cần backend | 34 | 22 | 12 |
| **Tổng** | | | **122** | **65** | **57** |

(Số ca đếm theo tên; một ca `[Theory]` có thể chạy với nhiều bộ dữ liệu.)

## Theo kỹ thuật kiểm thử

| Kỹ thuật | Số ca |
|---|---:|
| ACID / Rollback (tiêm lỗi) | 3 |
| Chuyển trạng thái (State) | 16 |
| Luồng liên phân hệ (end-to-end) | 3 |
| Phân hoạch tương đương (EP) | 46 |
| Phân hoạch tương đương + giá trị biên (EP/BVA) | 15 |
| Phân quyền / Bảo mật (RBAC) | 37 |
| Đối chiếu báo cáo với SQL tính tay | 2 |

## Unit test

| Mã TC | Ca kiểm thử | Kỹ thuật | Phụ trách |
|---|---|---|---|
| UT-001 | `Patterns.SearchAndFactoryTests.FactoryCreatesApartmentForSale` | Phân hoạch tương đương (EP) | TV1 |
| UT-002 | `Patterns.SearchAndFactoryTests.SearchCriteriaBuilderMapsQueryValues` | Phân hoạch tương đương (EP) | TV1 |
| UT-003 | `Infrastructure.DatabaseMappingTests.PasswordHasherVerifiesLegacyBcryptHashes` | Phân quyền / Bảo mật (RBAC) | TV1 |
| UT-004 | `Infrastructure.DatabaseMappingTests.PasswordHasherStillVerifiesPbkdf2Hashes` | Phân quyền / Bảo mật (RBAC) | TV1 |
| UT-005 | `Infrastructure.DatabaseMappingTests.LegalStatusTextIsReadFromDatabase` | Chuyển trạng thái (State) | TV1 |
| UT-006 | `Infrastructure.DatabaseMappingTests.FurnitureTextIsReadFromDatabase` | Phân hoạch tương đương (EP) | TV1 |
| UT-007 | `Infrastructure.DatabaseMappingTests.ForSaleFilterIncludesLandAndExcludesRentals` | Phân hoạch tương đương (EP) | TV1 |
| UT-008 | `Infrastructure.DatabaseMappingTests.MapListingKeepsRentalTypeAndBuildsAddressFromWard` | Phân hoạch tương đương (EP) | TV1 |
| UT-009 | `Application.AccountServiceTests.GetProfileReturnsRoleAndListingQuota` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-010 | `Application.AccountServiceTests.UpdateProfileTrimsValuesAndKeepsAvatar` | Phân hoạch tương đương (EP) | TV2 |
| UT-011 | `Application.AccountServiceTests.ChangePasswordStoresNewHashWhenCurrentPasswordMatches` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-012 | `Application.AccountServiceTests.ChangePasswordRejectsWrongCurrentPasswordWith400` | Chuyển trạng thái (State) | TV2 |
| UT-013 | `Application.AccountServiceTests.MissingUserThrowsNotFound` | Phân hoạch tương đương (EP) | TV2 |
| UT-014 | `Application.AccountServiceTests.UpdateProfileValidatorChecksInput` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV2 |
| UT-015 | `Application.AccountServiceTests.UploadAvatarStoresUnderUserAndOverwritesOnChange` | Phân hoạch tương đương (EP) | TV2 |
| UT-016 | `Application.AccountServiceTests.UploadAvatarRejectsNonImagesAndLargeFiles` | Chuyển trạng thái (State) | TV2 |
| UT-017 | `Application.AccountServiceTests.RemoveAvatarDeletesFileAndClearsUrl` | Phân hoạch tương đương (EP) | TV2 |
| UT-018 | `Application.AccountServiceTests.AvatarRequiresConfiguredStorage` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV2 |
| UT-019 | `Application.AccountServiceTests.ChangePasswordValidatorRequiresDifferentLongPassword` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV2 |
| UT-020 | `Application.AdminFeatureTests.NewEmailInFileCreatesAdminThatCanLogIn` | Phân hoạch tương đương (EP) | TV2 |
| UT-021 | `Application.AdminFeatureTests.RunningAgainWithSameFileChangesNothing` | Phân hoạch tương đương (EP) | TV2 |
| UT-022 | `Application.AdminFeatureTests.ChangingPasswordInFileUpdatesIt` | Phân hoạch tương đương (EP) | TV2 |
| UT-023 | `Application.AdminFeatureTests.ExistingBuyerEmailIsPromotedToAdmin` | Phân hoạch tương đương (EP) | TV2 |
| UT-024 | `Application.AdminFeatureTests.InvalidOrDuplicateEntriesAreSkipped` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV2 |
| UT-025 | `Application.AdminFeatureTests.AdminUpgradesBuyerToSeller` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-026 | `Application.AdminFeatureTests.CannotChangeAdminsSelfOrAssignAdminRole` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-027 | `Application.AdminFeatureTests.DowngradeIsBlockedWhenUserHasTooManyOpenListings` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-028 | `Application.AdminFeatureTests.StatsListEveryRoleAndStatus` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-029 | `Application.AdminFeatureTests.TakeDownOnlyAppliesToActiveOrHiddenListings` | Chuyển trạng thái (State) | TV2 |
| UT-030 | `Application.AdminFeatureTests.RoleRulesComeFromTheUserSubclasses` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-031 | `Application.ListingContactTests.MaskHidesTheLastDigits` | Phân hoạch tương đương (EP) | TV1 |
| UT-032 | `Application.ListingContactTests.ZaloLinkUsesLocalDigits` | Phân quyền / Bảo mật (RBAC) | TV1 |
| UT-033 | `Application.ListingContactTests.ListingPhonesFallBackToOwnerProfile` | Phân hoạch tương đương (EP) | TV1 |
| UT-034 | `Application.ListingContactTests.PublicListingOnlyExposesMaskedPhone` | Phân hoạch tương đương (EP) | TV1 |
| UT-035 | `Application.ListingContactTests.RevealPhoneIsPublicButZaloNeedsLogin` | Phân quyền / Bảo mật (RBAC) | TV1 |
| UT-036 | `Application.ListingContactTests.ProfileZaloPhoneIsValidated` | Phân quyền / Bảo mật (RBAC) | TV1 |
| UT-037 | `Application.ListingPostingTests.NewListingIsPendingWithImagesInOrder` | Chuyển trạng thái (State) | TV1 |
| UT-038 | `Application.ListingPostingTests.BuyerCannotPost` | Phân quyền / Bảo mật (RBAC) | TV1 |
| UT-039 | `Application.ListingPostingTests.SellerIsLimitedToFiveOpenListingsButClosedOnesDoNotCount` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV1 |
| UT-040 | `Application.ListingPostingTests.AgentHasHigherLimit` | Phân quyền / Bảo mật (RBAC) | TV1 |
| UT-041 | `Application.ListingPostingTests.OwnerEditSendsListingBackToReview` | Chuyển trạng thái (State) | TV1 |
| UT-042 | `Application.ListingPostingTests.SoldListingCannotBeEdited` | Phân quyền / Bảo mật (RBAC) | TV1 |
| UT-043 | `Application.ListingPostingTests.ValidatorRequiresTypeSpecificFields` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV1 |
| UT-044 | `Application.ListingPostingTests.OnlySafeImageUrlsAreAccepted` | Phân hoạch tương đương (EP) | TV1 |
| UT-045 | `Application.ListingPostingTests.ListingAcceptsAtMostTenImages` | Phân hoạch tương đương (EP) | TV1 |
| UT-046 | `Application.ListingPostingTests.ImageTypeIsDetectedFromContent` | Phân hoạch tương đương (EP) | TV1 |
| UT-047 | `Application.ListingPostingTests.UploadRejectsNonImagesAndBuyers` | Chuyển trạng thái (State) | TV1 |
| UT-048 | `Application.ListingPostingTests.AdminApprovesPendingListingForThirtyDays` | Chuyển trạng thái (State) | TV1 |
| UT-049 | `Application.ListingPostingTests.AdminRejectsOnlyPendingListings` | Chuyển trạng thái (State) | TV1 |
| UT-050 | `Application.ListingPostingTests.QueueFiltersByKeywordAndCountsByStatus` | Chuyển trạng thái (State) | TV1 |
| UT-051 | `Application.ProjectServiceTests.SearchNormalizesQueryAndMapsAddressAndCounts` | Phân hoạch tương đương (EP) | TV1 |
| UT-052 | `Application.ProjectServiceTests.DetailOrdersPhases` | Phân hoạch tương đương (EP) | TV1 |
| UT-053 | `Application.ProjectServiceTests.MissingProjectThrowsNotFound` | Phân hoạch tương đương (EP) | TV1 |
| UT-054 | `Application.SellerFeatureTests.OwnerCanMoveSaleListingBetweenAllowedStatuses` | Chuyển trạng thái (State) | TV2 |
| UT-055 | `Application.SellerFeatureTests.OwnerCannotMakeInvalidStatusChanges` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-056 | `Application.SellerFeatureTests.RentListingUsesRentedNotSold` | Chuyển trạng thái (State) | TV2 |
| UT-057 | `Application.SellerFeatureTests.ExpiredListingCannotBeShownAgainButCanBeHidden` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-058 | `Application.SellerFeatureTests.ListingServiceRejectsStatusChangeByOtherUserAndMapsRuleErrorsTo422` | Chuyển trạng thái (State) | TV2 |
| UT-059 | `Application.SellerFeatureTests.VisitorContactGoesToListingOwnerAsNew` | Phân hoạch tương đương (EP) | TV2 |
| UT-060 | `Application.SellerFeatureTests.CannotContactOwnListingOrClosedListing` | Phân quyền / Bảo mật (RBAC) | TV2 |
| UT-061 | `Application.SellerFeatureTests.SellerFiltersUpdatesAndDeletesOnlyOwnContacts` | Phân hoạch tương đương (EP) | TV2 |
| UT-062 | `Application.SellerFeatureTests.ContactValidatorChecksInput` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV2 |
| UT-063 | `Application.SellerFeatureTests.DashboardCountsListingsContactsAndSaves` | Phân hoạch tương đương (EP) | TV2 |

## Integration test

| Mã TC | Ca kiểm thử | Kỹ thuật | Phụ trách |
|---|---|---|---|
| IT-001 | `IntegrationTests.SeedDataCoversEveryTableWithAtLeast120Rows` | Phân hoạch tương đương (EP) | TV1 |
| IT-002 | `IntegrationTests.PublicSearchHidesPendingRejectedAndHiddenListings` | Chuyển trạng thái (State) | TV1 |
| IT-003 | `IntegrationTests.DeletingListingCascadesImagesButKeepsCustomerContactRequests` | Phân hoạch tương đương (EP) | TV1 |
| IT-004 | `IntegrationTests.UserSearchIsCaseInsensitiveAndFiltersByRole` | Phân quyền / Bảo mật (RBAC) | TV2 |
| IT-005 | `IntegrationTests.LocationsAreLinkedProvinceToDistrictToWard` | Phân hoạch tương đương (EP) | TV1 |
| IT-006 | `IntegrationTests.RoleChangeRollsBackUsersWhenTokenRevocationFails` | ACID / Rollback (tiêm lỗi) | TV2 |
| IT-007 | `IntegrationTests.RoleChangeCommitsBothTablesAndRevokesSessions` | ACID / Rollback (tiêm lỗi) | TV2 |
| IT-008 | `IntegrationTests.ListingWithInvalidImageIsNotSavedAtAll` | ACID / Rollback (tiêm lỗi) | TV1 |
| IT-009 | `IntegrationTests.PostApproveThenListingBecomesPublic` | Luồng liên phân hệ (end-to-end) | TV1 |
| IT-010 | `IntegrationTests.VisitorContactReachesSellerCustomerList` | Luồng liên phân hệ (end-to-end) | TV2 |
| IT-011 | `IntegrationTests.SellerDashboardMatchesHandCountedSql` | Đối chiếu báo cáo với SQL tính tay | TV2 |
| IT-012 | `IntegrationTests.AdminStatsMatchHandCountedSql` | Đối chiếu báo cáo với SQL tính tay | TV2 |
| IT-013 | `IntegrationTests.PasswordsAreStoredHashedNotPlainText` | Phân quyền / Bảo mật (RBAC) | TV2 |

## API test

| Mã TC | Ca kiểm thử | Kỹ thuật | Phụ trách |
|---|---|---|---|
| AT-001 | `ApiTests.LoginReturnsTokensAndRole_WrongPasswordIs401` | Phân quyền / Bảo mật (RBAC) | TV2 |
| AT-002 | `ApiTests.ProtectedEndpointWithoutTokenIs401` | Phân quyền / Bảo mật (RBAC) | TV2 |
| AT-003 | `ApiTests.BuyerCannotPostListing` | Phân quyền / Bảo mật (RBAC) | TV1 |
| AT-004 | `ApiTests.AdminApiIsForbiddenForSellerAndOpenForAdmin` | Phân quyền / Bảo mật (RBAC) | TV2 |
| AT-005 | `ApiTests.AdminChangesRoleAndOldSessionIsRevoked` | Phân quyền / Bảo mật (RBAC) | TV2 |
| AT-006 | `ApiTests.InvalidListingReturns400WithFieldErrors` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV1 |
| AT-007 | `ApiTests.SellerQuotaIsEnforced` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV1 |
| AT-008 | `ApiTests.FullFlow_PostApprovePublicContactSellerInbox` | Luồng liên phân hệ (end-to-end) | TV1 |
| AT-009 | `ApiTests.ContactEndpointHidesZaloUntilSignedIn` | Phân quyền / Bảo mật (RBAC) | TV1 |
| AT-010 | `ApiTests.AvatarUploadRejectsFakeImageAndAcceptsJpeg` | Chuyển trạng thái (State) | TV2 |
| AT-011 | `ApiTests.ProfileUpdateSavesZaloAndRejectsBadPhone` | Phân quyền / Bảo mật (RBAC) | TV2 |
| AT-012 | `ApiTests.LocationsEndpointListsAll63Provinces` | Phân hoạch tương đương (EP) | TV1 |

## Frontend test

| Mã TC | Ca kiểm thử | Kỹ thuật | Phụ trách |
|---|---|---|---|
| FT-001 | `pages/Login.test.jsx › Login – quay lại sau khi đăng nhập > quay lại đúng tin đang xem` | Phân hoạch tương đương (EP) | TV2 |
| FT-002 | `pages/Login.test.jsx › Login – quay lại sau khi đăng nhập > bỏ qua đường dẫn ra ngoài ` | Phân hoạch tương đương (EP) | TV2 |
| FT-003 | `pages/Login.test.jsx › Login – quay lại sau khi đăng nhập > đăng nhập sai hiện thông báo lỗi` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV2 |
| FT-004 | `components/property/ContactButtons.test.jsx › ContactButtons – Chat qua Zalo & Hiện số > chỉ hiện số đã che trước khi bấm` | Phân quyền / Bảo mật (RBAC) | TV1 |
| FT-005 | `components/property/ContactButtons.test.jsx › ContactButtons – Chat qua Zalo & Hiện số > bấm "Hiện số" ` | Phân quyền / Bảo mật (RBAC) | TV1 |
| FT-006 | `components/property/ContactButtons.test.jsx › ContactButtons – Chat qua Zalo & Hiện số > khách chưa đăng nhập bấm Zalo → chuyển tới đăng nhập kèm đường quay lại` | Phân quyền / Bảo mật (RBAC) | TV1 |
| FT-007 | `components/property/ContactButtons.test.jsx › ContactButtons – Chat qua Zalo & Hiện số > đã đăng nhập bấm Zalo → mở zalo.me với số Zalo` | Phân quyền / Bảo mật (RBAC) | TV1 |
| FT-008 | `components/admin/AdminShell.test.jsx › AdminShell – chỉ admin xem được khu quản trị > người bán thấy thông báo, không thấy nội dung` | Phân quyền / Bảo mật (RBAC) | TV2 |
| FT-009 | `components/admin/AdminShell.test.jsx › AdminShell – chỉ admin xem được khu quản trị > admin thấy nội dung và menu quản trị` | Phân quyền / Bảo mật (RBAC) | TV2 |
| FT-010 | `components/seller/ImageUploader.test.jsx › ImageUploader – kiểm tra ảnh trước khi tải lên > từ chối file sai định dạng và file > 5 MB, không gọi API` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV1 |
| FT-011 | `components/seller/ImageUploader.test.jsx › ImageUploader – kiểm tra ảnh trước khi tải lên > ảnh hợp lệ được thêm và tải lên` | Phân hoạch tương đương (EP) | TV1 |
| FT-012 | `components/seller/SellerShell.test.js › SellerShell – hàm tiện ích > formatPrice: tỷ / triệu / liên hệ` | Phân hoạch tương đương (EP) | TV1 |
| FT-013 | `components/seller/SellerShell.test.js › SellerShell – hàm tiện ích > effectiveStatus: tin Đang hiển thị đã quá hạn được coi là Hết hạn` | Chuyển trạng thái (State) | TV1 |
| FT-014 | `components/seller/SellerShell.test.js › SellerShell – hàm tiện ích > daysLeft: làm tròn lên, null nếu không có hạn` | Phân hoạch tương đương (EP) | TV1 |
| FT-015 | `utils/listingForm.test.js › priceOf – quy đổi giá theo đơn vị > bán: "6,8" tỷ → 6.800.000.000` | Phân hoạch tương đương (EP) | TV1 |
| FT-016 | `utils/listingForm.test.js › priceOf – quy đổi giá theo đơn vị > bán: đơn vị triệu` | Phân hoạch tương đương (EP) | TV1 |
| FT-017 | `utils/listingForm.test.js › priceOf – quy đổi giá theo đơn vị > cho thuê luôn tính theo triệu/tháng` | Phân hoạch tương đương (EP) | TV1 |
| FT-018 | `utils/listingForm.test.js › priceOf – quy đổi giá theo đơn vị > giá trống hoặc sai → 0` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV1 |
| FT-019 | `utils/listingForm.test.js › validateStep – kiểm tra từng bước giống backend > bước 1: chưa chọn loại BĐS` | Phân hoạch tương đương (EP) | TV1 |
| FT-020 | `utils/listingForm.test.js › validateStep – kiểm tra từng bước giống backend > bước 3 hợp lệ thì không có lỗi` | Phân hoạch tương đương (EP) | TV1 |
| FT-021 | `utils/listingForm.test.js › validateStep – kiểm tra từng bước giống backend > bước 3: tiêu đề < 20 ký tự, mô tả < 50 ký tự ` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV1 |
| FT-022 | `utils/listingForm.test.js › validateStep – kiểm tra từng bước giống backend > nhà riêng bắt buộc diện tích đất; căn hộ thì không` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV1 |
| FT-023 | `utils/listingForm.test.js › validateStep – kiểm tra từng bước giống backend > số liên hệ bắt buộc; số Zalo bắt buộc khi bỏ tick "dùng chung"` | Phân quyền / Bảo mật (RBAC) | TV1 |
| FT-024 | `utils/listingForm.test.js › validateStep – kiểm tra từng bước giống backend > bước 4: còn ảnh đang tải hoặc ảnh lỗi thì chưa gửi được` | Phân hoạch tương đương (EP) | TV1 |
| FT-025 | `utils/listingForm.test.js › toPayload – dữ liệu gửi API > chỉ gửi trường hợp lệ với loại BĐS, ảnh đã tải xong, Zalo dùng chung số liên hệ` | Phân quyền / Bảo mật (RBAC) | TV1 |
| FT-026 | `utils/listingForm.test.js › toPayload – dữ liệu gửi API > Zalo riêng khi bỏ tick` | Phân quyền / Bảo mật (RBAC) | TV1 |
| FT-027 | `utils/listingForm.test.js › fromListing – nạp tin khi sửa > giá ≥ 1 tỷ hiển thị theo tỷ, nhỏ hơn theo triệu` | Phân hoạch tương đương (EP) | TV1 |
| FT-028 | `config/navigation.test.js › menu tài khoản theo vai trò > người mua chỉ thấy mục cài đặt tài khoản` | Phân hoạch tương đương (EP) | TV2 |
| FT-029 | `config/navigation.test.js › menu tài khoản theo vai trò > người bán / môi giới thấy khu vực người bán nhưng không thấy Quản trị` | Phân hoạch tương đương (EP) | TV2 |
| FT-030 | `config/navigation.test.js › menu tài khoản theo vai trò > admin thấy thêm Quản trị hệ thống` | Phân hoạch tương đương (EP) | TV2 |
| FT-031 | `config/navigation.test.js › menu tài khoản theo vai trò > chưa đăng nhập: không có quyền quản lý tin` | Phân quyền / Bảo mật (RBAC) | TV2 |
| FT-032 | `services/accountService.test.js › readApiError – đọc lỗi API thành thông báo + lỗi từng ô > lỗi validation: tên trường viết thường chữ đầu, lấy thông báo đầu tiên` | Phân hoạch tương đương + giá trị biên (EP/BVA) | TV2 |
| FT-033 | `services/accountService.test.js › readApiError – đọc lỗi API thành thông báo + lỗi từng ô > lỗi nghiệp vụ: dùng message và code của server` | Phân hoạch tương đương (EP) | TV2 |
| FT-034 | `services/accountService.test.js › readApiError – đọc lỗi API thành thông báo + lỗi từng ô > không kết nối được máy chủ` | Phân hoạch tương đương (EP) | TV2 |
