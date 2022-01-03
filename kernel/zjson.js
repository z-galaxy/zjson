const tokenType = {
    BeginObject: 1,
    EndObject: 2,
    BeginArray: 4,
    EndArray: 8,
    Null: 16,
    NUmber: 32,
    STring: 64,
    BOolean: 128,
    SepColon: 256,
    SepComma: 512,
    EndDocument: 1024,
    Exception: 2048,
}

const objectState = {
    Begin: 1,
    Key: 2,
    Colon: 4,
    Value: 8,
    Comma: 16,
    End: 32,
    CommaOrEnd: 48,
    KeyOrEnd: 34
}

const arrayState = {
    Begin: 1,
    Value: 2,
    Comma: 4,
    End: 8,
    CommaOrEnd: 12,
    ValueOrEnd: 10
}

function isDigital(c) {
    if (c >= '0' && c <= '9') {
        return true;
    }

    return false;
}

class keyValue {
    constructor(k, v) {
        this.k = k;
        this.v = v;
    }

    toString() {
        return this.k.toString() + ": " + this.v.toString();
    }
}

class arrayElement {
    constructor() {
        this.v = new Array();
    }

    append(v) {
        this.v.push(v)
    }

    toString() {
        let s = "[\r\n";
        for (const [idx, v] of this.v.entries()) {
            s += v.toString();
            if (idx != this.v.length - 1) {
                s += ",";
            }
            s += "\r\n";
        }
        s += "]"

        return s;
    }
}

class objectElement {
    constructor() {
        this.kv = new Array();
    }

    append(kv) {
        this.kv.push(kv)
    }

    toString() {
        let s = "{\r\n";
        for (const [idx, kv] of this.kv.entries()) {
            s += kv.toString();
            if (idx != this.kv.length - 1) {
                s += ",";
            }
            s += "\r\n";
        }
        s += "}"

        return s;
    }
}

class position {
    constructor(r, c) {
        this.row = r;
        this.column = c;
    }

    toString() {
        return "{row: " + this.row.toString() + ", column:" + this.column.toString() + "}";
    }
}

class char {
    constructor(v, p) {
        this.v = v;
        this.position = p;
    }

    getPosition() {
        return this.position
    }

    getValue() {
        return this.v;
    }
}

class reader {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.row = 1;
        this.column = 1;
    }

    next() {
        if (this.pos >= this.text.length) {
            return -1;
        }
        let c = this.text[this.pos++];
        if (c == '\n') {
            this.row++;
            this.column = 1;
        }

        return new char(c, new position(this.row, this.column++));
    }

    back() {
        if (this.pos > 0) {
            this.pos--;
        }
    }

    empty() {
        if (this.pos >= this.text.length) {
            return true;
        }

        return false;
    }
}

class token {
    constructor(t, v, p) {
        this.tokenType = t;
        this.tokenValue = v;
        this.tokenPosition = p;
    }

    setType(t) {
        this.tokenType = t;
    }

    getType() {
        return this.tokenType;
    }

    setValue(v) {
        this.tokenValue = v;
    }

    getValue() {
        return this.tokenValue;
    }

    setPosition(p) {
        this.tokenPosition = p;
    }

    getPosition() {
        return this.tokenPosition;
    }
}

class tokenizer {
    constructor() {
        this.reader = null;
        this.tl = new Array();// token list
    }

    escape(c) {
        if (c == ' ' || c == '\\' || c == '\r' || c == '\n') {
            return true;
        }

        return false;
    }

    expect(start, e) {
        let i = 0;
        let c = start;
        while (c.getValue() == e[i] && i < e.length) {
            c = this.reader.next();
            i++;
        };

        return i == e.length
    }

    // read null
    readNull(start) {
        let pos = start.getPosition();

        if (!expect(start, "null")) {
            return new token(tokenType.Exception, "", pos);
        }

        return new token(tokenType.Null, null, pos);
    }

    // read boolean
    readBoolean(start) {
        let pos = start.getPosition();

        if (start.getValue() == t[0]) {
            if (this.expect(start, "true")) {
                return new token(tokenType.BOolean, true, pos);
            }
        } else if (start.getValue() == f[0]) {
            if (this.expect(start, "false")) {
                return new token(tokenType.BOolean, false, pos);
            }
        }

        return new token(tokenType.Exception, "", pos);
    }

    // read number
    readNumber(start) {
        let c = start;
        let s = "";
        let found = false;

        while (isDigital(c.getValue())) {
            s += c.getValue();
            c = this.reader.next();
        };

        this.reader.back();
        return new token(tokenType.NUmber, s, start.getPosition());
    }

    // read string
    readString(start) {
        let c = start;
        let s = "";
        let found = false;

        do {
            c = this.reader.next();
            if (c.getValue() == '"') {
                found = true;
                break;
            }
            s += c.getValue();
        } while (true);

        if (found) {
            return new token(tokenType.STring, s, start.getPosition());
        }

        return new token(tokenType.Exception, "", start.getPosition());
    }

