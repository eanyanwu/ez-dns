import pkg from 'chai';
import url from 'url';
import path from 'path';
import fs from 'fs';

const { expect } = pkg;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

import { computeNameFieldLength, readMessage } from '../Message.js';

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

describe('Message', function() {
    it('should correctly parse simple dns message header', function() {
        const dnsBytes = fs.readFileSync(`${__dirname}/sample-files/test-dns-query.bin`);
        const msg = readMessage(dnsBytes);
        console.log(msg);
    })
});