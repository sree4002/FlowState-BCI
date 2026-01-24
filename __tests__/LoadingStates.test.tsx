/**
 * Tests for Loading States and Skeleton Components
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import {
  LoadingSpinner,
  SkeletonBox,
  SkeletonCard,
  SkeletonList,
  SessionSkeleton,
  DashboardSkeleton,
  ChartSkeleton,
} from '../src/components/LoadingStates';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(<LoadingSpinner />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should render with custom testID', () => {
    const { getByTestId } = render(<LoadingSpinner testID="custom-spinner" />);
    expect(getByTestId('custom-spinner')).toBeTruthy();
  });

  it('should display message when provided', () => {
    const { getByText } = render(<LoadingSpinner message="Loading data..." />);
    expect(getByText('Loading data...')).toBeTruthy();
  });

  it('should render full screen when fullScreen is true', () => {
    const { getByTestId } = render(<LoadingSpinner fullScreen={true} />);
    const container = getByTestId('loading-spinner');
    expect(container).toBeTruthy();
  });

  it('should accept different sizes', () => {
    const { rerender, getByTestId } = render(<LoadingSpinner size="small" />);
    expect(getByTestId('loading-spinner')).toBeTruthy();

    rerender(<LoadingSpinner size="large" />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});

describe('SkeletonBox', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(<SkeletonBox />);
    expect(getByTestId('skeleton-box')).toBeTruthy();
  });

  it('should render with custom testID', () => {
    const { getByTestId } = render(<SkeletonBox testID="custom-skeleton" />);
    expect(getByTestId('custom-skeleton')).toBeTruthy();
  });

  it('should accept numeric width', () => {
    const { getByTestId } = render(<SkeletonBox width={100} />);
    expect(getByTestId('skeleton-box')).toBeTruthy();
  });

  it('should accept percentage width', () => {
    const { getByTestId } = render(<SkeletonBox width="50%" />);
    expect(getByTestId('skeleton-box')).toBeTruthy();
  });

  it('should accept custom height', () => {
    const { getByTestId } = render(<SkeletonBox height={50} />);
    expect(getByTestId('skeleton-box')).toBeTruthy();
  });

  it('should accept custom border radius', () => {
    const { getByTestId } = render(<SkeletonBox borderRadius={20} />);
    expect(getByTestId('skeleton-box')).toBeTruthy();
  });

  it('should accept custom style', () => {
    const { getByTestId } = render(
      <SkeletonBox style={{ marginTop: 10 }} />
    );
    expect(getByTestId('skeleton-box')).toBeTruthy();
  });
});

describe('SkeletonCard', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(<SkeletonCard />);
    expect(getByTestId('skeleton-card')).toBeTruthy();
  });

  it('should render with custom testID', () => {
    const { getByTestId } = render(<SkeletonCard testID="custom-card" />);
    expect(getByTestId('custom-card')).toBeTruthy();
  });

  it('should render specified number of lines', () => {
    const { getByTestId } = render(<SkeletonCard lines={5} />);
    expect(getByTestId('skeleton-card')).toBeTruthy();
  });

  it('should show avatar when showAvatar is true', () => {
    const { getByTestId } = render(<SkeletonCard showAvatar={true} />);
    expect(getByTestId('skeleton-card')).toBeTruthy();
  });

  it('should hide avatar when showAvatar is false', () => {
    const { getByTestId } = render(<SkeletonCard showAvatar={false} />);
    expect(getByTestId('skeleton-card')).toBeTruthy();
  });
});

describe('SkeletonList', () => {
  it('should render with default count', () => {
    const { getByTestId } = render(<SkeletonList />);
    expect(getByTestId('skeleton-list')).toBeTruthy();
  });

  it('should render specified number of items', () => {
    const { getByTestId } = render(<SkeletonList count={3} />);
    expect(getByTestId('skeleton-list')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-0')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-1')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-2')).toBeTruthy();
  });

  it('should pass showAvatars to child cards', () => {
    const { getByTestId } = render(
      <SkeletonList count={2} showAvatars={true} />
    );
    expect(getByTestId('skeleton-list')).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(<SkeletonList testID="custom-list" />);
    expect(getByTestId('custom-list')).toBeTruthy();
  });
});

describe('SessionSkeleton', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(<SessionSkeleton />);
    expect(getByTestId('session-skeleton')).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(<SessionSkeleton testID="custom-session" />);
    expect(getByTestId('custom-session')).toBeTruthy();
  });
});

describe('DashboardSkeleton', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(<DashboardSkeleton />);
    expect(getByTestId('dashboard-skeleton')).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(
      <DashboardSkeleton testID="custom-dashboard" />
    );
    expect(getByTestId('custom-dashboard')).toBeTruthy();
  });
});

describe('ChartSkeleton', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(<ChartSkeleton />);
    expect(getByTestId('chart-skeleton')).toBeTruthy();
  });

  it('should accept custom height', () => {
    const { getByTestId } = render(<ChartSkeleton height={300} />);
    expect(getByTestId('chart-skeleton')).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(<ChartSkeleton testID="custom-chart" />);
    expect(getByTestId('custom-chart')).toBeTruthy();
  });
});
