'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION STRUCTURE
export function initializeFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  // استخدام initializeFirestore بدلاً من getFirestore لتمرير إعدادات الاستقرار
  // تفعيل experimentalForceLongPolling يحل مشكلة الاتصال في بيئات العمل السحابية والبروكسي
  const firestore = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
  });

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore,
    // تهيئة صريحة باستخدام رابط المستودع لضمان استقرار الاتصال
    storage: getStorage(firebaseApp, `gs://${firebaseConfig.storageBucket}`)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
