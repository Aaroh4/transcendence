const Tournament = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
	  playerAmount: { type: 'integer'},
    size: { type: 'integer' },
    created_by: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    status: { type: 'string' },
  },
}

export default Tournament