/**
 * SessionListView Component Tests
 *
 * Comprehensive test suite for the SessionListView component that displays
 * a scrollable list of sessions ordered by start time (newest first).
 */

import * as fs from 'fs';
import * as path from 'path';

const componentPath = path.join(
  __dirname,
  '../src/components/SessionListView.tsx'
);
const componentSource = fs.readFileSync(componentPath, 'utf-8');

const indexPath = path.join(__dirname, '../src/components/index.ts');
const indexSource = fs.readFileSync(indexPath, 'utf-8');

describe('SessionListView Component', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should be a TypeScript React file', () => {
      expect(componentPath.endsWith('.tsx')).toBe(true);
    });

    it('should export SessionListView component', () => {
      expect(componentSource).toMatch(
        /export\s+(const|function)\s+SessionListView/
      );
    });

    it('should have default export', () => {
      expect(componentSource).toMatch(/export\s+default\s+SessionListView/);
    });

    it('should export SessionListViewProps type', () => {
      expect(componentSource).toMatch(
        /export\s+interface\s+SessionListViewProps/
      );
    });
  });

  describe('Index File Exports', () => {
    it('should export SessionListView from index', () => {
      expect(indexSource).toMatch(/export\s*\{\s*SessionListView\s*\}/);
    });

    it('should export SessionListViewProps type from index', () => {
      expect(indexSource).toMatch(
        /export\s+type\s*\{\s*SessionListViewProps\s*\}/
      );
    });

    it('should export SESSION_TYPE_LABELS constant', () => {
      expect(indexSource).toMatch(/SESSION_TYPE_LABELS/);
    });

    it('should export SESSION_TYPE_COLORS constant', () => {
      expect(indexSource).toMatch(/SESSION_TYPE_COLORS/);
    });

    it('should export helper functions', () => {
      expect(indexSource).toMatch(/getSessionTypeBadgeColor/);
      expect(indexSource).toMatch(/formatSessionDuration/);
      expect(indexSource).toMatch(/formatSessionDate/);
      expect(indexSource).toMatch(/formatSessionTime/);
      expect(indexSource).toMatch(/formatThetaZScore/);
      expect(indexSource).toMatch(/getThetaColor/);
      expect(indexSource).toMatch(/getSessionAccessibilityLabel/);
      expect(indexSource).toMatch(/isSameDay/);
      expect(indexSource).toMatch(/getRelativeDateLabel/);
      expect(indexSource).toMatch(/getStarRating/);
    });
  });

  describe('Required Imports', () => {
    it('should import React', () => {
      expect(componentSource).toMatch(/import\s+React/);
    });

    it('should import useCallback and useMemo from React', () => {
      expect(componentSource).toMatch(/useCallback/);
      expect(componentSource).toMatch(/useMemo/);
    });

    it('should import FlatList from react-native', () => {
      expect(componentSource).toMatch(/FlatList/);
    });

    it('should import View, Text, TouchableOpacity from react-native', () => {
      expect(componentSource).toMatch(/View/);
      expect(componentSource).toMatch(/Text/);
      expect(componentSource).toMatch(/TouchableOpacity/);
    });

    it('should import RefreshControl from react-native', () => {
      expect(componentSource).toMatch(/RefreshControl/);
    });

    it('should import StyleSheet from react-native', () => {
      expect(componentSource).toMatch(/StyleSheet/);
    });

    it('should import ListRenderItemInfo from react-native', () => {
      expect(componentSource).toMatch(/ListRenderItemInfo/);
    });

    it('should import useSession from contexts', () => {
      expect(componentSource).toMatch(
        /useSession.*from.*['"]\.\.\/contexts['"]/
      );
    });

    it('should import theme constants', () => {
      expect(componentSource).toMatch(/Colors/);
      expect(componentSource).toMatch(/Spacing/);
      expect(componentSource).toMatch(/BorderRadius/);
      expect(componentSource).toMatch(/Typography/);
      expect(componentSource).toMatch(/Shadows/);
    });

    it('should import Session type', () => {
      expect(componentSource).toMatch(
        /import.*Session.*from.*['"]\.\.\/types['"]/
      );
    });
  });

  describe('SessionListViewProps Interface', () => {
    it('should have sessions prop', () => {
      expect(componentSource).toMatch(/sessions\?:\s*Session\[\]/);
    });

    it('should have onSessionPress prop', () => {
      expect(componentSource).toMatch(
        /onSessionPress\?:\s*\(session:\s*Session\)\s*=>\s*void/
      );
    });

    it('should have showRefreshControl prop with default true', () => {
      expect(componentSource).toMatch(/showRefreshControl\?:\s*boolean/);
      expect(componentSource).toMatch(/showRefreshControl\s*=\s*true/);
    });

    it('should have testID prop', () => {
      expect(componentSource).toMatch(/testID\?:\s*string/);
    });

    it('should have maxItems prop', () => {
      expect(componentSource).toMatch(/maxItems\?:\s*number/);
    });

    it('should have isLoading prop', () => {
      expect(componentSource).toMatch(/isLoading\?:\s*boolean/);
    });
  });

  describe('SESSION_TYPE_LABELS Constant', () => {
    it('should export SESSION_TYPE_LABELS', () => {
      expect(componentSource).toMatch(/export\s+const\s+SESSION_TYPE_LABELS/);
    });

    it('should have calibration label', () => {
      expect(componentSource).toMatch(/calibration:\s*['"]Calibration['"]/);
    });

    it('should have quick_boost label', () => {
      expect(componentSource).toMatch(/quick_boost:\s*['"]Quick Boost['"]/);
    });

    it('should have custom label', () => {
      expect(componentSource).toMatch(/custom:\s*['"]Custom['"]/);
    });

    it('should have scheduled label', () => {
      expect(componentSource).toMatch(/scheduled:\s*['"]Scheduled['"]/);
    });

    it('should have sham label', () => {
      expect(componentSource).toMatch(/sham:\s*['"]A\/B Test['"]/);
    });
  });

  describe('SESSION_TYPE_COLORS Constant', () => {
    it('should export SESSION_TYPE_COLORS', () => {
      expect(componentSource).toMatch(/export\s+const\s+SESSION_TYPE_COLORS/);
    });

    it('should map session types to colors', () => {
      expect(componentSource).toMatch(
        /SESSION_TYPE_COLORS.*Record.*Session\['session_type'\].*string/
      );
    });

    it('should use Colors constants for values', () => {
      expect(componentSource).toMatch(/calibration:\s*Colors\./);
      expect(componentSource).toMatch(/quick_boost:\s*Colors\./);
      expect(componentSource).toMatch(/custom:\s*Colors\./);
      expect(componentSource).toMatch(/scheduled:\s*Colors\./);
      expect(componentSource).toMatch(/sham:\s*Colors\./);
    });
  });

  describe('getSessionTypeLabel Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+getSessionTypeLabel/);
    });

    it('should accept sessionType parameter', () => {
      expect(componentSource).toMatch(
        /getSessionTypeLabel\s*=\s*\(\s*sessionType:\s*Session\['session_type'\]\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(
        /getSessionTypeLabel[\s\S]*?:\s*string\s*=>/
      );
    });

    it('should use SESSION_TYPE_LABELS lookup', () => {
      expect(componentSource).toMatch(/SESSION_TYPE_LABELS\[sessionType\]/);
    });
  });

  describe('getSessionTypeBadgeColor Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(
        /export\s+const\s+getSessionTypeBadgeColor/
      );
    });

    it('should accept sessionType parameter', () => {
      expect(componentSource).toMatch(
        /getSessionTypeBadgeColor\s*=\s*\(\s*sessionType:\s*Session\['session_type'\]\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(
        /getSessionTypeBadgeColor[\s\S]*?:\s*string\s*=>/
      );
    });

    it('should use SESSION_TYPE_COLORS lookup', () => {
      expect(componentSource).toMatch(/SESSION_TYPE_COLORS\[sessionType\]/);
    });
  });

  describe('formatSessionDuration Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+formatSessionDuration/);
    });

    it('should accept seconds parameter', () => {
      expect(componentSource).toMatch(
        /formatSessionDuration\s*=\s*\(\s*seconds:\s*number\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(/formatSessionDuration.*:\s*string\s*=>/);
    });

    it('should handle zero seconds', () => {
      expect(componentSource).toMatch(/if\s*\(\s*seconds\s*===\s*0\s*\)/);
    });

    it('should handle hours and minutes', () => {
      expect(componentSource).toMatch(/const\s+hours\s*=/);
      expect(componentSource).toMatch(/const\s+minutes\s*=/);
    });
  });

  describe('formatSessionDate Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+formatSessionDate/);
    });

    it('should accept timestamp parameter', () => {
      expect(componentSource).toMatch(
        /formatSessionDate\s*=\s*\(\s*timestamp:\s*number\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(/formatSessionDate.*:\s*string\s*=>/);
    });

    it('should use toLocaleDateString', () => {
      expect(componentSource).toMatch(/toLocaleDateString/);
    });

    it('should format with month, day, year', () => {
      expect(componentSource).toMatch(/month:\s*['"]short['"]/);
      expect(componentSource).toMatch(/day:\s*['"]numeric['"]/);
      expect(componentSource).toMatch(/year:\s*['"]numeric['"]/);
    });
  });

  describe('formatSessionTime Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+formatSessionTime/);
    });

    it('should accept timestamp parameter', () => {
      expect(componentSource).toMatch(
        /formatSessionTime\s*=\s*\(\s*timestamp:\s*number\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(/formatSessionTime.*:\s*string\s*=>/);
    });

    it('should use toLocaleTimeString', () => {
      expect(componentSource).toMatch(/toLocaleTimeString/);
    });

    it('should format with hour and minute', () => {
      expect(componentSource).toMatch(/hour:\s*['"]numeric['"]/);
      expect(componentSource).toMatch(/minute:\s*['"]2-digit['"]/);
    });

    it('should use 12-hour format', () => {
      expect(componentSource).toMatch(/hour12:\s*true/);
    });
  });

  describe('formatThetaZScore Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+formatThetaZScore/);
    });

    it('should accept zscore parameter', () => {
      expect(componentSource).toMatch(
        /formatThetaZScore\s*=\s*\(\s*zscore:\s*number\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(/formatThetaZScore.*:\s*string\s*=>/);
    });

    it('should add sign prefix', () => {
      expect(componentSource).toMatch(
        /const\s+sign\s*=\s*zscore\s*>=\s*0\s*\?\s*['"\+]/
      );
    });

    it('should use toFixed for decimal places', () => {
      expect(componentSource).toMatch(/zscore\.toFixed\(2\)/);
    });
  });

  describe('getThetaColor Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+getThetaColor/);
    });

    it('should accept zscore parameter', () => {
      expect(componentSource).toMatch(
        /getThetaColor\s*=\s*\(\s*zscore:\s*number\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(/getThetaColor.*:\s*string\s*=>/);
    });

    it('should return blue for high z-scores (>= 1.0)', () => {
      expect(componentSource).toMatch(
        /zscore\s*>=\s*1\.0.*Colors\.status\.blue/
      );
    });

    it('should return green for good z-scores (>= 0.5)', () => {
      expect(componentSource).toMatch(
        /zscore\s*>=\s*0\.5.*Colors\.status\.green/
      );
    });

    it('should return yellow for neutral z-scores (>= 0)', () => {
      expect(componentSource).toMatch(
        /zscore\s*>=\s*0.*Colors\.status\.yellow/
      );
    });

    it('should return red for negative z-scores', () => {
      expect(componentSource).toMatch(/return\s+Colors\.status\.red/);
    });
  });

  describe('getSessionAccessibilityLabel Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(
        /export\s+const\s+getSessionAccessibilityLabel/
      );
    });

    it('should accept session parameter', () => {
      expect(componentSource).toMatch(
        /getSessionAccessibilityLabel\s*=\s*\(\s*session:\s*Session\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(
        /getSessionAccessibilityLabel.*:\s*string\s*=>/
      );
    });

    it('should include session type label', () => {
      expect(componentSource).toMatch(
        /getSessionTypeLabel\(session\.session_type\)/
      );
    });

    it('should include date and time', () => {
      expect(componentSource).toMatch(
        /formatSessionDate\(session\.start_time\)/
      );
      expect(componentSource).toMatch(
        /formatSessionTime\(session\.start_time\)/
      );
    });

    it('should include duration', () => {
      expect(componentSource).toMatch(
        /formatSessionDuration\(session\.duration_seconds\)/
      );
    });

    it('should include theta z-score', () => {
      expect(componentSource).toMatch(
        /formatThetaZScore\(session\.avg_theta_zscore\)/
      );
    });
  });

  describe('isSameDay Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+isSameDay/);
    });

    it('should accept two timestamp parameters', () => {
      expect(componentSource).toMatch(
        /isSameDay\s*=\s*\(\s*timestamp1:\s*number,\s*timestamp2:\s*number\s*\)/
      );
    });

    it('should return boolean', () => {
      expect(componentSource).toMatch(/isSameDay.*:\s*boolean\s*=>/);
    });

    it('should compare year, month, and date', () => {
      expect(componentSource).toMatch(/getFullYear\(\)/);
      expect(componentSource).toMatch(/getMonth\(\)/);
      expect(componentSource).toMatch(/getDate\(\)/);
    });
  });

  describe('getRelativeDateLabel Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+getRelativeDateLabel/);
    });

    it('should accept timestamp parameter', () => {
      expect(componentSource).toMatch(
        /getRelativeDateLabel\s*=\s*\(\s*timestamp:\s*number\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(/getRelativeDateLabel.*:\s*string\s*=>/);
    });

    it('should return Today for today timestamps', () => {
      expect(componentSource).toMatch(/return\s*['"]Today['"]/);
    });

    it('should return Yesterday for yesterday timestamps', () => {
      expect(componentSource).toMatch(/return\s*['"]Yesterday['"]/);
    });

    it('should fall back to formatSessionDate', () => {
      expect(componentSource).toMatch(
        /return\s+formatSessionDate\(timestamp\)/
      );
    });
  });

  describe('getStarRating Helper Function', () => {
    it('should be exported', () => {
      expect(componentSource).toMatch(/export\s+const\s+getStarRating/);
    });

    it('should accept rating parameter', () => {
      expect(componentSource).toMatch(
        /getStarRating\s*=\s*\(\s*rating:\s*number\s*\|\s*null\s*\)/
      );
    });

    it('should return string', () => {
      expect(componentSource).toMatch(/getStarRating.*:\s*string\s*=>/);
    });

    it('should return empty string for null rating', () => {
      expect(componentSource).toMatch(
        /if\s*\(\s*rating\s*===\s*null\s*\)\s*return\s*['"]['"];?/
      );
    });

    it('should use star characters', () => {
      expect(componentSource).toMatch(/['"]★['"]\.repeat/);
      expect(componentSource).toMatch(/['"]☆['"]\.repeat/);
    });
  });

  describe('EmptyState Component', () => {
    it('should be defined', () => {
      expect(componentSource).toMatch(/const\s+EmptyState/);
    });

    it('should accept testID prop', () => {
      expect(componentSource).toMatch(/EmptyState.*testID\?:\s*string/);
    });

    it('should have empty icon', () => {
      expect(componentSource).toMatch(/emptyIcon/);
    });

    it('should have empty title', () => {
      expect(componentSource).toMatch(/emptyTitle/);
      expect(componentSource).toMatch(/No Sessions Yet/);
    });

    it('should have empty message', () => {
      expect(componentSource).toMatch(/emptyMessage/);
      expect(componentSource).toMatch(/Complete your first session/);
    });
  });

  describe('SessionListItem Component', () => {
    it('should be defined', () => {
      expect(componentSource).toMatch(/const\s+SessionListItem/);
    });

    it('should accept session prop', () => {
      expect(componentSource).toMatch(
        /SessionListItem[\s\S]*?session:\s*Session/
      );
    });

    it('should accept onPress prop', () => {
      expect(componentSource).toMatch(/SessionListItem[\s\S]*?onPress\?:/);
    });

    it('should accept showDateHeader prop', () => {
      expect(componentSource).toMatch(
        /SessionListItem[\s\S]*?showDateHeader:\s*boolean/
      );
    });

    it('should accept testID prop', () => {
      expect(componentSource).toMatch(
        /SessionListItem[\s\S]*?testID\?:\s*string/
      );
    });

    it('should use TouchableOpacity for item container', () => {
      expect(componentSource).toMatch(
        /<TouchableOpacity[\s\S]*?style=\{styles\.itemContainer\}/
      );
    });

    it('should set activeOpacity', () => {
      expect(componentSource).toMatch(/activeOpacity=\{0\.7\}/);
    });

    it('should have accessibility role button', () => {
      expect(componentSource).toMatch(/accessibilityRole=["']button["']/);
    });

    it('should have accessibility hint', () => {
      expect(componentSource).toMatch(
        /accessibilityHint=["']Double tap to view session details["']/
      );
    });
  });

  describe('SessionListItem - Date Header', () => {
    it('should conditionally render date header', () => {
      expect(componentSource).toMatch(/showDateHeader\s*&&/);
    });

    it('should use dateHeader style', () => {
      expect(componentSource).toMatch(/style=\{styles\.dateHeader\}/);
    });

    it('should have accessibility role header', () => {
      expect(componentSource).toMatch(/accessibilityRole=["']header["']/);
    });

    it('should use getRelativeDateLabel', () => {
      expect(componentSource).toMatch(
        /getRelativeDateLabel\(session\.start_time\)/
      );
    });
  });

  describe('SessionListItem - Type Badge', () => {
    it('should render type badge', () => {
      expect(componentSource).toMatch(/typeBadge/);
    });

    it('should apply badge color dynamically', () => {
      expect(componentSource).toMatch(/backgroundColor:\s*badgeColor/);
    });

    it('should display session type label', () => {
      expect(componentSource).toMatch(
        /getSessionTypeLabel\(session\.session_type\)/
      );
    });
  });

  describe('SessionListItem - Stats Display', () => {
    it('should display duration', () => {
      expect(componentSource).toMatch(
        /formatSessionDuration\(session\.duration_seconds\)/
      );
    });

    it('should display avg theta z-score', () => {
      expect(componentSource).toMatch(
        /formatThetaZScore\(session\.avg_theta_zscore\)/
      );
    });

    it('should color theta z-score', () => {
      expect(componentSource).toMatch(/color:\s*thetaColor/);
    });

    it('should display entrainment frequency', () => {
      expect(componentSource).toMatch(
        /session\.entrainment_freq\.toFixed\(1\)/
      );
    });

    it('should display Hz unit', () => {
      expect(componentSource).toMatch(/Hz/);
    });
  });

  describe('SessionListItem - Rating Display', () => {
    it('should conditionally render rating', () => {
      expect(componentSource).toMatch(
        /session\.subjective_rating\s*!==\s*null/
      );
    });

    it('should use getStarRating', () => {
      expect(componentSource).toMatch(
        /getStarRating\(session\.subjective_rating\)/
      );
    });

    it('should use ratingStars style', () => {
      expect(componentSource).toMatch(/style=\{styles\.ratingStars\}/);
    });
  });

  describe('Context Integration', () => {
    it('should use useSession hook', () => {
      expect(componentSource).toMatch(
        /const\s*\{.*recentSessions.*\}\s*=\s*useSession\(\)/
      );
    });

    it('should destructure isRefreshing from context', () => {
      expect(componentSource).toMatch(/isRefreshing/);
    });

    it('should destructure refreshRecentSessions from context', () => {
      expect(componentSource).toMatch(/refreshRecentSessions/);
    });

    it('should use prop sessions if provided', () => {
      expect(componentSource).toMatch(/propSessions\s*\?\?\s*recentSessions/);
    });
  });

  describe('List Rendering', () => {
    it('should use FlatList', () => {
      expect(componentSource).toMatch(/<FlatList/);
    });

    it('should pass data prop', () => {
      expect(componentSource).toMatch(/data=\{sessions\}/);
    });

    it('should pass renderItem prop', () => {
      expect(componentSource).toMatch(/renderItem=\{renderItem\}/);
    });

    it('should pass keyExtractor prop', () => {
      expect(componentSource).toMatch(/keyExtractor=\{keyExtractor\}/);
    });

    it('should pass ListHeaderComponent', () => {
      expect(componentSource).toMatch(/ListHeaderComponent/);
    });

    it('should pass ListEmptyComponent', () => {
      expect(componentSource).toMatch(/ListEmptyComponent/);
    });

    it('should pass refreshControl', () => {
      expect(componentSource).toMatch(/refreshControl=\{refreshControl\}/);
    });

    it('should have accessibility role list', () => {
      expect(componentSource).toMatch(/accessibilityRole=["']list["']/);
    });

    it('should have accessibility label', () => {
      expect(componentSource).toMatch(
        /accessibilityLabel=["']Session history list["']/
      );
    });
  });

  describe('RefreshControl', () => {
    it('should use RefreshControl component', () => {
      expect(componentSource).toMatch(/<RefreshControl/);
    });

    it('should pass refreshing prop', () => {
      expect(componentSource).toMatch(/refreshing=\{isLoading\}/);
    });

    it('should pass onRefresh prop', () => {
      expect(componentSource).toMatch(/onRefresh=\{handleRefresh\}/);
    });

    it('should set tintColor', () => {
      expect(componentSource).toMatch(/tintColor=\{Colors\.primary\.main\}/);
    });

    it('should conditionally render based on showRefreshControl', () => {
      expect(componentSource).toMatch(/showRefreshControl\s*\?/);
    });
  });

  describe('maxItems Handling', () => {
    it('should apply maxItems limit using slice', () => {
      expect(componentSource).toMatch(/allSessions\.slice\(0,\s*maxItems\)/);
    });

    it('should check if maxItems is defined and positive', () => {
      expect(componentSource).toMatch(
        /maxItems\s*!==\s*undefined\s*&&\s*maxItems\s*>\s*0/
      );
    });

    it('should use useMemo for sessions array', () => {
      expect(componentSource).toMatch(
        /useMemo\(\s*\(\)\s*=>\s*\{[\s\S]*?maxItems[\s\S]*?\}/
      );
    });
  });

  describe('Date Header Logic', () => {
    it('should show date header for first item', () => {
      expect(componentSource).toMatch(/index\s*===\s*0/);
    });

    it('should show date header when day changes', () => {
      expect(componentSource).toMatch(
        /!isSameDay\(item\.start_time,\s*sessions\[index\s*-\s*1\]\.start_time\)/
      );
    });
  });

  describe('List Header Component', () => {
    it('should display session count', () => {
      expect(componentSource).toMatch(/sessions\.length/);
    });

    it('should handle singular/plural text', () => {
      expect(componentSource).toMatch(
        /sessions\.length\s*===\s*1\s*\?\s*['"]Session['"]\s*:\s*['"]Sessions['"]/
      );
    });

    it('should only show header when sessions exist', () => {
      expect(componentSource).toMatch(
        /sessions\.length\s*>\s*0\s*\?\s*ListHeaderComponent\s*:\s*null/
      );
    });
  });

  describe('Test IDs', () => {
    it('should have default testID', () => {
      expect(componentSource).toMatch(/testID\s*=\s*['"]session-list-view['"]/);
    });

    it('should pass testID to container', () => {
      expect(componentSource).toMatch(/testID=\{testID\}/);
    });

    it('should pass testID to FlatList', () => {
      expect(componentSource).toMatch(/testID=\{`\$\{testID\}-flatlist`\}/);
    });

    it('should pass testID to empty state', () => {
      expect(componentSource).toMatch(/testID=\{`\$\{testID\}-empty`\}/);
    });

    it('should pass testID to list items', () => {
      expect(componentSource).toMatch(
        /testID=\{`\$\{testID\}-item-\$\{index\}`\}/
      );
    });

    it('should pass testID to refresh control', () => {
      expect(componentSource).toMatch(
        /testID=\{`\$\{testID\}-refresh-control`\}/
      );
    });

    it('should pass testID to date headers', () => {
      expect(componentSource).toMatch(/testID=\{`\$\{testID\}-date-header`\}/);
    });

    it('should pass testID to touchable items', () => {
      expect(componentSource).toMatch(/testID=\{`\$\{testID\}-touchable`\}/);
    });
  });

  describe('Styling', () => {
    it('should use StyleSheet.create', () => {
      expect(componentSource).toMatch(/StyleSheet\.create/);
    });

    it('should have container style', () => {
      expect(componentSource).toMatch(/container:\s*\{/);
    });

    it('should have listContent style', () => {
      expect(componentSource).toMatch(/listContent:\s*\{/);
    });

    it('should have emptyListContent style', () => {
      expect(componentSource).toMatch(/emptyListContent:\s*\{/);
    });

    it('should have listHeader style', () => {
      expect(componentSource).toMatch(/listHeader:\s*\{/);
    });

    it('should have dateHeader style', () => {
      expect(componentSource).toMatch(/dateHeader:\s*\{/);
    });

    it('should have itemContainer style', () => {
      expect(componentSource).toMatch(/itemContainer:\s*\{/);
    });

    it('should have itemHeader style', () => {
      expect(componentSource).toMatch(/itemHeader:\s*\{/);
    });

    it('should have typeBadge style', () => {
      expect(componentSource).toMatch(/typeBadge:\s*\{/);
    });

    it('should have statRow style', () => {
      expect(componentSource).toMatch(/statRow:\s*\{/);
    });

    it('should have statItem style', () => {
      expect(componentSource).toMatch(/statItem:\s*\{/);
    });

    it('should have statLabel style', () => {
      expect(componentSource).toMatch(/statLabel:\s*\{/);
    });

    it('should have statValue style', () => {
      expect(componentSource).toMatch(/statValue:\s*\{/);
    });

    it('should have ratingRow style', () => {
      expect(componentSource).toMatch(/ratingRow:\s*\{/);
    });

    it('should have ratingStars style', () => {
      expect(componentSource).toMatch(/ratingStars:\s*\{/);
    });

    it('should have emptyContainer style', () => {
      expect(componentSource).toMatch(/emptyContainer:\s*\{/);
    });

    it('should have emptyIcon style', () => {
      expect(componentSource).toMatch(/emptyIcon:\s*\{/);
    });

    it('should have emptyTitle style', () => {
      expect(componentSource).toMatch(/emptyTitle:\s*\{/);
    });

    it('should have emptyMessage style', () => {
      expect(componentSource).toMatch(/emptyMessage:\s*\{/);
    });
  });

  describe('Theme Integration', () => {
    it('should use Colors.background.primary for container', () => {
      expect(componentSource).toMatch(
        /backgroundColor:\s*Colors\.background\.primary/
      );
    });

    it('should use Colors.surface.primary for items', () => {
      expect(componentSource).toMatch(
        /backgroundColor:\s*Colors\.surface\.primary/
      );
    });

    it('should use Colors.text.primary', () => {
      expect(componentSource).toMatch(/color:\s*Colors\.text\.primary/);
    });

    it('should use Colors.text.secondary', () => {
      expect(componentSource).toMatch(/color:\s*Colors\.text\.secondary/);
    });

    it('should use Colors.text.tertiary', () => {
      expect(componentSource).toMatch(/color:\s*Colors\.text\.tertiary/);
    });

    it('should use Colors.text.inverse for badge text', () => {
      expect(componentSource).toMatch(/color:\s*Colors\.text\.inverse/);
    });

    it('should use Spacing constants', () => {
      expect(componentSource).toMatch(/Spacing\.xs/);
      expect(componentSource).toMatch(/Spacing\.sm/);
      expect(componentSource).toMatch(/Spacing\.md/);
      expect(componentSource).toMatch(/Spacing\.lg/);
      expect(componentSource).toMatch(/Spacing\.xl/);
    });

    it('should use BorderRadius constants', () => {
      expect(componentSource).toMatch(/BorderRadius\.sm/);
      expect(componentSource).toMatch(/BorderRadius\.lg/);
    });

    it('should use Typography.fontSize constants', () => {
      expect(componentSource).toMatch(/Typography\.fontSize\.xs/);
      expect(componentSource).toMatch(/Typography\.fontSize\.sm/);
      expect(componentSource).toMatch(/Typography\.fontSize\.md/);
      expect(componentSource).toMatch(/Typography\.fontSize\.lg/);
      expect(componentSource).toMatch(/Typography\.fontSize\.xl/);
    });

    it('should use Typography.fontWeight constants', () => {
      expect(componentSource).toMatch(/Typography\.fontWeight\.medium/);
      expect(componentSource).toMatch(/Typography\.fontWeight\.semibold/);
    });

    it('should use Shadows constants', () => {
      expect(componentSource).toMatch(/\.\.\.Shadows\.sm/);
    });

    it('should use Colors.status for theta coloring', () => {
      expect(componentSource).toMatch(/Colors\.status\.blue/);
      expect(componentSource).toMatch(/Colors\.status\.green/);
      expect(componentSource).toMatch(/Colors\.status\.yellow/);
      expect(componentSource).toMatch(/Colors\.status\.red/);
    });
  });

  describe('Key Extractor', () => {
    it('should use useCallback for keyExtractor', () => {
      expect(componentSource).toMatch(/const\s+keyExtractor\s*=\s*useCallback/);
    });

    it('should use session id if available', () => {
      expect(componentSource).toMatch(/item\.id\s*\?\?\s*index/);
    });

    it('should prefix with session-', () => {
      expect(componentSource).toMatch(/`session-\$\{/);
    });
  });

  describe('Render Item', () => {
    it('should use useCallback for renderItem', () => {
      expect(componentSource).toMatch(/const\s+renderItem\s*=\s*useCallback/);
    });

    it('should destructure item and index', () => {
      expect(componentSource).toMatch(/\{\s*item,\s*index\s*\}/);
    });

    it('should use ListRenderItemInfo type', () => {
      expect(componentSource).toMatch(/ListRenderItemInfo<Session>/);
    });

    it('should return SessionListItem', () => {
      expect(componentSource).toMatch(/return\s*\(?\s*<SessionListItem/);
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc comment for component', () => {
      expect(componentSource).toMatch(
        /\/\*\*[\s\S]*?SessionListView\s+Component[\s\S]*?\*\//
      );
    });

    it('should describe newest first ordering', () => {
      expect(componentSource).toMatch(/newest\s+first/i);
    });

    it('should describe pull-to-refresh', () => {
      expect(componentSource).toMatch(/pull-to-refresh/i);
    });

    it('should describe empty state', () => {
      expect(componentSource).toMatch(/empty\s+state/i);
    });
  });
});

describe('SessionListView Functional Tests', () => {
  // Import the helper functions for functional testing
  const {
    getSessionTypeLabel,
    getSessionTypeBadgeColor,
    formatSessionDuration,
    formatSessionDate,
    formatSessionTime,
    formatThetaZScore,
    getThetaColor,
    isSameDay,
    getRelativeDateLabel,
    getStarRating,
    SESSION_TYPE_LABELS,
    SESSION_TYPE_COLORS,
  } = require('../src/components/SessionListView');

  describe('getSessionTypeLabel', () => {
    it('should return Calibration for calibration type', () => {
      expect(getSessionTypeLabel('calibration')).toBe('Calibration');
    });

    it('should return Quick Boost for quick_boost type', () => {
      expect(getSessionTypeLabel('quick_boost')).toBe('Quick Boost');
    });

    it('should return Custom for custom type', () => {
      expect(getSessionTypeLabel('custom')).toBe('Custom');
    });

    it('should return Scheduled for scheduled type', () => {
      expect(getSessionTypeLabel('scheduled')).toBe('Scheduled');
    });

    it('should return A/B Test for sham type', () => {
      expect(getSessionTypeLabel('sham')).toBe('A/B Test');
    });
  });

  describe('getSessionTypeBadgeColor', () => {
    it('should return a color string for each session type', () => {
      expect(typeof getSessionTypeBadgeColor('calibration')).toBe('string');
      expect(typeof getSessionTypeBadgeColor('quick_boost')).toBe('string');
      expect(typeof getSessionTypeBadgeColor('custom')).toBe('string');
      expect(typeof getSessionTypeBadgeColor('scheduled')).toBe('string');
      expect(typeof getSessionTypeBadgeColor('sham')).toBe('string');
    });

    it('should return different colors for different types', () => {
      const calibrationColor = getSessionTypeBadgeColor('calibration');
      const quickBoostColor = getSessionTypeBadgeColor('quick_boost');
      expect(calibrationColor).not.toBe(quickBoostColor);
    });
  });

  describe('formatSessionDuration', () => {
    it('should return 0m for 0 seconds', () => {
      expect(formatSessionDuration(0)).toBe('0m');
    });

    it('should return seconds for < 60 seconds', () => {
      expect(formatSessionDuration(30)).toBe('30s');
    });

    it('should return minutes for >= 60 seconds', () => {
      expect(formatSessionDuration(300)).toBe('5m');
    });

    it('should return minutes and seconds when applicable', () => {
      expect(formatSessionDuration(90)).toBe('1m 30s');
    });

    it('should return hours for >= 3600 seconds', () => {
      expect(formatSessionDuration(3600)).toBe('1h');
    });

    it('should return hours and minutes when applicable', () => {
      expect(formatSessionDuration(3900)).toBe('1h 5m');
    });
  });

  describe('formatSessionDate', () => {
    it('should return formatted date string', () => {
      const timestamp = new Date('2026-01-15T10:00:00').getTime();
      const result = formatSessionDate(timestamp);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2026');
    });
  });

  describe('formatSessionTime', () => {
    it('should return formatted time string', () => {
      const timestamp = new Date('2026-01-15T14:30:00').getTime();
      const result = formatSessionTime(timestamp);
      expect(result).toMatch(/2:30\s*PM/i);
    });

    it('should use 12-hour format', () => {
      const timestamp = new Date('2026-01-15T09:00:00').getTime();
      const result = formatSessionTime(timestamp);
      expect(result).toMatch(/9:00\s*AM/i);
    });
  });

  describe('formatThetaZScore', () => {
    it('should format positive z-score with plus sign', () => {
      expect(formatThetaZScore(1.25)).toBe('+1.25');
    });

    it('should format zero as +0.00', () => {
      expect(formatThetaZScore(0)).toBe('+0.00');
    });

    it('should format negative z-score with minus sign', () => {
      expect(formatThetaZScore(-0.5)).toBe('-0.50');
    });

    it('should round to 2 decimal places', () => {
      expect(formatThetaZScore(1.256)).toBe('+1.26');
    });
  });

  describe('getThetaColor', () => {
    it('should return blue for z-score >= 1.0', () => {
      const color = getThetaColor(1.0);
      expect(color).toContain('#');
    });

    it('should return green for z-score >= 0.5 and < 1.0', () => {
      const color = getThetaColor(0.5);
      expect(color).toContain('#');
    });

    it('should return yellow for z-score >= 0 and < 0.5', () => {
      const color = getThetaColor(0.2);
      expect(color).toContain('#');
    });

    it('should return red for negative z-score', () => {
      const color = getThetaColor(-0.5);
      expect(color).toContain('#');
    });

    it('should return different colors for different ranges', () => {
      const blue = getThetaColor(1.0);
      const green = getThetaColor(0.5);
      const yellow = getThetaColor(0.2);
      const red = getThetaColor(-0.5);

      expect(blue).not.toBe(green);
      expect(green).not.toBe(yellow);
      expect(yellow).not.toBe(red);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const timestamp1 = new Date('2026-01-15T10:00:00').getTime();
      const timestamp2 = new Date('2026-01-15T18:00:00').getTime();
      expect(isSameDay(timestamp1, timestamp2)).toBe(true);
    });

    it('should return false for different days', () => {
      const timestamp1 = new Date('2026-01-15T10:00:00').getTime();
      const timestamp2 = new Date('2026-01-16T10:00:00').getTime();
      expect(isSameDay(timestamp1, timestamp2)).toBe(false);
    });

    it('should return false for different months', () => {
      const timestamp1 = new Date('2026-01-15T10:00:00').getTime();
      const timestamp2 = new Date('2026-02-15T10:00:00').getTime();
      expect(isSameDay(timestamp1, timestamp2)).toBe(false);
    });

    it('should return false for different years', () => {
      const timestamp1 = new Date('2026-01-15T10:00:00').getTime();
      const timestamp2 = new Date('2025-01-15T10:00:00').getTime();
      expect(isSameDay(timestamp1, timestamp2)).toBe(false);
    });
  });

  describe('getRelativeDateLabel', () => {
    it('should return Today for today timestamps', () => {
      const now = Date.now();
      expect(getRelativeDateLabel(now)).toBe('Today');
    });

    it('should return Yesterday for yesterday timestamps', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(getRelativeDateLabel(yesterday)).toBe('Yesterday');
    });

    it('should return formatted date for older timestamps', () => {
      const oldDate = new Date('2025-01-01T10:00:00').getTime();
      const result = getRelativeDateLabel(oldDate);
      expect(result).toContain('Jan');
      expect(result).toContain('1');
      expect(result).toContain('2025');
    });
  });

  describe('getStarRating', () => {
    it('should return empty string for null rating', () => {
      expect(getStarRating(null)).toBe('');
    });

    it('should return 1 filled star for rating 1', () => {
      expect(getStarRating(1)).toBe('★☆☆☆☆');
    });

    it('should return 3 filled stars for rating 3', () => {
      expect(getStarRating(3)).toBe('★★★☆☆');
    });

    it('should return 5 filled stars for rating 5', () => {
      expect(getStarRating(5)).toBe('★★★★★');
    });
  });

  describe('SESSION_TYPE_LABELS constant', () => {
    it('should have all session types', () => {
      expect(SESSION_TYPE_LABELS).toHaveProperty('calibration');
      expect(SESSION_TYPE_LABELS).toHaveProperty('quick_boost');
      expect(SESSION_TYPE_LABELS).toHaveProperty('custom');
      expect(SESSION_TYPE_LABELS).toHaveProperty('scheduled');
      expect(SESSION_TYPE_LABELS).toHaveProperty('sham');
    });

    it('should have string values', () => {
      Object.values(SESSION_TYPE_LABELS).forEach((label) => {
        expect(typeof label).toBe('string');
      });
    });
  });

  describe('SESSION_TYPE_COLORS constant', () => {
    it('should have all session types', () => {
      expect(SESSION_TYPE_COLORS).toHaveProperty('calibration');
      expect(SESSION_TYPE_COLORS).toHaveProperty('quick_boost');
      expect(SESSION_TYPE_COLORS).toHaveProperty('custom');
      expect(SESSION_TYPE_COLORS).toHaveProperty('scheduled');
      expect(SESSION_TYPE_COLORS).toHaveProperty('sham');
    });

    it('should have string values (colors)', () => {
      Object.values(SESSION_TYPE_COLORS).forEach((color) => {
        expect(typeof color).toBe('string');
      });
    });
  });
});
