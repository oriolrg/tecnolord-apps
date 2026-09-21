'use strict';

const fs = require('node:fs/promises');
const constants = require('node:fs').constants;
const path = require('node:path');

function makeLocalMailOutbox(filePath = '/tmp/meteolord-mail-outbox.jsonl') {
  if (typeof filePath !== 'string' || !/^\/tmp\/meteolord-[a-z0-9_-]+\.jsonl$/.test(filePath)
      || path.normalize(filePath) !== filePath) {
    throw new TypeError('Local mail outbox must be an allowlisted /tmp/meteolord-*.jsonl path');
  }
  return async function deliver(message) {
    if (!message || !['password_reset', 'verify_email'].includes(message.kind)
        || typeof message.to !== 'string' || typeof message.token !== 'string') {
      throw new TypeError('Invalid local mail message');
    }
    const handle = await fs.open(filePath, constants.O_WRONLY | constants.O_APPEND | constants.O_CREAT | constants.O_NOFOLLOW, 0o600);
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || (stat.mode & 0o077) !== 0) throw new Error('Local mail outbox permissions are unsafe');
      await handle.writeFile(`${JSON.stringify({ kind: message.kind, to: message.to, token: message.token })}\n`);
    } finally { await handle.close(); }
  };
}

module.exports = { makeLocalMailOutbox };
