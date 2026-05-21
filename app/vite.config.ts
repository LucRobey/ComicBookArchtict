import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const workspaceRoot = path.resolve(__dirname, '../');

const isSafePath = (absolutePath: string) => {
  const relative = path.relative(workspaceRoot, absolutePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

const localSavePlugin = () => ({
  name: 'local-save-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url === '/api/save-layout' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { pageId, elements } = data;
            
            if (!pageId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing pageId' }));
              return;
            }

            const outputDir = path.resolve(__dirname, `../outputs/pages/${pageId}`);
            if (!isSafePath(outputDir)) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Access denied' }));
              return;
            }

            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }

            const outputPath = path.join(outputDir, 'layout.json');
            fs.writeFileSync(outputPath, JSON.stringify(elements, null, 2));

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: `Saved layout to ${outputPath}` }));
          } catch (error: any) {
            console.error('Error saving layout:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else if (req.url?.startsWith('/api/load-layout') && req.method === 'GET') {
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const pageId = url.searchParams.get('pageId');
          
          if (!pageId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing pageId' }));
            return;
          }

          const layoutPath = path.resolve(__dirname, `../outputs/pages/${pageId}/layout.json`);
          if (!isSafePath(layoutPath)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Access denied' }));
            return;
          }

          if (fs.existsSync(layoutPath)) {
            const data = fs.readFileSync(layoutPath, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.end(JSON.stringify({ elements: JSON.parse(data) }));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Layout not found' }));
          }
        } catch (error: any) {
          console.error('Error loading layout:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      } else if (req.url === '/api/save-modifications' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { markdownContent, pageId } = data;
            
            const outputDir = path.resolve(__dirname, `../modifications`);
            if (!isSafePath(outputDir)) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Access denied' }));
              return;
            }

            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputPath = path.join(outputDir, `qa_report_${pageId}_${timestamp}.md`);
            fs.writeFileSync(outputPath, markdownContent);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: `Saved QA report to ${outputPath}` }));
          } catch (error: any) {
            console.error('Error saving modifications:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else if (req.url?.startsWith('/api/load-image') && req.method === 'GET') {
        // Binary image loader — path relative to project root
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const filePath = url.searchParams.get('path');
          if (!filePath) {
            res.statusCode = 400;
            res.end('Missing path parameter');
            return;
          }
          const absolutePath = path.resolve(__dirname, '../', filePath);
          if (!isSafePath(absolutePath)) {
            res.statusCode = 403;
            res.end('Access denied');
            return;
          }

          if (!fs.existsSync(absolutePath)) {
            res.statusCode = 404;
            res.end('Image not found');
            return;
          }
          const ext = path.extname(absolutePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
          };
          const mime = mimeTypes[ext] || 'application/octet-stream';
          const data = fs.readFileSync(absolutePath);
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'no-cache');
          res.end(data);
        } catch (error: any) {
          res.statusCode = 500;
          res.end(error.message);
        }
      } else if (req.url?.startsWith('/api/load') && req.method === 'GET') {
        // Generic JSON file loader — path relative to project root (Architecture 3.0/)
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const filePath = url.searchParams.get('path');
          if (!filePath) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing path parameter' }));
            return;
          }
          const absolutePath = path.resolve(__dirname, '../', filePath);
          if (!isSafePath(absolutePath)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Access denied' }));
            return;
          }

          if (!fs.existsSync(absolutePath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `File not found: ${filePath}` }));
            return;
          }
          const raw = fs.readFileSync(absolutePath, 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.end(JSON.stringify({ data: JSON.parse(raw) }));
        } catch (error: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }

      } else if (req.url === '/api/save' && req.method === 'POST') {
        // Generic JSON file saver — path relative to project root
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { path: filePath, content } = JSON.parse(body);
            if (!filePath) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing path' }));
              return;
            }
            const absolutePath = path.resolve(__dirname, '../', filePath);
            if (!isSafePath(absolutePath)) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Access denied' }));
              return;
            }

            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(absolutePath, JSON.stringify(content, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else if (req.url === '/api/save-qa' && req.method === 'POST') {
        // QA report exporter — saves a markdown file at given path relative to project root
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { path: filePath, content } = JSON.parse(body);
            if (!filePath || !content) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing path or content' }));
              return;
            }
            const absolutePath = path.resolve(__dirname, '../', filePath);
            if (!isSafePath(absolutePath)) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Access denied' }));
              return;
            }

            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(absolutePath, content, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, path: filePath }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else if (req.url?.startsWith('/api/list-dir') && req.method === 'GET') {
        // Directory listing — returns entries [{name, isDir}] for a path relative to project root
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const dirPath = url.searchParams.get('path');
          if (!dirPath) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing path parameter' }));
            return;
          }
          const absolutePath = path.resolve(__dirname, '../', dirPath);
          if (!isSafePath(absolutePath)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Access denied' }));
            return;
          }

          if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Directory not found: ${dirPath}` }));
            return;
          }
          const entries = fs.readdirSync(absolutePath).map((name: string) => {
            const entryPath = path.join(absolutePath, name);
            const stat = fs.statSync(entryPath);
            return { name, isDir: stat.isDirectory() };
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ entries }));
        } catch (error: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }

      } else if (req.url?.startsWith('/api/load-text') && req.method === 'GET') {
        // Raw text file loader — returns { text: "..." } for markdown and other text files
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const filePath = url.searchParams.get('path');
          if (!filePath) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing path parameter' }));
            return;
          }
          const absolutePath = path.resolve(__dirname, '../', filePath);
          if (!isSafePath(absolutePath)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Access denied' }));
            return;
          }

          if (!fs.existsSync(absolutePath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `File not found: ${filePath}` }));
            return;
          }
          const text = fs.readFileSync(absolutePath, 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.end(JSON.stringify({ text }));
        } catch (error: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }

      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localSavePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
