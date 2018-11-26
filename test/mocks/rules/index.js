module.exports = [
  { resource: 'Movie', role: 'guest', action: 'read:any', attributes: ['*', '!createdAt'] },

  { resource: 'Movie', role: 'owner', action: 'read:own', attributes: ['*'] },
  { resource: 'Movie', role: 'owner', action: 'update:own', attributes: ['*', '!createdAt', '!isVerified'] },
  { resource: 'Movie', role: 'owner', action: 'delete:own', attributes: ['*'] },
  { resource: 'Movie', role: 'owner', action: 'create:any', attributes: ['*', '!isVerified'] },
  { resource: 'Movie', role: 'owner', action: 'read:any', attributes: ['*', '!createdAt'] },

  { resource: 'Movie', role: 'admin', action: 'read:any', attributes: ['*'] },
  { resource: 'Movie', role: 'admin', action: 'create:any', attributes: ['*'] },
  { resource: 'Movie', role: 'admin', action: 'update:any', attributes: ['*'] },
  { resource: 'Movie', role: 'admin', action: 'delete:any', attributes: ['*'] },

  { resource: 'Fake', role: 'fake', action: 'read:any', attributes: ['*'] },
]
