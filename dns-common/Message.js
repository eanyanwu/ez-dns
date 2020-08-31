// TODO: Implement message compression

/**
 * Message Header definition
 * 
 * RFC 1035 4.1.1
 */

 import assert from 'assert';
import { type } from 'os';

const MESSAGE_HEADER_OFFSETS = {
    'ID': [0, 16],
    'QR' : [16, 17],
    'OPCODE' : [17, 21],
    'AA' : [21, 22],
    'TC' : [22, 23],
    'RD' : [23, 24],
    'RA' : [24, 25],
    'Z' : [25, 28],
    'RCODE' : [28, 32],
    'QDCOUNT' : [32, 48],
    'ANCOUNT' : [48, 64],
    'NSCOUNT' : [64, 80],
    'ARCOUNT' : [80, 96],
};

class MessageHeader {
    constructor(buf) {
        assert(buf instanceof Buffer, `argument is not a Buffer. got ${typeof buf}`);
        assert(buf.length === 96, `expected header of lengh 96. go ${buf.length}`);
        this._buffer = buf;
    }

    get(fieldName) {
        assert(typeof fieldName === 'string', `expected string. got '${typeof fieldName}'`);

        const offsets = MESSAGE_HEADER_OFFSETS[fieldName.toUpperCase()];
        return this._buffer.slice(offsets[0], offsets[1]);
    }
}

/**
 * Question section definition
 * 
 * RFC 1035 4.1.2
 */
class QuestionSection {
    constructor(buf) {
        assert(buf instanceof Buffer, `expected Buffer. got ${typeof buf}`);

        this._buffer = buf;

        const qTypeStart = computeNameFieldLength(buf);

        this._offsets = {
            'QNAME' : [0, qTypeStart],
            'QTYPE' : [qTypeStart, qTypeStart + 16],
            'QCLASS' : [ qTypeStart + 16, qTypeStart + 32],
        };
    }

    get(fieldName) {
        assert(typeof fieldName === 'string', `expected string. got '${typeof fieldName}'`);

        const offsets = this._offsets[fieldName.toUpperCase()];

        return this._buffer.slice(offsets[0], offsets[1]);
    }
}


/**
 * Resource record definition
 * 
 * RFC 1035 4.1.3
 */
class ResourceRecord {
    constructor(buf) {
        assert(buf instanceof Buffer, `expected Buffer. got ${typeof buf}`);

        this._buffer = buf;

        const typeStart = computeNameFieldLength(buf);

        this._offsets = {
            'NAME' : [0, typeStart],
            'TYPE' : [typeStart, typeStart + 16],
            'CLASS' : [typeStart + 16, typeStart + 32],
            'TTL' : [typeStart + 32, typeStart + 64],
            'RDLENGTH' : [typeStart + 64, typeStart + 80]
        };

        const rdLength = this._offsets['RDLENGTH'];

        this._offsets['RDATA'] = [typeStart + 80, typeStart + 80 + rdLength]
    }

    get(fieldName) {
        assert(typeof fieldName === 'string', `expected string. got '${typeof fieldName}'`);

        const offsets = this._offsets[fieldName.toUpperCase()];

        return this._buffer.slice(offsets[0], offsets[1]);
    }
}

/**
 * Computes the length of the name field at the begining of the buffer
 * 
 * This is useful because name fields are usually of variable length 
 * @param {Buffer} buf 
 */
function computeNameFieldLength(buf) {
    assert(buf instanceof Buffer, `expected Buffer. got ${typeof buf}`);

    let nameLength = 0;
    do {
        let labelLength = buf[nameLength];

        assert(labelLength <= 63, `label length must be 63 or less ${labelLength}`);

        nameLength += labelLength + 1;
    } while (labelLength !== 0);
}