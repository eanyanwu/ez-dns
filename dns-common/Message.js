// TODO: Implement message compression

/**
 * Message Header definition
 * 
 * RFC 1035 4.1.1
 */

 import assert from 'assert';

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

        const qTypeStart = getQtypeStart(buf);

        this._offsets = {
            'QNAME' : [0, qTypeStart - 1],
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

QuestionSection.getQTYPEStart = getQtypeStart;

/**
 * Returns the index at which the QTYPE field starts.
 * 
 * This is useful because the field before it, QNAME is of variable length.
 * 
 * @param {Buffer} buf 
 * @param {number} start 
 */
function getQtypeStart(buf, start = 0) {
    assert(buf instanceof Buffer, `expected Buffer. got ${typeof buf}`);

    const labelLength = buf[start];

    assert(labelLength <= 63, `label length must be 63 or less ${labelLength}`);

    if (labelLength === 0) {
        return start + 1;
    } else {
        getQtypeStart(buf, start + labelLength + 1);
    }
}