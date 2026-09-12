export interface SplitParams {
  roomPrice: number;
  nights: number;
  hotelCommissionRate: number; // e.g. 0.15 for 15%
  includeGuide: boolean;
  guideFee: number;
  hotelReferralRate: number; // e.g. 0.05 for 5%
}

export interface SplitResult {
  totalCharged: number;
  hotelGross: number;
  hotelPlatformCut: number;
  hotelNet: number;
  guideGross: number;
  guidePlatformCut: number;
  hotelReferralKickback: number;
  guideNet: number;
  platformNetRevenue: number;
}

/**
 * Executes automated multi-party split settlement math:
 * - Hotel Net = Room Gross minus 15% Platform Commission
 * - Guide Net = Guide Fee minus 10% Platform Fee minus 5% Hotel Referral Fee
 * - Hotel Referral Kickback = 5% of Guide Fee credited to hotel
 * - Platform Net = Hotel Commission + Guide Fee
 */
export function calculateMultiPartySplit(params: SplitParams): SplitResult {
  const hotelGross = params.roomPrice * Math.max(1, params.nights);
  const hotelCommissionRate = params.hotelCommissionRate || 0.15;
  const hotelPlatformCut = Math.round(hotelGross * hotelCommissionRate);
  const hotelNet = hotelGross - hotelPlatformCut;

  let guideGross = 0;
  let guidePlatformCut = 0;
  let hotelReferralKickback = 0;
  let guideNet = 0;

  if (params.includeGuide && params.guideFee > 0) {
    guideGross = params.guideFee;
    guidePlatformCut = Math.round(guideGross * 0.10); // 10% platform fee
    const referralRate = params.hotelReferralRate || 0.05; // 5% hotel kickback
    hotelReferralKickback = Math.round(guideGross * referralRate);
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
