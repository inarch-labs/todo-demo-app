<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## @inarch/sdk dependency (temporary)

`@inarch/sdk` isn't published to npm yet, so it's consumed as a committed tarball:

```json
"@inarch/sdk": "file:./vendor/inarch-sdk-0.1.0.tgz"
```

Whenever the SDK changes (in the sibling `inarch` repo), update it here:

```bash
cd ../inarch/packages/sdk
npm run build && npm pack
cp inarch-sdk-*.tgz <path-to-this-repo>/vendor/
```

Then in this repo: bump the version in the `file:` dependency path in `package.json`, run `npm install`, and commit the new tarball. Do this on every branch that depends on `@inarch/sdk`.

Once the SDK is ready to publish, swap the `file:` line for a real version range (e.g. `"^0.1.0"`) and delete `vendor/` — no code changes needed.
