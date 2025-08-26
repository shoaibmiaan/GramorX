// components/design-system/index.tsx
// Central barrel for the Design System.
// Usage: import { Button, Card, Container, ... } from '@/components/design-system';

// ——— Primitives
export { Button } from './Button';
export { Card } from './Card';
export { Container } from './Container';
export { Ribbon } from './Ribbon';
export { Badge } from './Badge';
export { GradientText } from './GradientText';
export { AudioBar } from './AudioBar';

// ——— Forms
export { Input } from './Input';

// ——— Feedback
export { Alert } from './Alert';
export { ToastProvider } from './Toast';

// ——— Navigation
export { NavLink } from './NavLink';
export { SocialIconLink } from './SocialIconLink';
export { UserMenu } from './UserMenu';

// ——— Utilities
export { ThemeToggle } from './ThemeToggle';
export { Timer } from './Timer';
export { StreakIndicator } from './StreakIndicator';

// ——— IELTS (export only if these exist; otherwise comment out)
// Listening
export { default as AudioSectionsPlayer } from '../listening/AudioSectionsPlayer';
export { default as AnswerReview } from '../listening/AnswerReview';
export { default as ReviewScreen } from '../listening/ReviewScreen';
// Reading
export { default as QuestionBlock } from '../reading/QuestionBlock';
export { default as QuestionNav } from '../reading/QuestionNav';
export { default as QuestionRenderer } from '../reading/QuestionRenderer';
// Speaking
export { default as Recorder } from '../speaking/Recorder';

// ——— Premium/Admin (export only if these exist; otherwise comment out)
// export { default as PinGate } from '../../premium-ui/PinGate';
// export { default as PinManager } from '../../premium-ui/PinManager';
// export { default as PinLock } from '../../premium-ui/composed/PinLock';

// ——— Future DS components (enable when files land)
// export { Select } from './Select';
// export { Textarea } from './Textarea';
// export { Checkbox } from './Checkbox';
// export { RadioGroup } from './RadioGroup';
// export { Switch } from './Switch';
// export { Modal } from './Dialog';
// export { Drawer } from './Drawer';
// export { Tooltip } from './Tooltip';
// export { Popover } from './Popover';
// export { Tabs } from './Tabs';
// export { Pagination } from './Pagination';
// export { Table } from './Table';
// export { DataTable } from './DataTable';
// export { Skeleton } from './Skeleton';
// export { Spinner } from './Spinner';
// export { Progress } from './Progress';
// export { EmptyState } from './EmptyState';
// export { ErrorState } from './ErrorState';
