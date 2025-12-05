export type RootStackParamList = {
  Startup: undefined;
  Login: undefined;
  SignUp: undefined;
  Restart: undefined;
  AppTabs: undefined;
  ChangePassword: undefined;
  Onboarding: undefined;
  DMThread: { conversationId: number };
  DMNewChat: undefined; 
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
