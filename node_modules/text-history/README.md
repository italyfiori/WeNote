# text-history
Keeps track of changes to text so you can pull specific versions and patch an old version

* Retrieve any version
* Get [patches](https://code.google.com/p/google-diff-match-patch/) to transform any version to the last version added
* Changes stored with deltas to save space

```javascript
var TextHistory = require('text-history');

var history = new TextHistory();
var id1 = history.addVersion('document version 1');
var id2 = history.addVersion('document version 2');

console.assert(history.getVersion(id1) === 'document version 1');
console.assert(history.getVersion(id2) === 'document version 2');

var patches = history.getPatches(id1);
// diff_match_patch is a different module
console.assert(diff_match_patch.patch_apply(patches, 'document version 1')[0] === 'document version 2');

```
# TextHistory
## new TextHistory()
Construct a new TextHistory object.
### history.addVersion(text)
Add a new, updated version of the text. Returns a string id used to access the version again.
### history.getVersion(id)
Retrieve text from the version of id. Returns `undefined` if version id does not exist.
### history.hasVersion(id)
Returns boolean value whether the version id exists or not.
### history.lastVersion
The text of the latest version (last added) in the history.
### history.getPatches(id)
Get the patches to transform the text of version `id` into the last version. Returns an array of patches than can be used in [google-difff-patch-match] (https://code.google.com/p/google-diff-match-patch/) to patch a version to the lastest version.
