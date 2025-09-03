import React from 'react';
import { Container as DSContainer } from './Container';

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  Container?: boolean;
  containerClassName?: string;
  children?: React.ReactNode;
};

export const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  Container = false,
  containerClassName = '',
  children,
  ...rest
}) => {
  const content = Container ? <DSContainer className={containerClassName}>{children}</DSContainer> : children;
  return (
    <section
      id={id}
      className={`py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90 ${className}`}
      {...rest}
    >
      {content}
    </section>
  );
};

export default Section;
