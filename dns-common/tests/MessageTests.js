import pkg from 'chai';
const { expect } = pkg;

import { computeNameFieldLength } from '../Message.js';

describe('computeNameFieldLength', function() {
    const testCases = [
        { buf: Buffer.from([0]), len: 1 },
        { buf: Buffer.from([2, 9, 9, 3, 9, 9, 9, 0]), len: 8 },
        { buf: Buffer.from([1, 9, 2, 9, 9, 0, 5, 5, 5, 5, 5]), len: 6 },
    ]

    testCases.forEach((t) => {
        it(`${JSON.stringify(t.buf)} => length: ${t.len}`, function() {
            expect(computeNameFieldLength(t.buf)).to.equal(t.len);
        });
    });
});