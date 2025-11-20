// src/navigation/navigationRef.ts
import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}