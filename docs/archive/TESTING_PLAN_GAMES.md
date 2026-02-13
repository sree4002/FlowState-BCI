# Cognitive Games Testing Plan

## Overview
This document outlines the comprehensive testing strategy for the cognitive games feature in FlowState BCI. Tests will be written incrementally as the Developer Agent completes each phase.

---

## Test Infrastructure Analysis

### Jest Configuration
- **Test runner**: Jest with ts-jest preset
- **Test environment**: jsdom
- **Transform**: TypeScript files with tsx/jsx support
- **Coverage target**: >80% for game logic
- **Test timeout**: 10 seconds
- **Workers**: 1 (to avoid database conflicts)

### Mock Infrastructure
All React Native and Expo modules are mocked:
- `expo-sqlite`: Mock database operations
- `expo-av`: Mock audio playback
- `expo-haptics`: Mock haptic feedback
- `react-native`: Mock platform-specific components
- `@react-navigation/native`: Mock navigation
- `@testing-library/react-native`: Component testing utilities

### Test File Organization
All tests live in `__tests__/` directory at project root:
- Unit tests: `__tests__/[feature-name].test.ts`
- Component tests: `__tests__/[ComponentName].test.tsx`
- Integration tests: `__tests__/[feature-name]-integration.test.ts`

---

## Phase-by-Phase Testing Strategy

### Phase 1: Foundation Tests (Database & Types)

#### 1.1 Type Tests: `__tests__/games-types.test.ts`
**Purpose**: Validate game type definitions and interfaces

```typescript
// Test coverage:
- GameType enum values
- GameMode enum values
- GameSession interface conformance
- GameTrial interface conformance
- DifficultyLevel (0-10 range)
- GameConfig interface
- GameResult interface
```

**Implementation**: After Developer Agent creates `/src/types/games.ts`

#### 1.2 Database Tests: `__tests__/database-games.test.ts`
**Purpose**: Test all game database CRUD operations

```typescript
// Test coverage:
- insertGameSession() - insert new game session
- getGameSessionById() - retrieve by ID
- getGameSessionsByType() - filter by game type
- getGameSessionsByMode() - filter by mode
- getGameSessionsByDateRange() - date filtering
- updateGameSession() - update session fields
- deleteGameSession() - delete single session
- getGameStats() - aggregate statistics
- insertGameTrial() - insert trial data
- getTrialsBySessionId() - get all trials for session
- updateGameTrial() - update trial data
- Foreign key constraints (session_id references sessions)
- Cascade delete behavior
- Null handling for optional fields
- Timestamp accuracy
- JSON storage for trial_data
```

**Edge cases**:
- Null session_id (standalone games)
- Invalid foreign key references
- Duplicate session IDs
- Very large trial_data JSON
- Concurrent inserts

**Implementation**: After Developer Agent creates migrations 004 and 005

#### 1.3 Migration Tests: `__tests__/database-migrations-games.test.ts`
**Purpose**: Verify game table migrations run correctly

```typescript
// Test coverage:
- Migration 004: game_sessions table created
- Migration 005: game_trials table created
- Indexes created correctly
- Foreign key constraints applied
- Check constraints enforced
- Rollback functionality
- Idempotency (running twice)
```

**Implementation**: After Developer Agent creates migration files

---

### Phase 2: Game Logic Tests

#### 2.1 Adaptive Difficulty Manager: `__tests__/AdaptiveDifficultyManager.test.ts`
**Purpose**: Test Elo-based difficulty adaptation

```typescript
// Test coverage:
- calculateNewDifficulty() - basic calculation
- Elo rating updates based on accuracy
- Difficulty scaling (0-10 range)
- Rating clamping at boundaries
- Win/loss determination (>70% accuracy = win)
- K-factor adjustment
- Difficulty step size
- Rating convergence over multiple games
- Edge case: 0% accuracy
- Edge case: 100% accuracy
- Edge case: 50% accuracy (even match)
- Rating persistence across sessions
```

**Test pattern**:
```typescript
describe('AdaptiveDifficultyManager', () => {
  let manager: AdaptiveDifficultyManager;

  beforeEach(() => {
    manager = new AdaptiveDifficultyManager();
  });

  it('should increase difficulty after high accuracy', () => {
    const result = manager.calculateNewDifficulty({
      currentDifficulty: 5,
      accuracy: 0.9,
      avgResponseTime: 1500,
    });
    expect(result.newDifficulty).toBeGreaterThan(5);
  });
});
```

