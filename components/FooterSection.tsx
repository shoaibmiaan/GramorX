import React from 'react';

export const FooterSection: React.FC<{ title: string; children: React.ReactNode; listClassName?: string }> = ({ title, children, listClassName = 'space-y-2' }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-[3px] after:bg-primary">
      {title}
    </h3>
    <ul className={listClassName}>{children}</ul>
  </div>
);

