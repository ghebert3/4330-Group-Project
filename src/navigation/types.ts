export type RootStackParamList = {
  Startup: undefined;
  Login: undefined;
  SignUp: undefined;
  Restart: undefined;
  ChangePassword: undefined;
  Onboarding: undefined;
  ProfileOverview: undefined;
  UserProfile: { userId: string };
  EditProfile: undefined;
  AppTabs: undefined;
  DMThread:  | undefined;
  DMNewChat: undefined;
  DiscoverEditor: undefined;
};


export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Messages: undefined;
  Discover: undefined;
  Meetups: undefined;
  Profile: undefined;
};
