// TODO: Implement message compression

 import assert from 'assert';

/**
 * Reads the dns message from the buffer
 * 
 * @param {Buffer} buf
 */
function readMessage(buf) {
    assert(buf instanceof Buffer, `argument is not a Buffer. got ${typeof buf}`);

    const header = readMessageHeader(buf.slice(0, 12));

    const countQuestions = header['qdcount'];
    const countAnswers = header['ancount'];
    const countAuthority = header['nscount'];
    const countAdditional = header['arcount'];
    const questionRecords = [];
    const answerRecords = [];
    const authorityRecords = [];
    const additionalRecords = [];

    let restBytes = buf.slice(12);

    for (let i = 0; i < countQuestions; i++) {
        let question = readQuestionSection(restBytes);
        questionRecords.push(question);
        restBytes = restBytes.slice(question['numBytes']);
    }

    for (let i = 0; i < countAnswers; i++) {
        let answer = readResourceRecord(restBytes);
        answerRecords.push(answer);
        restBytes = restBytes.slice(answer['numBytes']);
    }

    for (let i = 0; i < countAuthority; i++) {
        let authority = readResourceRecord(restBytes);
        authorityRecords.push(authority);
        restBytes = burestBytesf.slice(authority['numBytes']);
    }

    for (let i = 0; i < countAdditional; i++) {
        let additional = readResourceRecord(restBytes);
        additionalRecords.push(additional);
        restBytes = restBytes.slice(additional['numBytes']);
    }

    return {
        header,
        questionRecords,
        answerRecords,
        authorityRecords,
        additionalRecords,
    };
}

 /**
  * Reads the message header section from the buffer
  * 
  * RFC 1035 4.1.1
  * 
  * @param {Buffer} buf 
  */
function readMessageHeader(buf) {
    const id = buf.readUInt16BE(0);
    const temp = buf.readUInt16BE(2);

    const qr =      (temp & 0b1000_0000_0000_0000) >> 15;
    const opcode =  (temp & 0b0111_1000_0000_0000) >> 11;
    const aa =      (temp & 0b0000_0100_0000_0000) >> 10;
    const tc =      (temp & 0b0000_0010_0000_0000) >> 9;
    const rd =      (temp & 0b0000_0001_0000_0000) >> 8;
    const ra =      (temp & 0b0000_0000_1000_0000) >> 7;
    const z =       (temp & 0b0000_0000_0111_0000) >> 4;
    const rcode =   (temp & 0b0000_0000_0000_1111);

    const qdcount = buf.readUInt16BE(4);
    const ancount = buf.readUInt16BE(6);
    const nscount = buf.readUInt16BE(8);
    const arcount = buf.readUInt16BE(10);

    return {
        id,
        qr,
        opcode,
        aa,
        tc,
        rd,
        ra,
        z,
        rcode,
        qdcount,
        ancount,
        nscount,
        arcount,
    };
}


/**
 * Reads a question section from the buffer
 * 
 * RFC 1035 4.1.2
 * 
 * @param {Buffer} buf 
 */
function readQuestionSection(buf) {
    assert(buf instanceof Buffer, `expected Buffer. got ${typeof buf}`);

    const nameField = readNameField(buf);
    const qNameFieldLength = nameField['nameLength'];
    const qtype = buf.slice(qNameFieldLength, qNameFieldLength + 2);
    const qclass = buf.slice(qNameFieldLength + 2, qNameFieldLength + 4);

    return {
        'qname': nameField['name'],
        qtype,
        qclass,
        numBytes: qNameFieldLength + 4,
    };
}

/**
 * Reads a resource record from the buffer
 * 
 * @param {Buffer} buf 
 */
function readResourceRecord(buf) {
    assert(buf instanceof Buffer, `expected Buffer. got ${typeof buf}`);

    const nameField = readNameField(buf);
    const nameFieldLength = nameField['nameLength'];

    const name = buf.slice(0, nameFieldLength).toString();
    const type = buf.slice(nameFieldLength, nameFieldLength + 2);
    const clss = buf.slice(nameFieldLength + 2, nameFieldLength + 4);
    const ttl = buf.slice(nameFieldLength + 4, nameFieldLength + 8);
    const rdLength = buf.slice(nameFieldLength + 8, nameFieldLength + 10).readUInt16BE();
    const rdata = buf.slice(nameFieldLength + 10, nameFieldLength + 10 + rdLength);
    const numBytes = nameFieldLength + 10 + rdLength;

    return {
        'name': nameField['name'],
        type,
        'class': clss,
        ttl,
        rdLength,
        rdata,
        numBytes
    };

}

/**
 * Reads the name field at the begining of the buffer
 * 
 * This is useful because name fields are of variable length 
 * @param {Buffer} buf 
 */
function readNameField(buf) {
    assert(buf instanceof Buffer, `expected Buffer. got ${typeof buf}`);

    let nameLength = 0;
    let labelLength = 0;
    let labels = [];

    console.log(buf);

    do {
        labelLength = buf[nameLength];

        nameLength += labelLength + 1;

        // Extract the label we just hopped over.
        let label = buf.slice(nameLength - labelLength, nameLength).toString();

        labels.push(label);
    } while (labelLength !== 0);

    let name = labels.join('.');

    if (nameLength === 1) {
        name = '.';
    }

    return {
        name,
        nameLength
    };
}

export { readNameField , readMessage };