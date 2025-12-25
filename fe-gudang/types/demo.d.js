// InventoryStatus & Status enums sebagai komentar referensi
// 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK'
// 'DELIVERED' | 'PENDING' | 'RETURNED' | 'CANCELLED'

/**
 * @typedef {'list' | 'grid'} LayoutType
 * @typedef {1 | 0 | -1} SortOrderType
 */

/**
 * @typedef {Object} CustomEvent
 * @property {string} [name]
 * @property {'Ordered' | 'Processing' | 'Shipped' | 'Delivered'} [status]
 * @property {string} [date]
 * @property {string} [color]
 * @property {string} [icon]
 * @property {string} [image]
 */

/**
 * @typedef {Object} ShowOptions
 * @property {string} [severity]
 * @property {string} [content]
 * @property {string} [summary]
 * @property {string} [detail]
 * @property {number} [life]
 */

/**
 * @typedef {Object} ChartDataState
 * @property {import('chart.js').ChartData} [barData]
 * @property {import('chart.js').ChartData} [pieData]
 * @property {import('chart.js').ChartData} [lineData]
 * @property {import('chart.js').ChartData} [polarData]
 * @property {import('chart.js').ChartData} [radarData]
 */

/**
 * @typedef {Object} ChartOptionsState
 * @property {import('chart.js').ChartOptions} [barOptions]
 * @property {import('chart.js').ChartOptions} [pieOptions]
 * @property {import('chart.js').ChartOptions} [lineOptions]
 * @property {import('chart.js').ChartOptions} [polarOptions]
 * @property {import('chart.js').ChartOptions} [radarOptions]
 */

/**
 * @typedef {Object} AppMailProps
 * @property {Demo.Mail[]} mails
 */

/**
 * @typedef {Object} AppMailSidebarItem
 * @property {string} label
 * @property {string} icon
 * @property {string} [to]
 * @property {number} [badge]
 * @property {number} [badgeValue]
 */

/**
 * @typedef {Object} AppMailReplyProps
 * @property {Demo.Mail | null} content
 * @property {Function} hide
 */

// Namespace Demo sebagai komentar konteks
/**
 * @typedef {Object} Demo_Task
 * @property {number} [id]
 * @property {string} [name]
 * @property {string} [description]
 * @property {boolean} [completed]
 * @property {string} [status]
 * @property {string} [comments]
 * @property {string} [attachments]
 * @property {Demo_Member[]} [members]
 * @property {string} [startDate]
 * @property {string} [endDate]
 */

/**
 * @typedef {Object} Demo_Member
 * @property {string} name
 * @property {string} image
 */

/**
 * @typedef {Object} Demo_DialogConfig
 * @property {boolean} visible
 * @property {string} header
 * @property {boolean} newTask
 */

/**
 * @typedef {Object} Demo_Mail
 * @property {number} id
 * @property {string} from
 * @property {string} to
 * @property {string} email
 * @property {string} image
 * @property {string} title
 * @property {string} message
 * @property {string} date
 * @property {boolean} important
 * @property {boolean} starred
 * @property {boolean} trash
 * @property {boolean} spam
 * @property {boolean} archived
 * @property {boolean} sent
 */

/**
 * @typedef {Object} Demo_User
 * @property {number} id
 * @property {string} name
 * @property {string} image
 * @property {string} status
 * @property {Demo_Message[]} messages
 * @property {string} lastSeen
 */

/**
 * @typedef {Object} Demo_Message
 * @property {string} text
 * @property {number} ownerId
 * @property {number} createdAt
 */

/**
 * @typedef {Object} Demo_Product
 * @property {string} [id]
 * @property {string} [code]
 * @property {string} name
 * @property {string} description
 * @property {string} [image]
 * @property {number} [price]
 * @property {string} [category]
 * @property {number} [quantity]
 * @property {'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK'} [inventoryStatus]
 * @property {number} [rating]
 * @property {Demo_ProductOrder[]} [orders]
 */

/**
 * @typedef {Object} Demo_ProductOrder
 * @property {string} [id]
 * @property {string} [productCode]
 * @property {string} [date]
 * @property {number} [amount]
 * @property {number} [quantity]
 * @property {string} [customer]
 * @property {'DELIVERED' | 'PENDING' | 'RETURNED' | 'CANCELLED'} [status]
 */

/**
 * @typedef {Object} Demo_Payment
 * @property {string} name
 * @property {number} amount
 * @property {boolean} paid
 * @property {string} date
 */

/**
 * @typedef {Object} Demo_Customer
 * @property {number} [id]
 * @property {string} [name]
 * @property {ICountryObject} [country]
 * @property {string} [company]
 * @property {Date} date
 * @property {string} [status]
 * @property {number} [activity]
 * @property {number|string} [balance]
 * @property {boolean} [verified]
 * @property {number} [amount]
 * @property {number} [price]
 * @property {number} [rating]
 * @property {string} [image]
 * @property {Demo_Customer[]} [orders]
 * @property {string} [inventoryStatus]
 * @property {{ name: string, image: string }} representative
 */

/**
 * @typedef {Object} Demo_Event
 * @property {string} [location]
 * @property {string} [description]
 * @property {{ name: string, color: string }} [tag]
 * @property {string} [title]
 * @property {Date|string} [start]
 * @property {Date|string} [end]
 * @property {boolean} [allDay]
 */

/**
 * @typedef {Object} Demo_Photo
 * @property {string} title
 * @property {string} [itemImageSrc]
 * @property {string} [thumbnailImageSrc]
 * @property {string} [alt]
 */

/**
 * @typedef {Object} Demo_Country
 * @property {string} name
 * @property {string} code
 */

/**
 * @typedef {Object} Demo_Icon
 * @property {{
 *   paths?: string[],
 *   attrs?: [{}],
 *   isMulticolor?: boolean,
 *   isMulticolor2?: boolean,
 *   grid?: number,
 *   tags?: string[]
 * }} [icon]
 * @property {[{}]} [attrs]
 * @property {{
 *   order?: number,
 *   id: number,
 *   name: string,
 *   prevSize?: number,
 *   code?: number
 * }} [properties]
 * @property {number} [setIdx]
 * @property {number} [setId]
 * @property {number} [iconIdx]
 */
