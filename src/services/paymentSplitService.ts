import { Hotel, Guide, SplitBreakdown, GuidePackageType } from '../types';

export interface SplitCalculationParams {
  hotel: Hotel;
  nights: number;
  selectedRoomPrice: number;
  guide?: Guide | null;
  guidePackageType?: GuidePackageType | null;
  customGuideFee?: number;
  applyWebsiteDiscount?: boolean;
}

/**
 * Calculates real-time multi-party split payout breakdown with Direct Website Discount:
 * - Exclusive Website Booking Discount: Flat 15% OFF for hotel/guide; 20% OFF when bundled together!
 * - Hotel Payout: Discounted Hotel Gross minus Platform Commission
 * - Guide Payout: Discounted Guide Gross minus Platform Fee minus Hotel Referral Kickback
 * - Hotel Referral Kickback: Earned by hotel when an add-on guide is bundled via their listing
 * - Platform Net Revenue: Platform Hotel Commission + Platform Guide Fee
 */
export function calculateSplitBreakdown({
  hotel,
  nights,
  selectedRoomPrice,
  guide,
  guidePackageType,
  customGuideFee,
  applyWebsiteDiscount = true
}: SplitCalculationParams): SplitBreakdown {
  const hotelGrossOriginal = selectedRoomPrice * Math.max(1, nights);

  let guideGrossOriginal = 0;
  if (guide && guidePackageType) {
    if (customGuideFee && customGuideFee > 0) {
      guideGrossOriginal = customGuideFee;
    } else {
      switch (guidePackageType) {
        case 'half_day':
          guideGrossOriginal = guide.halfDayRate;
          break;
        case 'full_day':
          guideGrossOriginal = guide.fullDayRate;
          break;
        case 'photography_walk':
          guideGrossOriginal = guide.photoWalkRate;
          break;
        default:
          guideGrossOriginal = guide.halfDayRate;
      }
    }
  }

  const originalTotal = hotelGrossOriginal + guideGrossOriginal;

  // Direct Website Booking Discount:
  // - 15% discount for single reservation
  // - 20% discount when hotel + guide are bundled together!
  const hasBundle = !!(guide && guidePackageType);
  const websiteDiscountPercent = hasBundle ? 20 : 15;
  const websiteDiscountAmount = applyWebsiteDiscount
    ? Math.round(originalTotal * (websiteDiscountPercent / 100))
    : 0;

  const totalCharged = Math.max(0, originalTotal - websiteDiscountAmount);

  // Proportional discount distribution
  const hotelDiscountShare = originalTotal > 0
    ? Math.round(websiteDiscountAmount * (hotelGrossOriginal / originalTotal))
    : 0;
  const guideDiscountShare = websiteDiscountAmount - hotelDiscountShare;

  const hotelGross = Math.max(0, hotelGrossOriginal - hotelDiscountShare);
  const hotelCommissionRate = hotel.commissionRate || 0.15; // default 15%
  const hotelPlatformCut = Math.round(hotelGross * hotelCommissionRate);
  const hotelNet = hotelGross - hotelPlatformCut;

  let guideGross = 0;
  let guidePlatformCut = 0;
  let hotelReferralKickback = 0;
  let guideNet = 0;

  if (guide && guidePackageType) {
    guideGross = Math.max(0, guideGrossOriginal - guideDiscountShare);

    // Platform standard fee on guide booking: 10%
    const GUIDE_PLATFORM_FEE_RATE = 0.10;
    guidePlatformCut = Math.round(guideGross * GUIDE_PLATFORM_FEE_RATE);

    // Hotel referral kickback (5% - 7%)
    const referralRate = hotel.guideReferralKickbackPercent || 0.05;
    hotelReferralKickback = Math.round(guideGross * referralRate);

    // Guide's net take-home
    guideNet = guideGross - guidePlatformCut - hotelReferralKickback;
  }

  const platformNetRevenue = hotelPlatformCut + guidePlatformCut;

  return {
    totalCharged,
    originalTotal,
    websiteDiscountPercent,
    websiteDiscountAmount,
    hotelGross,
    hotelGrossOriginal,
    hotelPlatformCut,
    hotelNet,
    guideGross,
    guideGrossOriginal,
    guidePlatformCut,
    hotelReferralKickback,
    guideNet,
    platformNetRevenue
  };
}
