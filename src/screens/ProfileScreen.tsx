/**
 * Profile Screen
 * User profile, stats, and settings menu
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { ChevronRightIcon, SettingsIcon, BluetoothIcon } from '../components/TabIcons';
import { RootStackParamList } from '../../App';

type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StatCardProps {
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuItemLeft}>
      {icon}
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <ChevronRightIcon color={Colors.text.tertiary} size={16} />
  </TouchableOpacity>
);

interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
}

const MenuSection: React.FC<MenuSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.menu}>{children}</View>
  </View>
);

export function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<ProfileNavigationProp>();

  // Get user initial for avatar
  const userName = 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const memberSince = 'Jan 2025';

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileSince}>Member since {memberSince}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard value="185" label="Sessions" />
          <StatCard value="26" label="Week Streak" />
          <StatCard value="48h" label="Total Time" />
        </View>

        {/* Menu Sections */}
        <MenuSection title="Account">
          <MenuItem
            icon={<View style={styles.menuIcon}><Text>👤</Text></View>}
            label="Edit Profile"
          />
          <MenuItem
            icon={<BluetoothIcon color={Colors.text.secondary} size={20} />}
            label="Devices"
          />
        </MenuSection>

        <MenuSection title="Preferences">
          <MenuItem
            icon={<SettingsIcon color={Colors.text.secondary} size={20} />}
            label="Settings"
            onPress={handleSettingsPress}
          />
          <MenuItem
            icon={<View style={styles.menuIcon}><Text>📤</Text></View>}
            label="Export Data"
          />
        </MenuSection>

        <MenuSection title="Support">
          <MenuItem
            icon={<View style={styles.menuIcon}><Text>❓</Text></View>}
            label="Help & FAQ"
          />
        </MenuSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  headerInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  profileSince: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  menu: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.secondary,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
  },
});

export default ProfileScreen;
