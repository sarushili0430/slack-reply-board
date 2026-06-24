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
      name: 'not-to-unresolvable',
      severity: 'error',
      comment: 'Imports must resolve to a concrete module.',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: 'renderer-not-to-node-electron-or-data-apis',
      severity: 'error',
      from: {
        path: '^apps/desktop/src/renderer/',
      },
      to: {
        path: '^(node:|fs$|path$|child_process$|electron$|better-sqlite3$|@slack/|packages/adapters/)',
      },
    },
    {
      name: 'domain-not-to-adapters-or-technology-sdks',
      severity: 'error',
      from: {
        path: '^packages/(?!adapters/)[^/]+/src/domain/',
      },
      to: {
        path: '^(packages/adapters/|@replyboard/adapters|@slack/|@modelcontextprotocol/|electron$|better-sqlite3$)',
      },
    },
    {
      name: 'mcp-tools-not-to-direct-data-apis',
      severity: 'error',
      from: {
        path: '^apps/hermes-mcp/src/tools/',
      },
      to: {
        path: '^(packages/adapters/(sqlite|slack|vector-store)/|better-sqlite3$|@slack/)',
      },
    },
    {
      name: 'adapter-not-to-other-adapter',
      severity: 'error',
      from: {
        path: '^packages/adapters/([^/]+)/',
      },
      to: {
        path: '^packages/adapters/[^/]+/',
        pathNot: '^packages/adapters/$1/',
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