**Implementation**: After Developer Agent creates `/src/services/games/AdaptiveDifficultyManager.ts`

#### 2.2 Word Recall Game: `__tests__/WordRecallGame.test.ts`
**Purpose**: Test word recall game logic

```typescript
// Test coverage:
- generateWordList() - creates appropriate word lists
- Word list size scales with difficulty (5-15 words)
- No duplicate words in list
- calculateScore() - scoring with order bonus
- Correct recall detection
- Order bonus calculation (10% extra)
- Phase transitions (study → delay → recall)
- Timing constraints (study time, delay time)
- Response validation
- Edge case: empty response
- Edge case: all correct words
- Edge case: all wrong words
- Edge case: correct words wrong order
- Edge case: duplicate words in response
```

**Implementation**: After Developer Agent creates `/src/services/games/WordRecallGame.ts`

#### 2.3 N-Back Game: `__tests__/NBackGame.test.ts`
**Purpose**: Test n-back game logic

```typescript
// Test coverage:
- generateSequence() - position and audio sequences
- Match detection for position matches
- Match detection for audio matches
- Match detection for dual matches (both)
- Sequence length appropriate for difficulty
- n-back level increases with difficulty (1-back to 4-back)
- Response timing validation
- False positive detection
- False negative detection
- Score calculation
- Edge case: n=1 (1-back)
- Edge case: n=4 (4-back)
- Edge case: rapid consecutive responses
- Edge case: no response
- Edge case: all matches
- Edge case: no matches
```

**Implementation**: After Developer Agent creates `/src/services/games/NBackGame.ts`

#### 2.4 Cognitive Game Engine: `__tests__/CognitiveGameEngine.test.ts`
**Purpose**: Test base game engine functionality

```typescript
// Test coverage:
- Trial management (create, record, complete)
- State transitions (idle → running → paused → completed)
- Timer management
- Score calculation
- Accuracy calculation
- Response time tracking
- Game completion detection
- Pause/resume functionality
- Early termination
- Edge case: pause during trial
- Edge case: resume after long pause
- Edge case: complete without trials
```

**Implementation**: After Developer Agent creates `/src/services/games/CognitiveGameEngine.ts`

---

### Phase 3: Integration Tests

#### 3.1 Session-Game Integration: `__tests__/SessionGameIntegration.test.ts`
**Purpose**: Test integration between game sessions and EEG sessions

```typescript
// Test coverage:
- During-session mode (game + theta monitoring)
- Pre/post session mode (baseline + improvement)
- Standalone mode (no EEG)
- Theta correlation calculations
- Session data merging
- Game session linked to EEG session
- Cognitive metrics storage
- Edge case: session without theta data
- Edge case: game longer than session
- Edge case: disconnection during game
```

**Implementation**: After Developer Agent completes session integration

#### 3.2 Games Context: `__tests__/GamesContext.test.tsx`
**Purpose**: Test GamesContext state management

```typescript
// Test coverage:
- Context provider setup
- useGames hook throws error outside provider
- Initial state values
- startGame() action
- recordTrialResponse() action
- pauseGame() action
- resumeGame() action
- endGame() action
- State updates propagate correctly
- Async operations complete
- Error handling
- Multiple concurrent games (should prevent)
- Edge case: pause already paused game
- Edge case: resume already running game
- Edge case: end already ended game
```

**Test pattern** (following existing context tests):
```typescript
describe('GamesContext', () => {
  it('should throw error when useGames is called outside provider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useGames());
    }).toThrow('useGames must be used within a GamesProvider');

    console.error = originalError;
  });

  it('should start a game successfully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GamesProvider>{children}</GamesProvider>
    );

    const { result } = renderHook(() => useGames(), { wrapper });

    await act(async () => {
      await result.current.startGame({
        gameType: 'word_recall',
        mode: 'standalone',
        difficulty: 5,
      });
    });

    expect(result.current.gameState).toBe('running');
    expect(result.current.activeGame).not.toBeNull();
  });
});
```

