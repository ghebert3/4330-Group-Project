export type RootStackParamList = {
  Startup: undefined;
  Login: undefined;
  SignUp: undefined;
  Restart: undefined;
  AppTabs: undefined;
  ChangePassword: undefined;
  Onboarding: undefined;
  ProfileOverview: undefined;
  EditProfile: undefined;
  DMThread: { conversationId: number };
  DMNewChat: undefined; 
  DiscoverEditor: undefined;
  Discover: undefined;
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
