import type { Plugin } from 'unified';

declare module 'rehype-highlight' {
  const rehypeHighlight: Plugin;
  export default rehypeHighlight;
}
