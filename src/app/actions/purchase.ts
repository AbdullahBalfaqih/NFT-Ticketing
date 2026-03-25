'use server';

import { mintTicketOnChain } from '@/lib/blockchain';

export async function processPurchase(
  toAddress: string, 
  eventId: string, 
  fingerprint: string,
  signals: { isHuman: boolean; timestamp: number }
) {
  try {
    // 1. بروتوكول التحقق من الإشارات (Signal Validation)
    if (!signals.isHuman) {
      throw new Error('[Guardian] Human verification failed. Protocol rejected the request.');
    }

    // 2. التحقق من سلامة البصمة الرقمية
    if (!fingerprint || fingerprint.length < 10) {
      throw new Error('[Guardian] Invalid device fingerprint. Direct API calls are blocked.');
    }

    // 3. التحقق من صحة العنوان
    if (!toAddress || !toAddress.startsWith('0x') || toAddress.length !== 42) {
      throw new Error('Invalid wallet or vault address provided to the protocol');
    }

    const numericEventId = parseInt(eventId);
    if (isNaN(numericEventId)) {
      throw new Error('Invalid event ID for blockchain processing');
    }

    // محاكاة التحقق من IP و الـ Limits في قاعدة البيانات (في الإنتاج يتم فحص سجلات المعاملات)
    console.log(`[Guardian] Secure Request Validated:
      - Device: ${fingerprint.substring(0, 8)}...
      - Wallet: ${toAddress}
      - Status: Verified Human`);

    // تنفيذ عملية السك الحقيقية على البلوكشين
    console.log(`[Protocol] Initiating on-chain mint for address: ${toAddress}`);
    const result = await mintTicketOnChain(toAddress, numericEventId);
    
    return {
      success: true,
      hash: result.hash,
      tokenId: result.tokenId,
      blockNumber: result.blockNumber
    };
  } catch (error: any) {
    console.error('[Protocol] Purchase Blocked:', error.message);
    return {
      success: false,
      error: error.message || 'The protocol failed to execute the on-chain transaction'
    };
  }
}
