/**
 * BISS Navigation Types
 * Type-safe navigation throughout the app
 */

export type RootTabParamList = {
  ScheinStack: undefined;
  MapStack: undefined;
  BuyStack: undefined;
  ProfileStack: undefined;
};

export type ScheinStackParamList = {
  Schein: undefined;
  ScheinDetail: { scheinId: string };
};

export type MapStackParamList = {
  Map: undefined;
  Search: undefined;
  SpotDetail: { spotId: string };
};

export type BuyStackParamList = {
  Buy: undefined;
  Checkout: { productId: string };
  Payment: { orderId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Catches: undefined;
};

// Navigation prop types for each screen
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
