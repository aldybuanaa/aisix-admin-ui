/** Domain model for an MCP server registration. */
export interface McpServer { readonly id: string; readonly revision: number; readonly name: string; readonly authType: string; readonly raw: Record<string, unknown>; }
