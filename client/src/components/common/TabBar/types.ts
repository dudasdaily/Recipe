export type TabRoute = {
  name: string;
  label: string;
  icon: 'home' | 'plus-square' | 'settings';
};

export type TabBarProps = {
  routes: TabRoute[];
  currentRoute: string;
  onChangeRoute: (routeName: string) => void;
  isEnabled?: boolean;
};

export type TabItem = {
  name: string;
  route: string;
  icon: string;
}; 