/**
 * BISS Navigation Types
 * Type-safe navigation throughout the app
 */

export type RootTabParamList = {
  MapStack: undefined;
  CatchBookStack: undefined;
  CommunityStack: undefined;
  ProfileStack: undefined;
};

export type MapStackParamList = {
  Map: undefined;
  Search: undefined;
  SpotDetail: { spotId: string };
};

export type CommunityStackParamList = {
  Community: undefined;
  SharedCatchDetail: { shareId: string };
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
