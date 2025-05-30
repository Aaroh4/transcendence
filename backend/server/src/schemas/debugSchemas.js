import { postDebugLog } from '../controllers/debugController.js';

const postDebugLogOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['label', 'uid', 'delta'],
      properties: {
        label: { type: 'string' },
        uid: { type: 'string' },
        delta: { type: 'integer', enum: [1, -1] }
      }
    },
    response: {
      204: {
        type: 'null'
      }
    }
  },
  handler: postDebugLog
};

export { postDebugLogOpts };
