import assert from 'assert';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderMarkdown } from './SidebarAI';

function render(md: string) {
  return renderToStaticMarkup(renderMarkdown(md));
}

// Plain text should render inside a paragraph
let html = render('Hello world');
assert(html.includes('<p>') && html.includes('Hello world'));

// Bullet lists should be stripped to plain paragraphs
html = render('* one\n- two\n1. three');
assert(html.includes('<p>one</p>'));
assert(html.includes('<p>two</p>'));
assert(html.includes('<p>three</p>'));
assert(!html.includes('<ul') && !html.includes('<ol'));

// Code fences should render inside <pre><code> with language class
html = render('```js\nconst x = 1;\n```');
assert(html.includes('<pre'));
assert(html.includes('const x = 1;'));
assert(html.includes('language-js'));

console.log('SidebarAI markdown tests passed.');
