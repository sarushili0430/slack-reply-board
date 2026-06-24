module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Cyclic dependencies make package ownership and test boundaries unclear.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-deep-replyboard-imports',
      severity: 'error',
      from: {},
      to: {
        path: '^@replyboard/.+/src/',
      },
    },
    {
      name: 'renderer-no-node-or-electron',
      severity: 'error',
      from: {
        path: '^apps/desktop/src/renderer/',
      },
      to: {
        path: '^(node:|fs$|path$|child_process$|electron$|better-sqlite3$)',
      },
    },
    {
      name: 'domain-no-adapters',
      severity: 'error',
      from: {
        path: '^packages/[^/]+/src/domain/',
      },
      to: {
        path: '^(packages/adapters/|@replyboard/adapters|@slack/|electron$|better-sqlite3$)',
      },
    },
    {
      name: 'adapters-no-adapter-to-adapter',
      severity: 'error',
      from: {
        path: '^packages/adapters/[^/]+/',
      },
      to: {
        path: '^packages/adapters/[^/]+/',
        pathNot: '^packages/adapters/([^/]+)/',
      },
    },
    {
      name: 'concrete-adapters-only-in-composition-root',
      severity: 'error',
      from: {
        pathNot: '^(apps/daemon/src/composition-root/|packages/adapters/)',
      },
      to: {
        path: '^packages/adapters/',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: '(^|/)(dist|node_modules|coverage|\\.vite)/|\\.test\\.',
    },
    includeOnly: '^(apps|packages)',
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['types', 'import', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
    },
  },
};
