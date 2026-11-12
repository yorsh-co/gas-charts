import { gasEslint } from 'gasdev/eslint';

export default gasEslint({
  ignores: ['src/generated/**'],
  web: { files: ['src/web/**/*.ts'], tsconfig: './tsconfig.frontend.json' },
});
