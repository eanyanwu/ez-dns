/**
 * Message Header definition
 * 
 * RFC 1035 4.1.1
 */

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
        if (buf instanceof Buffer) {
            if (buf.length !== 96) {
                throw new Error(`expected header of lengh 96. go ${buf.length}`);
            }

            this._buffer = buf;
        } else {
            throw new Error(`argument is not a Buffer. got ${typeof buf}`);
        }
    }

    get(fieldName) {
        if (typeof fieldName === 'string') {
            const offsets = MESSAGE_HEADER_OFFSETS[fieldName.toUpperCase()];
            return this._buffer.slice(offsets[0], offsets[1]);
        } else {
            throw new Error(`expected string fieldname. got '${fieldName}'`);
        }
        const offsets = MESSAGE_HEADER_OFFSETS[fieldName]
    }
}