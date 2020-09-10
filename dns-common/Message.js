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

    let index = 12;

    for (let i = 0; i < countQuestions; i++) {
        let question = readQuestionSection(buf, index);
        questionRecords.push(question);
        index += question['numBytes'];
    }

    for (let i = 0; i < countAnswers; i++) {
        let answer = readResourceRecord(buf, index);
        answerRecords.push(answer);
        index += answer['numBytes'];
    }
    
    for (let i = 0; i < countAuthority; i++) {
        let authority = readResourceRecord(buf, index);
        authorityRecords.push(authority);
        index += authority['numBytes'];
    }

    for (let i = 0; i < countAdditional; i++) {
        let additional = readResourceRecord(buf, index);
        additionalRecords.push(additional);
        index += additional['numBytes'];
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
 * @param {Buffer} message - The message
 * @param {number} index - The index at which the question section starts
 */
function readQuestionSection(message, index = 0) {
    assert(message instanceof Buffer, `expected Buffer. got ${typeof message}`);

    const nameField = readNameField(message, index);
    const qNameFieldLength = nameField['nameLength'];
    const qtype = message.slice(index + qNameFieldLength, index + qNameFieldLength + 2);
    const qclass = message.slice(index + qNameFieldLength + 2, index + qNameFieldLength + 4);

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
 * @param {Buffer} message - The message
 * @param {number} index - The index at which the RR starts
 */
function readResourceRecord(message, index = 0) {
    assert(message instanceof Buffer, `expected Buffer. got ${typeof message}`);

    const nameField = readNameField(message, index);
    const nameFieldLength = nameField['nameLength'];

    const type = message.slice(index + nameFieldLength, index + nameFieldLength + 2);
    const clss = message.slice(index + nameFieldLength + 2, index + nameFieldLength + 4);
    const ttl = message.slice(index + nameFieldLength + 4, index + nameFieldLength + 8);
    const rdLength = message.slice(index + nameFieldLength + 8, index + nameFieldLength + 10).readUInt16BE();
    const rdata = message.slice(index + nameFieldLength + 10, index + nameFieldLength + 10 + rdLength);
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
 * Reads the name field starting at the specified index.
 * Message compression is handled according to RFC 1035 4.1.4
 * 
 * @param {Buffer} message - The message
 * @param {number} index - The index at which to start reading a name field
 */
function readNameField(message, index = 0) {
    assert(message instanceof Buffer, `expected Buffer. got ${typeof message}`);

    let start = index;
    let labels = [];
    let labelLength = message[index];

    while (labelLength != 0) {
        // 64 = 2^6 = First two bits are 0
        if (labelLength < 64) {
            // The +1s are because the actual label starts after the length octet
            let label = message.slice(index + 1, index + 1 + labelLength).toString();
    
            labels.push(label);
    
            // Set the value of index to the next length octet, which comes after our label.
            index += labelLength + 1;
    
            labelLength = message[index];
        }
        // Compressed!
        else {
            let pointer = 0b0011_1111_1111_1111 & message.slice(index, index + 2).readUInt16BE();

            // This is technically recursive, but in practice the recursion only goes one call frame deep.
            let rest = readNameField(message, pointer)['labels'];

            // Remove the last null label (we'll re-ad it outside the loop)
            rest.pop();

            labels = labels.concat(rest);

            // Update the index so that once we break out, the `end` variable is still correct
            index += 1;
            break;
        }
    }

    let end = index;

    // The null label
    labels.push('');

    return {
        'name': labels.length === 1 ? '.' : labels.join('.'),
        'labels': labels,
        'nameLength': end - start + 1,
    };
}

export { readNameField , readMessage };