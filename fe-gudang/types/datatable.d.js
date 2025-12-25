/**
 * @typedef {Object} ColumnConfig
 * @property {string} [field] 
 * @property {string} header 
 * @property {boolean} [filter] 
 * @property {(rowData: any) => React.ReactNode} [body] 
 * @property {React.CSSProperties} [style] 
 */

/**
 * @typedef {Object} DataTableProps
 * @property {Array<any>} data 
 * @property {boolean} [loading] 
 * @property {Array<ColumnConfig>} columns 
 */
