// TODO: Implement message compression

 import assert from 'assert';

 /**
  * Message definition
  * 
  * RFC 1035 4.1
  */
class Message {
    constructor(buf) {
        assert(buf instanceof Buffer, `argument is not a Buffer. got ${typeof buf}`);

        const header = new MessageHeader(buf.slice(0, 96));

        this.countQuestions = header.get('QDCOUNT').readUInt16BE();
        this.countAnswers = header.get('ANCOUNT').readUInt16BE();
        this.countAuthority = header.get('NSCOUNT').readUInt16BE();
        this.countAdditional = header.get('ARCOUNT').readUInt16BE();
        this.questions = [];
        this.answerRecords = [];
        this.authorityRecords = [];
        this.additionalRecords = [];

        let restBytes = buf.slice(96);

        for (let i = 0; i < this.countQuestions; i++) {
            let question = new QuestionSection(restBytes);
            this.questions.push(question);
            restBytes = buf.slice(question.length);
        }

        for (let i = 0; i < this.countAnswers; i++) {
            let answer = new ResourceRecord(restBytes);
            this.answerRecords.push(answer);
            restBytes = buf.slice(answer.length);
        }

        for (let i = 0; i < this.countAuthority; i ++) {
            let authority = new ResourceRecord(restBytes);
            this.authorityRecords.push(authority);
            restBytes = buf.slice(authority.length);
        }

        for (let i = 0; i < this.countAdditional; i ++) {
            let additional = new ResourceRecord(restBytes);
            this.authorityRecords.push(additional);
            restBytes = buf.slice(additional.length);
        }
    }
}

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

/**
 * Message Header definition
 * 
 * RFC 1035 4.1.1
 */
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

        const qNameFieldLength = computeNameFieldLength(buf);

        this._offsets = {
            'QNAME' : [0, qNameFieldLength],
            'QTYPE' : [qNameFieldLength, qNameFieldLength + 16],
            'QCLASS' : [ qNameFieldLength + 16, qNameFieldLength + 32],
        };

        this.length = qNameFieldLength + 32;
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

        const nameFieldLength = computeNameFieldLength(buf);

        this._offsets = {
            'NAME' : [0, nameFieldLength],
            'TYPE' : [nameFieldLength, nameFieldLength + 16],
            'CLASS' : [nameFieldLength + 16, nameFieldLength + 32],
            'TTL' : [nameFieldLength + 32, nameFieldLength + 64],
            'RDLENGTH' : [nameFieldLength + 64, nameFieldLength + 80]
        };

        const rdLength = this._offsets['RDLENGTH'];

        this._offsets['RDATA'] = [nameFieldLength + 80, nameFieldLength + 80 + rdLength]

        this.length = nameFieldLength + 80 + rdLength;
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
    let labelLength = 0;

    do {
        labelLength = buf[nameLength];

        nameLength += labelLength + 1;
    } while (labelLength !== 0);

    return nameLength;
}

export { MessageHeader, QuestionSection, ResourceRecord, computeNameFieldLength};