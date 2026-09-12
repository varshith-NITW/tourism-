import { Hotel, Guide, SplitBreakdown, GuidePackageType } from '../types';

export interface SplitCalculationParams {
  hotel: Hotel;
  nights: number;
  selectedRoomPrice: number;
  guide?: Guide | null;
  guidePackageType?: GuidePackageType | null;
  customGuideFee?: number;
}

/**
 * Calculates real-time multi-party split payout breakdown:
 * - Hotel Payout: Hotel Gross minus Platform Commission
 * - Guide Payout: Guide Gross minus Platform Fee minus Hotel Referral Fee
 * - Hotel Referral Kickback: Earned by the hotel when an add-on guide is bundled via their listing
 * - Platform Net Revenue: Platform Hotel Commission + Platform Guide Fee
 */
export function calculateSplitBreakdown({
  hotel,
  nights,
  selectedRoomPrice,
  guide,
  guidePackageType,
  customGuideFee
}: SplitCalculationParams): SplitBreakdown {
  const hotelGross = selectedRoomPrice * Math.max(1, nights);
  const hotelCommissionRate = hotel.commissionRate || 0.15; // default 15%
  const hotelPlatformCut = Math.round(hotelGross * hotelCommissionRate);
  const hotelNet = hotelGross - hotelPlatformCut;

  let guideGross = 0;
  let guidePlatformCut = 0;
  let hotelReferralKickback = 0;
  let guideNet = 0;

  if (guide && guidePackageType) {
    if (customGuideFee && customGuideFee > 0) {
      guideGross = customGuideFee;
    } else {
      switch (guidePackageType) {
        case 'half_day':
          guideGross = guide.halfDayRate;
          break;
        case 'full_day':
          guideGross = guide.fullDayRate;
          break;
        case 'photography_walk':
          guideGross = guide.photoWalkRate;
          break;
        default:
          guideGross = guide.halfDayRate;
      }
    }

    // Platform standard fee on guide booking: 10%
    const GUIDE_PLATFORM_FEE_RATE = 0.10;
    guidePlatformCut = Math.round(guideGross * GUIDE_PLATFORM_FEE_RATE);

    // If guide was booked through the hotel partnership/affiliate link:
    // Hotel gets a referral kickback (default 5% - 7%)
    const referralRate = hotel.guideReferralKickbackPercent || 0.05;
    hotelReferralKickback = Math.round(guideGross * referralRate);

    // Guide's net take-home is their gross fee minus platform fee and hotel referral fee
    guideNet = guideGross - guidePlatformCut - hotelReferralKickback;
  }

  const totalCharged = hotelGross + guideGross;
  const platformNetRevenue = hotelPlatformCut + guidePlatformCut;

  return {
    totalCharged,
    hotelGross,
    hotelPlatformCut,
    hotelNet,
    guideGross,
    guidePlatformCut,
    hotelReferralKickback,
    guideNet,
    platformNetRevenue
  };
}