    // get next token
    next() {
        // trim whitespace
        let ch;
        while (true) {
            if (this.reader.empty()) {
                return new token(tokenType.EndDocument, null, null);
            }

            ch = this.reader.next();
            if (!this.escape(ch.getValue())) {
                break;
            }
        }

        let c = ch.getValue();
        switch (c) {
            case '{':
                return new token(tokenType.BeginObject, c, ch.getPosition());

            case '}':
                return new token(tokenType.EndObject, c, ch.getPosition());

            case '[':
                return new token(tokenType.BeginArray, c, ch.getPosition());

            case ']':
                return new token(tokenType.EndArray, c, ch.getPosition());

            case ',':
                return new token(tokenType.SepComma, c, ch.getPosition());

            case ':':
                return new token(tokenType.SepColon, c, ch.getPosition());

            case 'n':
                return this.readNull(ch);

            case 't':
            case 'f':
                return this.readBoolean(ch);

            case '-':
                return this.readNumber(ch);

            case '"':
                return this.readString(ch);
        }

        if (isDigital(c)) {
            return this.readNumber(ch);
        }

        return new token(tokenType.Exception, "", ch.getPosition());
    }

    parse(text) {
        this.reader = new reader(text);

        let t;
        do {
            t = this.next();
            this.tl.push(t);
        } while ((t.getType() != tokenType.EndDocument) && (t.getType() != tokenType.Exception));

        return this.tl;
    }

    toString() {
        let s = "";
        for (const [idx, t] of this.tl.entries()) {
            s += "type:" + t.getType() + ", value:" + t.getValue() + ",pos:" + t.getPosition() + "\r\n";
        }

        return s;
    }
}

class lexer {
    constructor() {
        this.tl = null;
        this.idx = 0;
    }

    parseObject() {
        let s = objectState.Key;
        let k = null;
        let v = null;
        let o = new objectElement();

        while (s != objectState.End) {
            let tk = this.tl[this.idx++];

            let t = tk.getType()
            if (t == tokenType.EndDocument) {
                console.log("parse object finish.");
                return;
            }

            if (s == objectState.Key) {
                if (t != tokenType.STring) {
                    return;
                }
                k = tk.getValue();
                s = objectState.Colon;
            } else if (s == objectState.Colon) {
                s = objectState.Value;
            } else if (s == objectState.Value) {
                if (t == tokenType.STring || t == tokenType.NUmber) {
                    v = tk.getValue();
                } else if (t == tokenType.BeginObject) {
                    v = this.parseObject();
                } else if (t == tokenType.BeginArray) {
                    v = this.parseArray();
                } else {
                    console.log("error token type", tk);
                    return;
                }
                let kv = new keyValue(k, v);
                o.append(kv);
                console.log("parse object append object", kv);
                s = objectState.CommaOrEnd;
            } else if (s == objectState.CommaOrEnd) {
                if (t == tokenType.SepComma) {
                    s = objectState.Key;
                } else if (t == tokenType.EndObject) {
                    s = objectState.End;
                } else {
                    console.log("error token type", tk);
                    return;
                }
            } else {
                console.log("error array state", s);
                return;
            }
        }

        console.log("parse object finish.");
        return o;
    }

    parseArray() {
        let s = arrayState.Value;
        let v = null;
        let a = new arrayElement();

        while (s != arrayState.End) {
            let tk = this.tl[this.idx++];
            let t = tk.getType()

            if (t == tokenType.EndDocument) {
                console.log("parse array finish.");
                return;
            }

            if (s == arrayState.Value) {
                if (t == tokenType.STring || t == tokenType.NUmber) {
                    v = tk.getValue();
                } else if (t == tokenType.BeginObject) {
                    v = this.parseObject();
                } else if (t == tokenType.BeginArray) {
                    v = this.parseArray();
                } else {
                    console.log("error token type", tk);
                    return;
                }
                a.append(v);
                console.log("parse array append object", v);
                s = arrayState.CommaOrEnd;
            } else if (s == arrayState.CommaOrEnd) {
                if (t == tokenType.SepComma) {
                    s = arrayState.Value;
                } else if (t == tokenType.EndArray) {
                    s = arrayState.End;
                } else {
                    console.log("error token type", tk);
                    return;
                }
            } else {
                console.log("error object state", s);
                return;
            }
        }

        return a;
    }

    parse(tl) {
        this.tl = tl;
        this.idx = 1;

        let root = this.parseObject();

        return root;
    }
}

class parser {
    constructor() {
    }

    parse(text) {
        let t = new tokenizer();
        let l = new lexer();

        let tl = t.parse(text);
        let root = l.parse(tl);

        console.log(root.toString());
    }

}

class zjson {
    constructor(container) {
        this.container = container;
        this.initStyle();
    }

    // init stype
    initStyle() {
        this.container.setAttribute('contenteditable', 'true');
        // this.container.setAttribute('style', 'white-space: normal; word-break: break-all; word-wrap: break-word');
    }

    // format text as json
    format(text) {
        return text;
    }

    // set text to container
    setText(text) {
        let t = this.format(text);
        this.text = t;
        this.container.innerHTML = t;
    }

    // get text from container
    getText() {
        return this.text;
    }

    // parse text to object
    parse(text) {
        let p = new parser();

        p.parse(text);
    }

    // test
    test() {
        let s = "{\
            \"name\": \"zhou\",\
            \"age\": 37,\
            \"children\": [\
              {\
                \"name\": \"zitong\"\
              }\
            ]\
          }";
          
        console.log(s);
        this.parse(s);
    }
}