**Implementation**: After Developer Agent creates `/src/contexts/GamesContext.tsx`

---

### Phase 4-6: Component & Screen Tests

#### 4.1 Component Tests
**Location**: `__tests__/[ComponentName].test.tsx`

**Components to test**:
1. `GameCard.test.tsx` - Game selection cards
2. `DifficultySelector.test.tsx` - Difficulty slider
3. `ScoreDisplay.test.tsx` - Score visualization
4. `GameTimer.test.tsx` - Countdown timer
5. `TrialFeedback.test.tsx` - Trial result feedback
6. `GameProgressBar.test.tsx` - Progress indicator
7. `WordList.test.tsx` - Word display component
8. `NBackGrid.test.tsx` - N-back game grid

**Test pattern** (following existing component tests):
```typescript
import { render } from '@testing-library/react-native';

describe('GameCard', () => {
  it('should render game title', () => {
    const { getByText } = render(
      <GameCard gameType="word_recall" title="Word Recall" />
    );
    expect(getByText('Word Recall')).toBeTruthy();
  });

  it('should have testID on container', () => {
    const { getByTestId } = render(
      <GameCard gameType="word_recall" testID="game-card" />
    );
    expect(getByTestId('game-card')).toBeTruthy();
  });
});
```

#### 4.2 Screen Tests
**Location**: `__tests__/[ScreenName].test.tsx`

**Screens to test**:
1. `GameHubScreen.test.tsx` - Main games hub
2. `WordRecallGameScreen.test.tsx` - Word recall gameplay
3. `NBackGameScreen.test.tsx` - N-back gameplay
4. `GameResultsScreen.test.tsx` - Results display
5. `GameHistoryScreen.test.tsx` - Past games list

**Test coverage**:
- Navigation flows
- User interactions (button presses, swipes)
- Loading states
- Error states
- Empty states
- Data fetching
- Screen transitions

#### 4.3 Navigation Tests
**Location**: `__tests__/GamesNavigator.test.tsx`

```typescript
// Test coverage:
- All routes accessible
- Navigation params passed correctly
- Back navigation works
- Deep linking to game screens
- Navigation state persistence
```

---

## Test Execution Strategy

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npx jest --testPathPattern=AdaptiveDifficultyManager

# Run tests with coverage
npx jest --coverage

# Run tests in watch mode
npx jest --watch

# TypeScript type checking
npm run test:tsc
```

### Coverage Requirements
- **Game logic**: >80% coverage
- **Database operations**: >90% coverage
- **Context**: >85% coverage
- **Components**: >70% coverage

### Test Order
Tests should be written immediately after each phase:
1. **Phase 1 complete** → Write tests 1.1-1.3
2. **Phase 2 complete** → Write tests 2.1-2.4
3. **Phase 3 complete** → Write tests 3.1-3.2
4. **Phases 4-6 complete** → Write tests 4.1-4.3

---

## Edge Cases Checklist

### Database Edge Cases
- [ ] Null session_id (standalone games)
- [ ] Invalid foreign key references
- [ ] Duplicate session IDs
- [ ] Very large trial_data JSON
- [ ] Concurrent inserts
- [ ] Database errors/failures

### Game Logic Edge Cases
- [ ] 0% accuracy
- [ ] 100% accuracy
- [ ] Boundary difficulty values (0, 10)
- [ ] Empty responses
- [ ] Duplicate responses
- [ ] Very long response times
- [ ] Very short response times
- [ ] Pause during critical moment
- [ ] Network interruption

### Context Edge Cases
- [ ] Multiple concurrent games (should prevent)
- [ ] State updates during unmount
- [ ] Rapid consecutive actions
- [ ] Context unmount during async operation

### UI Edge Cases
- [ ] Rapid button presses
- [ ] Navigation during game
- [ ] Background/foreground transitions
- [ ] Screen rotation
- [ ] Low memory conditions

---

## Test Templates

### Unit Test Template
```typescript
import { FeatureName } from '../src/services/FeatureName';

