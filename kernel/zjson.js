class stringElement {
    constructor(v) {
        this.v = v;
    }

    toString() {
        return "\"" + this.v + "\"";
    }
}

class numberElement {
    constructor(v) {
        this.v = v;
    }

    toString() {
        return this.v.toString();
    }
}

class integerElement {
    constructor(v) {
        this.v = v;
    }

    toString() {
        return this.v.toString();
    }
}

class booleanElement {
    constructor(v) {
        this.v = v;
    }

    toString() {
        return this.v.toString();
    }
}

class nullElement {
    constructor(v) {
        this.v = v;
    }
}

class arrayElement {
    constructor() {
        this.blankPrefix = "";
        this.v = new Array();
    }

    setBlankPrefix(bf) {
        this.blankPrefix += bf;
    }

    push(v) {
        if ((v instanceof (objectElement)) || (v instanceof arrayElement)) {
            v.setBlankPrefix(this.blankPrefix + "  ");
        }
        this.v.push(v);
    }

    toString() {
        let o = "[\r\n";
        for (const [idx, e] of this.v.entries()) {
            o += e.toString();
            if (idx != this.v.length - 1) {
                o += ",";
            }
        }
        o += "\r\n" + this.blankPrefix + "]";

        return o;
    }
}

class objectEntry {
    constructor(k, v) {
        this.k = k;
        this.v = v;
    }

    toString() {
        return "\"" + this.k + "\": " + this.v.toString();
    }
}

class objectElement {
    constructor() {
        this.blankPrefix = "";
        this.v = new Array();
    }

    setBlankPrefix(bf) {
        this.blankPrefix += bf;
    }

    appendEntry(k, v) {
        if ((v instanceof (objectElement)) || (v instanceof arrayElement)) {
            v.setBlankPrefix(this.blankPrefix + "  ");
        }
        let e = new objectEntry(k, v);
        this.v.push(e);
    }

    toString() {
        let o = this.blankPrefix + "{\r\n";
        for (const [idx, e] of this.v.entries()) {
            o += this.blankPrefix + "  " + e.toString();
            if (idx != this.v.length - 1) {
                o += ",\r\n";
            }
        }
        o += "\r\n" + this.blankPrefix + "}";

        return o;
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

    // test
    test() {
        let root = new objectElement();

        let name = new stringElement("zhou");
        root.appendEntry("name", name);

        let age = new integerElement(37);
        root.appendEntry("age", age);

        let children = new arrayElement();
        root.appendEntry("children", children);

        let zitong = new objectElement();
        let zitongName = new stringElement("zitong");
        zitong.appendEntry("name", zitongName);
        children.push(zitong);


        console.log(root.toString());
        this.container.innerHTML = root.toString();
    }
}