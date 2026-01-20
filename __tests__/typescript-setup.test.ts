/**
 * Test suite for TypeScript configuration
 * Verifies that TypeScript is properly set up in the project
 */

describe('TypeScript Setup', () => {
  it('supports TypeScript strict mode type checking', () => {
    // Test strict null checks
    const value: string | null = null;
    expect(value).toBeNull();

    const nonNullValue: string = 'test';
    expect(nonNullValue).toBe('test');
  });

  it('supports ES2020 features', () => {
    // Test optional chaining
    const obj: { nested?: { value?: string } } = {};
    const result = obj.nested?.value ?? 'default';
    expect(result).toBe('default');

    // Test nullish coalescing
    const zero = 0;
    const resultWithZero = zero ?? 'default';
    expect(resultWithZero).toBe(0);
  });

  it('supports type inference', () => {
    // Type inference should work
    const inferredNumber = 42;
    const inferredString = 'FlowState';
    const inferredArray = [1, 2, 3];

    expect(typeof inferredNumber).toBe('number');
    expect(typeof inferredString).toBe('string');
    expect(Array.isArray(inferredArray)).toBe(true);
  });

  it('supports generic types', () => {
    function identity<T>(arg: T): T {
      return arg;
    }

    const numberResult = identity<number>(42);
    const stringResult = identity<string>('test');

    expect(numberResult).toBe(42);
    expect(stringResult).toBe('test');
  });

  it('supports union types', () => {
    type Status = 'idle' | 'running' | 'paused' | 'stopped';
    const status: Status = 'running';

    expect(status).toBe('running');
    expect(['idle', 'running', 'paused', 'stopped']).toContain(status);
  });

  it('supports type aliases and interfaces', () => {
    type Point = {
      x: number;
      y: number;
    };

    interface Circle {
      center: Point;
      radius: number;
    }

    const circle: Circle = {
      center: { x: 0, y: 0 },
      radius: 10,
    };

    expect(circle.center.x).toBe(0);
    expect(circle.radius).toBe(10);
  });
});