describe('FeatureName', () => {
  let instance: FeatureName;

  beforeEach(() => {
    instance = new FeatureName();
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      const result = instance.methodName(validInput);
      expect(result).toBe(expectedOutput);
    });

    it('should handle edge case', () => {
      const result = instance.methodName(edgeInput);
      expect(result).toBe(expectedOutput);
    });

    it('should throw on invalid input', () => {
      expect(() => instance.methodName(invalidInput)).toThrow();
    });
  });
});
```

### Database Test Template
```typescript
import * as SQLite from 'expo-sqlite';
import { initializeDatabase, dropAllTables } from '../src/services/database';
import { insertGameSession, getGameSessionById } from '../src/services/gameDatabase';

describe('gameDatabase', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    const result = initializeDatabase();
    db = result.db;
    // Clean game tables
    db.execSync('DELETE FROM game_sessions');
    db.execSync('DELETE FROM game_trials');
  });

  afterEach(() => {
    dropAllTables(db);
  });

  describe('insertGameSession', () => {
    it('should insert a game session successfully', () => {
      const session = {
        game_type: 'word_recall',
        mode: 'standalone',
        difficulty: 5,
        // ... other fields
      };

      const id = insertGameSession(db, session);
      expect(id).toBeGreaterThan(0);

      const retrieved = getGameSessionById(db, id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.game_type).toBe('word_recall');
    });
  });
});
```

### Context Test Template
```typescript
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { GamesProvider, useGames } from '../src/contexts/GamesContext';

describe('GamesContext', () => {
  it('should provide initial state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GamesProvider>{children}</GamesProvider>
    );

    const { result } = renderHook(() => useGames(), { wrapper });

    expect(result.current.gameState).toBe('idle');
    expect(result.current.activeGame).toBeNull();
  });

  it('should update state on action', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GamesProvider>{children}</GamesProvider>
    );

    const { result } = renderHook(() => useGames(), { wrapper });

    await act(async () => {
      await result.current.startGame({
        gameType: 'word_recall',
        mode: 'standalone',
        difficulty: 5,
      });
    });

    expect(result.current.gameState).toBe('running');
  });
});
```

### Component Test Template
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameCard } from '../src/components/games/GameCard';

describe('GameCard', () => {
  it('should render component', () => {
    const { getByTestId } = render(
      <GameCard gameType="word_recall" testID="game-card" />
    );
    expect(getByTestId('game-card')).toBeTruthy();
  });

  it('should handle press event', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <GameCard gameType="word_recall" onPress={onPress} testID="game-card" />
    );

    fireEvent.press(getByTestId('game-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

---

## Success Criteria

### Code Coverage
- [ ] >80% coverage for game logic
- [ ] >90% coverage for database operations
- [ ] >85% coverage for context
- [ ] >70% coverage for components

### Test Quality
- [ ] All tests pass with `npm test`
- [ ] No TypeScript errors in test files
- [ ] Edge cases are covered
- [ ] Tests run quickly (<30s total)
- [ ] No flaky tests (tests pass consistently)

### Documentation
- [ ] All test files have clear describe blocks
- [ ] Complex tests have explanatory comments
- [ ] Edge cases are documented in tests

### Integration
- [ ] Tests follow existing patterns
- [ ] Mocks are consistent with codebase
- [ ] Test utilities are reused

---

## Monitoring Developer Agent Progress

### How to Monitor
1. Check git commits: `git log --oneline`
2. Look for phase completion messages
3. Review newly created files in `/src/services/games/`

### Trigger Points for Writing Tests
- **Trigger 1**: Files created in `/src/types/games.ts` → Write test 1.1
- **Trigger 2**: Migration files 004/005 created → Write tests 1.2, 1.3
- **Trigger 3**: Game service files created → Write tests 2.1-2.4
- **Trigger 4**: Context file created → Write tests 3.1-3.2
- **Trigger 5**: Component files created → Write tests 4.1-4.3

### Communication with Developer Agent
- Monitor their commits and PRs
- Write tests immediately after phase completion
- Report test failures if implementation doesn't match spec
- Suggest fixes if tests reveal bugs

---

## Next Steps

1. **Monitor Developer Agent**: Watch for Phase 1 completion (types, database, migrations)
2. **Write Foundation Tests**: Immediately write tests 1.1-1.3 when Phase 1 is done
3. **Verify Coverage**: Run `npx jest --coverage` to ensure targets are met
4. **Iterate**: Continue for each subsequent phase

**Status**: Ready to begin testing as soon as Developer Agent starts implementation.
