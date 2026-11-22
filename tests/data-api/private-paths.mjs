// Synthetic caller paths. No configured credential is needed for these probes.
export function canonicalPrivatePaths(secret) {
  return [`/api/mcp/${secret}`, '/api/mcp', '/api/v1/ad-networks/count_sites', '/api/v1', '/api/does-not-exist'];
}

// Expected normalization belongs to the caller's URL alone. The framework can
// return it before proxy.ts and route handlers can add their no-store headers.
export function malformedPrivatePaths(secret) {
  return [
    {path: `http://stack127.test/api/mcp/${secret}`, destination: `http://stack127.test/api/mcp/${secret}`},
    {path: `http://stack127.test/api//mcp/${secret}`, destination: `http://stack127.test/api/mcp/${secret}`},
    {path: `/api/no/../mcp/../../other/${secret}//`, destination: `/other/${secret}/`},
    {path: `/api/mcp/../../other/${secret}//`, destination: `/other/${secret}/`},
    {path: `/api/mcp/${secret}/../..`, destination: `/api`},
    {path: `/api/mcp-extra/${secret}//`, destination: `/api/mcp-extra/${secret}/`},
    {path: `/api//mcp/${secret}`, destination: `/api/mcp/${secret}`},
    {path: `/api/mcp/${secret}//`, destination: `/api/mcp/${secret}/`},
    {path: `//api/mcp/${secret}`, destination: `/api/mcp/${secret}`},
    {path: `///api///mcp/${secret}`, destination: `/api/mcp/${secret}`},
    {path: `/api\\mcp\\${secret}`, destination: `/api/mcp/${secret}`},
    {path: `/api/mcp\\${secret}`, destination: `/api/mcp/${secret}`},
    {path: `/api/mcp/${secret}/`, destination: `/api/mcp/${secret}`},
    {path: '/api/mcp/', destination: '/api/mcp'},
    {path: '/api//v1/ad-networks/count_sites', destination: '/api/v1/ad-networks/count_sites'},
    {path: '/api/v1/ad-networks/count_sites/', destination: '/api/v1/ad-networks/count_sites'},
    {path: '/api/v1/', destination: '/api/v1'},
    {path: `/Api/mCp/${secret}/`, destination: `/Api/mCp/${secret}`},
    {path: `/base/api/mcp/${secret}/`, destination: `/base/api/mcp/${secret}`},
    {path: `/en/api/mcp/${secret}/`, destination: `/en/api/mcp/${secret}`},
    {path: `/base/en/api/mcp/${secret}/`, destination: `/base/en/api/mcp/${secret}`},
    {path: `/api%2Fmcp/${secret}/`, destination: `/api%2Fmcp/${secret}`},
    {path: `/api%2fmcp/%ZZ/${secret}//`, destination: `/api%2fmcp/%ZZ/${secret}/`},
    ...[
      `/api%2fmcp%2f${secret}`, `/api%5cmcp%5c${secret}`, `/%61pi/%6dcp/${secret}`,
      `/api%252fmcp%252f${secret}`, `/api%25252fmcp/${secret}`,
      `/api/./mcp/${secret}`, `/api/no/../mcp/${secret}`, `/api/%2e/mcp/${secret}`,
      `/api/no/%2e%2E/mcp/${secret}`, `/api/no/%252e%252e/mcp/${secret}`,
      `/api/mcp/${secret}/extra`, '/api%2fv1/ad-networks/count_sites',
      `/other/../api/mcp/${secret}`,
      `/API/MCP/${secret}`, '/API/V1/ad-networks/count_sites',
    ].map(path => ({path})),
    {path: '/api/no/../v1/ad-networks/count_sites', enabledStatus: 401},
  ];
}
