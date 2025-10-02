/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} name
 * @property {string} unit
 * @property {number} min
 * @property {number=} minConfidence
 * @property {number=} shelfLifeDays
 */

/**
 * @typedef {Object} ItemBatch
 * @property {string} id
 * @property {string} itemId
 * @property {string} code
 * @property {number} qty
 * @property {string=} expiry
 * @property {number} createdAt
 */

/**
 * @typedef {Object} HistoryRecord
 * @property {string} id
 * @property {string} itemId
 * @property {string=} batchId
 * @property {"auto"|"manual"|"correction"} type
 * @property {"in"|"out"} direction
 * @property {number} qty
 * @property {number=} confidence
 * @property {boolean=} fefo
 * @property {string=} oldLabel
 * @property {string=} newLabel
 * @property {string=} imageBase64
 * @property {string=} user
 * @property {"camera"|"qr"|"ui"=} source
 * @property {number} ts
 */

/**
 * @typedef {Object} RetrainRecord
 * @property {string} id
 * @property {string} itemId
 * @property {string=} imageBase64
 * @property {string=} oldLabel
 * @property {string} newLabel
 * @property {number=} confidence
 * @property {number} ts
 */

export const EXPIRY_FILTERS = Object.freeze({
  all: 'all',
  expiring7: 'expiring7',
  expiring30: 'expiring30',
  expired: 'expired',
});

export const MOVEMENT_FILTERS = Object.freeze({
  all: 'all',
  auto: 'auto',
  manual: 'manual',
  correction: 'correction',
});
