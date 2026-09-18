import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';

test('model tabs expose persistent horizontal scroll controls', async () => {
    const source = await readFile(new URL('../src/table.jsx', import.meta.url), 'utf8');

    const modelTabs = source.slice(
        source.indexOf('<Tabs\n                    className="model-tabs"'),
        source.indexOf('</Tabs>'),
    );

    assert.match(modelTabs, /variant="scrollable"/);
    assert.match(modelTabs, /scrollButtons/);
    assert.match(modelTabs, /allowScrollButtonsMobile/);
    assert.doesNotMatch(modelTabs, /centered/);
    assert.match(modelTabs, /className="miner-model-tab"/);
});
