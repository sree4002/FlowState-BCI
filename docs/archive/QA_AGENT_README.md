# QA/Testing Agent - Quick Reference

## Mission
Write comprehensive tests for the cognitive games feature as the Developer Agent completes each phase.

---

## Quick Start

### Check Developer Agent Progress
```bash
# Check recent commits
git log --oneline -10

# Check for new files
git status

# Look for phase completion markers
git log --grep="Phase [0-9]"
```

### Run Tests
```bash
# Run all tests
npm test

# Run specific test file
npx jest --testPathPattern=AdaptiveDifficultyManager

# Run with coverage
npx jest --coverage

# TypeScript check
npm run test:tsc

# Watch mode
npx jest --watch
```

---

## Test Files Created

### Phase 1: Foundation (Database & Types)
- ✅ `__tests__/games-types.test.ts` - Type validation
- ✅ `__tests__/database-games.test.ts` - CRUD operations
- ✅ `__tests__/database-migrations-games.test.ts` - Migrations 004 & 005

**Status**: Scaffolded, awaiting Developer Agent implementation

**Trigger**: Watch for:
- `/src/types/games.ts`
- `/src/services/gameDatabase.ts`
- `/src/services/migrations/004_*.ts`
- `/src/services/migrations/005_*.ts`

### Phase 2: Game Logic
- ✅ `__tests__/AdaptiveDifficultyManager.test.ts` - Elo difficulty
- ✅ `__tests__/WordRecallGame.test.ts` - Word recall logic
- ✅ `__tests__/NBackGame.test.ts` - N-back logic
- ⏳ `__tests__/CognitiveGameEngine.test.ts` - Base game engine (TODO)

**Status**: Scaffolded, awaiting Developer Agent implementation

**Trigger**: Watch for:
- `/src/services/games/AdaptiveDifficultyManager.ts`
- `/src/services/games/WordRecallGame.ts`
- `/src/services/games/NBackGame.ts`
- `/src/services/games/CognitiveGameEngine.ts`

### Phase 3: Integration
- ✅ `__tests__/GamesContext.test.tsx` - Context state management
- ⏳ `__tests__/SessionGameIntegration.test.ts` - EEG session integration (TODO)

**Status**: Partially scaffolded

**Trigger**: Watch for:
- `/src/contexts/GamesContext.tsx`
- Session integration code

### Phase 4-6: Components & Screens
- ⏳ Component tests (TODO after components are created)
- ⏳ Screen tests (TODO after screens are created)
- ⏳ Navigation tests (TODO after navigation is implemented)

---

## Test Implementation Workflow

### 1. Monitor for New Files
```bash
# Set up file watcher (or check manually)
watch -n 5 'git status'
```

### 2. When Developer Agent Completes a Phase

**Phase 1 Complete** (Types & Database):
1. Implement `__tests__/games-types.test.ts`
2. Implement `__tests__/database-games.test.ts`
3. Implement `__tests__/database-migrations-games.test.ts`
4. Run tests: `npx jest --testPathPattern=games`

**Phase 2 Complete** (Game Logic):
1. Implement `__tests__/AdaptiveDifficultyManager.test.ts`
2. Implement `__tests__/WordRecallGame.test.ts`
3. Implement `__tests__/NBackGame.test.ts`
4. Run tests: `npx jest --testPathPattern="AdaptiveDifficulty|WordRecall|NBack"`

**Phase 3 Complete** (Integration):
1. Implement `__tests__/GamesContext.test.tsx`
2. Implement `__tests__/SessionGameIntegration.test.ts`
3. Run tests: `npx jest --testPathPattern="GamesContext|SessionGame"`

### 3. Test Implementation Pattern

For each test file:
1. Read the implementation file
2. Replace `it.todo()` with actual tests
3. Follow existing test patterns in codebase
4. Import necessary dependencies
5. Create test data helpers
6. Test happy path first
7. Add edge cases
8. Run tests and verify they pass
9. Check coverage: `npx jest --coverage`

---

## Test Templates Reference

### Database Test
```typescript
import * as SQLite from 'expo-sqlite';
import { initializeDatabase, dropAllTables } from '../src/services/database';
import { insertGameSession, getGameSessionById } from '../src/services/gameDatabase';

describe('gameDatabase', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    const result = initializeDatabase();
    db = result.db;
    db.execSync('DELETE FROM game_sessions');
  });

  afterEach(() => {
    dropAllTables(db);
  });

  it('should insert game session', () => {
    const session = { /* ... */ };
    const id = insertGameSession(db, session);
    expect(id).toBeGreaterThan(0);
  });
});
```

### Context Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { GamesProvider, useGames } from '../src/contexts/GamesContext';

describe('GamesContext', () => {
  it('should start game', async () => {
    const wrapper = ({ children }) => (
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

### Component Test
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { GameCard } from '../src/components/games/GameCard';

describe('GameCard', () => {
  it('should render', () => {
    const { getByTestId } = render(
      <GameCard gameType="word_recall" testID="card" />
    );
    expect(getByTestId('card')).toBeTruthy();
  });
});
```

---

## Coverage Targets

- **Game logic**: >80%
- **Database operations**: >90%
- **Context**: >85%
- **Components**: >70%

Check with: `npx jest --coverage`

---

## Common Issues & Solutions

### Issue: Tests fail with "Cannot find module"
**Solution**: Check imports are correct, file paths are absolute

### Issue: Database tests fail with "table doesn't exist"
**Solution**: Ensure migrations are run in beforeEach

### Issue: Context tests fail with "hook called outside provider"
**Solution**: Wrap renderHook with provider wrapper

### Issue: Tests timeout
**Solution**: Increase timeout in jest.config.js or use `jest.setTimeout()`

---

## Next Steps

1. ✅ Test infrastructure analyzed
2. ✅ Test plan documented
3. ✅ Test scaffolds created for Phases 1-3
4. ⏳ **CURRENT**: Monitor Developer Agent for Phase 1 completion
5. ⏳ Implement Phase 1 tests when ready
6. ⏳ Continue for subsequent phases

---

## Communication with Developer Agent

### What to Report
- ✅ Test failures that reveal bugs
- ✅ Missing functionality discovered during testing
- ✅ Edge cases that need handling
- ✅ Coverage gaps

### What NOT to Report
- ❌ Stylistic preferences
- ❌ Premature optimization suggestions
- ❌ Tests for unimplemented features

---

## Status Check

**Last Updated**: 2026-02-06

**Scaffolded Test Files**: 7
**Implemented Test Files**: 0 (waiting for Developer Agent)
**Coverage**: N/A (no implementation yet)

**Ready to begin testing as soon as Developer Agent starts Phase 1.**
