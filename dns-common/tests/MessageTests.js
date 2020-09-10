import pkg from 'chai';
import url from 'url';
import path from 'path';
import fs from 'fs';

const { expect } = pkg;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

import { readNameField, readMessage } from '../Message.js';

describe('readNameField', function() {
    const testCases = [
        { buf: Buffer.from([0]), len: 1 },
        { buf: Buffer.from([2, 9, 9, 3, 9, 9, 9, 0]), len: 8 },
        { buf: Buffer.from([1, 9, 2, 9, 9, 0, 5, 5, 5, 5, 5]), len: 6 },
    ]

    testCases.forEach((t) => {
        it(`${JSON.stringify(t.buf)} => length: ${t.len}`, function() {
            expect(readNameField(t.buf)['nameLength']).to.equal(t.len);
        });
    });
});

describe('Message', function() {
    it('should correctly parse dns query', function() {
        const dnsBytes = fs.readFileSync(`${__dirname}/sample-files/github-query.bin`);
        const msg = readMessage(dnsBytes);
        
        expect(msg['questionRecords']).to.have.lengthOf(1);

        const header = msg['header'];
        const question = msg['questionRecords'][0];

        expect(header['rd']).to.equal(1);
        expect(header['qdcount']).to.equal(1);
        expect(header['ancount']).to.equal(0);
        expect(question['qname']).to.equal('github.com.');
    });

    it.skip('should correctly parse a dns response', function() {
        const dnsBytes = fs.readFileSync(`${__dirname}/sample-files/github-response.bin`);
        const msg = readMessage(dnsBytes);

        console.log(msg);
    });
});