import {
  __async,
  __asyncGenerator,
  __await,
  __awaiter,
  __commonJS,
  __forAwait,
  __generator,
  __objRest,
  __spreadProps,
  __spreadValues,
  __toESM,
  __values
} from "./chunk-GVXZ4FXV.js";

// node_modules/fast-xml-parser/src/util.js
var require_util = __commonJS({
  "node_modules/fast-xml-parser/src/util.js"(exports) {
    "use strict";
    var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
    var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
    var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
    var regexName = new RegExp("^" + nameRegexp + "$");
    var getAllMatches = function(string, regex) {
      const matches = [];
      let match = regex.exec(string);
      while (match) {
        const allmatches = [];
        allmatches.startIndex = regex.lastIndex - match[0].length;
        const len = match.length;
        for (let index = 0; index < len; index++) {
          allmatches.push(match[index]);
        }
        matches.push(allmatches);
        match = regex.exec(string);
      }
      return matches;
    };
    var isName = function(string) {
      const match = regexName.exec(string);
      return !(match === null || typeof match === "undefined");
    };
    exports.isExist = function(v2) {
      return typeof v2 !== "undefined";
    };
    exports.isEmptyObject = function(obj) {
      return Object.keys(obj).length === 0;
    };
    exports.merge = function(target, a2, arrayMode) {
      if (a2) {
        const keys = Object.keys(a2);
        const len = keys.length;
        for (let i2 = 0; i2 < len; i2++) {
          if (arrayMode === "strict") {
            target[keys[i2]] = [a2[keys[i2]]];
          } else {
            target[keys[i2]] = a2[keys[i2]];
          }
        }
      }
    };
    exports.getValue = function(v2) {
      if (exports.isExist(v2)) {
        return v2;
      } else {
        return "";
      }
    };
    exports.isName = isName;
    exports.getAllMatches = getAllMatches;
    exports.nameRegexp = nameRegexp;
  }
});

// node_modules/fast-xml-parser/src/validator.js
var require_validator = __commonJS({
  "node_modules/fast-xml-parser/src/validator.js"(exports) {
    "use strict";
    var util = require_util();
    var defaultOptions = {
      allowBooleanAttributes: false,
      //A tag can have attributes without any value
      unpairedTags: []
    };
    exports.validate = function(xmlData, options) {
      options = Object.assign({}, defaultOptions, options);
      const tags = [];
      let tagFound = false;
      let reachedRoot = false;
      if (xmlData[0] === "\uFEFF") {
        xmlData = xmlData.substr(1);
      }
      for (let i2 = 0; i2 < xmlData.length; i2++) {
        if (xmlData[i2] === "<" && xmlData[i2 + 1] === "?") {
          i2 += 2;
          i2 = readPI(xmlData, i2);
          if (i2.err) return i2;
        } else if (xmlData[i2] === "<") {
          let tagStartPos = i2;
          i2++;
          if (xmlData[i2] === "!") {
            i2 = readCommentAndCDATA(xmlData, i2);
            continue;
          } else {
            let closingTag = false;
            if (xmlData[i2] === "/") {
              closingTag = true;
              i2++;
            }
            let tagName = "";
            for (; i2 < xmlData.length && xmlData[i2] !== ">" && xmlData[i2] !== " " && xmlData[i2] !== "	" && xmlData[i2] !== "\n" && xmlData[i2] !== "\r"; i2++) {
              tagName += xmlData[i2];
            }
            tagName = tagName.trim();
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substring(0, tagName.length - 1);
              i2--;
            }
            if (!validateTagName(tagName)) {
              let msg;
              if (tagName.trim().length === 0) {
                msg = "Invalid space after '<'.";
              } else {
                msg = "Tag '" + tagName + "' is an invalid name.";
              }
              return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i2));
            }
            const result = readAttributeStr(xmlData, i2);
            if (result === false) {
              return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i2));
            }
            let attrStr = result.value;
            i2 = result.index;
            if (attrStr[attrStr.length - 1] === "/") {
              const attrStrStart = i2 - attrStr.length;
              attrStr = attrStr.substring(0, attrStr.length - 1);
              const isValid = validateAttributeString(attrStr, options);
              if (isValid === true) {
                tagFound = true;
              } else {
                return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
              }
            } else if (closingTag) {
              if (!result.tagClosed) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i2));
              } else if (attrStr.trim().length > 0) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
              } else if (tags.length === 0) {
                return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
              } else {
                const otg = tags.pop();
                if (tagName !== otg.tagName) {
                  let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
                  return getErrorObject("InvalidTag", "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.", getLineNumberForPosition(xmlData, tagStartPos));
                }
                if (tags.length == 0) {
                  reachedRoot = true;
                }
              }
            } else {
              const isValid = validateAttributeString(attrStr, options);
              if (isValid !== true) {
                return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i2 - attrStr.length + isValid.err.line));
              }
              if (reachedRoot === true) {
                return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i2));
              } else if (options.unpairedTags.indexOf(tagName) !== -1) {
              } else {
                tags.push({
                  tagName,
                  tagStartPos
                });
              }
              tagFound = true;
            }
            for (i2++; i2 < xmlData.length; i2++) {
              if (xmlData[i2] === "<") {
                if (xmlData[i2 + 1] === "!") {
                  i2++;
                  i2 = readCommentAndCDATA(xmlData, i2);
                  continue;
                } else if (xmlData[i2 + 1] === "?") {
                  i2 = readPI(xmlData, ++i2);
                  if (i2.err) return i2;
                } else {
                  break;
                }
              } else if (xmlData[i2] === "&") {
                const afterAmp = validateAmpersand(xmlData, i2);
                if (afterAmp == -1) return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i2));
                i2 = afterAmp;
              } else {
                if (reachedRoot === true && !isWhiteSpace(xmlData[i2])) {
                  return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i2));
                }
              }
            }
            if (xmlData[i2] === "<") {
              i2--;
            }
          }
        } else {
          if (isWhiteSpace(xmlData[i2])) {
            continue;
          }
          return getErrorObject("InvalidChar", "char '" + xmlData[i2] + "' is not expected.", getLineNumberForPosition(xmlData, i2));
        }
      }
      if (!tagFound) {
        return getErrorObject("InvalidXml", "Start tag expected.", 1);
      } else if (tags.length == 1) {
        return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
      } else if (tags.length > 0) {
        return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t2) => t2.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", {
          line: 1,
          col: 1
        });
      }
      return true;
    };
    function isWhiteSpace(char) {
      return char === " " || char === "	" || char === "\n" || char === "\r";
    }
    function readPI(xmlData, i2) {
      const start = i2;
      for (; i2 < xmlData.length; i2++) {
        if (xmlData[i2] == "?" || xmlData[i2] == " ") {
          const tagname = xmlData.substr(start, i2 - start);
          if (i2 > 5 && tagname === "xml") {
            return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i2));
          } else if (xmlData[i2] == "?" && xmlData[i2 + 1] == ">") {
            i2++;
            break;
          } else {
            continue;
          }
        }
      }
      return i2;
    }
    function readCommentAndCDATA(xmlData, i2) {
      if (xmlData.length > i2 + 5 && xmlData[i2 + 1] === "-" && xmlData[i2 + 2] === "-") {
        for (i2 += 3; i2 < xmlData.length; i2++) {
          if (xmlData[i2] === "-" && xmlData[i2 + 1] === "-" && xmlData[i2 + 2] === ">") {
            i2 += 2;
            break;
          }
        }
      } else if (xmlData.length > i2 + 8 && xmlData[i2 + 1] === "D" && xmlData[i2 + 2] === "O" && xmlData[i2 + 3] === "C" && xmlData[i2 + 4] === "T" && xmlData[i2 + 5] === "Y" && xmlData[i2 + 6] === "P" && xmlData[i2 + 7] === "E") {
        let angleBracketsCount = 1;
        for (i2 += 8; i2 < xmlData.length; i2++) {
          if (xmlData[i2] === "<") {
            angleBracketsCount++;
          } else if (xmlData[i2] === ">") {
            angleBracketsCount--;
            if (angleBracketsCount === 0) {
              break;
            }
          }
        }
      } else if (xmlData.length > i2 + 9 && xmlData[i2 + 1] === "[" && xmlData[i2 + 2] === "C" && xmlData[i2 + 3] === "D" && xmlData[i2 + 4] === "A" && xmlData[i2 + 5] === "T" && xmlData[i2 + 6] === "A" && xmlData[i2 + 7] === "[") {
        for (i2 += 8; i2 < xmlData.length; i2++) {
          if (xmlData[i2] === "]" && xmlData[i2 + 1] === "]" && xmlData[i2 + 2] === ">") {
            i2 += 2;
            break;
          }
        }
      }
      return i2;
    }
    var doubleQuote = '"';
    var singleQuote = "'";
    function readAttributeStr(xmlData, i2) {
      let attrStr = "";
      let startChar = "";
      let tagClosed = false;
      for (; i2 < xmlData.length; i2++) {
        if (xmlData[i2] === doubleQuote || xmlData[i2] === singleQuote) {
          if (startChar === "") {
            startChar = xmlData[i2];
          } else if (startChar !== xmlData[i2]) {
          } else {
            startChar = "";
          }
        } else if (xmlData[i2] === ">") {
          if (startChar === "") {
            tagClosed = true;
            break;
          }
        }
        attrStr += xmlData[i2];
      }
      if (startChar !== "") {
        return false;
      }
      return {
        value: attrStr,
        index: i2,
        tagClosed
      };
    }
    var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
    function validateAttributeString(attrStr, options) {
      const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
      const attrNames = {};
      for (let i2 = 0; i2 < matches.length; i2++) {
        if (matches[i2][1].length === 0) {
          return getErrorObject("InvalidAttr", "Attribute '" + matches[i2][2] + "' has no space in starting.", getPositionFromMatch(matches[i2]));
        } else if (matches[i2][3] !== void 0 && matches[i2][4] === void 0) {
          return getErrorObject("InvalidAttr", "Attribute '" + matches[i2][2] + "' is without value.", getPositionFromMatch(matches[i2]));
        } else if (matches[i2][3] === void 0 && !options.allowBooleanAttributes) {
          return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i2][2] + "' is not allowed.", getPositionFromMatch(matches[i2]));
        }
        const attrName = matches[i2][2];
        if (!validateAttrName(attrName)) {
          return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i2]));
        }
        if (!attrNames.hasOwnProperty(attrName)) {
          attrNames[attrName] = 1;
        } else {
          return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i2]));
        }
      }
      return true;
    }
    function validateNumberAmpersand(xmlData, i2) {
      let re = /\d/;
      if (xmlData[i2] === "x") {
        i2++;
        re = /[\da-fA-F]/;
      }
      for (; i2 < xmlData.length; i2++) {
        if (xmlData[i2] === ";") return i2;
        if (!xmlData[i2].match(re)) break;
      }
      return -1;
    }
    function validateAmpersand(xmlData, i2) {
      i2++;
      if (xmlData[i2] === ";") return -1;
      if (xmlData[i2] === "#") {
        i2++;
        return validateNumberAmpersand(xmlData, i2);
      }
      let count = 0;
      for (; i2 < xmlData.length; i2++, count++) {
        if (xmlData[i2].match(/\w/) && count < 20) continue;
        if (xmlData[i2] === ";") break;
        return -1;
      }
      return i2;
    }
    function getErrorObject(code, message, lineNumber) {
      return {
        err: {
          code,
          msg: message,
          line: lineNumber.line || lineNumber,
          col: lineNumber.col
        }
      };
    }
    function validateAttrName(attrName) {
      return util.isName(attrName);
    }
    function validateTagName(tagname) {
      return util.isName(tagname);
    }
    function getLineNumberForPosition(xmlData, index) {
      const lines = xmlData.substring(0, index).split(/\r?\n/);
      return {
        line: lines.length,
        // column number is last line's length + 1, because column numbering starts at 1:
        col: lines[lines.length - 1].length + 1
      };
    }
    function getPositionFromMatch(match) {
      return match.startIndex + match[1].length;
    }
  }
});

// node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var require_OptionsBuilder = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js"(exports) {
    var defaultOptions = {
      preserveOrder: false,
      attributeNamePrefix: "@_",
      attributesGroupName: false,
      textNodeName: "#text",
      ignoreAttributes: true,
      removeNSPrefix: false,
      // remove NS from tag name or attribute name if true
      allowBooleanAttributes: false,
      //a tag can have attributes without any value
      //ignoreRootElement : false,
      parseTagValue: true,
      parseAttributeValue: false,
      trimValues: true,
      //Trim string values of tag and attributes
      cdataPropName: false,
      numberParseOptions: {
        hex: true,
        leadingZeros: true,
        eNotation: true
      },
      tagValueProcessor: function(tagName, val2) {
        return val2;
      },
      attributeValueProcessor: function(attrName, val2) {
        return val2;
      },
      stopNodes: [],
      //nested tags will not be parsed even for errors
      alwaysCreateTextNode: false,
      isArray: () => false,
      commentPropName: false,
      unpairedTags: [],
      processEntities: true,
      htmlEntities: false,
      ignoreDeclaration: false,
      ignorePiTags: false,
      transformTagName: false,
      transformAttributeName: false,
      updateTag: function(tagName, jPath, attrs) {
        return tagName;
      }
      // skipEmptyListItem: false
    };
    var buildOptions = function(options) {
      return Object.assign({}, defaultOptions, options);
    };
    exports.buildOptions = buildOptions;
    exports.defaultOptions = defaultOptions;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var require_xmlNode = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/xmlNode.js"(exports, module) {
    "use strict";
    var XmlNode2 = class {
      constructor(tagname) {
        this.tagname = tagname;
        this.child = [];
        this[":@"] = {};
      }
      add(key, val2) {
        if (key === "__proto__") key = "#__proto__";
        this.child.push({
          [key]: val2
        });
      }
      addChild(node) {
        if (node.tagname === "__proto__") node.tagname = "#__proto__";
        if (node[":@"] && Object.keys(node[":@"]).length > 0) {
          this.child.push({
            [node.tagname]: node.child,
            [":@"]: node[":@"]
          });
        } else {
          this.child.push({
            [node.tagname]: node.child
          });
        }
      }
    };
    module.exports = XmlNode2;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var require_DocTypeReader = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js"(exports, module) {
    var util = require_util();
    function readDocType(xmlData, i2) {
      const entities = {};
      if (xmlData[i2 + 3] === "O" && xmlData[i2 + 4] === "C" && xmlData[i2 + 5] === "T" && xmlData[i2 + 6] === "Y" && xmlData[i2 + 7] === "P" && xmlData[i2 + 8] === "E") {
        i2 = i2 + 9;
        let angleBracketsCount = 1;
        let hasBody = false, comment = false;
        let exp = "";
        for (; i2 < xmlData.length; i2++) {
          if (xmlData[i2] === "<" && !comment) {
            if (hasBody && isEntity(xmlData, i2)) {
              i2 += 7;
              [entityName, val, i2] = readEntityExp(xmlData, i2 + 1);
              if (val.indexOf("&") === -1)
                entities[validateEntityName(entityName)] = {
                  regx: RegExp(`&${entityName};`, "g"),
                  val
                };
            } else if (hasBody && isElement(xmlData, i2)) i2 += 8;
            else if (hasBody && isAttlist(xmlData, i2)) i2 += 8;
            else if (hasBody && isNotation(xmlData, i2)) i2 += 9;
            else if (isComment) comment = true;
            else throw new Error("Invalid DOCTYPE");
            angleBracketsCount++;
            exp = "";
          } else if (xmlData[i2] === ">") {
            if (comment) {
              if (xmlData[i2 - 1] === "-" && xmlData[i2 - 2] === "-") {
                comment = false;
                angleBracketsCount--;
              }
            } else {
              angleBracketsCount--;
            }
            if (angleBracketsCount === 0) {
              break;
            }
          } else if (xmlData[i2] === "[") {
            hasBody = true;
          } else {
            exp += xmlData[i2];
          }
        }
        if (angleBracketsCount !== 0) {
          throw new Error(`Unclosed DOCTYPE`);
        }
      } else {
        throw new Error(`Invalid Tag instead of DOCTYPE`);
      }
      return {
        entities,
        i: i2
      };
    }
    function readEntityExp(xmlData, i2) {
      let entityName2 = "";
      for (; i2 < xmlData.length && xmlData[i2] !== "'" && xmlData[i2] !== '"'; i2++) {
        entityName2 += xmlData[i2];
      }
      entityName2 = entityName2.trim();
      if (entityName2.indexOf(" ") !== -1) throw new Error("External entites are not supported");
      const startChar = xmlData[i2++];
      let val2 = "";
      for (; i2 < xmlData.length && xmlData[i2] !== startChar; i2++) {
        val2 += xmlData[i2];
      }
      return [entityName2, val2, i2];
    }
    function isComment(xmlData, i2) {
      if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "-" && xmlData[i2 + 3] === "-") return true;
      return false;
    }
    function isEntity(xmlData, i2) {
      if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "E" && xmlData[i2 + 3] === "N" && xmlData[i2 + 4] === "T" && xmlData[i2 + 5] === "I" && xmlData[i2 + 6] === "T" && xmlData[i2 + 7] === "Y") return true;
      return false;
    }
    function isElement(xmlData, i2) {
      if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "E" && xmlData[i2 + 3] === "L" && xmlData[i2 + 4] === "E" && xmlData[i2 + 5] === "M" && xmlData[i2 + 6] === "E" && xmlData[i2 + 7] === "N" && xmlData[i2 + 8] === "T") return true;
      return false;
    }
    function isAttlist(xmlData, i2) {
      if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "A" && xmlData[i2 + 3] === "T" && xmlData[i2 + 4] === "T" && xmlData[i2 + 5] === "L" && xmlData[i2 + 6] === "I" && xmlData[i2 + 7] === "S" && xmlData[i2 + 8] === "T") return true;
      return false;
    }
    function isNotation(xmlData, i2) {
      if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "N" && xmlData[i2 + 3] === "O" && xmlData[i2 + 4] === "T" && xmlData[i2 + 5] === "A" && xmlData[i2 + 6] === "T" && xmlData[i2 + 7] === "I" && xmlData[i2 + 8] === "O" && xmlData[i2 + 9] === "N") return true;
      return false;
    }
    function validateEntityName(name) {
      if (util.isName(name)) return name;
      else throw new Error(`Invalid entity name ${name}`);
    }
    module.exports = readDocType;
  }
});

// node_modules/strnum/strnum.js
var require_strnum = __commonJS({
  "node_modules/strnum/strnum.js"(exports, module) {
    var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
    var numRegex = /^([\-\+])?(0*)(\.[0-9]+([eE]\-?[0-9]+)?|[0-9]+(\.[0-9]+([eE]\-?[0-9]+)?)?)$/;
    if (!Number.parseInt && window.parseInt) {
      Number.parseInt = window.parseInt;
    }
    if (!Number.parseFloat && window.parseFloat) {
      Number.parseFloat = window.parseFloat;
    }
    var consider = {
      hex: true,
      leadingZeros: true,
      decimalPoint: ".",
      eNotation: true
      //skipLike: /regex/
    };
    function toNumber(str, options = {}) {
      options = Object.assign({}, consider, options);
      if (!str || typeof str !== "string") return str;
      let trimmedStr = str.trim();
      if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
      else if (options.hex && hexRegex.test(trimmedStr)) {
        return Number.parseInt(trimmedStr, 16);
      } else {
        const match = numRegex.exec(trimmedStr);
        if (match) {
          const sign = match[1];
          const leadingZeros = match[2];
          let numTrimmedByZeros = trimZeros(match[3]);
          const eNotation = match[4] || match[6];
          if (!options.leadingZeros && leadingZeros.length > 0 && sign && trimmedStr[2] !== ".") return str;
          else if (!options.leadingZeros && leadingZeros.length > 0 && !sign && trimmedStr[1] !== ".") return str;
          else {
            const num = Number(trimmedStr);
            const numStr = "" + num;
            if (numStr.search(/[eE]/) !== -1) {
              if (options.eNotation) return num;
              else return str;
            } else if (eNotation) {
              if (options.eNotation) return num;
              else return str;
            } else if (trimmedStr.indexOf(".") !== -1) {
              if (numStr === "0" && numTrimmedByZeros === "") return num;
              else if (numStr === numTrimmedByZeros) return num;
              else if (sign && numStr === "-" + numTrimmedByZeros) return num;
              else return str;
            }
            if (leadingZeros) {
              if (numTrimmedByZeros === numStr) return num;
              else if (sign + numTrimmedByZeros === numStr) return num;
              else return str;
            }
            if (trimmedStr === numStr) return num;
            else if (trimmedStr === sign + numStr) return num;
            return str;
          }
        } else {
          return str;
        }
      }
    }
    function trimZeros(numStr) {
      if (numStr && numStr.indexOf(".") !== -1) {
        numStr = numStr.replace(/0+$/, "");
        if (numStr === ".") numStr = "0";
        else if (numStr[0] === ".") numStr = "0" + numStr;
        else if (numStr[numStr.length - 1] === ".") numStr = numStr.substr(0, numStr.length - 1);
        return numStr;
      }
      return numStr;
    }
    module.exports = toNumber;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
var require_OrderedObjParser = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js"(exports, module) {
    "use strict";
    var util = require_util();
    var xmlNode = require_xmlNode();
    var readDocType = require_DocTypeReader();
    var toNumber = require_strnum();
    var OrderedObjParser = class {
      constructor(options) {
        this.options = options;
        this.currentNode = null;
        this.tagsNodeStack = [];
        this.docTypeEntities = {};
        this.lastEntities = {
          "apos": {
            regex: /&(apos|#39|#x27);/g,
            val: "'"
          },
          "gt": {
            regex: /&(gt|#62|#x3E);/g,
            val: ">"
          },
          "lt": {
            regex: /&(lt|#60|#x3C);/g,
            val: "<"
          },
          "quot": {
            regex: /&(quot|#34|#x22);/g,
            val: '"'
          }
        };
        this.ampEntity = {
          regex: /&(amp|#38|#x26);/g,
          val: "&"
        };
        this.htmlEntities = {
          "space": {
            regex: /&(nbsp|#160);/g,
            val: " "
          },
          // "lt" : { regex: /&(lt|#60);/g, val: "<" },
          // "gt" : { regex: /&(gt|#62);/g, val: ">" },
          // "amp" : { regex: /&(amp|#38);/g, val: "&" },
          // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
          // "apos" : { regex: /&(apos|#39);/g, val: "'" },
          "cent": {
            regex: /&(cent|#162);/g,
            val: "¢"
          },
          "pound": {
            regex: /&(pound|#163);/g,
            val: "£"
          },
          "yen": {
            regex: /&(yen|#165);/g,
            val: "¥"
          },
          "euro": {
            regex: /&(euro|#8364);/g,
            val: "€"
          },
          "copyright": {
            regex: /&(copy|#169);/g,
            val: "©"
          },
          "reg": {
            regex: /&(reg|#174);/g,
            val: "®"
          },
          "inr": {
            regex: /&(inr|#8377);/g,
            val: "₹"
          },
          "num_dec": {
            regex: /&#([0-9]{1,7});/g,
            val: (_, str) => String.fromCharCode(Number.parseInt(str, 10))
          },
          "num_hex": {
            regex: /&#x([0-9a-fA-F]{1,6});/g,
            val: (_, str) => String.fromCharCode(Number.parseInt(str, 16))
          }
        };
        this.addExternalEntities = addExternalEntities;
        this.parseXml = parseXml;
        this.parseTextData = parseTextData;
        this.resolveNameSpace = resolveNameSpace;
        this.buildAttributesMap = buildAttributesMap;
        this.isItStopNode = isItStopNode;
        this.replaceEntitiesValue = replaceEntitiesValue;
        this.readStopNodeData = readStopNodeData;
        this.saveTextToParentTag = saveTextToParentTag;
        this.addChild = addChild;
      }
    };
    function addExternalEntities(externalEntities) {
      const entKeys = Object.keys(externalEntities);
      for (let i2 = 0; i2 < entKeys.length; i2++) {
        const ent = entKeys[i2];
        this.lastEntities[ent] = {
          regex: new RegExp("&" + ent + ";", "g"),
          val: externalEntities[ent]
        };
      }
    }
    function parseTextData(val2, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
      if (val2 !== void 0) {
        if (this.options.trimValues && !dontTrim) {
          val2 = val2.trim();
        }
        if (val2.length > 0) {
          if (!escapeEntities) val2 = this.replaceEntitiesValue(val2);
          const newval = this.options.tagValueProcessor(tagName, val2, jPath, hasAttributes, isLeafNode);
          if (newval === null || newval === void 0) {
            return val2;
          } else if (typeof newval !== typeof val2 || newval !== val2) {
            return newval;
          } else if (this.options.trimValues) {
            return parseValue(val2, this.options.parseTagValue, this.options.numberParseOptions);
          } else {
            const trimmedVal = val2.trim();
            if (trimmedVal === val2) {
              return parseValue(val2, this.options.parseTagValue, this.options.numberParseOptions);
            } else {
              return val2;
            }
          }
        }
      }
    }
    function resolveNameSpace(tagname) {
      if (this.options.removeNSPrefix) {
        const tags = tagname.split(":");
        const prefix = tagname.charAt(0) === "/" ? "/" : "";
        if (tags[0] === "xmlns") {
          return "";
        }
        if (tags.length === 2) {
          tagname = prefix + tags[1];
        }
      }
      return tagname;
    }
    var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
    function buildAttributesMap(attrStr, jPath, tagName) {
      if (!this.options.ignoreAttributes && typeof attrStr === "string") {
        const matches = util.getAllMatches(attrStr, attrsRegx);
        const len = matches.length;
        const attrs = {};
        for (let i2 = 0; i2 < len; i2++) {
          const attrName = this.resolveNameSpace(matches[i2][1]);
          let oldVal = matches[i2][4];
          let aName = this.options.attributeNamePrefix + attrName;
          if (attrName.length) {
            if (this.options.transformAttributeName) {
              aName = this.options.transformAttributeName(aName);
            }
            if (aName === "__proto__") aName = "#__proto__";
            if (oldVal !== void 0) {
              if (this.options.trimValues) {
                oldVal = oldVal.trim();
              }
              oldVal = this.replaceEntitiesValue(oldVal);
              const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
              if (newVal === null || newVal === void 0) {
                attrs[aName] = oldVal;
              } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
                attrs[aName] = newVal;
              } else {
                attrs[aName] = parseValue(oldVal, this.options.parseAttributeValue, this.options.numberParseOptions);
              }
            } else if (this.options.allowBooleanAttributes) {
              attrs[aName] = true;
            }
          }
        }
        if (!Object.keys(attrs).length) {
          return;
        }
        if (this.options.attributesGroupName) {
          const attrCollection = {};
          attrCollection[this.options.attributesGroupName] = attrs;
          return attrCollection;
        }
        return attrs;
      }
    }
    var parseXml = function(xmlData) {
      xmlData = xmlData.replace(/\r\n?/g, "\n");
      const xmlObj = new xmlNode("!xml");
      let currentNode = xmlObj;
      let textData = "";
      let jPath = "";
      for (let i2 = 0; i2 < xmlData.length; i2++) {
        const ch2 = xmlData[i2];
        if (ch2 === "<") {
          if (xmlData[i2 + 1] === "/") {
            const closeIndex = findClosingIndex(xmlData, ">", i2, "Closing Tag is not closed.");
            let tagName = xmlData.substring(i2 + 2, closeIndex).trim();
            if (this.options.removeNSPrefix) {
              const colonIndex = tagName.indexOf(":");
              if (colonIndex !== -1) {
                tagName = tagName.substr(colonIndex + 1);
              }
            }
            if (this.options.transformTagName) {
              tagName = this.options.transformTagName(tagName);
            }
            if (currentNode) {
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
            }
            const lastTagName = jPath.substring(jPath.lastIndexOf(".") + 1);
            if (tagName && this.options.unpairedTags.indexOf(tagName) !== -1) {
              throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
            }
            let propIndex = 0;
            if (lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1) {
              propIndex = jPath.lastIndexOf(".", jPath.lastIndexOf(".") - 1);
              this.tagsNodeStack.pop();
            } else {
              propIndex = jPath.lastIndexOf(".");
            }
            jPath = jPath.substring(0, propIndex);
            currentNode = this.tagsNodeStack.pop();
            textData = "";
            i2 = closeIndex;
          } else if (xmlData[i2 + 1] === "?") {
            let tagData = readTagExp(xmlData, i2, false, "?>");
            if (!tagData) throw new Error("Pi Tag is not closed.");
            textData = this.saveTextToParentTag(textData, currentNode, jPath);
            if (this.options.ignoreDeclaration && tagData.tagName === "?xml" || this.options.ignorePiTags) {
            } else {
              const childNode = new xmlNode(tagData.tagName);
              childNode.add(this.options.textNodeName, "");
              if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
                childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath, tagData.tagName);
              }
              this.addChild(currentNode, childNode, jPath);
            }
            i2 = tagData.closeIndex + 1;
          } else if (xmlData.substr(i2 + 1, 3) === "!--") {
            const endIndex = findClosingIndex(xmlData, "-->", i2 + 4, "Comment is not closed.");
            if (this.options.commentPropName) {
              const comment = xmlData.substring(i2 + 4, endIndex - 2);
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
              currentNode.add(this.options.commentPropName, [{
                [this.options.textNodeName]: comment
              }]);
            }
            i2 = endIndex;
          } else if (xmlData.substr(i2 + 1, 2) === "!D") {
            const result = readDocType(xmlData, i2);
            this.docTypeEntities = result.entities;
            i2 = result.i;
          } else if (xmlData.substr(i2 + 1, 2) === "![") {
            const closeIndex = findClosingIndex(xmlData, "]]>", i2, "CDATA is not closed.") - 2;
            const tagExp = xmlData.substring(i2 + 9, closeIndex);
            textData = this.saveTextToParentTag(textData, currentNode, jPath);
            let val2 = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
            if (val2 == void 0) val2 = "";
            if (this.options.cdataPropName) {
              currentNode.add(this.options.cdataPropName, [{
                [this.options.textNodeName]: tagExp
              }]);
            } else {
              currentNode.add(this.options.textNodeName, val2);
            }
            i2 = closeIndex + 2;
          } else {
            let result = readTagExp(xmlData, i2, this.options.removeNSPrefix);
            let tagName = result.tagName;
            const rawTagName = result.rawTagName;
            let tagExp = result.tagExp;
            let attrExpPresent = result.attrExpPresent;
            let closeIndex = result.closeIndex;
            if (this.options.transformTagName) {
              tagName = this.options.transformTagName(tagName);
            }
            if (currentNode && textData) {
              if (currentNode.tagname !== "!xml") {
                textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
              }
            }
            const lastTag = currentNode;
            if (lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1) {
              currentNode = this.tagsNodeStack.pop();
              jPath = jPath.substring(0, jPath.lastIndexOf("."));
            }
            if (tagName !== xmlObj.tagname) {
              jPath += jPath ? "." + tagName : tagName;
            }
            if (this.isItStopNode(this.options.stopNodes, jPath, tagName)) {
              let tagContent = "";
              if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
                if (tagName[tagName.length - 1] === "/") {
                  tagName = tagName.substr(0, tagName.length - 1);
                  jPath = jPath.substr(0, jPath.length - 1);
                  tagExp = tagName;
                } else {
                  tagExp = tagExp.substr(0, tagExp.length - 1);
                }
                i2 = result.closeIndex;
              } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
                i2 = result.closeIndex;
              } else {
                const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
                if (!result2) throw new Error(`Unexpected end of ${rawTagName}`);
                i2 = result2.i;
                tagContent = result2.tagContent;
              }
              const childNode = new xmlNode(tagName);
              if (tagName !== tagExp && attrExpPresent) {
                childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
              }
              if (tagContent) {
                tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
              }
              jPath = jPath.substr(0, jPath.lastIndexOf("."));
              childNode.add(this.options.textNodeName, tagContent);
              this.addChild(currentNode, childNode, jPath);
            } else {
              if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
                if (tagName[tagName.length - 1] === "/") {
                  tagName = tagName.substr(0, tagName.length - 1);
                  jPath = jPath.substr(0, jPath.length - 1);
                  tagExp = tagName;
                } else {
                  tagExp = tagExp.substr(0, tagExp.length - 1);
                }
                if (this.options.transformTagName) {
                  tagName = this.options.transformTagName(tagName);
                }
                const childNode = new xmlNode(tagName);
                if (tagName !== tagExp && attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
                }
                this.addChild(currentNode, childNode, jPath);
                jPath = jPath.substr(0, jPath.lastIndexOf("."));
              } else {
                const childNode = new xmlNode(tagName);
                this.tagsNodeStack.push(currentNode);
                if (tagName !== tagExp && attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
                }
                this.addChild(currentNode, childNode, jPath);
                currentNode = childNode;
              }
              textData = "";
              i2 = closeIndex;
            }
          }
        } else {
          textData += xmlData[i2];
        }
      }
      return xmlObj.child;
    };
    function addChild(currentNode, childNode, jPath) {
      const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"]);
      if (result === false) {
      } else if (typeof result === "string") {
        childNode.tagname = result;
        currentNode.addChild(childNode);
      } else {
        currentNode.addChild(childNode);
      }
    }
    var replaceEntitiesValue = function(val2) {
      if (this.options.processEntities) {
        for (let entityName2 in this.docTypeEntities) {
          const entity = this.docTypeEntities[entityName2];
          val2 = val2.replace(entity.regx, entity.val);
        }
        for (let entityName2 in this.lastEntities) {
          const entity = this.lastEntities[entityName2];
          val2 = val2.replace(entity.regex, entity.val);
        }
        if (this.options.htmlEntities) {
          for (let entityName2 in this.htmlEntities) {
            const entity = this.htmlEntities[entityName2];
            val2 = val2.replace(entity.regex, entity.val);
          }
        }
        val2 = val2.replace(this.ampEntity.regex, this.ampEntity.val);
      }
      return val2;
    };
    function saveTextToParentTag(textData, currentNode, jPath, isLeafNode) {
      if (textData) {
        if (isLeafNode === void 0) isLeafNode = Object.keys(currentNode.child).length === 0;
        textData = this.parseTextData(textData, currentNode.tagname, jPath, false, currentNode[":@"] ? Object.keys(currentNode[":@"]).length !== 0 : false, isLeafNode);
        if (textData !== void 0 && textData !== "") currentNode.add(this.options.textNodeName, textData);
        textData = "";
      }
      return textData;
    }
    function isItStopNode(stopNodes, jPath, currentTagName) {
      const allNodesExp = "*." + currentTagName;
      for (const stopNodePath in stopNodes) {
        const stopNodeExp = stopNodes[stopNodePath];
        if (allNodesExp === stopNodeExp || jPath === stopNodeExp) return true;
      }
      return false;
    }
    function tagExpWithClosingIndex(xmlData, i2, closingChar = ">") {
      let attrBoundary;
      let tagExp = "";
      for (let index = i2; index < xmlData.length; index++) {
        let ch2 = xmlData[index];
        if (attrBoundary) {
          if (ch2 === attrBoundary) attrBoundary = "";
        } else if (ch2 === '"' || ch2 === "'") {
          attrBoundary = ch2;
        } else if (ch2 === closingChar[0]) {
          if (closingChar[1]) {
            if (xmlData[index + 1] === closingChar[1]) {
              return {
                data: tagExp,
                index
              };
            }
          } else {
            return {
              data: tagExp,
              index
            };
          }
        } else if (ch2 === "	") {
          ch2 = " ";
        }
        tagExp += ch2;
      }
    }
    function findClosingIndex(xmlData, str, i2, errMsg) {
      const closingIndex = xmlData.indexOf(str, i2);
      if (closingIndex === -1) {
        throw new Error(errMsg);
      } else {
        return closingIndex + str.length - 1;
      }
    }
    function readTagExp(xmlData, i2, removeNSPrefix, closingChar = ">") {
      const result = tagExpWithClosingIndex(xmlData, i2 + 1, closingChar);
      if (!result) return;
      let tagExp = result.data;
      const closeIndex = result.index;
      const separatorIndex = tagExp.search(/\s/);
      let tagName = tagExp;
      let attrExpPresent = true;
      if (separatorIndex !== -1) {
        tagName = tagExp.substring(0, separatorIndex);
        tagExp = tagExp.substring(separatorIndex + 1).trimStart();
      }
      const rawTagName = tagName;
      if (removeNSPrefix) {
        const colonIndex = tagName.indexOf(":");
        if (colonIndex !== -1) {
          tagName = tagName.substr(colonIndex + 1);
          attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
        }
      }
      return {
        tagName,
        tagExp,
        closeIndex,
        attrExpPresent,
        rawTagName
      };
    }
    function readStopNodeData(xmlData, tagName, i2) {
      const startIndex = i2;
      let openTagCount = 1;
      for (; i2 < xmlData.length; i2++) {
        if (xmlData[i2] === "<") {
          if (xmlData[i2 + 1] === "/") {
            const closeIndex = findClosingIndex(xmlData, ">", i2, `${tagName} is not closed`);
            let closeTagName = xmlData.substring(i2 + 2, closeIndex).trim();
            if (closeTagName === tagName) {
              openTagCount--;
              if (openTagCount === 0) {
                return {
                  tagContent: xmlData.substring(startIndex, i2),
                  i: closeIndex
                };
              }
            }
            i2 = closeIndex;
          } else if (xmlData[i2 + 1] === "?") {
            const closeIndex = findClosingIndex(xmlData, "?>", i2 + 1, "StopNode is not closed.");
            i2 = closeIndex;
          } else if (xmlData.substr(i2 + 1, 3) === "!--") {
            const closeIndex = findClosingIndex(xmlData, "-->", i2 + 3, "StopNode is not closed.");
            i2 = closeIndex;
          } else if (xmlData.substr(i2 + 1, 2) === "![") {
            const closeIndex = findClosingIndex(xmlData, "]]>", i2, "StopNode is not closed.") - 2;
            i2 = closeIndex;
          } else {
            const tagData = readTagExp(xmlData, i2, ">");
            if (tagData) {
              const openTagName = tagData && tagData.tagName;
              if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
                openTagCount++;
              }
              i2 = tagData.closeIndex;
            }
          }
        }
      }
    }
    function parseValue(val2, shouldParse, options) {
      if (shouldParse && typeof val2 === "string") {
        const newval = val2.trim();
        if (newval === "true") return true;
        else if (newval === "false") return false;
        else return toNumber(val2, options);
      } else {
        if (util.isExist(val2)) {
          return val2;
        } else {
          return "";
        }
      }
    }
    module.exports = OrderedObjParser;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/node2json.js
var require_node2json = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/node2json.js"(exports) {
    "use strict";
    function prettify(node, options) {
      return compress(node, options);
    }
    function compress(arr, options, jPath) {
      let text;
      const compressedObj = {};
      for (let i2 = 0; i2 < arr.length; i2++) {
        const tagObj = arr[i2];
        const property = propName(tagObj);
        let newJpath = "";
        if (jPath === void 0) newJpath = property;
        else newJpath = jPath + "." + property;
        if (property === options.textNodeName) {
          if (text === void 0) text = tagObj[property];
          else text += "" + tagObj[property];
        } else if (property === void 0) {
          continue;
        } else if (tagObj[property]) {
          let val2 = compress(tagObj[property], options, newJpath);
          const isLeaf = isLeafTag(val2, options);
          if (tagObj[":@"]) {
            assignAttributes(val2, tagObj[":@"], newJpath, options);
          } else if (Object.keys(val2).length === 1 && val2[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
            val2 = val2[options.textNodeName];
          } else if (Object.keys(val2).length === 0) {
            if (options.alwaysCreateTextNode) val2[options.textNodeName] = "";
            else val2 = "";
          }
          if (compressedObj[property] !== void 0 && compressedObj.hasOwnProperty(property)) {
            if (!Array.isArray(compressedObj[property])) {
              compressedObj[property] = [compressedObj[property]];
            }
            compressedObj[property].push(val2);
          } else {
            if (options.isArray(property, newJpath, isLeaf)) {
              compressedObj[property] = [val2];
            } else {
              compressedObj[property] = val2;
            }
          }
        }
      }
      if (typeof text === "string") {
        if (text.length > 0) compressedObj[options.textNodeName] = text;
      } else if (text !== void 0) compressedObj[options.textNodeName] = text;
      return compressedObj;
    }
    function propName(obj) {
      const keys = Object.keys(obj);
      for (let i2 = 0; i2 < keys.length; i2++) {
        const key = keys[i2];
        if (key !== ":@") return key;
      }
    }
    function assignAttributes(obj, attrMap, jpath, options) {
      if (attrMap) {
        const keys = Object.keys(attrMap);
        const len = keys.length;
        for (let i2 = 0; i2 < len; i2++) {
          const atrrName = keys[i2];
          if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
            obj[atrrName] = [attrMap[atrrName]];
          } else {
            obj[atrrName] = attrMap[atrrName];
          }
        }
      }
    }
    function isLeafTag(obj, options) {
      const {
        textNodeName
      } = options;
      const propCount = Object.keys(obj).length;
      if (propCount === 0) {
        return true;
      }
      if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
        return true;
      }
      return false;
    }
    exports.prettify = prettify;
  }
});

// node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var require_XMLParser = __commonJS({
  "node_modules/fast-xml-parser/src/xmlparser/XMLParser.js"(exports, module) {
    var {
      buildOptions
    } = require_OptionsBuilder();
    var OrderedObjParser = require_OrderedObjParser();
    var {
      prettify
    } = require_node2json();
    var validator = require_validator();
    var XMLParser2 = class {
      constructor(options) {
        this.externalEntities = {};
        this.options = buildOptions(options);
      }
      /**
       * Parse XML dats to JS object 
       * @param {string|Buffer} xmlData 
       * @param {boolean|Object} validationOption 
       */
      parse(xmlData, validationOption) {
        if (typeof xmlData === "string") {
        } else if (xmlData.toString) {
          xmlData = xmlData.toString();
        } else {
          throw new Error("XML data is accepted in String or Bytes[] form.");
        }
        if (validationOption) {
          if (validationOption === true) validationOption = {};
          const result = validator.validate(xmlData, validationOption);
          if (result !== true) {
            throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
          }
        }
        const orderedObjParser = new OrderedObjParser(this.options);
        orderedObjParser.addExternalEntities(this.externalEntities);
        const orderedResult = orderedObjParser.parseXml(xmlData);
        if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
        else return prettify(orderedResult, this.options);
      }
      /**
       * Add Entity which is not by default supported by this library
       * @param {string} key 
       * @param {string} value 
       */
      addEntity(key, value) {
        if (value.indexOf("&") !== -1) {
          throw new Error("Entity value can't have '&'");
        } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
          throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
        } else if (value === "&") {
          throw new Error("An entity with value '&' is not permitted");
        } else {
          this.externalEntities[key] = value;
        }
      }
    };
    module.exports = XMLParser2;
  }
});

// node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js
var require_orderedJs2Xml = __commonJS({
  "node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js"(exports, module) {
    var EOL = "\n";
    function toXml(jArray, options) {
      let indentation = "";
      if (options.format && options.indentBy.length > 0) {
        indentation = EOL;
      }
      return arrToStr(jArray, options, "", indentation);
    }
    function arrToStr(arr, options, jPath, indentation) {
      let xmlStr = "";
      let isPreviousElementTag = false;
      for (let i2 = 0; i2 < arr.length; i2++) {
        const tagObj = arr[i2];
        const tagName = propName(tagObj);
        if (tagName === void 0) continue;
        let newJPath = "";
        if (jPath.length === 0) newJPath = tagName;
        else newJPath = `${jPath}.${tagName}`;
        if (tagName === options.textNodeName) {
          let tagText = tagObj[tagName];
          if (!isStopNode(newJPath, options)) {
            tagText = options.tagValueProcessor(tagName, tagText);
            tagText = replaceEntitiesValue(tagText, options);
          }
          if (isPreviousElementTag) {
            xmlStr += indentation;
          }
          xmlStr += tagText;
          isPreviousElementTag = false;
          continue;
        } else if (tagName === options.cdataPropName) {
          if (isPreviousElementTag) {
            xmlStr += indentation;
          }
          xmlStr += `<![CDATA[${tagObj[tagName][0][options.textNodeName]}]]>`;
          isPreviousElementTag = false;
          continue;
        } else if (tagName === options.commentPropName) {
          xmlStr += indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
          isPreviousElementTag = true;
          continue;
        } else if (tagName[0] === "?") {
          const attStr2 = attr_to_str(tagObj[":@"], options);
          const tempInd = tagName === "?xml" ? "" : indentation;
          let piTextNodeName = tagObj[tagName][0][options.textNodeName];
          piTextNodeName = piTextNodeName.length !== 0 ? " " + piTextNodeName : "";
          xmlStr += tempInd + `<${tagName}${piTextNodeName}${attStr2}?>`;
          isPreviousElementTag = true;
          continue;
        }
        let newIdentation = indentation;
        if (newIdentation !== "") {
          newIdentation += options.indentBy;
        }
        const attStr = attr_to_str(tagObj[":@"], options);
        const tagStart = indentation + `<${tagName}${attStr}`;
        const tagValue = arrToStr(tagObj[tagName], options, newJPath, newIdentation);
        if (options.unpairedTags.indexOf(tagName) !== -1) {
          if (options.suppressUnpairedNode) xmlStr += tagStart + ">";
          else xmlStr += tagStart + "/>";
        } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
          xmlStr += tagStart + "/>";
        } else if (tagValue && tagValue.endsWith(">")) {
          xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
        } else {
          xmlStr += tagStart + ">";
          if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
            xmlStr += indentation + options.indentBy + tagValue + indentation;
          } else {
            xmlStr += tagValue;
          }
          xmlStr += `</${tagName}>`;
        }
        isPreviousElementTag = true;
      }
      return xmlStr;
    }
    function propName(obj) {
      const keys = Object.keys(obj);
      for (let i2 = 0; i2 < keys.length; i2++) {
        const key = keys[i2];
        if (!obj.hasOwnProperty(key)) continue;
        if (key !== ":@") return key;
      }
    }
    function attr_to_str(attrMap, options) {
      let attrStr = "";
      if (attrMap && !options.ignoreAttributes) {
        for (let attr in attrMap) {
          if (!attrMap.hasOwnProperty(attr)) continue;
          let attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
          attrVal = replaceEntitiesValue(attrVal, options);
          if (attrVal === true && options.suppressBooleanAttributes) {
            attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
          } else {
            attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
          }
        }
      }
      return attrStr;
    }
    function isStopNode(jPath, options) {
      jPath = jPath.substr(0, jPath.length - options.textNodeName.length - 1);
      let tagName = jPath.substr(jPath.lastIndexOf(".") + 1);
      for (let index in options.stopNodes) {
        if (options.stopNodes[index] === jPath || options.stopNodes[index] === "*." + tagName) return true;
      }
      return false;
    }
    function replaceEntitiesValue(textValue, options) {
      if (textValue && textValue.length > 0 && options.processEntities) {
        for (let i2 = 0; i2 < options.entities.length; i2++) {
          const entity = options.entities[i2];
          textValue = textValue.replace(entity.regex, entity.val);
        }
      }
      return textValue;
    }
    module.exports = toXml;
  }
});

// node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js
var require_json2xml = __commonJS({
  "node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js"(exports, module) {
    "use strict";
    var buildFromOrderedJs = require_orderedJs2Xml();
    var defaultOptions = {
      attributeNamePrefix: "@_",
      attributesGroupName: false,
      textNodeName: "#text",
      ignoreAttributes: true,
      cdataPropName: false,
      format: false,
      indentBy: "  ",
      suppressEmptyNode: false,
      suppressUnpairedNode: true,
      suppressBooleanAttributes: true,
      tagValueProcessor: function(key, a2) {
        return a2;
      },
      attributeValueProcessor: function(attrName, a2) {
        return a2;
      },
      preserveOrder: false,
      commentPropName: false,
      unpairedTags: [],
      entities: [
        {
          regex: new RegExp("&", "g"),
          val: "&amp;"
        },
        //it must be on top
        {
          regex: new RegExp(">", "g"),
          val: "&gt;"
        },
        {
          regex: new RegExp("<", "g"),
          val: "&lt;"
        },
        {
          regex: new RegExp("'", "g"),
          val: "&apos;"
        },
        {
          regex: new RegExp('"', "g"),
          val: "&quot;"
        }
      ],
      processEntities: true,
      stopNodes: [],
      // transformTagName: false,
      // transformAttributeName: false,
      oneListGroup: false
    };
    function Builder(options) {
      this.options = Object.assign({}, defaultOptions, options);
      if (this.options.ignoreAttributes || this.options.attributesGroupName) {
        this.isAttribute = function() {
          return false;
        };
      } else {
        this.attrPrefixLen = this.options.attributeNamePrefix.length;
        this.isAttribute = isAttribute;
      }
      this.processTextOrObjNode = processTextOrObjNode;
      if (this.options.format) {
        this.indentate = indentate;
        this.tagEndChar = ">\n";
        this.newLine = "\n";
      } else {
        this.indentate = function() {
          return "";
        };
        this.tagEndChar = ">";
        this.newLine = "";
      }
    }
    Builder.prototype.build = function(jObj) {
      if (this.options.preserveOrder) {
        return buildFromOrderedJs(jObj, this.options);
      } else {
        if (Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1) {
          jObj = {
            [this.options.arrayNodeName]: jObj
          };
        }
        return this.j2x(jObj, 0).val;
      }
    };
    Builder.prototype.j2x = function(jObj, level) {
      let attrStr = "";
      let val2 = "";
      for (let key in jObj) {
        if (!Object.prototype.hasOwnProperty.call(jObj, key)) continue;
        if (typeof jObj[key] === "undefined") {
          if (this.isAttribute(key)) {
            val2 += "";
          }
        } else if (jObj[key] === null) {
          if (this.isAttribute(key)) {
            val2 += "";
          } else if (key[0] === "?") {
            val2 += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
          } else {
            val2 += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
          }
        } else if (jObj[key] instanceof Date) {
          val2 += this.buildTextValNode(jObj[key], key, "", level);
        } else if (typeof jObj[key] !== "object") {
          const attr = this.isAttribute(key);
          if (attr) {
            attrStr += this.buildAttrPairStr(attr, "" + jObj[key]);
          } else {
            if (key === this.options.textNodeName) {
              let newval = this.options.tagValueProcessor(key, "" + jObj[key]);
              val2 += this.replaceEntitiesValue(newval);
            } else {
              val2 += this.buildTextValNode(jObj[key], key, "", level);
            }
          }
        } else if (Array.isArray(jObj[key])) {
          const arrLen = jObj[key].length;
          let listTagVal = "";
          let listTagAttr = "";
          for (let j2 = 0; j2 < arrLen; j2++) {
            const item = jObj[key][j2];
            if (typeof item === "undefined") {
            } else if (item === null) {
              if (key[0] === "?") val2 += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
              else val2 += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
            } else if (typeof item === "object") {
              if (this.options.oneListGroup) {
                const result = this.j2x(item, level + 1);
                listTagVal += result.val;
                if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
                  listTagAttr += result.attrStr;
                }
              } else {
                listTagVal += this.processTextOrObjNode(item, key, level);
              }
            } else {
              if (this.options.oneListGroup) {
                let textValue = this.options.tagValueProcessor(key, item);
                textValue = this.replaceEntitiesValue(textValue);
                listTagVal += textValue;
              } else {
                listTagVal += this.buildTextValNode(item, key, "", level);
              }
            }
          }
          if (this.options.oneListGroup) {
            listTagVal = this.buildObjectNode(listTagVal, key, listTagAttr, level);
          }
          val2 += listTagVal;
        } else {
          if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
            const Ks = Object.keys(jObj[key]);
            const L2 = Ks.length;
            for (let j2 = 0; j2 < L2; j2++) {
              attrStr += this.buildAttrPairStr(Ks[j2], "" + jObj[key][Ks[j2]]);
            }
          } else {
            val2 += this.processTextOrObjNode(jObj[key], key, level);
          }
        }
      }
      return {
        attrStr,
        val: val2
      };
    };
    Builder.prototype.buildAttrPairStr = function(attrName, val2) {
      val2 = this.options.attributeValueProcessor(attrName, "" + val2);
      val2 = this.replaceEntitiesValue(val2);
      if (this.options.suppressBooleanAttributes && val2 === "true") {
        return " " + attrName;
      } else return " " + attrName + '="' + val2 + '"';
    };
    function processTextOrObjNode(object, key, level) {
      const result = this.j2x(object, level + 1);
      if (object[this.options.textNodeName] !== void 0 && Object.keys(object).length === 1) {
        return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level);
      } else {
        return this.buildObjectNode(result.val, key, result.attrStr, level);
      }
    }
    Builder.prototype.buildObjectNode = function(val2, key, attrStr, level) {
      if (val2 === "") {
        if (key[0] === "?") return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
        else {
          return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
        }
      } else {
        let tagEndExp = "</" + key + this.tagEndChar;
        let piClosingChar = "";
        if (key[0] === "?") {
          piClosingChar = "?";
          tagEndExp = "";
        }
        if ((attrStr || attrStr === "") && val2.indexOf("<") === -1) {
          return this.indentate(level) + "<" + key + attrStr + piClosingChar + ">" + val2 + tagEndExp;
        } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
          return this.indentate(level) + `<!--${val2}-->` + this.newLine;
        } else {
          return this.indentate(level) + "<" + key + attrStr + piClosingChar + this.tagEndChar + val2 + this.indentate(level) + tagEndExp;
        }
      }
    };
    Builder.prototype.closeTag = function(key) {
      let closeTag = "";
      if (this.options.unpairedTags.indexOf(key) !== -1) {
        if (!this.options.suppressUnpairedNode) closeTag = "/";
      } else if (this.options.suppressEmptyNode) {
        closeTag = "/";
      } else {
        closeTag = `></${key}`;
      }
      return closeTag;
    };
    Builder.prototype.buildTextValNode = function(val2, key, attrStr, level) {
      if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
        return this.indentate(level) + `<![CDATA[${val2}]]>` + this.newLine;
      } else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
        return this.indentate(level) + `<!--${val2}-->` + this.newLine;
      } else if (key[0] === "?") {
        return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
      } else {
        let textValue = this.options.tagValueProcessor(key, val2);
        textValue = this.replaceEntitiesValue(textValue);
        if (textValue === "") {
          return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
        } else {
          return this.indentate(level) + "<" + key + attrStr + ">" + textValue + "</" + key + this.tagEndChar;
        }
      }
    };
    Builder.prototype.replaceEntitiesValue = function(textValue) {
      if (textValue && textValue.length > 0 && this.options.processEntities) {
        for (let i2 = 0; i2 < this.options.entities.length; i2++) {
          const entity = this.options.entities[i2];
          textValue = textValue.replace(entity.regex, entity.val);
        }
      }
      return textValue;
    };
    function indentate(level) {
      return this.options.indentBy.repeat(level);
    }
    function isAttribute(name) {
      if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
        return name.substr(this.attrPrefixLen);
      } else {
        return false;
      }
    }
    module.exports = Builder;
  }
});

// node_modules/fast-xml-parser/src/fxp.js
var require_fxp = __commonJS({
  "node_modules/fast-xml-parser/src/fxp.js"(exports, module) {
    "use strict";
    var validator = require_validator();
    var XMLParser2 = require_XMLParser();
    var XMLBuilder = require_json2xml();
    module.exports = {
      XMLParser: XMLParser2,
      XMLValidator: validator,
      XMLBuilder
    };
  }
});

// node_modules/@smithy/protocol-http/dist-es/extensions/httpExtensionConfiguration.js
var getHttpHandlerExtensionConfiguration = (runtimeConfig) => {
  let httpHandler = runtimeConfig.httpHandler;
  return {
    setHttpHandler(handler) {
      httpHandler = handler;
    },
    httpHandler() {
      return httpHandler;
    },
    updateHttpClientConfig(key, value) {
      httpHandler.updateHttpClientConfig(key, value);
    },
    httpHandlerConfigs() {
      return httpHandler.httpHandlerConfigs();
    }
  };
};
var resolveHttpHandlerRuntimeConfig = (httpHandlerExtensionConfiguration) => {
  return {
    httpHandler: httpHandlerExtensionConfiguration.httpHandler()
  };
};

// node_modules/@smithy/types/dist-es/auth/auth.js
var HttpAuthLocation;
(function(HttpAuthLocation2) {
  HttpAuthLocation2["HEADER"] = "header";
  HttpAuthLocation2["QUERY"] = "query";
})(HttpAuthLocation || (HttpAuthLocation = {}));

// node_modules/@smithy/types/dist-es/auth/HttpApiKeyAuth.js
var HttpApiKeyAuthLocation;
(function(HttpApiKeyAuthLocation2) {
  HttpApiKeyAuthLocation2["HEADER"] = "header";
  HttpApiKeyAuthLocation2["QUERY"] = "query";
})(HttpApiKeyAuthLocation || (HttpApiKeyAuthLocation = {}));

// node_modules/@smithy/types/dist-es/endpoint.js
var EndpointURLScheme;
(function(EndpointURLScheme2) {
  EndpointURLScheme2["HTTP"] = "http";
  EndpointURLScheme2["HTTPS"] = "https";
})(EndpointURLScheme || (EndpointURLScheme = {}));

// node_modules/@smithy/types/dist-es/extensions/checksum.js
var AlgorithmId;
(function(AlgorithmId2) {
  AlgorithmId2["MD5"] = "md5";
  AlgorithmId2["CRC32"] = "crc32";
  AlgorithmId2["CRC32C"] = "crc32c";
  AlgorithmId2["SHA1"] = "sha1";
  AlgorithmId2["SHA256"] = "sha256";
})(AlgorithmId || (AlgorithmId = {}));

// node_modules/@smithy/types/dist-es/http.js
var FieldPosition;
(function(FieldPosition2) {
  FieldPosition2[FieldPosition2["HEADER"] = 0] = "HEADER";
  FieldPosition2[FieldPosition2["TRAILER"] = 1] = "TRAILER";
})(FieldPosition || (FieldPosition = {}));

// node_modules/@smithy/types/dist-es/middleware.js
var SMITHY_CONTEXT_KEY = "__smithy_context";

// node_modules/@smithy/types/dist-es/profile.js
var IniSectionType;
(function(IniSectionType2) {
  IniSectionType2["PROFILE"] = "profile";
  IniSectionType2["SSO_SESSION"] = "sso-session";
  IniSectionType2["SERVICES"] = "services";
})(IniSectionType || (IniSectionType = {}));

// node_modules/@smithy/types/dist-es/transfer.js
var RequestHandlerProtocol;
(function(RequestHandlerProtocol2) {
  RequestHandlerProtocol2["HTTP_0_9"] = "http/0.9";
  RequestHandlerProtocol2["HTTP_1_0"] = "http/1.0";
  RequestHandlerProtocol2["TDS_8_0"] = "tds/8.0";
})(RequestHandlerProtocol || (RequestHandlerProtocol = {}));

// node_modules/@smithy/protocol-http/dist-es/httpRequest.js
var HttpRequest = class _HttpRequest {
  constructor(options) {
    this.method = options.method || "GET";
    this.hostname = options.hostname || "localhost";
    this.port = options.port;
    this.query = options.query || {};
    this.headers = options.headers || {};
    this.body = options.body;
    this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
    this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
    this.username = options.username;
    this.password = options.password;
    this.fragment = options.fragment;
  }
  static clone(request) {
    const cloned = new _HttpRequest(__spreadProps(__spreadValues({}, request), {
      headers: __spreadValues({}, request.headers)
    }));
    if (cloned.query) {
      cloned.query = cloneQuery(cloned.query);
    }
    return cloned;
  }
  static isInstance(request) {
    if (!request) {
      return false;
    }
    const req = request;
    return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
  }
  clone() {
    return _HttpRequest.clone(this);
  }
};
function cloneQuery(query) {
  return Object.keys(query).reduce((carry, paramName) => {
    const param = query[paramName];
    return __spreadProps(__spreadValues({}, carry), {
      [paramName]: Array.isArray(param) ? [...param] : param
    });
  }, {});
}

// node_modules/@smithy/protocol-http/dist-es/httpResponse.js
var HttpResponse = class {
  constructor(options) {
    this.statusCode = options.statusCode;
    this.reason = options.reason;
    this.headers = options.headers || {};
    this.body = options.body;
  }
  static isInstance(response) {
    if (!response) return false;
    const resp = response;
    return typeof resp.statusCode === "number" && typeof resp.headers === "object";
  }
};

// node_modules/@smithy/protocol-http/dist-es/isValidHostname.js
function isValidHostname(hostname) {
  const hostPattern = /^[a-z0-9][a-z0-9\.\-]*[a-z0-9]$/;
  return hostPattern.test(hostname);
}

// node_modules/@aws-sdk/middleware-expect-continue/dist-es/index.js
function addExpectContinueMiddleware(options) {
  return (next) => (args) => __async(this, null, function* () {
    const {
      request
    } = args;
    if (HttpRequest.isInstance(request) && request.body && options.runtime === "node") {
      if (options.requestHandler?.constructor?.name !== "FetchHttpHandler") {
        request.headers = __spreadProps(__spreadValues({}, request.headers), {
          Expect: "100-continue"
        });
      }
    }
    return next(__spreadProps(__spreadValues({}, args), {
      request
    }));
  });
}
var addExpectContinueMiddlewareOptions = {
  step: "build",
  tags: ["SET_EXPECT_HEADER", "EXPECT_HEADER"],
  name: "addExpectContinueMiddleware",
  override: true
};
var getAddExpectContinuePlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(addExpectContinueMiddleware(options), addExpectContinueMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-host-header/dist-es/index.js
function resolveHostHeaderConfig(input) {
  return input;
}
var hostHeaderMiddleware = (options) => (next) => (args) => __async(void 0, null, function* () {
  if (!HttpRequest.isInstance(args.request)) return next(args);
  const {
    request
  } = args;
  const {
    handlerProtocol = ""
  } = options.requestHandler.metadata || {};
  if (handlerProtocol.indexOf("h2") >= 0 && !request.headers[":authority"]) {
    delete request.headers["host"];
    request.headers[":authority"] = request.hostname + (request.port ? ":" + request.port : "");
  } else if (!request.headers["host"]) {
    let host = request.hostname;
    if (request.port != null) host += `:${request.port}`;
    request.headers["host"] = host;
  }
  return next(args);
});
var hostHeaderMiddlewareOptions = {
  name: "hostHeaderMiddleware",
  step: "build",
  priority: "low",
  tags: ["HOST"],
  override: true
};
var getHostHeaderPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-logger/dist-es/loggerMiddleware.js
var loggerMiddleware = () => (next, context) => (args) => __async(void 0, null, function* () {
  try {
    const response = yield next(args);
    const {
      clientName,
      commandName,
      logger: logger2,
      dynamoDbDocumentClientOptions = {}
    } = context;
    const {
      overrideInputFilterSensitiveLog,
      overrideOutputFilterSensitiveLog
    } = dynamoDbDocumentClientOptions;
    const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
    const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;
    const _a2 = response.output, {
      $metadata
    } = _a2, outputWithoutMetadata = __objRest(_a2, [
      "$metadata"
    ]);
    logger2?.info?.({
      clientName,
      commandName,
      input: inputFilterSensitiveLog(args.input),
      output: outputFilterSensitiveLog(outputWithoutMetadata),
      metadata: $metadata
    });
    return response;
  } catch (error) {
    const {
      clientName,
      commandName,
      logger: logger2,
      dynamoDbDocumentClientOptions = {}
    } = context;
    const {
      overrideInputFilterSensitiveLog
    } = dynamoDbDocumentClientOptions;
    const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
    logger2?.error?.({
      clientName,
      commandName,
      input: inputFilterSensitiveLog(args.input),
      error,
      metadata: error.$metadata
    });
    throw error;
  }
});
var loggerMiddlewareOptions = {
  name: "loggerMiddleware",
  tags: ["LOGGER"],
  step: "initialize",
  override: true
};
var getLoggerPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-recursion-detection/dist-es/index.js
var TRACE_ID_HEADER_NAME = "X-Amzn-Trace-Id";
var ENV_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
var ENV_TRACE_ID = "_X_AMZN_TRACE_ID";
var recursionDetectionMiddleware = (options) => (next) => (args) => __async(void 0, null, function* () {
  const {
    request
  } = args;
  if (!HttpRequest.isInstance(request) || options.runtime !== "node" || request.headers.hasOwnProperty(TRACE_ID_HEADER_NAME)) {
    return next(args);
  }
  const functionName = process.env[ENV_LAMBDA_FUNCTION_NAME];
  const traceId = process.env[ENV_TRACE_ID];
  const nonEmptyString = (str) => typeof str === "string" && str.length > 0;
  if (nonEmptyString(functionName) && nonEmptyString(traceId)) {
    request.headers[TRACE_ID_HEADER_NAME] = traceId;
  }
  return next(__spreadProps(__spreadValues({}, args), {
    request
  }));
});
var addRecursionDetectionMiddlewareOptions = {
  step: "build",
  tags: ["RECURSION_DETECTION"],
  name: "recursionDetectionMiddleware",
  override: true,
  priority: "low"
};
var getRecursionDetectionPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(recursionDetectionMiddleware(options), addRecursionDetectionMiddlewareOptions);
  }
});

// node_modules/@smithy/smithy-client/dist-es/NoOpLogger.js
var NoOpLogger = class {
  trace() {
  }
  debug() {
  }
  info() {
  }
  warn() {
  }
  error() {
  }
};

// node_modules/@smithy/middleware-stack/dist-es/MiddlewareStack.js
var getAllAliases = (name, aliases) => {
  const _aliases = [];
  if (name) {
    _aliases.push(name);
  }
  if (aliases) {
    for (const alias of aliases) {
      _aliases.push(alias);
    }
  }
  return _aliases;
};
var getMiddlewareNameWithAliases = (name, aliases) => {
  return `${name || "anonymous"}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
};
var constructStack = () => {
  let absoluteEntries = [];
  let relativeEntries = [];
  let identifyOnResolve = false;
  const entriesNameSet = /* @__PURE__ */ new Set();
  const sort = (entries) => entries.sort((a2, b2) => stepWeights[b2.step] - stepWeights[a2.step] || priorityWeights[b2.priority || "normal"] - priorityWeights[a2.priority || "normal"]);
  const removeByName = (toRemove) => {
    let isRemoved = false;
    const filterCb = (entry) => {
      const aliases = getAllAliases(entry.name, entry.aliases);
      if (aliases.includes(toRemove)) {
        isRemoved = true;
        for (const alias of aliases) {
          entriesNameSet.delete(alias);
        }
        return false;
      }
      return true;
    };
    absoluteEntries = absoluteEntries.filter(filterCb);
    relativeEntries = relativeEntries.filter(filterCb);
    return isRemoved;
  };
  const removeByReference = (toRemove) => {
    let isRemoved = false;
    const filterCb = (entry) => {
      if (entry.middleware === toRemove) {
        isRemoved = true;
        for (const alias of getAllAliases(entry.name, entry.aliases)) {
          entriesNameSet.delete(alias);
        }
        return false;
      }
      return true;
    };
    absoluteEntries = absoluteEntries.filter(filterCb);
    relativeEntries = relativeEntries.filter(filterCb);
    return isRemoved;
  };
  const cloneTo = (toStack) => {
    absoluteEntries.forEach((entry) => {
      toStack.add(entry.middleware, __spreadValues({}, entry));
    });
    relativeEntries.forEach((entry) => {
      toStack.addRelativeTo(entry.middleware, __spreadValues({}, entry));
    });
    toStack.identifyOnResolve?.(stack.identifyOnResolve());
    return toStack;
  };
  const expandRelativeMiddlewareList = (from) => {
    const expandedMiddlewareList = [];
    from.before.forEach((entry) => {
      if (entry.before.length === 0 && entry.after.length === 0) {
        expandedMiddlewareList.push(entry);
      } else {
        expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
      }
    });
    expandedMiddlewareList.push(from);
    from.after.reverse().forEach((entry) => {
      if (entry.before.length === 0 && entry.after.length === 0) {
        expandedMiddlewareList.push(entry);
      } else {
        expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
      }
    });
    return expandedMiddlewareList;
  };
  const getMiddlewareList = (debug = false) => {
    const normalizedAbsoluteEntries = [];
    const normalizedRelativeEntries = [];
    const normalizedEntriesNameMap = {};
    absoluteEntries.forEach((entry) => {
      const normalizedEntry = __spreadProps(__spreadValues({}, entry), {
        before: [],
        after: []
      });
      for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
        normalizedEntriesNameMap[alias] = normalizedEntry;
      }
      normalizedAbsoluteEntries.push(normalizedEntry);
    });
    relativeEntries.forEach((entry) => {
      const normalizedEntry = __spreadProps(__spreadValues({}, entry), {
        before: [],
        after: []
      });
      for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
        normalizedEntriesNameMap[alias] = normalizedEntry;
      }
      normalizedRelativeEntries.push(normalizedEntry);
    });
    normalizedRelativeEntries.forEach((entry) => {
      if (entry.toMiddleware) {
        const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
        if (toMiddleware === void 0) {
          if (debug) {
            return;
          }
          throw new Error(`${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
        }
        if (entry.relation === "after") {
          toMiddleware.after.push(entry);
        }
        if (entry.relation === "before") {
          toMiddleware.before.push(entry);
        }
      }
    });
    const mainChain = sort(normalizedAbsoluteEntries).map(expandRelativeMiddlewareList).reduce((wholeList, expandedMiddlewareList) => {
      wholeList.push(...expandedMiddlewareList);
      return wholeList;
    }, []);
    return mainChain;
  };
  const stack = {
    add: (middleware, options = {}) => {
      const {
        name,
        override,
        aliases: _aliases
      } = options;
      const entry = __spreadValues({
        step: "initialize",
        priority: "normal",
        middleware
      }, options);
      const aliases = getAllAliases(name, _aliases);
      if (aliases.length > 0) {
        if (aliases.some((alias) => entriesNameSet.has(alias))) {
          if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
          for (const alias of aliases) {
            const toOverrideIndex = absoluteEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a2) => a2 === alias));
            if (toOverrideIndex === -1) {
              continue;
            }
            const toOverride = absoluteEntries[toOverrideIndex];
            if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) {
              throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`);
            }
            absoluteEntries.splice(toOverrideIndex, 1);
          }
        }
        for (const alias of aliases) {
          entriesNameSet.add(alias);
        }
      }
      absoluteEntries.push(entry);
    },
    addRelativeTo: (middleware, options) => {
      const {
        name,
        override,
        aliases: _aliases
      } = options;
      const entry = __spreadValues({
        middleware
      }, options);
      const aliases = getAllAliases(name, _aliases);
      if (aliases.length > 0) {
        if (aliases.some((alias) => entriesNameSet.has(alias))) {
          if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
          for (const alias of aliases) {
            const toOverrideIndex = relativeEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a2) => a2 === alias));
            if (toOverrideIndex === -1) {
              continue;
            }
            const toOverride = relativeEntries[toOverrideIndex];
            if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) {
              throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`);
            }
            relativeEntries.splice(toOverrideIndex, 1);
          }
        }
        for (const alias of aliases) {
          entriesNameSet.add(alias);
        }
      }
      relativeEntries.push(entry);
    },
    clone: () => cloneTo(constructStack()),
    use: (plugin) => {
      plugin.applyToStack(stack);
    },
    remove: (toRemove) => {
      if (typeof toRemove === "string") return removeByName(toRemove);
      else return removeByReference(toRemove);
    },
    removeByTag: (toRemove) => {
      let isRemoved = false;
      const filterCb = (entry) => {
        const {
          tags,
          name,
          aliases: _aliases
        } = entry;
        if (tags && tags.includes(toRemove)) {
          const aliases = getAllAliases(name, _aliases);
          for (const alias of aliases) {
            entriesNameSet.delete(alias);
          }
          isRemoved = true;
          return false;
        }
        return true;
      };
      absoluteEntries = absoluteEntries.filter(filterCb);
      relativeEntries = relativeEntries.filter(filterCb);
      return isRemoved;
    },
    concat: (from) => {
      const cloned = cloneTo(constructStack());
      cloned.use(from);
      cloned.identifyOnResolve(identifyOnResolve || cloned.identifyOnResolve() || (from.identifyOnResolve?.() ?? false));
      return cloned;
    },
    applyToStack: cloneTo,
    identify: () => {
      return getMiddlewareList(true).map((mw) => {
        const step = mw.step ?? mw.relation + " " + mw.toMiddleware;
        return getMiddlewareNameWithAliases(mw.name, mw.aliases) + " - " + step;
      });
    },
    identifyOnResolve(toggle) {
      if (typeof toggle === "boolean") identifyOnResolve = toggle;
      return identifyOnResolve;
    },
    resolve: (handler, context) => {
      for (const middleware of getMiddlewareList().map((entry) => entry.middleware).reverse()) {
        handler = middleware(handler, context);
      }
      if (identifyOnResolve) {
        console.log(stack.identify());
      }
      return handler;
    }
  };
  return stack;
};
var stepWeights = {
  initialize: 5,
  serialize: 4,
  build: 3,
  finalizeRequest: 2,
  deserialize: 1
};
var priorityWeights = {
  high: 3,
  normal: 2,
  low: 1
};

// node_modules/@smithy/smithy-client/dist-es/client.js
var Client = class {
  constructor(config) {
    this.middlewareStack = constructStack();
    this.config = config;
  }
  send(command, optionsOrCb, cb2) {
    const options = typeof optionsOrCb !== "function" ? optionsOrCb : void 0;
    const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb2;
    const handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
    if (callback) {
      handler(command).then((result) => callback(null, result.output), (err) => callback(err)).catch(() => {
      });
    } else {
      return handler(command).then((result) => result.output);
    }
  }
  destroy() {
    if (this.config.requestHandler.destroy) this.config.requestHandler.destroy();
  }
};

// node_modules/@smithy/util-base64/dist-es/constants.browser.js
var alphabetByEncoding = {};
var alphabetByValue = new Array(64);
for (let i2 = 0, start = "A".charCodeAt(0), limit = "Z".charCodeAt(0); i2 + start <= limit; i2++) {
  const char = String.fromCharCode(i2 + start);
  alphabetByEncoding[char] = i2;
  alphabetByValue[i2] = char;
}
for (let i2 = 0, start = "a".charCodeAt(0), limit = "z".charCodeAt(0); i2 + start <= limit; i2++) {
  const char = String.fromCharCode(i2 + start);
  const index = i2 + 26;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
for (let i2 = 0; i2 < 10; i2++) {
  alphabetByEncoding[i2.toString(10)] = i2 + 52;
  const char = i2.toString(10);
  const index = i2 + 52;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
alphabetByEncoding["+"] = 62;
alphabetByValue[62] = "+";
alphabetByEncoding["/"] = 63;
alphabetByValue[63] = "/";
var bitsPerLetter = 6;
var bitsPerByte = 8;
var maxLetterValue = 63;

// node_modules/@smithy/util-base64/dist-es/fromBase64.browser.js
var fromBase64 = (input) => {
  let totalByteLength = input.length / 4 * 3;
  if (input.slice(-2) === "==") {
    totalByteLength -= 2;
  } else if (input.slice(-1) === "=") {
    totalByteLength--;
  }
  const out = new ArrayBuffer(totalByteLength);
  const dataView = new DataView(out);
  for (let i2 = 0; i2 < input.length; i2 += 4) {
    let bits = 0;
    let bitLength = 0;
    for (let j2 = i2, limit = i2 + 3; j2 <= limit; j2++) {
      if (input[j2] !== "=") {
        if (!(input[j2] in alphabetByEncoding)) {
          throw new TypeError(`Invalid character ${input[j2]} in base64 string.`);
        }
        bits |= alphabetByEncoding[input[j2]] << (limit - j2) * bitsPerLetter;
        bitLength += bitsPerLetter;
      } else {
        bits >>= bitsPerLetter;
      }
    }
    const chunkOffset = i2 / 4 * 3;
    bits >>= bitLength % bitsPerByte;
    const byteLength = Math.floor(bitLength / bitsPerByte);
    for (let k2 = 0; k2 < byteLength; k2++) {
      const offset = (byteLength - k2 - 1) * bitsPerByte;
      dataView.setUint8(chunkOffset + k2, (bits & 255 << offset) >> offset);
    }
  }
  return new Uint8Array(out);
};

// node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js
var fromUtf8 = (input) => new TextEncoder().encode(input);

// node_modules/@smithy/util-utf8/dist-es/toUint8Array.js
var toUint8Array = (data) => {
  if (typeof data === "string") {
    return fromUtf8(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
};

// node_modules/@smithy/util-utf8/dist-es/toUtf8.browser.js
var toUtf8 = (input) => {
  if (typeof input === "string") {
    return input;
  }
  if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
    throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
  }
  return new TextDecoder("utf-8").decode(input);
};

// node_modules/@smithy/util-base64/dist-es/toBase64.browser.js
function toBase64(_input) {
  let input;
  if (typeof _input === "string") {
    input = fromUtf8(_input);
  } else {
    input = _input;
  }
  const isArrayLike = typeof input === "object" && typeof input.length === "number";
  const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
  if (!isArrayLike && !isUint8Array) {
    throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
  }
  let str = "";
  for (let i2 = 0; i2 < input.length; i2 += 3) {
    let bits = 0;
    let bitLength = 0;
    for (let j2 = i2, limit = Math.min(i2 + 3, input.length); j2 < limit; j2++) {
      bits |= input[j2] << (limit - j2 - 1) * bitsPerByte;
      bitLength += bitsPerByte;
    }
    const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
    bits <<= bitClusterCount * bitsPerLetter - bitLength;
    for (let k2 = 1; k2 <= bitClusterCount; k2++) {
      const offset = (bitClusterCount - k2) * bitsPerLetter;
      str += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
    }
    str += "==".slice(0, 4 - bitClusterCount);
  }
  return str;
}

// node_modules/@smithy/util-stream/dist-es/blob/transforms.js
function transformToString(payload, encoding = "utf-8") {
  if (encoding === "base64") {
    return toBase64(payload);
  }
  return toUtf8(payload);
}
function transformFromString(str, encoding) {
  if (encoding === "base64") {
    return Uint8ArrayBlobAdapter.mutate(fromBase64(str));
  }
  return Uint8ArrayBlobAdapter.mutate(fromUtf8(str));
}

// node_modules/@smithy/util-stream/dist-es/blob/Uint8ArrayBlobAdapter.js
var Uint8ArrayBlobAdapter = class _Uint8ArrayBlobAdapter extends Uint8Array {
  static fromString(source, encoding = "utf-8") {
    switch (typeof source) {
      case "string":
        return transformFromString(source, encoding);
      default:
        throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
    }
  }
  static mutate(source) {
    Object.setPrototypeOf(source, _Uint8ArrayBlobAdapter.prototype);
    return source;
  }
  transformToString(encoding = "utf-8") {
    return transformToString(this, encoding);
  }
};

// node_modules/@smithy/util-stream/dist-es/getAwsChunkedEncodingStream.browser.js
var getAwsChunkedEncodingStream = (readableStream, options) => {
  const {
    base64Encoder,
    bodyLengthChecker,
    checksumAlgorithmFn,
    checksumLocationName,
    streamHasher
  } = options;
  const checksumRequired = base64Encoder !== void 0 && bodyLengthChecker !== void 0 && checksumAlgorithmFn !== void 0 && checksumLocationName !== void 0 && streamHasher !== void 0;
  const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readableStream) : void 0;
  const reader = readableStream.getReader();
  return new ReadableStream({
    pull(controller) {
      return __async(this, null, function* () {
        const {
          value,
          done
        } = yield reader.read();
        if (done) {
          controller.enqueue(`0\r
`);
          if (checksumRequired) {
            const checksum = base64Encoder(yield digest);
            controller.enqueue(`${checksumLocationName}:${checksum}\r
`);
            controller.enqueue(`\r
`);
          }
          controller.close();
        } else {
          controller.enqueue(`${(bodyLengthChecker(value) || 0).toString(16)}\r
${value}\r
`);
        }
      });
    }
  });
};

// node_modules/@smithy/util-uri-escape/dist-es/escape-uri.js
var escapeUri = (uri) => encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);
var hexEncode = (c2) => `%${c2.charCodeAt(0).toString(16).toUpperCase()}`;

// node_modules/@smithy/querystring-builder/dist-es/index.js
function buildQueryString(query) {
  const parts = [];
  for (let key of Object.keys(query).sort()) {
    const value = query[key];
    key = escapeUri(key);
    if (Array.isArray(value)) {
      for (let i2 = 0, iLen = value.length; i2 < iLen; i2++) {
        parts.push(`${key}=${escapeUri(value[i2])}`);
      }
    } else {
      let qsEntry = key;
      if (value || typeof value === "string") {
        qsEntry += `=${escapeUri(value)}`;
      }
      parts.push(qsEntry);
    }
  }
  return parts.join("&");
}

// node_modules/@smithy/fetch-http-handler/dist-es/request-timeout.js
function requestTimeout(timeoutInMs = 0) {
  return new Promise((resolve, reject) => {
    if (timeoutInMs) {
      setTimeout(() => {
        const timeoutError = new Error(`Request did not complete within ${timeoutInMs} ms`);
        timeoutError.name = "TimeoutError";
        reject(timeoutError);
      }, timeoutInMs);
    }
  });
}

// node_modules/@smithy/fetch-http-handler/dist-es/fetch-http-handler.js
var keepAliveSupport = {
  supported: void 0
};
var FetchHttpHandler = class _FetchHttpHandler {
  static create(instanceOrOptions) {
    if (typeof instanceOrOptions?.handle === "function") {
      return instanceOrOptions;
    }
    return new _FetchHttpHandler(instanceOrOptions);
  }
  constructor(options) {
    if (typeof options === "function") {
      this.configProvider = options().then((opts) => opts || {});
    } else {
      this.config = options ?? {};
      this.configProvider = Promise.resolve(this.config);
    }
    if (keepAliveSupport.supported === void 0) {
      keepAliveSupport.supported = Boolean(typeof Request !== "undefined" && "keepalive" in new Request("https://[::1]"));
    }
  }
  destroy() {
  }
  handle(_0) {
    return __async(this, arguments, function* (request, {
      abortSignal
    } = {}) {
      if (!this.config) {
        this.config = yield this.configProvider;
      }
      const requestTimeoutInMs = this.config.requestTimeout;
      const keepAlive = this.config.keepAlive === true;
      const credentials = this.config.credentials;
      if (abortSignal?.aborted) {
        const abortError = new Error("Request aborted");
        abortError.name = "AbortError";
        return Promise.reject(abortError);
      }
      let path = request.path;
      const queryString = buildQueryString(request.query || {});
      if (queryString) {
        path += `?${queryString}`;
      }
      if (request.fragment) {
        path += `#${request.fragment}`;
      }
      let auth = "";
      if (request.username != null || request.password != null) {
        const username = request.username ?? "";
        const password = request.password ?? "";
        auth = `${username}:${password}@`;
      }
      const {
        port,
        method
      } = request;
      const url = `${request.protocol}//${auth}${request.hostname}${port ? `:${port}` : ""}${path}`;
      const body = method === "GET" || method === "HEAD" ? void 0 : request.body;
      const requestOptions = {
        body,
        headers: new Headers(request.headers),
        method,
        credentials
      };
      if (body) {
        requestOptions.duplex = "half";
      }
      if (typeof AbortController !== "undefined") {
        requestOptions.signal = abortSignal;
      }
      if (keepAliveSupport.supported) {
        requestOptions.keepalive = keepAlive;
      }
      let removeSignalEventListener = () => {
      };
      const fetchRequest = new Request(url, requestOptions);
      const raceOfPromises = [fetch(fetchRequest).then((response) => {
        const fetchHeaders = response.headers;
        const transformedHeaders = {};
        for (const pair of fetchHeaders.entries()) {
          transformedHeaders[pair[0]] = pair[1];
        }
        const hasReadableStream = response.body != void 0;
        if (!hasReadableStream) {
          return response.blob().then((body2) => ({
            response: new HttpResponse({
              headers: transformedHeaders,
              reason: response.statusText,
              statusCode: response.status,
              body: body2
            })
          }));
        }
        return {
          response: new HttpResponse({
            headers: transformedHeaders,
            reason: response.statusText,
            statusCode: response.status,
            body: response.body
          })
        };
      }), requestTimeout(requestTimeoutInMs)];
      if (abortSignal) {
        raceOfPromises.push(new Promise((resolve, reject) => {
          const onAbort = () => {
            const abortError = new Error("Request aborted");
            abortError.name = "AbortError";
            reject(abortError);
          };
          if (typeof abortSignal.addEventListener === "function") {
            const signal = abortSignal;
            signal.addEventListener("abort", onAbort, {
              once: true
            });
            removeSignalEventListener = () => signal.removeEventListener("abort", onAbort);
          } else {
            abortSignal.onabort = onAbort;
          }
        }));
      }
      return Promise.race(raceOfPromises).finally(removeSignalEventListener);
    });
  }
  updateHttpClientConfig(key, value) {
    this.config = void 0;
    this.configProvider = this.configProvider.then((config) => {
      config[key] = value;
      return config;
    });
  }
  httpHandlerConfigs() {
    return this.config ?? {};
  }
};

// node_modules/@smithy/fetch-http-handler/dist-es/stream-collector.js
var streamCollector = (stream) => {
  if (typeof Blob === "function" && stream instanceof Blob) {
    return collectBlob(stream);
  }
  return collectStream(stream);
};
function collectBlob(blob) {
  return __async(this, null, function* () {
    const base64 = yield readToBase64(blob);
    const arrayBuffer = fromBase64(base64);
    return new Uint8Array(arrayBuffer);
  });
}
function collectStream(stream) {
  return __async(this, null, function* () {
    const chunks = [];
    const reader = stream.getReader();
    let isDone = false;
    let length = 0;
    while (!isDone) {
      const {
        done,
        value
      } = yield reader.read();
      if (value) {
        chunks.push(value);
        length += value.length;
      }
      isDone = done;
    }
    const collected = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      collected.set(chunk, offset);
      offset += chunk.length;
    }
    return collected;
  });
}
function readToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState !== 2) {
        return reject(new Error("Reader aborted too early"));
      }
      const result = reader.result ?? "";
      const commaIndex = result.indexOf(",");
      const dataOffset = commaIndex > -1 ? commaIndex + 1 : result.length;
      resolve(result.substring(dataOffset));
    };
    reader.onabort = () => reject(new Error("Read aborted"));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// node_modules/@smithy/util-hex-encoding/dist-es/index.js
var SHORT_TO_HEX = {};
var HEX_TO_SHORT = {};
for (let i2 = 0; i2 < 256; i2++) {
  let encodedByte = i2.toString(16).toLowerCase();
  if (encodedByte.length === 1) {
    encodedByte = `0${encodedByte}`;
  }
  SHORT_TO_HEX[i2] = encodedByte;
  HEX_TO_SHORT[encodedByte] = i2;
}
function fromHex(encoded) {
  if (encoded.length % 2 !== 0) {
    throw new Error("Hex encoded strings must have an even number length");
  }
  const out = new Uint8Array(encoded.length / 2);
  for (let i2 = 0; i2 < encoded.length; i2 += 2) {
    const encodedByte = encoded.slice(i2, i2 + 2).toLowerCase();
    if (encodedByte in HEX_TO_SHORT) {
      out[i2 / 2] = HEX_TO_SHORT[encodedByte];
    } else {
      throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
    }
  }
  return out;
}
function toHex(bytes) {
  let out = "";
  for (let i2 = 0; i2 < bytes.byteLength; i2++) {
    out += SHORT_TO_HEX[bytes[i2]];
  }
  return out;
}

// node_modules/@smithy/util-stream/dist-es/stream-type-check.js
var isReadableStream = (stream) => typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream);

// node_modules/@smithy/util-stream/dist-es/sdk-stream-mixin.browser.js
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
var sdkStreamMixin = (stream) => {
  if (!isBlobInstance(stream) && !isReadableStream(stream)) {
    const name = stream?.__proto__?.constructor?.name || stream;
    throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
  }
  let transformed = false;
  const transformToByteArray = () => __async(void 0, null, function* () {
    if (transformed) {
      throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
    }
    transformed = true;
    return yield streamCollector(stream);
  });
  const blobToWebStream = (blob) => {
    if (typeof blob.stream !== "function") {
      throw new Error("Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.\nIf you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
    }
    return blob.stream();
  };
  return Object.assign(stream, {
    transformToByteArray,
    transformToString: (encoding) => __async(void 0, null, function* () {
      const buf = yield transformToByteArray();
      if (encoding === "base64") {
        return toBase64(buf);
      } else if (encoding === "hex") {
        return toHex(buf);
      } else if (encoding === void 0 || encoding === "utf8" || encoding === "utf-8") {
        return toUtf8(buf);
      } else if (typeof TextDecoder === "function") {
        return new TextDecoder(encoding).decode(buf);
      } else {
        throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
      }
    }),
    transformToWebStream: () => {
      if (transformed) {
        throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
      }
      transformed = true;
      if (isBlobInstance(stream)) {
        return blobToWebStream(stream);
      } else if (isReadableStream(stream)) {
        return stream;
      } else {
        throw new Error(`Cannot transform payload to web stream, got ${stream}`);
      }
    }
  });
};
var isBlobInstance = (stream) => typeof Blob === "function" && stream instanceof Blob;

// node_modules/@smithy/util-stream/dist-es/splitStream.browser.js
function splitStream(stream) {
  return __async(this, null, function* () {
    if (typeof stream.stream === "function") {
      stream = stream.stream();
    }
    const readableStream = stream;
    return readableStream.tee();
  });
}

// node_modules/@smithy/util-stream/dist-es/headStream.browser.js
function headStream(stream, bytes) {
  return __async(this, null, function* () {
    let byteLengthCounter = 0;
    const chunks = [];
    const reader = stream.getReader();
    let isDone = false;
    while (!isDone) {
      const {
        done,
        value
      } = yield reader.read();
      if (value) {
        chunks.push(value);
        byteLengthCounter += value?.byteLength ?? 0;
      }
      if (byteLengthCounter >= bytes) {
        break;
      }
      isDone = done;
    }
    reader.releaseLock();
    const collected = new Uint8Array(Math.min(bytes, byteLengthCounter));
    let offset = 0;
    for (const chunk of chunks) {
      if (chunk.byteLength > collected.byteLength - offset) {
        collected.set(chunk.subarray(0, collected.byteLength - offset), offset);
        break;
      } else {
        collected.set(chunk, offset);
      }
      offset += chunk.length;
    }
    return collected;
  });
}

// node_modules/@smithy/smithy-client/dist-es/collect-stream-body.js
var collectBody = (..._0) => __async(void 0, [..._0], function* (streamBody = new Uint8Array(), context) {
  if (streamBody instanceof Uint8Array) {
    return Uint8ArrayBlobAdapter.mutate(streamBody);
  }
  if (!streamBody) {
    return Uint8ArrayBlobAdapter.mutate(new Uint8Array());
  }
  const fromContext = context.streamCollector(streamBody);
  return Uint8ArrayBlobAdapter.mutate(yield fromContext);
});

// node_modules/@smithy/smithy-client/dist-es/command.js
var Command = class {
  constructor() {
    this.middlewareStack = constructStack();
  }
  static classBuilder() {
    return new ClassBuilder();
  }
  resolveMiddlewareWithContext(clientStack, configuration, options, {
    middlewareFn,
    clientName,
    commandName,
    inputFilterSensitiveLog,
    outputFilterSensitiveLog,
    smithyContext,
    additionalContext,
    CommandCtor
  }) {
    for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) {
      this.middlewareStack.use(mw);
    }
    const stack = clientStack.concat(this.middlewareStack);
    const {
      logger: logger2
    } = configuration;
    const handlerExecutionContext = __spreadValues({
      logger: logger2,
      clientName,
      commandName,
      inputFilterSensitiveLog,
      outputFilterSensitiveLog,
      [SMITHY_CONTEXT_KEY]: __spreadValues({
        commandInstance: this
      }, smithyContext)
    }, additionalContext);
    const {
      requestHandler
    } = configuration;
    return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
  }
};
var ClassBuilder = class {
  constructor() {
    this._init = () => {
    };
    this._ep = {};
    this._middlewareFn = () => [];
    this._commandName = "";
    this._clientName = "";
    this._additionalContext = {};
    this._smithyContext = {};
    this._inputFilterSensitiveLog = (_) => _;
    this._outputFilterSensitiveLog = (_) => _;
    this._serializer = null;
    this._deserializer = null;
  }
  init(cb2) {
    this._init = cb2;
  }
  ep(endpointParameterInstructions) {
    this._ep = endpointParameterInstructions;
    return this;
  }
  m(middlewareSupplier) {
    this._middlewareFn = middlewareSupplier;
    return this;
  }
  s(service, operation, smithyContext = {}) {
    this._smithyContext = __spreadValues({
      service,
      operation
    }, smithyContext);
    return this;
  }
  c(additionalContext = {}) {
    this._additionalContext = additionalContext;
    return this;
  }
  n(clientName, commandName) {
    this._clientName = clientName;
    this._commandName = commandName;
    return this;
  }
  f(inputFilter = (_) => _, outputFilter = (_) => _) {
    this._inputFilterSensitiveLog = inputFilter;
    this._outputFilterSensitiveLog = outputFilter;
    return this;
  }
  ser(serializer) {
    this._serializer = serializer;
    return this;
  }
  de(deserializer) {
    this._deserializer = deserializer;
    return this;
  }
  build() {
    const closure = this;
    let CommandRef;
    return CommandRef = class extends Command {
      static getEndpointParameterInstructions() {
        return closure._ep;
      }
      constructor(...[input]) {
        super();
        this.serialize = closure._serializer;
        this.deserialize = closure._deserializer;
        this.input = input ?? {};
        closure._init(this);
      }
      resolveMiddleware(stack, configuration, options) {
        return this.resolveMiddlewareWithContext(stack, configuration, options, {
          CommandCtor: CommandRef,
          middlewareFn: closure._middlewareFn,
          clientName: closure._clientName,
          commandName: closure._commandName,
          inputFilterSensitiveLog: closure._inputFilterSensitiveLog,
          outputFilterSensitiveLog: closure._outputFilterSensitiveLog,
          smithyContext: closure._smithyContext,
          additionalContext: closure._additionalContext
        });
      }
    };
  }
};

// node_modules/@smithy/smithy-client/dist-es/constants.js
var SENSITIVE_STRING = "***SensitiveInformation***";

// node_modules/@smithy/smithy-client/dist-es/create-aggregated-client.js
var createAggregatedClient = (commands2, Client2) => {
  for (const command of Object.keys(commands2)) {
    const CommandCtor = commands2[command];
    const methodImpl = function(args, optionsOrCb, cb2) {
      return __async(this, null, function* () {
        const command2 = new CommandCtor(args);
        if (typeof optionsOrCb === "function") {
          this.send(command2, optionsOrCb);
        } else if (typeof cb2 === "function") {
          if (typeof optionsOrCb !== "object") throw new Error(`Expected http options but got ${typeof optionsOrCb}`);
          this.send(command2, optionsOrCb || {}, cb2);
        } else {
          return this.send(command2, optionsOrCb);
        }
      });
    };
    const methodName = (command[0].toLowerCase() + command.slice(1)).replace(/Command$/, "");
    Client2.prototype[methodName] = methodImpl;
  }
};

// node_modules/@smithy/smithy-client/dist-es/parse-utils.js
var parseBoolean = (value) => {
  switch (value) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      throw new Error(`Unable to parse boolean value "${value}"`);
  }
};
var expectNumber = (value) => {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      if (String(parsed) !== String(value)) {
        logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
      }
      return parsed;
    }
  }
  if (typeof value === "number") {
    return value;
  }
  throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
};
var MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
var expectFloat32 = (value) => {
  const expected = expectNumber(value);
  if (expected !== void 0 && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
    if (Math.abs(expected) > MAX_FLOAT) {
      throw new TypeError(`Expected 32-bit float, got ${value}`);
    }
  }
  return expected;
};
var expectLong = (value) => {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (Number.isInteger(value) && !Number.isNaN(value)) {
    return value;
  }
  throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
};
var expectInt32 = (value) => expectSizedInt(value, 32);
var expectShort = (value) => expectSizedInt(value, 16);
var expectByte = (value) => expectSizedInt(value, 8);
var expectSizedInt = (value, size) => {
  const expected = expectLong(value);
  if (expected !== void 0 && castInt(expected, size) !== expected) {
    throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
  }
  return expected;
};
var castInt = (value, size) => {
  switch (size) {
    case 32:
      return Int32Array.of(value)[0];
    case 16:
      return Int16Array.of(value)[0];
    case 8:
      return Int8Array.of(value)[0];
  }
};
var expectNonNull = (value, location) => {
  if (value === null || value === void 0) {
    if (location) {
      throw new TypeError(`Expected a non-null value for ${location}`);
    }
    throw new TypeError("Expected a non-null value");
  }
  return value;
};
var expectObject = (value) => {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  const receivedType = Array.isArray(value) ? "array" : typeof value;
  throw new TypeError(`Expected object, got ${receivedType}: ${value}`);
};
var expectString = (value) => {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value === "string") {
    return value;
  }
  if (["boolean", "number", "bigint"].includes(typeof value)) {
    logger.warn(stackTraceWarning(`Expected string, got ${typeof value}: ${value}`));
    return String(value);
  }
  throw new TypeError(`Expected string, got ${typeof value}: ${value}`);
};
var expectUnion = (value) => {
  if (value === null || value === void 0) {
    return void 0;
  }
  const asObject = expectObject(value);
  const setKeys = Object.entries(asObject).filter(([, v2]) => v2 != null).map(([k2]) => k2);
  if (setKeys.length === 0) {
    throw new TypeError(`Unions must have exactly one non-null member. None were found.`);
  }
  if (setKeys.length > 1) {
    throw new TypeError(`Unions must have exactly one non-null member. Keys ${setKeys} were not null.`);
  }
  return asObject;
};
var strictParseFloat32 = (value) => {
  if (typeof value == "string") {
    return expectFloat32(parseNumber(value));
  }
  return expectFloat32(value);
};
var NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
var parseNumber = (value) => {
  const matches = value.match(NUMBER_REGEX);
  if (matches === null || matches[0].length !== value.length) {
    throw new TypeError(`Expected real number, got implicit NaN`);
  }
  return parseFloat(value);
};
var strictParseLong = (value) => {
  if (typeof value === "string") {
    return expectLong(parseNumber(value));
  }
  return expectLong(value);
};
var strictParseInt32 = (value) => {
  if (typeof value === "string") {
    return expectInt32(parseNumber(value));
  }
  return expectInt32(value);
};
var strictParseShort = (value) => {
  if (typeof value === "string") {
    return expectShort(parseNumber(value));
  }
  return expectShort(value);
};
var strictParseByte = (value) => {
  if (typeof value === "string") {
    return expectByte(parseNumber(value));
  }
  return expectByte(value);
};
var stackTraceWarning = (message) => {
  return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter((s2) => !s2.includes("stackTraceWarning")).join("\n");
};
var logger = {
  warn: console.warn
};

// node_modules/@smithy/smithy-client/dist-es/date-utils.js
var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dateToUtcString(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const dayOfWeek = date.getUTCDay();
  const dayOfMonthInt = date.getUTCDate();
  const hoursInt = date.getUTCHours();
  const minutesInt = date.getUTCMinutes();
  const secondsInt = date.getUTCSeconds();
  const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
  const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
  const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
  const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
  return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year} ${hoursString}:${minutesString}:${secondsString} GMT`;
}
var RFC3339 = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/);
var RFC3339_WITH_OFFSET = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}\:\d{2})|[zZ])$/);
var parseRfc3339DateTimeWithOffset = (value) => {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new TypeError("RFC-3339 date-times must be expressed as strings");
  }
  const match = RFC3339_WITH_OFFSET.exec(value);
  if (!match) {
    throw new TypeError("Invalid RFC-3339 date-time value");
  }
  const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, offsetStr] = match;
  const year = strictParseShort(stripLeadingZeroes(yearStr));
  const month = parseDateValue(monthStr, "month", 1, 12);
  const day = parseDateValue(dayStr, "day", 1, 31);
  const date = buildDate(year, month, day, {
    hours,
    minutes,
    seconds,
    fractionalMilliseconds
  });
  if (offsetStr.toUpperCase() != "Z") {
    date.setTime(date.getTime() - parseOffsetToMilliseconds(offsetStr));
  }
  return date;
};
var IMF_FIXDATE = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
var RFC_850_DATE = new RegExp(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
var ASC_TIME = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/);
var parseRfc7231DateTime = (value) => {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new TypeError("RFC-7231 date-times must be expressed as strings");
  }
  let match = IMF_FIXDATE.exec(value);
  if (match) {
    const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
    return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
      hours,
      minutes,
      seconds,
      fractionalMilliseconds
    });
  }
  match = RFC_850_DATE.exec(value);
  if (match) {
    const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
    return adjustRfc850Year(buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
      hours,
      minutes,
      seconds,
      fractionalMilliseconds
    }));
  }
  match = ASC_TIME.exec(value);
  if (match) {
    const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match;
    return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr.trimLeft(), "day", 1, 31), {
      hours,
      minutes,
      seconds,
      fractionalMilliseconds
    });
  }
  throw new TypeError("Invalid RFC-7231 date-time value");
};
var buildDate = (year, month, day, time) => {
  const adjustedMonth = month - 1;
  validateDayOfMonth(year, adjustedMonth, day);
  return new Date(Date.UTC(year, adjustedMonth, day, parseDateValue(time.hours, "hour", 0, 23), parseDateValue(time.minutes, "minute", 0, 59), parseDateValue(time.seconds, "seconds", 0, 60), parseMilliseconds(time.fractionalMilliseconds)));
};
var parseTwoDigitYear = (value) => {
  const thisYear = (/* @__PURE__ */ new Date()).getUTCFullYear();
  const valueInThisCentury = Math.floor(thisYear / 100) * 100 + strictParseShort(stripLeadingZeroes(value));
  if (valueInThisCentury < thisYear) {
    return valueInThisCentury + 100;
  }
  return valueInThisCentury;
};
var FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1e3;
var adjustRfc850Year = (input) => {
  if (input.getTime() - (/* @__PURE__ */ new Date()).getTime() > FIFTY_YEARS_IN_MILLIS) {
    return new Date(Date.UTC(input.getUTCFullYear() - 100, input.getUTCMonth(), input.getUTCDate(), input.getUTCHours(), input.getUTCMinutes(), input.getUTCSeconds(), input.getUTCMilliseconds()));
  }
  return input;
};
var parseMonthByShortName = (value) => {
  const monthIdx = MONTHS.indexOf(value);
  if (monthIdx < 0) {
    throw new TypeError(`Invalid month: ${value}`);
  }
  return monthIdx + 1;
};
var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var validateDayOfMonth = (year, month, day) => {
  let maxDays = DAYS_IN_MONTH[month];
  if (month === 1 && isLeapYear(year)) {
    maxDays = 29;
  }
  if (day > maxDays) {
    throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year}: ${day}`);
  }
};
var isLeapYear = (year) => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};
var parseDateValue = (value, type, lower, upper) => {
  const dateVal = strictParseByte(stripLeadingZeroes(value));
  if (dateVal < lower || dateVal > upper) {
    throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
  }
  return dateVal;
};
var parseMilliseconds = (value) => {
  if (value === null || value === void 0) {
    return 0;
  }
  return strictParseFloat32("0." + value) * 1e3;
};
var parseOffsetToMilliseconds = (value) => {
  const directionStr = value[0];
  let direction = 1;
  if (directionStr == "+") {
    direction = 1;
  } else if (directionStr == "-") {
    direction = -1;
  } else {
    throw new TypeError(`Offset direction, ${directionStr}, must be "+" or "-"`);
  }
  const hour = Number(value.substring(1, 3));
  const minute = Number(value.substring(4, 6));
  return direction * (hour * 60 + minute) * 60 * 1e3;
};
var stripLeadingZeroes = (value) => {
  let idx = 0;
  while (idx < value.length - 1 && value.charAt(idx) === "0") {
    idx++;
  }
  if (idx === 0) {
    return value;
  }
  return value.slice(idx);
};

// node_modules/@smithy/smithy-client/dist-es/exceptions.js
var ServiceException = class _ServiceException extends Error {
  constructor(options) {
    super(options.message);
    Object.setPrototypeOf(this, _ServiceException.prototype);
    this.name = options.name;
    this.$fault = options.$fault;
    this.$metadata = options.$metadata;
  }
};
var decorateServiceException = (exception, additions = {}) => {
  Object.entries(additions).filter(([, v2]) => v2 !== void 0).forEach(([k2, v2]) => {
    if (exception[k2] == void 0 || exception[k2] === "") {
      exception[k2] = v2;
    }
  });
  const message = exception.message || exception.Message || "UnknownError";
  exception.message = message;
  delete exception.Message;
  return exception;
};

// node_modules/@smithy/smithy-client/dist-es/default-error-handler.js
var throwDefaultError = ({
  output,
  parsedBody,
  exceptionCtor,
  errorCode
}) => {
  const $metadata = deserializeMetadata(output);
  const statusCode = $metadata.httpStatusCode ? $metadata.httpStatusCode + "" : void 0;
  const response = new exceptionCtor({
    name: parsedBody?.code || parsedBody?.Code || errorCode || statusCode || "UnknownError",
    $fault: "client",
    $metadata
  });
  throw decorateServiceException(response, parsedBody);
};
var withBaseException = (ExceptionCtor) => {
  return ({
    output,
    parsedBody,
    errorCode
  }) => {
    throwDefaultError({
      output,
      parsedBody,
      exceptionCtor: ExceptionCtor,
      errorCode
    });
  };
};
var deserializeMetadata = (output) => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"]
});

// node_modules/@smithy/smithy-client/dist-es/defaults-mode.js
var loadConfigsForDefaultMode = (mode) => {
  switch (mode) {
    case "standard":
      return {
        retryMode: "standard",
        connectionTimeout: 3100
      };
    case "in-region":
      return {
        retryMode: "standard",
        connectionTimeout: 1100
      };
    case "cross-region":
      return {
        retryMode: "standard",
        connectionTimeout: 3100
      };
    case "mobile":
      return {
        retryMode: "standard",
        connectionTimeout: 3e4
      };
    default:
      return {};
  }
};

// node_modules/@smithy/smithy-client/dist-es/extensions/checksum.js
var getChecksumConfiguration2 = (runtimeConfig) => {
  const checksumAlgorithms = [];
  for (const id in AlgorithmId) {
    const algorithmId = AlgorithmId[id];
    if (runtimeConfig[algorithmId] === void 0) {
      continue;
    }
    checksumAlgorithms.push({
      algorithmId: () => algorithmId,
      checksumConstructor: () => runtimeConfig[algorithmId]
    });
  }
  return {
    _checksumAlgorithms: checksumAlgorithms,
    addChecksumAlgorithm(algo) {
      this._checksumAlgorithms.push(algo);
    },
    checksumAlgorithms() {
      return this._checksumAlgorithms;
    }
  };
};
var resolveChecksumRuntimeConfig2 = (clientConfig) => {
  const runtimeConfig = {};
  clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
    runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
  });
  return runtimeConfig;
};

// node_modules/@smithy/smithy-client/dist-es/extensions/retry.js
var getRetryConfiguration = (runtimeConfig) => {
  let _retryStrategy = runtimeConfig.retryStrategy;
  return {
    setRetryStrategy(retryStrategy) {
      _retryStrategy = retryStrategy;
    },
    retryStrategy() {
      return _retryStrategy;
    }
  };
};
var resolveRetryRuntimeConfig = (retryStrategyConfiguration) => {
  const runtimeConfig = {};
  runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
  return runtimeConfig;
};

// node_modules/@smithy/smithy-client/dist-es/extensions/defaultExtensionConfiguration.js
var getDefaultExtensionConfiguration = (runtimeConfig) => {
  return __spreadValues(__spreadValues({}, getChecksumConfiguration2(runtimeConfig)), getRetryConfiguration(runtimeConfig));
};
var resolveDefaultRuntimeConfig = (config) => {
  return __spreadValues(__spreadValues({}, resolveChecksumRuntimeConfig2(config)), resolveRetryRuntimeConfig(config));
};

// node_modules/@smithy/smithy-client/dist-es/extended-encode-uri-component.js
function extendedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c2) {
    return "%" + c2.charCodeAt(0).toString(16).toUpperCase();
  });
}

// node_modules/@smithy/smithy-client/dist-es/get-array-if-single-item.js
var getArrayIfSingleItem = (mayBeArray) => Array.isArray(mayBeArray) ? mayBeArray : [mayBeArray];

// node_modules/@smithy/smithy-client/dist-es/get-value-from-text-node.js
var getValueFromTextNode = (obj) => {
  const textNodeName = "#text";
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key][textNodeName] !== void 0) {
      obj[key] = obj[key][textNodeName];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = getValueFromTextNode(obj[key]);
    }
  }
  return obj;
};

// node_modules/@smithy/smithy-client/dist-es/lazy-json.js
var StringWrapper = function() {
  const Class = Object.getPrototypeOf(this).constructor;
  const Constructor = Function.bind.apply(String, [null, ...arguments]);
  const instance = new Constructor();
  Object.setPrototypeOf(instance, Class.prototype);
  return instance;
};
StringWrapper.prototype = Object.create(String.prototype, {
  constructor: {
    value: StringWrapper,
    enumerable: false,
    writable: true,
    configurable: true
  }
});
Object.setPrototypeOf(StringWrapper, String);

// node_modules/@smithy/smithy-client/dist-es/object-mapping.js
function map(arg0, arg1, arg2) {
  let target;
  let filter;
  let instructions;
  if (typeof arg1 === "undefined" && typeof arg2 === "undefined") {
    target = {};
    instructions = arg0;
  } else {
    target = arg0;
    if (typeof arg1 === "function") {
      filter = arg1;
      instructions = arg2;
      return mapWithFilter(target, filter, instructions);
    } else {
      instructions = arg1;
    }
  }
  for (const key of Object.keys(instructions)) {
    if (!Array.isArray(instructions[key])) {
      target[key] = instructions[key];
      continue;
    }
    applyInstruction(target, null, instructions, key);
  }
  return target;
}
var mapWithFilter = (target, filter, instructions) => {
  return map(target, Object.entries(instructions).reduce((_instructions, [key, value]) => {
    if (Array.isArray(value)) {
      _instructions[key] = value;
    } else {
      if (typeof value === "function") {
        _instructions[key] = [filter, value()];
      } else {
        _instructions[key] = [filter, value];
      }
    }
    return _instructions;
  }, {}));
};
var applyInstruction = (target, source, instructions, targetKey) => {
  if (source !== null) {
    let instruction = instructions[targetKey];
    if (typeof instruction === "function") {
      instruction = [, instruction];
    }
    const [filter2 = nonNullish, valueFn = pass, sourceKey = targetKey] = instruction;
    if (typeof filter2 === "function" && filter2(source[sourceKey]) || typeof filter2 !== "function" && !!filter2) {
      target[targetKey] = valueFn(source[sourceKey]);
    }
    return;
  }
  let [filter, value] = instructions[targetKey];
  if (typeof value === "function") {
    let _value;
    const defaultFilterPassed = filter === void 0 && (_value = value()) != null;
    const customFilterPassed = typeof filter === "function" && !!filter(void 0) || typeof filter !== "function" && !!filter;
    if (defaultFilterPassed) {
      target[targetKey] = _value;
    } else if (customFilterPassed) {
      target[targetKey] = value();
    }
  } else {
    const defaultFilterPassed = filter === void 0 && value != null;
    const customFilterPassed = typeof filter === "function" && !!filter(value) || typeof filter !== "function" && !!filter;
    if (defaultFilterPassed || customFilterPassed) {
      target[targetKey] = value;
    }
  }
};
var nonNullish = (_) => _ != null;
var pass = (_) => _;

// node_modules/@smithy/smithy-client/dist-es/resolve-path.js
var resolvedPath = (resolvedPath2, input, memberName, labelValueProvider, uriLabel, isGreedyLabel) => {
  if (input != null && input[memberName] !== void 0) {
    const labelValue = labelValueProvider();
    if (labelValue.length <= 0) {
      throw new Error("Empty value provided for input HTTP label: " + memberName + ".");
    }
    resolvedPath2 = resolvedPath2.replace(uriLabel, isGreedyLabel ? labelValue.split("/").map((segment) => extendedEncodeURIComponent(segment)).join("/") : extendedEncodeURIComponent(labelValue));
  } else {
    throw new Error("No value provided for input HTTP label: " + memberName + ".");
  }
  return resolvedPath2;
};

// node_modules/@smithy/smithy-client/dist-es/ser-utils.js
var serializeDateTime = (date) => date.toISOString().replace(".000Z", "Z");

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/check-content-length-header.js
var CONTENT_LENGTH_HEADER = "content-length";
function checkContentLengthHeader() {
  return (next, context) => (args) => __async(this, null, function* () {
    const {
      request
    } = args;
    if (HttpRequest.isInstance(request)) {
      if (!(CONTENT_LENGTH_HEADER in request.headers)) {
        const message = `Are you using a Stream of unknown length as the Body of a PutObject request? Consider using Upload instead from @aws-sdk/lib-storage.`;
        if (typeof context?.logger?.warn === "function" && !(context.logger instanceof NoOpLogger)) {
          context.logger.warn(message);
        } else {
          console.warn(message);
        }
      }
    }
    return next(__spreadValues({}, args));
  });
}
var checkContentLengthHeaderMiddlewareOptions = {
  step: "finalizeRequest",
  tags: ["CHECK_CONTENT_LENGTH_HEADER"],
  name: "getCheckContentLengthHeaderPlugin",
  override: true
};
var getCheckContentLengthHeaderPlugin = (unused) => ({
  applyToStack: (clientStack) => {
    clientStack.add(checkContentLengthHeader(), checkContentLengthHeaderMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/region-redirect-endpoint-middleware.js
var regionRedirectEndpointMiddleware = (config) => {
  return (next, context) => (args) => __async(void 0, null, function* () {
    const originalRegion = yield config.region();
    const regionProviderRef = config.region;
    let unlock = () => {
    };
    if (context.__s3RegionRedirect) {
      Object.defineProperty(config, "region", {
        writable: false,
        value: () => __async(void 0, null, function* () {
          return context.__s3RegionRedirect;
        })
      });
      unlock = () => Object.defineProperty(config, "region", {
        writable: true,
        value: regionProviderRef
      });
    }
    try {
      const result = yield next(args);
      if (context.__s3RegionRedirect) {
        unlock();
        const region = yield config.region();
        if (originalRegion !== region) {
          throw new Error("Region was not restored following S3 region redirect.");
        }
      }
      return result;
    } catch (e2) {
      unlock();
      throw e2;
    }
  });
};
var regionRedirectEndpointMiddlewareOptions = {
  tags: ["REGION_REDIRECT", "S3"],
  name: "regionRedirectEndpointMiddleware",
  override: true,
  relation: "before",
  toMiddleware: "endpointV2Middleware"
};

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/region-redirect-middleware.js
function regionRedirectMiddleware(clientConfig) {
  return (next, context) => (args) => __async(this, null, function* () {
    try {
      return yield next(args);
    } catch (err) {
      if (clientConfig.followRegionRedirects && err?.$metadata?.httpStatusCode === 301) {
        try {
          const actualRegion = err.$response.headers["x-amz-bucket-region"];
          context.logger?.debug(`Redirecting from ${yield clientConfig.region()} to ${actualRegion}`);
          context.__s3RegionRedirect = actualRegion;
        } catch (e2) {
          throw new Error("Region redirect failed: " + e2);
        }
        return next(args);
      } else {
        throw err;
      }
    }
  });
}
var regionRedirectMiddlewareOptions = {
  step: "initialize",
  tags: ["REGION_REDIRECT", "S3"],
  name: "regionRedirectMiddleware",
  override: true
};
var getRegionRedirectMiddlewarePlugin = (clientConfig) => ({
  applyToStack: (clientStack) => {
    clientStack.add(regionRedirectMiddleware(clientConfig), regionRedirectMiddlewareOptions);
    clientStack.addRelativeTo(regionRedirectEndpointMiddleware(clientConfig), regionRedirectEndpointMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-expires-middleware.js
var s3ExpiresMiddleware = (config) => {
  return (next, context) => (args) => __async(void 0, null, function* () {
    const result = yield next(args);
    const {
      response
    } = result;
    if (HttpResponse.isInstance(response)) {
      if (response.headers.expires) {
        response.headers.expiresstring = response.headers.expires;
        try {
          parseRfc7231DateTime(response.headers.expires);
        } catch (e2) {
          context.logger?.warn(`AWS SDK Warning for ${context.clientName}::${context.commandName} response parsing (${response.headers.expires}): ${e2}`);
          delete response.headers.expires;
        }
      }
    }
    return result;
  });
};
var s3ExpiresMiddlewareOptions = {
  tags: ["S3"],
  name: "s3ExpiresMiddleware",
  override: true,
  relation: "after",
  toMiddleware: "deserializerMiddleware"
};
var getS3ExpiresMiddlewarePlugin = (clientConfig) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(s3ExpiresMiddleware(clientConfig), s3ExpiresMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityCache.js
var S3ExpressIdentityCache = class _S3ExpressIdentityCache {
  constructor(data = {}) {
    this.data = data;
    this.lastPurgeTime = Date.now();
  }
  get(key) {
    const entry = this.data[key];
    if (!entry) {
      return;
    }
    return entry;
  }
  set(key, entry) {
    this.data[key] = entry;
    return entry;
  }
  delete(key) {
    delete this.data[key];
  }
  purgeExpired() {
    return __async(this, null, function* () {
      const now = Date.now();
      if (this.lastPurgeTime + _S3ExpressIdentityCache.EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS > now) {
        return;
      }
      for (const key in this.data) {
        const entry = this.data[key];
        if (!entry.isRefreshing) {
          const credential = yield entry.identity;
          if (credential.expiration) {
            if (credential.expiration.getTime() < now) {
              delete this.data[key];
            }
          }
        }
      }
    });
  }
};
S3ExpressIdentityCache.EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS = 3e4;

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityCacheEntry.js
var S3ExpressIdentityCacheEntry = class {
  constructor(_identity, isRefreshing = false, accessed = Date.now()) {
    this._identity = _identity;
    this.isRefreshing = isRefreshing;
    this.accessed = accessed;
  }
  get identity() {
    this.accessed = Date.now();
    return this._identity;
  }
};

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityProviderImpl.js
var S3ExpressIdentityProviderImpl = class _S3ExpressIdentityProviderImpl {
  constructor(createSessionFn, cache = new S3ExpressIdentityCache()) {
    this.createSessionFn = createSessionFn;
    this.cache = cache;
  }
  getS3ExpressIdentity(awsIdentity, identityProperties) {
    return __async(this, null, function* () {
      const key = identityProperties.Bucket;
      const {
        cache
      } = this;
      const entry = cache.get(key);
      if (entry) {
        return entry.identity.then((identity) => {
          const isExpired = (identity.expiration?.getTime() ?? 0) < Date.now();
          if (isExpired) {
            return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
          }
          const isExpiringSoon = (identity.expiration?.getTime() ?? 0) < Date.now() + _S3ExpressIdentityProviderImpl.REFRESH_WINDOW_MS;
          if (isExpiringSoon && !entry.isRefreshing) {
            entry.isRefreshing = true;
            this.getIdentity(key).then((id) => {
              cache.set(key, new S3ExpressIdentityCacheEntry(Promise.resolve(id)));
            });
          }
          return identity;
        });
      }
      return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
    });
  }
  getIdentity(key) {
    return __async(this, null, function* () {
      yield this.cache.purgeExpired().catch((error) => {
        console.warn("Error while clearing expired entries in S3ExpressIdentityCache: \n" + error);
      });
      const session = yield this.createSessionFn(key);
      if (!session.Credentials?.AccessKeyId || !session.Credentials?.SecretAccessKey) {
        throw new Error("s3#createSession response credential missing AccessKeyId or SecretAccessKey.");
      }
      const identity = {
        accessKeyId: session.Credentials.AccessKeyId,
        secretAccessKey: session.Credentials.SecretAccessKey,
        sessionToken: session.Credentials.SessionToken,
        expiration: session.Credentials.Expiration ? new Date(session.Credentials.Expiration) : void 0
      };
      return identity;
    });
  }
};
S3ExpressIdentityProviderImpl.REFRESH_WINDOW_MS = 6e4;

// node_modules/@smithy/util-middleware/dist-es/getSmithyContext.js
var getSmithyContext = (context) => context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {});

// node_modules/@smithy/util-middleware/dist-es/normalizeProvider.js
var normalizeProvider = (input) => {
  if (typeof input === "function") return input;
  const promisified = Promise.resolve(input);
  return () => promisified;
};

// node_modules/@smithy/signature-v4/dist-es/constants.js
var ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
var CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
var AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
var SIGNED_HEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
var EXPIRES_QUERY_PARAM = "X-Amz-Expires";
var SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
var TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
var AUTH_HEADER = "authorization";
var AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
var DATE_HEADER = "date";
var GENERATED_HEADERS = [AUTH_HEADER, AMZ_DATE_HEADER, DATE_HEADER];
var SIGNATURE_HEADER = SIGNATURE_QUERY_PARAM.toLowerCase();
var SHA256_HEADER = "x-amz-content-sha256";
var TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
var ALWAYS_UNSIGNABLE_HEADERS = {
  authorization: true,
  "cache-control": true,
  connection: true,
  expect: true,
  from: true,
  "keep-alive": true,
  "max-forwards": true,
  pragma: true,
  referer: true,
  te: true,
  trailer: true,
  "transfer-encoding": true,
  upgrade: true,
  "user-agent": true,
  "x-amzn-trace-id": true
};
var PROXY_HEADER_PATTERN = /^proxy-/;
var SEC_HEADER_PATTERN = /^sec-/;
var ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
var EVENT_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256-PAYLOAD";
var UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
var MAX_CACHE_SIZE = 50;
var KEY_TYPE_IDENTIFIER = "aws4_request";
var MAX_PRESIGNED_TTL = 60 * 60 * 24 * 7;

// node_modules/@smithy/signature-v4/dist-es/credentialDerivation.js
var signingKeyCache = {};
var cacheQueue = [];
var createScope = (shortDate, region, service) => `${shortDate}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;
var getSigningKey = (sha256Constructor, credentials, shortDate, region, service) => __async(void 0, null, function* () {
  const credsHash = yield hmac(sha256Constructor, credentials.secretAccessKey, credentials.accessKeyId);
  const cacheKey = `${shortDate}:${region}:${service}:${toHex(credsHash)}:${credentials.sessionToken}`;
  if (cacheKey in signingKeyCache) {
    return signingKeyCache[cacheKey];
  }
  cacheQueue.push(cacheKey);
  while (cacheQueue.length > MAX_CACHE_SIZE) {
    delete signingKeyCache[cacheQueue.shift()];
  }
  let key = `AWS4${credentials.secretAccessKey}`;
  for (const signable of [shortDate, region, service, KEY_TYPE_IDENTIFIER]) {
    key = yield hmac(sha256Constructor, key, signable);
  }
  return signingKeyCache[cacheKey] = key;
});
var hmac = (ctor, secret, data) => {
  const hash = new ctor(secret);
  hash.update(toUint8Array(data));
  return hash.digest();
};

// node_modules/@smithy/signature-v4/dist-es/getCanonicalHeaders.js
var getCanonicalHeaders = ({
  headers
}, unsignableHeaders, signableHeaders) => {
  const canonical = {};
  for (const headerName of Object.keys(headers).sort()) {
    if (headers[headerName] == void 0) {
      continue;
    }
    const canonicalHeaderName = headerName.toLowerCase();
    if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS || unsignableHeaders?.has(canonicalHeaderName) || PROXY_HEADER_PATTERN.test(canonicalHeaderName) || SEC_HEADER_PATTERN.test(canonicalHeaderName)) {
      if (!signableHeaders || signableHeaders && !signableHeaders.has(canonicalHeaderName)) {
        continue;
      }
    }
    canonical[canonicalHeaderName] = headers[headerName].trim().replace(/\s+/g, " ");
  }
  return canonical;
};

// node_modules/@smithy/signature-v4/dist-es/getCanonicalQuery.js
var getCanonicalQuery = ({
  query = {}
}) => {
  const keys = [];
  const serialized = {};
  for (const key of Object.keys(query).sort()) {
    if (key.toLowerCase() === SIGNATURE_HEADER) {
      continue;
    }
    keys.push(key);
    const value = query[key];
    if (typeof value === "string") {
      serialized[key] = `${escapeUri(key)}=${escapeUri(value)}`;
    } else if (Array.isArray(value)) {
      serialized[key] = value.slice(0).reduce((encoded, value2) => encoded.concat([`${escapeUri(key)}=${escapeUri(value2)}`]), []).sort().join("&");
    }
  }
  return keys.map((key) => serialized[key]).filter((serialized2) => serialized2).join("&");
};

// node_modules/@smithy/is-array-buffer/dist-es/index.js
var isArrayBuffer = (arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";

// node_modules/@smithy/signature-v4/dist-es/getPayloadHash.js
var getPayloadHash = (_0, _1) => __async(void 0, [_0, _1], function* ({
  headers,
  body
}, hashConstructor) {
  for (const headerName of Object.keys(headers)) {
    if (headerName.toLowerCase() === SHA256_HEADER) {
      return headers[headerName];
    }
  }
  if (body == void 0) {
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  } else if (typeof body === "string" || ArrayBuffer.isView(body) || isArrayBuffer(body)) {
    const hashCtor = new hashConstructor();
    hashCtor.update(toUint8Array(body));
    return toHex(yield hashCtor.digest());
  }
  return UNSIGNED_PAYLOAD;
});

// node_modules/@smithy/signature-v4/dist-es/HeaderFormatter.js
var HeaderFormatter = class {
  format(headers) {
    const chunks = [];
    for (const headerName of Object.keys(headers)) {
      const bytes = fromUtf8(headerName);
      chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
    }
    const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
    let position = 0;
    for (const chunk of chunks) {
      out.set(chunk, position);
      position += chunk.byteLength;
    }
    return out;
  }
  formatHeaderValue(header) {
    switch (header.type) {
      case "boolean":
        return Uint8Array.from([header.value ? 0 : 1]);
      case "byte":
        return Uint8Array.from([2, header.value]);
      case "short":
        const shortView = new DataView(new ArrayBuffer(3));
        shortView.setUint8(0, 3);
        shortView.setInt16(1, header.value, false);
        return new Uint8Array(shortView.buffer);
      case "integer":
        const intView = new DataView(new ArrayBuffer(5));
        intView.setUint8(0, 4);
        intView.setInt32(1, header.value, false);
        return new Uint8Array(intView.buffer);
      case "long":
        const longBytes = new Uint8Array(9);
        longBytes[0] = 5;
        longBytes.set(header.value.bytes, 1);
        return longBytes;
      case "binary":
        const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
        binView.setUint8(0, 6);
        binView.setUint16(1, header.value.byteLength, false);
        const binBytes = new Uint8Array(binView.buffer);
        binBytes.set(header.value, 3);
        return binBytes;
      case "string":
        const utf8Bytes = fromUtf8(header.value);
        const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
        strView.setUint8(0, 7);
        strView.setUint16(1, utf8Bytes.byteLength, false);
        const strBytes = new Uint8Array(strView.buffer);
        strBytes.set(utf8Bytes, 3);
        return strBytes;
      case "timestamp":
        const tsBytes = new Uint8Array(9);
        tsBytes[0] = 8;
        tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
        return tsBytes;
      case "uuid":
        if (!UUID_PATTERN.test(header.value)) {
          throw new Error(`Invalid UUID received: ${header.value}`);
        }
        const uuidBytes = new Uint8Array(17);
        uuidBytes[0] = 9;
        uuidBytes.set(fromHex(header.value.replace(/\-/g, "")), 1);
        return uuidBytes;
    }
  }
};
var HEADER_VALUE_TYPE;
(function(HEADER_VALUE_TYPE3) {
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolTrue"] = 0] = "boolTrue";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolFalse"] = 1] = "boolFalse";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byte"] = 2] = "byte";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["short"] = 3] = "short";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["integer"] = 4] = "integer";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["long"] = 5] = "long";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byteArray"] = 6] = "byteArray";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["string"] = 7] = "string";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["timestamp"] = 8] = "timestamp";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["uuid"] = 9] = "uuid";
})(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
var UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
var Int64 = class _Int64 {
  constructor(bytes) {
    this.bytes = bytes;
    if (bytes.byteLength !== 8) {
      throw new Error("Int64 buffers must be exactly 8 bytes");
    }
  }
  static fromNumber(number) {
    if (number > 9223372036854776e3 || number < -9223372036854776e3) {
      throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
    }
    const bytes = new Uint8Array(8);
    for (let i2 = 7, remaining = Math.abs(Math.round(number)); i2 > -1 && remaining > 0; i2--, remaining /= 256) {
      bytes[i2] = remaining;
    }
    if (number < 0) {
      negate(bytes);
    }
    return new _Int64(bytes);
  }
  valueOf() {
    const bytes = this.bytes.slice(0);
    const negative = bytes[0] & 128;
    if (negative) {
      negate(bytes);
    }
    return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
  }
  toString() {
    return String(this.valueOf());
  }
};
function negate(bytes) {
  for (let i2 = 0; i2 < 8; i2++) {
    bytes[i2] ^= 255;
  }
  for (let i2 = 7; i2 > -1; i2--) {
    bytes[i2]++;
    if (bytes[i2] !== 0) break;
  }
}

// node_modules/@smithy/signature-v4/dist-es/headerUtil.js
var hasHeader = (soughtHeader, headers) => {
  soughtHeader = soughtHeader.toLowerCase();
  for (const headerName of Object.keys(headers)) {
    if (soughtHeader === headerName.toLowerCase()) {
      return true;
    }
  }
  return false;
};

// node_modules/@smithy/signature-v4/dist-es/moveHeadersToQuery.js
var moveHeadersToQuery = (request, options = {}) => {
  const {
    headers,
    query = {}
  } = HttpRequest.clone(request);
  for (const name of Object.keys(headers)) {
    const lname = name.toLowerCase();
    if (lname.slice(0, 6) === "x-amz-" && !options.unhoistableHeaders?.has(lname)) {
      query[name] = headers[name];
      delete headers[name];
    }
  }
  return __spreadProps(__spreadValues({}, request), {
    headers,
    query
  });
};

// node_modules/@smithy/signature-v4/dist-es/prepareRequest.js
var prepareRequest = (request) => {
  request = HttpRequest.clone(request);
  for (const headerName of Object.keys(request.headers)) {
    if (GENERATED_HEADERS.indexOf(headerName.toLowerCase()) > -1) {
      delete request.headers[headerName];
    }
  }
  return request;
};

// node_modules/@smithy/signature-v4/dist-es/utilDate.js
var iso8601 = (time) => toDate(time).toISOString().replace(/\.\d{3}Z$/, "Z");
var toDate = (time) => {
  if (typeof time === "number") {
    return new Date(time * 1e3);
  }
  if (typeof time === "string") {
    if (Number(time)) {
      return new Date(Number(time) * 1e3);
    }
    return new Date(time);
  }
  return time;
};

// node_modules/@smithy/signature-v4/dist-es/SignatureV4.js
var SignatureV4 = class {
  constructor({
    applyChecksum,
    credentials,
    region,
    service,
    sha256,
    uriEscapePath = true
  }) {
    this.headerFormatter = new HeaderFormatter();
    this.service = service;
    this.sha256 = sha256;
    this.uriEscapePath = uriEscapePath;
    this.applyChecksum = typeof applyChecksum === "boolean" ? applyChecksum : true;
    this.regionProvider = normalizeProvider(region);
    this.credentialProvider = normalizeProvider(credentials);
  }
  presign(_0) {
    return __async(this, arguments, function* (originalRequest, options = {}) {
      const {
        signingDate = /* @__PURE__ */ new Date(),
        expiresIn = 3600,
        unsignableHeaders,
        unhoistableHeaders,
        signableHeaders,
        signingRegion,
        signingService
      } = options;
      const credentials = yield this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? (yield this.regionProvider());
      const {
        longDate,
        shortDate
      } = formatDate(signingDate);
      if (expiresIn > MAX_PRESIGNED_TTL) {
        return Promise.reject("Signature version 4 presigned URLs must have an expiration date less than one week in the future");
      }
      const scope = createScope(shortDate, region, signingService ?? this.service);
      const request = moveHeadersToQuery(prepareRequest(originalRequest), {
        unhoistableHeaders
      });
      if (credentials.sessionToken) {
        request.query[TOKEN_QUERY_PARAM] = credentials.sessionToken;
      }
      request.query[ALGORITHM_QUERY_PARAM] = ALGORITHM_IDENTIFIER;
      request.query[CREDENTIAL_QUERY_PARAM] = `${credentials.accessKeyId}/${scope}`;
      request.query[AMZ_DATE_QUERY_PARAM] = longDate;
      request.query[EXPIRES_QUERY_PARAM] = expiresIn.toString(10);
      const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
      request.query[SIGNED_HEADERS_QUERY_PARAM] = getCanonicalHeaderList(canonicalHeaders);
      request.query[SIGNATURE_QUERY_PARAM] = yield this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, yield getPayloadHash(originalRequest, this.sha256)));
      return request;
    });
  }
  sign(toSign, options) {
    return __async(this, null, function* () {
      if (typeof toSign === "string") {
        return this.signString(toSign, options);
      } else if (toSign.headers && toSign.payload) {
        return this.signEvent(toSign, options);
      } else if (toSign.message) {
        return this.signMessage(toSign, options);
      } else {
        return this.signRequest(toSign, options);
      }
    });
  }
  signEvent(_0, _1) {
    return __async(this, arguments, function* ({
      headers,
      payload
    }, {
      signingDate = /* @__PURE__ */ new Date(),
      priorSignature,
      signingRegion,
      signingService
    }) {
      const region = signingRegion ?? (yield this.regionProvider());
      const {
        shortDate,
        longDate
      } = formatDate(signingDate);
      const scope = createScope(shortDate, region, signingService ?? this.service);
      const hashedPayload = yield getPayloadHash({
        headers: {},
        body: payload
      }, this.sha256);
      const hash = new this.sha256();
      hash.update(headers);
      const hashedHeaders = toHex(yield hash.digest());
      const stringToSign = [EVENT_ALGORITHM_IDENTIFIER, longDate, scope, priorSignature, hashedHeaders, hashedPayload].join("\n");
      return this.signString(stringToSign, {
        signingDate,
        signingRegion: region,
        signingService
      });
    });
  }
  signMessage(_0, _1) {
    return __async(this, arguments, function* (signableMessage, {
      signingDate = /* @__PURE__ */ new Date(),
      signingRegion,
      signingService
    }) {
      const promise = this.signEvent({
        headers: this.headerFormatter.format(signableMessage.message.headers),
        payload: signableMessage.message.body
      }, {
        signingDate,
        signingRegion,
        signingService,
        priorSignature: signableMessage.priorSignature
      });
      return promise.then((signature) => {
        return {
          message: signableMessage.message,
          signature
        };
      });
    });
  }
  signString(_0) {
    return __async(this, arguments, function* (stringToSign, {
      signingDate = /* @__PURE__ */ new Date(),
      signingRegion,
      signingService
    } = {}) {
      const credentials = yield this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? (yield this.regionProvider());
      const {
        shortDate
      } = formatDate(signingDate);
      const hash = new this.sha256(yield this.getSigningKey(credentials, region, shortDate, signingService));
      hash.update(toUint8Array(stringToSign));
      return toHex(yield hash.digest());
    });
  }
  signRequest(_0) {
    return __async(this, arguments, function* (requestToSign, {
      signingDate = /* @__PURE__ */ new Date(),
      signableHeaders,
      unsignableHeaders,
      signingRegion,
      signingService
    } = {}) {
      const credentials = yield this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? (yield this.regionProvider());
      const request = prepareRequest(requestToSign);
      const {
        longDate,
        shortDate
      } = formatDate(signingDate);
      const scope = createScope(shortDate, region, signingService ?? this.service);
      request.headers[AMZ_DATE_HEADER] = longDate;
      if (credentials.sessionToken) {
        request.headers[TOKEN_HEADER] = credentials.sessionToken;
      }
      const payloadHash = yield getPayloadHash(request, this.sha256);
      if (!hasHeader(SHA256_HEADER, request.headers) && this.applyChecksum) {
        request.headers[SHA256_HEADER] = payloadHash;
      }
      const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
      const signature = yield this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, payloadHash));
      request.headers[AUTH_HEADER] = `${ALGORITHM_IDENTIFIER} Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${getCanonicalHeaderList(canonicalHeaders)}, Signature=${signature}`;
      return request;
    });
  }
  createCanonicalRequest(request, canonicalHeaders, payloadHash) {
    const sortedHeaders = Object.keys(canonicalHeaders).sort();
    return `${request.method}
${this.getCanonicalPath(request)}
${getCanonicalQuery(request)}
${sortedHeaders.map((name) => `${name}:${canonicalHeaders[name]}`).join("\n")}

${sortedHeaders.join(";")}
${payloadHash}`;
  }
  createStringToSign(longDate, credentialScope, canonicalRequest) {
    return __async(this, null, function* () {
      const hash = new this.sha256();
      hash.update(toUint8Array(canonicalRequest));
      const hashedRequest = yield hash.digest();
      return `${ALGORITHM_IDENTIFIER}
${longDate}
${credentialScope}
${toHex(hashedRequest)}`;
    });
  }
  getCanonicalPath({
    path
  }) {
    if (this.uriEscapePath) {
      const normalizedPathSegments = [];
      for (const pathSegment of path.split("/")) {
        if (pathSegment?.length === 0) continue;
        if (pathSegment === ".") continue;
        if (pathSegment === "..") {
          normalizedPathSegments.pop();
        } else {
          normalizedPathSegments.push(pathSegment);
        }
      }
      const normalizedPath = `${path?.startsWith("/") ? "/" : ""}${normalizedPathSegments.join("/")}${normalizedPathSegments.length > 0 && path?.endsWith("/") ? "/" : ""}`;
      const doubleEncoded = escapeUri(normalizedPath);
      return doubleEncoded.replace(/%2F/g, "/");
    }
    return path;
  }
  getSignature(longDate, credentialScope, keyPromise, canonicalRequest) {
    return __async(this, null, function* () {
      const stringToSign = yield this.createStringToSign(longDate, credentialScope, canonicalRequest);
      const hash = new this.sha256(yield keyPromise);
      hash.update(toUint8Array(stringToSign));
      return toHex(yield hash.digest());
    });
  }
  getSigningKey(credentials, region, shortDate, service) {
    return getSigningKey(this.sha256, credentials, shortDate, region, service || this.service);
  }
  validateResolvedCredentials(credentials) {
    if (typeof credentials !== "object" || typeof credentials.accessKeyId !== "string" || typeof credentials.secretAccessKey !== "string") {
      throw new Error("Resolved credential object is not valid");
    }
  }
};
var formatDate = (now) => {
  const longDate = iso8601(now).replace(/[\-:]/g, "");
  return {
    longDate,
    shortDate: longDate.slice(0, 8)
  };
};
var getCanonicalHeaderList = (headers) => Object.keys(headers).sort().join(";");

// node_modules/@smithy/util-config-provider/dist-es/types.js
var SelectorType;
(function(SelectorType2) {
  SelectorType2["ENV"] = "env";
  SelectorType2["CONFIG"] = "shared config entry";
})(SelectorType || (SelectorType = {}));

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/constants.js
var S3_EXPRESS_BUCKET_TYPE = "Directory";
var S3_EXPRESS_BACKEND = "S3Express";
var S3_EXPRESS_AUTH_SCHEME = "sigv4-s3express";
var SESSION_TOKEN_QUERY_PARAM = "X-Amz-S3session-Token";
var SESSION_TOKEN_HEADER = SESSION_TOKEN_QUERY_PARAM.toLowerCase();

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/SignatureV4S3Express.js
var SignatureV4S3Express = class extends SignatureV4 {
  signWithCredentials(requestToSign, credentials, options) {
    return __async(this, null, function* () {
      const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
      requestToSign.headers[SESSION_TOKEN_HEADER] = credentials.sessionToken;
      const privateAccess = this;
      setSingleOverride(privateAccess, credentialsWithoutSessionToken);
      return privateAccess.signRequest(requestToSign, options ?? {});
    });
  }
  presignWithCredentials(requestToSign, credentials, options) {
    return __async(this, null, function* () {
      const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
      delete requestToSign.headers[SESSION_TOKEN_HEADER];
      requestToSign.headers[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
      requestToSign.query = requestToSign.query ?? {};
      requestToSign.query[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
      const privateAccess = this;
      setSingleOverride(privateAccess, credentialsWithoutSessionToken);
      return this.presign(requestToSign, options);
    });
  }
};
function getCredentialsWithoutSessionToken(credentials) {
  const credentialsWithoutSessionToken = {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    expiration: credentials.expiration
  };
  return credentialsWithoutSessionToken;
}
function setSingleOverride(privateAccess, credentialsWithoutSessionToken) {
  const id = setTimeout(() => {
    throw new Error("SignatureV4S3Express credential override was created but not called.");
  }, 10);
  const currentCredentialProvider = privateAccess.credentialProvider;
  const overrideCredentialsProviderOnce = () => {
    clearTimeout(id);
    privateAccess.credentialProvider = currentCredentialProvider;
    return Promise.resolve(credentialsWithoutSessionToken);
  };
  privateAccess.credentialProvider = overrideCredentialsProviderOnce;
}

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/s3ExpressMiddleware.js
var s3ExpressMiddleware = (options) => {
  return (next, context) => (args) => __async(void 0, null, function* () {
    if (context.endpointV2) {
      const endpoint = context.endpointV2;
      const isS3ExpressAuth = endpoint.properties?.authSchemes?.[0]?.name === S3_EXPRESS_AUTH_SCHEME;
      const isS3ExpressBucket = endpoint.properties?.backend === S3_EXPRESS_BACKEND || endpoint.properties?.bucketType === S3_EXPRESS_BUCKET_TYPE;
      if (isS3ExpressBucket) {
        context.isS3ExpressBucket = true;
      }
      if (isS3ExpressAuth) {
        const requestBucket = args.input.Bucket;
        if (requestBucket) {
          const s3ExpressIdentity = yield options.s3ExpressIdentityProvider.getS3ExpressIdentity(yield options.credentials(), {
            Bucket: requestBucket
          });
          context.s3ExpressIdentity = s3ExpressIdentity;
          if (HttpRequest.isInstance(args.request) && s3ExpressIdentity.sessionToken) {
            args.request.headers[SESSION_TOKEN_HEADER] = s3ExpressIdentity.sessionToken;
          }
        }
      }
    }
    return next(args);
  });
};
var s3ExpressMiddlewareOptions = {
  name: "s3ExpressMiddleware",
  step: "build",
  tags: ["S3", "S3_EXPRESS"],
  override: true
};
var getS3ExpressPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(s3ExpressMiddleware(options), s3ExpressMiddlewareOptions);
  }
});

// node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/httpAuthSchemeMiddleware.js
function convertHttpAuthSchemesToMap(httpAuthSchemes) {
  const map2 = /* @__PURE__ */ new Map();
  for (const scheme of httpAuthSchemes) {
    map2.set(scheme.schemeId, scheme);
  }
  return map2;
}
var httpAuthSchemeMiddleware = (config, mwOptions) => (next, context) => (args) => __async(void 0, null, function* () {
  const options = config.httpAuthSchemeProvider(yield mwOptions.httpAuthSchemeParametersProvider(config, context, args.input));
  const authSchemes = convertHttpAuthSchemesToMap(config.httpAuthSchemes);
  const smithyContext = getSmithyContext(context);
  const failureReasons = [];
  for (const option of options) {
    const scheme = authSchemes.get(option.schemeId);
    if (!scheme) {
      failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
      continue;
    }
    const identityProvider = scheme.identityProvider(yield mwOptions.identityProviderConfigProvider(config));
    if (!identityProvider) {
      failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
      continue;
    }
    const {
      identityProperties = {},
      signingProperties = {}
    } = option.propertiesExtractor?.(config, context) || {};
    option.identityProperties = Object.assign(option.identityProperties || {}, identityProperties);
    option.signingProperties = Object.assign(option.signingProperties || {}, signingProperties);
    smithyContext.selectedHttpAuthScheme = {
      httpAuthOption: option,
      identity: yield identityProvider(option.identityProperties),
      signer: scheme.signer
    };
    break;
  }
  if (!smithyContext.selectedHttpAuthScheme) {
    throw new Error(failureReasons.join("\n"));
  }
  return next(args);
});

// node_modules/@smithy/middleware-endpoint/dist-es/service-customizations/s3.js
var resolveParamsForS3 = (endpointParams) => __async(void 0, null, function* () {
  const bucket = endpointParams?.Bucket || "";
  if (typeof endpointParams.Bucket === "string") {
    endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
  }
  if (isArnBucketName(bucket)) {
    if (endpointParams.ForcePathStyle === true) {
      throw new Error("Path-style addressing cannot be used with ARN buckets");
    }
  } else if (!isDnsCompatibleBucketName(bucket) || bucket.indexOf(".") !== -1 && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) {
    endpointParams.ForcePathStyle = true;
  }
  if (endpointParams.DisableMultiRegionAccessPoints) {
    endpointParams.disableMultiRegionAccessPoints = true;
    endpointParams.DisableMRAP = true;
  }
  return endpointParams;
});
var DOMAIN_PATTERN = /^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/;
var IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
var DOTS_PATTERN = /\.\./;
var isDnsCompatibleBucketName = (bucketName) => DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
var isArnBucketName = (bucketName) => {
  const [arn, partition2, service, , , bucket] = bucketName.split(":");
  const isArn = arn === "arn" && bucketName.split(":").length >= 6;
  const isValidArn = Boolean(isArn && partition2 && service && bucket);
  if (isArn && !isValidArn) {
    throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
  }
  return isValidArn;
};

// node_modules/@smithy/middleware-endpoint/dist-es/adaptors/createConfigValueProvider.js
var createConfigValueProvider = (configKey, canonicalEndpointParamKey, config) => {
  const configProvider = () => __async(void 0, null, function* () {
    const configValue = config[configKey] ?? config[canonicalEndpointParamKey];
    if (typeof configValue === "function") {
      return configValue();
    }
    return configValue;
  });
  if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") {
    return () => __async(void 0, null, function* () {
      const credentials = typeof config.credentials === "function" ? yield config.credentials() : config.credentials;
      const configValue = credentials?.credentialScope ?? credentials?.CredentialScope;
      return configValue;
    });
  }
  if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") {
    return () => __async(void 0, null, function* () {
      const credentials = typeof config.credentials === "function" ? yield config.credentials() : config.credentials;
      const configValue = credentials?.accountId ?? credentials?.AccountId;
      return configValue;
    });
  }
  if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") {
    return () => __async(void 0, null, function* () {
      const endpoint = yield configProvider();
      if (endpoint && typeof endpoint === "object") {
        if ("url" in endpoint) {
          return endpoint.url.href;
        }
        if ("hostname" in endpoint) {
          const {
            protocol,
            hostname,
            port,
            path
          } = endpoint;
          return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
        }
      }
      return endpoint;
    });
  }
  return configProvider;
};

// node_modules/@smithy/middleware-endpoint/dist-es/adaptors/getEndpointFromConfig.browser.js
var getEndpointFromConfig = (serviceId) => __async(void 0, null, function* () {
  return void 0;
});

// node_modules/@smithy/querystring-parser/dist-es/index.js
function parseQueryString(querystring) {
  const query = {};
  querystring = querystring.replace(/^\?/, "");
  if (querystring) {
    for (const pair of querystring.split("&")) {
      let [key, value = null] = pair.split("=");
      key = decodeURIComponent(key);
      if (value) {
        value = decodeURIComponent(value);
      }
      if (!(key in query)) {
        query[key] = value;
      } else if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    }
  }
  return query;
}

// node_modules/@smithy/url-parser/dist-es/index.js
var parseUrl = (url) => {
  if (typeof url === "string") {
    return parseUrl(new URL(url));
  }
  const {
    hostname,
    pathname,
    port,
    protocol,
    search
  } = url;
  let query;
  if (search) {
    query = parseQueryString(search);
  }
  return {
    hostname,
    port: port ? parseInt(port) : void 0,
    protocol,
    path: pathname,
    query
  };
};

// node_modules/@smithy/middleware-endpoint/dist-es/adaptors/toEndpointV1.js
var toEndpointV1 = (endpoint) => {
  if (typeof endpoint === "object") {
    if ("url" in endpoint) {
      return parseUrl(endpoint.url);
    }
    return endpoint;
  }
  return parseUrl(endpoint);
};

// node_modules/@smithy/middleware-endpoint/dist-es/adaptors/getEndpointFromInstructions.js
var getEndpointFromInstructions = (commandInput, instructionsSupplier, clientConfig, context) => __async(void 0, null, function* () {
  if (!clientConfig.endpoint) {
    const endpointFromConfig = yield getEndpointFromConfig(clientConfig.serviceId || "");
    if (endpointFromConfig) {
      clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
    }
  }
  const endpointParams = yield resolveParams(commandInput, instructionsSupplier, clientConfig);
  if (typeof clientConfig.endpointProvider !== "function") {
    throw new Error("config.endpointProvider is not set.");
  }
  const endpoint = clientConfig.endpointProvider(endpointParams, context);
  return endpoint;
});
var resolveParams = (commandInput, instructionsSupplier, clientConfig) => __async(void 0, null, function* () {
  const endpointParams = {};
  const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
  for (const [name, instruction] of Object.entries(instructions)) {
    switch (instruction.type) {
      case "staticContextParams":
        endpointParams[name] = instruction.value;
        break;
      case "contextParams":
        endpointParams[name] = commandInput[instruction.name];
        break;
      case "clientContextParams":
      case "builtInParams":
        endpointParams[name] = yield createConfigValueProvider(instruction.name, name, clientConfig)();
        break;
      default:
        throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
    }
  }
  if (Object.keys(instructions).length === 0) {
    Object.assign(endpointParams, clientConfig);
  }
  if (String(clientConfig.serviceId).toLowerCase() === "s3") {
    yield resolveParamsForS3(endpointParams);
  }
  return endpointParams;
});

// node_modules/@smithy/middleware-endpoint/dist-es/endpointMiddleware.js
var endpointMiddleware = ({
  config,
  instructions
}) => {
  return (next, context) => (args) => __async(void 0, null, function* () {
    const endpoint = yield getEndpointFromInstructions(args.input, {
      getEndpointParameterInstructions() {
        return instructions;
      }
    }, __spreadValues({}, config), context);
    context.endpointV2 = endpoint;
    context.authSchemes = endpoint.properties?.authSchemes;
    const authScheme = context.authSchemes?.[0];
    if (authScheme) {
      context["signing_region"] = authScheme.signingRegion;
      context["signing_service"] = authScheme.signingName;
      const smithyContext = getSmithyContext(context);
      const httpAuthOption = smithyContext?.selectedHttpAuthScheme?.httpAuthOption;
      if (httpAuthOption) {
        httpAuthOption.signingProperties = Object.assign(httpAuthOption.signingProperties || {}, {
          signing_region: authScheme.signingRegion,
          signingRegion: authScheme.signingRegion,
          signing_service: authScheme.signingName,
          signingName: authScheme.signingName,
          signingRegionSet: authScheme.signingRegionSet
        }, authScheme.properties);
      }
    }
    return next(__spreadValues({}, args));
  });
};

// node_modules/@smithy/middleware-serde/dist-es/deserializerMiddleware.js
var deserializerMiddleware = (options, deserializer) => (next) => (args) => __async(void 0, null, function* () {
  const {
    response
  } = yield next(args);
  try {
    const parsed = yield deserializer(response, options);
    return {
      response,
      output: parsed
    };
  } catch (error) {
    Object.defineProperty(error, "$response", {
      value: response
    });
    if (!("$metadata" in error)) {
      const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
      error.message += "\n  " + hint;
      if (typeof error.$responseBodyText !== "undefined") {
        if (error.$response) {
          error.$response.body = error.$responseBodyText;
        }
      }
    }
    throw error;
  }
});

// node_modules/@smithy/middleware-serde/dist-es/serializerMiddleware.js
var serializerMiddleware = (options, serializer) => (next, context) => (args) => __async(void 0, null, function* () {
  const endpoint = context.endpointV2?.url && options.urlParser ? () => __async(void 0, null, function* () {
    return options.urlParser(context.endpointV2.url);
  }) : options.endpoint;
  if (!endpoint) {
    throw new Error("No valid endpoint provider available.");
  }
  const request = yield serializer(args.input, __spreadProps(__spreadValues({}, options), {
    endpoint
  }));
  return next(__spreadProps(__spreadValues({}, args), {
    request
  }));
});

// node_modules/@smithy/middleware-serde/dist-es/serdePlugin.js
var deserializerMiddlewareOption = {
  name: "deserializerMiddleware",
  step: "deserialize",
  tags: ["DESERIALIZER"],
  override: true
};
var serializerMiddlewareOption = {
  name: "serializerMiddleware",
  step: "serialize",
  tags: ["SERIALIZER"],
  override: true
};
function getSerdePlugin(config, serializer, deserializer) {
  return {
    applyToStack: (commandStack) => {
      commandStack.add(deserializerMiddleware(config, deserializer), deserializerMiddlewareOption);
      commandStack.add(serializerMiddleware(config, serializer), serializerMiddlewareOption);
    }
  };
}

// node_modules/@smithy/middleware-endpoint/dist-es/getEndpointPlugin.js
var endpointMiddlewareOptions = {
  step: "serialize",
  tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
  name: "endpointV2Middleware",
  override: true,
  relation: "before",
  toMiddleware: serializerMiddlewareOption.name
};
var getEndpointPlugin = (config, instructions) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(endpointMiddleware({
      config,
      instructions
    }), endpointMiddlewareOptions);
  }
});

// node_modules/@smithy/middleware-endpoint/dist-es/resolveEndpointConfig.js
var resolveEndpointConfig = (input) => {
  const tls = input.tls ?? true;
  const {
    endpoint
  } = input;
  const customEndpointProvider = endpoint != null ? () => __async(void 0, null, function* () {
    return toEndpointV1(yield normalizeProvider(endpoint)());
  }) : void 0;
  const isCustomEndpoint = !!endpoint;
  return __spreadProps(__spreadValues({}, input), {
    endpoint: customEndpointProvider,
    tls,
    isCustomEndpoint,
    useDualstackEndpoint: normalizeProvider(input.useDualstackEndpoint ?? false),
    useFipsEndpoint: normalizeProvider(input.useFipsEndpoint ?? false)
  });
};

// node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/getHttpAuthSchemeEndpointRuleSetPlugin.js
var httpAuthSchemeEndpointRuleSetMiddlewareOptions = {
  step: "serialize",
  tags: ["HTTP_AUTH_SCHEME"],
  name: "httpAuthSchemeMiddleware",
  override: true,
  relation: "before",
  toMiddleware: endpointMiddlewareOptions.name
};
var getHttpAuthSchemeEndpointRuleSetPlugin = (config, {
  httpAuthSchemeParametersProvider,
  identityProviderConfigProvider
}) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(httpAuthSchemeMiddleware(config, {
      httpAuthSchemeParametersProvider,
      identityProviderConfigProvider
    }), httpAuthSchemeEndpointRuleSetMiddlewareOptions);
  }
});

// node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/getHttpAuthSchemePlugin.js
var httpAuthSchemeMiddlewareOptions = {
  step: "serialize",
  tags: ["HTTP_AUTH_SCHEME"],
  name: "httpAuthSchemeMiddleware",
  override: true,
  relation: "before",
  toMiddleware: serializerMiddlewareOption.name
};

// node_modules/@smithy/core/dist-es/middleware-http-signing/httpSigningMiddleware.js
var defaultErrorHandler = (signingProperties) => (error) => {
  throw error;
};
var defaultSuccessHandler = (httpResponse, signingProperties) => {
};
var httpSigningMiddleware = (config) => (next, context) => (args) => __async(void 0, null, function* () {
  if (!HttpRequest.isInstance(args.request)) {
    return next(args);
  }
  const smithyContext = getSmithyContext(context);
  const scheme = smithyContext.selectedHttpAuthScheme;
  if (!scheme) {
    throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
  }
  const {
    httpAuthOption: {
      signingProperties = {}
    },
    identity,
    signer
  } = scheme;
  const output = yield next(__spreadProps(__spreadValues({}, args), {
    request: yield signer.sign(args.request, identity, signingProperties)
  })).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
  (signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
  return output;
});

// node_modules/@smithy/util-retry/dist-es/config.js
var RETRY_MODES;
(function(RETRY_MODES2) {
  RETRY_MODES2["STANDARD"] = "standard";
  RETRY_MODES2["ADAPTIVE"] = "adaptive";
})(RETRY_MODES || (RETRY_MODES = {}));
var DEFAULT_MAX_ATTEMPTS = 3;
var DEFAULT_RETRY_MODE = RETRY_MODES.STANDARD;

// node_modules/@smithy/service-error-classification/dist-es/constants.js
var THROTTLING_ERROR_CODES = ["BandwidthLimitExceeded", "EC2ThrottledException", "LimitExceededException", "PriorRequestNotComplete", "ProvisionedThroughputExceededException", "RequestLimitExceeded", "RequestThrottled", "RequestThrottledException", "SlowDown", "ThrottledException", "Throttling", "ThrottlingException", "TooManyRequestsException", "TransactionInProgressException"];
var TRANSIENT_ERROR_CODES = ["TimeoutError", "RequestTimeout", "RequestTimeoutException"];
var TRANSIENT_ERROR_STATUS_CODES = [500, 502, 503, 504];
var NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "ECONNREFUSED", "EPIPE", "ETIMEDOUT"];

// node_modules/@smithy/service-error-classification/dist-es/index.js
var isClockSkewCorrectedError = (error) => error.$metadata?.clockSkewCorrected;
var isThrottlingError = (error) => error.$metadata?.httpStatusCode === 429 || THROTTLING_ERROR_CODES.includes(error.name) || error.$retryable?.throttling == true;
var isTransientError = (error) => isClockSkewCorrectedError(error) || TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES.includes(error?.code || "") || TRANSIENT_ERROR_STATUS_CODES.includes(error.$metadata?.httpStatusCode || 0);
var isServerError = (error) => {
  if (error.$metadata?.httpStatusCode !== void 0) {
    const statusCode = error.$metadata.httpStatusCode;
    if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) {
      return true;
    }
    return false;
  }
  return false;
};

// node_modules/@smithy/util-retry/dist-es/DefaultRateLimiter.js
var DefaultRateLimiter = class {
  constructor(options) {
    this.currentCapacity = 0;
    this.enabled = false;
    this.lastMaxRate = 0;
    this.measuredTxRate = 0;
    this.requestCount = 0;
    this.lastTimestamp = 0;
    this.timeWindow = 0;
    this.beta = options?.beta ?? 0.7;
    this.minCapacity = options?.minCapacity ?? 1;
    this.minFillRate = options?.minFillRate ?? 0.5;
    this.scaleConstant = options?.scaleConstant ?? 0.4;
    this.smooth = options?.smooth ?? 0.8;
    const currentTimeInSeconds = this.getCurrentTimeInSeconds();
    this.lastThrottleTime = currentTimeInSeconds;
    this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
    this.fillRate = this.minFillRate;
    this.maxCapacity = this.minCapacity;
  }
  getCurrentTimeInSeconds() {
    return Date.now() / 1e3;
  }
  getSendToken() {
    return __async(this, null, function* () {
      return this.acquireTokenBucket(1);
    });
  }
  acquireTokenBucket(amount) {
    return __async(this, null, function* () {
      if (!this.enabled) {
        return;
      }
      this.refillTokenBucket();
      if (amount > this.currentCapacity) {
        const delay = (amount - this.currentCapacity) / this.fillRate * 1e3;
        yield new Promise((resolve) => setTimeout(resolve, delay));
      }
      this.currentCapacity = this.currentCapacity - amount;
    });
  }
  refillTokenBucket() {
    const timestamp = this.getCurrentTimeInSeconds();
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
      return;
    }
    const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
    this.currentCapacity = Math.min(this.maxCapacity, this.currentCapacity + fillAmount);
    this.lastTimestamp = timestamp;
  }
  updateClientSendingRate(response) {
    let calculatedRate;
    this.updateMeasuredRate();
    if (isThrottlingError(response)) {
      const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
      this.lastMaxRate = rateToUse;
      this.calculateTimeWindow();
      this.lastThrottleTime = this.getCurrentTimeInSeconds();
      calculatedRate = this.cubicThrottle(rateToUse);
      this.enableTokenBucket();
    } else {
      this.calculateTimeWindow();
      calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
    }
    const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
    this.updateTokenBucketRate(newRate);
  }
  calculateTimeWindow() {
    this.timeWindow = this.getPrecise(Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3));
  }
  cubicThrottle(rateToUse) {
    return this.getPrecise(rateToUse * this.beta);
  }
  cubicSuccess(timestamp) {
    return this.getPrecise(this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate);
  }
  enableTokenBucket() {
    this.enabled = true;
  }
  updateTokenBucketRate(newRate) {
    this.refillTokenBucket();
    this.fillRate = Math.max(newRate, this.minFillRate);
    this.maxCapacity = Math.max(newRate, this.minCapacity);
    this.currentCapacity = Math.min(this.currentCapacity, this.maxCapacity);
  }
  updateMeasuredRate() {
    const t2 = this.getCurrentTimeInSeconds();
    const timeBucket = Math.floor(t2 * 2) / 2;
    this.requestCount++;
    if (timeBucket > this.lastTxRateBucket) {
      const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
      this.measuredTxRate = this.getPrecise(currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth));
      this.requestCount = 0;
      this.lastTxRateBucket = timeBucket;
    }
  }
  getPrecise(num) {
    return parseFloat(num.toFixed(8));
  }
};

// node_modules/@smithy/util-retry/dist-es/constants.js
var DEFAULT_RETRY_DELAY_BASE = 100;
var MAXIMUM_RETRY_DELAY = 20 * 1e3;
var THROTTLING_RETRY_DELAY_BASE = 500;
var INITIAL_RETRY_TOKENS = 500;
var RETRY_COST = 5;
var TIMEOUT_RETRY_COST = 10;
var NO_RETRY_INCREMENT = 1;
var INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
var REQUEST_HEADER = "amz-sdk-request";

// node_modules/@smithy/util-retry/dist-es/defaultRetryBackoffStrategy.js
var getDefaultRetryBackoffStrategy = () => {
  let delayBase = DEFAULT_RETRY_DELAY_BASE;
  const computeNextBackoffDelay = (attempts) => {
    return Math.floor(Math.min(MAXIMUM_RETRY_DELAY, Math.random() * 2 ** attempts * delayBase));
  };
  const setDelayBase = (delay) => {
    delayBase = delay;
  };
  return {
    computeNextBackoffDelay,
    setDelayBase
  };
};

// node_modules/@smithy/util-retry/dist-es/defaultRetryToken.js
var createDefaultRetryToken = ({
  retryDelay,
  retryCount,
  retryCost
}) => {
  const getRetryCount = () => retryCount;
  const getRetryDelay = () => Math.min(MAXIMUM_RETRY_DELAY, retryDelay);
  const getRetryCost = () => retryCost;
  return {
    getRetryCount,
    getRetryDelay,
    getRetryCost
  };
};

// node_modules/@smithy/util-retry/dist-es/StandardRetryStrategy.js
var StandardRetryStrategy = class {
  constructor(maxAttempts) {
    this.maxAttempts = maxAttempts;
    this.mode = RETRY_MODES.STANDARD;
    this.capacity = INITIAL_RETRY_TOKENS;
    this.retryBackoffStrategy = getDefaultRetryBackoffStrategy();
    this.maxAttemptsProvider = typeof maxAttempts === "function" ? maxAttempts : () => __async(this, null, function* () {
      return maxAttempts;
    });
  }
  acquireInitialRetryToken(retryTokenScope) {
    return __async(this, null, function* () {
      return createDefaultRetryToken({
        retryDelay: DEFAULT_RETRY_DELAY_BASE,
        retryCount: 0
      });
    });
  }
  refreshRetryTokenForRetry(token, errorInfo) {
    return __async(this, null, function* () {
      const maxAttempts = yield this.getMaxAttempts();
      if (this.shouldRetry(token, errorInfo, maxAttempts)) {
        const errorType = errorInfo.errorType;
        this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? THROTTLING_RETRY_DELAY_BASE : DEFAULT_RETRY_DELAY_BASE);
        const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
        const retryDelay = errorInfo.retryAfterHint ? Math.max(errorInfo.retryAfterHint.getTime() - Date.now() || 0, delayFromErrorType) : delayFromErrorType;
        const capacityCost = this.getCapacityCost(errorType);
        this.capacity -= capacityCost;
        return createDefaultRetryToken({
          retryDelay,
          retryCount: token.getRetryCount() + 1,
          retryCost: capacityCost
        });
      }
      throw new Error("No retry token available");
    });
  }
  recordSuccess(token) {
    this.capacity = Math.max(INITIAL_RETRY_TOKENS, this.capacity + (token.getRetryCost() ?? NO_RETRY_INCREMENT));
  }
  getCapacity() {
    return this.capacity;
  }
  getMaxAttempts() {
    return __async(this, null, function* () {
      try {
        return yield this.maxAttemptsProvider();
      } catch (error) {
        console.warn(`Max attempts provider could not resolve. Using default of ${DEFAULT_MAX_ATTEMPTS}`);
        return DEFAULT_MAX_ATTEMPTS;
      }
    });
  }
  shouldRetry(tokenToRenew, errorInfo, maxAttempts) {
    const attempts = tokenToRenew.getRetryCount() + 1;
    return attempts < maxAttempts && this.capacity >= this.getCapacityCost(errorInfo.errorType) && this.isRetryableError(errorInfo.errorType);
  }
  getCapacityCost(errorType) {
    return errorType === "TRANSIENT" ? TIMEOUT_RETRY_COST : RETRY_COST;
  }
  isRetryableError(errorType) {
    return errorType === "THROTTLING" || errorType === "TRANSIENT";
  }
};

// node_modules/@smithy/util-retry/dist-es/AdaptiveRetryStrategy.js
var AdaptiveRetryStrategy = class {
  constructor(maxAttemptsProvider, options) {
    this.maxAttemptsProvider = maxAttemptsProvider;
    this.mode = RETRY_MODES.ADAPTIVE;
    const {
      rateLimiter
    } = options ?? {};
    this.rateLimiter = rateLimiter ?? new DefaultRateLimiter();
    this.standardRetryStrategy = new StandardRetryStrategy(maxAttemptsProvider);
  }
  acquireInitialRetryToken(retryTokenScope) {
    return __async(this, null, function* () {
      yield this.rateLimiter.getSendToken();
      return this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
    });
  }
  refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
    return __async(this, null, function* () {
      this.rateLimiter.updateClientSendingRate(errorInfo);
      return this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
    });
  }
  recordSuccess(token) {
    this.rateLimiter.updateClientSendingRate({});
    this.standardRetryStrategy.recordSuccess(token);
  }
};

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default = validate;

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i2 = 0; i2 < 256; ++i2) {
  byteToHex.push((i2 + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v2;
  const arr = new Uint8Array(16);
  arr[0] = (v2 = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v2 >>> 16 & 255;
  arr[2] = v2 >>> 8 & 255;
  arr[3] = v2 & 255;
  arr[4] = (v2 = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v2 & 255;
  arr[6] = (v2 = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v2 & 255;
  arr[8] = (v2 = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v2 & 255;
  arr[10] = (v2 = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v2 / 4294967296 & 255;
  arr[12] = v2 >>> 24 & 255;
  arr[13] = v2 >>> 16 & 255;
  arr[14] = v2 >>> 8 & 255;
  arr[15] = v2 & 255;
  return arr;
}
var parse_default = parse;

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i2 = 0; i2 < str.length; ++i2) {
    bytes.push(str.charCodeAt(i2));
  }
  return bytes;
}
var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
var URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i2 = 0; i2 < 16; ++i2) {
        buf[offset + i2] = bytes[i2];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/md5.js
function md5(bytes) {
  if (typeof bytes === "string") {
    const msg = unescape(encodeURIComponent(bytes));
    bytes = new Uint8Array(msg.length);
    for (let i2 = 0; i2 < msg.length; ++i2) {
      bytes[i2] = msg.charCodeAt(i2);
    }
  }
  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
function md5ToHexEncodedArray(input) {
  const output = [];
  const length32 = input.length * 32;
  const hexTab = "0123456789abcdef";
  for (let i2 = 0; i2 < length32; i2 += 8) {
    const x2 = input[i2 >> 5] >>> i2 % 32 & 255;
    const hex = parseInt(hexTab.charAt(x2 >>> 4 & 15) + hexTab.charAt(x2 & 15), 16);
    output.push(hex);
  }
  return output;
}
function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
function wordsToMd5(x2, len) {
  x2[len >> 5] |= 128 << len % 32;
  x2[getOutputLength(len) - 1] = len;
  let a2 = 1732584193;
  let b2 = -271733879;
  let c2 = -1732584194;
  let d2 = 271733878;
  for (let i2 = 0; i2 < x2.length; i2 += 16) {
    const olda = a2;
    const oldb = b2;
    const oldc = c2;
    const oldd = d2;
    a2 = md5ff(a2, b2, c2, d2, x2[i2], 7, -680876936);
    d2 = md5ff(d2, a2, b2, c2, x2[i2 + 1], 12, -389564586);
    c2 = md5ff(c2, d2, a2, b2, x2[i2 + 2], 17, 606105819);
    b2 = md5ff(b2, c2, d2, a2, x2[i2 + 3], 22, -1044525330);
    a2 = md5ff(a2, b2, c2, d2, x2[i2 + 4], 7, -176418897);
    d2 = md5ff(d2, a2, b2, c2, x2[i2 + 5], 12, 1200080426);
    c2 = md5ff(c2, d2, a2, b2, x2[i2 + 6], 17, -1473231341);
    b2 = md5ff(b2, c2, d2, a2, x2[i2 + 7], 22, -45705983);
    a2 = md5ff(a2, b2, c2, d2, x2[i2 + 8], 7, 1770035416);
    d2 = md5ff(d2, a2, b2, c2, x2[i2 + 9], 12, -1958414417);
    c2 = md5ff(c2, d2, a2, b2, x2[i2 + 10], 17, -42063);
    b2 = md5ff(b2, c2, d2, a2, x2[i2 + 11], 22, -1990404162);
    a2 = md5ff(a2, b2, c2, d2, x2[i2 + 12], 7, 1804603682);
    d2 = md5ff(d2, a2, b2, c2, x2[i2 + 13], 12, -40341101);
    c2 = md5ff(c2, d2, a2, b2, x2[i2 + 14], 17, -1502002290);
    b2 = md5ff(b2, c2, d2, a2, x2[i2 + 15], 22, 1236535329);
    a2 = md5gg(a2, b2, c2, d2, x2[i2 + 1], 5, -165796510);
    d2 = md5gg(d2, a2, b2, c2, x2[i2 + 6], 9, -1069501632);
    c2 = md5gg(c2, d2, a2, b2, x2[i2 + 11], 14, 643717713);
    b2 = md5gg(b2, c2, d2, a2, x2[i2], 20, -373897302);
    a2 = md5gg(a2, b2, c2, d2, x2[i2 + 5], 5, -701558691);
    d2 = md5gg(d2, a2, b2, c2, x2[i2 + 10], 9, 38016083);
    c2 = md5gg(c2, d2, a2, b2, x2[i2 + 15], 14, -660478335);
    b2 = md5gg(b2, c2, d2, a2, x2[i2 + 4], 20, -405537848);
    a2 = md5gg(a2, b2, c2, d2, x2[i2 + 9], 5, 568446438);
    d2 = md5gg(d2, a2, b2, c2, x2[i2 + 14], 9, -1019803690);
    c2 = md5gg(c2, d2, a2, b2, x2[i2 + 3], 14, -187363961);
    b2 = md5gg(b2, c2, d2, a2, x2[i2 + 8], 20, 1163531501);
    a2 = md5gg(a2, b2, c2, d2, x2[i2 + 13], 5, -1444681467);
    d2 = md5gg(d2, a2, b2, c2, x2[i2 + 2], 9, -51403784);
    c2 = md5gg(c2, d2, a2, b2, x2[i2 + 7], 14, 1735328473);
    b2 = md5gg(b2, c2, d2, a2, x2[i2 + 12], 20, -1926607734);
    a2 = md5hh(a2, b2, c2, d2, x2[i2 + 5], 4, -378558);
    d2 = md5hh(d2, a2, b2, c2, x2[i2 + 8], 11, -2022574463);
    c2 = md5hh(c2, d2, a2, b2, x2[i2 + 11], 16, 1839030562);
    b2 = md5hh(b2, c2, d2, a2, x2[i2 + 14], 23, -35309556);
    a2 = md5hh(a2, b2, c2, d2, x2[i2 + 1], 4, -1530992060);
    d2 = md5hh(d2, a2, b2, c2, x2[i2 + 4], 11, 1272893353);
    c2 = md5hh(c2, d2, a2, b2, x2[i2 + 7], 16, -155497632);
    b2 = md5hh(b2, c2, d2, a2, x2[i2 + 10], 23, -1094730640);
    a2 = md5hh(a2, b2, c2, d2, x2[i2 + 13], 4, 681279174);
    d2 = md5hh(d2, a2, b2, c2, x2[i2], 11, -358537222);
    c2 = md5hh(c2, d2, a2, b2, x2[i2 + 3], 16, -722521979);
    b2 = md5hh(b2, c2, d2, a2, x2[i2 + 6], 23, 76029189);
    a2 = md5hh(a2, b2, c2, d2, x2[i2 + 9], 4, -640364487);
    d2 = md5hh(d2, a2, b2, c2, x2[i2 + 12], 11, -421815835);
    c2 = md5hh(c2, d2, a2, b2, x2[i2 + 15], 16, 530742520);
    b2 = md5hh(b2, c2, d2, a2, x2[i2 + 2], 23, -995338651);
    a2 = md5ii(a2, b2, c2, d2, x2[i2], 6, -198630844);
    d2 = md5ii(d2, a2, b2, c2, x2[i2 + 7], 10, 1126891415);
    c2 = md5ii(c2, d2, a2, b2, x2[i2 + 14], 15, -1416354905);
    b2 = md5ii(b2, c2, d2, a2, x2[i2 + 5], 21, -57434055);
    a2 = md5ii(a2, b2, c2, d2, x2[i2 + 12], 6, 1700485571);
    d2 = md5ii(d2, a2, b2, c2, x2[i2 + 3], 10, -1894986606);
    c2 = md5ii(c2, d2, a2, b2, x2[i2 + 10], 15, -1051523);
    b2 = md5ii(b2, c2, d2, a2, x2[i2 + 1], 21, -2054922799);
    a2 = md5ii(a2, b2, c2, d2, x2[i2 + 8], 6, 1873313359);
    d2 = md5ii(d2, a2, b2, c2, x2[i2 + 15], 10, -30611744);
    c2 = md5ii(c2, d2, a2, b2, x2[i2 + 6], 15, -1560198380);
    b2 = md5ii(b2, c2, d2, a2, x2[i2 + 13], 21, 1309151649);
    a2 = md5ii(a2, b2, c2, d2, x2[i2 + 4], 6, -145523070);
    d2 = md5ii(d2, a2, b2, c2, x2[i2 + 11], 10, -1120210379);
    c2 = md5ii(c2, d2, a2, b2, x2[i2 + 2], 15, 718787259);
    b2 = md5ii(b2, c2, d2, a2, x2[i2 + 9], 21, -343485551);
    a2 = safeAdd(a2, olda);
    b2 = safeAdd(b2, oldb);
    c2 = safeAdd(c2, oldc);
    d2 = safeAdd(d2, oldd);
  }
  return [a2, b2, c2, d2];
}
function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }
  const length8 = input.length * 8;
  const output = new Uint32Array(getOutputLength(length8));
  for (let i2 = 0; i2 < length8; i2 += 8) {
    output[i2 >> 5] |= (input[i2 / 8] & 255) << i2 % 32;
  }
  return output;
}
function safeAdd(x2, y2) {
  const lsw = (x2 & 65535) + (y2 & 65535);
  const msw = (x2 >> 16) + (y2 >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
function md5cmn(q2, a2, b2, x2, s2, t2) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a2, q2), safeAdd(x2, t2)), s2), b2);
}
function md5ff(a2, b2, c2, d2, x2, s2, t2) {
  return md5cmn(b2 & c2 | ~b2 & d2, a2, b2, x2, s2, t2);
}
function md5gg(a2, b2, c2, d2, x2, s2, t2) {
  return md5cmn(b2 & d2 | c2 & ~d2, a2, b2, x2, s2, t2);
}
function md5hh(a2, b2, c2, d2, x2, s2, t2) {
  return md5cmn(b2 ^ c2 ^ d2, a2, b2, x2, s2, t2);
}
function md5ii(a2, b2, c2, d2, x2, s2, t2) {
  return md5cmn(c2 ^ (b2 | ~d2), a2, b2, x2, s2, t2);
}
var md5_default = md5;

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/v3.js
var v3 = v35("v3", 48, md5_default);

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = {
  randomUUID
};

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i2 = 0; i2 < 16; ++i2) {
      buf[offset + i2] = rnds[i2];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/sha1.js
function f(s2, x2, y2, z2) {
  switch (s2) {
    case 0:
      return x2 & y2 ^ ~x2 & z2;
    case 1:
      return x2 ^ y2 ^ z2;
    case 2:
      return x2 & y2 ^ x2 & z2 ^ y2 & z2;
    case 3:
      return x2 ^ y2 ^ z2;
  }
}
function ROTL(x2, n2) {
  return x2 << n2 | x2 >>> 32 - n2;
}
function sha1(bytes) {
  const K2 = [1518500249, 1859775393, 2400959708, 3395469782];
  const H2 = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof bytes === "string") {
    const msg = unescape(encodeURIComponent(bytes));
    bytes = [];
    for (let i2 = 0; i2 < msg.length; ++i2) {
      bytes.push(msg.charCodeAt(i2));
    }
  } else if (!Array.isArray(bytes)) {
    bytes = Array.prototype.slice.call(bytes);
  }
  bytes.push(128);
  const l2 = bytes.length / 4 + 2;
  const N2 = Math.ceil(l2 / 16);
  const M2 = new Array(N2);
  for (let i2 = 0; i2 < N2; ++i2) {
    const arr = new Uint32Array(16);
    for (let j2 = 0; j2 < 16; ++j2) {
      arr[j2] = bytes[i2 * 64 + j2 * 4] << 24 | bytes[i2 * 64 + j2 * 4 + 1] << 16 | bytes[i2 * 64 + j2 * 4 + 2] << 8 | bytes[i2 * 64 + j2 * 4 + 3];
    }
    M2[i2] = arr;
  }
  M2[N2 - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M2[N2 - 1][14] = Math.floor(M2[N2 - 1][14]);
  M2[N2 - 1][15] = (bytes.length - 1) * 8 & 4294967295;
  for (let i2 = 0; i2 < N2; ++i2) {
    const W2 = new Uint32Array(80);
    for (let t2 = 0; t2 < 16; ++t2) {
      W2[t2] = M2[i2][t2];
    }
    for (let t2 = 16; t2 < 80; ++t2) {
      W2[t2] = ROTL(W2[t2 - 3] ^ W2[t2 - 8] ^ W2[t2 - 14] ^ W2[t2 - 16], 1);
    }
    let a2 = H2[0];
    let b2 = H2[1];
    let c2 = H2[2];
    let d2 = H2[3];
    let e2 = H2[4];
    for (let t2 = 0; t2 < 80; ++t2) {
      const s2 = Math.floor(t2 / 20);
      const T2 = ROTL(a2, 5) + f(s2, b2, c2, d2) + e2 + K2[s2] + W2[t2] >>> 0;
      e2 = d2;
      d2 = c2;
      c2 = ROTL(b2, 30) >>> 0;
      b2 = a2;
      a2 = T2;
    }
    H2[0] = H2[0] + a2 >>> 0;
    H2[1] = H2[1] + b2 >>> 0;
    H2[2] = H2[2] + c2 >>> 0;
    H2[3] = H2[3] + d2 >>> 0;
    H2[4] = H2[4] + e2 >>> 0;
  }
  return [H2[0] >> 24 & 255, H2[0] >> 16 & 255, H2[0] >> 8 & 255, H2[0] & 255, H2[1] >> 24 & 255, H2[1] >> 16 & 255, H2[1] >> 8 & 255, H2[1] & 255, H2[2] >> 24 & 255, H2[2] >> 16 & 255, H2[2] >> 8 & 255, H2[2] & 255, H2[3] >> 24 & 255, H2[3] >> 16 & 255, H2[3] >> 8 & 255, H2[3] & 255, H2[4] >> 24 & 255, H2[4] >> 16 & 255, H2[4] >> 8 & 255, H2[4] & 255];
}
var sha1_default = sha1;

// node_modules/@smithy/middleware-retry/node_modules/uuid/dist/esm-browser/v5.js
var v5 = v35("v5", 80, sha1_default);

// node_modules/@smithy/middleware-retry/dist-es/util.js
var asSdkError = (error) => {
  if (error instanceof Error) return error;
  if (error instanceof Object) return Object.assign(new Error(), error);
  if (typeof error === "string") return new Error(error);
  return new Error(`AWS SDK error wrapper for ${error}`);
};

// node_modules/@smithy/middleware-retry/dist-es/configurations.js
var resolveRetryConfig = (input) => {
  const {
    retryStrategy
  } = input;
  const maxAttempts = normalizeProvider(input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);
  return __spreadProps(__spreadValues({}, input), {
    maxAttempts,
    retryStrategy: () => __async(void 0, null, function* () {
      if (retryStrategy) {
        return retryStrategy;
      }
      const retryMode = yield normalizeProvider(input.retryMode)();
      if (retryMode === RETRY_MODES.ADAPTIVE) {
        return new AdaptiveRetryStrategy(maxAttempts);
      }
      return new StandardRetryStrategy(maxAttempts);
    })
  });
};

// node_modules/@smithy/middleware-retry/dist-es/isStreamingPayload/isStreamingPayload.browser.js
var isStreamingPayload = (request) => request?.body instanceof ReadableStream;

// node_modules/@smithy/middleware-retry/dist-es/retryMiddleware.js
var retryMiddleware = (options) => (next, context) => (args) => __async(void 0, null, function* () {
  let retryStrategy = yield options.retryStrategy();
  const maxAttempts = yield options.maxAttempts();
  if (isRetryStrategyV2(retryStrategy)) {
    retryStrategy = retryStrategy;
    let retryToken = yield retryStrategy.acquireInitialRetryToken(context["partition_id"]);
    let lastError = new Error();
    let attempts = 0;
    let totalRetryDelay = 0;
    const {
      request
    } = args;
    const isRequest = HttpRequest.isInstance(request);
    if (isRequest) {
      request.headers[INVOCATION_ID_HEADER] = v4_default();
    }
    while (true) {
      try {
        if (isRequest) {
          request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
        }
        const {
          response,
          output
        } = yield next(args);
        retryStrategy.recordSuccess(retryToken);
        output.$metadata.attempts = attempts + 1;
        output.$metadata.totalRetryDelay = totalRetryDelay;
        return {
          response,
          output
        };
      } catch (e2) {
        const retryErrorInfo = getRetryErrorInfo(e2);
        lastError = asSdkError(e2);
        if (isRequest && isStreamingPayload(request)) {
          (context.logger instanceof NoOpLogger ? console : context.logger)?.warn("An error was encountered in a non-retryable streaming request.");
          throw lastError;
        }
        try {
          retryToken = yield retryStrategy.refreshRetryTokenForRetry(retryToken, retryErrorInfo);
        } catch (refreshError) {
          if (!lastError.$metadata) {
            lastError.$metadata = {};
          }
          lastError.$metadata.attempts = attempts + 1;
          lastError.$metadata.totalRetryDelay = totalRetryDelay;
          throw lastError;
        }
        attempts = retryToken.getRetryCount();
        const delay = retryToken.getRetryDelay();
        totalRetryDelay += delay;
        yield new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  } else {
    retryStrategy = retryStrategy;
    if (retryStrategy?.mode) context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
    return retryStrategy.retry(next, args);
  }
});
var isRetryStrategyV2 = (retryStrategy) => typeof retryStrategy.acquireInitialRetryToken !== "undefined" && typeof retryStrategy.refreshRetryTokenForRetry !== "undefined" && typeof retryStrategy.recordSuccess !== "undefined";
var getRetryErrorInfo = (error) => {
  const errorInfo = {
    error,
    errorType: getRetryErrorType(error)
  };
  const retryAfterHint = getRetryAfterHint(error.$response);
  if (retryAfterHint) {
    errorInfo.retryAfterHint = retryAfterHint;
  }
  return errorInfo;
};
var getRetryErrorType = (error) => {
  if (isThrottlingError(error)) return "THROTTLING";
  if (isTransientError(error)) return "TRANSIENT";
  if (isServerError(error)) return "SERVER_ERROR";
  return "CLIENT_ERROR";
};
var retryMiddlewareOptions = {
  name: "retryMiddleware",
  tags: ["RETRY"],
  step: "finalizeRequest",
  priority: "high",
  override: true
};
var getRetryPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(retryMiddleware(options), retryMiddlewareOptions);
  }
});
var getRetryAfterHint = (response) => {
  if (!HttpResponse.isInstance(response)) return;
  const retryAfterHeaderName = Object.keys(response.headers).find((key) => key.toLowerCase() === "retry-after");
  if (!retryAfterHeaderName) return;
  const retryAfter = response.headers[retryAfterHeaderName];
  const retryAfterSeconds = Number(retryAfter);
  if (!Number.isNaN(retryAfterSeconds)) return new Date(retryAfterSeconds * 1e3);
  const retryAfterDate = new Date(retryAfter);
  return retryAfterDate;
};

// node_modules/@smithy/core/dist-es/middleware-http-signing/getHttpSigningMiddleware.js
var httpSigningMiddlewareOptions = {
  step: "finalizeRequest",
  tags: ["HTTP_SIGNING"],
  name: "httpSigningMiddleware",
  aliases: ["apiKeyMiddleware", "tokenMiddleware", "awsAuthMiddleware"],
  override: true,
  relation: "after",
  toMiddleware: retryMiddlewareOptions.name
};
var getHttpSigningPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(httpSigningMiddleware(config), httpSigningMiddlewareOptions);
  }
});

// node_modules/@smithy/core/dist-es/util-identity-and-auth/DefaultIdentityProviderConfig.js
var DefaultIdentityProviderConfig = class {
  constructor(config) {
    this.authSchemes = /* @__PURE__ */ new Map();
    for (const [key, value] of Object.entries(config)) {
      if (value !== void 0) {
        this.authSchemes.set(key, value);
      }
    }
  }
  getIdentityProvider(schemeId) {
    return this.authSchemes.get(schemeId);
  }
};

// node_modules/@smithy/core/dist-es/util-identity-and-auth/memoizeIdentityProvider.js
var createIsIdentityExpiredFunction = (expirationMs) => (identity) => doesIdentityRequireRefresh(identity) && identity.expiration.getTime() - Date.now() < expirationMs;
var EXPIRATION_MS = 3e5;
var isIdentityExpired = createIsIdentityExpiredFunction(EXPIRATION_MS);
var doesIdentityRequireRefresh = (identity) => identity.expiration !== void 0;
var memoizeIdentityProvider = (provider, isExpired, requiresRefresh) => {
  if (provider === void 0) {
    return void 0;
  }
  const normalizedProvider = typeof provider !== "function" ? () => __async(void 0, null, function* () {
    return Promise.resolve(provider);
  }) : provider;
  let resolved;
  let pending;
  let hasResult;
  let isConstant = false;
  const coalesceProvider = (options) => __async(void 0, null, function* () {
    if (!pending) {
      pending = normalizedProvider(options);
    }
    try {
      resolved = yield pending;
      hasResult = true;
      isConstant = false;
    } finally {
      pending = void 0;
    }
    return resolved;
  });
  if (isExpired === void 0) {
    return (options) => __async(void 0, null, function* () {
      if (!hasResult || options?.forceRefresh) {
        resolved = yield coalesceProvider(options);
      }
      return resolved;
    });
  }
  return (options) => __async(void 0, null, function* () {
    if (!hasResult || options?.forceRefresh) {
      resolved = yield coalesceProvider(options);
    }
    if (isConstant) {
      return resolved;
    }
    if (!requiresRefresh(resolved)) {
      isConstant = true;
      return resolved;
    }
    if (isExpired(resolved)) {
      yield coalesceProvider(options);
      return resolved;
    }
    return resolved;
  });
};

// node_modules/@smithy/core/dist-es/normalizeProvider.js
var normalizeProvider2 = (input) => {
  if (typeof input === "function") return input;
  const promisified = Promise.resolve(input);
  return () => promisified;
};

// node_modules/@smithy/core/dist-es/protocols/requestBuilder.js
function requestBuilder(input, context) {
  return new RequestBuilder(input, context);
}
var RequestBuilder = class {
  constructor(input, context) {
    this.input = input;
    this.context = context;
    this.query = {};
    this.method = "";
    this.headers = {};
    this.path = "";
    this.body = null;
    this.hostname = "";
    this.resolvePathStack = [];
  }
  build() {
    return __async(this, null, function* () {
      const {
        hostname,
        protocol = "https",
        port,
        path: basePath
      } = yield this.context.endpoint();
      this.path = basePath;
      for (const resolvePath of this.resolvePathStack) {
        resolvePath(this.path);
      }
      return new HttpRequest({
        protocol,
        hostname: this.hostname || hostname,
        port,
        method: this.method,
        path: this.path,
        query: this.query,
        body: this.body,
        headers: this.headers
      });
    });
  }
  hn(hostname) {
    this.hostname = hostname;
    return this;
  }
  bp(uriLabel) {
    this.resolvePathStack.push((basePath) => {
      this.path = `${basePath?.endsWith("/") ? basePath.slice(0, -1) : basePath || ""}` + uriLabel;
    });
    return this;
  }
  p(memberName, labelValueProvider, uriLabel, isGreedyLabel) {
    this.resolvePathStack.push((path) => {
      this.path = resolvedPath(path, this.input, memberName, labelValueProvider, uriLabel, isGreedyLabel);
    });
    return this;
  }
  h(headers) {
    this.headers = headers;
    return this;
  }
  q(query) {
    this.query = query;
    return this;
  }
  b(body) {
    this.body = body;
    return this;
  }
  m(method) {
    this.method = method;
    return this;
  }
};

// node_modules/@smithy/core/dist-es/pagination/createPaginator.js
var makePagedClientRequest = (CommandCtor, client, input, ...args) => __async(void 0, null, function* () {
  return yield client.send(new CommandCtor(input), ...args);
});
function createPaginator(ClientCtor, CommandCtor, inputTokenName, outputTokenName, pageSizeTokenName) {
  return function paginateOperation(config, input, ...additionalArguments) {
    return __asyncGenerator(this, null, function* () {
      let token = config.startingToken || void 0;
      let hasNext = true;
      let page;
      while (hasNext) {
        input[inputTokenName] = token;
        if (pageSizeTokenName) {
          input[pageSizeTokenName] = input[pageSizeTokenName] ?? config.pageSize;
        }
        if (config.client instanceof ClientCtor) {
          page = yield new __await(makePagedClientRequest(CommandCtor, config.client, input, ...additionalArguments));
        } else {
          throw new Error(`Invalid client, expected instance of ${ClientCtor.name}`);
        }
        yield page;
        const prevToken = token;
        token = get(page, outputTokenName);
        hasNext = !!(token && (!config.stopOnSameToken || token !== prevToken));
      }
      return void 0;
    });
  };
}
var get = (fromObject, path) => {
  let cursor = fromObject;
  const pathComponents = path.split(".");
  for (const step of pathComponents) {
    if (!cursor || typeof cursor !== "object") {
      return void 0;
    }
    cursor = cursor[step];
  }
  return cursor;
};

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/signS3Express.js
var signS3Express = (s3ExpressIdentity, signingOptions, request, sigV4MultiRegionSigner) => __async(void 0, null, function* () {
  const signedRequest = yield sigV4MultiRegionSigner.signWithCredentials(request, s3ExpressIdentity, {});
  if (signedRequest.headers["X-Amz-Security-Token"] || signedRequest.headers["x-amz-security-token"]) {
    throw new Error("X-Amz-Security-Token must not be set for s3-express requests.");
  }
  return signedRequest;
});

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/s3ExpressHttpSigningMiddleware.js
var defaultErrorHandler2 = (signingProperties) => (error) => {
  throw error;
};
var defaultSuccessHandler2 = (httpResponse, signingProperties) => {
};
var s3ExpressHttpSigningMiddleware = (config) => (next, context) => (args) => __async(void 0, null, function* () {
  if (!HttpRequest.isInstance(args.request)) {
    return next(args);
  }
  const smithyContext = getSmithyContext(context);
  const scheme = smithyContext.selectedHttpAuthScheme;
  if (!scheme) {
    throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
  }
  const {
    httpAuthOption: {
      signingProperties = {}
    },
    identity,
    signer
  } = scheme;
  let request;
  if (context.s3ExpressIdentity) {
    request = yield signS3Express(context.s3ExpressIdentity, signingProperties, args.request, yield config.signer());
  } else {
    request = yield signer.sign(args.request, identity, signingProperties);
  }
  const output = yield next(__spreadProps(__spreadValues({}, args), {
    request
  })).catch((signer.errorHandler || defaultErrorHandler2)(signingProperties));
  (signer.successHandler || defaultSuccessHandler2)(output.response, signingProperties);
  return output;
});
var getS3ExpressHttpSigningPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(s3ExpressHttpSigningMiddleware(config), httpSigningMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3Configuration.js
var resolveS3Config = (input, {
  session
}) => {
  const [s3ClientProvider, CreateSessionCommandCtor] = session;
  return __spreadProps(__spreadValues({}, input), {
    forcePathStyle: input.forcePathStyle ?? false,
    useAccelerateEndpoint: input.useAccelerateEndpoint ?? false,
    disableMultiregionAccessPoints: input.disableMultiregionAccessPoints ?? false,
    followRegionRedirects: input.followRegionRedirects ?? false,
    s3ExpressIdentityProvider: input.s3ExpressIdentityProvider ?? new S3ExpressIdentityProviderImpl((key) => __async(void 0, null, function* () {
      return s3ClientProvider().send(new CreateSessionCommandCtor({
        Bucket: key,
        SessionMode: "ReadWrite"
      }));
    })),
    bucketEndpoint: input.bucketEndpoint ?? false
  });
};

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/throw-200-exceptions.js
var THROW_IF_EMPTY_BODY = {
  CopyObjectCommand: true,
  UploadPartCopyCommand: true,
  CompleteMultipartUploadCommand: true
};
var MAX_BYTES_TO_INSPECT = 3e3;
var throw200ExceptionsMiddleware = (config) => (next, context) => (args) => __async(void 0, null, function* () {
  const result = yield next(args);
  const {
    response
  } = result;
  if (!HttpResponse.isInstance(response)) {
    return result;
  }
  const {
    statusCode,
    body: sourceBody
  } = response;
  if (statusCode < 200 || statusCode >= 300) {
    return result;
  }
  const isSplittableStream = typeof sourceBody?.stream === "function" || typeof sourceBody?.pipe === "function" || typeof sourceBody?.tee === "function";
  if (!isSplittableStream) {
    return result;
  }
  let bodyCopy = sourceBody;
  let body = sourceBody;
  if (sourceBody && typeof sourceBody === "object" && !(sourceBody instanceof Uint8Array)) {
    [bodyCopy, body] = yield splitStream(sourceBody);
  }
  response.body = body;
  const bodyBytes = yield collectBody2(bodyCopy, {
    streamCollector: (stream) => __async(void 0, null, function* () {
      return headStream(stream, MAX_BYTES_TO_INSPECT);
    })
  });
  if (typeof bodyCopy?.destroy === "function") {
    bodyCopy.destroy();
  }
  const bodyStringTail = config.utf8Encoder(bodyBytes.subarray(bodyBytes.length - 16));
  if (bodyBytes.length === 0 && THROW_IF_EMPTY_BODY[context.commandName]) {
    const err = new Error("S3 aborted request");
    err.name = "InternalError";
    throw err;
  }
  if (bodyStringTail && bodyStringTail.endsWith("</Error>")) {
    response.statusCode = 400;
  }
  return result;
});
var collectBody2 = (streamBody = new Uint8Array(), context) => {
  if (streamBody instanceof Uint8Array) {
    return Promise.resolve(streamBody);
  }
  return context.streamCollector(streamBody) || Promise.resolve(new Uint8Array());
};
var throw200ExceptionsMiddlewareOptions = {
  relation: "after",
  toMiddleware: "deserializerMiddleware",
  tags: ["THROW_200_EXCEPTIONS", "S3"],
  name: "throw200ExceptionsMiddleware",
  override: true
};
var getThrow200ExceptionsPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(throw200ExceptionsMiddleware(config), throw200ExceptionsMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/util-arn-parser/dist-es/index.js
var validate2 = (str) => typeof str === "string" && str.indexOf("arn:") === 0 && str.split(":").length >= 6;

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/bucket-endpoint-middleware.js
function bucketEndpointMiddleware(options) {
  return (next, context) => (args) => __async(this, null, function* () {
    if (options.bucketEndpoint) {
      const endpoint = context.endpointV2;
      if (endpoint) {
        const bucket = args.input.Bucket;
        if (typeof bucket === "string") {
          try {
            const bucketEndpointUrl = new URL(bucket);
            endpoint.url = bucketEndpointUrl;
          } catch (e2) {
            const warning = `@aws-sdk/middleware-sdk-s3: bucketEndpoint=true was set but Bucket=${bucket} could not be parsed as URL.`;
            if (context.logger?.constructor?.name === "NoOpLogger") {
              console.warn(warning);
            } else {
              context.logger?.warn?.(warning);
            }
            throw e2;
          }
        }
      }
    }
    return next(args);
  });
}
var bucketEndpointMiddlewareOptions = {
  name: "bucketEndpointMiddleware",
  override: true,
  relation: "after",
  toMiddleware: "endpointV2Middleware"
};

// node_modules/@aws-sdk/middleware-sdk-s3/dist-es/validate-bucket-name.js
function validateBucketNameMiddleware({
  bucketEndpoint
}) {
  return (next) => (args) => __async(this, null, function* () {
    const {
      input: {
        Bucket
      }
    } = args;
    if (!bucketEndpoint && typeof Bucket === "string" && !validate2(Bucket) && Bucket.indexOf("/") >= 0) {
      const err = new Error(`Bucket name shouldn't contain '/', received '${Bucket}'`);
      err.name = "InvalidBucketName";
      throw err;
    }
    return next(__spreadValues({}, args));
  });
}
var validateBucketNameMiddlewareOptions = {
  step: "initialize",
  tags: ["VALIDATE_BUCKET_NAME"],
  name: "validateBucketNameMiddleware",
  override: true
};
var getValidateBucketNamePlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(validateBucketNameMiddleware(options), validateBucketNameMiddlewareOptions);
    clientStack.addRelativeTo(bucketEndpointMiddleware(options), bucketEndpointMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-user-agent/dist-es/configurations.js
function resolveUserAgentConfig(input) {
  return __spreadProps(__spreadValues({}, input), {
    customUserAgent: typeof input.customUserAgent === "string" ? [[input.customUserAgent]] : input.customUserAgent
  });
}

// node_modules/@smithy/util-endpoints/dist-es/lib/isIpAddress.js
var IP_V4_REGEX = new RegExp(`^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$`);
var isIpAddress = (value) => IP_V4_REGEX.test(value) || value.startsWith("[") && value.endsWith("]");

// node_modules/@smithy/util-endpoints/dist-es/lib/isValidHostLabel.js
var VALID_HOST_LABEL_REGEX = new RegExp(`^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$`);
var isValidHostLabel = (value, allowSubDomains = false) => {
  if (!allowSubDomains) {
    return VALID_HOST_LABEL_REGEX.test(value);
  }
  const labels = value.split(".");
  for (const label of labels) {
    if (!isValidHostLabel(label)) {
      return false;
    }
  }
  return true;
};

// node_modules/@smithy/util-endpoints/dist-es/utils/customEndpointFunctions.js
var customEndpointFunctions = {};

// node_modules/@smithy/util-endpoints/dist-es/debug/debugId.js
var debugId = "endpoints";

// node_modules/@smithy/util-endpoints/dist-es/debug/toDebugString.js
function toDebugString(input) {
  if (typeof input !== "object" || input == null) {
    return input;
  }
  if ("ref" in input) {
    return `$${toDebugString(input.ref)}`;
  }
  if ("fn" in input) {
    return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
  }
  return JSON.stringify(input, null, 2);
}

// node_modules/@smithy/util-endpoints/dist-es/types/EndpointError.js
var EndpointError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "EndpointError";
  }
};

// node_modules/@smithy/util-endpoints/dist-es/lib/booleanEquals.js
var booleanEquals = (value1, value2) => value1 === value2;

// node_modules/@smithy/util-endpoints/dist-es/lib/getAttrPathList.js
var getAttrPathList = (path) => {
  const parts = path.split(".");
  const pathList = [];
  for (const part of parts) {
    const squareBracketIndex = part.indexOf("[");
    if (squareBracketIndex !== -1) {
      if (part.indexOf("]") !== part.length - 1) {
        throw new EndpointError(`Path: '${path}' does not end with ']'`);
      }
      const arrayIndex = part.slice(squareBracketIndex + 1, -1);
      if (Number.isNaN(parseInt(arrayIndex))) {
        throw new EndpointError(`Invalid array index: '${arrayIndex}' in path: '${path}'`);
      }
      if (squareBracketIndex !== 0) {
        pathList.push(part.slice(0, squareBracketIndex));
      }
      pathList.push(arrayIndex);
    } else {
      pathList.push(part);
    }
  }
  return pathList;
};

// node_modules/@smithy/util-endpoints/dist-es/lib/getAttr.js
var getAttr = (value, path) => getAttrPathList(path).reduce((acc, index) => {
  if (typeof acc !== "object") {
    throw new EndpointError(`Index '${index}' in '${path}' not found in '${JSON.stringify(value)}'`);
  } else if (Array.isArray(acc)) {
    return acc[parseInt(index)];
  }
  return acc[index];
}, value);

// node_modules/@smithy/util-endpoints/dist-es/lib/isSet.js
var isSet = (value) => value != null;

// node_modules/@smithy/util-endpoints/dist-es/lib/not.js
var not = (value) => !value;

// node_modules/@smithy/util-endpoints/dist-es/lib/parseURL.js
var DEFAULT_PORTS = {
  [EndpointURLScheme.HTTP]: 80,
  [EndpointURLScheme.HTTPS]: 443
};
var parseURL = (value) => {
  const whatwgURL = (() => {
    try {
      if (value instanceof URL) {
        return value;
      }
      if (typeof value === "object" && "hostname" in value) {
        const {
          hostname: hostname2,
          port,
          protocol: protocol2 = "",
          path = "",
          query = {}
        } = value;
        const url = new URL(`${protocol2}//${hostname2}${port ? `:${port}` : ""}${path}`);
        url.search = Object.entries(query).map(([k2, v2]) => `${k2}=${v2}`).join("&");
        return url;
      }
      return new URL(value);
    } catch (error) {
      return null;
    }
  })();
  if (!whatwgURL) {
    console.error(`Unable to parse ${JSON.stringify(value)} as a whatwg URL.`);
    return null;
  }
  const urlString = whatwgURL.href;
  const {
    host,
    hostname,
    pathname,
    protocol,
    search
  } = whatwgURL;
  if (search) {
    return null;
  }
  const scheme = protocol.slice(0, -1);
  if (!Object.values(EndpointURLScheme).includes(scheme)) {
    return null;
  }
  const isIp = isIpAddress(hostname);
  const inputContainsDefaultPort = urlString.includes(`${host}:${DEFAULT_PORTS[scheme]}`) || typeof value === "string" && value.includes(`${host}:${DEFAULT_PORTS[scheme]}`);
  const authority = `${host}${inputContainsDefaultPort ? `:${DEFAULT_PORTS[scheme]}` : ``}`;
  return {
    scheme,
    authority,
    path: pathname,
    normalizedPath: pathname.endsWith("/") ? pathname : `${pathname}/`,
    isIp
  };
};

// node_modules/@smithy/util-endpoints/dist-es/lib/stringEquals.js
var stringEquals = (value1, value2) => value1 === value2;

// node_modules/@smithy/util-endpoints/dist-es/lib/substring.js
var substring = (input, start, stop, reverse) => {
  if (start >= stop || input.length < stop) {
    return null;
  }
  if (!reverse) {
    return input.substring(start, stop);
  }
  return input.substring(input.length - stop, input.length - start);
};

// node_modules/@smithy/util-endpoints/dist-es/lib/uriEncode.js
var uriEncode = (value) => encodeURIComponent(value).replace(/[!*'()]/g, (c2) => `%${c2.charCodeAt(0).toString(16).toUpperCase()}`);

// node_modules/@smithy/util-endpoints/dist-es/utils/endpointFunctions.js
var endpointFunctions = {
  booleanEquals,
  getAttr,
  isSet,
  isValidHostLabel,
  not,
  parseURL,
  stringEquals,
  substring,
  uriEncode
};

// node_modules/@smithy/util-endpoints/dist-es/utils/evaluateTemplate.js
var evaluateTemplate = (template, options) => {
  const evaluatedTemplateArr = [];
  const templateContext = __spreadValues(__spreadValues({}, options.endpointParams), options.referenceRecord);
  let currentIndex = 0;
  while (currentIndex < template.length) {
    const openingBraceIndex = template.indexOf("{", currentIndex);
    if (openingBraceIndex === -1) {
      evaluatedTemplateArr.push(template.slice(currentIndex));
      break;
    }
    evaluatedTemplateArr.push(template.slice(currentIndex, openingBraceIndex));
    const closingBraceIndex = template.indexOf("}", openingBraceIndex);
    if (closingBraceIndex === -1) {
      evaluatedTemplateArr.push(template.slice(openingBraceIndex));
      break;
    }
    if (template[openingBraceIndex + 1] === "{" && template[closingBraceIndex + 1] === "}") {
      evaluatedTemplateArr.push(template.slice(openingBraceIndex + 1, closingBraceIndex));
      currentIndex = closingBraceIndex + 2;
    }
    const parameterName = template.substring(openingBraceIndex + 1, closingBraceIndex);
    if (parameterName.includes("#")) {
      const [refName, attrName] = parameterName.split("#");
      evaluatedTemplateArr.push(getAttr(templateContext[refName], attrName));
    } else {
      evaluatedTemplateArr.push(templateContext[parameterName]);
    }
    currentIndex = closingBraceIndex + 1;
  }
  return evaluatedTemplateArr.join("");
};

// node_modules/@smithy/util-endpoints/dist-es/utils/getReferenceValue.js
var getReferenceValue = ({
  ref
}, options) => {
  const referenceRecord = __spreadValues(__spreadValues({}, options.endpointParams), options.referenceRecord);
  return referenceRecord[ref];
};

// node_modules/@smithy/util-endpoints/dist-es/utils/evaluateExpression.js
var evaluateExpression = (obj, keyName, options) => {
  if (typeof obj === "string") {
    return evaluateTemplate(obj, options);
  } else if (obj["fn"]) {
    return callFunction(obj, options);
  } else if (obj["ref"]) {
    return getReferenceValue(obj, options);
  }
  throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
};

// node_modules/@smithy/util-endpoints/dist-es/utils/callFunction.js
var callFunction = ({
  fn,
  argv
}, options) => {
  const evaluatedArgs = argv.map((arg) => ["boolean", "number"].includes(typeof arg) ? arg : evaluateExpression(arg, "arg", options));
  const fnSegments = fn.split(".");
  if (fnSegments[0] in customEndpointFunctions && fnSegments[1] != null) {
    return customEndpointFunctions[fnSegments[0]][fnSegments[1]](...evaluatedArgs);
  }
  return endpointFunctions[fn](...evaluatedArgs);
};

// node_modules/@smithy/util-endpoints/dist-es/utils/evaluateCondition.js
var evaluateCondition = (_a2, options) => {
  var _b = _a2, {
    assign
  } = _b, fnArgs = __objRest(_b, [
    "assign"
  ]);
  if (assign && assign in options.referenceRecord) {
    throw new EndpointError(`'${assign}' is already defined in Reference Record.`);
  }
  const value = callFunction(fnArgs, options);
  options.logger?.debug?.(`${debugId} evaluateCondition: ${toDebugString(fnArgs)} = ${toDebugString(value)}`);
  return __spreadValues({
    result: value === "" ? true : !!value
  }, assign != null && {
    toAssign: {
      name: assign,
      value
    }
  });
};

// node_modules/@smithy/util-endpoints/dist-es/utils/evaluateConditions.js
var evaluateConditions = (conditions = [], options) => {
  const conditionsReferenceRecord = {};
  for (const condition of conditions) {
    const {
      result,
      toAssign
    } = evaluateCondition(condition, __spreadProps(__spreadValues({}, options), {
      referenceRecord: __spreadValues(__spreadValues({}, options.referenceRecord), conditionsReferenceRecord)
    }));
    if (!result) {
      return {
        result
      };
    }
    if (toAssign) {
      conditionsReferenceRecord[toAssign.name] = toAssign.value;
      options.logger?.debug?.(`${debugId} assign: ${toAssign.name} := ${toDebugString(toAssign.value)}`);
    }
  }
  return {
    result: true,
    referenceRecord: conditionsReferenceRecord
  };
};

// node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointHeaders.js
var getEndpointHeaders = (headers, options) => Object.entries(headers).reduce((acc, [headerKey, headerVal]) => __spreadProps(__spreadValues({}, acc), {
  [headerKey]: headerVal.map((headerValEntry) => {
    const processedExpr = evaluateExpression(headerValEntry, "Header value entry", options);
    if (typeof processedExpr !== "string") {
      throw new EndpointError(`Header '${headerKey}' value '${processedExpr}' is not a string`);
    }
    return processedExpr;
  })
}), {});

// node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointProperty.js
var getEndpointProperty = (property, options) => {
  if (Array.isArray(property)) {
    return property.map((propertyEntry) => getEndpointProperty(propertyEntry, options));
  }
  switch (typeof property) {
    case "string":
      return evaluateTemplate(property, options);
    case "object":
      if (property === null) {
        throw new EndpointError(`Unexpected endpoint property: ${property}`);
      }
      return getEndpointProperties(property, options);
    case "boolean":
      return property;
    default:
      throw new EndpointError(`Unexpected endpoint property type: ${typeof property}`);
  }
};

// node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointProperties.js
var getEndpointProperties = (properties, options) => Object.entries(properties).reduce((acc, [propertyKey, propertyVal]) => __spreadProps(__spreadValues({}, acc), {
  [propertyKey]: getEndpointProperty(propertyVal, options)
}), {});

// node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointUrl.js
var getEndpointUrl = (endpointUrl, options) => {
  const expression = evaluateExpression(endpointUrl, "Endpoint URL", options);
  if (typeof expression === "string") {
    try {
      return new URL(expression);
    } catch (error) {
      console.error(`Failed to construct URL with ${expression}`, error);
      throw error;
    }
  }
  throw new EndpointError(`Endpoint URL must be a string, got ${typeof expression}`);
};

// node_modules/@smithy/util-endpoints/dist-es/utils/evaluateEndpointRule.js
var evaluateEndpointRule = (endpointRule, options) => {
  const {
    conditions,
    endpoint
  } = endpointRule;
  const {
    result,
    referenceRecord
  } = evaluateConditions(conditions, options);
  if (!result) {
    return;
  }
  const endpointRuleOptions = __spreadProps(__spreadValues({}, options), {
    referenceRecord: __spreadValues(__spreadValues({}, options.referenceRecord), referenceRecord)
  });
  const {
    url,
    properties,
    headers
  } = endpoint;
  options.logger?.debug?.(`${debugId} Resolving endpoint from template: ${toDebugString(endpoint)}`);
  return __spreadProps(__spreadValues(__spreadValues({}, headers != void 0 && {
    headers: getEndpointHeaders(headers, endpointRuleOptions)
  }), properties != void 0 && {
    properties: getEndpointProperties(properties, endpointRuleOptions)
  }), {
    url: getEndpointUrl(url, endpointRuleOptions)
  });
};

// node_modules/@smithy/util-endpoints/dist-es/utils/evaluateErrorRule.js
var evaluateErrorRule = (errorRule, options) => {
  const {
    conditions,
    error
  } = errorRule;
  const {
    result,
    referenceRecord
  } = evaluateConditions(conditions, options);
  if (!result) {
    return;
  }
  throw new EndpointError(evaluateExpression(error, "Error", __spreadProps(__spreadValues({}, options), {
    referenceRecord: __spreadValues(__spreadValues({}, options.referenceRecord), referenceRecord)
  })));
};

// node_modules/@smithy/util-endpoints/dist-es/utils/evaluateTreeRule.js
var evaluateTreeRule = (treeRule, options) => {
  const {
    conditions,
    rules
  } = treeRule;
  const {
    result,
    referenceRecord
  } = evaluateConditions(conditions, options);
  if (!result) {
    return;
  }
  return evaluateRules(rules, __spreadProps(__spreadValues({}, options), {
    referenceRecord: __spreadValues(__spreadValues({}, options.referenceRecord), referenceRecord)
  }));
};

// node_modules/@smithy/util-endpoints/dist-es/utils/evaluateRules.js
var evaluateRules = (rules, options) => {
  for (const rule of rules) {
    if (rule.type === "endpoint") {
      const endpointOrUndefined = evaluateEndpointRule(rule, options);
      if (endpointOrUndefined) {
        return endpointOrUndefined;
      }
    } else if (rule.type === "error") {
      evaluateErrorRule(rule, options);
    } else if (rule.type === "tree") {
      const endpointOrUndefined = evaluateTreeRule(rule, options);
      if (endpointOrUndefined) {
        return endpointOrUndefined;
      }
    } else {
      throw new EndpointError(`Unknown endpoint rule: ${rule}`);
    }
  }
  throw new EndpointError(`Rules evaluation failed`);
};

// node_modules/@smithy/util-endpoints/dist-es/resolveEndpoint.js
var resolveEndpoint = (ruleSetObject, options) => {
  const {
    endpointParams,
    logger: logger2
  } = options;
  const {
    parameters,
    rules
  } = ruleSetObject;
  options.logger?.debug?.(`${debugId} Initial EndpointParams: ${toDebugString(endpointParams)}`);
  const paramsWithDefault = Object.entries(parameters).filter(([, v2]) => v2.default != null).map(([k2, v2]) => [k2, v2.default]);
  if (paramsWithDefault.length > 0) {
    for (const [paramKey, paramDefaultValue] of paramsWithDefault) {
      endpointParams[paramKey] = endpointParams[paramKey] ?? paramDefaultValue;
    }
  }
  const requiredParams = Object.entries(parameters).filter(([, v2]) => v2.required).map(([k2]) => k2);
  for (const requiredParam of requiredParams) {
    if (endpointParams[requiredParam] == null) {
      throw new EndpointError(`Missing required parameter: '${requiredParam}'`);
    }
  }
  const endpoint = evaluateRules(rules, {
    endpointParams,
    logger: logger2,
    referenceRecord: {}
  });
  if (options.endpointParams?.Endpoint) {
    try {
      const givenEndpoint = new URL(options.endpointParams.Endpoint);
      const {
        protocol,
        port
      } = givenEndpoint;
      endpoint.url.protocol = protocol;
      endpoint.url.port = port;
    } catch (e2) {
    }
  }
  options.logger?.debug?.(`${debugId} Resolved endpoint: ${toDebugString(endpoint)}`);
  return endpoint;
};

// node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/isVirtualHostableS3Bucket.js
var isVirtualHostableS3Bucket = (value, allowSubDomains = false) => {
  if (allowSubDomains) {
    for (const label of value.split(".")) {
      if (!isVirtualHostableS3Bucket(label)) {
        return false;
      }
    }
    return true;
  }
  if (!isValidHostLabel(value)) {
    return false;
  }
  if (value.length < 3 || value.length > 63) {
    return false;
  }
  if (value !== value.toLowerCase()) {
    return false;
  }
  if (isIpAddress(value)) {
    return false;
  }
  return true;
};

// node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/parseArn.js
var ARN_DELIMITER = ":";
var RESOURCE_DELIMITER = "/";
var parseArn = (value) => {
  const segments = value.split(ARN_DELIMITER);
  if (segments.length < 6) return null;
  const [arn, partition2, service, region, accountId, ...resourcePath] = segments;
  if (arn !== "arn" || partition2 === "" || service === "" || resourcePath.join(ARN_DELIMITER) === "") return null;
  const resourceId = resourcePath.map((resource) => resource.split(RESOURCE_DELIMITER)).flat();
  return {
    partition: partition2,
    service,
    region,
    accountId,
    resourceId
  };
};

// node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/partitions.json
var partitions_default = {
  partitions: [{
    id: "aws",
    outputs: {
      dnsSuffix: "amazonaws.com",
      dualStackDnsSuffix: "api.aws",
      implicitGlobalRegion: "us-east-1",
      name: "aws",
      supportsDualStack: true,
      supportsFIPS: true
    },
    regionRegex: "^(us|eu|ap|sa|ca|me|af|il)\\-\\w+\\-\\d+$",
    regions: {
      "af-south-1": {
        description: "Africa (Cape Town)"
      },
      "ap-east-1": {
        description: "Asia Pacific (Hong Kong)"
      },
      "ap-northeast-1": {
        description: "Asia Pacific (Tokyo)"
      },
      "ap-northeast-2": {
        description: "Asia Pacific (Seoul)"
      },
      "ap-northeast-3": {
        description: "Asia Pacific (Osaka)"
      },
      "ap-south-1": {
        description: "Asia Pacific (Mumbai)"
      },
      "ap-south-2": {
        description: "Asia Pacific (Hyderabad)"
      },
      "ap-southeast-1": {
        description: "Asia Pacific (Singapore)"
      },
      "ap-southeast-2": {
        description: "Asia Pacific (Sydney)"
      },
      "ap-southeast-3": {
        description: "Asia Pacific (Jakarta)"
      },
      "ap-southeast-4": {
        description: "Asia Pacific (Melbourne)"
      },
      "ap-southeast-5": {
        description: "Asia Pacific (Malaysia)"
      },
      "aws-global": {
        description: "AWS Standard global region"
      },
      "ca-central-1": {
        description: "Canada (Central)"
      },
      "ca-west-1": {
        description: "Canada West (Calgary)"
      },
      "eu-central-1": {
        description: "Europe (Frankfurt)"
      },
      "eu-central-2": {
        description: "Europe (Zurich)"
      },
      "eu-north-1": {
        description: "Europe (Stockholm)"
      },
      "eu-south-1": {
        description: "Europe (Milan)"
      },
      "eu-south-2": {
        description: "Europe (Spain)"
      },
      "eu-west-1": {
        description: "Europe (Ireland)"
      },
      "eu-west-2": {
        description: "Europe (London)"
      },
      "eu-west-3": {
        description: "Europe (Paris)"
      },
      "il-central-1": {
        description: "Israel (Tel Aviv)"
      },
      "me-central-1": {
        description: "Middle East (UAE)"
      },
      "me-south-1": {
        description: "Middle East (Bahrain)"
      },
      "sa-east-1": {
        description: "South America (Sao Paulo)"
      },
      "us-east-1": {
        description: "US East (N. Virginia)"
      },
      "us-east-2": {
        description: "US East (Ohio)"
      },
      "us-west-1": {
        description: "US West (N. California)"
      },
      "us-west-2": {
        description: "US West (Oregon)"
      }
    }
  }, {
    id: "aws-cn",
    outputs: {
      dnsSuffix: "amazonaws.com.cn",
      dualStackDnsSuffix: "api.amazonwebservices.com.cn",
      implicitGlobalRegion: "cn-northwest-1",
      name: "aws-cn",
      supportsDualStack: true,
      supportsFIPS: true
    },
    regionRegex: "^cn\\-\\w+\\-\\d+$",
    regions: {
      "aws-cn-global": {
        description: "AWS China global region"
      },
      "cn-north-1": {
        description: "China (Beijing)"
      },
      "cn-northwest-1": {
        description: "China (Ningxia)"
      }
    }
  }, {
    id: "aws-us-gov",
    outputs: {
      dnsSuffix: "amazonaws.com",
      dualStackDnsSuffix: "api.aws",
      implicitGlobalRegion: "us-gov-west-1",
      name: "aws-us-gov",
      supportsDualStack: true,
      supportsFIPS: true
    },
    regionRegex: "^us\\-gov\\-\\w+\\-\\d+$",
    regions: {
      "aws-us-gov-global": {
        description: "AWS GovCloud (US) global region"
      },
      "us-gov-east-1": {
        description: "AWS GovCloud (US-East)"
      },
      "us-gov-west-1": {
        description: "AWS GovCloud (US-West)"
      }
    }
  }, {
    id: "aws-iso",
    outputs: {
      dnsSuffix: "c2s.ic.gov",
      dualStackDnsSuffix: "c2s.ic.gov",
      implicitGlobalRegion: "us-iso-east-1",
      name: "aws-iso",
      supportsDualStack: false,
      supportsFIPS: true
    },
    regionRegex: "^us\\-iso\\-\\w+\\-\\d+$",
    regions: {
      "aws-iso-global": {
        description: "AWS ISO (US) global region"
      },
      "us-iso-east-1": {
        description: "US ISO East"
      },
      "us-iso-west-1": {
        description: "US ISO WEST"
      }
    }
  }, {
    id: "aws-iso-b",
    outputs: {
      dnsSuffix: "sc2s.sgov.gov",
      dualStackDnsSuffix: "sc2s.sgov.gov",
      implicitGlobalRegion: "us-isob-east-1",
      name: "aws-iso-b",
      supportsDualStack: false,
      supportsFIPS: true
    },
    regionRegex: "^us\\-isob\\-\\w+\\-\\d+$",
    regions: {
      "aws-iso-b-global": {
        description: "AWS ISOB (US) global region"
      },
      "us-isob-east-1": {
        description: "US ISOB East (Ohio)"
      }
    }
  }, {
    id: "aws-iso-e",
    outputs: {
      dnsSuffix: "cloud.adc-e.uk",
      dualStackDnsSuffix: "cloud.adc-e.uk",
      implicitGlobalRegion: "eu-isoe-west-1",
      name: "aws-iso-e",
      supportsDualStack: false,
      supportsFIPS: true
    },
    regionRegex: "^eu\\-isoe\\-\\w+\\-\\d+$",
    regions: {
      "eu-isoe-west-1": {
        description: "EU ISOE West"
      }
    }
  }, {
    id: "aws-iso-f",
    outputs: {
      dnsSuffix: "csp.hci.ic.gov",
      dualStackDnsSuffix: "csp.hci.ic.gov",
      implicitGlobalRegion: "us-isof-south-1",
      name: "aws-iso-f",
      supportsDualStack: false,
      supportsFIPS: true
    },
    regionRegex: "^us\\-isof\\-\\w+\\-\\d+$",
    regions: {}
  }],
  version: "1.1"
};

// node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/partition.js
var selectedPartitionsInfo = partitions_default;
var selectedUserAgentPrefix = "";
var partition = (value) => {
  const {
    partitions
  } = selectedPartitionsInfo;
  for (const partition2 of partitions) {
    const {
      regions,
      outputs
    } = partition2;
    for (const [region, regionData] of Object.entries(regions)) {
      if (region === value) {
        return __spreadValues(__spreadValues({}, outputs), regionData);
      }
    }
  }
  for (const partition2 of partitions) {
    const {
      regionRegex,
      outputs
    } = partition2;
    if (new RegExp(regionRegex).test(value)) {
      return __spreadValues({}, outputs);
    }
  }
  const DEFAULT_PARTITION = partitions.find((partition2) => partition2.id === "aws");
  if (!DEFAULT_PARTITION) {
    throw new Error("Provided region was not found in the partition array or regex, and default partition with id 'aws' doesn't exist.");
  }
  return __spreadValues({}, DEFAULT_PARTITION.outputs);
};
var getUserAgentPrefix = () => selectedUserAgentPrefix;

// node_modules/@aws-sdk/util-endpoints/dist-es/aws.js
var awsEndpointFunctions = {
  isVirtualHostableS3Bucket,
  parseArn,
  partition
};
customEndpointFunctions.aws = awsEndpointFunctions;

// node_modules/@aws-sdk/middleware-user-agent/dist-es/constants.js
var USER_AGENT = "user-agent";
var X_AMZ_USER_AGENT = "x-amz-user-agent";
var SPACE = " ";
var UA_NAME_SEPARATOR = "/";
var UA_NAME_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g;
var UA_VALUE_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w\#]/g;
var UA_ESCAPE_CHAR = "-";

// node_modules/@aws-sdk/middleware-user-agent/dist-es/user-agent-middleware.js
var userAgentMiddleware = (options) => (next, context) => (args) => __async(void 0, null, function* () {
  const {
    request
  } = args;
  if (!HttpRequest.isInstance(request)) return next(args);
  const {
    headers
  } = request;
  const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
  const defaultUserAgent2 = (yield options.defaultUserAgentProvider()).map(escapeUserAgent);
  const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
  const prefix = getUserAgentPrefix();
  const sdkUserAgentValue = (prefix ? [prefix] : []).concat([...defaultUserAgent2, ...userAgent, ...customUserAgent]).join(SPACE);
  const normalUAValue = [...defaultUserAgent2.filter((section) => section.startsWith("aws-sdk-")), ...customUserAgent].join(SPACE);
  if (options.runtime !== "browser") {
    if (normalUAValue) {
      headers[X_AMZ_USER_AGENT] = headers[X_AMZ_USER_AGENT] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
    }
    headers[USER_AGENT] = sdkUserAgentValue;
  } else {
    headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
  }
  return next(__spreadProps(__spreadValues({}, args), {
    request
  }));
});
var escapeUserAgent = (userAgentPair) => {
  const name = userAgentPair[0].split(UA_NAME_SEPARATOR).map((part) => part.replace(UA_NAME_ESCAPE_REGEX, UA_ESCAPE_CHAR)).join(UA_NAME_SEPARATOR);
  const version = userAgentPair[1]?.replace(UA_VALUE_ESCAPE_REGEX, UA_ESCAPE_CHAR);
  const prefixSeparatorIndex = name.indexOf(UA_NAME_SEPARATOR);
  const prefix = name.substring(0, prefixSeparatorIndex);
  let uaName = name.substring(prefixSeparatorIndex + 1);
  if (prefix === "api") {
    uaName = uaName.toLowerCase();
  }
  return [prefix, uaName, version].filter((item) => item && item.length > 0).reduce((acc, item, index) => {
    switch (index) {
      case 0:
        return item;
      case 1:
        return `${acc}/${item}`;
      default:
        return `${acc}#${item}`;
    }
  }, "");
};
var getUserAgentMiddlewareOptions = {
  name: "getUserAgentMiddleware",
  step: "build",
  priority: "low",
  tags: ["SET_USER_AGENT", "USER_AGENT"],
  override: true
};
var getUserAgentPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
  }
});

// node_modules/@smithy/config-resolver/dist-es/endpointsConfig/NodeUseDualstackEndpointConfigOptions.js
var DEFAULT_USE_DUALSTACK_ENDPOINT = false;

// node_modules/@smithy/config-resolver/dist-es/endpointsConfig/NodeUseFipsEndpointConfigOptions.js
var DEFAULT_USE_FIPS_ENDPOINT = false;

// node_modules/@smithy/config-resolver/dist-es/regionConfig/isFipsRegion.js
var isFipsRegion = (region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));

// node_modules/@smithy/config-resolver/dist-es/regionConfig/getRealRegion.js
var getRealRegion = (region) => isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region;

// node_modules/@smithy/config-resolver/dist-es/regionConfig/resolveRegionConfig.js
var resolveRegionConfig = (input) => {
  const {
    region,
    useFipsEndpoint
  } = input;
  if (!region) {
    throw new Error("Region is missing");
  }
  return __spreadProps(__spreadValues({}, input), {
    region: () => __async(void 0, null, function* () {
      if (typeof region === "string") {
        return getRealRegion(region);
      }
      const providedRegion = yield region();
      return getRealRegion(providedRegion);
    }),
    useFipsEndpoint: () => __async(void 0, null, function* () {
      const providedRegion = typeof region === "string" ? region : yield region();
      if (isFipsRegion(providedRegion)) {
        return true;
      }
      return typeof useFipsEndpoint !== "function" ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
    })
  });
};

// node_modules/@smithy/eventstream-serde-config-resolver/dist-es/EventStreamSerdeConfig.js
var resolveEventStreamSerdeConfig = (input) => __spreadProps(__spreadValues({}, input), {
  eventStreamMarshaller: input.eventStreamSerdeProvider(input)
});

// node_modules/@smithy/middleware-content-length/dist-es/index.js
var CONTENT_LENGTH_HEADER2 = "content-length";
function contentLengthMiddleware(bodyLengthChecker) {
  return (next) => (args) => __async(this, null, function* () {
    const request = args.request;
    if (HttpRequest.isInstance(request)) {
      const {
        body,
        headers
      } = request;
      if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf(CONTENT_LENGTH_HEADER2) === -1) {
        try {
          const length = bodyLengthChecker(body);
          request.headers = __spreadProps(__spreadValues({}, request.headers), {
            [CONTENT_LENGTH_HEADER2]: String(length)
          });
        } catch (error) {
        }
      }
    }
    return next(__spreadProps(__spreadValues({}, args), {
      request
    }));
  });
}
var contentLengthMiddlewareOptions = {
  step: "build",
  tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
  name: "contentLengthMiddleware",
  override: true
};
var getContentLengthPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getDateHeader.js
var getDateHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.date ?? response.headers?.Date : void 0;

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getSkewCorrectedDate.js
var getSkewCorrectedDate = (systemClockOffset) => new Date(Date.now() + systemClockOffset);

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/isClockSkewed.js
var isClockSkewed = (clockTime, systemClockOffset) => Math.abs(getSkewCorrectedDate(systemClockOffset).getTime() - clockTime) >= 3e5;

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getUpdatedSystemClockOffset.js
var getUpdatedSystemClockOffset = (clockTime, currentSystemClockOffset) => {
  const clockTimeInMs = Date.parse(clockTime);
  if (isClockSkewed(clockTimeInMs, currentSystemClockOffset)) {
    return clockTimeInMs - Date.now();
  }
  return currentSystemClockOffset;
};

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4Signer.js
var throwSigningPropertyError = (name, property) => {
  if (!property) {
    throw new Error(`Property \`${name}\` is not resolved for AWS SDK SigV4Auth`);
  }
  return property;
};
var validateSigningProperties = (signingProperties) => __async(void 0, null, function* () {
  const context = throwSigningPropertyError("context", signingProperties.context);
  const config = throwSigningPropertyError("config", signingProperties.config);
  const authScheme = context.endpointV2?.properties?.authSchemes?.[0];
  const signerFunction = throwSigningPropertyError("signer", config.signer);
  const signer = yield signerFunction(authScheme);
  const signingRegion = signingProperties?.signingRegion;
  const signingRegionSet = signingProperties?.signingRegionSet;
  const signingName = signingProperties?.signingName;
  return {
    config,
    signer,
    signingRegion,
    signingRegionSet,
    signingName
  };
});
var AwsSdkSigV4Signer = class {
  sign(httpRequest, identity, signingProperties) {
    return __async(this, null, function* () {
      if (!HttpRequest.isInstance(httpRequest)) {
        throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
      }
      const validatedProps = yield validateSigningProperties(signingProperties);
      const {
        config,
        signer
      } = validatedProps;
      let {
        signingRegion,
        signingName
      } = validatedProps;
      const handlerExecutionContext = signingProperties.context;
      if (handlerExecutionContext?.authSchemes?.length ?? 0 > 1) {
        const [first, second] = handlerExecutionContext.authSchemes;
        if (first?.name === "sigv4a" && second?.name === "sigv4") {
          signingRegion = second?.signingRegion ?? signingRegion;
          signingName = second?.signingName ?? signingName;
        }
      }
      const signedRequest = yield signer.sign(httpRequest, {
        signingDate: getSkewCorrectedDate(config.systemClockOffset),
        signingRegion,
        signingService: signingName
      });
      return signedRequest;
    });
  }
  errorHandler(signingProperties) {
    return (error) => {
      const serverTime = error.ServerTime ?? getDateHeader(error.$response);
      if (serverTime) {
        const config = throwSigningPropertyError("config", signingProperties.config);
        const initialSystemClockOffset = config.systemClockOffset;
        config.systemClockOffset = getUpdatedSystemClockOffset(serverTime, config.systemClockOffset);
        const clockSkewCorrected = config.systemClockOffset !== initialSystemClockOffset;
        if (clockSkewCorrected && error.$metadata) {
          error.$metadata.clockSkewCorrected = true;
        }
      }
      throw error;
    };
  }
  successHandler(httpResponse, signingProperties) {
    const dateHeader = getDateHeader(httpResponse);
    if (dateHeader) {
      const config = throwSigningPropertyError("config", signingProperties.config);
      config.systemClockOffset = getUpdatedSystemClockOffset(dateHeader, config.systemClockOffset);
    }
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4ASigner.js
var AwsSdkSigV4ASigner = class extends AwsSdkSigV4Signer {
  sign(httpRequest, identity, signingProperties) {
    return __async(this, null, function* () {
      if (!HttpRequest.isInstance(httpRequest)) {
        throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
      }
      const {
        config,
        signer,
        signingRegion,
        signingRegionSet,
        signingName
      } = yield validateSigningProperties(signingProperties);
      const configResolvedSigningRegionSet = yield config.sigv4aSigningRegionSet?.();
      const multiRegionOverride = (configResolvedSigningRegionSet ?? signingRegionSet ?? [signingRegion]).join(",");
      const signedRequest = yield signer.sign(httpRequest, {
        signingDate: getSkewCorrectedDate(config.systemClockOffset),
        signingRegion: multiRegionOverride,
        signingService: signingName
      });
      return signedRequest;
    });
  }
};

// node_modules/@smithy/property-provider/dist-es/memoize.js
var memoize = (provider, isExpired, requiresRefresh) => {
  let resolved;
  let pending;
  let hasResult;
  let isConstant = false;
  const coalesceProvider = () => __async(void 0, null, function* () {
    if (!pending) {
      pending = provider();
    }
    try {
      resolved = yield pending;
      hasResult = true;
      isConstant = false;
    } finally {
      pending = void 0;
    }
    return resolved;
  });
  if (isExpired === void 0) {
    return (options) => __async(void 0, null, function* () {
      if (!hasResult || options?.forceRefresh) {
        resolved = yield coalesceProvider();
      }
      return resolved;
    });
  }
  return (options) => __async(void 0, null, function* () {
    if (!hasResult || options?.forceRefresh) {
      resolved = yield coalesceProvider();
    }
    if (isConstant) {
      return resolved;
    }
    if (requiresRefresh && !requiresRefresh(resolved)) {
      isConstant = true;
      return resolved;
    }
    if (isExpired(resolved)) {
      yield coalesceProvider();
      return resolved;
    }
    return resolved;
  });
};

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4AConfig.js
var resolveAwsSdkSigV4AConfig = (config) => {
  config.sigv4aSigningRegionSet = normalizeProvider2(config.sigv4aSigningRegionSet);
  return config;
};

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4Config.js
var resolveAwsSdkSigV4Config = (config) => {
  let normalizedCreds;
  if (config.credentials) {
    normalizedCreds = memoizeIdentityProvider(config.credentials, isIdentityExpired, doesIdentityRequireRefresh);
  }
  if (!normalizedCreds) {
    if (config.credentialDefaultProvider) {
      normalizedCreds = normalizeProvider2(config.credentialDefaultProvider(Object.assign({}, config, {
        parentClientConfig: config
      })));
    } else {
      normalizedCreds = () => __async(void 0, null, function* () {
        throw new Error("`credentials` is missing");
      });
    }
  }
  const {
    signingEscapePath = true,
    systemClockOffset = config.systemClockOffset || 0,
    sha256
  } = config;
  let signer;
  if (config.signer) {
    signer = normalizeProvider2(config.signer);
  } else if (config.regionInfoProvider) {
    signer = () => normalizeProvider2(config.region)().then((region) => __async(void 0, null, function* () {
      return [(yield config.regionInfoProvider(region, {
        useFipsEndpoint: yield config.useFipsEndpoint(),
        useDualstackEndpoint: yield config.useDualstackEndpoint()
      })) || {}, region];
    })).then(([regionInfo, region]) => {
      const {
        signingRegion,
        signingService
      } = regionInfo;
      config.signingRegion = config.signingRegion || signingRegion || region;
      config.signingName = config.signingName || signingService || config.serviceId;
      const params = __spreadProps(__spreadValues({}, config), {
        credentials: normalizedCreds,
        region: config.signingRegion,
        service: config.signingName,
        sha256,
        uriEscapePath: signingEscapePath
      });
      const SignerCtor = config.signerConstructor || SignatureV4;
      return new SignerCtor(params);
    });
  } else {
    signer = (authScheme) => __async(void 0, null, function* () {
      authScheme = Object.assign({}, {
        name: "sigv4",
        signingName: config.signingName || config.defaultSigningName,
        signingRegion: yield normalizeProvider2(config.region)(),
        properties: {}
      }, authScheme);
      const signingRegion = authScheme.signingRegion;
      const signingService = authScheme.signingName;
      config.signingRegion = config.signingRegion || signingRegion;
      config.signingName = config.signingName || signingService || config.serviceId;
      const params = __spreadProps(__spreadValues({}, config), {
        credentials: normalizedCreds,
        region: config.signingRegion,
        service: config.signingName,
        sha256,
        uriEscapePath: signingEscapePath
      });
      const SignerCtor = config.signerConstructor || SignatureV4;
      return new SignerCtor(params);
    });
  }
  return __spreadProps(__spreadValues({}, config), {
    systemClockOffset,
    signingEscapePath,
    credentials: normalizedCreds,
    signer
  });
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/common.js
var collectBodyString = (streamBody, context) => collectBody(streamBody, context).then((body) => context.utf8Encoder(body));

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/parseXmlBody.js
var import_fast_xml_parser = __toESM(require_fxp());
var parseXmlBody = (streamBody, context) => collectBodyString(streamBody, context).then((encoded) => {
  if (encoded.length) {
    const parser = new import_fast_xml_parser.XMLParser({
      attributeNamePrefix: "",
      htmlEntities: true,
      ignoreAttributes: false,
      ignoreDeclaration: true,
      parseTagValue: false,
      trimValues: false,
      tagValueProcessor: (_, val2) => val2.trim() === "" && val2.includes("\n") ? "" : void 0
    });
    parser.addEntity("#xD", "\r");
    parser.addEntity("#10", "\n");
    let parsedObj;
    try {
      parsedObj = parser.parse(encoded, true);
    } catch (e2) {
      if (e2 && typeof e2 === "object") {
        Object.defineProperty(e2, "$responseBodyText", {
          value: encoded
        });
      }
      throw e2;
    }
    const textNodeName = "#text";
    const key = Object.keys(parsedObj)[0];
    const parsedObjToReturn = parsedObj[key];
    if (parsedObjToReturn[textNodeName]) {
      parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
      delete parsedObjToReturn[textNodeName];
    }
    return getValueFromTextNode(parsedObjToReturn);
  }
  return {};
});
var parseXmlErrorBody = (errorBody, context) => __async(void 0, null, function* () {
  const value = yield parseXmlBody(errorBody, context);
  if (value.Error) {
    value.Error.message = value.Error.message ?? value.Error.Message;
  }
  return value;
});
var loadRestXmlErrorCode = (output, data) => {
  if (data?.Error?.Code !== void 0) {
    return data.Error.Code;
  }
  if (data?.Code !== void 0) {
    return data.Code;
  }
  if (output.statusCode == 404) {
    return "NotFound";
  }
};

// node_modules/@aws-sdk/signature-v4-multi-region/dist-es/signature-v4-crt-container.js
var signatureV4CrtContainer = {
  CrtSignerV4: null
};

// node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4MultiRegion.js
var SignatureV4MultiRegion = class {
  constructor(options) {
    this.sigv4Signer = new SignatureV4S3Express(options);
    this.signerOptions = options;
  }
  sign(_0) {
    return __async(this, arguments, function* (requestToSign, options = {}) {
      if (options.signingRegion === "*") {
        if (this.signerOptions.runtime !== "node") throw new Error("This request requires signing with SigV4Asymmetric algorithm. It's only available in Node.js");
        return this.getSigv4aSigner().sign(requestToSign, options);
      }
      return this.sigv4Signer.sign(requestToSign, options);
    });
  }
  signWithCredentials(_0, _1) {
    return __async(this, arguments, function* (requestToSign, credentials, options = {}) {
      if (options.signingRegion === "*") {
        if (this.signerOptions.runtime !== "node") throw new Error("This request requires signing with SigV4Asymmetric algorithm. It's only available in Node.js");
        return this.getSigv4aSigner().signWithCredentials(requestToSign, credentials, options);
      }
      return this.sigv4Signer.signWithCredentials(requestToSign, credentials, options);
    });
  }
  presign(_0) {
    return __async(this, arguments, function* (originalRequest, options = {}) {
      if (options.signingRegion === "*") {
        if (this.signerOptions.runtime !== "node") throw new Error("This request requires signing with SigV4Asymmetric algorithm. It's only available in Node.js");
        return this.getSigv4aSigner().presign(originalRequest, options);
      }
      return this.sigv4Signer.presign(originalRequest, options);
    });
  }
  presignWithCredentials(_0, _1) {
    return __async(this, arguments, function* (originalRequest, credentials, options = {}) {
      if (options.signingRegion === "*") {
        throw new Error("Method presignWithCredentials is not supported for [signingRegion=*].");
      }
      return this.sigv4Signer.presignWithCredentials(originalRequest, credentials, options);
    });
  }
  getSigv4aSigner() {
    if (!this.sigv4aSigner) {
      let CrtSignerV4 = null;
      try {
        CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
        if (typeof CrtSignerV4 !== "function") throw new Error();
      } catch (e2) {
        e2.message = `${e2.message}
Please check whether you have installed the "@aws-sdk/signature-v4-crt" package explicitly. 
You must also register the package by calling [require("@aws-sdk/signature-v4-crt");] or an ESM equivalent such as [import "@aws-sdk/signature-v4-crt";]. 
For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt`;
        throw e2;
      }
      this.sigv4aSigner = new CrtSignerV4(__spreadProps(__spreadValues({}, this.signerOptions), {
        signingAlgorithm: 1
      }));
    }
    return this.sigv4aSigner;
  }
};

// node_modules/@aws-sdk/client-s3/dist-es/endpoint/ruleset.js
var ce = "required";
var cf = "type";
var cg = "conditions";
var ch = "fn";
var ci = "argv";
var cj = "ref";
var ck = "assign";
var cl = "url";
var cm = "properties";
var cn = "backend";
var co = "authSchemes";
var cp = "disableDoubleEncoding";
var cq = "signingName";
var cr = "signingRegion";
var cs = "headers";
var ct = "signingRegionSet";
var a = false;
var b = true;
var c = "isSet";
var d = "booleanEquals";
var e = "error";
var f2 = "aws.partition";
var g = "stringEquals";
var h = "getAttr";
var i = "name";
var j = "substring";
var k = "bucketSuffix";
var l = "parseURL";
var m = "{url#scheme}://{url#authority}/{uri_encoded_bucket}{url#path}";
var n = "endpoint";
var o = "tree";
var p = "aws.isVirtualHostableS3Bucket";
var q = "{url#scheme}://{Bucket}.{url#authority}{url#path}";
var r = "not";
var s = "{url#scheme}://{url#authority}{url#path}";
var t = "hardwareType";
var u = "regionPrefix";
var v = "bucketAliasSuffix";
var w = "outpostId";
var x = "isValidHostLabel";
var y = "sigv4a";
var z = "s3-outposts";
var A = "s3";
var B = "{url#scheme}://{url#authority}{url#normalizedPath}{Bucket}";
var C = "https://{Bucket}.s3-accelerate.{partitionResult#dnsSuffix}";
var D = "https://{Bucket}.s3.{partitionResult#dnsSuffix}";
var E = "aws.parseArn";
var F = "bucketArn";
var G = "arnType";
var H = "";
var I = "s3-object-lambda";
var J = "accesspoint";
var K = "accessPointName";
var L = "{url#scheme}://{accessPointName}-{bucketArn#accountId}.{url#authority}{url#path}";
var M = "mrapPartition";
var N = "outpostType";
var O = "arnPrefix";
var P = "{url#scheme}://{url#authority}{url#normalizedPath}{uri_encoded_bucket}";
var Q = "https://s3.{partitionResult#dnsSuffix}/{uri_encoded_bucket}";
var R = "https://s3.{partitionResult#dnsSuffix}";
var S = {
  [ce]: false,
  [cf]: "String"
};
var T = {
  [ce]: true,
  "default": false,
  [cf]: "Boolean"
};
var U = {
  [ce]: false,
  [cf]: "Boolean"
};
var V = {
  [ch]: d,
  [ci]: [{
    [cj]: "Accelerate"
  }, true]
};
var W = {
  [ch]: d,
  [ci]: [{
    [cj]: "UseFIPS"
  }, true]
};
var X = {
  [ch]: d,
  [ci]: [{
    [cj]: "UseDualStack"
  }, true]
};
var Y = {
  [ch]: c,
  [ci]: [{
    [cj]: "Endpoint"
  }]
};
var Z = {
  [ch]: f2,
  [ci]: [{
    [cj]: "Region"
  }],
  [ck]: "partitionResult"
};
var aa = {
  [ch]: g,
  [ci]: [{
    [ch]: h,
    [ci]: [{
      [cj]: "partitionResult"
    }, i]
  }, "aws-cn"]
};
var ab = {
  [ch]: c,
  [ci]: [{
    [cj]: "Bucket"
  }]
};
var ac = {
  [cj]: "Bucket"
};
var ad = {
  [ch]: l,
  [ci]: [{
    [cj]: "Endpoint"
  }],
  [ck]: "url"
};
var ae = {
  [ch]: d,
  [ci]: [{
    [ch]: h,
    [ci]: [{
      [cj]: "url"
    }, "isIp"]
  }, true]
};
var af = {
  [cj]: "url"
};
var ag = {
  [ch]: "uriEncode",
  [ci]: [ac],
  [ck]: "uri_encoded_bucket"
};
var ah = {
  [cn]: "S3Express",
  [co]: [{
    [cp]: true,
    [i]: "sigv4",
    [cq]: "s3express",
    [cr]: "{Region}"
  }]
};
var ai = {};
var aj = {
  [ch]: p,
  [ci]: [ac, false]
};
var ak = {
  [e]: "S3Express bucket name is not a valid virtual hostable name.",
  [cf]: e
};
var al = {
  [cn]: "S3Express",
  [co]: [{
    [cp]: true,
    [i]: "sigv4-s3express",
    [cq]: "s3express",
    [cr]: "{Region}"
  }]
};
var am = {
  [ch]: c,
  [ci]: [{
    [cj]: "UseS3ExpressControlEndpoint"
  }]
};
var an = {
  [ch]: d,
  [ci]: [{
    [cj]: "UseS3ExpressControlEndpoint"
  }, true]
};
var ao = {
  [ch]: r,
  [ci]: [Y]
};
var ap = {
  [e]: "Unrecognized S3Express bucket name format.",
  [cf]: e
};
var aq = {
  [ch]: r,
  [ci]: [ab]
};
var ar = {
  [cj]: t
};
var as = {
  [cg]: [ao],
  [e]: "Expected a endpoint to be specified but no endpoint was found",
  [cf]: e
};
var at = {
  [co]: [{
    [cp]: true,
    [i]: y,
    [cq]: z,
    [ct]: ["*"]
  }, {
    [cp]: true,
    [i]: "sigv4",
    [cq]: z,
    [cr]: "{Region}"
  }]
};
var au = {
  [ch]: d,
  [ci]: [{
    [cj]: "ForcePathStyle"
  }, false]
};
var av = {
  [cj]: "ForcePathStyle"
};
var aw = {
  [ch]: d,
  [ci]: [{
    [cj]: "Accelerate"
  }, false]
};
var ax = {
  [ch]: g,
  [ci]: [{
    [cj]: "Region"
  }, "aws-global"]
};
var ay = {
  [co]: [{
    [cp]: true,
    [i]: "sigv4",
    [cq]: A,
    [cr]: "us-east-1"
  }]
};
var az = {
  [ch]: r,
  [ci]: [ax]
};
var aA = {
  [ch]: d,
  [ci]: [{
    [cj]: "UseGlobalEndpoint"
  }, true]
};
var aB = {
  [cl]: "https://{Bucket}.s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}",
  [cm]: {
    [co]: [{
      [cp]: true,
      [i]: "sigv4",
      [cq]: A,
      [cr]: "{Region}"
    }]
  },
  [cs]: {}
};
var aC = {
  [co]: [{
    [cp]: true,
    [i]: "sigv4",
    [cq]: A,
    [cr]: "{Region}"
  }]
};
var aD = {
  [ch]: d,
  [ci]: [{
    [cj]: "UseGlobalEndpoint"
  }, false]
};
var aE = {
  [ch]: d,
  [ci]: [{
    [cj]: "UseDualStack"
  }, false]
};
var aF = {
  [cl]: "https://{Bucket}.s3-fips.{Region}.{partitionResult#dnsSuffix}",
  [cm]: aC,
  [cs]: {}
};
var aG = {
  [ch]: d,
  [ci]: [{
    [cj]: "UseFIPS"
  }, false]
};
var aH = {
  [cl]: "https://{Bucket}.s3-accelerate.dualstack.{partitionResult#dnsSuffix}",
  [cm]: aC,
  [cs]: {}
};
var aI = {
  [cl]: "https://{Bucket}.s3.dualstack.{Region}.{partitionResult#dnsSuffix}",
  [cm]: aC,
  [cs]: {}
};
var aJ = {
  [ch]: d,
  [ci]: [{
    [ch]: h,
    [ci]: [af, "isIp"]
  }, false]
};
var aK = {
  [cl]: B,
  [cm]: aC,
  [cs]: {}
};
var aL = {
  [cl]: q,
  [cm]: aC,
  [cs]: {}
};
var aM = {
  [n]: aL,
  [cf]: n
};
var aN = {
  [cl]: C,
  [cm]: aC,
  [cs]: {}
};
var aO = {
  [cl]: "https://{Bucket}.s3.{Region}.{partitionResult#dnsSuffix}",
  [cm]: aC,
  [cs]: {}
};
var aP = {
  [e]: "Invalid region: region was not a valid DNS name.",
  [cf]: e
};
var aQ = {
  [cj]: F
};
var aR = {
  [cj]: G
};
var aS = {
  [ch]: h,
  [ci]: [aQ, "service"]
};
var aT = {
  [cj]: K
};
var aU = {
  [cg]: [X],
  [e]: "S3 Object Lambda does not support Dual-stack",
  [cf]: e
};
var aV = {
  [cg]: [V],
  [e]: "S3 Object Lambda does not support S3 Accelerate",
  [cf]: e
};
var aW = {
  [cg]: [{
    [ch]: c,
    [ci]: [{
      [cj]: "DisableAccessPoints"
    }]
  }, {
    [ch]: d,
    [ci]: [{
      [cj]: "DisableAccessPoints"
    }, true]
  }],
  [e]: "Access points are not supported for this operation",
  [cf]: e
};
var aX = {
  [cg]: [{
    [ch]: c,
    [ci]: [{
      [cj]: "UseArnRegion"
    }]
  }, {
    [ch]: d,
    [ci]: [{
      [cj]: "UseArnRegion"
    }, false]
  }, {
    [ch]: r,
    [ci]: [{
      [ch]: g,
      [ci]: [{
        [ch]: h,
        [ci]: [aQ, "region"]
      }, "{Region}"]
    }]
  }],
  [e]: "Invalid configuration: region from ARN `{bucketArn#region}` does not match client region `{Region}` and UseArnRegion is `false`",
  [cf]: e
};
var aY = {
  [ch]: h,
  [ci]: [{
    [cj]: "bucketPartition"
  }, i]
};
var aZ = {
  [ch]: h,
  [ci]: [aQ, "accountId"]
};
var ba = {
  [co]: [{
    [cp]: true,
    [i]: "sigv4",
    [cq]: I,
    [cr]: "{bucketArn#region}"
  }]
};
var bb = {
  [e]: "Invalid ARN: The access point name may only contain a-z, A-Z, 0-9 and `-`. Found: `{accessPointName}`",
  [cf]: e
};
var bc = {
  [e]: "Invalid ARN: The account id may only contain a-z, A-Z, 0-9 and `-`. Found: `{bucketArn#accountId}`",
  [cf]: e
};
var bd = {
  [e]: "Invalid region in ARN: `{bucketArn#region}` (invalid DNS name)",
  [cf]: e
};
var be = {
  [e]: "Client was configured for partition `{partitionResult#name}` but ARN (`{Bucket}`) has `{bucketPartition#name}`",
  [cf]: e
};
var bf = {
  [e]: "Invalid ARN: The ARN may only contain a single resource component after `accesspoint`.",
  [cf]: e
};
var bg = {
  [e]: "Invalid ARN: Expected a resource of the format `accesspoint:<accesspoint name>` but no name was provided",
  [cf]: e
};
var bh = {
  [co]: [{
    [cp]: true,
    [i]: "sigv4",
    [cq]: A,
    [cr]: "{bucketArn#region}"
  }]
};
var bi = {
  [co]: [{
    [cp]: true,
    [i]: y,
    [cq]: z,
    [ct]: ["*"]
  }, {
    [cp]: true,
    [i]: "sigv4",
    [cq]: z,
    [cr]: "{bucketArn#region}"
  }]
};
var bj = {
  [ch]: E,
  [ci]: [ac]
};
var bk = {
  [cl]: "https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}",
  [cm]: aC,
  [cs]: {}
};
var bl = {
  [cl]: "https://s3-fips.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}",
  [cm]: aC,
  [cs]: {}
};
var bm = {
  [cl]: "https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}",
  [cm]: aC,
  [cs]: {}
};
var bn = {
  [cl]: P,
  [cm]: aC,
  [cs]: {}
};
var bo = {
  [cl]: "https://s3.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}",
  [cm]: aC,
  [cs]: {}
};
var bp = {
  [cj]: "UseObjectLambdaEndpoint"
};
var bq = {
  [co]: [{
    [cp]: true,
    [i]: "sigv4",
    [cq]: I,
    [cr]: "{Region}"
  }]
};
var br = {
  [cl]: "https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}",
  [cm]: aC,
  [cs]: {}
};
var bs = {
  [cl]: "https://s3-fips.{Region}.{partitionResult#dnsSuffix}",
  [cm]: aC,
  [cs]: {}
};
var bt = {
  [cl]: "https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}",
  [cm]: aC,
  [cs]: {}
};
var bu = {
  [cl]: s,
  [cm]: aC,
  [cs]: {}
};
var bv = {
  [cl]: "https://s3.{Region}.{partitionResult#dnsSuffix}",
  [cm]: aC,
  [cs]: {}
};
var bw = [{
  [cj]: "Region"
}];
var bx = [{
  [cj]: "Endpoint"
}];
var by = [ac];
var bz = [X];
var bA = [V];
var bB = [Y, ad];
var bC = [{
  [ch]: c,
  [ci]: [{
    [cj]: "DisableS3ExpressSessionAuth"
  }]
}, {
  [ch]: d,
  [ci]: [{
    [cj]: "DisableS3ExpressSessionAuth"
  }, true]
}];
var bD = [ae];
var bE = [ag];
var bF = [aj];
var bG = [W];
var bH = [{
  [ch]: j,
  [ci]: [ac, 6, 14, true],
  [ck]: "s3expressAvailabilityZoneId"
}, {
  [ch]: j,
  [ci]: [ac, 14, 16, true],
  [ck]: "s3expressAvailabilityZoneDelim"
}, {
  [ch]: g,
  [ci]: [{
    [cj]: "s3expressAvailabilityZoneDelim"
  }, "--"]
}];
var bI = [{
  [cg]: [W],
  [n]: {
    [cl]: "https://{Bucket}.s3express-fips-{s3expressAvailabilityZoneId}.{Region}.amazonaws.com",
    [cm]: ah,
    [cs]: {}
  },
  [cf]: n
}, {
  [n]: {
    [cl]: "https://{Bucket}.s3express-{s3expressAvailabilityZoneId}.{Region}.amazonaws.com",
    [cm]: ah,
    [cs]: {}
  },
  [cf]: n
}];
var bJ = [{
  [ch]: j,
  [ci]: [ac, 6, 15, true],
  [ck]: "s3expressAvailabilityZoneId"
}, {
  [ch]: j,
  [ci]: [ac, 15, 17, true],
  [ck]: "s3expressAvailabilityZoneDelim"
}, {
  [ch]: g,
  [ci]: [{
    [cj]: "s3expressAvailabilityZoneDelim"
  }, "--"]
}];
var bK = [{
  [cg]: [W],
  [n]: {
    [cl]: "https://{Bucket}.s3express-fips-{s3expressAvailabilityZoneId}.{Region}.amazonaws.com",
    [cm]: al,
    [cs]: {}
  },
  [cf]: n
}, {
  [n]: {
    [cl]: "https://{Bucket}.s3express-{s3expressAvailabilityZoneId}.{Region}.amazonaws.com",
    [cm]: al,
    [cs]: {}
  },
  [cf]: n
}];
var bL = [ab];
var bM = [{
  [ch]: x,
  [ci]: [{
    [cj]: w
  }, false]
}];
var bN = [{
  [ch]: g,
  [ci]: [{
    [cj]: u
  }, "beta"]
}];
var bO = ["*"];
var bP = [Z];
var bQ = [{
  [ch]: x,
  [ci]: [{
    [cj]: "Region"
  }, false]
}];
var bR = [{
  [ch]: g,
  [ci]: [{
    [cj]: "Region"
  }, "us-east-1"]
}];
var bS = [{
  [ch]: g,
  [ci]: [aR, J]
}];
var bT = [{
  [ch]: h,
  [ci]: [aQ, "resourceId[1]"],
  [ck]: K
}, {
  [ch]: r,
  [ci]: [{
    [ch]: g,
    [ci]: [aT, H]
  }]
}];
var bU = [aQ, "resourceId[1]"];
var bV = [{
  [ch]: r,
  [ci]: [{
    [ch]: g,
    [ci]: [{
      [ch]: h,
      [ci]: [aQ, "region"]
    }, H]
  }]
}];
var bW = [{
  [ch]: r,
  [ci]: [{
    [ch]: c,
    [ci]: [{
      [ch]: h,
      [ci]: [aQ, "resourceId[2]"]
    }]
  }]
}];
var bX = [aQ, "resourceId[2]"];
var bY = [{
  [ch]: f2,
  [ci]: [{
    [ch]: h,
    [ci]: [aQ, "region"]
  }],
  [ck]: "bucketPartition"
}];
var bZ = [{
  [ch]: g,
  [ci]: [aY, {
    [ch]: h,
    [ci]: [{
      [cj]: "partitionResult"
    }, i]
  }]
}];
var ca = [{
  [ch]: x,
  [ci]: [{
    [ch]: h,
    [ci]: [aQ, "region"]
  }, true]
}];
var cb = [{
  [ch]: x,
  [ci]: [aZ, false]
}];
var cc = [{
  [ch]: x,
  [ci]: [aT, false]
}];
var cd = [{
  [ch]: x,
  [ci]: [{
    [cj]: "Region"
  }, true]
}];
var _data = {
  version: "1.0",
  parameters: {
    Bucket: S,
    Region: S,
    UseFIPS: T,
    UseDualStack: T,
    Endpoint: S,
    ForcePathStyle: T,
    Accelerate: T,
    UseGlobalEndpoint: T,
    UseObjectLambdaEndpoint: U,
    Key: S,
    Prefix: S,
    CopySource: S,
    DisableAccessPoints: U,
    DisableMultiRegionAccessPoints: T,
    UseArnRegion: U,
    UseS3ExpressControlEndpoint: U,
    DisableS3ExpressSessionAuth: U
  },
  rules: [{
    [cg]: [{
      [ch]: c,
      [ci]: bw
    }],
    rules: [{
      [cg]: [V, W],
      error: "Accelerate cannot be used with FIPS",
      [cf]: e
    }, {
      [cg]: [X, Y],
      error: "Cannot set dual-stack in combination with a custom endpoint.",
      [cf]: e
    }, {
      [cg]: [Y, W],
      error: "A custom endpoint cannot be combined with FIPS",
      [cf]: e
    }, {
      [cg]: [Y, V],
      error: "A custom endpoint cannot be combined with S3 Accelerate",
      [cf]: e
    }, {
      [cg]: [W, Z, aa],
      error: "Partition does not support FIPS",
      [cf]: e
    }, {
      [cg]: [ab, {
        [ch]: j,
        [ci]: [ac, 0, 6, b],
        [ck]: k
      }, {
        [ch]: g,
        [ci]: [{
          [cj]: k
        }, "--x-s3"]
      }],
      rules: [{
        [cg]: bz,
        error: "S3Express does not support Dual-stack.",
        [cf]: e
      }, {
        [cg]: bA,
        error: "S3Express does not support S3 Accelerate.",
        [cf]: e
      }, {
        [cg]: bB,
        rules: [{
          [cg]: bC,
          rules: [{
            [cg]: bD,
            rules: [{
              [cg]: bE,
              rules: [{
                endpoint: {
                  [cl]: m,
                  [cm]: ah,
                  [cs]: ai
                },
                [cf]: n
              }],
              [cf]: o
            }],
            [cf]: o
          }, {
            [cg]: bF,
            rules: [{
              endpoint: {
                [cl]: q,
                [cm]: ah,
                [cs]: ai
              },
              [cf]: n
            }],
            [cf]: o
          }, ak],
          [cf]: o
        }, {
          [cg]: bD,
          rules: [{
            [cg]: bE,
            rules: [{
              endpoint: {
                [cl]: m,
                [cm]: al,
                [cs]: ai
              },
              [cf]: n
            }],
            [cf]: o
          }],
          [cf]: o
        }, {
          [cg]: bF,
          rules: [{
            endpoint: {
              [cl]: q,
              [cm]: al,
              [cs]: ai
            },
            [cf]: n
          }],
          [cf]: o
        }, ak],
        [cf]: o
      }, {
        [cg]: [am, an],
        rules: [{
          [cg]: [ag, ao],
          rules: [{
            [cg]: bG,
            endpoint: {
              [cl]: "https://s3express-control-fips.{Region}.amazonaws.com/{uri_encoded_bucket}",
              [cm]: ah,
              [cs]: ai
            },
            [cf]: n
          }, {
            endpoint: {
              [cl]: "https://s3express-control.{Region}.amazonaws.com/{uri_encoded_bucket}",
              [cm]: ah,
              [cs]: ai
            },
            [cf]: n
          }],
          [cf]: o
        }],
        [cf]: o
      }, {
        [cg]: bF,
        rules: [{
          [cg]: bC,
          rules: [{
            [cg]: bH,
            rules: bI,
            [cf]: o
          }, {
            [cg]: bJ,
            rules: bI,
            [cf]: o
          }, ap],
          [cf]: o
        }, {
          [cg]: bH,
          rules: bK,
          [cf]: o
        }, {
          [cg]: bJ,
          rules: bK,
          [cf]: o
        }, ap],
        [cf]: o
      }, ak],
      [cf]: o
    }, {
      [cg]: [aq, am, an],
      rules: [{
        [cg]: bB,
        endpoint: {
          [cl]: s,
          [cm]: ah,
          [cs]: ai
        },
        [cf]: n
      }, {
        [cg]: bG,
        endpoint: {
          [cl]: "https://s3express-control-fips.{Region}.amazonaws.com",
          [cm]: ah,
          [cs]: ai
        },
        [cf]: n
      }, {
        endpoint: {
          [cl]: "https://s3express-control.{Region}.amazonaws.com",
          [cm]: ah,
          [cs]: ai
        },
        [cf]: n
      }],
      [cf]: o
    }, {
      [cg]: [ab, {
        [ch]: j,
        [ci]: [ac, 49, 50, b],
        [ck]: t
      }, {
        [ch]: j,
        [ci]: [ac, 8, 12, b],
        [ck]: u
      }, {
        [ch]: j,
        [ci]: [ac, 0, 7, b],
        [ck]: v
      }, {
        [ch]: j,
        [ci]: [ac, 32, 49, b],
        [ck]: w
      }, {
        [ch]: f2,
        [ci]: bw,
        [ck]: "regionPartition"
      }, {
        [ch]: g,
        [ci]: [{
          [cj]: v
        }, "--op-s3"]
      }],
      rules: [{
        [cg]: bM,
        rules: [{
          [cg]: [{
            [ch]: g,
            [ci]: [ar, "e"]
          }],
          rules: [{
            [cg]: bN,
            rules: [as, {
              [cg]: bB,
              endpoint: {
                [cl]: "https://{Bucket}.ec2.{url#authority}",
                [cm]: at,
                [cs]: ai
              },
              [cf]: n
            }],
            [cf]: o
          }, {
            endpoint: {
              [cl]: "https://{Bucket}.ec2.s3-outposts.{Region}.{regionPartition#dnsSuffix}",
              [cm]: at,
              [cs]: ai
            },
            [cf]: n
          }],
          [cf]: o
        }, {
          [cg]: [{
            [ch]: g,
            [ci]: [ar, "o"]
          }],
          rules: [{
            [cg]: bN,
            rules: [as, {
              [cg]: bB,
              endpoint: {
                [cl]: "https://{Bucket}.op-{outpostId}.{url#authority}",
                [cm]: at,
                [cs]: ai
              },
              [cf]: n
            }],
            [cf]: o
          }, {
            endpoint: {
              [cl]: "https://{Bucket}.op-{outpostId}.s3-outposts.{Region}.{regionPartition#dnsSuffix}",
              [cm]: at,
              [cs]: ai
            },
            [cf]: n
          }],
          [cf]: o
        }, {
          error: 'Unrecognized hardware type: "Expected hardware type o or e but got {hardwareType}"',
          [cf]: e
        }],
        [cf]: o
      }, {
        error: "Invalid ARN: The outpost Id must only contain a-z, A-Z, 0-9 and `-`.",
        [cf]: e
      }],
      [cf]: o
    }, {
      [cg]: bL,
      rules: [{
        [cg]: [Y, {
          [ch]: r,
          [ci]: [{
            [ch]: c,
            [ci]: [{
              [ch]: l,
              [ci]: bx
            }]
          }]
        }],
        error: "Custom endpoint `{Endpoint}` was not a valid URI",
        [cf]: e
      }, {
        [cg]: [au, aj],
        rules: [{
          [cg]: bP,
          rules: [{
            [cg]: bQ,
            rules: [{
              [cg]: [V, aa],
              error: "S3 Accelerate cannot be used in this region",
              [cf]: e
            }, {
              [cg]: [X, W, aw, ao, ax],
              endpoint: {
                [cl]: "https://{Bucket}.s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}",
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [X, W, aw, ao, az, aA],
              rules: [{
                endpoint: aB,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [X, W, aw, ao, az, aD],
              endpoint: aB,
              [cf]: n
            }, {
              [cg]: [aE, W, aw, ao, ax],
              endpoint: {
                [cl]: "https://{Bucket}.s3-fips.us-east-1.{partitionResult#dnsSuffix}",
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [aE, W, aw, ao, az, aA],
              rules: [{
                endpoint: aF,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [aE, W, aw, ao, az, aD],
              endpoint: aF,
              [cf]: n
            }, {
              [cg]: [X, aG, V, ao, ax],
              endpoint: {
                [cl]: "https://{Bucket}.s3-accelerate.dualstack.us-east-1.{partitionResult#dnsSuffix}",
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [X, aG, V, ao, az, aA],
              rules: [{
                endpoint: aH,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [X, aG, V, ao, az, aD],
              endpoint: aH,
              [cf]: n
            }, {
              [cg]: [X, aG, aw, ao, ax],
              endpoint: {
                [cl]: "https://{Bucket}.s3.dualstack.us-east-1.{partitionResult#dnsSuffix}",
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [X, aG, aw, ao, az, aA],
              rules: [{
                endpoint: aI,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [X, aG, aw, ao, az, aD],
              endpoint: aI,
              [cf]: n
            }, {
              [cg]: [aE, aG, aw, Y, ad, ae, ax],
              endpoint: {
                [cl]: B,
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [aE, aG, aw, Y, ad, aJ, ax],
              endpoint: {
                [cl]: q,
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [aE, aG, aw, Y, ad, ae, az, aA],
              rules: [{
                [cg]: bR,
                endpoint: aK,
                [cf]: n
              }, {
                endpoint: aK,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [aE, aG, aw, Y, ad, aJ, az, aA],
              rules: [{
                [cg]: bR,
                endpoint: aL,
                [cf]: n
              }, aM],
              [cf]: o
            }, {
              [cg]: [aE, aG, aw, Y, ad, ae, az, aD],
              endpoint: aK,
              [cf]: n
            }, {
              [cg]: [aE, aG, aw, Y, ad, aJ, az, aD],
              endpoint: aL,
              [cf]: n
            }, {
              [cg]: [aE, aG, V, ao, ax],
              endpoint: {
                [cl]: C,
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [aE, aG, V, ao, az, aA],
              rules: [{
                [cg]: bR,
                endpoint: aN,
                [cf]: n
              }, {
                endpoint: aN,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [aE, aG, V, ao, az, aD],
              endpoint: aN,
              [cf]: n
            }, {
              [cg]: [aE, aG, aw, ao, ax],
              endpoint: {
                [cl]: D,
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [aE, aG, aw, ao, az, aA],
              rules: [{
                [cg]: bR,
                endpoint: {
                  [cl]: D,
                  [cm]: aC,
                  [cs]: ai
                },
                [cf]: n
              }, {
                endpoint: aO,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [aE, aG, aw, ao, az, aD],
              endpoint: aO,
              [cf]: n
            }],
            [cf]: o
          }, aP],
          [cf]: o
        }],
        [cf]: o
      }, {
        [cg]: [Y, ad, {
          [ch]: g,
          [ci]: [{
            [ch]: h,
            [ci]: [af, "scheme"]
          }, "http"]
        }, {
          [ch]: p,
          [ci]: [ac, b]
        }, au, aG, aE, aw],
        rules: [{
          [cg]: bP,
          rules: [{
            [cg]: bQ,
            rules: [aM],
            [cf]: o
          }, aP],
          [cf]: o
        }],
        [cf]: o
      }, {
        [cg]: [au, {
          [ch]: E,
          [ci]: by,
          [ck]: F
        }],
        rules: [{
          [cg]: [{
            [ch]: h,
            [ci]: [aQ, "resourceId[0]"],
            [ck]: G
          }, {
            [ch]: r,
            [ci]: [{
              [ch]: g,
              [ci]: [aR, H]
            }]
          }],
          rules: [{
            [cg]: [{
              [ch]: g,
              [ci]: [aS, I]
            }],
            rules: [{
              [cg]: bS,
              rules: [{
                [cg]: bT,
                rules: [aU, aV, {
                  [cg]: bV,
                  rules: [aW, {
                    [cg]: bW,
                    rules: [aX, {
                      [cg]: bY,
                      rules: [{
                        [cg]: bP,
                        rules: [{
                          [cg]: bZ,
                          rules: [{
                            [cg]: ca,
                            rules: [{
                              [cg]: [{
                                [ch]: g,
                                [ci]: [aZ, H]
                              }],
                              error: "Invalid ARN: Missing account id",
                              [cf]: e
                            }, {
                              [cg]: cb,
                              rules: [{
                                [cg]: cc,
                                rules: [{
                                  [cg]: bB,
                                  endpoint: {
                                    [cl]: L,
                                    [cm]: ba,
                                    [cs]: ai
                                  },
                                  [cf]: n
                                }, {
                                  [cg]: bG,
                                  endpoint: {
                                    [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-object-lambda-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}",
                                    [cm]: ba,
                                    [cs]: ai
                                  },
                                  [cf]: n
                                }, {
                                  endpoint: {
                                    [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-object-lambda.{bucketArn#region}.{bucketPartition#dnsSuffix}",
                                    [cm]: ba,
                                    [cs]: ai
                                  },
                                  [cf]: n
                                }],
                                [cf]: o
                              }, bb],
                              [cf]: o
                            }, bc],
                            [cf]: o
                          }, bd],
                          [cf]: o
                        }, be],
                        [cf]: o
                      }],
                      [cf]: o
                    }],
                    [cf]: o
                  }, bf],
                  [cf]: o
                }, {
                  error: "Invalid ARN: bucket ARN is missing a region",
                  [cf]: e
                }],
                [cf]: o
              }, bg],
              [cf]: o
            }, {
              error: "Invalid ARN: Object Lambda ARNs only support `accesspoint` arn types, but found: `{arnType}`",
              [cf]: e
            }],
            [cf]: o
          }, {
            [cg]: bS,
            rules: [{
              [cg]: bT,
              rules: [{
                [cg]: bV,
                rules: [{
                  [cg]: bS,
                  rules: [{
                    [cg]: bV,
                    rules: [aW, {
                      [cg]: bW,
                      rules: [aX, {
                        [cg]: bY,
                        rules: [{
                          [cg]: bP,
                          rules: [{
                            [cg]: [{
                              [ch]: g,
                              [ci]: [aY, "{partitionResult#name}"]
                            }],
                            rules: [{
                              [cg]: ca,
                              rules: [{
                                [cg]: [{
                                  [ch]: g,
                                  [ci]: [aS, A]
                                }],
                                rules: [{
                                  [cg]: cb,
                                  rules: [{
                                    [cg]: cc,
                                    rules: [{
                                      [cg]: bA,
                                      error: "Access Points do not support S3 Accelerate",
                                      [cf]: e
                                    }, {
                                      [cg]: [W, X],
                                      endpoint: {
                                        [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint-fips.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}",
                                        [cm]: bh,
                                        [cs]: ai
                                      },
                                      [cf]: n
                                    }, {
                                      [cg]: [W, aE],
                                      endpoint: {
                                        [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}",
                                        [cm]: bh,
                                        [cs]: ai
                                      },
                                      [cf]: n
                                    }, {
                                      [cg]: [aG, X],
                                      endpoint: {
                                        [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}",
                                        [cm]: bh,
                                        [cs]: ai
                                      },
                                      [cf]: n
                                    }, {
                                      [cg]: [aG, aE, Y, ad],
                                      endpoint: {
                                        [cl]: L,
                                        [cm]: bh,
                                        [cs]: ai
                                      },
                                      [cf]: n
                                    }, {
                                      [cg]: [aG, aE],
                                      endpoint: {
                                        [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint.{bucketArn#region}.{bucketPartition#dnsSuffix}",
                                        [cm]: bh,
                                        [cs]: ai
                                      },
                                      [cf]: n
                                    }],
                                    [cf]: o
                                  }, bb],
                                  [cf]: o
                                }, bc],
                                [cf]: o
                              }, {
                                error: "Invalid ARN: The ARN was not for the S3 service, found: {bucketArn#service}",
                                [cf]: e
                              }],
                              [cf]: o
                            }, bd],
                            [cf]: o
                          }, be],
                          [cf]: o
                        }],
                        [cf]: o
                      }],
                      [cf]: o
                    }, bf],
                    [cf]: o
                  }],
                  [cf]: o
                }],
                [cf]: o
              }, {
                [cg]: [{
                  [ch]: x,
                  [ci]: [aT, b]
                }],
                rules: [{
                  [cg]: bz,
                  error: "S3 MRAP does not support dual-stack",
                  [cf]: e
                }, {
                  [cg]: bG,
                  error: "S3 MRAP does not support FIPS",
                  [cf]: e
                }, {
                  [cg]: bA,
                  error: "S3 MRAP does not support S3 Accelerate",
                  [cf]: e
                }, {
                  [cg]: [{
                    [ch]: d,
                    [ci]: [{
                      [cj]: "DisableMultiRegionAccessPoints"
                    }, b]
                  }],
                  error: "Invalid configuration: Multi-Region Access Point ARNs are disabled.",
                  [cf]: e
                }, {
                  [cg]: [{
                    [ch]: f2,
                    [ci]: bw,
                    [ck]: M
                  }],
                  rules: [{
                    [cg]: [{
                      [ch]: g,
                      [ci]: [{
                        [ch]: h,
                        [ci]: [{
                          [cj]: M
                        }, i]
                      }, {
                        [ch]: h,
                        [ci]: [aQ, "partition"]
                      }]
                    }],
                    rules: [{
                      endpoint: {
                        [cl]: "https://{accessPointName}.accesspoint.s3-global.{mrapPartition#dnsSuffix}",
                        [cm]: {
                          [co]: [{
                            [cp]: b,
                            name: y,
                            [cq]: A,
                            [ct]: bO
                          }]
                        },
                        [cs]: ai
                      },
                      [cf]: n
                    }],
                    [cf]: o
                  }, {
                    error: "Client was configured for partition `{mrapPartition#name}` but bucket referred to partition `{bucketArn#partition}`",
                    [cf]: e
                  }],
                  [cf]: o
                }],
                [cf]: o
              }, {
                error: "Invalid Access Point Name",
                [cf]: e
              }],
              [cf]: o
            }, bg],
            [cf]: o
          }, {
            [cg]: [{
              [ch]: g,
              [ci]: [aS, z]
            }],
            rules: [{
              [cg]: bz,
              error: "S3 Outposts does not support Dual-stack",
              [cf]: e
            }, {
              [cg]: bG,
              error: "S3 Outposts does not support FIPS",
              [cf]: e
            }, {
              [cg]: bA,
              error: "S3 Outposts does not support S3 Accelerate",
              [cf]: e
            }, {
              [cg]: [{
                [ch]: c,
                [ci]: [{
                  [ch]: h,
                  [ci]: [aQ, "resourceId[4]"]
                }]
              }],
              error: "Invalid Arn: Outpost Access Point ARN contains sub resources",
              [cf]: e
            }, {
              [cg]: [{
                [ch]: h,
                [ci]: bU,
                [ck]: w
              }],
              rules: [{
                [cg]: bM,
                rules: [aX, {
                  [cg]: bY,
                  rules: [{
                    [cg]: bP,
                    rules: [{
                      [cg]: bZ,
                      rules: [{
                        [cg]: ca,
                        rules: [{
                          [cg]: cb,
                          rules: [{
                            [cg]: [{
                              [ch]: h,
                              [ci]: bX,
                              [ck]: N
                            }],
                            rules: [{
                              [cg]: [{
                                [ch]: h,
                                [ci]: [aQ, "resourceId[3]"],
                                [ck]: K
                              }],
                              rules: [{
                                [cg]: [{
                                  [ch]: g,
                                  [ci]: [{
                                    [cj]: N
                                  }, J]
                                }],
                                rules: [{
                                  [cg]: bB,
                                  endpoint: {
                                    [cl]: "https://{accessPointName}-{bucketArn#accountId}.{outpostId}.{url#authority}",
                                    [cm]: bi,
                                    [cs]: ai
                                  },
                                  [cf]: n
                                }, {
                                  endpoint: {
                                    [cl]: "https://{accessPointName}-{bucketArn#accountId}.{outpostId}.s3-outposts.{bucketArn#region}.{bucketPartition#dnsSuffix}",
                                    [cm]: bi,
                                    [cs]: ai
                                  },
                                  [cf]: n
                                }],
                                [cf]: o
                              }, {
                                error: "Expected an outpost type `accesspoint`, found {outpostType}",
                                [cf]: e
                              }],
                              [cf]: o
                            }, {
                              error: "Invalid ARN: expected an access point name",
                              [cf]: e
                            }],
                            [cf]: o
                          }, {
                            error: "Invalid ARN: Expected a 4-component resource",
                            [cf]: e
                          }],
                          [cf]: o
                        }, bc],
                        [cf]: o
                      }, bd],
                      [cf]: o
                    }, be],
                    [cf]: o
                  }],
                  [cf]: o
                }],
                [cf]: o
              }, {
                error: "Invalid ARN: The outpost Id may only contain a-z, A-Z, 0-9 and `-`. Found: `{outpostId}`",
                [cf]: e
              }],
              [cf]: o
            }, {
              error: "Invalid ARN: The Outpost Id was not set",
              [cf]: e
            }],
            [cf]: o
          }, {
            error: "Invalid ARN: Unrecognized format: {Bucket} (type: {arnType})",
            [cf]: e
          }],
          [cf]: o
        }, {
          error: "Invalid ARN: No ARN type specified",
          [cf]: e
        }],
        [cf]: o
      }, {
        [cg]: [{
          [ch]: j,
          [ci]: [ac, 0, 4, a],
          [ck]: O
        }, {
          [ch]: g,
          [ci]: [{
            [cj]: O
          }, "arn:"]
        }, {
          [ch]: r,
          [ci]: [{
            [ch]: c,
            [ci]: [bj]
          }]
        }],
        error: "Invalid ARN: `{Bucket}` was not a valid ARN",
        [cf]: e
      }, {
        [cg]: [{
          [ch]: d,
          [ci]: [av, b]
        }, bj],
        error: "Path-style addressing cannot be used with ARN buckets",
        [cf]: e
      }, {
        [cg]: bE,
        rules: [{
          [cg]: bP,
          rules: [{
            [cg]: [aw],
            rules: [{
              [cg]: [X, ao, W, ax],
              endpoint: {
                [cl]: "https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}",
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [X, ao, W, az, aA],
              rules: [{
                endpoint: bk,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [X, ao, W, az, aD],
              endpoint: bk,
              [cf]: n
            }, {
              [cg]: [aE, ao, W, ax],
              endpoint: {
                [cl]: "https://s3-fips.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}",
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [aE, ao, W, az, aA],
              rules: [{
                endpoint: bl,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [aE, ao, W, az, aD],
              endpoint: bl,
              [cf]: n
            }, {
              [cg]: [X, ao, aG, ax],
              endpoint: {
                [cl]: "https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}",
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [X, ao, aG, az, aA],
              rules: [{
                endpoint: bm,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [X, ao, aG, az, aD],
              endpoint: bm,
              [cf]: n
            }, {
              [cg]: [aE, Y, ad, aG, ax],
              endpoint: {
                [cl]: P,
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [aE, Y, ad, aG, az, aA],
              rules: [{
                [cg]: bR,
                endpoint: bn,
                [cf]: n
              }, {
                endpoint: bn,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [aE, Y, ad, aG, az, aD],
              endpoint: bn,
              [cf]: n
            }, {
              [cg]: [aE, ao, aG, ax],
              endpoint: {
                [cl]: Q,
                [cm]: ay,
                [cs]: ai
              },
              [cf]: n
            }, {
              [cg]: [aE, ao, aG, az, aA],
              rules: [{
                [cg]: bR,
                endpoint: {
                  [cl]: Q,
                  [cm]: aC,
                  [cs]: ai
                },
                [cf]: n
              }, {
                endpoint: bo,
                [cf]: n
              }],
              [cf]: o
            }, {
              [cg]: [aE, ao, aG, az, aD],
              endpoint: bo,
              [cf]: n
            }],
            [cf]: o
          }, {
            error: "Path-style addressing cannot be used with S3 Accelerate",
            [cf]: e
          }],
          [cf]: o
        }],
        [cf]: o
      }],
      [cf]: o
    }, {
      [cg]: [{
        [ch]: c,
        [ci]: [bp]
      }, {
        [ch]: d,
        [ci]: [bp, b]
      }],
      rules: [{
        [cg]: bP,
        rules: [{
          [cg]: cd,
          rules: [aU, aV, {
            [cg]: bB,
            endpoint: {
              [cl]: s,
              [cm]: bq,
              [cs]: ai
            },
            [cf]: n
          }, {
            [cg]: bG,
            endpoint: {
              [cl]: "https://s3-object-lambda-fips.{Region}.{partitionResult#dnsSuffix}",
              [cm]: bq,
              [cs]: ai
            },
            [cf]: n
          }, {
            endpoint: {
              [cl]: "https://s3-object-lambda.{Region}.{partitionResult#dnsSuffix}",
              [cm]: bq,
              [cs]: ai
            },
            [cf]: n
          }],
          [cf]: o
        }, aP],
        [cf]: o
      }],
      [cf]: o
    }, {
      [cg]: [aq],
      rules: [{
        [cg]: bP,
        rules: [{
          [cg]: cd,
          rules: [{
            [cg]: [W, X, ao, ax],
            endpoint: {
              [cl]: "https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}",
              [cm]: ay,
              [cs]: ai
            },
            [cf]: n
          }, {
            [cg]: [W, X, ao, az, aA],
            rules: [{
              endpoint: br,
              [cf]: n
            }],
            [cf]: o
          }, {
            [cg]: [W, X, ao, az, aD],
            endpoint: br,
            [cf]: n
          }, {
            [cg]: [W, aE, ao, ax],
            endpoint: {
              [cl]: "https://s3-fips.us-east-1.{partitionResult#dnsSuffix}",
              [cm]: ay,
              [cs]: ai
            },
            [cf]: n
          }, {
            [cg]: [W, aE, ao, az, aA],
            rules: [{
              endpoint: bs,
              [cf]: n
            }],
            [cf]: o
          }, {
            [cg]: [W, aE, ao, az, aD],
            endpoint: bs,
            [cf]: n
          }, {
            [cg]: [aG, X, ao, ax],
            endpoint: {
              [cl]: "https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}",
              [cm]: ay,
              [cs]: ai
            },
            [cf]: n
          }, {
            [cg]: [aG, X, ao, az, aA],
            rules: [{
              endpoint: bt,
              [cf]: n
            }],
            [cf]: o
          }, {
            [cg]: [aG, X, ao, az, aD],
            endpoint: bt,
            [cf]: n
          }, {
            [cg]: [aG, aE, Y, ad, ax],
            endpoint: {
              [cl]: s,
              [cm]: ay,
              [cs]: ai
            },
            [cf]: n
          }, {
            [cg]: [aG, aE, Y, ad, az, aA],
            rules: [{
              [cg]: bR,
              endpoint: bu,
              [cf]: n
            }, {
              endpoint: bu,
              [cf]: n
            }],
            [cf]: o
          }, {
            [cg]: [aG, aE, Y, ad, az, aD],
            endpoint: bu,
            [cf]: n
          }, {
            [cg]: [aG, aE, ao, ax],
            endpoint: {
              [cl]: R,
              [cm]: ay,
              [cs]: ai
            },
            [cf]: n
          }, {
            [cg]: [aG, aE, ao, az, aA],
            rules: [{
              [cg]: bR,
              endpoint: {
                [cl]: R,
                [cm]: aC,
                [cs]: ai
              },
              [cf]: n
            }, {
              endpoint: bv,
              [cf]: n
            }],
            [cf]: o
          }, {
            [cg]: [aG, aE, ao, az, aD],
            endpoint: bv,
            [cf]: n
          }],
          [cf]: o
        }, aP],
        [cf]: o
      }],
      [cf]: o
    }],
    [cf]: o
  }, {
    error: "A region must be set when sending requests to S3.",
    [cf]: e
  }]
};
var ruleSet = _data;

// node_modules/@aws-sdk/client-s3/dist-es/endpoint/endpointResolver.js
var defaultEndpointResolver = (endpointParams, context = {}) => {
  return resolveEndpoint(ruleSet, {
    endpointParams,
    logger: context.logger
  });
};
customEndpointFunctions.aws = awsEndpointFunctions;

// node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthSchemeProvider.js
var createEndpointRuleSetHttpAuthSchemeParametersProvider = (defaultHttpAuthSchemeParametersProvider) => (config, context, input) => __async(void 0, null, function* () {
  if (!input) {
    throw new Error(`Could not find \`input\` for \`defaultEndpointRuleSetHttpAuthSchemeParametersProvider\``);
  }
  const defaultParameters = yield defaultHttpAuthSchemeParametersProvider(config, context, input);
  const instructionsFn = getSmithyContext(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
  if (!instructionsFn) {
    throw new Error(`getEndpointParameterInstructions() is not defined on \`${context.commandName}\``);
  }
  const endpointParameters = yield resolveParams(input, {
    getEndpointParameterInstructions: instructionsFn
  }, config);
  return Object.assign(defaultParameters, endpointParameters);
});
var _defaultS3HttpAuthSchemeParametersProvider = (config, context, input) => __async(void 0, null, function* () {
  return {
    operation: getSmithyContext(context).operation,
    region: (yield normalizeProvider(config.region)()) || (() => {
      throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
    })()
  };
});
var defaultS3HttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultS3HttpAuthSchemeParametersProvider);
function createAwsAuthSigv4HttpAuthOption(authParameters) {
  return {
    schemeId: "aws.auth#sigv4",
    signingProperties: {
      name: "s3",
      region: authParameters.region
    },
    propertiesExtractor: (config, context) => ({
      signingProperties: {
        config,
        context
      }
    })
  };
}
function createAwsAuthSigv4aHttpAuthOption(authParameters) {
  return {
    schemeId: "aws.auth#sigv4a",
    signingProperties: {
      name: "s3",
      region: authParameters.region
    },
    propertiesExtractor: (config, context) => ({
      signingProperties: {
        config,
        context
      }
    })
  };
}
var createEndpointRuleSetHttpAuthSchemeProvider = (defaultEndpointResolver2, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
  const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
    const endpoint = defaultEndpointResolver2(authParameters);
    const authSchemes = endpoint.properties?.authSchemes;
    if (!authSchemes) {
      return defaultHttpAuthSchemeResolver(authParameters);
    }
    const options = [];
    for (const scheme of authSchemes) {
      const _a2 = scheme, {
        name: resolvedName,
        properties = {}
      } = _a2, rest = __objRest(_a2, [
        "name",
        "properties"
      ]);
      const name = resolvedName.toLowerCase();
      if (resolvedName !== name) {
        console.warn(`HttpAuthScheme has been normalized with lowercasing: \`${resolvedName}\` to \`${name}\``);
      }
      let schemeId;
      if (name === "sigv4a") {
        schemeId = "aws.auth#sigv4a";
        const sigv4Present = authSchemes.find((s2) => {
          const name2 = s2.name.toLowerCase();
          return name2 !== "sigv4a" && name2.startsWith("sigv4");
        });
        if (!signatureV4CrtContainer.CrtSignerV4 && sigv4Present) {
          continue;
        }
      } else if (name.startsWith("sigv4")) {
        schemeId = "aws.auth#sigv4";
      } else {
        throw new Error(`Unknown HttpAuthScheme found in \`@smithy.rules#endpointRuleSet\`: \`${name}\``);
      }
      const createOption = createHttpAuthOptionFunctions[schemeId];
      if (!createOption) {
        throw new Error(`Could not find HttpAuthOption create function for \`${schemeId}\``);
      }
      const option = createOption(authParameters);
      option.schemeId = schemeId;
      option.signingProperties = __spreadValues(__spreadValues(__spreadValues({}, option.signingProperties || {}), rest), properties);
      options.push(option);
    }
    return options;
  };
  return endpointRuleSetHttpAuthSchemeProvider;
};
var _defaultS3HttpAuthSchemeProvider = (authParameters) => {
  const options = [];
  switch (authParameters.operation) {
    default: {
      options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
      options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
    }
  }
  return options;
};
var defaultS3HttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(defaultEndpointResolver, _defaultS3HttpAuthSchemeProvider, {
  "aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption,
  "aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption
});
var resolveHttpAuthSchemeConfig = (config) => {
  const config_0 = resolveAwsSdkSigV4Config(config);
  const config_1 = resolveAwsSdkSigV4AConfig(config_0);
  return __spreadValues({}, config_1);
};

// node_modules/@aws-sdk/client-s3/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
  return __spreadProps(__spreadValues({}, options), {
    useFipsEndpoint: options.useFipsEndpoint ?? false,
    useDualstackEndpoint: options.useDualstackEndpoint ?? false,
    forcePathStyle: options.forcePathStyle ?? false,
    useAccelerateEndpoint: options.useAccelerateEndpoint ?? false,
    useGlobalEndpoint: options.useGlobalEndpoint ?? false,
    disableMultiregionAccessPoints: options.disableMultiregionAccessPoints ?? false,
    defaultSigningName: "s3"
  });
};
var commonParams = {
  ForcePathStyle: {
    type: "clientContextParams",
    name: "forcePathStyle"
  },
  UseArnRegion: {
    type: "clientContextParams",
    name: "useArnRegion"
  },
  DisableMultiRegionAccessPoints: {
    type: "clientContextParams",
    name: "disableMultiregionAccessPoints"
  },
  Accelerate: {
    type: "clientContextParams",
    name: "useAccelerateEndpoint"
  },
  DisableS3ExpressSessionAuth: {
    type: "clientContextParams",
    name: "disableS3ExpressSessionAuth"
  },
  UseGlobalEndpoint: {
    type: "builtInParams",
    name: "useGlobalEndpoint"
  },
  UseFIPS: {
    type: "builtInParams",
    name: "useFipsEndpoint"
  },
  Endpoint: {
    type: "builtInParams",
    name: "endpoint"
  },
  Region: {
    type: "builtInParams",
    name: "region"
  },
  UseDualStack: {
    type: "builtInParams",
    name: "useDualstackEndpoint"
  }
};

// node_modules/@aws-sdk/client-s3/dist-es/models/S3ServiceException.js
var S3ServiceException = class _S3ServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, _S3ServiceException.prototype);
  }
};

// node_modules/@aws-sdk/client-s3/dist-es/models/models_0.js
var RequestCharged = {
  requester: "requester"
};
var RequestPayer = {
  requester: "requester"
};
var NoSuchUpload = class _NoSuchUpload extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "NoSuchUpload",
      $fault: "client"
    }, opts));
    this.name = "NoSuchUpload";
    this.$fault = "client";
    Object.setPrototypeOf(this, _NoSuchUpload.prototype);
  }
};
var BucketAccelerateStatus = {
  Enabled: "Enabled",
  Suspended: "Suspended"
};
var Type = {
  AmazonCustomerByEmail: "AmazonCustomerByEmail",
  CanonicalUser: "CanonicalUser",
  Group: "Group"
};
var Permission = {
  FULL_CONTROL: "FULL_CONTROL",
  READ: "READ",
  READ_ACP: "READ_ACP",
  WRITE: "WRITE",
  WRITE_ACP: "WRITE_ACP"
};
var OwnerOverride = {
  Destination: "Destination"
};
var ServerSideEncryption = {
  AES256: "AES256",
  aws_kms: "aws:kms",
  aws_kms_dsse: "aws:kms:dsse"
};
var ObjectCannedACL = {
  authenticated_read: "authenticated-read",
  aws_exec_read: "aws-exec-read",
  bucket_owner_full_control: "bucket-owner-full-control",
  bucket_owner_read: "bucket-owner-read",
  private: "private",
  public_read: "public-read",
  public_read_write: "public-read-write"
};
var ChecksumAlgorithm = {
  CRC32: "CRC32",
  CRC32C: "CRC32C",
  SHA1: "SHA1",
  SHA256: "SHA256"
};
var MetadataDirective = {
  COPY: "COPY",
  REPLACE: "REPLACE"
};
var ObjectLockLegalHoldStatus = {
  OFF: "OFF",
  ON: "ON"
};
var ObjectLockMode = {
  COMPLIANCE: "COMPLIANCE",
  GOVERNANCE: "GOVERNANCE"
};
var StorageClass = {
  DEEP_ARCHIVE: "DEEP_ARCHIVE",
  EXPRESS_ONEZONE: "EXPRESS_ONEZONE",
  GLACIER: "GLACIER",
  GLACIER_IR: "GLACIER_IR",
  INTELLIGENT_TIERING: "INTELLIGENT_TIERING",
  ONEZONE_IA: "ONEZONE_IA",
  OUTPOSTS: "OUTPOSTS",
  REDUCED_REDUNDANCY: "REDUCED_REDUNDANCY",
  SNOW: "SNOW",
  STANDARD: "STANDARD",
  STANDARD_IA: "STANDARD_IA"
};
var TaggingDirective = {
  COPY: "COPY",
  REPLACE: "REPLACE"
};
var ObjectNotInActiveTierError = class _ObjectNotInActiveTierError extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "ObjectNotInActiveTierError",
      $fault: "client"
    }, opts));
    this.name = "ObjectNotInActiveTierError";
    this.$fault = "client";
    Object.setPrototypeOf(this, _ObjectNotInActiveTierError.prototype);
  }
};
var BucketAlreadyExists = class _BucketAlreadyExists extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "BucketAlreadyExists",
      $fault: "client"
    }, opts));
    this.name = "BucketAlreadyExists";
    this.$fault = "client";
    Object.setPrototypeOf(this, _BucketAlreadyExists.prototype);
  }
};
var BucketAlreadyOwnedByYou = class _BucketAlreadyOwnedByYou extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "BucketAlreadyOwnedByYou",
      $fault: "client"
    }, opts));
    this.name = "BucketAlreadyOwnedByYou";
    this.$fault = "client";
    Object.setPrototypeOf(this, _BucketAlreadyOwnedByYou.prototype);
  }
};
var BucketCannedACL = {
  authenticated_read: "authenticated-read",
  private: "private",
  public_read: "public-read",
  public_read_write: "public-read-write"
};
var DataRedundancy = {
  SingleAvailabilityZone: "SingleAvailabilityZone"
};
var BucketType = {
  Directory: "Directory"
};
var LocationType = {
  AvailabilityZone: "AvailabilityZone"
};
var BucketLocationConstraint = {
  EU: "EU",
  af_south_1: "af-south-1",
  ap_east_1: "ap-east-1",
  ap_northeast_1: "ap-northeast-1",
  ap_northeast_2: "ap-northeast-2",
  ap_northeast_3: "ap-northeast-3",
  ap_south_1: "ap-south-1",
  ap_south_2: "ap-south-2",
  ap_southeast_1: "ap-southeast-1",
  ap_southeast_2: "ap-southeast-2",
  ap_southeast_3: "ap-southeast-3",
  ca_central_1: "ca-central-1",
  cn_north_1: "cn-north-1",
  cn_northwest_1: "cn-northwest-1",
  eu_central_1: "eu-central-1",
  eu_north_1: "eu-north-1",
  eu_south_1: "eu-south-1",
  eu_south_2: "eu-south-2",
  eu_west_1: "eu-west-1",
  eu_west_2: "eu-west-2",
  eu_west_3: "eu-west-3",
  me_south_1: "me-south-1",
  sa_east_1: "sa-east-1",
  us_east_2: "us-east-2",
  us_gov_east_1: "us-gov-east-1",
  us_gov_west_1: "us-gov-west-1",
  us_west_1: "us-west-1",
  us_west_2: "us-west-2"
};
var ObjectOwnership = {
  BucketOwnerEnforced: "BucketOwnerEnforced",
  BucketOwnerPreferred: "BucketOwnerPreferred",
  ObjectWriter: "ObjectWriter"
};
var SessionMode = {
  ReadOnly: "ReadOnly",
  ReadWrite: "ReadWrite"
};
var NoSuchBucket = class _NoSuchBucket extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "NoSuchBucket",
      $fault: "client"
    }, opts));
    this.name = "NoSuchBucket";
    this.$fault = "client";
    Object.setPrototypeOf(this, _NoSuchBucket.prototype);
  }
};
var AnalyticsFilter;
(function(AnalyticsFilter2) {
  AnalyticsFilter2.visit = (value, visitor) => {
    if (value.Prefix !== void 0) return visitor.Prefix(value.Prefix);
    if (value.Tag !== void 0) return visitor.Tag(value.Tag);
    if (value.And !== void 0) return visitor.And(value.And);
    return visitor._(value.$unknown[0], value.$unknown[1]);
  };
})(AnalyticsFilter || (AnalyticsFilter = {}));
var AnalyticsS3ExportFileFormat = {
  CSV: "CSV"
};
var StorageClassAnalysisSchemaVersion = {
  V_1: "V_1"
};
var IntelligentTieringStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var IntelligentTieringAccessTier = {
  ARCHIVE_ACCESS: "ARCHIVE_ACCESS",
  DEEP_ARCHIVE_ACCESS: "DEEP_ARCHIVE_ACCESS"
};
var InventoryFormat = {
  CSV: "CSV",
  ORC: "ORC",
  Parquet: "Parquet"
};
var InventoryIncludedObjectVersions = {
  All: "All",
  Current: "Current"
};
var InventoryOptionalField = {
  BucketKeyStatus: "BucketKeyStatus",
  ChecksumAlgorithm: "ChecksumAlgorithm",
  ETag: "ETag",
  EncryptionStatus: "EncryptionStatus",
  IntelligentTieringAccessTier: "IntelligentTieringAccessTier",
  IsMultipartUploaded: "IsMultipartUploaded",
  LastModifiedDate: "LastModifiedDate",
  ObjectAccessControlList: "ObjectAccessControlList",
  ObjectLockLegalHoldStatus: "ObjectLockLegalHoldStatus",
  ObjectLockMode: "ObjectLockMode",
  ObjectLockRetainUntilDate: "ObjectLockRetainUntilDate",
  ObjectOwner: "ObjectOwner",
  ReplicationStatus: "ReplicationStatus",
  Size: "Size",
  StorageClass: "StorageClass"
};
var InventoryFrequency = {
  Daily: "Daily",
  Weekly: "Weekly"
};
var LifecycleRuleFilter;
(function(LifecycleRuleFilter2) {
  LifecycleRuleFilter2.visit = (value, visitor) => {
    if (value.Prefix !== void 0) return visitor.Prefix(value.Prefix);
    if (value.Tag !== void 0) return visitor.Tag(value.Tag);
    if (value.ObjectSizeGreaterThan !== void 0) return visitor.ObjectSizeGreaterThan(value.ObjectSizeGreaterThan);
    if (value.ObjectSizeLessThan !== void 0) return visitor.ObjectSizeLessThan(value.ObjectSizeLessThan);
    if (value.And !== void 0) return visitor.And(value.And);
    return visitor._(value.$unknown[0], value.$unknown[1]);
  };
})(LifecycleRuleFilter || (LifecycleRuleFilter = {}));
var TransitionStorageClass = {
  DEEP_ARCHIVE: "DEEP_ARCHIVE",
  GLACIER: "GLACIER",
  GLACIER_IR: "GLACIER_IR",
  INTELLIGENT_TIERING: "INTELLIGENT_TIERING",
  ONEZONE_IA: "ONEZONE_IA",
  STANDARD_IA: "STANDARD_IA"
};
var ExpirationStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var BucketLogsPermission = {
  FULL_CONTROL: "FULL_CONTROL",
  READ: "READ",
  WRITE: "WRITE"
};
var PartitionDateSource = {
  DeliveryTime: "DeliveryTime",
  EventTime: "EventTime"
};
var MetricsFilter;
(function(MetricsFilter2) {
  MetricsFilter2.visit = (value, visitor) => {
    if (value.Prefix !== void 0) return visitor.Prefix(value.Prefix);
    if (value.Tag !== void 0) return visitor.Tag(value.Tag);
    if (value.AccessPointArn !== void 0) return visitor.AccessPointArn(value.AccessPointArn);
    if (value.And !== void 0) return visitor.And(value.And);
    return visitor._(value.$unknown[0], value.$unknown[1]);
  };
})(MetricsFilter || (MetricsFilter = {}));
var Event = {
  s3_IntelligentTiering: "s3:IntelligentTiering",
  s3_LifecycleExpiration_: "s3:LifecycleExpiration:*",
  s3_LifecycleExpiration_Delete: "s3:LifecycleExpiration:Delete",
  s3_LifecycleExpiration_DeleteMarkerCreated: "s3:LifecycleExpiration:DeleteMarkerCreated",
  s3_LifecycleTransition: "s3:LifecycleTransition",
  s3_ObjectAcl_Put: "s3:ObjectAcl:Put",
  s3_ObjectCreated_: "s3:ObjectCreated:*",
  s3_ObjectCreated_CompleteMultipartUpload: "s3:ObjectCreated:CompleteMultipartUpload",
  s3_ObjectCreated_Copy: "s3:ObjectCreated:Copy",
  s3_ObjectCreated_Post: "s3:ObjectCreated:Post",
  s3_ObjectCreated_Put: "s3:ObjectCreated:Put",
  s3_ObjectRemoved_: "s3:ObjectRemoved:*",
  s3_ObjectRemoved_Delete: "s3:ObjectRemoved:Delete",
  s3_ObjectRemoved_DeleteMarkerCreated: "s3:ObjectRemoved:DeleteMarkerCreated",
  s3_ObjectRestore_: "s3:ObjectRestore:*",
  s3_ObjectRestore_Completed: "s3:ObjectRestore:Completed",
  s3_ObjectRestore_Delete: "s3:ObjectRestore:Delete",
  s3_ObjectRestore_Post: "s3:ObjectRestore:Post",
  s3_ObjectTagging_: "s3:ObjectTagging:*",
  s3_ObjectTagging_Delete: "s3:ObjectTagging:Delete",
  s3_ObjectTagging_Put: "s3:ObjectTagging:Put",
  s3_ReducedRedundancyLostObject: "s3:ReducedRedundancyLostObject",
  s3_Replication_: "s3:Replication:*",
  s3_Replication_OperationFailedReplication: "s3:Replication:OperationFailedReplication",
  s3_Replication_OperationMissedThreshold: "s3:Replication:OperationMissedThreshold",
  s3_Replication_OperationNotTracked: "s3:Replication:OperationNotTracked",
  s3_Replication_OperationReplicatedAfterThreshold: "s3:Replication:OperationReplicatedAfterThreshold"
};
var FilterRuleName = {
  prefix: "prefix",
  suffix: "suffix"
};
var DeleteMarkerReplicationStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var MetricsStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var ReplicationTimeStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var ExistingObjectReplicationStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var ReplicationRuleFilter;
(function(ReplicationRuleFilter2) {
  ReplicationRuleFilter2.visit = (value, visitor) => {
    if (value.Prefix !== void 0) return visitor.Prefix(value.Prefix);
    if (value.Tag !== void 0) return visitor.Tag(value.Tag);
    if (value.And !== void 0) return visitor.And(value.And);
    return visitor._(value.$unknown[0], value.$unknown[1]);
  };
})(ReplicationRuleFilter || (ReplicationRuleFilter = {}));
var ReplicaModificationsStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var SseKmsEncryptedObjectsStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var ReplicationRuleStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var Payer = {
  BucketOwner: "BucketOwner",
  Requester: "Requester"
};
var MFADeleteStatus = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var BucketVersioningStatus = {
  Enabled: "Enabled",
  Suspended: "Suspended"
};
var Protocol = {
  http: "http",
  https: "https"
};
var ReplicationStatus = {
  COMPLETE: "COMPLETE",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  PENDING: "PENDING",
  REPLICA: "REPLICA"
};
var ChecksumMode = {
  ENABLED: "ENABLED"
};
var InvalidObjectState = class _InvalidObjectState extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "InvalidObjectState",
      $fault: "client"
    }, opts));
    this.name = "InvalidObjectState";
    this.$fault = "client";
    Object.setPrototypeOf(this, _InvalidObjectState.prototype);
    this.StorageClass = opts.StorageClass;
    this.AccessTier = opts.AccessTier;
  }
};
var NoSuchKey = class _NoSuchKey extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "NoSuchKey",
      $fault: "client"
    }, opts));
    this.name = "NoSuchKey";
    this.$fault = "client";
    Object.setPrototypeOf(this, _NoSuchKey.prototype);
  }
};
var ObjectAttributes = {
  CHECKSUM: "Checksum",
  ETAG: "ETag",
  OBJECT_PARTS: "ObjectParts",
  OBJECT_SIZE: "ObjectSize",
  STORAGE_CLASS: "StorageClass"
};
var ObjectLockEnabled = {
  Enabled: "Enabled"
};
var ObjectLockRetentionMode = {
  COMPLIANCE: "COMPLIANCE",
  GOVERNANCE: "GOVERNANCE"
};
var NotFound = class _NotFound extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "NotFound",
      $fault: "client"
    }, opts));
    this.name = "NotFound";
    this.$fault = "client";
    Object.setPrototypeOf(this, _NotFound.prototype);
  }
};
var ArchiveStatus = {
  ARCHIVE_ACCESS: "ARCHIVE_ACCESS",
  DEEP_ARCHIVE_ACCESS: "DEEP_ARCHIVE_ACCESS"
};
var EncodingType = {
  url: "url"
};
var ObjectStorageClass = {
  DEEP_ARCHIVE: "DEEP_ARCHIVE",
  EXPRESS_ONEZONE: "EXPRESS_ONEZONE",
  GLACIER: "GLACIER",
  GLACIER_IR: "GLACIER_IR",
  INTELLIGENT_TIERING: "INTELLIGENT_TIERING",
  ONEZONE_IA: "ONEZONE_IA",
  OUTPOSTS: "OUTPOSTS",
  REDUCED_REDUNDANCY: "REDUCED_REDUNDANCY",
  SNOW: "SNOW",
  STANDARD: "STANDARD",
  STANDARD_IA: "STANDARD_IA"
};
var OptionalObjectAttributes = {
  RESTORE_STATUS: "RestoreStatus"
};
var ObjectVersionStorageClass = {
  STANDARD: "STANDARD"
};
var CompleteMultipartUploadOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
});
var CompleteMultipartUploadRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
});
var CopyObjectOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
}), obj.SSEKMSEncryptionContext && {
  SSEKMSEncryptionContext: SENSITIVE_STRING
});
var CopyObjectRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
}), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
}), obj.SSEKMSEncryptionContext && {
  SSEKMSEncryptionContext: SENSITIVE_STRING
}), obj.CopySourceSSECustomerKey && {
  CopySourceSSECustomerKey: SENSITIVE_STRING
});
var CreateMultipartUploadOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
}), obj.SSEKMSEncryptionContext && {
  SSEKMSEncryptionContext: SENSITIVE_STRING
});
var CreateMultipartUploadRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues(__spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
}), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
}), obj.SSEKMSEncryptionContext && {
  SSEKMSEncryptionContext: SENSITIVE_STRING
});
var SessionCredentialsFilterSensitiveLog = (obj) => __spreadValues(__spreadValues(__spreadValues({}, obj), obj.SecretAccessKey && {
  SecretAccessKey: SENSITIVE_STRING
}), obj.SessionToken && {
  SessionToken: SENSITIVE_STRING
});
var CreateSessionOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.Credentials && {
  Credentials: SessionCredentialsFilterSensitiveLog(obj.Credentials)
});
var ServerSideEncryptionByDefaultFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.KMSMasterKeyID && {
  KMSMasterKeyID: SENSITIVE_STRING
});
var ServerSideEncryptionRuleFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.ApplyServerSideEncryptionByDefault && {
  ApplyServerSideEncryptionByDefault: ServerSideEncryptionByDefaultFilterSensitiveLog(obj.ApplyServerSideEncryptionByDefault)
});
var ServerSideEncryptionConfigurationFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.Rules && {
  Rules: obj.Rules.map((item) => ServerSideEncryptionRuleFilterSensitiveLog(item))
});
var GetBucketEncryptionOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.ServerSideEncryptionConfiguration && {
  ServerSideEncryptionConfiguration: ServerSideEncryptionConfigurationFilterSensitiveLog(obj.ServerSideEncryptionConfiguration)
});
var SSEKMSFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.KeyId && {
  KeyId: SENSITIVE_STRING
});
var InventoryEncryptionFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSEKMS && {
  SSEKMS: SSEKMSFilterSensitiveLog(obj.SSEKMS)
});
var InventoryS3BucketDestinationFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.Encryption && {
  Encryption: InventoryEncryptionFilterSensitiveLog(obj.Encryption)
});
var InventoryDestinationFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.S3BucketDestination && {
  S3BucketDestination: InventoryS3BucketDestinationFilterSensitiveLog(obj.S3BucketDestination)
});
var InventoryConfigurationFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.Destination && {
  Destination: InventoryDestinationFilterSensitiveLog(obj.Destination)
});
var GetBucketInventoryConfigurationOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.InventoryConfiguration && {
  InventoryConfiguration: InventoryConfigurationFilterSensitiveLog(obj.InventoryConfiguration)
});
var GetObjectOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
});
var GetObjectRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
});
var GetObjectAttributesRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
});
var GetObjectTorrentOutputFilterSensitiveLog = (obj) => __spreadValues({}, obj);
var HeadObjectOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
});
var HeadObjectRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
});
var ListBucketInventoryConfigurationsOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.InventoryConfigurationList && {
  InventoryConfigurationList: obj.InventoryConfigurationList.map((item) => InventoryConfigurationFilterSensitiveLog(item))
});
var ListPartsRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
});
var PutBucketEncryptionRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.ServerSideEncryptionConfiguration && {
  ServerSideEncryptionConfiguration: ServerSideEncryptionConfigurationFilterSensitiveLog(obj.ServerSideEncryptionConfiguration)
});
var PutBucketInventoryConfigurationRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.InventoryConfiguration && {
  InventoryConfiguration: InventoryConfigurationFilterSensitiveLog(obj.InventoryConfiguration)
});

// node_modules/@aws-sdk/xml-builder/dist-es/escape-attribute.js
function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// node_modules/@aws-sdk/xml-builder/dist-es/escape-element.js
function escapeElement(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#x0D;").replace(/\n/g, "&#x0A;").replace(/\u0085/g, "&#x85;").replace(/\u2028/, "&#x2028;");
}

// node_modules/@aws-sdk/xml-builder/dist-es/XmlText.js
var XmlText = class {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return escapeElement("" + this.value);
  }
};

// node_modules/@aws-sdk/xml-builder/dist-es/XmlNode.js
var XmlNode = class _XmlNode {
  static of(name, childText, withName) {
    const node = new _XmlNode(name);
    if (childText !== void 0) {
      node.addChildNode(new XmlText(childText));
    }
    if (withName !== void 0) {
      node.withName(withName);
    }
    return node;
  }
  constructor(name, children = []) {
    this.name = name;
    this.children = children;
    this.attributes = {};
  }
  withName(name) {
    this.name = name;
    return this;
  }
  addAttribute(name, value) {
    this.attributes[name] = value;
    return this;
  }
  addChildNode(child) {
    this.children.push(child);
    return this;
  }
  removeAttribute(name) {
    delete this.attributes[name];
    return this;
  }
  n(name) {
    this.name = name;
    return this;
  }
  c(child) {
    this.children.push(child);
    return this;
  }
  a(name, value) {
    if (value != null) {
      this.attributes[name] = value;
    }
    return this;
  }
  cc(input, field, withName = field) {
    if (input[field] != null) {
      const node = _XmlNode.of(field, input[field]).withName(withName);
      this.c(node);
    }
  }
  l(input, listName, memberName, valueProvider) {
    if (input[listName] != null) {
      const nodes = valueProvider();
      nodes.map((node) => {
        node.withName(memberName);
        this.c(node);
      });
    }
  }
  lc(input, listName, memberName, valueProvider) {
    if (input[listName] != null) {
      const nodes = valueProvider();
      const containerNode = new _XmlNode(memberName);
      nodes.map((node) => {
        containerNode.c(node);
      });
      this.c(containerNode);
    }
  }
  toString() {
    const hasChildren = Boolean(this.children.length);
    let xmlText = `<${this.name}`;
    const attributes = this.attributes;
    for (const attributeName of Object.keys(attributes)) {
      const attribute = attributes[attributeName];
      if (attribute != null) {
        xmlText += ` ${attributeName}="${escapeAttribute("" + attribute)}"`;
      }
    }
    return xmlText += !hasChildren ? "/>" : `>${this.children.map((c2) => c2.toString()).join("")}</${this.name}>`;
  }
};

// node_modules/@aws-sdk/client-s3/dist-es/models/models_1.js
var MFADelete = {
  Disabled: "Disabled",
  Enabled: "Enabled"
};
var ObjectAlreadyInActiveTierError = class _ObjectAlreadyInActiveTierError extends S3ServiceException {
  constructor(opts) {
    super(__spreadValues({
      name: "ObjectAlreadyInActiveTierError",
      $fault: "client"
    }, opts));
    this.name = "ObjectAlreadyInActiveTierError";
    this.$fault = "client";
    Object.setPrototypeOf(this, _ObjectAlreadyInActiveTierError.prototype);
  }
};
var Tier = {
  Bulk: "Bulk",
  Expedited: "Expedited",
  Standard: "Standard"
};
var ExpressionType = {
  SQL: "SQL"
};
var CompressionType = {
  BZIP2: "BZIP2",
  GZIP: "GZIP",
  NONE: "NONE"
};
var FileHeaderInfo = {
  IGNORE: "IGNORE",
  NONE: "NONE",
  USE: "USE"
};
var JSONType = {
  DOCUMENT: "DOCUMENT",
  LINES: "LINES"
};
var QuoteFields = {
  ALWAYS: "ALWAYS",
  ASNEEDED: "ASNEEDED"
};
var RestoreRequestType = {
  SELECT: "SELECT"
};
var SelectObjectContentEventStream;
(function(SelectObjectContentEventStream2) {
  SelectObjectContentEventStream2.visit = (value, visitor) => {
    if (value.Records !== void 0) return visitor.Records(value.Records);
    if (value.Stats !== void 0) return visitor.Stats(value.Stats);
    if (value.Progress !== void 0) return visitor.Progress(value.Progress);
    if (value.Cont !== void 0) return visitor.Cont(value.Cont);
    if (value.End !== void 0) return visitor.End(value.End);
    return visitor._(value.$unknown[0], value.$unknown[1]);
  };
})(SelectObjectContentEventStream || (SelectObjectContentEventStream = {}));
var PutObjectOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
}), obj.SSEKMSEncryptionContext && {
  SSEKMSEncryptionContext: SENSITIVE_STRING
});
var PutObjectRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues(__spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
}), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
}), obj.SSEKMSEncryptionContext && {
  SSEKMSEncryptionContext: SENSITIVE_STRING
});
var EncryptionFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.KMSKeyId && {
  KMSKeyId: SENSITIVE_STRING
});
var S3LocationFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.Encryption && {
  Encryption: EncryptionFilterSensitiveLog(obj.Encryption)
});
var OutputLocationFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.S3 && {
  S3: S3LocationFilterSensitiveLog(obj.S3)
});
var RestoreRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.OutputLocation && {
  OutputLocation: OutputLocationFilterSensitiveLog(obj.OutputLocation)
});
var RestoreObjectRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.RestoreRequest && {
  RestoreRequest: RestoreRequestFilterSensitiveLog(obj.RestoreRequest)
});
var SelectObjectContentEventStreamFilterSensitiveLog = (obj) => {
  if (obj.Records !== void 0) return {
    Records: obj.Records
  };
  if (obj.Stats !== void 0) return {
    Stats: obj.Stats
  };
  if (obj.Progress !== void 0) return {
    Progress: obj.Progress
  };
  if (obj.Cont !== void 0) return {
    Cont: obj.Cont
  };
  if (obj.End !== void 0) return {
    End: obj.End
  };
  if (obj.$unknown !== void 0) return {
    [obj.$unknown[0]]: "UNKNOWN"
  };
};
var SelectObjectContentOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.Payload && {
  Payload: "STREAMING_CONTENT"
});
var SelectObjectContentRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
});
var UploadPartOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
});
var UploadPartRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
});
var UploadPartCopyOutputFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
});
var UploadPartCopyRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues(__spreadValues({}, obj), obj.SSECustomerKey && {
  SSECustomerKey: SENSITIVE_STRING
}), obj.CopySourceSSECustomerKey && {
  CopySourceSSECustomerKey: SENSITIVE_STRING
});
var WriteGetObjectResponseRequestFilterSensitiveLog = (obj) => __spreadValues(__spreadValues({}, obj), obj.SSEKMSKeyId && {
  SSEKMSKeyId: SENSITIVE_STRING
});

// node_modules/@aws-sdk/client-s3/dist-es/protocols/Aws_restXml.js
var se_AbortMultipartUploadCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_xi]: [, "AbortMultipartUpload"],
    [_uI]: [, expectNonNull(input[_UI], `UploadId`)]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_CompleteMultipartUploadCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xacc]: input[_CCRC],
    [_xacc_]: input[_CCRCC],
    [_xacs]: input[_CSHA],
    [_xacs_]: input[_CSHAh],
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO],
    [_inm]: input[_INM],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_uI]: [, expectNonNull(input[_UI], `UploadId`)]
  });
  let body;
  let contents;
  if (input.MultipartUpload !== void 0) {
    contents = se_CompletedMultipartUpload(input.MultipartUpload, context);
    contents = contents.n("CompleteMultipartUpload");
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("POST").h(headers).q(query).b(body);
  return b2.build();
});
var se_CopyObjectCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, __spreadValues({
    [_xaa]: input[_ACL],
    [_cc]: input[_CC],
    [_xaca]: input[_CA],
    [_cd]: input[_CD],
    [_ce]: input[_CE],
    [_cl]: input[_CL],
    [_ct]: input[_CT],
    [_xacs__]: input[_CS],
    [_xacsim]: input[_CSIM],
    [_xacsims]: [() => isSerializableHeaderValue(input[_CSIMS]), () => dateToUtcString(input[_CSIMS]).toString()],
    [_xacsinm]: input[_CSINM],
    [_xacsius]: [() => isSerializableHeaderValue(input[_CSIUS]), () => dateToUtcString(input[_CSIUS]).toString()],
    [_e]: [() => isSerializableHeaderValue(input[_E]), () => dateToUtcString(input[_E]).toString()],
    [_xagfc]: input[_GFC],
    [_xagr]: input[_GR],
    [_xagra]: input[_GRACP],
    [_xagwa]: input[_GWACP],
    [_xamd]: input[_MD],
    [_xatd]: input[_TD],
    [_xasse]: input[_SSE],
    [_xasc]: input[_SC],
    [_xawrl]: input[_WRL],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xasseakki]: input[_SSEKMSKI],
    [_xassec]: input[_SSEKMSEC],
    [_xassebke]: [() => isSerializableHeaderValue(input[_BKE]), () => input[_BKE].toString()],
    [_xacssseca]: input[_CSSSECA],
    [_xacssseck]: input[_CSSSECK],
    [_xacssseckm]: input[_CSSSECKMD],
    [_xarp]: input[_RP],
    [_xat]: input[_T],
    [_xaolm]: input[_OLM],
    [_xaolrud]: [() => isSerializableHeaderValue(input[_OLRUD]), () => serializeDateTime(input[_OLRUD]).toString()],
    [_xaollh]: input[_OLLHS],
    [_xaebo]: input[_EBO],
    [_xasebo]: input[_ESBO]
  }, input.Metadata !== void 0 && Object.keys(input.Metadata).reduce((acc, suffix) => {
    acc[`x-amz-meta-${suffix.toLowerCase()}`] = input.Metadata[suffix];
    return acc;
  }, {})));
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_xi]: [, "CopyObject"]
  });
  let body;
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_CreateBucketCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xaa]: input[_ACL],
    [_xagfc]: input[_GFC],
    [_xagr]: input[_GR],
    [_xagra]: input[_GRACP],
    [_xagw]: input[_GW],
    [_xagwa]: input[_GWACP],
    [_xabole]: [() => isSerializableHeaderValue(input[_OLEFB]), () => input[_OLEFB].toString()],
    [_xaoo]: input[_OO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  let body;
  let contents;
  if (input.CreateBucketConfiguration !== void 0) {
    contents = se_CreateBucketConfiguration(input.CreateBucketConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).b(body);
  return b2.build();
});
var se_CreateMultipartUploadCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, __spreadValues({
    [_xaa]: input[_ACL],
    [_cc]: input[_CC],
    [_cd]: input[_CD],
    [_ce]: input[_CE],
    [_cl]: input[_CL],
    [_ct]: input[_CT],
    [_e]: [() => isSerializableHeaderValue(input[_E]), () => dateToUtcString(input[_E]).toString()],
    [_xagfc]: input[_GFC],
    [_xagr]: input[_GR],
    [_xagra]: input[_GRACP],
    [_xagwa]: input[_GWACP],
    [_xasse]: input[_SSE],
    [_xasc]: input[_SC],
    [_xawrl]: input[_WRL],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xasseakki]: input[_SSEKMSKI],
    [_xassec]: input[_SSEKMSEC],
    [_xassebke]: [() => isSerializableHeaderValue(input[_BKE]), () => input[_BKE].toString()],
    [_xarp]: input[_RP],
    [_xat]: input[_T],
    [_xaolm]: input[_OLM],
    [_xaolrud]: [() => isSerializableHeaderValue(input[_OLRUD]), () => serializeDateTime(input[_OLRUD]).toString()],
    [_xaollh]: input[_OLLHS],
    [_xaebo]: input[_EBO],
    [_xaca]: input[_CA]
  }, input.Metadata !== void 0 && Object.keys(input.Metadata).reduce((acc, suffix) => {
    acc[`x-amz-meta-${suffix.toLowerCase()}`] = input.Metadata[suffix];
    return acc;
  }, {})));
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_u]: [, ""]
  });
  let body;
  b2.m("POST").h(headers).q(query).b(body);
  return b2.build();
});
var se_CreateSessionCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xacsm]: input[_SM]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_s]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  let body;
  b2.m("DELETE").h(headers).b(body);
  return b2.build();
});
var se_DeleteBucketAnalyticsConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_a]: [, ""],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketCorsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_c]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketEncryptionCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_en]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketIntelligentTieringConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = {};
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_it]: [, ""],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketInventoryConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_in]: [, ""],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketLifecycleCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_l]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketMetricsConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_m]: [, ""],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketOwnershipControlsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_oC]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketPolicyCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_p]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketReplicationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_r]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketTaggingCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_t]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteBucketWebsiteCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_w]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteObjectCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xam]: input[_MFA],
    [_xarp]: input[_RP],
    [_xabgr]: [() => isSerializableHeaderValue(input[_BGR]), () => input[_BGR].toString()],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_xi]: [, "DeleteObject"],
    [_vI]: [, input[_VI]]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteObjectsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xam]: input[_MFA],
    [_xarp]: input[_RP],
    [_xabgr]: [() => isSerializableHeaderValue(input[_BGR]), () => input[_BGR].toString()],
    [_xaebo]: input[_EBO],
    [_xasca]: input[_CA]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_d]: [, ""]
  });
  let body;
  let contents;
  if (input.Delete !== void 0) {
    contents = se_Delete(input.Delete, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("POST").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeleteObjectTaggingCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_t]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_DeletePublicAccessBlockCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_pAB]: [, ""]
  });
  let body;
  b2.m("DELETE").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketAccelerateConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO],
    [_xarp]: input[_RP]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_ac]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketAclCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_acl]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketAnalyticsConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_a]: [, ""],
    [_xi]: [, "GetBucketAnalyticsConfiguration"],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketCorsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_c]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketEncryptionCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_en]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketIntelligentTieringConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = {};
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_it]: [, ""],
    [_xi]: [, "GetBucketIntelligentTieringConfiguration"],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketInventoryConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_in]: [, ""],
    [_xi]: [, "GetBucketInventoryConfiguration"],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketLifecycleConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_l]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketLocationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_lo]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketLoggingCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_log]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketMetricsConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_m]: [, ""],
    [_xi]: [, "GetBucketMetricsConfiguration"],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketNotificationConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_n]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketOwnershipControlsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_oC]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketPolicyCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_p]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketPolicyStatusCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_pS]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketReplicationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_r]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketRequestPaymentCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_rP]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketTaggingCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_t]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketVersioningCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_v]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetBucketWebsiteCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_w]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetObjectCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_im]: input[_IM],
    [_ims]: [() => isSerializableHeaderValue(input[_IMS]), () => dateToUtcString(input[_IMS]).toString()],
    [_inm]: input[_INM],
    [_ius]: [() => isSerializableHeaderValue(input[_IUS]), () => dateToUtcString(input[_IUS]).toString()],
    [_ra]: input[_R],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO],
    [_xacm]: input[_CM]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_xi]: [, "GetObject"],
    [_rcc]: [, input[_RCC]],
    [_rcd]: [, input[_RCD]],
    [_rce]: [, input[_RCE]],
    [_rcl]: [, input[_RCL]],
    [_rct]: [, input[_RCT]],
    [_re]: [() => input.ResponseExpires !== void 0, () => dateToUtcString(input[_RE]).toString()],
    [_vI]: [, input[_VI]],
    [_pN]: [() => input.PartNumber !== void 0, () => input[_PN].toString()]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetObjectAclCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_acl]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetObjectAttributesCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xamp]: [() => isSerializableHeaderValue(input[_MP]), () => input[_MP].toString()],
    [_xapnm]: input[_PNM],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO],
    [_xaoa]: [() => isSerializableHeaderValue(input[_OA]), () => (input[_OA] || []).map((_entry) => _entry).join(", ")]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_at]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetObjectLegalHoldCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_lh]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetObjectLockConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_ol]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetObjectRetentionCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_ret]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetObjectTaggingCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO],
    [_xarp]: input[_RP]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_t]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetObjectTorrentCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_to]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_GetPublicAccessBlockCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_pAB]: [, ""]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_HeadBucketCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  let body;
  b2.m("HEAD").h(headers).b(body);
  return b2.build();
});
var se_HeadObjectCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_im]: input[_IM],
    [_ims]: [() => isSerializableHeaderValue(input[_IMS]), () => dateToUtcString(input[_IMS]).toString()],
    [_inm]: input[_INM],
    [_ius]: [() => isSerializableHeaderValue(input[_IUS]), () => dateToUtcString(input[_IUS]).toString()],
    [_ra]: input[_R],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO],
    [_xacm]: input[_CM]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_rcc]: [, input[_RCC]],
    [_rcd]: [, input[_RCD]],
    [_rce]: [, input[_RCE]],
    [_rcl]: [, input[_RCL]],
    [_rct]: [, input[_RCT]],
    [_re]: [() => input.ResponseExpires !== void 0, () => dateToUtcString(input[_RE]).toString()],
    [_vI]: [, input[_VI]],
    [_pN]: [() => input.PartNumber !== void 0, () => input[_PN].toString()]
  });
  let body;
  b2.m("HEAD").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListBucketAnalyticsConfigurationsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_a]: [, ""],
    [_xi]: [, "ListBucketAnalyticsConfigurations"],
    [_ct_]: [, input[_CTo]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListBucketIntelligentTieringConfigurationsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = {};
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_it]: [, ""],
    [_xi]: [, "ListBucketIntelligentTieringConfigurations"],
    [_ct_]: [, input[_CTo]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListBucketInventoryConfigurationsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_in]: [, ""],
    [_xi]: [, "ListBucketInventoryConfigurations"],
    [_ct_]: [, input[_CTo]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListBucketMetricsConfigurationsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_m]: [, ""],
    [_xi]: [, "ListBucketMetricsConfigurations"],
    [_ct_]: [, input[_CTo]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListBucketsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = {};
  b2.bp("/");
  const query = map({
    [_xi]: [, "ListBuckets"],
    [_mb]: [() => input.MaxBuckets !== void 0, () => input[_MB].toString()],
    [_ct_]: [, input[_CTo]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListDirectoryBucketsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = {};
  b2.bp("/");
  const query = map({
    [_xi]: [, "ListDirectoryBuckets"],
    [_ct_]: [, input[_CTo]],
    [_mdb]: [() => input.MaxDirectoryBuckets !== void 0, () => input[_MDB].toString()]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListMultipartUploadsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO],
    [_xarp]: input[_RP]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_u]: [, ""],
    [_de]: [, input[_D]],
    [_et]: [, input[_ET]],
    [_km]: [, input[_KM]],
    [_mu]: [() => input.MaxUploads !== void 0, () => input[_MU].toString()],
    [_pr]: [, input[_P]],
    [_uim]: [, input[_UIM]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListObjectsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO],
    [_xaooa]: [() => isSerializableHeaderValue(input[_OOA]), () => (input[_OOA] || []).map((_entry) => _entry).join(", ")]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_de]: [, input[_D]],
    [_et]: [, input[_ET]],
    [_ma]: [, input[_M]],
    [_mk]: [() => input.MaxKeys !== void 0, () => input[_MK].toString()],
    [_pr]: [, input[_P]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListObjectsV2Command = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO],
    [_xaooa]: [() => isSerializableHeaderValue(input[_OOA]), () => (input[_OOA] || []).map((_entry) => _entry).join(", ")]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_lt]: [, "2"],
    [_de]: [, input[_D]],
    [_et]: [, input[_ET]],
    [_mk]: [() => input.MaxKeys !== void 0, () => input[_MK].toString()],
    [_pr]: [, input[_P]],
    [_ct_]: [, input[_CTo]],
    [_fo]: [() => input.FetchOwner !== void 0, () => input[_FO].toString()],
    [_sa]: [, input[_SA]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListObjectVersionsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xaebo]: input[_EBO],
    [_xarp]: input[_RP],
    [_xaooa]: [() => isSerializableHeaderValue(input[_OOA]), () => (input[_OOA] || []).map((_entry) => _entry).join(", ")]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_ver]: [, ""],
    [_de]: [, input[_D]],
    [_et]: [, input[_ET]],
    [_km]: [, input[_KM]],
    [_mk]: [() => input.MaxKeys !== void 0, () => input[_MK].toString()],
    [_pr]: [, input[_P]],
    [_vim]: [, input[_VIM]]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_ListPartsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_xi]: [, "ListParts"],
    [_mp]: [() => input.MaxParts !== void 0, () => input[_MP].toString()],
    [_pnm]: [, input[_PNM]],
    [_uI]: [, expectNonNull(input[_UI], `UploadId`)]
  });
  let body;
  b2.m("GET").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketAccelerateConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xaebo]: input[_EBO],
    [_xasca]: input[_CA]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_ac]: [, ""]
  });
  let body;
  let contents;
  if (input.AccelerateConfiguration !== void 0) {
    contents = se_AccelerateConfiguration(input.AccelerateConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketAclCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xaa]: input[_ACL],
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xagfc]: input[_GFC],
    [_xagr]: input[_GR],
    [_xagra]: input[_GRACP],
    [_xagw]: input[_GW],
    [_xagwa]: input[_GWACP],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_acl]: [, ""]
  });
  let body;
  let contents;
  if (input.AccessControlPolicy !== void 0) {
    contents = se_AccessControlPolicy(input.AccessControlPolicy, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketAnalyticsConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_a]: [, ""],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  let contents;
  if (input.AnalyticsConfiguration !== void 0) {
    contents = se_AnalyticsConfiguration(input.AnalyticsConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketCorsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_c]: [, ""]
  });
  let body;
  let contents;
  if (input.CORSConfiguration !== void 0) {
    contents = se_CORSConfiguration(input.CORSConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketEncryptionCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_en]: [, ""]
  });
  let body;
  let contents;
  if (input.ServerSideEncryptionConfiguration !== void 0) {
    contents = se_ServerSideEncryptionConfiguration(input.ServerSideEncryptionConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketIntelligentTieringConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = {
    "content-type": "application/xml"
  };
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_it]: [, ""],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  let contents;
  if (input.IntelligentTieringConfiguration !== void 0) {
    contents = se_IntelligentTieringConfiguration(input.IntelligentTieringConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketInventoryConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_in]: [, ""],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  let contents;
  if (input.InventoryConfiguration !== void 0) {
    contents = se_InventoryConfiguration(input.InventoryConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketLifecycleConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_l]: [, ""]
  });
  let body;
  let contents;
  if (input.LifecycleConfiguration !== void 0) {
    contents = se_BucketLifecycleConfiguration(input.LifecycleConfiguration, context);
    contents = contents.n("LifecycleConfiguration");
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketLoggingCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_log]: [, ""]
  });
  let body;
  let contents;
  if (input.BucketLoggingStatus !== void 0) {
    contents = se_BucketLoggingStatus(input.BucketLoggingStatus, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketMetricsConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_m]: [, ""],
    [_i]: [, expectNonNull(input[_I], `Id`)]
  });
  let body;
  let contents;
  if (input.MetricsConfiguration !== void 0) {
    contents = se_MetricsConfiguration(input.MetricsConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketNotificationConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xaebo]: input[_EBO],
    [_xasdv]: [() => isSerializableHeaderValue(input[_SDV]), () => input[_SDV].toString()]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_n]: [, ""]
  });
  let body;
  let contents;
  if (input.NotificationConfiguration !== void 0) {
    contents = se_NotificationConfiguration(input.NotificationConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketOwnershipControlsCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_oC]: [, ""]
  });
  let body;
  let contents;
  if (input.OwnershipControls !== void 0) {
    contents = se_OwnershipControls(input.OwnershipControls, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketPolicyCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "text/plain",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xacrsba]: [() => isSerializableHeaderValue(input[_CRSBA]), () => input[_CRSBA].toString()],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_p]: [, ""]
  });
  let body;
  let contents;
  if (input.Policy !== void 0) {
    contents = input.Policy;
    body = contents;
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketReplicationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xabolt]: input[_To],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_r]: [, ""]
  });
  let body;
  let contents;
  if (input.ReplicationConfiguration !== void 0) {
    contents = se_ReplicationConfiguration(input.ReplicationConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketRequestPaymentCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_rP]: [, ""]
  });
  let body;
  let contents;
  if (input.RequestPaymentConfiguration !== void 0) {
    contents = se_RequestPaymentConfiguration(input.RequestPaymentConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketTaggingCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_t]: [, ""]
  });
  let body;
  let contents;
  if (input.Tagging !== void 0) {
    contents = se_Tagging(input.Tagging, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketVersioningCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xam]: input[_MFA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_v]: [, ""]
  });
  let body;
  let contents;
  if (input.VersioningConfiguration !== void 0) {
    contents = se_VersioningConfiguration(input.VersioningConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutBucketWebsiteCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_w]: [, ""]
  });
  let body;
  let contents;
  if (input.WebsiteConfiguration !== void 0) {
    contents = se_WebsiteConfiguration(input.WebsiteConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutObjectCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, __spreadValues({
    [_ct]: input[_CT] || "application/octet-stream",
    [_xaa]: input[_ACL],
    [_cc]: input[_CC],
    [_cd]: input[_CD],
    [_ce]: input[_CE],
    [_cl]: input[_CL],
    [_cl_]: [() => isSerializableHeaderValue(input[_CLo]), () => input[_CLo].toString()],
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xacc]: input[_CCRC],
    [_xacc_]: input[_CCRCC],
    [_xacs]: input[_CSHA],
    [_xacs_]: input[_CSHAh],
    [_e]: [() => isSerializableHeaderValue(input[_E]), () => dateToUtcString(input[_E]).toString()],
    [_inm]: input[_INM],
    [_xagfc]: input[_GFC],
    [_xagr]: input[_GR],
    [_xagra]: input[_GRACP],
    [_xagwa]: input[_GWACP],
    [_xasse]: input[_SSE],
    [_xasc]: input[_SC],
    [_xawrl]: input[_WRL],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xasseakki]: input[_SSEKMSKI],
    [_xassec]: input[_SSEKMSEC],
    [_xassebke]: [() => isSerializableHeaderValue(input[_BKE]), () => input[_BKE].toString()],
    [_xarp]: input[_RP],
    [_xat]: input[_T],
    [_xaolm]: input[_OLM],
    [_xaolrud]: [() => isSerializableHeaderValue(input[_OLRUD]), () => serializeDateTime(input[_OLRUD]).toString()],
    [_xaollh]: input[_OLLHS],
    [_xaebo]: input[_EBO]
  }, input.Metadata !== void 0 && Object.keys(input.Metadata).reduce((acc, suffix) => {
    acc[`x-amz-meta-${suffix.toLowerCase()}`] = input.Metadata[suffix];
    return acc;
  }, {})));
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_xi]: [, "PutObject"]
  });
  let body;
  let contents;
  if (input.Body !== void 0) {
    contents = input.Body;
    body = contents;
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutObjectAclCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xaa]: input[_ACL],
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xagfc]: input[_GFC],
    [_xagr]: input[_GR],
    [_xagra]: input[_GRACP],
    [_xagw]: input[_GW],
    [_xagwa]: input[_GWACP],
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_acl]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  let contents;
  if (input.AccessControlPolicy !== void 0) {
    contents = se_AccessControlPolicy(input.AccessControlPolicy, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutObjectLegalHoldCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xarp]: input[_RP],
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_lh]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  let contents;
  if (input.LegalHold !== void 0) {
    contents = se_ObjectLockLegalHold(input.LegalHold, context);
    contents = contents.n("LegalHold");
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutObjectLockConfigurationCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xarp]: input[_RP],
    [_xabolt]: input[_To],
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_ol]: [, ""]
  });
  let body;
  let contents;
  if (input.ObjectLockConfiguration !== void 0) {
    contents = se_ObjectLockConfiguration(input.ObjectLockConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutObjectRetentionCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xarp]: input[_RP],
    [_xabgr]: [() => isSerializableHeaderValue(input[_BGR]), () => input[_BGR].toString()],
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_ret]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  let contents;
  if (input.Retention !== void 0) {
    contents = se_ObjectLockRetention(input.Retention, context);
    contents = contents.n("Retention");
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutObjectTaggingCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO],
    [_xarp]: input[_RP]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_t]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  let contents;
  if (input.Tagging !== void 0) {
    contents = se_Tagging(input.Tagging, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_PutPublicAccessBlockCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  const query = map({
    [_pAB]: [, ""]
  });
  let body;
  let contents;
  if (input.PublicAccessBlockConfiguration !== void 0) {
    contents = se_PublicAccessBlockConfiguration(input.PublicAccessBlockConfiguration, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_RestoreObjectCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xarp]: input[_RP],
    [_xasca]: input[_CA],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_res]: [, ""],
    [_vI]: [, input[_VI]]
  });
  let body;
  let contents;
  if (input.RestoreRequest !== void 0) {
    contents = se_RestoreRequest(input.RestoreRequest, context);
    body = _ve;
    contents.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
    body += contents.toString();
  }
  b2.m("POST").h(headers).q(query).b(body);
  return b2.build();
});
var se_SelectObjectContentCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/xml",
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_se]: [, ""],
    [_st]: [, "2"]
  });
  let body;
  body = _ve;
  const bn2 = new XmlNode(_SOCR);
  bn2.a("xmlns", "http://s3.amazonaws.com/doc/2006-03-01/");
  bn2.cc(input, _Ex);
  bn2.cc(input, _ETx);
  if (input[_IS] != null) {
    bn2.c(se_InputSerialization(input[_IS], context).n(_IS));
  }
  if (input[_OS] != null) {
    bn2.c(se_OutputSerialization(input[_OS], context).n(_OS));
  }
  if (input[_RPe] != null) {
    bn2.c(se_RequestProgress(input[_RPe], context).n(_RPe));
  }
  if (input[_SR] != null) {
    bn2.c(se_ScanRange(input[_SR], context).n(_SR));
  }
  body += bn2.toString();
  b2.m("POST").h(headers).q(query).b(body);
  return b2.build();
});
var se_UploadPartCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    "content-type": "application/octet-stream",
    [_cl_]: [() => isSerializableHeaderValue(input[_CLo]), () => input[_CLo].toString()],
    [_cm]: input[_CMD],
    [_xasca]: input[_CA],
    [_xacc]: input[_CCRC],
    [_xacc_]: input[_CCRCC],
    [_xacs]: input[_CSHA],
    [_xacs_]: input[_CSHAh],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_xi]: [, "UploadPart"],
    [_pN]: [expectNonNull(input.PartNumber, `PartNumber`) != null, () => input[_PN].toString()],
    [_uI]: [, expectNonNull(input[_UI], `UploadId`)]
  });
  let body;
  let contents;
  if (input.Body !== void 0) {
    contents = input.Body;
    body = contents;
  }
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_UploadPartCopyCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, {
    [_xacs__]: input[_CS],
    [_xacsim]: input[_CSIM],
    [_xacsims]: [() => isSerializableHeaderValue(input[_CSIMS]), () => dateToUtcString(input[_CSIMS]).toString()],
    [_xacsinm]: input[_CSINM],
    [_xacsius]: [() => isSerializableHeaderValue(input[_CSIUS]), () => dateToUtcString(input[_CSIUS]).toString()],
    [_xacsr]: input[_CSR],
    [_xasseca]: input[_SSECA],
    [_xasseck]: input[_SSECK],
    [_xasseckm]: input[_SSECKMD],
    [_xacssseca]: input[_CSSSECA],
    [_xacssseck]: input[_CSSSECK],
    [_xacssseckm]: input[_CSSSECKMD],
    [_xarp]: input[_RP],
    [_xaebo]: input[_EBO],
    [_xasebo]: input[_ESBO]
  });
  b2.bp("/{Key+}");
  b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
  b2.p("Key", () => input.Key, "{Key+}", true);
  const query = map({
    [_xi]: [, "UploadPartCopy"],
    [_pN]: [expectNonNull(input.PartNumber, `PartNumber`) != null, () => input[_PN].toString()],
    [_uI]: [, expectNonNull(input[_UI], `UploadId`)]
  });
  let body;
  b2.m("PUT").h(headers).q(query).b(body);
  return b2.build();
});
var se_WriteGetObjectResponseCommand = (input, context) => __async(void 0, null, function* () {
  const b2 = requestBuilder(input, context);
  const headers = map({}, isSerializableHeaderValue, __spreadValues({
    "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
    "content-type": "application/octet-stream",
    [_xarr]: input[_RR],
    [_xart]: input[_RT],
    [_xafs]: [() => isSerializableHeaderValue(input[_SCt]), () => input[_SCt].toString()],
    [_xafec]: input[_EC],
    [_xafem]: input[_EM],
    [_xafhar]: input[_AR],
    [_xafhcc]: input[_CC],
    [_xafhcd]: input[_CD],
    [_xafhce]: input[_CE],
    [_xafhcl]: input[_CL],
    [_cl_]: [() => isSerializableHeaderValue(input[_CLo]), () => input[_CLo].toString()],
    [_xafhcr]: input[_CR],
    [_xafhct]: input[_CT],
    [_xafhxacc]: input[_CCRC],
    [_xafhxacc_]: input[_CCRCC],
    [_xafhxacs]: input[_CSHA],
    [_xafhxacs_]: input[_CSHAh],
    [_xafhxadm]: [() => isSerializableHeaderValue(input[_DM]), () => input[_DM].toString()],
    [_xafhe]: input[_ETa],
    [_xafhe_]: [() => isSerializableHeaderValue(input[_E]), () => dateToUtcString(input[_E]).toString()],
    [_xafhxae]: input[_Exp],
    [_xafhlm]: [() => isSerializableHeaderValue(input[_LM]), () => dateToUtcString(input[_LM]).toString()],
    [_xafhxamm]: [() => isSerializableHeaderValue(input[_MM]), () => input[_MM].toString()],
    [_xafhxaolm]: input[_OLM],
    [_xafhxaollh]: input[_OLLHS],
    [_xafhxaolrud]: [() => isSerializableHeaderValue(input[_OLRUD]), () => serializeDateTime(input[_OLRUD]).toString()],
    [_xafhxampc]: [() => isSerializableHeaderValue(input[_PC]), () => input[_PC].toString()],
    [_xafhxars]: input[_RS],
    [_xafhxarc]: input[_RC],
    [_xafhxar]: input[_Re],
    [_xafhxasse]: input[_SSE],
    [_xafhxasseca]: input[_SSECA],
    [_xafhxasseakki]: input[_SSEKMSKI],
    [_xafhxasseckm]: input[_SSECKMD],
    [_xafhxasc]: input[_SC],
    [_xafhxatc]: [() => isSerializableHeaderValue(input[_TC]), () => input[_TC].toString()],
    [_xafhxavi]: input[_VI],
    [_xafhxassebke]: [() => isSerializableHeaderValue(input[_BKE]), () => input[_BKE].toString()]
  }, input.Metadata !== void 0 && Object.keys(input.Metadata).reduce((acc, suffix) => {
    acc[`x-amz-meta-${suffix.toLowerCase()}`] = input.Metadata[suffix];
    return acc;
  }, {})));
  b2.bp("/WriteGetObjectResponse");
  let body;
  let contents;
  if (input.Body !== void 0) {
    contents = input.Body;
    body = contents;
  }
  let {
    hostname: resolvedHostname
  } = yield context.endpoint();
  if (context.disableHostPrefix !== true) {
    resolvedHostname = "{RequestRoute}." + resolvedHostname;
    if (input.RequestRoute === void 0) {
      throw new Error("Empty value provided for input host prefix: RequestRoute.");
    }
    resolvedHostname = resolvedHostname.replace("{RequestRoute}", input.RequestRoute);
    if (!isValidHostname(resolvedHostname)) {
      throw new Error("ValidationError: prefixed hostname must be hostname compatible.");
    }
  }
  b2.hn(resolvedHostname);
  b2.m("POST").h(headers).b(body);
  return b2.build();
});
var de_AbortMultipartUploadCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_CompleteMultipartUploadCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_Exp]: [, output.headers[_xae]],
    [_SSE]: [, output.headers[_xasse]],
    [_VI]: [, output.headers[_xavi]],
    [_SSEKMSKI]: [, output.headers[_xasseakki]],
    [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_B] != null) {
    contents[_B] = expectString(data[_B]);
  }
  if (data[_CCRC] != null) {
    contents[_CCRC] = expectString(data[_CCRC]);
  }
  if (data[_CCRCC] != null) {
    contents[_CCRCC] = expectString(data[_CCRCC]);
  }
  if (data[_CSHA] != null) {
    contents[_CSHA] = expectString(data[_CSHA]);
  }
  if (data[_CSHAh] != null) {
    contents[_CSHAh] = expectString(data[_CSHAh]);
  }
  if (data[_ETa] != null) {
    contents[_ETa] = expectString(data[_ETa]);
  }
  if (data[_K] != null) {
    contents[_K] = expectString(data[_K]);
  }
  if (data[_L] != null) {
    contents[_L] = expectString(data[_L]);
  }
  return contents;
});
var de_CopyObjectCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_Exp]: [, output.headers[_xae]],
    [_CSVI]: [, output.headers[_xacsvi]],
    [_VI]: [, output.headers[_xavi]],
    [_SSE]: [, output.headers[_xasse]],
    [_SSECA]: [, output.headers[_xasseca]],
    [_SSECKMD]: [, output.headers[_xasseckm]],
    [_SSEKMSKI]: [, output.headers[_xasseakki]],
    [_SSEKMSEC]: [, output.headers[_xassec]],
    [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.CopyObjectResult = de_CopyObjectResult(data, context);
  return contents;
});
var de_CreateBucketCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_L]: [, output.headers[_lo]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_CreateMultipartUploadCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_AD]: [() => void 0 !== output.headers[_xaad], () => expectNonNull(parseRfc7231DateTime(output.headers[_xaad]))],
    [_ARI]: [, output.headers[_xaari]],
    [_SSE]: [, output.headers[_xasse]],
    [_SSECA]: [, output.headers[_xasseca]],
    [_SSECKMD]: [, output.headers[_xasseckm]],
    [_SSEKMSKI]: [, output.headers[_xasseakki]],
    [_SSEKMSEC]: [, output.headers[_xassec]],
    [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
    [_RC]: [, output.headers[_xarc]],
    [_CA]: [, output.headers[_xaca]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_B] != null) {
    contents[_B] = expectString(data[_B]);
  }
  if (data[_K] != null) {
    contents[_K] = expectString(data[_K]);
  }
  if (data[_UI] != null) {
    contents[_UI] = expectString(data[_UI]);
  }
  return contents;
});
var de_CreateSessionCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_C] != null) {
    contents[_C] = de_SessionCredentials(data[_C], context);
  }
  return contents;
});
var de_DeleteBucketCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketAnalyticsConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketCorsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketEncryptionCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketIntelligentTieringConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketInventoryConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketLifecycleCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketMetricsConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketOwnershipControlsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketPolicyCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketReplicationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketTaggingCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteBucketWebsiteCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteObjectCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_DM]: [() => void 0 !== output.headers[_xadm], () => parseBoolean(output.headers[_xadm])],
    [_VI]: [, output.headers[_xavi]],
    [_RC]: [, output.headers[_xarc]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeleteObjectsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.Deleted === "") {
    contents[_De] = [];
  } else if (data[_De] != null) {
    contents[_De] = de_DeletedObjects(getArrayIfSingleItem(data[_De]), context);
  }
  if (data.Error === "") {
    contents[_Err] = [];
  } else if (data[_Er] != null) {
    contents[_Err] = de_Errors(getArrayIfSingleItem(data[_Er]), context);
  }
  return contents;
});
var de_DeleteObjectTaggingCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_VI]: [, output.headers[_xavi]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_DeletePublicAccessBlockCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 204 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_GetBucketAccelerateConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_S] != null) {
    contents[_S] = expectString(data[_S]);
  }
  return contents;
});
var de_GetBucketAclCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.AccessControlList === "") {
    contents[_Gr] = [];
  } else if (data[_ACLc] != null && data[_ACLc][_G] != null) {
    contents[_Gr] = de_Grants(getArrayIfSingleItem(data[_ACLc][_G]), context);
  }
  if (data[_O] != null) {
    contents[_O] = de_Owner(data[_O], context);
  }
  return contents;
});
var de_GetBucketAnalyticsConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.AnalyticsConfiguration = de_AnalyticsConfiguration(data, context);
  return contents;
});
var de_GetBucketCorsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.CORSRule === "") {
    contents[_CORSRu] = [];
  } else if (data[_CORSR] != null) {
    contents[_CORSRu] = de_CORSRules(getArrayIfSingleItem(data[_CORSR]), context);
  }
  return contents;
});
var de_GetBucketEncryptionCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.ServerSideEncryptionConfiguration = de_ServerSideEncryptionConfiguration(data, context);
  return contents;
});
var de_GetBucketIntelligentTieringConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.IntelligentTieringConfiguration = de_IntelligentTieringConfiguration(data, context);
  return contents;
});
var de_GetBucketInventoryConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.InventoryConfiguration = de_InventoryConfiguration(data, context);
  return contents;
});
var de_GetBucketLifecycleConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.Rule === "") {
    contents[_Rul] = [];
  } else if (data[_Ru] != null) {
    contents[_Rul] = de_LifecycleRules(getArrayIfSingleItem(data[_Ru]), context);
  }
  return contents;
});
var de_GetBucketLocationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_LC] != null) {
    contents[_LC] = expectString(data[_LC]);
  }
  return contents;
});
var de_GetBucketLoggingCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_LE] != null) {
    contents[_LE] = de_LoggingEnabled(data[_LE], context);
  }
  return contents;
});
var de_GetBucketMetricsConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.MetricsConfiguration = de_MetricsConfiguration(data, context);
  return contents;
});
var de_GetBucketNotificationConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_EBC] != null) {
    contents[_EBC] = de_EventBridgeConfiguration(data[_EBC], context);
  }
  if (data.CloudFunctionConfiguration === "") {
    contents[_LFC] = [];
  } else if (data[_CFC] != null) {
    contents[_LFC] = de_LambdaFunctionConfigurationList(getArrayIfSingleItem(data[_CFC]), context);
  }
  if (data.QueueConfiguration === "") {
    contents[_QCu] = [];
  } else if (data[_QC] != null) {
    contents[_QCu] = de_QueueConfigurationList(getArrayIfSingleItem(data[_QC]), context);
  }
  if (data.TopicConfiguration === "") {
    contents[_TCop] = [];
  } else if (data[_TCo] != null) {
    contents[_TCop] = de_TopicConfigurationList(getArrayIfSingleItem(data[_TCo]), context);
  }
  return contents;
});
var de_GetBucketOwnershipControlsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.OwnershipControls = de_OwnershipControls(data, context);
  return contents;
});
var de_GetBucketPolicyCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = yield collectBodyString2(output.body, context);
  contents.Policy = expectString(data);
  return contents;
});
var de_GetBucketPolicyStatusCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.PolicyStatus = de_PolicyStatus(data, context);
  return contents;
});
var de_GetBucketReplicationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.ReplicationConfiguration = de_ReplicationConfiguration(data, context);
  return contents;
});
var de_GetBucketRequestPaymentCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_Pa] != null) {
    contents[_Pa] = expectString(data[_Pa]);
  }
  return contents;
});
var de_GetBucketTaggingCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.TagSet === "") {
    contents[_TS] = [];
  } else if (data[_TS] != null && data[_TS][_Ta] != null) {
    contents[_TS] = de_TagSet(getArrayIfSingleItem(data[_TS][_Ta]), context);
  }
  return contents;
});
var de_GetBucketVersioningCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_MDf] != null) {
    contents[_MFAD] = expectString(data[_MDf]);
  }
  if (data[_S] != null) {
    contents[_S] = expectString(data[_S]);
  }
  return contents;
});
var de_GetBucketWebsiteCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_ED] != null) {
    contents[_ED] = de_ErrorDocument(data[_ED], context);
  }
  if (data[_ID] != null) {
    contents[_ID] = de_IndexDocument(data[_ID], context);
  }
  if (data[_RART] != null) {
    contents[_RART] = de_RedirectAllRequestsTo(data[_RART], context);
  }
  if (data.RoutingRules === "") {
    contents[_RRo] = [];
  } else if (data[_RRo] != null && data[_RRo][_RRou] != null) {
    contents[_RRo] = de_RoutingRules(getArrayIfSingleItem(data[_RRo][_RRou]), context);
  }
  return contents;
});
var de_GetObjectCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_DM]: [() => void 0 !== output.headers[_xadm], () => parseBoolean(output.headers[_xadm])],
    [_AR]: [, output.headers[_ar]],
    [_Exp]: [, output.headers[_xae]],
    [_Re]: [, output.headers[_xar]],
    [_LM]: [() => void 0 !== output.headers[_lm], () => expectNonNull(parseRfc7231DateTime(output.headers[_lm]))],
    [_CLo]: [() => void 0 !== output.headers[_cl_], () => strictParseLong(output.headers[_cl_])],
    [_ETa]: [, output.headers[_eta]],
    [_CCRC]: [, output.headers[_xacc]],
    [_CCRCC]: [, output.headers[_xacc_]],
    [_CSHA]: [, output.headers[_xacs]],
    [_CSHAh]: [, output.headers[_xacs_]],
    [_MM]: [() => void 0 !== output.headers[_xamm], () => strictParseInt32(output.headers[_xamm])],
    [_VI]: [, output.headers[_xavi]],
    [_CC]: [, output.headers[_cc]],
    [_CD]: [, output.headers[_cd]],
    [_CE]: [, output.headers[_ce]],
    [_CL]: [, output.headers[_cl]],
    [_CR]: [, output.headers[_cr]],
    [_CT]: [, output.headers[_ct]],
    [_E]: [() => void 0 !== output.headers[_e], () => expectNonNull(parseRfc7231DateTime(output.headers[_e]))],
    [_ES]: [, output.headers[_ex]],
    [_WRL]: [, output.headers[_xawrl]],
    [_SSE]: [, output.headers[_xasse]],
    [_SSECA]: [, output.headers[_xasseca]],
    [_SSECKMD]: [, output.headers[_xasseckm]],
    [_SSEKMSKI]: [, output.headers[_xasseakki]],
    [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
    [_SC]: [, output.headers[_xasc]],
    [_RC]: [, output.headers[_xarc]],
    [_RS]: [, output.headers[_xars]],
    [_PC]: [() => void 0 !== output.headers[_xampc], () => strictParseInt32(output.headers[_xampc])],
    [_TC]: [() => void 0 !== output.headers[_xatc], () => strictParseInt32(output.headers[_xatc])],
    [_OLM]: [, output.headers[_xaolm]],
    [_OLRUD]: [() => void 0 !== output.headers[_xaolrud], () => expectNonNull(parseRfc3339DateTimeWithOffset(output.headers[_xaolrud]))],
    [_OLLHS]: [, output.headers[_xaollh]],
    Metadata: [, Object.keys(output.headers).filter((header) => header.startsWith("x-amz-meta-")).reduce((acc, header) => {
      acc[header.substring(11)] = output.headers[header];
      return acc;
    }, {})]
  });
  const data = output.body;
  context.sdkStreamMixin(data);
  contents.Body = data;
  return contents;
});
var de_GetObjectAclCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.AccessControlList === "") {
    contents[_Gr] = [];
  } else if (data[_ACLc] != null && data[_ACLc][_G] != null) {
    contents[_Gr] = de_Grants(getArrayIfSingleItem(data[_ACLc][_G]), context);
  }
  if (data[_O] != null) {
    contents[_O] = de_Owner(data[_O], context);
  }
  return contents;
});
var de_GetObjectAttributesCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_DM]: [() => void 0 !== output.headers[_xadm], () => parseBoolean(output.headers[_xadm])],
    [_LM]: [() => void 0 !== output.headers[_lm], () => expectNonNull(parseRfc7231DateTime(output.headers[_lm]))],
    [_VI]: [, output.headers[_xavi]],
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_Ch] != null) {
    contents[_Ch] = de_Checksum(data[_Ch], context);
  }
  if (data[_ETa] != null) {
    contents[_ETa] = expectString(data[_ETa]);
  }
  if (data[_OP] != null) {
    contents[_OP] = de_GetObjectAttributesParts(data[_OP], context);
  }
  if (data[_OSb] != null) {
    contents[_OSb] = strictParseLong(data[_OSb]);
  }
  if (data[_SC] != null) {
    contents[_SC] = expectString(data[_SC]);
  }
  return contents;
});
var de_GetObjectLegalHoldCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.LegalHold = de_ObjectLockLegalHold(data, context);
  return contents;
});
var de_GetObjectLockConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.ObjectLockConfiguration = de_ObjectLockConfiguration(data, context);
  return contents;
});
var de_GetObjectRetentionCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.Retention = de_ObjectLockRetention(data, context);
  return contents;
});
var de_GetObjectTaggingCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_VI]: [, output.headers[_xavi]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.TagSet === "") {
    contents[_TS] = [];
  } else if (data[_TS] != null && data[_TS][_Ta] != null) {
    contents[_TS] = de_TagSet(getArrayIfSingleItem(data[_TS][_Ta]), context);
  }
  return contents;
});
var de_GetObjectTorrentCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  const data = output.body;
  context.sdkStreamMixin(data);
  contents.Body = data;
  return contents;
});
var de_GetPublicAccessBlockCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.PublicAccessBlockConfiguration = de_PublicAccessBlockConfiguration(data, context);
  return contents;
});
var de_HeadBucketCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_BLT]: [, output.headers[_xablt]],
    [_BLN]: [, output.headers[_xabln]],
    [_BR]: [, output.headers[_xabr]],
    [_APA]: [() => void 0 !== output.headers[_xaapa], () => parseBoolean(output.headers[_xaapa])]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_HeadObjectCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_DM]: [() => void 0 !== output.headers[_xadm], () => parseBoolean(output.headers[_xadm])],
    [_AR]: [, output.headers[_ar]],
    [_Exp]: [, output.headers[_xae]],
    [_Re]: [, output.headers[_xar]],
    [_AS]: [, output.headers[_xaas]],
    [_LM]: [() => void 0 !== output.headers[_lm], () => expectNonNull(parseRfc7231DateTime(output.headers[_lm]))],
    [_CLo]: [() => void 0 !== output.headers[_cl_], () => strictParseLong(output.headers[_cl_])],
    [_CCRC]: [, output.headers[_xacc]],
    [_CCRCC]: [, output.headers[_xacc_]],
    [_CSHA]: [, output.headers[_xacs]],
    [_CSHAh]: [, output.headers[_xacs_]],
    [_ETa]: [, output.headers[_eta]],
    [_MM]: [() => void 0 !== output.headers[_xamm], () => strictParseInt32(output.headers[_xamm])],
    [_VI]: [, output.headers[_xavi]],
    [_CC]: [, output.headers[_cc]],
    [_CD]: [, output.headers[_cd]],
    [_CE]: [, output.headers[_ce]],
    [_CL]: [, output.headers[_cl]],
    [_CT]: [, output.headers[_ct]],
    [_E]: [() => void 0 !== output.headers[_e], () => expectNonNull(parseRfc7231DateTime(output.headers[_e]))],
    [_ES]: [, output.headers[_ex]],
    [_WRL]: [, output.headers[_xawrl]],
    [_SSE]: [, output.headers[_xasse]],
    [_SSECA]: [, output.headers[_xasseca]],
    [_SSECKMD]: [, output.headers[_xasseckm]],
    [_SSEKMSKI]: [, output.headers[_xasseakki]],
    [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
    [_SC]: [, output.headers[_xasc]],
    [_RC]: [, output.headers[_xarc]],
    [_RS]: [, output.headers[_xars]],
    [_PC]: [() => void 0 !== output.headers[_xampc], () => strictParseInt32(output.headers[_xampc])],
    [_OLM]: [, output.headers[_xaolm]],
    [_OLRUD]: [() => void 0 !== output.headers[_xaolrud], () => expectNonNull(parseRfc3339DateTimeWithOffset(output.headers[_xaolrud]))],
    [_OLLHS]: [, output.headers[_xaollh]],
    Metadata: [, Object.keys(output.headers).filter((header) => header.startsWith("x-amz-meta-")).reduce((acc, header) => {
      acc[header.substring(11)] = output.headers[header];
      return acc;
    }, {})]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_ListBucketAnalyticsConfigurationsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.AnalyticsConfiguration === "") {
    contents[_ACLn] = [];
  } else if (data[_AC] != null) {
    contents[_ACLn] = de_AnalyticsConfigurationList(getArrayIfSingleItem(data[_AC]), context);
  }
  if (data[_CTo] != null) {
    contents[_CTo] = expectString(data[_CTo]);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data[_NCT] != null) {
    contents[_NCT] = expectString(data[_NCT]);
  }
  return contents;
});
var de_ListBucketIntelligentTieringConfigurationsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_CTo] != null) {
    contents[_CTo] = expectString(data[_CTo]);
  }
  if (data.IntelligentTieringConfiguration === "") {
    contents[_ITCL] = [];
  } else if (data[_ITC] != null) {
    contents[_ITCL] = de_IntelligentTieringConfigurationList(getArrayIfSingleItem(data[_ITC]), context);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data[_NCT] != null) {
    contents[_NCT] = expectString(data[_NCT]);
  }
  return contents;
});
var de_ListBucketInventoryConfigurationsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_CTo] != null) {
    contents[_CTo] = expectString(data[_CTo]);
  }
  if (data.InventoryConfiguration === "") {
    contents[_ICL] = [];
  } else if (data[_IC] != null) {
    contents[_ICL] = de_InventoryConfigurationList(getArrayIfSingleItem(data[_IC]), context);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data[_NCT] != null) {
    contents[_NCT] = expectString(data[_NCT]);
  }
  return contents;
});
var de_ListBucketMetricsConfigurationsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_CTo] != null) {
    contents[_CTo] = expectString(data[_CTo]);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data.MetricsConfiguration === "") {
    contents[_MCL] = [];
  } else if (data[_MC] != null) {
    contents[_MCL] = de_MetricsConfigurationList(getArrayIfSingleItem(data[_MC]), context);
  }
  if (data[_NCT] != null) {
    contents[_NCT] = expectString(data[_NCT]);
  }
  return contents;
});
var de_ListBucketsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.Buckets === "") {
    contents[_Bu] = [];
  } else if (data[_Bu] != null && data[_Bu][_B] != null) {
    contents[_Bu] = de_Buckets(getArrayIfSingleItem(data[_Bu][_B]), context);
  }
  if (data[_CTo] != null) {
    contents[_CTo] = expectString(data[_CTo]);
  }
  if (data[_O] != null) {
    contents[_O] = de_Owner(data[_O], context);
  }
  return contents;
});
var de_ListDirectoryBucketsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.Buckets === "") {
    contents[_Bu] = [];
  } else if (data[_Bu] != null && data[_Bu][_B] != null) {
    contents[_Bu] = de_Buckets(getArrayIfSingleItem(data[_Bu][_B]), context);
  }
  if (data[_CTo] != null) {
    contents[_CTo] = expectString(data[_CTo]);
  }
  return contents;
});
var de_ListMultipartUploadsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_B] != null) {
    contents[_B] = expectString(data[_B]);
  }
  if (data.CommonPrefixes === "") {
    contents[_CP] = [];
  } else if (data[_CP] != null) {
    contents[_CP] = de_CommonPrefixList(getArrayIfSingleItem(data[_CP]), context);
  }
  if (data[_D] != null) {
    contents[_D] = expectString(data[_D]);
  }
  if (data[_ET] != null) {
    contents[_ET] = expectString(data[_ET]);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data[_KM] != null) {
    contents[_KM] = expectString(data[_KM]);
  }
  if (data[_MU] != null) {
    contents[_MU] = strictParseInt32(data[_MU]);
  }
  if (data[_NKM] != null) {
    contents[_NKM] = expectString(data[_NKM]);
  }
  if (data[_NUIM] != null) {
    contents[_NUIM] = expectString(data[_NUIM]);
  }
  if (data[_P] != null) {
    contents[_P] = expectString(data[_P]);
  }
  if (data[_UIM] != null) {
    contents[_UIM] = expectString(data[_UIM]);
  }
  if (data.Upload === "") {
    contents[_Up] = [];
  } else if (data[_U] != null) {
    contents[_Up] = de_MultipartUploadList(getArrayIfSingleItem(data[_U]), context);
  }
  return contents;
});
var de_ListObjectsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.CommonPrefixes === "") {
    contents[_CP] = [];
  } else if (data[_CP] != null) {
    contents[_CP] = de_CommonPrefixList(getArrayIfSingleItem(data[_CP]), context);
  }
  if (data.Contents === "") {
    contents[_Co] = [];
  } else if (data[_Co] != null) {
    contents[_Co] = de_ObjectList(getArrayIfSingleItem(data[_Co]), context);
  }
  if (data[_D] != null) {
    contents[_D] = expectString(data[_D]);
  }
  if (data[_ET] != null) {
    contents[_ET] = expectString(data[_ET]);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data[_M] != null) {
    contents[_M] = expectString(data[_M]);
  }
  if (data[_MK] != null) {
    contents[_MK] = strictParseInt32(data[_MK]);
  }
  if (data[_N] != null) {
    contents[_N] = expectString(data[_N]);
  }
  if (data[_NM] != null) {
    contents[_NM] = expectString(data[_NM]);
  }
  if (data[_P] != null) {
    contents[_P] = expectString(data[_P]);
  }
  return contents;
});
var de_ListObjectsV2Command = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.CommonPrefixes === "") {
    contents[_CP] = [];
  } else if (data[_CP] != null) {
    contents[_CP] = de_CommonPrefixList(getArrayIfSingleItem(data[_CP]), context);
  }
  if (data.Contents === "") {
    contents[_Co] = [];
  } else if (data[_Co] != null) {
    contents[_Co] = de_ObjectList(getArrayIfSingleItem(data[_Co]), context);
  }
  if (data[_CTo] != null) {
    contents[_CTo] = expectString(data[_CTo]);
  }
  if (data[_D] != null) {
    contents[_D] = expectString(data[_D]);
  }
  if (data[_ET] != null) {
    contents[_ET] = expectString(data[_ET]);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data[_KC] != null) {
    contents[_KC] = strictParseInt32(data[_KC]);
  }
  if (data[_MK] != null) {
    contents[_MK] = strictParseInt32(data[_MK]);
  }
  if (data[_N] != null) {
    contents[_N] = expectString(data[_N]);
  }
  if (data[_NCT] != null) {
    contents[_NCT] = expectString(data[_NCT]);
  }
  if (data[_P] != null) {
    contents[_P] = expectString(data[_P]);
  }
  if (data[_SA] != null) {
    contents[_SA] = expectString(data[_SA]);
  }
  return contents;
});
var de_ListObjectVersionsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data.CommonPrefixes === "") {
    contents[_CP] = [];
  } else if (data[_CP] != null) {
    contents[_CP] = de_CommonPrefixList(getArrayIfSingleItem(data[_CP]), context);
  }
  if (data.DeleteMarker === "") {
    contents[_DMe] = [];
  } else if (data[_DM] != null) {
    contents[_DMe] = de_DeleteMarkers(getArrayIfSingleItem(data[_DM]), context);
  }
  if (data[_D] != null) {
    contents[_D] = expectString(data[_D]);
  }
  if (data[_ET] != null) {
    contents[_ET] = expectString(data[_ET]);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data[_KM] != null) {
    contents[_KM] = expectString(data[_KM]);
  }
  if (data[_MK] != null) {
    contents[_MK] = strictParseInt32(data[_MK]);
  }
  if (data[_N] != null) {
    contents[_N] = expectString(data[_N]);
  }
  if (data[_NKM] != null) {
    contents[_NKM] = expectString(data[_NKM]);
  }
  if (data[_NVIM] != null) {
    contents[_NVIM] = expectString(data[_NVIM]);
  }
  if (data[_P] != null) {
    contents[_P] = expectString(data[_P]);
  }
  if (data[_VIM] != null) {
    contents[_VIM] = expectString(data[_VIM]);
  }
  if (data.Version === "") {
    contents[_Ve] = [];
  } else if (data[_V] != null) {
    contents[_Ve] = de_ObjectVersionList(getArrayIfSingleItem(data[_V]), context);
  }
  return contents;
});
var de_ListPartsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_AD]: [() => void 0 !== output.headers[_xaad], () => expectNonNull(parseRfc7231DateTime(output.headers[_xaad]))],
    [_ARI]: [, output.headers[_xaari]],
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectNonNull(expectObject(yield parseXmlBody(output.body, context)), "body");
  if (data[_B] != null) {
    contents[_B] = expectString(data[_B]);
  }
  if (data[_CA] != null) {
    contents[_CA] = expectString(data[_CA]);
  }
  if (data[_In] != null) {
    contents[_In] = de_Initiator(data[_In], context);
  }
  if (data[_IT] != null) {
    contents[_IT] = parseBoolean(data[_IT]);
  }
  if (data[_K] != null) {
    contents[_K] = expectString(data[_K]);
  }
  if (data[_MP] != null) {
    contents[_MP] = strictParseInt32(data[_MP]);
  }
  if (data[_NPNM] != null) {
    contents[_NPNM] = expectString(data[_NPNM]);
  }
  if (data[_O] != null) {
    contents[_O] = de_Owner(data[_O], context);
  }
  if (data[_PNM] != null) {
    contents[_PNM] = expectString(data[_PNM]);
  }
  if (data.Part === "") {
    contents[_Part] = [];
  } else if (data[_Par] != null) {
    contents[_Part] = de_Parts(getArrayIfSingleItem(data[_Par]), context);
  }
  if (data[_SC] != null) {
    contents[_SC] = expectString(data[_SC]);
  }
  if (data[_UI] != null) {
    contents[_UI] = expectString(data[_UI]);
  }
  return contents;
});
var de_PutBucketAccelerateConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketAclCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketAnalyticsConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketCorsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketEncryptionCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketIntelligentTieringConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketInventoryConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketLifecycleConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketLoggingCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketMetricsConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketNotificationConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketOwnershipControlsCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketPolicyCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketReplicationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketRequestPaymentCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketTaggingCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketVersioningCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutBucketWebsiteCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutObjectCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_Exp]: [, output.headers[_xae]],
    [_ETa]: [, output.headers[_eta]],
    [_CCRC]: [, output.headers[_xacc]],
    [_CCRCC]: [, output.headers[_xacc_]],
    [_CSHA]: [, output.headers[_xacs]],
    [_CSHAh]: [, output.headers[_xacs_]],
    [_SSE]: [, output.headers[_xasse]],
    [_VI]: [, output.headers[_xavi]],
    [_SSECA]: [, output.headers[_xasseca]],
    [_SSECKMD]: [, output.headers[_xasseckm]],
    [_SSEKMSKI]: [, output.headers[_xasseakki]],
    [_SSEKMSEC]: [, output.headers[_xassec]],
    [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
    [_RC]: [, output.headers[_xarc]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutObjectAclCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutObjectLegalHoldCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutObjectLockConfigurationCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutObjectRetentionCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutObjectTaggingCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_VI]: [, output.headers[_xavi]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_PutPublicAccessBlockCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_RestoreObjectCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_RC]: [, output.headers[_xarc]],
    [_ROP]: [, output.headers[_xarop]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_SelectObjectContentCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  const data = output.body;
  contents.Payload = de_SelectObjectContentEventStream(data, context);
  return contents;
});
var de_UploadPartCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_SSE]: [, output.headers[_xasse]],
    [_ETa]: [, output.headers[_eta]],
    [_CCRC]: [, output.headers[_xacc]],
    [_CCRCC]: [, output.headers[_xacc_]],
    [_CSHA]: [, output.headers[_xacs]],
    [_CSHAh]: [, output.headers[_xacs_]],
    [_SSECA]: [, output.headers[_xasseca]],
    [_SSECKMD]: [, output.headers[_xasseckm]],
    [_SSEKMSKI]: [, output.headers[_xasseakki]],
    [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
    [_RC]: [, output.headers[_xarc]]
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_UploadPartCopyCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output),
    [_CSVI]: [, output.headers[_xacsvi]],
    [_SSE]: [, output.headers[_xasse]],
    [_SSECA]: [, output.headers[_xasseca]],
    [_SSECKMD]: [, output.headers[_xasseckm]],
    [_SSEKMSKI]: [, output.headers[_xasseakki]],
    [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
    [_RC]: [, output.headers[_xarc]]
  });
  const data = expectObject(yield parseXmlBody(output.body, context));
  contents.CopyPartResult = de_CopyPartResult(data, context);
  return contents;
});
var de_WriteGetObjectResponseCommand = (output, context) => __async(void 0, null, function* () {
  if (output.statusCode !== 200 && output.statusCode >= 300) {
    return de_CommandError(output, context);
  }
  const contents = map({
    $metadata: deserializeMetadata2(output)
  });
  yield collectBody(output.body, context);
  return contents;
});
var de_CommandError = (output, context) => __async(void 0, null, function* () {
  const parsedOutput = __spreadProps(__spreadValues({}, output), {
    body: yield parseXmlErrorBody(output.body, context)
  });
  const errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
  switch (errorCode) {
    case "NoSuchUpload":
    case "com.amazonaws.s3#NoSuchUpload":
      throw yield de_NoSuchUploadRes(parsedOutput, context);
    case "ObjectNotInActiveTierError":
    case "com.amazonaws.s3#ObjectNotInActiveTierError":
      throw yield de_ObjectNotInActiveTierErrorRes(parsedOutput, context);
    case "BucketAlreadyExists":
    case "com.amazonaws.s3#BucketAlreadyExists":
      throw yield de_BucketAlreadyExistsRes(parsedOutput, context);
    case "BucketAlreadyOwnedByYou":
    case "com.amazonaws.s3#BucketAlreadyOwnedByYou":
      throw yield de_BucketAlreadyOwnedByYouRes(parsedOutput, context);
    case "NoSuchBucket":
    case "com.amazonaws.s3#NoSuchBucket":
      throw yield de_NoSuchBucketRes(parsedOutput, context);
    case "InvalidObjectState":
    case "com.amazonaws.s3#InvalidObjectState":
      throw yield de_InvalidObjectStateRes(parsedOutput, context);
    case "NoSuchKey":
    case "com.amazonaws.s3#NoSuchKey":
      throw yield de_NoSuchKeyRes(parsedOutput, context);
    case "NotFound":
    case "com.amazonaws.s3#NotFound":
      throw yield de_NotFoundRes(parsedOutput, context);
    case "ObjectAlreadyInActiveTierError":
    case "com.amazonaws.s3#ObjectAlreadyInActiveTierError":
      throw yield de_ObjectAlreadyInActiveTierErrorRes(parsedOutput, context);
    default:
      const parsedBody = parsedOutput.body;
      return throwDefaultError2({
        output,
        parsedBody,
        errorCode
      });
  }
});
var throwDefaultError2 = withBaseException(S3ServiceException);
var de_BucketAlreadyExistsRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  const exception = new BucketAlreadyExists(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_BucketAlreadyOwnedByYouRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  const exception = new BucketAlreadyOwnedByYou(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_InvalidObjectStateRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  if (data[_AT] != null) {
    contents[_AT] = expectString(data[_AT]);
  }
  if (data[_SC] != null) {
    contents[_SC] = expectString(data[_SC]);
  }
  const exception = new InvalidObjectState(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_NoSuchBucketRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  const exception = new NoSuchBucket(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_NoSuchKeyRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  const exception = new NoSuchKey(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_NoSuchUploadRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  const exception = new NoSuchUpload(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_NotFoundRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  const exception = new NotFound(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_ObjectAlreadyInActiveTierErrorRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  const exception = new ObjectAlreadyInActiveTierError(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_ObjectNotInActiveTierErrorRes = (parsedOutput, context) => __async(void 0, null, function* () {
  const contents = map({});
  const data = parsedOutput.body;
  const exception = new ObjectNotInActiveTierError(__spreadValues({
    $metadata: deserializeMetadata2(parsedOutput)
  }, contents));
  return decorateServiceException(exception, parsedOutput.body);
});
var de_SelectObjectContentEventStream = (output, context) => {
  return context.eventStreamMarshaller.deserialize(output, (event) => __async(void 0, null, function* () {
    if (event["Records"] != null) {
      return {
        Records: yield de_RecordsEvent_event(event["Records"], context)
      };
    }
    if (event["Stats"] != null) {
      return {
        Stats: yield de_StatsEvent_event(event["Stats"], context)
      };
    }
    if (event["Progress"] != null) {
      return {
        Progress: yield de_ProgressEvent_event(event["Progress"], context)
      };
    }
    if (event["Cont"] != null) {
      return {
        Cont: yield de_ContinuationEvent_event(event["Cont"], context)
      };
    }
    if (event["End"] != null) {
      return {
        End: yield de_EndEvent_event(event["End"], context)
      };
    }
    return {
      $unknown: output
    };
  }));
};
var de_ContinuationEvent_event = (output, context) => __async(void 0, null, function* () {
  const contents = {};
  const data = yield parseXmlBody(output.body, context);
  Object.assign(contents, de_ContinuationEvent(data, context));
  return contents;
});
var de_EndEvent_event = (output, context) => __async(void 0, null, function* () {
  const contents = {};
  const data = yield parseXmlBody(output.body, context);
  Object.assign(contents, de_EndEvent(data, context));
  return contents;
});
var de_ProgressEvent_event = (output, context) => __async(void 0, null, function* () {
  const contents = {};
  const data = yield parseXmlBody(output.body, context);
  contents.Details = de_Progress(data, context);
  return contents;
});
var de_RecordsEvent_event = (output, context) => __async(void 0, null, function* () {
  const contents = {};
  contents.Payload = output.body;
  return contents;
});
var de_StatsEvent_event = (output, context) => __async(void 0, null, function* () {
  const contents = {};
  const data = yield parseXmlBody(output.body, context);
  contents.Details = de_Stats(data, context);
  return contents;
});
var se_AbortIncompleteMultipartUpload = (input, context) => {
  const bn2 = new XmlNode(_AIMU);
  if (input[_DAI] != null) {
    bn2.c(XmlNode.of(_DAI, String(input[_DAI])).n(_DAI));
  }
  return bn2;
};
var se_AccelerateConfiguration = (input, context) => {
  const bn2 = new XmlNode(_ACc);
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_BAS, input[_S]).n(_S));
  }
  return bn2;
};
var se_AccessControlPolicy = (input, context) => {
  const bn2 = new XmlNode(_ACP);
  bn2.lc(input, "Grants", "AccessControlList", () => se_Grants(input[_Gr], context));
  if (input[_O] != null) {
    bn2.c(se_Owner(input[_O], context).n(_O));
  }
  return bn2;
};
var se_AccessControlTranslation = (input, context) => {
  const bn2 = new XmlNode(_ACT);
  if (input[_O] != null) {
    bn2.c(XmlNode.of(_OOw, input[_O]).n(_O));
  }
  return bn2;
};
var se_AllowedHeaders = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = XmlNode.of(_AH, entry);
    return n2.n(_me);
  });
};
var se_AllowedMethods = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = XmlNode.of(_AM, entry);
    return n2.n(_me);
  });
};
var se_AllowedOrigins = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = XmlNode.of(_AO, entry);
    return n2.n(_me);
  });
};
var se_AnalyticsAndOperator = (input, context) => {
  const bn2 = new XmlNode(_AAO);
  bn2.cc(input, _P);
  bn2.l(input, "Tags", "Tag", () => se_TagSet(input[_Tag], context));
  return bn2;
};
var se_AnalyticsConfiguration = (input, context) => {
  const bn2 = new XmlNode(_AC);
  if (input[_I] != null) {
    bn2.c(XmlNode.of(_AI, input[_I]).n(_I));
  }
  if (input[_F] != null) {
    bn2.c(se_AnalyticsFilter(input[_F], context).n(_F));
  }
  if (input[_SCA] != null) {
    bn2.c(se_StorageClassAnalysis(input[_SCA], context).n(_SCA));
  }
  return bn2;
};
var se_AnalyticsExportDestination = (input, context) => {
  const bn2 = new XmlNode(_AED);
  if (input[_SBD] != null) {
    bn2.c(se_AnalyticsS3BucketDestination(input[_SBD], context).n(_SBD));
  }
  return bn2;
};
var se_AnalyticsFilter = (input, context) => {
  const bn2 = new XmlNode(_AF);
  AnalyticsFilter.visit(input, {
    Prefix: (value) => {
      if (input[_P] != null) {
        bn2.c(XmlNode.of(_P, value).n(_P));
      }
    },
    Tag: (value) => {
      if (input[_Ta] != null) {
        bn2.c(se_Tag(value, context).n(_Ta));
      }
    },
    And: (value) => {
      if (input[_A] != null) {
        bn2.c(se_AnalyticsAndOperator(value, context).n(_A));
      }
    },
    _: (name, value) => {
      if (!(value instanceof XmlNode || value instanceof XmlText)) {
        throw new Error("Unable to serialize unknown union members in XML.");
      }
      bn2.c(new XmlNode(name).c(value));
    }
  });
  return bn2;
};
var se_AnalyticsS3BucketDestination = (input, context) => {
  const bn2 = new XmlNode(_ASBD);
  if (input[_Fo] != null) {
    bn2.c(XmlNode.of(_ASEFF, input[_Fo]).n(_Fo));
  }
  if (input[_BAI] != null) {
    bn2.c(XmlNode.of(_AIc, input[_BAI]).n(_BAI));
  }
  if (input[_B] != null) {
    bn2.c(XmlNode.of(_BN, input[_B]).n(_B));
  }
  bn2.cc(input, _P);
  return bn2;
};
var se_BucketInfo = (input, context) => {
  const bn2 = new XmlNode(_BI);
  bn2.cc(input, _DR);
  if (input[_Ty] != null) {
    bn2.c(XmlNode.of(_BT, input[_Ty]).n(_Ty));
  }
  return bn2;
};
var se_BucketLifecycleConfiguration = (input, context) => {
  const bn2 = new XmlNode(_BLC);
  bn2.l(input, "Rules", "Rule", () => se_LifecycleRules(input[_Rul], context));
  return bn2;
};
var se_BucketLoggingStatus = (input, context) => {
  const bn2 = new XmlNode(_BLS);
  if (input[_LE] != null) {
    bn2.c(se_LoggingEnabled(input[_LE], context).n(_LE));
  }
  return bn2;
};
var se_CompletedMultipartUpload = (input, context) => {
  const bn2 = new XmlNode(_CMU);
  bn2.l(input, "Parts", "Part", () => se_CompletedPartList(input[_Part], context));
  return bn2;
};
var se_CompletedPart = (input, context) => {
  const bn2 = new XmlNode(_CPo);
  bn2.cc(input, _ETa);
  bn2.cc(input, _CCRC);
  bn2.cc(input, _CCRCC);
  bn2.cc(input, _CSHA);
  bn2.cc(input, _CSHAh);
  if (input[_PN] != null) {
    bn2.c(XmlNode.of(_PN, String(input[_PN])).n(_PN));
  }
  return bn2;
};
var se_CompletedPartList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_CompletedPart(entry, context);
    return n2.n(_me);
  });
};
var se_Condition = (input, context) => {
  const bn2 = new XmlNode(_Con);
  bn2.cc(input, _HECRE);
  bn2.cc(input, _KPE);
  return bn2;
};
var se_CORSConfiguration = (input, context) => {
  const bn2 = new XmlNode(_CORSC);
  bn2.l(input, "CORSRules", "CORSRule", () => se_CORSRules(input[_CORSRu], context));
  return bn2;
};
var se_CORSRule = (input, context) => {
  const bn2 = new XmlNode(_CORSR);
  bn2.cc(input, _ID_);
  bn2.l(input, "AllowedHeaders", "AllowedHeader", () => se_AllowedHeaders(input[_AHl], context));
  bn2.l(input, "AllowedMethods", "AllowedMethod", () => se_AllowedMethods(input[_AMl], context));
  bn2.l(input, "AllowedOrigins", "AllowedOrigin", () => se_AllowedOrigins(input[_AOl], context));
  bn2.l(input, "ExposeHeaders", "ExposeHeader", () => se_ExposeHeaders(input[_EH], context));
  if (input[_MAS] != null) {
    bn2.c(XmlNode.of(_MAS, String(input[_MAS])).n(_MAS));
  }
  return bn2;
};
var se_CORSRules = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_CORSRule(entry, context);
    return n2.n(_me);
  });
};
var se_CreateBucketConfiguration = (input, context) => {
  const bn2 = new XmlNode(_CBC);
  if (input[_LC] != null) {
    bn2.c(XmlNode.of(_BLCu, input[_LC]).n(_LC));
  }
  if (input[_L] != null) {
    bn2.c(se_LocationInfo(input[_L], context).n(_L));
  }
  if (input[_B] != null) {
    bn2.c(se_BucketInfo(input[_B], context).n(_B));
  }
  return bn2;
};
var se_CSVInput = (input, context) => {
  const bn2 = new XmlNode(_CSVIn);
  bn2.cc(input, _FHI);
  bn2.cc(input, _Com);
  bn2.cc(input, _QEC);
  bn2.cc(input, _RD);
  bn2.cc(input, _FD);
  bn2.cc(input, _QCuo);
  if (input[_AQRD] != null) {
    bn2.c(XmlNode.of(_AQRD, String(input[_AQRD])).n(_AQRD));
  }
  return bn2;
};
var se_CSVOutput = (input, context) => {
  const bn2 = new XmlNode(_CSVO);
  bn2.cc(input, _QF);
  bn2.cc(input, _QEC);
  bn2.cc(input, _RD);
  bn2.cc(input, _FD);
  bn2.cc(input, _QCuo);
  return bn2;
};
var se_DefaultRetention = (input, context) => {
  const bn2 = new XmlNode(_DRe);
  if (input[_Mo] != null) {
    bn2.c(XmlNode.of(_OLRM, input[_Mo]).n(_Mo));
  }
  if (input[_Da] != null) {
    bn2.c(XmlNode.of(_Da, String(input[_Da])).n(_Da));
  }
  if (input[_Y] != null) {
    bn2.c(XmlNode.of(_Y, String(input[_Y])).n(_Y));
  }
  return bn2;
};
var se_Delete = (input, context) => {
  const bn2 = new XmlNode(_Del);
  bn2.l(input, "Objects", "Object", () => se_ObjectIdentifierList(input[_Ob], context));
  if (input[_Q] != null) {
    bn2.c(XmlNode.of(_Q, String(input[_Q])).n(_Q));
  }
  return bn2;
};
var se_DeleteMarkerReplication = (input, context) => {
  const bn2 = new XmlNode(_DMR);
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_DMRS, input[_S]).n(_S));
  }
  return bn2;
};
var se_Destination = (input, context) => {
  const bn2 = new XmlNode(_Des);
  if (input[_B] != null) {
    bn2.c(XmlNode.of(_BN, input[_B]).n(_B));
  }
  if (input[_Ac] != null) {
    bn2.c(XmlNode.of(_AIc, input[_Ac]).n(_Ac));
  }
  bn2.cc(input, _SC);
  if (input[_ACT] != null) {
    bn2.c(se_AccessControlTranslation(input[_ACT], context).n(_ACT));
  }
  if (input[_ECn] != null) {
    bn2.c(se_EncryptionConfiguration(input[_ECn], context).n(_ECn));
  }
  if (input[_RTe] != null) {
    bn2.c(se_ReplicationTime(input[_RTe], context).n(_RTe));
  }
  if (input[_Me] != null) {
    bn2.c(se_Metrics(input[_Me], context).n(_Me));
  }
  return bn2;
};
var se_Encryption = (input, context) => {
  const bn2 = new XmlNode(_En);
  if (input[_ETn] != null) {
    bn2.c(XmlNode.of(_SSE, input[_ETn]).n(_ETn));
  }
  if (input[_KMSKI] != null) {
    bn2.c(XmlNode.of(_SSEKMSKI, input[_KMSKI]).n(_KMSKI));
  }
  bn2.cc(input, _KMSC);
  return bn2;
};
var se_EncryptionConfiguration = (input, context) => {
  const bn2 = new XmlNode(_ECn);
  bn2.cc(input, _RKKID);
  return bn2;
};
var se_ErrorDocument = (input, context) => {
  const bn2 = new XmlNode(_ED);
  if (input[_K] != null) {
    bn2.c(XmlNode.of(_OK, input[_K]).n(_K));
  }
  return bn2;
};
var se_EventBridgeConfiguration = (input, context) => {
  const bn2 = new XmlNode(_EBC);
  return bn2;
};
var se_EventList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = XmlNode.of(_Ev, entry);
    return n2.n(_me);
  });
};
var se_ExistingObjectReplication = (input, context) => {
  const bn2 = new XmlNode(_EOR);
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_EORS, input[_S]).n(_S));
  }
  return bn2;
};
var se_ExposeHeaders = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = XmlNode.of(_EHx, entry);
    return n2.n(_me);
  });
};
var se_FilterRule = (input, context) => {
  const bn2 = new XmlNode(_FR);
  if (input[_N] != null) {
    bn2.c(XmlNode.of(_FRN, input[_N]).n(_N));
  }
  if (input[_Va] != null) {
    bn2.c(XmlNode.of(_FRV, input[_Va]).n(_Va));
  }
  return bn2;
};
var se_FilterRuleList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_FilterRule(entry, context);
    return n2.n(_me);
  });
};
var se_GlacierJobParameters = (input, context) => {
  const bn2 = new XmlNode(_GJP);
  bn2.cc(input, _Ti);
  return bn2;
};
var se_Grant = (input, context) => {
  const bn2 = new XmlNode(_G);
  if (input[_Gra] != null) {
    const n2 = se_Grantee(input[_Gra], context).n(_Gra);
    n2.a("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    bn2.c(n2);
  }
  bn2.cc(input, _Pe);
  return bn2;
};
var se_Grantee = (input, context) => {
  const bn2 = new XmlNode(_Gra);
  bn2.cc(input, _DN);
  bn2.cc(input, _EA);
  bn2.cc(input, _ID_);
  bn2.cc(input, _URI);
  bn2.a("xsi:type", input[_Ty]);
  return bn2;
};
var se_Grants = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_Grant(entry, context);
    return n2.n(_G);
  });
};
var se_IndexDocument = (input, context) => {
  const bn2 = new XmlNode(_ID);
  bn2.cc(input, _Su);
  return bn2;
};
var se_InputSerialization = (input, context) => {
  const bn2 = new XmlNode(_IS);
  if (input[_CSV] != null) {
    bn2.c(se_CSVInput(input[_CSV], context).n(_CSV));
  }
  bn2.cc(input, _CTom);
  if (input[_JSON] != null) {
    bn2.c(se_JSONInput(input[_JSON], context).n(_JSON));
  }
  if (input[_Parq] != null) {
    bn2.c(se_ParquetInput(input[_Parq], context).n(_Parq));
  }
  return bn2;
};
var se_IntelligentTieringAndOperator = (input, context) => {
  const bn2 = new XmlNode(_ITAO);
  bn2.cc(input, _P);
  bn2.l(input, "Tags", "Tag", () => se_TagSet(input[_Tag], context));
  return bn2;
};
var se_IntelligentTieringConfiguration = (input, context) => {
  const bn2 = new XmlNode(_ITC);
  if (input[_I] != null) {
    bn2.c(XmlNode.of(_ITI, input[_I]).n(_I));
  }
  if (input[_F] != null) {
    bn2.c(se_IntelligentTieringFilter(input[_F], context).n(_F));
  }
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_ITS, input[_S]).n(_S));
  }
  bn2.l(input, "Tierings", "Tiering", () => se_TieringList(input[_Tie], context));
  return bn2;
};
var se_IntelligentTieringFilter = (input, context) => {
  const bn2 = new XmlNode(_ITF);
  bn2.cc(input, _P);
  if (input[_Ta] != null) {
    bn2.c(se_Tag(input[_Ta], context).n(_Ta));
  }
  if (input[_A] != null) {
    bn2.c(se_IntelligentTieringAndOperator(input[_A], context).n(_A));
  }
  return bn2;
};
var se_InventoryConfiguration = (input, context) => {
  const bn2 = new XmlNode(_IC);
  if (input[_Des] != null) {
    bn2.c(se_InventoryDestination(input[_Des], context).n(_Des));
  }
  if (input[_IE] != null) {
    bn2.c(XmlNode.of(_IE, String(input[_IE])).n(_IE));
  }
  if (input[_F] != null) {
    bn2.c(se_InventoryFilter(input[_F], context).n(_F));
  }
  if (input[_I] != null) {
    bn2.c(XmlNode.of(_II, input[_I]).n(_I));
  }
  if (input[_IOV] != null) {
    bn2.c(XmlNode.of(_IIOV, input[_IOV]).n(_IOV));
  }
  bn2.lc(input, "OptionalFields", "OptionalFields", () => se_InventoryOptionalFields(input[_OF], context));
  if (input[_Sc] != null) {
    bn2.c(se_InventorySchedule(input[_Sc], context).n(_Sc));
  }
  return bn2;
};
var se_InventoryDestination = (input, context) => {
  const bn2 = new XmlNode(_IDn);
  if (input[_SBD] != null) {
    bn2.c(se_InventoryS3BucketDestination(input[_SBD], context).n(_SBD));
  }
  return bn2;
};
var se_InventoryEncryption = (input, context) => {
  const bn2 = new XmlNode(_IEn);
  if (input[_SSES] != null) {
    bn2.c(se_SSES3(input[_SSES], context).n(_SS));
  }
  if (input[_SSEKMS] != null) {
    bn2.c(se_SSEKMS(input[_SSEKMS], context).n(_SK));
  }
  return bn2;
};
var se_InventoryFilter = (input, context) => {
  const bn2 = new XmlNode(_IF);
  bn2.cc(input, _P);
  return bn2;
};
var se_InventoryOptionalFields = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = XmlNode.of(_IOF, entry);
    return n2.n(_Fi);
  });
};
var se_InventoryS3BucketDestination = (input, context) => {
  const bn2 = new XmlNode(_ISBD);
  bn2.cc(input, _AIc);
  if (input[_B] != null) {
    bn2.c(XmlNode.of(_BN, input[_B]).n(_B));
  }
  if (input[_Fo] != null) {
    bn2.c(XmlNode.of(_IFn, input[_Fo]).n(_Fo));
  }
  bn2.cc(input, _P);
  if (input[_En] != null) {
    bn2.c(se_InventoryEncryption(input[_En], context).n(_En));
  }
  return bn2;
};
var se_InventorySchedule = (input, context) => {
  const bn2 = new XmlNode(_ISn);
  if (input[_Fr] != null) {
    bn2.c(XmlNode.of(_IFnv, input[_Fr]).n(_Fr));
  }
  return bn2;
};
var se_JSONInput = (input, context) => {
  const bn2 = new XmlNode(_JSONI);
  if (input[_Ty] != null) {
    bn2.c(XmlNode.of(_JSONT, input[_Ty]).n(_Ty));
  }
  return bn2;
};
var se_JSONOutput = (input, context) => {
  const bn2 = new XmlNode(_JSONO);
  bn2.cc(input, _RD);
  return bn2;
};
var se_LambdaFunctionConfiguration = (input, context) => {
  const bn2 = new XmlNode(_LFCa);
  if (input[_I] != null) {
    bn2.c(XmlNode.of(_NI, input[_I]).n(_I));
  }
  if (input[_LFA] != null) {
    bn2.c(XmlNode.of(_LFA, input[_LFA]).n(_CF));
  }
  bn2.l(input, "Events", "Event", () => se_EventList(input[_Eve], context));
  if (input[_F] != null) {
    bn2.c(se_NotificationConfigurationFilter(input[_F], context).n(_F));
  }
  return bn2;
};
var se_LambdaFunctionConfigurationList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_LambdaFunctionConfiguration(entry, context);
    return n2.n(_me);
  });
};
var se_LifecycleExpiration = (input, context) => {
  const bn2 = new XmlNode(_LEi);
  if (input[_Dat] != null) {
    bn2.c(XmlNode.of(_Dat, serializeDateTime(input[_Dat]).toString()).n(_Dat));
  }
  if (input[_Da] != null) {
    bn2.c(XmlNode.of(_Da, String(input[_Da])).n(_Da));
  }
  if (input[_EODM] != null) {
    bn2.c(XmlNode.of(_EODM, String(input[_EODM])).n(_EODM));
  }
  return bn2;
};
var se_LifecycleRule = (input, context) => {
  const bn2 = new XmlNode(_LR);
  if (input[_Exp] != null) {
    bn2.c(se_LifecycleExpiration(input[_Exp], context).n(_Exp));
  }
  bn2.cc(input, _ID_);
  bn2.cc(input, _P);
  if (input[_F] != null) {
    bn2.c(se_LifecycleRuleFilter(input[_F], context).n(_F));
  }
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_ESx, input[_S]).n(_S));
  }
  bn2.l(input, "Transitions", "Transition", () => se_TransitionList(input[_Tr], context));
  bn2.l(input, "NoncurrentVersionTransitions", "NoncurrentVersionTransition", () => se_NoncurrentVersionTransitionList(input[_NVT], context));
  if (input[_NVE] != null) {
    bn2.c(se_NoncurrentVersionExpiration(input[_NVE], context).n(_NVE));
  }
  if (input[_AIMU] != null) {
    bn2.c(se_AbortIncompleteMultipartUpload(input[_AIMU], context).n(_AIMU));
  }
  return bn2;
};
var se_LifecycleRuleAndOperator = (input, context) => {
  const bn2 = new XmlNode(_LRAO);
  bn2.cc(input, _P);
  bn2.l(input, "Tags", "Tag", () => se_TagSet(input[_Tag], context));
  if (input[_OSGT] != null) {
    bn2.c(XmlNode.of(_OSGTB, String(input[_OSGT])).n(_OSGT));
  }
  if (input[_OSLT] != null) {
    bn2.c(XmlNode.of(_OSLTB, String(input[_OSLT])).n(_OSLT));
  }
  return bn2;
};
var se_LifecycleRuleFilter = (input, context) => {
  const bn2 = new XmlNode(_LRF);
  LifecycleRuleFilter.visit(input, {
    Prefix: (value) => {
      if (input[_P] != null) {
        bn2.c(XmlNode.of(_P, value).n(_P));
      }
    },
    Tag: (value) => {
      if (input[_Ta] != null) {
        bn2.c(se_Tag(value, context).n(_Ta));
      }
    },
    ObjectSizeGreaterThan: (value) => {
      if (input[_OSGT] != null) {
        bn2.c(XmlNode.of(_OSGTB, String(value)).n(_OSGT));
      }
    },
    ObjectSizeLessThan: (value) => {
      if (input[_OSLT] != null) {
        bn2.c(XmlNode.of(_OSLTB, String(value)).n(_OSLT));
      }
    },
    And: (value) => {
      if (input[_A] != null) {
        bn2.c(se_LifecycleRuleAndOperator(value, context).n(_A));
      }
    },
    _: (name, value) => {
      if (!(value instanceof XmlNode || value instanceof XmlText)) {
        throw new Error("Unable to serialize unknown union members in XML.");
      }
      bn2.c(new XmlNode(name).c(value));
    }
  });
  return bn2;
};
var se_LifecycleRules = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_LifecycleRule(entry, context);
    return n2.n(_me);
  });
};
var se_LocationInfo = (input, context) => {
  const bn2 = new XmlNode(_LI);
  if (input[_Ty] != null) {
    bn2.c(XmlNode.of(_LT, input[_Ty]).n(_Ty));
  }
  if (input[_N] != null) {
    bn2.c(XmlNode.of(_LNAS, input[_N]).n(_N));
  }
  return bn2;
};
var se_LoggingEnabled = (input, context) => {
  const bn2 = new XmlNode(_LE);
  bn2.cc(input, _TB);
  bn2.lc(input, "TargetGrants", "TargetGrants", () => se_TargetGrants(input[_TG], context));
  bn2.cc(input, _TP);
  if (input[_TOKF] != null) {
    bn2.c(se_TargetObjectKeyFormat(input[_TOKF], context).n(_TOKF));
  }
  return bn2;
};
var se_MetadataEntry = (input, context) => {
  const bn2 = new XmlNode(_ME);
  if (input[_N] != null) {
    bn2.c(XmlNode.of(_MKe, input[_N]).n(_N));
  }
  if (input[_Va] != null) {
    bn2.c(XmlNode.of(_MV, input[_Va]).n(_Va));
  }
  return bn2;
};
var se_Metrics = (input, context) => {
  const bn2 = new XmlNode(_Me);
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_MS, input[_S]).n(_S));
  }
  if (input[_ETv] != null) {
    bn2.c(se_ReplicationTimeValue(input[_ETv], context).n(_ETv));
  }
  return bn2;
};
var se_MetricsAndOperator = (input, context) => {
  const bn2 = new XmlNode(_MAO);
  bn2.cc(input, _P);
  bn2.l(input, "Tags", "Tag", () => se_TagSet(input[_Tag], context));
  bn2.cc(input, _APAc);
  return bn2;
};
var se_MetricsConfiguration = (input, context) => {
  const bn2 = new XmlNode(_MC);
  if (input[_I] != null) {
    bn2.c(XmlNode.of(_MI, input[_I]).n(_I));
  }
  if (input[_F] != null) {
    bn2.c(se_MetricsFilter(input[_F], context).n(_F));
  }
  return bn2;
};
var se_MetricsFilter = (input, context) => {
  const bn2 = new XmlNode(_MF);
  MetricsFilter.visit(input, {
    Prefix: (value) => {
      if (input[_P] != null) {
        bn2.c(XmlNode.of(_P, value).n(_P));
      }
    },
    Tag: (value) => {
      if (input[_Ta] != null) {
        bn2.c(se_Tag(value, context).n(_Ta));
      }
    },
    AccessPointArn: (value) => {
      if (input[_APAc] != null) {
        bn2.c(XmlNode.of(_APAc, value).n(_APAc));
      }
    },
    And: (value) => {
      if (input[_A] != null) {
        bn2.c(se_MetricsAndOperator(value, context).n(_A));
      }
    },
    _: (name, value) => {
      if (!(value instanceof XmlNode || value instanceof XmlText)) {
        throw new Error("Unable to serialize unknown union members in XML.");
      }
      bn2.c(new XmlNode(name).c(value));
    }
  });
  return bn2;
};
var se_NoncurrentVersionExpiration = (input, context) => {
  const bn2 = new XmlNode(_NVE);
  if (input[_ND] != null) {
    bn2.c(XmlNode.of(_Da, String(input[_ND])).n(_ND));
  }
  if (input[_NNV] != null) {
    bn2.c(XmlNode.of(_VC, String(input[_NNV])).n(_NNV));
  }
  return bn2;
};
var se_NoncurrentVersionTransition = (input, context) => {
  const bn2 = new XmlNode(_NVTo);
  if (input[_ND] != null) {
    bn2.c(XmlNode.of(_Da, String(input[_ND])).n(_ND));
  }
  if (input[_SC] != null) {
    bn2.c(XmlNode.of(_TSC, input[_SC]).n(_SC));
  }
  if (input[_NNV] != null) {
    bn2.c(XmlNode.of(_VC, String(input[_NNV])).n(_NNV));
  }
  return bn2;
};
var se_NoncurrentVersionTransitionList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_NoncurrentVersionTransition(entry, context);
    return n2.n(_me);
  });
};
var se_NotificationConfiguration = (input, context) => {
  const bn2 = new XmlNode(_NC);
  bn2.l(input, "TopicConfigurations", "TopicConfiguration", () => se_TopicConfigurationList(input[_TCop], context));
  bn2.l(input, "QueueConfigurations", "QueueConfiguration", () => se_QueueConfigurationList(input[_QCu], context));
  bn2.l(input, "LambdaFunctionConfigurations", "CloudFunctionConfiguration", () => se_LambdaFunctionConfigurationList(input[_LFC], context));
  if (input[_EBC] != null) {
    bn2.c(se_EventBridgeConfiguration(input[_EBC], context).n(_EBC));
  }
  return bn2;
};
var se_NotificationConfigurationFilter = (input, context) => {
  const bn2 = new XmlNode(_NCF);
  if (input[_K] != null) {
    bn2.c(se_S3KeyFilter(input[_K], context).n(_SKe));
  }
  return bn2;
};
var se_ObjectIdentifier = (input, context) => {
  const bn2 = new XmlNode(_OI);
  if (input[_K] != null) {
    bn2.c(XmlNode.of(_OK, input[_K]).n(_K));
  }
  if (input[_VI] != null) {
    bn2.c(XmlNode.of(_OVI, input[_VI]).n(_VI));
  }
  return bn2;
};
var se_ObjectIdentifierList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_ObjectIdentifier(entry, context);
    return n2.n(_me);
  });
};
var se_ObjectLockConfiguration = (input, context) => {
  const bn2 = new XmlNode(_OLC);
  bn2.cc(input, _OLE);
  if (input[_Ru] != null) {
    bn2.c(se_ObjectLockRule(input[_Ru], context).n(_Ru));
  }
  return bn2;
};
var se_ObjectLockLegalHold = (input, context) => {
  const bn2 = new XmlNode(_OLLH);
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_OLLHS, input[_S]).n(_S));
  }
  return bn2;
};
var se_ObjectLockRetention = (input, context) => {
  const bn2 = new XmlNode(_OLR);
  if (input[_Mo] != null) {
    bn2.c(XmlNode.of(_OLRM, input[_Mo]).n(_Mo));
  }
  if (input[_RUD] != null) {
    bn2.c(XmlNode.of(_Dat, serializeDateTime(input[_RUD]).toString()).n(_RUD));
  }
  return bn2;
};
var se_ObjectLockRule = (input, context) => {
  const bn2 = new XmlNode(_OLRb);
  if (input[_DRe] != null) {
    bn2.c(se_DefaultRetention(input[_DRe], context).n(_DRe));
  }
  return bn2;
};
var se_OutputLocation = (input, context) => {
  const bn2 = new XmlNode(_OL);
  if (input[_S_] != null) {
    bn2.c(se_S3Location(input[_S_], context).n(_S_));
  }
  return bn2;
};
var se_OutputSerialization = (input, context) => {
  const bn2 = new XmlNode(_OS);
  if (input[_CSV] != null) {
    bn2.c(se_CSVOutput(input[_CSV], context).n(_CSV));
  }
  if (input[_JSON] != null) {
    bn2.c(se_JSONOutput(input[_JSON], context).n(_JSON));
  }
  return bn2;
};
var se_Owner = (input, context) => {
  const bn2 = new XmlNode(_O);
  bn2.cc(input, _DN);
  bn2.cc(input, _ID_);
  return bn2;
};
var se_OwnershipControls = (input, context) => {
  const bn2 = new XmlNode(_OC);
  bn2.l(input, "Rules", "Rule", () => se_OwnershipControlsRules(input[_Rul], context));
  return bn2;
};
var se_OwnershipControlsRule = (input, context) => {
  const bn2 = new XmlNode(_OCR);
  bn2.cc(input, _OO);
  return bn2;
};
var se_OwnershipControlsRules = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_OwnershipControlsRule(entry, context);
    return n2.n(_me);
  });
};
var se_ParquetInput = (input, context) => {
  const bn2 = new XmlNode(_PI);
  return bn2;
};
var se_PartitionedPrefix = (input, context) => {
  const bn2 = new XmlNode(_PP);
  bn2.cc(input, _PDS);
  return bn2;
};
var se_PublicAccessBlockConfiguration = (input, context) => {
  const bn2 = new XmlNode(_PABC);
  if (input[_BPA] != null) {
    bn2.c(XmlNode.of(_Se, String(input[_BPA])).n(_BPA));
  }
  if (input[_IPA] != null) {
    bn2.c(XmlNode.of(_Se, String(input[_IPA])).n(_IPA));
  }
  if (input[_BPP] != null) {
    bn2.c(XmlNode.of(_Se, String(input[_BPP])).n(_BPP));
  }
  if (input[_RPB] != null) {
    bn2.c(XmlNode.of(_Se, String(input[_RPB])).n(_RPB));
  }
  return bn2;
};
var se_QueueConfiguration = (input, context) => {
  const bn2 = new XmlNode(_QC);
  if (input[_I] != null) {
    bn2.c(XmlNode.of(_NI, input[_I]).n(_I));
  }
  if (input[_QA] != null) {
    bn2.c(XmlNode.of(_QA, input[_QA]).n(_Qu));
  }
  bn2.l(input, "Events", "Event", () => se_EventList(input[_Eve], context));
  if (input[_F] != null) {
    bn2.c(se_NotificationConfigurationFilter(input[_F], context).n(_F));
  }
  return bn2;
};
var se_QueueConfigurationList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_QueueConfiguration(entry, context);
    return n2.n(_me);
  });
};
var se_Redirect = (input, context) => {
  const bn2 = new XmlNode(_Red);
  bn2.cc(input, _HN);
  bn2.cc(input, _HRC);
  bn2.cc(input, _Pr);
  bn2.cc(input, _RKPW);
  bn2.cc(input, _RKW);
  return bn2;
};
var se_RedirectAllRequestsTo = (input, context) => {
  const bn2 = new XmlNode(_RART);
  bn2.cc(input, _HN);
  bn2.cc(input, _Pr);
  return bn2;
};
var se_ReplicaModifications = (input, context) => {
  const bn2 = new XmlNode(_RM);
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_RMS, input[_S]).n(_S));
  }
  return bn2;
};
var se_ReplicationConfiguration = (input, context) => {
  const bn2 = new XmlNode(_RCe);
  bn2.cc(input, _Ro);
  bn2.l(input, "Rules", "Rule", () => se_ReplicationRules(input[_Rul], context));
  return bn2;
};
var se_ReplicationRule = (input, context) => {
  const bn2 = new XmlNode(_RRe);
  bn2.cc(input, _ID_);
  if (input[_Pri] != null) {
    bn2.c(XmlNode.of(_Pri, String(input[_Pri])).n(_Pri));
  }
  bn2.cc(input, _P);
  if (input[_F] != null) {
    bn2.c(se_ReplicationRuleFilter(input[_F], context).n(_F));
  }
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_RRS, input[_S]).n(_S));
  }
  if (input[_SSC] != null) {
    bn2.c(se_SourceSelectionCriteria(input[_SSC], context).n(_SSC));
  }
  if (input[_EOR] != null) {
    bn2.c(se_ExistingObjectReplication(input[_EOR], context).n(_EOR));
  }
  if (input[_Des] != null) {
    bn2.c(se_Destination(input[_Des], context).n(_Des));
  }
  if (input[_DMR] != null) {
    bn2.c(se_DeleteMarkerReplication(input[_DMR], context).n(_DMR));
  }
  return bn2;
};
var se_ReplicationRuleAndOperator = (input, context) => {
  const bn2 = new XmlNode(_RRAO);
  bn2.cc(input, _P);
  bn2.l(input, "Tags", "Tag", () => se_TagSet(input[_Tag], context));
  return bn2;
};
var se_ReplicationRuleFilter = (input, context) => {
  const bn2 = new XmlNode(_RRF);
  ReplicationRuleFilter.visit(input, {
    Prefix: (value) => {
      if (input[_P] != null) {
        bn2.c(XmlNode.of(_P, value).n(_P));
      }
    },
    Tag: (value) => {
      if (input[_Ta] != null) {
        bn2.c(se_Tag(value, context).n(_Ta));
      }
    },
    And: (value) => {
      if (input[_A] != null) {
        bn2.c(se_ReplicationRuleAndOperator(value, context).n(_A));
      }
    },
    _: (name, value) => {
      if (!(value instanceof XmlNode || value instanceof XmlText)) {
        throw new Error("Unable to serialize unknown union members in XML.");
      }
      bn2.c(new XmlNode(name).c(value));
    }
  });
  return bn2;
};
var se_ReplicationRules = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_ReplicationRule(entry, context);
    return n2.n(_me);
  });
};
var se_ReplicationTime = (input, context) => {
  const bn2 = new XmlNode(_RTe);
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_RTS, input[_S]).n(_S));
  }
  if (input[_Tim] != null) {
    bn2.c(se_ReplicationTimeValue(input[_Tim], context).n(_Tim));
  }
  return bn2;
};
var se_ReplicationTimeValue = (input, context) => {
  const bn2 = new XmlNode(_RTV);
  if (input[_Mi] != null) {
    bn2.c(XmlNode.of(_Mi, String(input[_Mi])).n(_Mi));
  }
  return bn2;
};
var se_RequestPaymentConfiguration = (input, context) => {
  const bn2 = new XmlNode(_RPC);
  bn2.cc(input, _Pa);
  return bn2;
};
var se_RequestProgress = (input, context) => {
  const bn2 = new XmlNode(_RPe);
  if (input[_Ena] != null) {
    bn2.c(XmlNode.of(_ERP, String(input[_Ena])).n(_Ena));
  }
  return bn2;
};
var se_RestoreRequest = (input, context) => {
  const bn2 = new XmlNode(_RRes);
  if (input[_Da] != null) {
    bn2.c(XmlNode.of(_Da, String(input[_Da])).n(_Da));
  }
  if (input[_GJP] != null) {
    bn2.c(se_GlacierJobParameters(input[_GJP], context).n(_GJP));
  }
  if (input[_Ty] != null) {
    bn2.c(XmlNode.of(_RRT, input[_Ty]).n(_Ty));
  }
  bn2.cc(input, _Ti);
  bn2.cc(input, _Desc);
  if (input[_SP] != null) {
    bn2.c(se_SelectParameters(input[_SP], context).n(_SP));
  }
  if (input[_OL] != null) {
    bn2.c(se_OutputLocation(input[_OL], context).n(_OL));
  }
  return bn2;
};
var se_RoutingRule = (input, context) => {
  const bn2 = new XmlNode(_RRou);
  if (input[_Con] != null) {
    bn2.c(se_Condition(input[_Con], context).n(_Con));
  }
  if (input[_Red] != null) {
    bn2.c(se_Redirect(input[_Red], context).n(_Red));
  }
  return bn2;
};
var se_RoutingRules = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_RoutingRule(entry, context);
    return n2.n(_RRou);
  });
};
var se_S3KeyFilter = (input, context) => {
  const bn2 = new XmlNode(_SKF);
  bn2.l(input, "FilterRules", "FilterRule", () => se_FilterRuleList(input[_FRi], context));
  return bn2;
};
var se_S3Location = (input, context) => {
  const bn2 = new XmlNode(_SL);
  bn2.cc(input, _BN);
  if (input[_P] != null) {
    bn2.c(XmlNode.of(_LP, input[_P]).n(_P));
  }
  if (input[_En] != null) {
    bn2.c(se_Encryption(input[_En], context).n(_En));
  }
  if (input[_CACL] != null) {
    bn2.c(XmlNode.of(_OCACL, input[_CACL]).n(_CACL));
  }
  bn2.lc(input, "AccessControlList", "AccessControlList", () => se_Grants(input[_ACLc], context));
  if (input[_T] != null) {
    bn2.c(se_Tagging(input[_T], context).n(_T));
  }
  bn2.lc(input, "UserMetadata", "UserMetadata", () => se_UserMetadata(input[_UM], context));
  bn2.cc(input, _SC);
  return bn2;
};
var se_ScanRange = (input, context) => {
  const bn2 = new XmlNode(_SR);
  if (input[_St] != null) {
    bn2.c(XmlNode.of(_St, String(input[_St])).n(_St));
  }
  if (input[_End] != null) {
    bn2.c(XmlNode.of(_End, String(input[_End])).n(_End));
  }
  return bn2;
};
var se_SelectParameters = (input, context) => {
  const bn2 = new XmlNode(_SP);
  if (input[_IS] != null) {
    bn2.c(se_InputSerialization(input[_IS], context).n(_IS));
  }
  bn2.cc(input, _ETx);
  bn2.cc(input, _Ex);
  if (input[_OS] != null) {
    bn2.c(se_OutputSerialization(input[_OS], context).n(_OS));
  }
  return bn2;
};
var se_ServerSideEncryptionByDefault = (input, context) => {
  const bn2 = new XmlNode(_SSEBD);
  if (input[_SSEA] != null) {
    bn2.c(XmlNode.of(_SSE, input[_SSEA]).n(_SSEA));
  }
  if (input[_KMSMKID] != null) {
    bn2.c(XmlNode.of(_SSEKMSKI, input[_KMSMKID]).n(_KMSMKID));
  }
  return bn2;
};
var se_ServerSideEncryptionConfiguration = (input, context) => {
  const bn2 = new XmlNode(_SSEC);
  bn2.l(input, "Rules", "Rule", () => se_ServerSideEncryptionRules(input[_Rul], context));
  return bn2;
};
var se_ServerSideEncryptionRule = (input, context) => {
  const bn2 = new XmlNode(_SSER);
  if (input[_ASSEBD] != null) {
    bn2.c(se_ServerSideEncryptionByDefault(input[_ASSEBD], context).n(_ASSEBD));
  }
  if (input[_BKE] != null) {
    bn2.c(XmlNode.of(_BKE, String(input[_BKE])).n(_BKE));
  }
  return bn2;
};
var se_ServerSideEncryptionRules = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_ServerSideEncryptionRule(entry, context);
    return n2.n(_me);
  });
};
var se_SimplePrefix = (input, context) => {
  const bn2 = new XmlNode(_SPi);
  return bn2;
};
var se_SourceSelectionCriteria = (input, context) => {
  const bn2 = new XmlNode(_SSC);
  if (input[_SKEO] != null) {
    bn2.c(se_SseKmsEncryptedObjects(input[_SKEO], context).n(_SKEO));
  }
  if (input[_RM] != null) {
    bn2.c(se_ReplicaModifications(input[_RM], context).n(_RM));
  }
  return bn2;
};
var se_SSEKMS = (input, context) => {
  const bn2 = new XmlNode(_SK);
  if (input[_KI] != null) {
    bn2.c(XmlNode.of(_SSEKMSKI, input[_KI]).n(_KI));
  }
  return bn2;
};
var se_SseKmsEncryptedObjects = (input, context) => {
  const bn2 = new XmlNode(_SKEO);
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_SKEOS, input[_S]).n(_S));
  }
  return bn2;
};
var se_SSES3 = (input, context) => {
  const bn2 = new XmlNode(_SS);
  return bn2;
};
var se_StorageClassAnalysis = (input, context) => {
  const bn2 = new XmlNode(_SCA);
  if (input[_DE] != null) {
    bn2.c(se_StorageClassAnalysisDataExport(input[_DE], context).n(_DE));
  }
  return bn2;
};
var se_StorageClassAnalysisDataExport = (input, context) => {
  const bn2 = new XmlNode(_SCADE);
  if (input[_OSV] != null) {
    bn2.c(XmlNode.of(_SCASV, input[_OSV]).n(_OSV));
  }
  if (input[_Des] != null) {
    bn2.c(se_AnalyticsExportDestination(input[_Des], context).n(_Des));
  }
  return bn2;
};
var se_Tag = (input, context) => {
  const bn2 = new XmlNode(_Ta);
  if (input[_K] != null) {
    bn2.c(XmlNode.of(_OK, input[_K]).n(_K));
  }
  bn2.cc(input, _Va);
  return bn2;
};
var se_Tagging = (input, context) => {
  const bn2 = new XmlNode(_T);
  bn2.lc(input, "TagSet", "TagSet", () => se_TagSet(input[_TS], context));
  return bn2;
};
var se_TagSet = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_Tag(entry, context);
    return n2.n(_Ta);
  });
};
var se_TargetGrant = (input, context) => {
  const bn2 = new XmlNode(_TGa);
  if (input[_Gra] != null) {
    const n2 = se_Grantee(input[_Gra], context).n(_Gra);
    n2.a("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    bn2.c(n2);
  }
  if (input[_Pe] != null) {
    bn2.c(XmlNode.of(_BLP, input[_Pe]).n(_Pe));
  }
  return bn2;
};
var se_TargetGrants = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_TargetGrant(entry, context);
    return n2.n(_G);
  });
};
var se_TargetObjectKeyFormat = (input, context) => {
  const bn2 = new XmlNode(_TOKF);
  if (input[_SPi] != null) {
    bn2.c(se_SimplePrefix(input[_SPi], context).n(_SPi));
  }
  if (input[_PP] != null) {
    bn2.c(se_PartitionedPrefix(input[_PP], context).n(_PP));
  }
  return bn2;
};
var se_Tiering = (input, context) => {
  const bn2 = new XmlNode(_Tier);
  if (input[_Da] != null) {
    bn2.c(XmlNode.of(_ITD, String(input[_Da])).n(_Da));
  }
  if (input[_AT] != null) {
    bn2.c(XmlNode.of(_ITAT, input[_AT]).n(_AT));
  }
  return bn2;
};
var se_TieringList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_Tiering(entry, context);
    return n2.n(_me);
  });
};
var se_TopicConfiguration = (input, context) => {
  const bn2 = new XmlNode(_TCo);
  if (input[_I] != null) {
    bn2.c(XmlNode.of(_NI, input[_I]).n(_I));
  }
  if (input[_TA] != null) {
    bn2.c(XmlNode.of(_TA, input[_TA]).n(_Top));
  }
  bn2.l(input, "Events", "Event", () => se_EventList(input[_Eve], context));
  if (input[_F] != null) {
    bn2.c(se_NotificationConfigurationFilter(input[_F], context).n(_F));
  }
  return bn2;
};
var se_TopicConfigurationList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_TopicConfiguration(entry, context);
    return n2.n(_me);
  });
};
var se_Transition = (input, context) => {
  const bn2 = new XmlNode(_Tra);
  if (input[_Dat] != null) {
    bn2.c(XmlNode.of(_Dat, serializeDateTime(input[_Dat]).toString()).n(_Dat));
  }
  if (input[_Da] != null) {
    bn2.c(XmlNode.of(_Da, String(input[_Da])).n(_Da));
  }
  if (input[_SC] != null) {
    bn2.c(XmlNode.of(_TSC, input[_SC]).n(_SC));
  }
  return bn2;
};
var se_TransitionList = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_Transition(entry, context);
    return n2.n(_me);
  });
};
var se_UserMetadata = (input, context) => {
  return input.filter((e2) => e2 != null).map((entry) => {
    const n2 = se_MetadataEntry(entry, context);
    return n2.n(_ME);
  });
};
var se_VersioningConfiguration = (input, context) => {
  const bn2 = new XmlNode(_VCe);
  if (input[_MFAD] != null) {
    bn2.c(XmlNode.of(_MFAD, input[_MFAD]).n(_MDf));
  }
  if (input[_S] != null) {
    bn2.c(XmlNode.of(_BVS, input[_S]).n(_S));
  }
  return bn2;
};
var se_WebsiteConfiguration = (input, context) => {
  const bn2 = new XmlNode(_WC);
  if (input[_ED] != null) {
    bn2.c(se_ErrorDocument(input[_ED], context).n(_ED));
  }
  if (input[_ID] != null) {
    bn2.c(se_IndexDocument(input[_ID], context).n(_ID));
  }
  if (input[_RART] != null) {
    bn2.c(se_RedirectAllRequestsTo(input[_RART], context).n(_RART));
  }
  bn2.lc(input, "RoutingRules", "RoutingRules", () => se_RoutingRules(input[_RRo], context));
  return bn2;
};
var de_AbortIncompleteMultipartUpload = (output, context) => {
  const contents = {};
  if (output[_DAI] != null) {
    contents[_DAI] = strictParseInt32(output[_DAI]);
  }
  return contents;
};
var de_AccessControlTranslation = (output, context) => {
  const contents = {};
  if (output[_O] != null) {
    contents[_O] = expectString(output[_O]);
  }
  return contents;
};
var de_AllowedHeaders = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return expectString(entry);
  });
};
var de_AllowedMethods = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return expectString(entry);
  });
};
var de_AllowedOrigins = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return expectString(entry);
  });
};
var de_AnalyticsAndOperator = (output, context) => {
  const contents = {};
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output.Tag === "") {
    contents[_Tag] = [];
  } else if (output[_Ta] != null) {
    contents[_Tag] = de_TagSet(getArrayIfSingleItem(output[_Ta]), context);
  }
  return contents;
};
var de_AnalyticsConfiguration = (output, context) => {
  const contents = {};
  if (output[_I] != null) {
    contents[_I] = expectString(output[_I]);
  }
  if (output.Filter === "") {
  } else if (output[_F] != null) {
    contents[_F] = de_AnalyticsFilter(expectUnion(output[_F]), context);
  }
  if (output[_SCA] != null) {
    contents[_SCA] = de_StorageClassAnalysis(output[_SCA], context);
  }
  return contents;
};
var de_AnalyticsConfigurationList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_AnalyticsConfiguration(entry, context);
  });
};
var de_AnalyticsExportDestination = (output, context) => {
  const contents = {};
  if (output[_SBD] != null) {
    contents[_SBD] = de_AnalyticsS3BucketDestination(output[_SBD], context);
  }
  return contents;
};
var de_AnalyticsFilter = (output, context) => {
  if (output[_P] != null) {
    return {
      Prefix: expectString(output[_P])
    };
  }
  if (output[_Ta] != null) {
    return {
      Tag: de_Tag(output[_Ta], context)
    };
  }
  if (output[_A] != null) {
    return {
      And: de_AnalyticsAndOperator(output[_A], context)
    };
  }
  return {
    $unknown: Object.entries(output)[0]
  };
};
var de_AnalyticsS3BucketDestination = (output, context) => {
  const contents = {};
  if (output[_Fo] != null) {
    contents[_Fo] = expectString(output[_Fo]);
  }
  if (output[_BAI] != null) {
    contents[_BAI] = expectString(output[_BAI]);
  }
  if (output[_B] != null) {
    contents[_B] = expectString(output[_B]);
  }
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  return contents;
};
var de_Bucket = (output, context) => {
  const contents = {};
  if (output[_N] != null) {
    contents[_N] = expectString(output[_N]);
  }
  if (output[_CDr] != null) {
    contents[_CDr] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_CDr]));
  }
  return contents;
};
var de_Buckets = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_Bucket(entry, context);
  });
};
var de_Checksum = (output, context) => {
  const contents = {};
  if (output[_CCRC] != null) {
    contents[_CCRC] = expectString(output[_CCRC]);
  }
  if (output[_CCRCC] != null) {
    contents[_CCRCC] = expectString(output[_CCRCC]);
  }
  if (output[_CSHA] != null) {
    contents[_CSHA] = expectString(output[_CSHA]);
  }
  if (output[_CSHAh] != null) {
    contents[_CSHAh] = expectString(output[_CSHAh]);
  }
  return contents;
};
var de_ChecksumAlgorithmList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return expectString(entry);
  });
};
var de_CommonPrefix = (output, context) => {
  const contents = {};
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  return contents;
};
var de_CommonPrefixList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_CommonPrefix(entry, context);
  });
};
var de_Condition = (output, context) => {
  const contents = {};
  if (output[_HECRE] != null) {
    contents[_HECRE] = expectString(output[_HECRE]);
  }
  if (output[_KPE] != null) {
    contents[_KPE] = expectString(output[_KPE]);
  }
  return contents;
};
var de_ContinuationEvent = (output, context) => {
  const contents = {};
  return contents;
};
var de_CopyObjectResult = (output, context) => {
  const contents = {};
  if (output[_ETa] != null) {
    contents[_ETa] = expectString(output[_ETa]);
  }
  if (output[_LM] != null) {
    contents[_LM] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_LM]));
  }
  if (output[_CCRC] != null) {
    contents[_CCRC] = expectString(output[_CCRC]);
  }
  if (output[_CCRCC] != null) {
    contents[_CCRCC] = expectString(output[_CCRCC]);
  }
  if (output[_CSHA] != null) {
    contents[_CSHA] = expectString(output[_CSHA]);
  }
  if (output[_CSHAh] != null) {
    contents[_CSHAh] = expectString(output[_CSHAh]);
  }
  return contents;
};
var de_CopyPartResult = (output, context) => {
  const contents = {};
  if (output[_ETa] != null) {
    contents[_ETa] = expectString(output[_ETa]);
  }
  if (output[_LM] != null) {
    contents[_LM] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_LM]));
  }
  if (output[_CCRC] != null) {
    contents[_CCRC] = expectString(output[_CCRC]);
  }
  if (output[_CCRCC] != null) {
    contents[_CCRCC] = expectString(output[_CCRCC]);
  }
  if (output[_CSHA] != null) {
    contents[_CSHA] = expectString(output[_CSHA]);
  }
  if (output[_CSHAh] != null) {
    contents[_CSHAh] = expectString(output[_CSHAh]);
  }
  return contents;
};
var de_CORSRule = (output, context) => {
  const contents = {};
  if (output[_ID_] != null) {
    contents[_ID_] = expectString(output[_ID_]);
  }
  if (output.AllowedHeader === "") {
    contents[_AHl] = [];
  } else if (output[_AH] != null) {
    contents[_AHl] = de_AllowedHeaders(getArrayIfSingleItem(output[_AH]), context);
  }
  if (output.AllowedMethod === "") {
    contents[_AMl] = [];
  } else if (output[_AM] != null) {
    contents[_AMl] = de_AllowedMethods(getArrayIfSingleItem(output[_AM]), context);
  }
  if (output.AllowedOrigin === "") {
    contents[_AOl] = [];
  } else if (output[_AO] != null) {
    contents[_AOl] = de_AllowedOrigins(getArrayIfSingleItem(output[_AO]), context);
  }
  if (output.ExposeHeader === "") {
    contents[_EH] = [];
  } else if (output[_EHx] != null) {
    contents[_EH] = de_ExposeHeaders(getArrayIfSingleItem(output[_EHx]), context);
  }
  if (output[_MAS] != null) {
    contents[_MAS] = strictParseInt32(output[_MAS]);
  }
  return contents;
};
var de_CORSRules = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_CORSRule(entry, context);
  });
};
var de_DefaultRetention = (output, context) => {
  const contents = {};
  if (output[_Mo] != null) {
    contents[_Mo] = expectString(output[_Mo]);
  }
  if (output[_Da] != null) {
    contents[_Da] = strictParseInt32(output[_Da]);
  }
  if (output[_Y] != null) {
    contents[_Y] = strictParseInt32(output[_Y]);
  }
  return contents;
};
var de_DeletedObject = (output, context) => {
  const contents = {};
  if (output[_K] != null) {
    contents[_K] = expectString(output[_K]);
  }
  if (output[_VI] != null) {
    contents[_VI] = expectString(output[_VI]);
  }
  if (output[_DM] != null) {
    contents[_DM] = parseBoolean(output[_DM]);
  }
  if (output[_DMVI] != null) {
    contents[_DMVI] = expectString(output[_DMVI]);
  }
  return contents;
};
var de_DeletedObjects = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_DeletedObject(entry, context);
  });
};
var de_DeleteMarkerEntry = (output, context) => {
  const contents = {};
  if (output[_O] != null) {
    contents[_O] = de_Owner(output[_O], context);
  }
  if (output[_K] != null) {
    contents[_K] = expectString(output[_K]);
  }
  if (output[_VI] != null) {
    contents[_VI] = expectString(output[_VI]);
  }
  if (output[_IL] != null) {
    contents[_IL] = parseBoolean(output[_IL]);
  }
  if (output[_LM] != null) {
    contents[_LM] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_LM]));
  }
  return contents;
};
var de_DeleteMarkerReplication = (output, context) => {
  const contents = {};
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  return contents;
};
var de_DeleteMarkers = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_DeleteMarkerEntry(entry, context);
  });
};
var de_Destination = (output, context) => {
  const contents = {};
  if (output[_B] != null) {
    contents[_B] = expectString(output[_B]);
  }
  if (output[_Ac] != null) {
    contents[_Ac] = expectString(output[_Ac]);
  }
  if (output[_SC] != null) {
    contents[_SC] = expectString(output[_SC]);
  }
  if (output[_ACT] != null) {
    contents[_ACT] = de_AccessControlTranslation(output[_ACT], context);
  }
  if (output[_ECn] != null) {
    contents[_ECn] = de_EncryptionConfiguration(output[_ECn], context);
  }
  if (output[_RTe] != null) {
    contents[_RTe] = de_ReplicationTime(output[_RTe], context);
  }
  if (output[_Me] != null) {
    contents[_Me] = de_Metrics(output[_Me], context);
  }
  return contents;
};
var de_EncryptionConfiguration = (output, context) => {
  const contents = {};
  if (output[_RKKID] != null) {
    contents[_RKKID] = expectString(output[_RKKID]);
  }
  return contents;
};
var de_EndEvent = (output, context) => {
  const contents = {};
  return contents;
};
var de__Error = (output, context) => {
  const contents = {};
  if (output[_K] != null) {
    contents[_K] = expectString(output[_K]);
  }
  if (output[_VI] != null) {
    contents[_VI] = expectString(output[_VI]);
  }
  if (output[_Cod] != null) {
    contents[_Cod] = expectString(output[_Cod]);
  }
  if (output[_Mes] != null) {
    contents[_Mes] = expectString(output[_Mes]);
  }
  return contents;
};
var de_ErrorDocument = (output, context) => {
  const contents = {};
  if (output[_K] != null) {
    contents[_K] = expectString(output[_K]);
  }
  return contents;
};
var de_Errors = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de__Error(entry, context);
  });
};
var de_EventBridgeConfiguration = (output, context) => {
  const contents = {};
  return contents;
};
var de_EventList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return expectString(entry);
  });
};
var de_ExistingObjectReplication = (output, context) => {
  const contents = {};
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  return contents;
};
var de_ExposeHeaders = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return expectString(entry);
  });
};
var de_FilterRule = (output, context) => {
  const contents = {};
  if (output[_N] != null) {
    contents[_N] = expectString(output[_N]);
  }
  if (output[_Va] != null) {
    contents[_Va] = expectString(output[_Va]);
  }
  return contents;
};
var de_FilterRuleList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_FilterRule(entry, context);
  });
};
var de_GetObjectAttributesParts = (output, context) => {
  const contents = {};
  if (output[_PC] != null) {
    contents[_TPC] = strictParseInt32(output[_PC]);
  }
  if (output[_PNM] != null) {
    contents[_PNM] = expectString(output[_PNM]);
  }
  if (output[_NPNM] != null) {
    contents[_NPNM] = expectString(output[_NPNM]);
  }
  if (output[_MP] != null) {
    contents[_MP] = strictParseInt32(output[_MP]);
  }
  if (output[_IT] != null) {
    contents[_IT] = parseBoolean(output[_IT]);
  }
  if (output.Part === "") {
    contents[_Part] = [];
  } else if (output[_Par] != null) {
    contents[_Part] = de_PartsList(getArrayIfSingleItem(output[_Par]), context);
  }
  return contents;
};
var de_Grant = (output, context) => {
  const contents = {};
  if (output[_Gra] != null) {
    contents[_Gra] = de_Grantee(output[_Gra], context);
  }
  if (output[_Pe] != null) {
    contents[_Pe] = expectString(output[_Pe]);
  }
  return contents;
};
var de_Grantee = (output, context) => {
  const contents = {};
  if (output[_DN] != null) {
    contents[_DN] = expectString(output[_DN]);
  }
  if (output[_EA] != null) {
    contents[_EA] = expectString(output[_EA]);
  }
  if (output[_ID_] != null) {
    contents[_ID_] = expectString(output[_ID_]);
  }
  if (output[_URI] != null) {
    contents[_URI] = expectString(output[_URI]);
  }
  if (output[_x] != null) {
    contents[_Ty] = expectString(output[_x]);
  }
  return contents;
};
var de_Grants = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_Grant(entry, context);
  });
};
var de_IndexDocument = (output, context) => {
  const contents = {};
  if (output[_Su] != null) {
    contents[_Su] = expectString(output[_Su]);
  }
  return contents;
};
var de_Initiator = (output, context) => {
  const contents = {};
  if (output[_ID_] != null) {
    contents[_ID_] = expectString(output[_ID_]);
  }
  if (output[_DN] != null) {
    contents[_DN] = expectString(output[_DN]);
  }
  return contents;
};
var de_IntelligentTieringAndOperator = (output, context) => {
  const contents = {};
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output.Tag === "") {
    contents[_Tag] = [];
  } else if (output[_Ta] != null) {
    contents[_Tag] = de_TagSet(getArrayIfSingleItem(output[_Ta]), context);
  }
  return contents;
};
var de_IntelligentTieringConfiguration = (output, context) => {
  const contents = {};
  if (output[_I] != null) {
    contents[_I] = expectString(output[_I]);
  }
  if (output[_F] != null) {
    contents[_F] = de_IntelligentTieringFilter(output[_F], context);
  }
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  if (output.Tiering === "") {
    contents[_Tie] = [];
  } else if (output[_Tier] != null) {
    contents[_Tie] = de_TieringList(getArrayIfSingleItem(output[_Tier]), context);
  }
  return contents;
};
var de_IntelligentTieringConfigurationList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_IntelligentTieringConfiguration(entry, context);
  });
};
var de_IntelligentTieringFilter = (output, context) => {
  const contents = {};
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output[_Ta] != null) {
    contents[_Ta] = de_Tag(output[_Ta], context);
  }
  if (output[_A] != null) {
    contents[_A] = de_IntelligentTieringAndOperator(output[_A], context);
  }
  return contents;
};
var de_InventoryConfiguration = (output, context) => {
  const contents = {};
  if (output[_Des] != null) {
    contents[_Des] = de_InventoryDestination(output[_Des], context);
  }
  if (output[_IE] != null) {
    contents[_IE] = parseBoolean(output[_IE]);
  }
  if (output[_F] != null) {
    contents[_F] = de_InventoryFilter(output[_F], context);
  }
  if (output[_I] != null) {
    contents[_I] = expectString(output[_I]);
  }
  if (output[_IOV] != null) {
    contents[_IOV] = expectString(output[_IOV]);
  }
  if (output.OptionalFields === "") {
    contents[_OF] = [];
  } else if (output[_OF] != null && output[_OF][_Fi] != null) {
    contents[_OF] = de_InventoryOptionalFields(getArrayIfSingleItem(output[_OF][_Fi]), context);
  }
  if (output[_Sc] != null) {
    contents[_Sc] = de_InventorySchedule(output[_Sc], context);
  }
  return contents;
};
var de_InventoryConfigurationList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_InventoryConfiguration(entry, context);
  });
};
var de_InventoryDestination = (output, context) => {
  const contents = {};
  if (output[_SBD] != null) {
    contents[_SBD] = de_InventoryS3BucketDestination(output[_SBD], context);
  }
  return contents;
};
var de_InventoryEncryption = (output, context) => {
  const contents = {};
  if (output[_SS] != null) {
    contents[_SSES] = de_SSES3(output[_SS], context);
  }
  if (output[_SK] != null) {
    contents[_SSEKMS] = de_SSEKMS(output[_SK], context);
  }
  return contents;
};
var de_InventoryFilter = (output, context) => {
  const contents = {};
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  return contents;
};
var de_InventoryOptionalFields = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return expectString(entry);
  });
};
var de_InventoryS3BucketDestination = (output, context) => {
  const contents = {};
  if (output[_AIc] != null) {
    contents[_AIc] = expectString(output[_AIc]);
  }
  if (output[_B] != null) {
    contents[_B] = expectString(output[_B]);
  }
  if (output[_Fo] != null) {
    contents[_Fo] = expectString(output[_Fo]);
  }
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output[_En] != null) {
    contents[_En] = de_InventoryEncryption(output[_En], context);
  }
  return contents;
};
var de_InventorySchedule = (output, context) => {
  const contents = {};
  if (output[_Fr] != null) {
    contents[_Fr] = expectString(output[_Fr]);
  }
  return contents;
};
var de_LambdaFunctionConfiguration = (output, context) => {
  const contents = {};
  if (output[_I] != null) {
    contents[_I] = expectString(output[_I]);
  }
  if (output[_CF] != null) {
    contents[_LFA] = expectString(output[_CF]);
  }
  if (output.Event === "") {
    contents[_Eve] = [];
  } else if (output[_Ev] != null) {
    contents[_Eve] = de_EventList(getArrayIfSingleItem(output[_Ev]), context);
  }
  if (output[_F] != null) {
    contents[_F] = de_NotificationConfigurationFilter(output[_F], context);
  }
  return contents;
};
var de_LambdaFunctionConfigurationList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_LambdaFunctionConfiguration(entry, context);
  });
};
var de_LifecycleExpiration = (output, context) => {
  const contents = {};
  if (output[_Dat] != null) {
    contents[_Dat] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_Dat]));
  }
  if (output[_Da] != null) {
    contents[_Da] = strictParseInt32(output[_Da]);
  }
  if (output[_EODM] != null) {
    contents[_EODM] = parseBoolean(output[_EODM]);
  }
  return contents;
};
var de_LifecycleRule = (output, context) => {
  const contents = {};
  if (output[_Exp] != null) {
    contents[_Exp] = de_LifecycleExpiration(output[_Exp], context);
  }
  if (output[_ID_] != null) {
    contents[_ID_] = expectString(output[_ID_]);
  }
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output.Filter === "") {
  } else if (output[_F] != null) {
    contents[_F] = de_LifecycleRuleFilter(expectUnion(output[_F]), context);
  }
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  if (output.Transition === "") {
    contents[_Tr] = [];
  } else if (output[_Tra] != null) {
    contents[_Tr] = de_TransitionList(getArrayIfSingleItem(output[_Tra]), context);
  }
  if (output.NoncurrentVersionTransition === "") {
    contents[_NVT] = [];
  } else if (output[_NVTo] != null) {
    contents[_NVT] = de_NoncurrentVersionTransitionList(getArrayIfSingleItem(output[_NVTo]), context);
  }
  if (output[_NVE] != null) {
    contents[_NVE] = de_NoncurrentVersionExpiration(output[_NVE], context);
  }
  if (output[_AIMU] != null) {
    contents[_AIMU] = de_AbortIncompleteMultipartUpload(output[_AIMU], context);
  }
  return contents;
};
var de_LifecycleRuleAndOperator = (output, context) => {
  const contents = {};
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output.Tag === "") {
    contents[_Tag] = [];
  } else if (output[_Ta] != null) {
    contents[_Tag] = de_TagSet(getArrayIfSingleItem(output[_Ta]), context);
  }
  if (output[_OSGT] != null) {
    contents[_OSGT] = strictParseLong(output[_OSGT]);
  }
  if (output[_OSLT] != null) {
    contents[_OSLT] = strictParseLong(output[_OSLT]);
  }
  return contents;
};
var de_LifecycleRuleFilter = (output, context) => {
  if (output[_P] != null) {
    return {
      Prefix: expectString(output[_P])
    };
  }
  if (output[_Ta] != null) {
    return {
      Tag: de_Tag(output[_Ta], context)
    };
  }
  if (output[_OSGT] != null) {
    return {
      ObjectSizeGreaterThan: strictParseLong(output[_OSGT])
    };
  }
  if (output[_OSLT] != null) {
    return {
      ObjectSizeLessThan: strictParseLong(output[_OSLT])
    };
  }
  if (output[_A] != null) {
    return {
      And: de_LifecycleRuleAndOperator(output[_A], context)
    };
  }
  return {
    $unknown: Object.entries(output)[0]
  };
};
var de_LifecycleRules = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_LifecycleRule(entry, context);
  });
};
var de_LoggingEnabled = (output, context) => {
  const contents = {};
  if (output[_TB] != null) {
    contents[_TB] = expectString(output[_TB]);
  }
  if (output.TargetGrants === "") {
    contents[_TG] = [];
  } else if (output[_TG] != null && output[_TG][_G] != null) {
    contents[_TG] = de_TargetGrants(getArrayIfSingleItem(output[_TG][_G]), context);
  }
  if (output[_TP] != null) {
    contents[_TP] = expectString(output[_TP]);
  }
  if (output[_TOKF] != null) {
    contents[_TOKF] = de_TargetObjectKeyFormat(output[_TOKF], context);
  }
  return contents;
};
var de_Metrics = (output, context) => {
  const contents = {};
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  if (output[_ETv] != null) {
    contents[_ETv] = de_ReplicationTimeValue(output[_ETv], context);
  }
  return contents;
};
var de_MetricsAndOperator = (output, context) => {
  const contents = {};
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output.Tag === "") {
    contents[_Tag] = [];
  } else if (output[_Ta] != null) {
    contents[_Tag] = de_TagSet(getArrayIfSingleItem(output[_Ta]), context);
  }
  if (output[_APAc] != null) {
    contents[_APAc] = expectString(output[_APAc]);
  }
  return contents;
};
var de_MetricsConfiguration = (output, context) => {
  const contents = {};
  if (output[_I] != null) {
    contents[_I] = expectString(output[_I]);
  }
  if (output.Filter === "") {
  } else if (output[_F] != null) {
    contents[_F] = de_MetricsFilter(expectUnion(output[_F]), context);
  }
  return contents;
};
var de_MetricsConfigurationList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_MetricsConfiguration(entry, context);
  });
};
var de_MetricsFilter = (output, context) => {
  if (output[_P] != null) {
    return {
      Prefix: expectString(output[_P])
    };
  }
  if (output[_Ta] != null) {
    return {
      Tag: de_Tag(output[_Ta], context)
    };
  }
  if (output[_APAc] != null) {
    return {
      AccessPointArn: expectString(output[_APAc])
    };
  }
  if (output[_A] != null) {
    return {
      And: de_MetricsAndOperator(output[_A], context)
    };
  }
  return {
    $unknown: Object.entries(output)[0]
  };
};
var de_MultipartUpload = (output, context) => {
  const contents = {};
  if (output[_UI] != null) {
    contents[_UI] = expectString(output[_UI]);
  }
  if (output[_K] != null) {
    contents[_K] = expectString(output[_K]);
  }
  if (output[_Ini] != null) {
    contents[_Ini] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_Ini]));
  }
  if (output[_SC] != null) {
    contents[_SC] = expectString(output[_SC]);
  }
  if (output[_O] != null) {
    contents[_O] = de_Owner(output[_O], context);
  }
  if (output[_In] != null) {
    contents[_In] = de_Initiator(output[_In], context);
  }
  if (output[_CA] != null) {
    contents[_CA] = expectString(output[_CA]);
  }
  return contents;
};
var de_MultipartUploadList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_MultipartUpload(entry, context);
  });
};
var de_NoncurrentVersionExpiration = (output, context) => {
  const contents = {};
  if (output[_ND] != null) {
    contents[_ND] = strictParseInt32(output[_ND]);
  }
  if (output[_NNV] != null) {
    contents[_NNV] = strictParseInt32(output[_NNV]);
  }
  return contents;
};
var de_NoncurrentVersionTransition = (output, context) => {
  const contents = {};
  if (output[_ND] != null) {
    contents[_ND] = strictParseInt32(output[_ND]);
  }
  if (output[_SC] != null) {
    contents[_SC] = expectString(output[_SC]);
  }
  if (output[_NNV] != null) {
    contents[_NNV] = strictParseInt32(output[_NNV]);
  }
  return contents;
};
var de_NoncurrentVersionTransitionList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_NoncurrentVersionTransition(entry, context);
  });
};
var de_NotificationConfigurationFilter = (output, context) => {
  const contents = {};
  if (output[_SKe] != null) {
    contents[_K] = de_S3KeyFilter(output[_SKe], context);
  }
  return contents;
};
var de__Object = (output, context) => {
  const contents = {};
  if (output[_K] != null) {
    contents[_K] = expectString(output[_K]);
  }
  if (output[_LM] != null) {
    contents[_LM] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_LM]));
  }
  if (output[_ETa] != null) {
    contents[_ETa] = expectString(output[_ETa]);
  }
  if (output.ChecksumAlgorithm === "") {
    contents[_CA] = [];
  } else if (output[_CA] != null) {
    contents[_CA] = de_ChecksumAlgorithmList(getArrayIfSingleItem(output[_CA]), context);
  }
  if (output[_Si] != null) {
    contents[_Si] = strictParseLong(output[_Si]);
  }
  if (output[_SC] != null) {
    contents[_SC] = expectString(output[_SC]);
  }
  if (output[_O] != null) {
    contents[_O] = de_Owner(output[_O], context);
  }
  if (output[_RSe] != null) {
    contents[_RSe] = de_RestoreStatus(output[_RSe], context);
  }
  return contents;
};
var de_ObjectList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de__Object(entry, context);
  });
};
var de_ObjectLockConfiguration = (output, context) => {
  const contents = {};
  if (output[_OLE] != null) {
    contents[_OLE] = expectString(output[_OLE]);
  }
  if (output[_Ru] != null) {
    contents[_Ru] = de_ObjectLockRule(output[_Ru], context);
  }
  return contents;
};
var de_ObjectLockLegalHold = (output, context) => {
  const contents = {};
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  return contents;
};
var de_ObjectLockRetention = (output, context) => {
  const contents = {};
  if (output[_Mo] != null) {
    contents[_Mo] = expectString(output[_Mo]);
  }
  if (output[_RUD] != null) {
    contents[_RUD] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_RUD]));
  }
  return contents;
};
var de_ObjectLockRule = (output, context) => {
  const contents = {};
  if (output[_DRe] != null) {
    contents[_DRe] = de_DefaultRetention(output[_DRe], context);
  }
  return contents;
};
var de_ObjectPart = (output, context) => {
  const contents = {};
  if (output[_PN] != null) {
    contents[_PN] = strictParseInt32(output[_PN]);
  }
  if (output[_Si] != null) {
    contents[_Si] = strictParseLong(output[_Si]);
  }
  if (output[_CCRC] != null) {
    contents[_CCRC] = expectString(output[_CCRC]);
  }
  if (output[_CCRCC] != null) {
    contents[_CCRCC] = expectString(output[_CCRCC]);
  }
  if (output[_CSHA] != null) {
    contents[_CSHA] = expectString(output[_CSHA]);
  }
  if (output[_CSHAh] != null) {
    contents[_CSHAh] = expectString(output[_CSHAh]);
  }
  return contents;
};
var de_ObjectVersion = (output, context) => {
  const contents = {};
  if (output[_ETa] != null) {
    contents[_ETa] = expectString(output[_ETa]);
  }
  if (output.ChecksumAlgorithm === "") {
    contents[_CA] = [];
  } else if (output[_CA] != null) {
    contents[_CA] = de_ChecksumAlgorithmList(getArrayIfSingleItem(output[_CA]), context);
  }
  if (output[_Si] != null) {
    contents[_Si] = strictParseLong(output[_Si]);
  }
  if (output[_SC] != null) {
    contents[_SC] = expectString(output[_SC]);
  }
  if (output[_K] != null) {
    contents[_K] = expectString(output[_K]);
  }
  if (output[_VI] != null) {
    contents[_VI] = expectString(output[_VI]);
  }
  if (output[_IL] != null) {
    contents[_IL] = parseBoolean(output[_IL]);
  }
  if (output[_LM] != null) {
    contents[_LM] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_LM]));
  }
  if (output[_O] != null) {
    contents[_O] = de_Owner(output[_O], context);
  }
  if (output[_RSe] != null) {
    contents[_RSe] = de_RestoreStatus(output[_RSe], context);
  }
  return contents;
};
var de_ObjectVersionList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_ObjectVersion(entry, context);
  });
};
var de_Owner = (output, context) => {
  const contents = {};
  if (output[_DN] != null) {
    contents[_DN] = expectString(output[_DN]);
  }
  if (output[_ID_] != null) {
    contents[_ID_] = expectString(output[_ID_]);
  }
  return contents;
};
var de_OwnershipControls = (output, context) => {
  const contents = {};
  if (output.Rule === "") {
    contents[_Rul] = [];
  } else if (output[_Ru] != null) {
    contents[_Rul] = de_OwnershipControlsRules(getArrayIfSingleItem(output[_Ru]), context);
  }
  return contents;
};
var de_OwnershipControlsRule = (output, context) => {
  const contents = {};
  if (output[_OO] != null) {
    contents[_OO] = expectString(output[_OO]);
  }
  return contents;
};
var de_OwnershipControlsRules = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_OwnershipControlsRule(entry, context);
  });
};
var de_Part = (output, context) => {
  const contents = {};
  if (output[_PN] != null) {
    contents[_PN] = strictParseInt32(output[_PN]);
  }
  if (output[_LM] != null) {
    contents[_LM] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_LM]));
  }
  if (output[_ETa] != null) {
    contents[_ETa] = expectString(output[_ETa]);
  }
  if (output[_Si] != null) {
    contents[_Si] = strictParseLong(output[_Si]);
  }
  if (output[_CCRC] != null) {
    contents[_CCRC] = expectString(output[_CCRC]);
  }
  if (output[_CCRCC] != null) {
    contents[_CCRCC] = expectString(output[_CCRCC]);
  }
  if (output[_CSHA] != null) {
    contents[_CSHA] = expectString(output[_CSHA]);
  }
  if (output[_CSHAh] != null) {
    contents[_CSHAh] = expectString(output[_CSHAh]);
  }
  return contents;
};
var de_PartitionedPrefix = (output, context) => {
  const contents = {};
  if (output[_PDS] != null) {
    contents[_PDS] = expectString(output[_PDS]);
  }
  return contents;
};
var de_Parts = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_Part(entry, context);
  });
};
var de_PartsList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_ObjectPart(entry, context);
  });
};
var de_PolicyStatus = (output, context) => {
  const contents = {};
  if (output[_IP] != null) {
    contents[_IP] = parseBoolean(output[_IP]);
  }
  return contents;
};
var de_Progress = (output, context) => {
  const contents = {};
  if (output[_BS] != null) {
    contents[_BS] = strictParseLong(output[_BS]);
  }
  if (output[_BP] != null) {
    contents[_BP] = strictParseLong(output[_BP]);
  }
  if (output[_BRy] != null) {
    contents[_BRy] = strictParseLong(output[_BRy]);
  }
  return contents;
};
var de_PublicAccessBlockConfiguration = (output, context) => {
  const contents = {};
  if (output[_BPA] != null) {
    contents[_BPA] = parseBoolean(output[_BPA]);
  }
  if (output[_IPA] != null) {
    contents[_IPA] = parseBoolean(output[_IPA]);
  }
  if (output[_BPP] != null) {
    contents[_BPP] = parseBoolean(output[_BPP]);
  }
  if (output[_RPB] != null) {
    contents[_RPB] = parseBoolean(output[_RPB]);
  }
  return contents;
};
var de_QueueConfiguration = (output, context) => {
  const contents = {};
  if (output[_I] != null) {
    contents[_I] = expectString(output[_I]);
  }
  if (output[_Qu] != null) {
    contents[_QA] = expectString(output[_Qu]);
  }
  if (output.Event === "") {
    contents[_Eve] = [];
  } else if (output[_Ev] != null) {
    contents[_Eve] = de_EventList(getArrayIfSingleItem(output[_Ev]), context);
  }
  if (output[_F] != null) {
    contents[_F] = de_NotificationConfigurationFilter(output[_F], context);
  }
  return contents;
};
var de_QueueConfigurationList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_QueueConfiguration(entry, context);
  });
};
var de_Redirect = (output, context) => {
  const contents = {};
  if (output[_HN] != null) {
    contents[_HN] = expectString(output[_HN]);
  }
  if (output[_HRC] != null) {
    contents[_HRC] = expectString(output[_HRC]);
  }
  if (output[_Pr] != null) {
    contents[_Pr] = expectString(output[_Pr]);
  }
  if (output[_RKPW] != null) {
    contents[_RKPW] = expectString(output[_RKPW]);
  }
  if (output[_RKW] != null) {
    contents[_RKW] = expectString(output[_RKW]);
  }
  return contents;
};
var de_RedirectAllRequestsTo = (output, context) => {
  const contents = {};
  if (output[_HN] != null) {
    contents[_HN] = expectString(output[_HN]);
  }
  if (output[_Pr] != null) {
    contents[_Pr] = expectString(output[_Pr]);
  }
  return contents;
};
var de_ReplicaModifications = (output, context) => {
  const contents = {};
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  return contents;
};
var de_ReplicationConfiguration = (output, context) => {
  const contents = {};
  if (output[_Ro] != null) {
    contents[_Ro] = expectString(output[_Ro]);
  }
  if (output.Rule === "") {
    contents[_Rul] = [];
  } else if (output[_Ru] != null) {
    contents[_Rul] = de_ReplicationRules(getArrayIfSingleItem(output[_Ru]), context);
  }
  return contents;
};
var de_ReplicationRule = (output, context) => {
  const contents = {};
  if (output[_ID_] != null) {
    contents[_ID_] = expectString(output[_ID_]);
  }
  if (output[_Pri] != null) {
    contents[_Pri] = strictParseInt32(output[_Pri]);
  }
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output.Filter === "") {
  } else if (output[_F] != null) {
    contents[_F] = de_ReplicationRuleFilter(expectUnion(output[_F]), context);
  }
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  if (output[_SSC] != null) {
    contents[_SSC] = de_SourceSelectionCriteria(output[_SSC], context);
  }
  if (output[_EOR] != null) {
    contents[_EOR] = de_ExistingObjectReplication(output[_EOR], context);
  }
  if (output[_Des] != null) {
    contents[_Des] = de_Destination(output[_Des], context);
  }
  if (output[_DMR] != null) {
    contents[_DMR] = de_DeleteMarkerReplication(output[_DMR], context);
  }
  return contents;
};
var de_ReplicationRuleAndOperator = (output, context) => {
  const contents = {};
  if (output[_P] != null) {
    contents[_P] = expectString(output[_P]);
  }
  if (output.Tag === "") {
    contents[_Tag] = [];
  } else if (output[_Ta] != null) {
    contents[_Tag] = de_TagSet(getArrayIfSingleItem(output[_Ta]), context);
  }
  return contents;
};
var de_ReplicationRuleFilter = (output, context) => {
  if (output[_P] != null) {
    return {
      Prefix: expectString(output[_P])
    };
  }
  if (output[_Ta] != null) {
    return {
      Tag: de_Tag(output[_Ta], context)
    };
  }
  if (output[_A] != null) {
    return {
      And: de_ReplicationRuleAndOperator(output[_A], context)
    };
  }
  return {
    $unknown: Object.entries(output)[0]
  };
};
var de_ReplicationRules = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_ReplicationRule(entry, context);
  });
};
var de_ReplicationTime = (output, context) => {
  const contents = {};
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  if (output[_Tim] != null) {
    contents[_Tim] = de_ReplicationTimeValue(output[_Tim], context);
  }
  return contents;
};
var de_ReplicationTimeValue = (output, context) => {
  const contents = {};
  if (output[_Mi] != null) {
    contents[_Mi] = strictParseInt32(output[_Mi]);
  }
  return contents;
};
var de_RestoreStatus = (output, context) => {
  const contents = {};
  if (output[_IRIP] != null) {
    contents[_IRIP] = parseBoolean(output[_IRIP]);
  }
  if (output[_RED] != null) {
    contents[_RED] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_RED]));
  }
  return contents;
};
var de_RoutingRule = (output, context) => {
  const contents = {};
  if (output[_Con] != null) {
    contents[_Con] = de_Condition(output[_Con], context);
  }
  if (output[_Red] != null) {
    contents[_Red] = de_Redirect(output[_Red], context);
  }
  return contents;
};
var de_RoutingRules = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_RoutingRule(entry, context);
  });
};
var de_S3KeyFilter = (output, context) => {
  const contents = {};
  if (output.FilterRule === "") {
    contents[_FRi] = [];
  } else if (output[_FR] != null) {
    contents[_FRi] = de_FilterRuleList(getArrayIfSingleItem(output[_FR]), context);
  }
  return contents;
};
var de_ServerSideEncryptionByDefault = (output, context) => {
  const contents = {};
  if (output[_SSEA] != null) {
    contents[_SSEA] = expectString(output[_SSEA]);
  }
  if (output[_KMSMKID] != null) {
    contents[_KMSMKID] = expectString(output[_KMSMKID]);
  }
  return contents;
};
var de_ServerSideEncryptionConfiguration = (output, context) => {
  const contents = {};
  if (output.Rule === "") {
    contents[_Rul] = [];
  } else if (output[_Ru] != null) {
    contents[_Rul] = de_ServerSideEncryptionRules(getArrayIfSingleItem(output[_Ru]), context);
  }
  return contents;
};
var de_ServerSideEncryptionRule = (output, context) => {
  const contents = {};
  if (output[_ASSEBD] != null) {
    contents[_ASSEBD] = de_ServerSideEncryptionByDefault(output[_ASSEBD], context);
  }
  if (output[_BKE] != null) {
    contents[_BKE] = parseBoolean(output[_BKE]);
  }
  return contents;
};
var de_ServerSideEncryptionRules = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_ServerSideEncryptionRule(entry, context);
  });
};
var de_SessionCredentials = (output, context) => {
  const contents = {};
  if (output[_AKI] != null) {
    contents[_AKI] = expectString(output[_AKI]);
  }
  if (output[_SAK] != null) {
    contents[_SAK] = expectString(output[_SAK]);
  }
  if (output[_ST] != null) {
    contents[_ST] = expectString(output[_ST]);
  }
  if (output[_Exp] != null) {
    contents[_Exp] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_Exp]));
  }
  return contents;
};
var de_SimplePrefix = (output, context) => {
  const contents = {};
  return contents;
};
var de_SourceSelectionCriteria = (output, context) => {
  const contents = {};
  if (output[_SKEO] != null) {
    contents[_SKEO] = de_SseKmsEncryptedObjects(output[_SKEO], context);
  }
  if (output[_RM] != null) {
    contents[_RM] = de_ReplicaModifications(output[_RM], context);
  }
  return contents;
};
var de_SSEKMS = (output, context) => {
  const contents = {};
  if (output[_KI] != null) {
    contents[_KI] = expectString(output[_KI]);
  }
  return contents;
};
var de_SseKmsEncryptedObjects = (output, context) => {
  const contents = {};
  if (output[_S] != null) {
    contents[_S] = expectString(output[_S]);
  }
  return contents;
};
var de_SSES3 = (output, context) => {
  const contents = {};
  return contents;
};
var de_Stats = (output, context) => {
  const contents = {};
  if (output[_BS] != null) {
    contents[_BS] = strictParseLong(output[_BS]);
  }
  if (output[_BP] != null) {
    contents[_BP] = strictParseLong(output[_BP]);
  }
  if (output[_BRy] != null) {
    contents[_BRy] = strictParseLong(output[_BRy]);
  }
  return contents;
};
var de_StorageClassAnalysis = (output, context) => {
  const contents = {};
  if (output[_DE] != null) {
    contents[_DE] = de_StorageClassAnalysisDataExport(output[_DE], context);
  }
  return contents;
};
var de_StorageClassAnalysisDataExport = (output, context) => {
  const contents = {};
  if (output[_OSV] != null) {
    contents[_OSV] = expectString(output[_OSV]);
  }
  if (output[_Des] != null) {
    contents[_Des] = de_AnalyticsExportDestination(output[_Des], context);
  }
  return contents;
};
var de_Tag = (output, context) => {
  const contents = {};
  if (output[_K] != null) {
    contents[_K] = expectString(output[_K]);
  }
  if (output[_Va] != null) {
    contents[_Va] = expectString(output[_Va]);
  }
  return contents;
};
var de_TagSet = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_Tag(entry, context);
  });
};
var de_TargetGrant = (output, context) => {
  const contents = {};
  if (output[_Gra] != null) {
    contents[_Gra] = de_Grantee(output[_Gra], context);
  }
  if (output[_Pe] != null) {
    contents[_Pe] = expectString(output[_Pe]);
  }
  return contents;
};
var de_TargetGrants = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_TargetGrant(entry, context);
  });
};
var de_TargetObjectKeyFormat = (output, context) => {
  const contents = {};
  if (output[_SPi] != null) {
    contents[_SPi] = de_SimplePrefix(output[_SPi], context);
  }
  if (output[_PP] != null) {
    contents[_PP] = de_PartitionedPrefix(output[_PP], context);
  }
  return contents;
};
var de_Tiering = (output, context) => {
  const contents = {};
  if (output[_Da] != null) {
    contents[_Da] = strictParseInt32(output[_Da]);
  }
  if (output[_AT] != null) {
    contents[_AT] = expectString(output[_AT]);
  }
  return contents;
};
var de_TieringList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_Tiering(entry, context);
  });
};
var de_TopicConfiguration = (output, context) => {
  const contents = {};
  if (output[_I] != null) {
    contents[_I] = expectString(output[_I]);
  }
  if (output[_Top] != null) {
    contents[_TA] = expectString(output[_Top]);
  }
  if (output.Event === "") {
    contents[_Eve] = [];
  } else if (output[_Ev] != null) {
    contents[_Eve] = de_EventList(getArrayIfSingleItem(output[_Ev]), context);
  }
  if (output[_F] != null) {
    contents[_F] = de_NotificationConfigurationFilter(output[_F], context);
  }
  return contents;
};
var de_TopicConfigurationList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_TopicConfiguration(entry, context);
  });
};
var de_Transition = (output, context) => {
  const contents = {};
  if (output[_Dat] != null) {
    contents[_Dat] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_Dat]));
  }
  if (output[_Da] != null) {
    contents[_Da] = strictParseInt32(output[_Da]);
  }
  if (output[_SC] != null) {
    contents[_SC] = expectString(output[_SC]);
  }
  return contents;
};
var de_TransitionList = (output, context) => {
  return (output || []).filter((e2) => e2 != null).map((entry) => {
    return de_Transition(entry, context);
  });
};
var deserializeMetadata2 = (output) => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"]
});
var collectBodyString2 = (streamBody, context) => collectBody(streamBody, context).then((body) => context.utf8Encoder(body));
var isSerializableHeaderValue = (value) => value !== void 0 && value !== null && value !== "" && (!Object.getOwnPropertyNames(value).includes("length") || value.length != 0) && (!Object.getOwnPropertyNames(value).includes("size") || value.size != 0);
var _A = "And";
var _AAO = "AnalyticsAndOperator";
var _AC = "AnalyticsConfiguration";
var _ACL = "ACL";
var _ACLc = "AccessControlList";
var _ACLn = "AnalyticsConfigurationList";
var _ACP = "AccessControlPolicy";
var _ACT = "AccessControlTranslation";
var _ACc = "AccelerateConfiguration";
var _AD = "AbortDate";
var _AED = "AnalyticsExportDestination";
var _AF = "AnalyticsFilter";
var _AH = "AllowedHeader";
var _AHl = "AllowedHeaders";
var _AI = "AnalyticsId";
var _AIMU = "AbortIncompleteMultipartUpload";
var _AIc = "AccountId";
var _AKI = "AccessKeyId";
var _AM = "AllowedMethod";
var _AMl = "AllowedMethods";
var _AO = "AllowedOrigin";
var _AOl = "AllowedOrigins";
var _APA = "AccessPointAlias";
var _APAc = "AccessPointArn";
var _AQRD = "AllowQuotedRecordDelimiter";
var _AR = "AcceptRanges";
var _ARI = "AbortRuleId";
var _AS = "ArchiveStatus";
var _ASBD = "AnalyticsS3BucketDestination";
var _ASEFF = "AnalyticsS3ExportFileFormat";
var _ASSEBD = "ApplyServerSideEncryptionByDefault";
var _AT = "AccessTier";
var _Ac = "Account";
var _B = "Bucket";
var _BAI = "BucketAccountId";
var _BAS = "BucketAccelerateStatus";
var _BGR = "BypassGovernanceRetention";
var _BI = "BucketInfo";
var _BKE = "BucketKeyEnabled";
var _BLC = "BucketLifecycleConfiguration";
var _BLCu = "BucketLocationConstraint";
var _BLN = "BucketLocationName";
var _BLP = "BucketLogsPermission";
var _BLS = "BucketLoggingStatus";
var _BLT = "BucketLocationType";
var _BN = "BucketName";
var _BP = "BytesProcessed";
var _BPA = "BlockPublicAcls";
var _BPP = "BlockPublicPolicy";
var _BR = "BucketRegion";
var _BRy = "BytesReturned";
var _BS = "BytesScanned";
var _BT = "BucketType";
var _BVS = "BucketVersioningStatus";
var _Bu = "Buckets";
var _C = "Credentials";
var _CA = "ChecksumAlgorithm";
var _CACL = "CannedACL";
var _CBC = "CreateBucketConfiguration";
var _CC = "CacheControl";
var _CCRC = "ChecksumCRC32";
var _CCRCC = "ChecksumCRC32C";
var _CD = "ContentDisposition";
var _CDr = "CreationDate";
var _CE = "ContentEncoding";
var _CF = "CloudFunction";
var _CFC = "CloudFunctionConfiguration";
var _CL = "ContentLanguage";
var _CLo = "ContentLength";
var _CM = "ChecksumMode";
var _CMD = "ContentMD5";
var _CMU = "CompletedMultipartUpload";
var _CORSC = "CORSConfiguration";
var _CORSR = "CORSRule";
var _CORSRu = "CORSRules";
var _CP = "CommonPrefixes";
var _CPo = "CompletedPart";
var _CR = "ContentRange";
var _CRSBA = "ConfirmRemoveSelfBucketAccess";
var _CS = "CopySource";
var _CSHA = "ChecksumSHA1";
var _CSHAh = "ChecksumSHA256";
var _CSIM = "CopySourceIfMatch";
var _CSIMS = "CopySourceIfModifiedSince";
var _CSINM = "CopySourceIfNoneMatch";
var _CSIUS = "CopySourceIfUnmodifiedSince";
var _CSR = "CopySourceRange";
var _CSSSECA = "CopySourceSSECustomerAlgorithm";
var _CSSSECK = "CopySourceSSECustomerKey";
var _CSSSECKMD = "CopySourceSSECustomerKeyMD5";
var _CSV = "CSV";
var _CSVI = "CopySourceVersionId";
var _CSVIn = "CSVInput";
var _CSVO = "CSVOutput";
var _CT = "ContentType";
var _CTo = "ContinuationToken";
var _CTom = "CompressionType";
var _Ch = "Checksum";
var _Co = "Contents";
var _Cod = "Code";
var _Com = "Comments";
var _Con = "Condition";
var _D = "Delimiter";
var _DAI = "DaysAfterInitiation";
var _DE = "DataExport";
var _DM = "DeleteMarker";
var _DMR = "DeleteMarkerReplication";
var _DMRS = "DeleteMarkerReplicationStatus";
var _DMVI = "DeleteMarkerVersionId";
var _DMe = "DeleteMarkers";
var _DN = "DisplayName";
var _DR = "DataRedundancy";
var _DRe = "DefaultRetention";
var _Da = "Days";
var _Dat = "Date";
var _De = "Deleted";
var _Del = "Delete";
var _Des = "Destination";
var _Desc = "Description";
var _E = "Expires";
var _EA = "EmailAddress";
var _EBC = "EventBridgeConfiguration";
var _EBO = "ExpectedBucketOwner";
var _EC = "ErrorCode";
var _ECn = "EncryptionConfiguration";
var _ED = "ErrorDocument";
var _EH = "ExposeHeaders";
var _EHx = "ExposeHeader";
var _EM = "ErrorMessage";
var _EODM = "ExpiredObjectDeleteMarker";
var _EOR = "ExistingObjectReplication";
var _EORS = "ExistingObjectReplicationStatus";
var _ERP = "EnableRequestProgress";
var _ES = "ExpiresString";
var _ESBO = "ExpectedSourceBucketOwner";
var _ESx = "ExpirationStatus";
var _ET = "EncodingType";
var _ETa = "ETag";
var _ETn = "EncryptionType";
var _ETv = "EventThreshold";
var _ETx = "ExpressionType";
var _En = "Encryption";
var _Ena = "Enabled";
var _End = "End";
var _Er = "Error";
var _Err = "Errors";
var _Ev = "Event";
var _Eve = "Events";
var _Ex = "Expression";
var _Exp = "Expiration";
var _F = "Filter";
var _FD = "FieldDelimiter";
var _FHI = "FileHeaderInfo";
var _FO = "FetchOwner";
var _FR = "FilterRule";
var _FRN = "FilterRuleName";
var _FRV = "FilterRuleValue";
var _FRi = "FilterRules";
var _Fi = "Field";
var _Fo = "Format";
var _Fr = "Frequency";
var _G = "Grant";
var _GFC = "GrantFullControl";
var _GJP = "GlacierJobParameters";
var _GR = "GrantRead";
var _GRACP = "GrantReadACP";
var _GW = "GrantWrite";
var _GWACP = "GrantWriteACP";
var _Gr = "Grants";
var _Gra = "Grantee";
var _HECRE = "HttpErrorCodeReturnedEquals";
var _HN = "HostName";
var _HRC = "HttpRedirectCode";
var _I = "Id";
var _IC = "InventoryConfiguration";
var _ICL = "InventoryConfigurationList";
var _ID = "IndexDocument";
var _ID_ = "ID";
var _IDn = "InventoryDestination";
var _IE = "IsEnabled";
var _IEn = "InventoryEncryption";
var _IF = "InventoryFilter";
var _IFn = "InventoryFormat";
var _IFnv = "InventoryFrequency";
var _II = "InventoryId";
var _IIOV = "InventoryIncludedObjectVersions";
var _IL = "IsLatest";
var _IM = "IfMatch";
var _IMS = "IfModifiedSince";
var _INM = "IfNoneMatch";
var _IOF = "InventoryOptionalField";
var _IOV = "IncludedObjectVersions";
var _IP = "IsPublic";
var _IPA = "IgnorePublicAcls";
var _IRIP = "IsRestoreInProgress";
var _IS = "InputSerialization";
var _ISBD = "InventoryS3BucketDestination";
var _ISn = "InventorySchedule";
var _IT = "IsTruncated";
var _ITAO = "IntelligentTieringAndOperator";
var _ITAT = "IntelligentTieringAccessTier";
var _ITC = "IntelligentTieringConfiguration";
var _ITCL = "IntelligentTieringConfigurationList";
var _ITD = "IntelligentTieringDays";
var _ITF = "IntelligentTieringFilter";
var _ITI = "IntelligentTieringId";
var _ITS = "IntelligentTieringStatus";
var _IUS = "IfUnmodifiedSince";
var _In = "Initiator";
var _Ini = "Initiated";
var _JSON = "JSON";
var _JSONI = "JSONInput";
var _JSONO = "JSONOutput";
var _JSONT = "JSONType";
var _K = "Key";
var _KC = "KeyCount";
var _KI = "KeyId";
var _KM = "KeyMarker";
var _KMSC = "KMSContext";
var _KMSKI = "KMSKeyId";
var _KMSMKID = "KMSMasterKeyID";
var _KPE = "KeyPrefixEquals";
var _L = "Location";
var _LC = "LocationConstraint";
var _LE = "LoggingEnabled";
var _LEi = "LifecycleExpiration";
var _LFA = "LambdaFunctionArn";
var _LFC = "LambdaFunctionConfigurations";
var _LFCa = "LambdaFunctionConfiguration";
var _LI = "LocationInfo";
var _LM = "LastModified";
var _LNAS = "LocationNameAsString";
var _LP = "LocationPrefix";
var _LR = "LifecycleRule";
var _LRAO = "LifecycleRuleAndOperator";
var _LRF = "LifecycleRuleFilter";
var _LT = "LocationType";
var _M = "Marker";
var _MAO = "MetricsAndOperator";
var _MAS = "MaxAgeSeconds";
var _MB = "MaxBuckets";
var _MC = "MetricsConfiguration";
var _MCL = "MetricsConfigurationList";
var _MD = "MetadataDirective";
var _MDB = "MaxDirectoryBuckets";
var _MDf = "MfaDelete";
var _ME = "MetadataEntry";
var _MF = "MetricsFilter";
var _MFA = "MFA";
var _MFAD = "MFADelete";
var _MI = "MetricsId";
var _MK = "MaxKeys";
var _MKe = "MetadataKey";
var _MM = "MissingMeta";
var _MP = "MaxParts";
var _MS = "MetricsStatus";
var _MU = "MaxUploads";
var _MV = "MetadataValue";
var _Me = "Metrics";
var _Mes = "Message";
var _Mi = "Minutes";
var _Mo = "Mode";
var _N = "Name";
var _NC = "NotificationConfiguration";
var _NCF = "NotificationConfigurationFilter";
var _NCT = "NextContinuationToken";
var _ND = "NoncurrentDays";
var _NI = "NotificationId";
var _NKM = "NextKeyMarker";
var _NM = "NextMarker";
var _NNV = "NewerNoncurrentVersions";
var _NPNM = "NextPartNumberMarker";
var _NUIM = "NextUploadIdMarker";
var _NVE = "NoncurrentVersionExpiration";
var _NVIM = "NextVersionIdMarker";
var _NVT = "NoncurrentVersionTransitions";
var _NVTo = "NoncurrentVersionTransition";
var _O = "Owner";
var _OA = "ObjectAttributes";
var _OC = "OwnershipControls";
var _OCACL = "ObjectCannedACL";
var _OCR = "OwnershipControlsRule";
var _OF = "OptionalFields";
var _OI = "ObjectIdentifier";
var _OK = "ObjectKey";
var _OL = "OutputLocation";
var _OLC = "ObjectLockConfiguration";
var _OLE = "ObjectLockEnabled";
var _OLEFB = "ObjectLockEnabledForBucket";
var _OLLH = "ObjectLockLegalHold";
var _OLLHS = "ObjectLockLegalHoldStatus";
var _OLM = "ObjectLockMode";
var _OLR = "ObjectLockRetention";
var _OLRM = "ObjectLockRetentionMode";
var _OLRUD = "ObjectLockRetainUntilDate";
var _OLRb = "ObjectLockRule";
var _OO = "ObjectOwnership";
var _OOA = "OptionalObjectAttributes";
var _OOw = "OwnerOverride";
var _OP = "ObjectParts";
var _OS = "OutputSerialization";
var _OSGT = "ObjectSizeGreaterThan";
var _OSGTB = "ObjectSizeGreaterThanBytes";
var _OSLT = "ObjectSizeLessThan";
var _OSLTB = "ObjectSizeLessThanBytes";
var _OSV = "OutputSchemaVersion";
var _OSb = "ObjectSize";
var _OVI = "ObjectVersionId";
var _Ob = "Objects";
var _P = "Prefix";
var _PABC = "PublicAccessBlockConfiguration";
var _PC = "PartsCount";
var _PDS = "PartitionDateSource";
var _PI = "ParquetInput";
var _PN = "PartNumber";
var _PNM = "PartNumberMarker";
var _PP = "PartitionedPrefix";
var _Pa = "Payer";
var _Par = "Part";
var _Parq = "Parquet";
var _Part = "Parts";
var _Pe = "Permission";
var _Pr = "Protocol";
var _Pri = "Priority";
var _Q = "Quiet";
var _QA = "QueueArn";
var _QC = "QueueConfiguration";
var _QCu = "QueueConfigurations";
var _QCuo = "QuoteCharacter";
var _QEC = "QuoteEscapeCharacter";
var _QF = "QuoteFields";
var _Qu = "Queue";
var _R = "Range";
var _RART = "RedirectAllRequestsTo";
var _RC = "RequestCharged";
var _RCC = "ResponseCacheControl";
var _RCD = "ResponseContentDisposition";
var _RCE = "ResponseContentEncoding";
var _RCL = "ResponseContentLanguage";
var _RCT = "ResponseContentType";
var _RCe = "ReplicationConfiguration";
var _RD = "RecordDelimiter";
var _RE = "ResponseExpires";
var _RED = "RestoreExpiryDate";
var _RKKID = "ReplicaKmsKeyID";
var _RKPW = "ReplaceKeyPrefixWith";
var _RKW = "ReplaceKeyWith";
var _RM = "ReplicaModifications";
var _RMS = "ReplicaModificationsStatus";
var _ROP = "RestoreOutputPath";
var _RP = "RequestPayer";
var _RPB = "RestrictPublicBuckets";
var _RPC = "RequestPaymentConfiguration";
var _RPe = "RequestProgress";
var _RR = "RequestRoute";
var _RRAO = "ReplicationRuleAndOperator";
var _RRF = "ReplicationRuleFilter";
var _RRS = "ReplicationRuleStatus";
var _RRT = "RestoreRequestType";
var _RRe = "ReplicationRule";
var _RRes = "RestoreRequest";
var _RRo = "RoutingRules";
var _RRou = "RoutingRule";
var _RS = "ReplicationStatus";
var _RSe = "RestoreStatus";
var _RT = "RequestToken";
var _RTS = "ReplicationTimeStatus";
var _RTV = "ReplicationTimeValue";
var _RTe = "ReplicationTime";
var _RUD = "RetainUntilDate";
var _Re = "Restore";
var _Red = "Redirect";
var _Ro = "Role";
var _Ru = "Rule";
var _Rul = "Rules";
var _S = "Status";
var _SA = "StartAfter";
var _SAK = "SecretAccessKey";
var _SBD = "S3BucketDestination";
var _SC = "StorageClass";
var _SCA = "StorageClassAnalysis";
var _SCADE = "StorageClassAnalysisDataExport";
var _SCASV = "StorageClassAnalysisSchemaVersion";
var _SCt = "StatusCode";
var _SDV = "SkipDestinationValidation";
var _SK = "SSE-KMS";
var _SKEO = "SseKmsEncryptedObjects";
var _SKEOS = "SseKmsEncryptedObjectsStatus";
var _SKF = "S3KeyFilter";
var _SKe = "S3Key";
var _SL = "S3Location";
var _SM = "SessionMode";
var _SOCR = "SelectObjectContentRequest";
var _SP = "SelectParameters";
var _SPi = "SimplePrefix";
var _SR = "ScanRange";
var _SS = "SSE-S3";
var _SSC = "SourceSelectionCriteria";
var _SSE = "ServerSideEncryption";
var _SSEA = "SSEAlgorithm";
var _SSEBD = "ServerSideEncryptionByDefault";
var _SSEC = "ServerSideEncryptionConfiguration";
var _SSECA = "SSECustomerAlgorithm";
var _SSECK = "SSECustomerKey";
var _SSECKMD = "SSECustomerKeyMD5";
var _SSEKMS = "SSEKMS";
var _SSEKMSEC = "SSEKMSEncryptionContext";
var _SSEKMSKI = "SSEKMSKeyId";
var _SSER = "ServerSideEncryptionRule";
var _SSES = "SSES3";
var _ST = "SessionToken";
var _S_ = "S3";
var _Sc = "Schedule";
var _Se = "Setting";
var _Si = "Size";
var _St = "Start";
var _Su = "Suffix";
var _T = "Tagging";
var _TA = "TopicArn";
var _TB = "TargetBucket";
var _TC = "TagCount";
var _TCo = "TopicConfiguration";
var _TCop = "TopicConfigurations";
var _TD = "TaggingDirective";
var _TG = "TargetGrants";
var _TGa = "TargetGrant";
var _TOKF = "TargetObjectKeyFormat";
var _TP = "TargetPrefix";
var _TPC = "TotalPartsCount";
var _TS = "TagSet";
var _TSC = "TransitionStorageClass";
var _Ta = "Tag";
var _Tag = "Tags";
var _Ti = "Tier";
var _Tie = "Tierings";
var _Tier = "Tiering";
var _Tim = "Time";
var _To = "Token";
var _Top = "Topic";
var _Tr = "Transitions";
var _Tra = "Transition";
var _Ty = "Type";
var _U = "Upload";
var _UI = "UploadId";
var _UIM = "UploadIdMarker";
var _UM = "UserMetadata";
var _URI = "URI";
var _Up = "Uploads";
var _V = "Version";
var _VC = "VersionCount";
var _VCe = "VersioningConfiguration";
var _VI = "VersionId";
var _VIM = "VersionIdMarker";
var _Va = "Value";
var _Ve = "Versions";
var _WC = "WebsiteConfiguration";
var _WRL = "WebsiteRedirectLocation";
var _Y = "Years";
var _a = "analytics";
var _ac = "accelerate";
var _acl = "acl";
var _ar = "accept-ranges";
var _at = "attributes";
var _c = "cors";
var _cc = "cache-control";
var _cd = "content-disposition";
var _ce = "content-encoding";
var _cl = "content-language";
var _cl_ = "content-length";
var _cm = "content-md5";
var _cr = "content-range";
var _ct = "content-type";
var _ct_ = "continuation-token";
var _d = "delete";
var _de = "delimiter";
var _e = "expires";
var _en = "encryption";
var _et = "encoding-type";
var _eta = "etag";
var _ex = "expiresstring";
var _fo = "fetch-owner";
var _i = "id";
var _im = "if-match";
var _ims = "if-modified-since";
var _in = "inventory";
var _inm = "if-none-match";
var _it = "intelligent-tiering";
var _ius = "if-unmodified-since";
var _km = "key-marker";
var _l = "lifecycle";
var _lh = "legal-hold";
var _lm = "last-modified";
var _lo = "location";
var _log = "logging";
var _lt = "list-type";
var _m = "metrics";
var _ma = "marker";
var _mb = "max-buckets";
var _mdb = "max-directory-buckets";
var _me = "member";
var _mk = "max-keys";
var _mp = "max-parts";
var _mu = "max-uploads";
var _n = "notification";
var _oC = "ownershipControls";
var _ol = "object-lock";
var _p = "policy";
var _pAB = "publicAccessBlock";
var _pN = "partNumber";
var _pS = "policyStatus";
var _pnm = "part-number-marker";
var _pr = "prefix";
var _r = "replication";
var _rP = "requestPayment";
var _ra = "range";
var _rcc = "response-cache-control";
var _rcd = "response-content-disposition";
var _rce = "response-content-encoding";
var _rcl = "response-content-language";
var _rct = "response-content-type";
var _re = "response-expires";
var _res = "restore";
var _ret = "retention";
var _s = "session";
var _sa = "start-after";
var _se = "select";
var _st = "select-type";
var _t = "tagging";
var _to = "torrent";
var _u = "uploads";
var _uI = "uploadId";
var _uim = "upload-id-marker";
var _v = "versioning";
var _vI = "versionId";
var _ve = '<?xml version="1.0" encoding="UTF-8"?>';
var _ver = "versions";
var _vim = "version-id-marker";
var _w = "website";
var _x = "xsi:type";
var _xaa = "x-amz-acl";
var _xaad = "x-amz-abort-date";
var _xaapa = "x-amz-access-point-alias";
var _xaari = "x-amz-abort-rule-id";
var _xaas = "x-amz-archive-status";
var _xabgr = "x-amz-bypass-governance-retention";
var _xabln = "x-amz-bucket-location-name";
var _xablt = "x-amz-bucket-location-type";
var _xabole = "x-amz-bucket-object-lock-enabled";
var _xabolt = "x-amz-bucket-object-lock-token";
var _xabr = "x-amz-bucket-region";
var _xaca = "x-amz-checksum-algorithm";
var _xacc = "x-amz-checksum-crc32";
var _xacc_ = "x-amz-checksum-crc32c";
var _xacm = "x-amz-checksum-mode";
var _xacrsba = "x-amz-confirm-remove-self-bucket-access";
var _xacs = "x-amz-checksum-sha1";
var _xacs_ = "x-amz-checksum-sha256";
var _xacs__ = "x-amz-copy-source";
var _xacsim = "x-amz-copy-source-if-match";
var _xacsims = "x-amz-copy-source-if-modified-since";
var _xacsinm = "x-amz-copy-source-if-none-match";
var _xacsius = "x-amz-copy-source-if-unmodified-since";
var _xacsm = "x-amz-create-session-mode";
var _xacsr = "x-amz-copy-source-range";
var _xacssseca = "x-amz-copy-source-server-side-encryption-customer-algorithm";
var _xacssseck = "x-amz-copy-source-server-side-encryption-customer-key";
var _xacssseckm = "x-amz-copy-source-server-side-encryption-customer-key-md5";
var _xacsvi = "x-amz-copy-source-version-id";
var _xadm = "x-amz-delete-marker";
var _xae = "x-amz-expiration";
var _xaebo = "x-amz-expected-bucket-owner";
var _xafec = "x-amz-fwd-error-code";
var _xafem = "x-amz-fwd-error-message";
var _xafhar = "x-amz-fwd-header-accept-ranges";
var _xafhcc = "x-amz-fwd-header-cache-control";
var _xafhcd = "x-amz-fwd-header-content-disposition";
var _xafhce = "x-amz-fwd-header-content-encoding";
var _xafhcl = "x-amz-fwd-header-content-language";
var _xafhcr = "x-amz-fwd-header-content-range";
var _xafhct = "x-amz-fwd-header-content-type";
var _xafhe = "x-amz-fwd-header-etag";
var _xafhe_ = "x-amz-fwd-header-expires";
var _xafhlm = "x-amz-fwd-header-last-modified";
var _xafhxacc = "x-amz-fwd-header-x-amz-checksum-crc32";
var _xafhxacc_ = "x-amz-fwd-header-x-amz-checksum-crc32c";
var _xafhxacs = "x-amz-fwd-header-x-amz-checksum-sha1";
var _xafhxacs_ = "x-amz-fwd-header-x-amz-checksum-sha256";
var _xafhxadm = "x-amz-fwd-header-x-amz-delete-marker";
var _xafhxae = "x-amz-fwd-header-x-amz-expiration";
var _xafhxamm = "x-amz-fwd-header-x-amz-missing-meta";
var _xafhxampc = "x-amz-fwd-header-x-amz-mp-parts-count";
var _xafhxaollh = "x-amz-fwd-header-x-amz-object-lock-legal-hold";
var _xafhxaolm = "x-amz-fwd-header-x-amz-object-lock-mode";
var _xafhxaolrud = "x-amz-fwd-header-x-amz-object-lock-retain-until-date";
var _xafhxar = "x-amz-fwd-header-x-amz-restore";
var _xafhxarc = "x-amz-fwd-header-x-amz-request-charged";
var _xafhxars = "x-amz-fwd-header-x-amz-replication-status";
var _xafhxasc = "x-amz-fwd-header-x-amz-storage-class";
var _xafhxasse = "x-amz-fwd-header-x-amz-server-side-encryption";
var _xafhxasseakki = "x-amz-fwd-header-x-amz-server-side-encryption-aws-kms-key-id";
var _xafhxassebke = "x-amz-fwd-header-x-amz-server-side-encryption-bucket-key-enabled";
var _xafhxasseca = "x-amz-fwd-header-x-amz-server-side-encryption-customer-algorithm";
var _xafhxasseckm = "x-amz-fwd-header-x-amz-server-side-encryption-customer-key-md5";
var _xafhxatc = "x-amz-fwd-header-x-amz-tagging-count";
var _xafhxavi = "x-amz-fwd-header-x-amz-version-id";
var _xafs = "x-amz-fwd-status";
var _xagfc = "x-amz-grant-full-control";
var _xagr = "x-amz-grant-read";
var _xagra = "x-amz-grant-read-acp";
var _xagw = "x-amz-grant-write";
var _xagwa = "x-amz-grant-write-acp";
var _xam = "x-amz-mfa";
var _xamd = "x-amz-metadata-directive";
var _xamm = "x-amz-missing-meta";
var _xamp = "x-amz-max-parts";
var _xampc = "x-amz-mp-parts-count";
var _xaoa = "x-amz-object-attributes";
var _xaollh = "x-amz-object-lock-legal-hold";
var _xaolm = "x-amz-object-lock-mode";
var _xaolrud = "x-amz-object-lock-retain-until-date";
var _xaoo = "x-amz-object-ownership";
var _xaooa = "x-amz-optional-object-attributes";
var _xapnm = "x-amz-part-number-marker";
var _xar = "x-amz-restore";
var _xarc = "x-amz-request-charged";
var _xarop = "x-amz-restore-output-path";
var _xarp = "x-amz-request-payer";
var _xarr = "x-amz-request-route";
var _xars = "x-amz-replication-status";
var _xart = "x-amz-request-token";
var _xasc = "x-amz-storage-class";
var _xasca = "x-amz-sdk-checksum-algorithm";
var _xasdv = "x-amz-skip-destination-validation";
var _xasebo = "x-amz-source-expected-bucket-owner";
var _xasse = "x-amz-server-side-encryption";
var _xasseakki = "x-amz-server-side-encryption-aws-kms-key-id";
var _xassebke = "x-amz-server-side-encryption-bucket-key-enabled";
var _xassec = "x-amz-server-side-encryption-context";
var _xasseca = "x-amz-server-side-encryption-customer-algorithm";
var _xasseck = "x-amz-server-side-encryption-customer-key";
var _xasseckm = "x-amz-server-side-encryption-customer-key-md5";
var _xat = "x-amz-tagging";
var _xatc = "x-amz-tagging-count";
var _xatd = "x-amz-tagging-directive";
var _xavi = "x-amz-version-id";
var _xawrl = "x-amz-website-redirect-location";
var _xi = "x-id";

// node_modules/@aws-sdk/client-s3/dist-es/commands/CreateSessionCommand.js
var CreateSessionCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  DisableS3ExpressSessionAuth: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "CreateSession", {}).n("S3Client", "CreateSessionCommand").f(void 0, CreateSessionOutputFilterSensitiveLog).ser(se_CreateSessionCommand).de(de_CreateSessionCommand).build() {
};

// node_modules/@aws-sdk/client-s3/package.json
var package_default = {
  name: "@aws-sdk/client-s3",
  description: "AWS SDK for JavaScript S3 Client for Node.js, Browser and React Native",
  version: "3.637.0",
  scripts: {
    build: "concurrently 'yarn:build:cjs' 'yarn:build:es' 'yarn:build:types'",
    "build:cjs": "node ../../scripts/compilation/inline client-s3",
    "build:es": "tsc -p tsconfig.es.json",
    "build:include:deps": "lerna run --scope $npm_package_name --include-dependencies build",
    "build:types": "tsc -p tsconfig.types.json",
    "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
    clean: "rimraf ./dist-* && rimraf *.tsbuildinfo",
    "extract:docs": "api-extractor run --local",
    "generate:client": "node ../../scripts/generate-clients/single-service --solo s3",
    test: "yarn test:unit",
    "test:e2e": "yarn test:e2e:node && yarn test:e2e:browser",
    "test:e2e:browser": "ts-mocha test/**/*.browser.ispec.ts && karma start karma.conf.js",
    "test:e2e:node": "jest --c jest.config.e2e.js",
    "test:unit": "ts-mocha test/unit/**/*.spec.ts"
  },
  main: "./dist-cjs/index.js",
  types: "./dist-types/index.d.ts",
  module: "./dist-es/index.js",
  sideEffects: false,
  dependencies: {
    "@aws-crypto/sha1-browser": "5.2.0",
    "@aws-crypto/sha256-browser": "5.2.0",
    "@aws-crypto/sha256-js": "5.2.0",
    "@aws-sdk/client-sso-oidc": "3.637.0",
    "@aws-sdk/client-sts": "3.637.0",
    "@aws-sdk/core": "3.635.0",
    "@aws-sdk/credential-provider-node": "3.637.0",
    "@aws-sdk/middleware-bucket-endpoint": "3.620.0",
    "@aws-sdk/middleware-expect-continue": "3.620.0",
    "@aws-sdk/middleware-flexible-checksums": "3.620.0",
    "@aws-sdk/middleware-host-header": "3.620.0",
    "@aws-sdk/middleware-location-constraint": "3.609.0",
    "@aws-sdk/middleware-logger": "3.609.0",
    "@aws-sdk/middleware-recursion-detection": "3.620.0",
    "@aws-sdk/middleware-sdk-s3": "3.635.0",
    "@aws-sdk/middleware-ssec": "3.609.0",
    "@aws-sdk/middleware-user-agent": "3.637.0",
    "@aws-sdk/region-config-resolver": "3.614.0",
    "@aws-sdk/signature-v4-multi-region": "3.635.0",
    "@aws-sdk/types": "3.609.0",
    "@aws-sdk/util-endpoints": "3.637.0",
    "@aws-sdk/util-user-agent-browser": "3.609.0",
    "@aws-sdk/util-user-agent-node": "3.614.0",
    "@aws-sdk/xml-builder": "3.609.0",
    "@smithy/config-resolver": "^3.0.5",
    "@smithy/core": "^2.4.0",
    "@smithy/eventstream-serde-browser": "^3.0.6",
    "@smithy/eventstream-serde-config-resolver": "^3.0.3",
    "@smithy/eventstream-serde-node": "^3.0.5",
    "@smithy/fetch-http-handler": "^3.2.4",
    "@smithy/hash-blob-browser": "^3.1.2",
    "@smithy/hash-node": "^3.0.3",
    "@smithy/hash-stream-node": "^3.1.2",
    "@smithy/invalid-dependency": "^3.0.3",
    "@smithy/md5-js": "^3.0.3",
    "@smithy/middleware-content-length": "^3.0.5",
    "@smithy/middleware-endpoint": "^3.1.0",
    "@smithy/middleware-retry": "^3.0.15",
    "@smithy/middleware-serde": "^3.0.3",
    "@smithy/middleware-stack": "^3.0.3",
    "@smithy/node-config-provider": "^3.1.4",
    "@smithy/node-http-handler": "^3.1.4",
    "@smithy/protocol-http": "^4.1.0",
    "@smithy/smithy-client": "^3.2.0",
    "@smithy/types": "^3.3.0",
    "@smithy/url-parser": "^3.0.3",
    "@smithy/util-base64": "^3.0.0",
    "@smithy/util-body-length-browser": "^3.0.0",
    "@smithy/util-body-length-node": "^3.0.0",
    "@smithy/util-defaults-mode-browser": "^3.0.15",
    "@smithy/util-defaults-mode-node": "^3.0.15",
    "@smithy/util-endpoints": "^2.0.5",
    "@smithy/util-middleware": "^3.0.3",
    "@smithy/util-retry": "^3.0.3",
    "@smithy/util-stream": "^3.1.3",
    "@smithy/util-utf8": "^3.0.0",
    "@smithy/util-waiter": "^3.1.2",
    tslib: "^2.6.2"
  },
  devDependencies: {
    "@aws-sdk/signature-v4-crt": "3.635.0",
    "@tsconfig/node16": "16.1.3",
    "@types/chai": "^4.2.11",
    "@types/mocha": "^8.0.4",
    "@types/node": "^16.18.96",
    concurrently: "7.0.0",
    "downlevel-dts": "0.10.1",
    rimraf: "3.0.2",
    typescript: "~4.9.5"
  },
  engines: {
    node: ">=16.0.0"
  },
  typesVersions: {
    "<4.0": {
      "dist-types/*": [
        "dist-types/ts3.4/*"
      ]
    }
  },
  files: [
    "dist-*/**"
  ],
  author: {
    name: "AWS SDK for JavaScript Team",
    url: "https://aws.amazon.com/javascript/"
  },
  license: "Apache-2.0",
  browser: {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser"
  },
  "react-native": {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.native"
  },
  homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-s3",
  repository: {
    type: "git",
    url: "https://github.com/aws/aws-sdk-js-v3.git",
    directory: "clients/client-s3"
  }
};

// node_modules/@aws-crypto/sha1-browser/node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js
var fromUtf82 = (input) => new TextEncoder().encode(input);

// node_modules/@aws-crypto/sha1-browser/build/module/isEmptyData.js
function isEmptyData(data) {
  if (typeof data === "string") {
    return data.length === 0;
  }
  return data.byteLength === 0;
}

// node_modules/@aws-crypto/sha1-browser/build/module/constants.js
var SHA_1_HASH = {
  name: "SHA-1"
};
var SHA_1_HMAC_ALGO = {
  name: "HMAC",
  hash: SHA_1_HASH
};
var EMPTY_DATA_SHA_1 = new Uint8Array([218, 57, 163, 238, 94, 107, 75, 13, 50, 85, 191, 239, 149, 96, 24, 144, 175, 216, 7, 9]);

// node_modules/@aws-sdk/util-locate-window/dist-es/index.js
var fallbackWindow = {};
function locateWindow() {
  if (typeof window !== "undefined") {
    return window;
  } else if (typeof self !== "undefined") {
    return self;
  }
  return fallbackWindow;
}

// node_modules/@aws-crypto/sha1-browser/build/module/webCryptoSha1.js
var Sha1 = (
  /** @class */
  function() {
    function Sha13(secret) {
      this.toHash = new Uint8Array(0);
      if (secret !== void 0) {
        this.key = new Promise(function(resolve, reject) {
          locateWindow().crypto.subtle.importKey("raw", convertToBuffer(secret), SHA_1_HMAC_ALGO, false, ["sign"]).then(resolve, reject);
        });
        this.key.catch(function() {
        });
      }
    }
    Sha13.prototype.update = function(data) {
      if (isEmptyData(data)) {
        return;
      }
      var update = convertToBuffer(data);
      var typedArray = new Uint8Array(this.toHash.byteLength + update.byteLength);
      typedArray.set(this.toHash, 0);
      typedArray.set(update, this.toHash.byteLength);
      this.toHash = typedArray;
    };
    Sha13.prototype.digest = function() {
      var _this = this;
      if (this.key) {
        return this.key.then(function(key) {
          return locateWindow().crypto.subtle.sign(SHA_1_HMAC_ALGO, key, _this.toHash).then(function(data) {
            return new Uint8Array(data);
          });
        });
      }
      if (isEmptyData(this.toHash)) {
        return Promise.resolve(EMPTY_DATA_SHA_1);
      }
      return Promise.resolve().then(function() {
        return locateWindow().crypto.subtle.digest(SHA_1_HASH, _this.toHash);
      }).then(function(data) {
        return Promise.resolve(new Uint8Array(data));
      });
    };
    Sha13.prototype.reset = function() {
      this.toHash = new Uint8Array(0);
    };
    return Sha13;
  }()
);
function convertToBuffer(data) {
  if (typeof data === "string") {
    return fromUtf82(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
}

// node_modules/@aws-crypto/supports-web-crypto/build/module/supportsWebCrypto.js
var subtleCryptoMethods = ["decrypt", "digest", "encrypt", "exportKey", "generateKey", "importKey", "sign", "verify"];
function supportsWebCrypto(window2) {
  if (supportsSecureRandom(window2) && typeof window2.crypto.subtle === "object") {
    var subtle = window2.crypto.subtle;
    return supportsSubtleCrypto(subtle);
  }
  return false;
}
function supportsSecureRandom(window2) {
  if (typeof window2 === "object" && typeof window2.crypto === "object") {
    var getRandomValues2 = window2.crypto.getRandomValues;
    return typeof getRandomValues2 === "function";
  }
  return false;
}
function supportsSubtleCrypto(subtle) {
  return subtle && subtleCryptoMethods.every(function(methodName) {
    return typeof subtle[methodName] === "function";
  });
}

// node_modules/@aws-crypto/util/node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js
var fromUtf83 = (input) => new TextEncoder().encode(input);

// node_modules/@aws-crypto/util/build/module/convertToBuffer.js
var fromUtf84 = typeof Buffer !== "undefined" && Buffer.from ? function(input) {
  return Buffer.from(input, "utf8");
} : fromUtf83;
function convertToBuffer2(data) {
  if (data instanceof Uint8Array) return data;
  if (typeof data === "string") {
    return fromUtf84(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
}

// node_modules/@aws-crypto/util/build/module/isEmptyData.js
function isEmptyData2(data) {
  if (typeof data === "string") {
    return data.length === 0;
  }
  return data.byteLength === 0;
}

// node_modules/@aws-crypto/util/build/module/numToUint8.js
function numToUint8(num) {
  return new Uint8Array([(num & 4278190080) >> 24, (num & 16711680) >> 16, (num & 65280) >> 8, num & 255]);
}

// node_modules/@aws-crypto/util/build/module/uint32ArrayFrom.js
function uint32ArrayFrom(a_lookUpTable2) {
  if (!Uint32Array.from) {
    var return_array = new Uint32Array(a_lookUpTable2.length);
    var a_index = 0;
    while (a_index < a_lookUpTable2.length) {
      return_array[a_index] = a_lookUpTable2[a_index];
      a_index += 1;
    }
    return return_array;
  }
  return Uint32Array.from(a_lookUpTable2);
}

// node_modules/@aws-crypto/sha1-browser/build/module/crossPlatformSha1.js
var Sha12 = (
  /** @class */
  function() {
    function Sha13(secret) {
      if (supportsWebCrypto(locateWindow())) {
        this.hash = new Sha1(secret);
      } else {
        throw new Error("SHA1 not supported");
      }
    }
    Sha13.prototype.update = function(data, encoding) {
      this.hash.update(convertToBuffer2(data));
    };
    Sha13.prototype.digest = function() {
      return this.hash.digest();
    };
    Sha13.prototype.reset = function() {
      this.hash.reset();
    };
    return Sha13;
  }()
);

// node_modules/@aws-crypto/sha256-browser/build/module/constants.js
var SHA_256_HASH = {
  name: "SHA-256"
};
var SHA_256_HMAC_ALGO = {
  name: "HMAC",
  hash: SHA_256_HASH
};
var EMPTY_DATA_SHA_256 = new Uint8Array([227, 176, 196, 66, 152, 252, 28, 20, 154, 251, 244, 200, 153, 111, 185, 36, 39, 174, 65, 228, 100, 155, 147, 76, 164, 149, 153, 27, 120, 82, 184, 85]);

// node_modules/@aws-crypto/sha256-browser/build/module/webCryptoSha256.js
var Sha256 = (
  /** @class */
  function() {
    function Sha2564(secret) {
      this.toHash = new Uint8Array(0);
      this.secret = secret;
      this.reset();
    }
    Sha2564.prototype.update = function(data) {
      if (isEmptyData2(data)) {
        return;
      }
      var update = convertToBuffer2(data);
      var typedArray = new Uint8Array(this.toHash.byteLength + update.byteLength);
      typedArray.set(this.toHash, 0);
      typedArray.set(update, this.toHash.byteLength);
      this.toHash = typedArray;
    };
    Sha2564.prototype.digest = function() {
      var _this = this;
      if (this.key) {
        return this.key.then(function(key) {
          return locateWindow().crypto.subtle.sign(SHA_256_HMAC_ALGO, key, _this.toHash).then(function(data) {
            return new Uint8Array(data);
          });
        });
      }
      if (isEmptyData2(this.toHash)) {
        return Promise.resolve(EMPTY_DATA_SHA_256);
      }
      return Promise.resolve().then(function() {
        return locateWindow().crypto.subtle.digest(SHA_256_HASH, _this.toHash);
      }).then(function(data) {
        return Promise.resolve(new Uint8Array(data));
      });
    };
    Sha2564.prototype.reset = function() {
      var _this = this;
      this.toHash = new Uint8Array(0);
      if (this.secret && this.secret !== void 0) {
        this.key = new Promise(function(resolve, reject) {
          locateWindow().crypto.subtle.importKey("raw", convertToBuffer2(_this.secret), SHA_256_HMAC_ALGO, false, ["sign"]).then(resolve, reject);
        });
        this.key.catch(function() {
        });
      }
    };
    return Sha2564;
  }()
);

// node_modules/@aws-crypto/sha256-js/build/module/constants.js
var BLOCK_SIZE = 64;
var DIGEST_LENGTH = 32;
var KEY = new Uint32Array([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]);
var INIT = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
var MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;

// node_modules/@aws-crypto/sha256-js/build/module/RawSha256.js
var RawSha256 = (
  /** @class */
  function() {
    function RawSha2562() {
      this.state = Int32Array.from(INIT);
      this.temp = new Int32Array(64);
      this.buffer = new Uint8Array(64);
      this.bufferLength = 0;
      this.bytesHashed = 0;
      this.finished = false;
    }
    RawSha2562.prototype.update = function(data) {
      if (this.finished) {
        throw new Error("Attempted to update an already finished hash.");
      }
      var position = 0;
      var byteLength = data.byteLength;
      this.bytesHashed += byteLength;
      if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) {
        throw new Error("Cannot hash more than 2^53 - 1 bits");
      }
      while (byteLength > 0) {
        this.buffer[this.bufferLength++] = data[position++];
        byteLength--;
        if (this.bufferLength === BLOCK_SIZE) {
          this.hashBuffer();
          this.bufferLength = 0;
        }
      }
    };
    RawSha2562.prototype.digest = function() {
      if (!this.finished) {
        var bitsHashed = this.bytesHashed * 8;
        var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
        var undecoratedLength = this.bufferLength;
        bufferView.setUint8(this.bufferLength++, 128);
        if (undecoratedLength % BLOCK_SIZE >= BLOCK_SIZE - 8) {
          for (var i2 = this.bufferLength; i2 < BLOCK_SIZE; i2++) {
            bufferView.setUint8(i2, 0);
          }
          this.hashBuffer();
          this.bufferLength = 0;
        }
        for (var i2 = this.bufferLength; i2 < BLOCK_SIZE - 8; i2++) {
          bufferView.setUint8(i2, 0);
        }
        bufferView.setUint32(BLOCK_SIZE - 8, Math.floor(bitsHashed / 4294967296), true);
        bufferView.setUint32(BLOCK_SIZE - 4, bitsHashed);
        this.hashBuffer();
        this.finished = true;
      }
      var out = new Uint8Array(DIGEST_LENGTH);
      for (var i2 = 0; i2 < 8; i2++) {
        out[i2 * 4] = this.state[i2] >>> 24 & 255;
        out[i2 * 4 + 1] = this.state[i2] >>> 16 & 255;
        out[i2 * 4 + 2] = this.state[i2] >>> 8 & 255;
        out[i2 * 4 + 3] = this.state[i2] >>> 0 & 255;
      }
      return out;
    };
    RawSha2562.prototype.hashBuffer = function() {
      var _a2 = this, buffer = _a2.buffer, state = _a2.state;
      var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
      for (var i2 = 0; i2 < BLOCK_SIZE; i2++) {
        if (i2 < 16) {
          this.temp[i2] = (buffer[i2 * 4] & 255) << 24 | (buffer[i2 * 4 + 1] & 255) << 16 | (buffer[i2 * 4 + 2] & 255) << 8 | buffer[i2 * 4 + 3] & 255;
        } else {
          var u2 = this.temp[i2 - 2];
          var t1_1 = (u2 >>> 17 | u2 << 15) ^ (u2 >>> 19 | u2 << 13) ^ u2 >>> 10;
          u2 = this.temp[i2 - 15];
          var t2_1 = (u2 >>> 7 | u2 << 25) ^ (u2 >>> 18 | u2 << 14) ^ u2 >>> 3;
          this.temp[i2] = (t1_1 + this.temp[i2 - 7] | 0) + (t2_1 + this.temp[i2 - 16] | 0);
        }
        var t1 = (((state4 >>> 6 | state4 << 26) ^ (state4 >>> 11 | state4 << 21) ^ (state4 >>> 25 | state4 << 7)) + (state4 & state5 ^ ~state4 & state6) | 0) + (state7 + (KEY[i2] + this.temp[i2] | 0) | 0) | 0;
        var t2 = ((state0 >>> 2 | state0 << 30) ^ (state0 >>> 13 | state0 << 19) ^ (state0 >>> 22 | state0 << 10)) + (state0 & state1 ^ state0 & state2 ^ state1 & state2) | 0;
        state7 = state6;
        state6 = state5;
        state5 = state4;
        state4 = state3 + t1 | 0;
        state3 = state2;
        state2 = state1;
        state1 = state0;
        state0 = t1 + t2 | 0;
      }
      state[0] += state0;
      state[1] += state1;
      state[2] += state2;
      state[3] += state3;
      state[4] += state4;
      state[5] += state5;
      state[6] += state6;
      state[7] += state7;
    };
    return RawSha2562;
  }()
);

// node_modules/@aws-crypto/sha256-js/build/module/jsSha256.js
var Sha2562 = (
  /** @class */
  function() {
    function Sha2564(secret) {
      this.secret = secret;
      this.hash = new RawSha256();
      this.reset();
    }
    Sha2564.prototype.update = function(toHash) {
      if (isEmptyData2(toHash) || this.error) {
        return;
      }
      try {
        this.hash.update(convertToBuffer2(toHash));
      } catch (e2) {
        this.error = e2;
      }
    };
    Sha2564.prototype.digestSync = function() {
      if (this.error) {
        throw this.error;
      }
      if (this.outer) {
        if (!this.outer.finished) {
          this.outer.update(this.hash.digest());
        }
        return this.outer.digest();
      }
      return this.hash.digest();
    };
    Sha2564.prototype.digest = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a2) {
          return [2, this.digestSync()];
        });
      });
    };
    Sha2564.prototype.reset = function() {
      this.hash = new RawSha256();
      if (this.secret) {
        this.outer = new RawSha256();
        var inner = bufferFromSecret(this.secret);
        var outer = new Uint8Array(BLOCK_SIZE);
        outer.set(inner);
        for (var i2 = 0; i2 < BLOCK_SIZE; i2++) {
          inner[i2] ^= 54;
          outer[i2] ^= 92;
        }
        this.hash.update(inner);
        this.outer.update(outer);
        for (var i2 = 0; i2 < inner.byteLength; i2++) {
          inner[i2] = 0;
        }
      }
    };
    return Sha2564;
  }()
);
function bufferFromSecret(secret) {
  var input = convertToBuffer2(secret);
  if (input.byteLength > BLOCK_SIZE) {
    var bufferHash = new RawSha256();
    bufferHash.update(input);
    input = bufferHash.digest();
  }
  var buffer = new Uint8Array(BLOCK_SIZE);
  buffer.set(input);
  return buffer;
}

// node_modules/@aws-crypto/sha256-browser/build/module/crossPlatformSha256.js
var Sha2563 = (
  /** @class */
  function() {
    function Sha2564(secret) {
      if (supportsWebCrypto(locateWindow())) {
        this.hash = new Sha256(secret);
      } else {
        this.hash = new Sha2562(secret);
      }
    }
    Sha2564.prototype.update = function(data, encoding) {
      this.hash.update(convertToBuffer2(data));
    };
    Sha2564.prototype.digest = function() {
      return this.hash.digest();
    };
    Sha2564.prototype.reset = function() {
      this.hash.reset();
    };
    return Sha2564;
  }()
);

// node_modules/bowser/src/constants.js
var BROWSER_ALIASES_MAP = {
  "Amazon Silk": "amazon_silk",
  "Android Browser": "android",
  Bada: "bada",
  BlackBerry: "blackberry",
  Chrome: "chrome",
  Chromium: "chromium",
  Electron: "electron",
  Epiphany: "epiphany",
  Firefox: "firefox",
  Focus: "focus",
  Generic: "generic",
  "Google Search": "google_search",
  Googlebot: "googlebot",
  "Internet Explorer": "ie",
  "K-Meleon": "k_meleon",
  Maxthon: "maxthon",
  "Microsoft Edge": "edge",
  "MZ Browser": "mz",
  "NAVER Whale Browser": "naver",
  Opera: "opera",
  "Opera Coast": "opera_coast",
  PhantomJS: "phantomjs",
  Puffin: "puffin",
  QupZilla: "qupzilla",
  QQ: "qq",
  QQLite: "qqlite",
  Safari: "safari",
  Sailfish: "sailfish",
  "Samsung Internet for Android": "samsung_internet",
  SeaMonkey: "seamonkey",
  Sleipnir: "sleipnir",
  Swing: "swing",
  Tizen: "tizen",
  "UC Browser": "uc",
  Vivaldi: "vivaldi",
  "WebOS Browser": "webos",
  WeChat: "wechat",
  "Yandex Browser": "yandex",
  Roku: "roku"
};
var BROWSER_MAP = {
  amazon_silk: "Amazon Silk",
  android: "Android Browser",
  bada: "Bada",
  blackberry: "BlackBerry",
  chrome: "Chrome",
  chromium: "Chromium",
  electron: "Electron",
  epiphany: "Epiphany",
  firefox: "Firefox",
  focus: "Focus",
  generic: "Generic",
  googlebot: "Googlebot",
  google_search: "Google Search",
  ie: "Internet Explorer",
  k_meleon: "K-Meleon",
  maxthon: "Maxthon",
  edge: "Microsoft Edge",
  mz: "MZ Browser",
  naver: "NAVER Whale Browser",
  opera: "Opera",
  opera_coast: "Opera Coast",
  phantomjs: "PhantomJS",
  puffin: "Puffin",
  qupzilla: "QupZilla",
  qq: "QQ Browser",
  qqlite: "QQ Browser Lite",
  safari: "Safari",
  sailfish: "Sailfish",
  samsung_internet: "Samsung Internet for Android",
  seamonkey: "SeaMonkey",
  sleipnir: "Sleipnir",
  swing: "Swing",
  tizen: "Tizen",
  uc: "UC Browser",
  vivaldi: "Vivaldi",
  webos: "WebOS Browser",
  wechat: "WeChat",
  yandex: "Yandex Browser"
};
var PLATFORMS_MAP = {
  tablet: "tablet",
  mobile: "mobile",
  desktop: "desktop",
  tv: "tv"
};
var OS_MAP = {
  WindowsPhone: "Windows Phone",
  Windows: "Windows",
  MacOS: "macOS",
  iOS: "iOS",
  Android: "Android",
  WebOS: "WebOS",
  BlackBerry: "BlackBerry",
  Bada: "Bada",
  Tizen: "Tizen",
  Linux: "Linux",
  ChromeOS: "Chrome OS",
  PlayStation4: "PlayStation 4",
  Roku: "Roku"
};
var ENGINE_MAP = {
  EdgeHTML: "EdgeHTML",
  Blink: "Blink",
  Trident: "Trident",
  Presto: "Presto",
  Gecko: "Gecko",
  WebKit: "WebKit"
};

// node_modules/bowser/src/utils.js
var Utils = class _Utils {
  /**
   * Get first matched item for a string
   * @param {RegExp} regexp
   * @param {String} ua
   * @return {Array|{index: number, input: string}|*|boolean|string}
   */
  static getFirstMatch(regexp, ua) {
    const match = ua.match(regexp);
    return match && match.length > 0 && match[1] || "";
  }
  /**
   * Get second matched item for a string
   * @param regexp
   * @param {String} ua
   * @return {Array|{index: number, input: string}|*|boolean|string}
   */
  static getSecondMatch(regexp, ua) {
    const match = ua.match(regexp);
    return match && match.length > 1 && match[2] || "";
  }
  /**
   * Match a regexp and return a constant or undefined
   * @param {RegExp} regexp
   * @param {String} ua
   * @param {*} _const Any const that will be returned if regexp matches the string
   * @return {*}
   */
  static matchAndReturnConst(regexp, ua, _const) {
    if (regexp.test(ua)) {
      return _const;
    }
    return void 0;
  }
  static getWindowsVersionName(version) {
    switch (version) {
      case "NT":
        return "NT";
      case "XP":
        return "XP";
      case "NT 5.0":
        return "2000";
      case "NT 5.1":
        return "XP";
      case "NT 5.2":
        return "2003";
      case "NT 6.0":
        return "Vista";
      case "NT 6.1":
        return "7";
      case "NT 6.2":
        return "8";
      case "NT 6.3":
        return "8.1";
      case "NT 10.0":
        return "10";
      default:
        return void 0;
    }
  }
  /**
   * Get macOS version name
   *    10.5 - Leopard
   *    10.6 - Snow Leopard
   *    10.7 - Lion
   *    10.8 - Mountain Lion
   *    10.9 - Mavericks
   *    10.10 - Yosemite
   *    10.11 - El Capitan
   *    10.12 - Sierra
   *    10.13 - High Sierra
   *    10.14 - Mojave
   *    10.15 - Catalina
   *
   * @example
   *   getMacOSVersionName("10.14") // 'Mojave'
   *
   * @param  {string} version
   * @return {string} versionName
   */
  static getMacOSVersionName(version) {
    const v2 = version.split(".").splice(0, 2).map((s2) => parseInt(s2, 10) || 0);
    v2.push(0);
    if (v2[0] !== 10) return void 0;
    switch (v2[1]) {
      case 5:
        return "Leopard";
      case 6:
        return "Snow Leopard";
      case 7:
        return "Lion";
      case 8:
        return "Mountain Lion";
      case 9:
        return "Mavericks";
      case 10:
        return "Yosemite";
      case 11:
        return "El Capitan";
      case 12:
        return "Sierra";
      case 13:
        return "High Sierra";
      case 14:
        return "Mojave";
      case 15:
        return "Catalina";
      default:
        return void 0;
    }
  }
  /**
   * Get Android version name
   *    1.5 - Cupcake
   *    1.6 - Donut
   *    2.0 - Eclair
   *    2.1 - Eclair
   *    2.2 - Froyo
   *    2.x - Gingerbread
   *    3.x - Honeycomb
   *    4.0 - Ice Cream Sandwich
   *    4.1 - Jelly Bean
   *    4.4 - KitKat
   *    5.x - Lollipop
   *    6.x - Marshmallow
   *    7.x - Nougat
   *    8.x - Oreo
   *    9.x - Pie
   *
   * @example
   *   getAndroidVersionName("7.0") // 'Nougat'
   *
   * @param  {string} version
   * @return {string} versionName
   */
  static getAndroidVersionName(version) {
    const v2 = version.split(".").splice(0, 2).map((s2) => parseInt(s2, 10) || 0);
    v2.push(0);
    if (v2[0] === 1 && v2[1] < 5) return void 0;
    if (v2[0] === 1 && v2[1] < 6) return "Cupcake";
    if (v2[0] === 1 && v2[1] >= 6) return "Donut";
    if (v2[0] === 2 && v2[1] < 2) return "Eclair";
    if (v2[0] === 2 && v2[1] === 2) return "Froyo";
    if (v2[0] === 2 && v2[1] > 2) return "Gingerbread";
    if (v2[0] === 3) return "Honeycomb";
    if (v2[0] === 4 && v2[1] < 1) return "Ice Cream Sandwich";
    if (v2[0] === 4 && v2[1] < 4) return "Jelly Bean";
    if (v2[0] === 4 && v2[1] >= 4) return "KitKat";
    if (v2[0] === 5) return "Lollipop";
    if (v2[0] === 6) return "Marshmallow";
    if (v2[0] === 7) return "Nougat";
    if (v2[0] === 8) return "Oreo";
    if (v2[0] === 9) return "Pie";
    return void 0;
  }
  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  static getVersionPrecision(version) {
    return version.split(".").length;
  }
  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions('1.10.2.1',  '1.8.2.1.90')    // 1
   *   compareVersions('1.010.2.1', '1.09.2.1.90');  // 1
   *   compareVersions('1.10.2.1',  '1.10.2.1');     // 0
   *   compareVersions('1.10.2.1',  '1.0800.2');     // -1
   *   compareVersions('1.10.2.1',  '1.10',  true);  // 0
   *
   * @param {String} versionA versions versions to compare
   * @param {String} versionB versions versions to compare
   * @param {boolean} [isLoose] enable loose comparison
   * @return {Number} comparison result: -1 when versionA is lower,
   * 1 when versionA is bigger, 0 when both equal
   */
  /* eslint consistent-return: 1 */
  static compareVersions(versionA, versionB, isLoose = false) {
    const versionAPrecision = _Utils.getVersionPrecision(versionA);
    const versionBPrecision = _Utils.getVersionPrecision(versionB);
    let precision = Math.max(versionAPrecision, versionBPrecision);
    let lastPrecision = 0;
    const chunks = _Utils.map([versionA, versionB], (version) => {
      const delta = precision - _Utils.getVersionPrecision(version);
      const _version = version + new Array(delta + 1).join(".0");
      return _Utils.map(_version.split("."), (chunk) => new Array(20 - chunk.length).join("0") + chunk).reverse();
    });
    if (isLoose) {
      lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision);
    }
    precision -= 1;
    while (precision >= lastPrecision) {
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }
      if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === lastPrecision) {
          return 0;
        }
        precision -= 1;
      } else if (chunks[0][precision] < chunks[1][precision]) {
        return -1;
      }
    }
    return void 0;
  }
  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  static map(arr, iterator) {
    const result = [];
    let i2;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i2 = 0; i2 < arr.length; i2 += 1) {
      result.push(iterator(arr[i2]));
    }
    return result;
  }
  /**
   * Array::find polyfill
   *
   * @param  {Array} arr
   * @param  {Function} predicate
   * @return {Array}
   */
  static find(arr, predicate) {
    let i2;
    let l2;
    if (Array.prototype.find) {
      return Array.prototype.find.call(arr, predicate);
    }
    for (i2 = 0, l2 = arr.length; i2 < l2; i2 += 1) {
      const value = arr[i2];
      if (predicate(value, i2)) {
        return value;
      }
    }
    return void 0;
  }
  /**
   * Object::assign polyfill
   *
   * @param  {Object} obj
   * @param  {Object} ...objs
   * @return {Object}
   */
  static assign(obj, ...assigners) {
    const result = obj;
    let i2;
    let l2;
    if (Object.assign) {
      return Object.assign(obj, ...assigners);
    }
    for (i2 = 0, l2 = assigners.length; i2 < l2; i2 += 1) {
      const assigner = assigners[i2];
      if (typeof assigner === "object" && assigner !== null) {
        const keys = Object.keys(assigner);
        keys.forEach((key) => {
          result[key] = assigner[key];
        });
      }
    }
    return obj;
  }
  /**
   * Get short version/alias for a browser name
   *
   * @example
   *   getBrowserAlias('Microsoft Edge') // edge
   *
   * @param  {string} browserName
   * @return {string}
   */
  static getBrowserAlias(browserName) {
    return BROWSER_ALIASES_MAP[browserName];
  }
  /**
   * Get short version/alias for a browser name
   *
   * @example
   *   getBrowserAlias('edge') // Microsoft Edge
   *
   * @param  {string} browserAlias
   * @return {string}
   */
  static getBrowserTypeByAlias(browserAlias) {
    return BROWSER_MAP[browserAlias] || "";
  }
};

// node_modules/bowser/src/parser-browsers.js
var commonVersionIdentifier = /version\/(\d+(\.?_?\d+)+)/i;
var browsersList = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe(ua) {
      const browser = {
        name: "Googlebot"
      };
      const version = Utils.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  /* Opera < 13.0 */
  {
    test: [/opera/i],
    describe(ua) {
      const browser = {
        name: "Opera"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  /* Opera > 13.0 */
  {
    test: [/opr\/|opios/i],
    describe(ua) {
      const browser = {
        name: "Opera"
      };
      const version = Utils.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/SamsungBrowser/i],
    describe(ua) {
      const browser = {
        name: "Samsung Internet for Android"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/Whale/i],
    describe(ua) {
      const browser = {
        name: "NAVER Whale Browser"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/MZBrowser/i],
    describe(ua) {
      const browser = {
        name: "MZ Browser"
      };
      const version = Utils.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/focus/i],
    describe(ua) {
      const browser = {
        name: "Focus"
      };
      const version = Utils.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/swing/i],
    describe(ua) {
      const browser = {
        name: "Swing"
      };
      const version = Utils.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/coast/i],
    describe(ua) {
      const browser = {
        name: "Opera Coast"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/opt\/\d+(?:.?_?\d+)+/i],
    describe(ua) {
      const browser = {
        name: "Opera Touch"
      };
      const version = Utils.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/yabrowser/i],
    describe(ua) {
      const browser = {
        name: "Yandex Browser"
      };
      const version = Utils.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/ucbrowser/i],
    describe(ua) {
      const browser = {
        name: "UC Browser"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/Maxthon|mxios/i],
    describe(ua) {
      const browser = {
        name: "Maxthon"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/epiphany/i],
    describe(ua) {
      const browser = {
        name: "Epiphany"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/puffin/i],
    describe(ua) {
      const browser = {
        name: "Puffin"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/sleipnir/i],
    describe(ua) {
      const browser = {
        name: "Sleipnir"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/k-meleon/i],
    describe(ua) {
      const browser = {
        name: "K-Meleon"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/micromessenger/i],
    describe(ua) {
      const browser = {
        name: "WeChat"
      };
      const version = Utils.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/qqbrowser/i],
    describe(ua) {
      const browser = {
        name: /qqbrowserlite/i.test(ua) ? "QQ Browser Lite" : "QQ Browser"
      };
      const version = Utils.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/msie|trident/i],
    describe(ua) {
      const browser = {
        name: "Internet Explorer"
      };
      const version = Utils.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/\sedg\//i],
    describe(ua) {
      const browser = {
        name: "Microsoft Edge"
      };
      const version = Utils.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/edg([ea]|ios)/i],
    describe(ua) {
      const browser = {
        name: "Microsoft Edge"
      };
      const version = Utils.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/vivaldi/i],
    describe(ua) {
      const browser = {
        name: "Vivaldi"
      };
      const version = Utils.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/seamonkey/i],
    describe(ua) {
      const browser = {
        name: "SeaMonkey"
      };
      const version = Utils.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/sailfish/i],
    describe(ua) {
      const browser = {
        name: "Sailfish"
      };
      const version = Utils.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/silk/i],
    describe(ua) {
      const browser = {
        name: "Amazon Silk"
      };
      const version = Utils.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/phantom/i],
    describe(ua) {
      const browser = {
        name: "PhantomJS"
      };
      const version = Utils.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/slimerjs/i],
    describe(ua) {
      const browser = {
        name: "SlimerJS"
      };
      const version = Utils.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe(ua) {
      const browser = {
        name: "BlackBerry"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/(web|hpw)[o0]s/i],
    describe(ua) {
      const browser = {
        name: "WebOS Browser"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/bada/i],
    describe(ua) {
      const browser = {
        name: "Bada"
      };
      const version = Utils.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/tizen/i],
    describe(ua) {
      const browser = {
        name: "Tizen"
      };
      const version = Utils.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/qupzilla/i],
    describe(ua) {
      const browser = {
        name: "QupZilla"
      };
      const version = Utils.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/firefox|iceweasel|fxios/i],
    describe(ua) {
      const browser = {
        name: "Firefox"
      };
      const version = Utils.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/electron/i],
    describe(ua) {
      const browser = {
        name: "Electron"
      };
      const version = Utils.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/MiuiBrowser/i],
    describe(ua) {
      const browser = {
        name: "Miui"
      };
      const version = Utils.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/chromium/i],
    describe(ua) {
      const browser = {
        name: "Chromium"
      };
      const version = Utils.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/chrome|crios|crmo/i],
    describe(ua) {
      const browser = {
        name: "Chrome"
      };
      const version = Utils.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  {
    test: [/GSA/i],
    describe(ua) {
      const browser = {
        name: "Google Search"
      };
      const version = Utils.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  /* Android Browser */
  {
    test(parser) {
      const notLikeAndroid = !parser.test(/like android/i);
      const butAndroid = parser.test(/android/i);
      return notLikeAndroid && butAndroid;
    },
    describe(ua) {
      const browser = {
        name: "Android Browser"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  /* PlayStation 4 */
  {
    test: [/playstation 4/i],
    describe(ua) {
      const browser = {
        name: "PlayStation 4"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  /* Safari */
  {
    test: [/safari|applewebkit/i],
    describe(ua) {
      const browser = {
        name: "Safari"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser.version = version;
      }
      return browser;
    }
  },
  /* Something else */
  {
    test: [/.*/i],
    describe(ua) {
      const regexpWithoutDeviceSpec = /^(.*)\/(.*) /;
      const regexpWithDeviceSpec = /^(.*)\/(.*)[ \t]\((.*)/;
      const hasDeviceSpec = ua.search("\\(") !== -1;
      const regexp = hasDeviceSpec ? regexpWithDeviceSpec : regexpWithoutDeviceSpec;
      return {
        name: Utils.getFirstMatch(regexp, ua),
        version: Utils.getSecondMatch(regexp, ua)
      };
    }
  }
];
var parser_browsers_default = browsersList;

// node_modules/bowser/src/parser-os.js
var parser_os_default = [
  /* Roku */
  {
    test: [/Roku\/DVP/],
    describe(ua) {
      const version = Utils.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, ua);
      return {
        name: OS_MAP.Roku,
        version
      };
    }
  },
  /* Windows Phone */
  {
    test: [/windows phone/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.WindowsPhone,
        version
      };
    }
  },
  /* Windows */
  {
    test: [/windows /i],
    describe(ua) {
      const version = Utils.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, ua);
      const versionName = Utils.getWindowsVersionName(version);
      return {
        name: OS_MAP.Windows,
        version,
        versionName
      };
    }
  },
  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe(ua) {
      const result = {
        name: OS_MAP.iOS
      };
      const version = Utils.getSecondMatch(/(Version\/)(\d[\d.]+)/, ua);
      if (version) {
        result.version = version;
      }
      return result;
    }
  },
  /* macOS */
  {
    test: [/macintosh/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, ua).replace(/[_\s]/g, ".");
      const versionName = Utils.getMacOSVersionName(version);
      const os = {
        name: OS_MAP.MacOS,
        version
      };
      if (versionName) {
        os.versionName = versionName;
      }
      return os;
    }
  },
  /* iOS */
  {
    test: [/(ipod|iphone|ipad)/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, ua).replace(/[_\s]/g, ".");
      return {
        name: OS_MAP.iOS,
        version
      };
    }
  },
  /* Android */
  {
    test(parser) {
      const notLikeAndroid = !parser.test(/like android/i);
      const butAndroid = parser.test(/android/i);
      return notLikeAndroid && butAndroid;
    },
    describe(ua) {
      const version = Utils.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, ua);
      const versionName = Utils.getAndroidVersionName(version);
      const os = {
        name: OS_MAP.Android,
        version
      };
      if (versionName) {
        os.versionName = versionName;
      }
      return os;
    }
  },
  /* WebOS */
  {
    test: [/(web|hpw)[o0]s/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, ua);
      const os = {
        name: OS_MAP.WebOS
      };
      if (version && version.length) {
        os.version = version;
      }
      return os;
    }
  },
  /* BlackBerry */
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, ua) || Utils.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, ua) || Utils.getFirstMatch(/\bbb(\d+)/i, ua);
      return {
        name: OS_MAP.BlackBerry,
        version
      };
    }
  },
  /* Bada */
  {
    test: [/bada/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.Bada,
        version
      };
    }
  },
  /* Tizen */
  {
    test: [/tizen/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.Tizen,
        version
      };
    }
  },
  /* Linux */
  {
    test: [/linux/i],
    describe() {
      return {
        name: OS_MAP.Linux
      };
    }
  },
  /* Chrome OS */
  {
    test: [/CrOS/],
    describe() {
      return {
        name: OS_MAP.ChromeOS
      };
    }
  },
  /* Playstation 4 */
  {
    test: [/PlayStation 4/],
    describe(ua) {
      const version = Utils.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.PlayStation4,
        version
      };
    }
  }
];

// node_modules/bowser/src/parser-platforms.js
var parser_platforms_default = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe() {
      return {
        type: "bot",
        vendor: "Google"
      };
    }
  },
  /* Huawei */
  {
    test: [/huawei/i],
    describe(ua) {
      const model = Utils.getFirstMatch(/(can-l01)/i, ua) && "Nova";
      const platform = {
        type: PLATFORMS_MAP.mobile,
        vendor: "Huawei"
      };
      if (model) {
        platform.model = model;
      }
      return platform;
    }
  },
  /* Nexus Tablet */
  {
    test: [/nexus\s*(?:7|8|9|10).*/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Nexus"
      };
    }
  },
  /* iPad */
  {
    test: [/ipad/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Apple",
        model: "iPad"
      };
    }
  },
  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Apple",
        model: "iPad"
      };
    }
  },
  /* Amazon Kindle Fire */
  {
    test: [/kftt build/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Amazon",
        model: "Kindle Fire HD 7"
      };
    }
  },
  /* Another Amazon Tablet with Silk */
  {
    test: [/silk/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Amazon"
      };
    }
  },
  /* Tablet */
  {
    test: [/tablet(?! pc)/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet
      };
    }
  },
  /* iPod/iPhone */
  {
    test(parser) {
      const iDevice = parser.test(/ipod|iphone/i);
      const likeIDevice = parser.test(/like (ipod|iphone)/i);
      return iDevice && !likeIDevice;
    },
    describe(ua) {
      const model = Utils.getFirstMatch(/(ipod|iphone)/i, ua);
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: "Apple",
        model
      };
    }
  },
  /* Nexus Mobile */
  {
    test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: "Nexus"
      };
    }
  },
  /* Mobile */
  {
    test: [/[^-]mobi/i],
    describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* BlackBerry */
  {
    test(parser) {
      return parser.getBrowserName(true) === "blackberry";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: "BlackBerry"
      };
    }
  },
  /* Bada */
  {
    test(parser) {
      return parser.getBrowserName(true) === "bada";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* Windows Phone */
  {
    test(parser) {
      return parser.getBrowserName() === "windows phone";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: "Microsoft"
      };
    }
  },
  /* Android Tablet */
  {
    test(parser) {
      const osMajorVersion = Number(String(parser.getOSVersion()).split(".")[0]);
      return parser.getOSName(true) === "android" && osMajorVersion >= 3;
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tablet
      };
    }
  },
  /* Android Mobile */
  {
    test(parser) {
      return parser.getOSName(true) === "android";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* desktop */
  {
    test(parser) {
      return parser.getOSName(true) === "macos";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop,
        vendor: "Apple"
      };
    }
  },
  /* Windows */
  {
    test(parser) {
      return parser.getOSName(true) === "windows";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop
      };
    }
  },
  /* Linux */
  {
    test(parser) {
      return parser.getOSName(true) === "linux";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop
      };
    }
  },
  /* PlayStation 4 */
  {
    test(parser) {
      return parser.getOSName(true) === "playstation 4";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tv
      };
    }
  },
  /* Roku */
  {
    test(parser) {
      return parser.getOSName(true) === "roku";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tv
      };
    }
  }
];

// node_modules/bowser/src/parser-engines.js
var parser_engines_default = [
  /* EdgeHTML */
  {
    test(parser) {
      return parser.getBrowserName(true) === "microsoft edge";
    },
    describe(ua) {
      const isBlinkBased = /\sedg\//i.test(ua);
      if (isBlinkBased) {
        return {
          name: ENGINE_MAP.Blink
        };
      }
      const version = Utils.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, ua);
      return {
        name: ENGINE_MAP.EdgeHTML,
        version
      };
    }
  },
  /* Trident */
  {
    test: [/trident/i],
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Trident
      };
      const version = Utils.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        engine.version = version;
      }
      return engine;
    }
  },
  /* Presto */
  {
    test(parser) {
      return parser.test(/presto/i);
    },
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Presto
      };
      const version = Utils.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        engine.version = version;
      }
      return engine;
    }
  },
  /* Gecko */
  {
    test(parser) {
      const isGecko = parser.test(/gecko/i);
      const likeGecko = parser.test(/like gecko/i);
      return isGecko && !likeGecko;
    },
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Gecko
      };
      const version = Utils.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        engine.version = version;
      }
      return engine;
    }
  },
  /* Blink */
  {
    test: [/(apple)?webkit\/537\.36/i],
    describe() {
      return {
        name: ENGINE_MAP.Blink
      };
    }
  },
  /* WebKit */
  {
    test: [/(apple)?webkit/i],
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.WebKit
      };
      const version = Utils.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        engine.version = version;
      }
      return engine;
    }
  }
];

// node_modules/bowser/src/parser.js
var Parser = class {
  /**
   * Create instance of Parser
   *
   * @param {String} UA User-Agent string
   * @param {Boolean} [skipParsing=false] parser can skip parsing in purpose of performance
   * improvements if you need to make a more particular parsing
   * like {@link Parser#parseBrowser} or {@link Parser#parsePlatform}
   *
   * @throw {Error} in case of empty UA String
   *
   * @constructor
   */
  constructor(UA, skipParsing = false) {
    if (UA === void 0 || UA === null || UA === "") {
      throw new Error("UserAgent parameter can't be empty");
    }
    this._ua = UA;
    this.parsedResult = {};
    if (skipParsing !== true) {
      this.parse();
    }
  }
  /**
   * Get UserAgent string of current Parser instance
   * @return {String} User-Agent String of the current <Parser> object
   *
   * @public
   */
  getUA() {
    return this._ua;
  }
  /**
   * Test a UA string for a regexp
   * @param {RegExp} regex
   * @return {Boolean}
   */
  test(regex) {
    return regex.test(this._ua);
  }
  /**
   * Get parsed browser object
   * @return {Object}
   */
  parseBrowser() {
    this.parsedResult.browser = {};
    const browserDescriptor = Utils.find(parser_browsers_default, (_browser) => {
      if (typeof _browser.test === "function") {
        return _browser.test(this);
      }
      if (_browser.test instanceof Array) {
        return _browser.test.some((condition) => this.test(condition));
      }
      throw new Error("Browser's test function is not valid");
    });
    if (browserDescriptor) {
      this.parsedResult.browser = browserDescriptor.describe(this.getUA());
    }
    return this.parsedResult.browser;
  }
  /**
   * Get parsed browser object
   * @return {Object}
   *
   * @public
   */
  getBrowser() {
    if (this.parsedResult.browser) {
      return this.parsedResult.browser;
    }
    return this.parseBrowser();
  }
  /**
   * Get browser's name
   * @return {String} Browser's name or an empty string
   *
   * @public
   */
  getBrowserName(toLowerCase) {
    if (toLowerCase) {
      return String(this.getBrowser().name).toLowerCase() || "";
    }
    return this.getBrowser().name || "";
  }
  /**
   * Get browser's version
   * @return {String} version of browser
   *
   * @public
   */
  getBrowserVersion() {
    return this.getBrowser().version;
  }
  /**
   * Get OS
   * @return {Object}
   *
   * @example
   * this.getOS();
   * {
   *   name: 'macOS',
   *   version: '10.11.12'
   * }
   */
  getOS() {
    if (this.parsedResult.os) {
      return this.parsedResult.os;
    }
    return this.parseOS();
  }
  /**
   * Parse OS and save it to this.parsedResult.os
   * @return {*|{}}
   */
  parseOS() {
    this.parsedResult.os = {};
    const os = Utils.find(parser_os_default, (_os) => {
      if (typeof _os.test === "function") {
        return _os.test(this);
      }
      if (_os.test instanceof Array) {
        return _os.test.some((condition) => this.test(condition));
      }
      throw new Error("Browser's test function is not valid");
    });
    if (os) {
      this.parsedResult.os = os.describe(this.getUA());
    }
    return this.parsedResult.os;
  }
  /**
   * Get OS name
   * @param {Boolean} [toLowerCase] return lower-cased value
   * @return {String} name of the OS — macOS, Windows, Linux, etc.
   */
  getOSName(toLowerCase) {
    const {
      name
    } = this.getOS();
    if (toLowerCase) {
      return String(name).toLowerCase() || "";
    }
    return name || "";
  }
  /**
   * Get OS version
   * @return {String} full version with dots ('10.11.12', '5.6', etc)
   */
  getOSVersion() {
    return this.getOS().version;
  }
  /**
   * Get parsed platform
   * @return {{}}
   */
  getPlatform() {
    if (this.parsedResult.platform) {
      return this.parsedResult.platform;
    }
    return this.parsePlatform();
  }
  /**
   * Get platform name
   * @param {Boolean} [toLowerCase=false]
   * @return {*}
   */
  getPlatformType(toLowerCase = false) {
    const {
      type
    } = this.getPlatform();
    if (toLowerCase) {
      return String(type).toLowerCase() || "";
    }
    return type || "";
  }
  /**
   * Get parsed platform
   * @return {{}}
   */
  parsePlatform() {
    this.parsedResult.platform = {};
    const platform = Utils.find(parser_platforms_default, (_platform) => {
      if (typeof _platform.test === "function") {
        return _platform.test(this);
      }
      if (_platform.test instanceof Array) {
        return _platform.test.some((condition) => this.test(condition));
      }
      throw new Error("Browser's test function is not valid");
    });
    if (platform) {
      this.parsedResult.platform = platform.describe(this.getUA());
    }
    return this.parsedResult.platform;
  }
  /**
   * Get parsed engine
   * @return {{}}
   */
  getEngine() {
    if (this.parsedResult.engine) {
      return this.parsedResult.engine;
    }
    return this.parseEngine();
  }
  /**
   * Get engines's name
   * @return {String} Engines's name or an empty string
   *
   * @public
   */
  getEngineName(toLowerCase) {
    if (toLowerCase) {
      return String(this.getEngine().name).toLowerCase() || "";
    }
    return this.getEngine().name || "";
  }
  /**
   * Get parsed platform
   * @return {{}}
   */
  parseEngine() {
    this.parsedResult.engine = {};
    const engine = Utils.find(parser_engines_default, (_engine) => {
      if (typeof _engine.test === "function") {
        return _engine.test(this);
      }
      if (_engine.test instanceof Array) {
        return _engine.test.some((condition) => this.test(condition));
      }
      throw new Error("Browser's test function is not valid");
    });
    if (engine) {
      this.parsedResult.engine = engine.describe(this.getUA());
    }
    return this.parsedResult.engine;
  }
  /**
   * Parse full information about the browser
   * @returns {Parser}
   */
  parse() {
    this.parseBrowser();
    this.parseOS();
    this.parsePlatform();
    this.parseEngine();
    return this;
  }
  /**
   * Get parsed result
   * @return {ParsedResult}
   */
  getResult() {
    return Utils.assign({}, this.parsedResult);
  }
  /**
   * Check if parsed browser matches certain conditions
   *
   * @param {Object} checkTree It's one or two layered object,
   * which can include a platform or an OS on the first layer
   * and should have browsers specs on the bottom-laying layer
   *
   * @returns {Boolean|undefined} Whether the browser satisfies the set conditions or not.
   * Returns `undefined` when the browser is no described in the checkTree object.
   *
   * @example
   * const browser = Bowser.getParser(window.navigator.userAgent);
   * if (browser.satisfies({chrome: '>118.01.1322' }))
   * // or with os
   * if (browser.satisfies({windows: { chrome: '>118.01.1322' } }))
   * // or with platforms
   * if (browser.satisfies({desktop: { chrome: '>118.01.1322' } }))
   */
  satisfies(checkTree) {
    const platformsAndOSes = {};
    let platformsAndOSCounter = 0;
    const browsers = {};
    let browsersCounter = 0;
    const allDefinitions = Object.keys(checkTree);
    allDefinitions.forEach((key) => {
      const currentDefinition = checkTree[key];
      if (typeof currentDefinition === "string") {
        browsers[key] = currentDefinition;
        browsersCounter += 1;
      } else if (typeof currentDefinition === "object") {
        platformsAndOSes[key] = currentDefinition;
        platformsAndOSCounter += 1;
      }
    });
    if (platformsAndOSCounter > 0) {
      const platformsAndOSNames = Object.keys(platformsAndOSes);
      const OSMatchingDefinition = Utils.find(platformsAndOSNames, (name) => this.isOS(name));
      if (OSMatchingDefinition) {
        const osResult = this.satisfies(platformsAndOSes[OSMatchingDefinition]);
        if (osResult !== void 0) {
          return osResult;
        }
      }
      const platformMatchingDefinition = Utils.find(platformsAndOSNames, (name) => this.isPlatform(name));
      if (platformMatchingDefinition) {
        const platformResult = this.satisfies(platformsAndOSes[platformMatchingDefinition]);
        if (platformResult !== void 0) {
          return platformResult;
        }
      }
    }
    if (browsersCounter > 0) {
      const browserNames = Object.keys(browsers);
      const matchingDefinition = Utils.find(browserNames, (name) => this.isBrowser(name, true));
      if (matchingDefinition !== void 0) {
        return this.compareVersion(browsers[matchingDefinition]);
      }
    }
    return void 0;
  }
  /**
   * Check if the browser name equals the passed string
   * @param browserName The string to compare with the browser name
   * @param [includingAlias=false] The flag showing whether alias will be included into comparison
   * @returns {boolean}
   */
  isBrowser(browserName, includingAlias = false) {
    const defaultBrowserName = this.getBrowserName().toLowerCase();
    let browserNameLower = browserName.toLowerCase();
    const alias = Utils.getBrowserTypeByAlias(browserNameLower);
    if (includingAlias && alias) {
      browserNameLower = alias.toLowerCase();
    }
    return browserNameLower === defaultBrowserName;
  }
  compareVersion(version) {
    let expectedResults = [0];
    let comparableVersion = version;
    let isLoose = false;
    const currentBrowserVersion = this.getBrowserVersion();
    if (typeof currentBrowserVersion !== "string") {
      return void 0;
    }
    if (version[0] === ">" || version[0] === "<") {
      comparableVersion = version.substr(1);
      if (version[1] === "=") {
        isLoose = true;
        comparableVersion = version.substr(2);
      } else {
        expectedResults = [];
      }
      if (version[0] === ">") {
        expectedResults.push(1);
      } else {
        expectedResults.push(-1);
      }
    } else if (version[0] === "=") {
      comparableVersion = version.substr(1);
    } else if (version[0] === "~") {
      isLoose = true;
      comparableVersion = version.substr(1);
    }
    return expectedResults.indexOf(Utils.compareVersions(currentBrowserVersion, comparableVersion, isLoose)) > -1;
  }
  isOS(osName) {
    return this.getOSName(true) === String(osName).toLowerCase();
  }
  isPlatform(platformType) {
    return this.getPlatformType(true) === String(platformType).toLowerCase();
  }
  isEngine(engineName) {
    return this.getEngineName(true) === String(engineName).toLowerCase();
  }
  /**
   * Is anything? Check if the browser is called "anything",
   * the OS called "anything" or the platform called "anything"
   * @param {String} anything
   * @param [includingAlias=false] The flag showing whether alias will be included into comparison
   * @returns {Boolean}
   */
  is(anything, includingAlias = false) {
    return this.isBrowser(anything, includingAlias) || this.isOS(anything) || this.isPlatform(anything);
  }
  /**
   * Check if any of the given values satisfies this.is(anything)
   * @param {String[]} anythings
   * @returns {Boolean}
   */
  some(anythings = []) {
    return anythings.some((anything) => this.is(anything));
  }
};
var parser_default = Parser;

// node_modules/bowser/src/bowser.js
var Bowser = class {
  /**
   * Creates a {@link Parser} instance
   *
   * @param {String} UA UserAgent string
   * @param {Boolean} [skipParsing=false] Will make the Parser postpone parsing until you ask it
   * explicitly. Same as `skipParsing` for {@link Parser}.
   * @returns {Parser}
   * @throws {Error} when UA is not a String
   *
   * @example
   * const parser = Bowser.getParser(window.navigator.userAgent);
   * const result = parser.getResult();
   */
  static getParser(UA, skipParsing = false) {
    if (typeof UA !== "string") {
      throw new Error("UserAgent should be a string");
    }
    return new parser_default(UA, skipParsing);
  }
  /**
   * Creates a {@link Parser} instance and runs {@link Parser.getResult} immediately
   *
   * @param UA
   * @return {ParsedResult}
   *
   * @example
   * const result = Bowser.parse(window.navigator.userAgent);
   */
  static parse(UA) {
    return new parser_default(UA).getResult();
  }
  static get BROWSER_MAP() {
    return BROWSER_MAP;
  }
  static get ENGINE_MAP() {
    return ENGINE_MAP;
  }
  static get OS_MAP() {
    return OS_MAP;
  }
  static get PLATFORMS_MAP() {
    return PLATFORMS_MAP;
  }
};
var bowser_default = Bowser;

// node_modules/@aws-sdk/util-user-agent-browser/dist-es/index.js
var defaultUserAgent = ({
  serviceId,
  clientVersion
}) => () => __async(void 0, null, function* () {
  const parsedUA = typeof window !== "undefined" && window?.navigator?.userAgent ? bowser_default.parse(window.navigator.userAgent) : void 0;
  const sections = [["aws-sdk-js", clientVersion], ["ua", "2.0"], [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version], ["lang/js"], ["md/browser", `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`]];
  if (serviceId) {
    sections.push([`api/${serviceId}`, clientVersion]);
  }
  return sections;
});

// node_modules/@aws-crypto/crc32/build/module/aws_crc32.js
var AwsCrc32 = (
  /** @class */
  function() {
    function AwsCrc322() {
      this.crc32 = new Crc32();
    }
    AwsCrc322.prototype.update = function(toHash) {
      if (isEmptyData2(toHash)) return;
      this.crc32.update(convertToBuffer2(toHash));
    };
    AwsCrc322.prototype.digest = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a2) {
          return [2, numToUint8(this.crc32.digest())];
        });
      });
    };
    AwsCrc322.prototype.reset = function() {
      this.crc32 = new Crc32();
    };
    return AwsCrc322;
  }()
);

// node_modules/@aws-crypto/crc32/build/module/index.js
var Crc32 = (
  /** @class */
  function() {
    function Crc322() {
      this.checksum = 4294967295;
    }
    Crc322.prototype.update = function(data) {
      var e_1, _a2;
      try {
        for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
          var byte = data_1_1.value;
          this.checksum = this.checksum >>> 8 ^ lookupTable[(this.checksum ^ byte) & 255];
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (data_1_1 && !data_1_1.done && (_a2 = data_1.return)) _a2.call(data_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      return this;
    };
    Crc322.prototype.digest = function() {
      return (this.checksum ^ 4294967295) >>> 0;
    };
    return Crc322;
  }()
);
var a_lookUpTable = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918e3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
var lookupTable = uint32ArrayFrom(a_lookUpTable);

// node_modules/@smithy/eventstream-codec/dist-es/Int64.js
var Int642 = class _Int64 {
  constructor(bytes) {
    this.bytes = bytes;
    if (bytes.byteLength !== 8) {
      throw new Error("Int64 buffers must be exactly 8 bytes");
    }
  }
  static fromNumber(number) {
    if (number > 9223372036854776e3 || number < -9223372036854776e3) {
      throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
    }
    const bytes = new Uint8Array(8);
    for (let i2 = 7, remaining = Math.abs(Math.round(number)); i2 > -1 && remaining > 0; i2--, remaining /= 256) {
      bytes[i2] = remaining;
    }
    if (number < 0) {
      negate2(bytes);
    }
    return new _Int64(bytes);
  }
  valueOf() {
    const bytes = this.bytes.slice(0);
    const negative = bytes[0] & 128;
    if (negative) {
      negate2(bytes);
    }
    return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
  }
  toString() {
    return String(this.valueOf());
  }
};
function negate2(bytes) {
  for (let i2 = 0; i2 < 8; i2++) {
    bytes[i2] ^= 255;
  }
  for (let i2 = 7; i2 > -1; i2--) {
    bytes[i2]++;
    if (bytes[i2] !== 0) break;
  }
}

// node_modules/@smithy/eventstream-codec/dist-es/HeaderMarshaller.js
var HeaderMarshaller = class {
  constructor(toUtf82, fromUtf85) {
    this.toUtf8 = toUtf82;
    this.fromUtf8 = fromUtf85;
  }
  format(headers) {
    const chunks = [];
    for (const headerName of Object.keys(headers)) {
      const bytes = this.fromUtf8(headerName);
      chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
    }
    const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
    let position = 0;
    for (const chunk of chunks) {
      out.set(chunk, position);
      position += chunk.byteLength;
    }
    return out;
  }
  formatHeaderValue(header) {
    switch (header.type) {
      case "boolean":
        return Uint8Array.from([header.value ? 0 : 1]);
      case "byte":
        return Uint8Array.from([2, header.value]);
      case "short":
        const shortView = new DataView(new ArrayBuffer(3));
        shortView.setUint8(0, 3);
        shortView.setInt16(1, header.value, false);
        return new Uint8Array(shortView.buffer);
      case "integer":
        const intView = new DataView(new ArrayBuffer(5));
        intView.setUint8(0, 4);
        intView.setInt32(1, header.value, false);
        return new Uint8Array(intView.buffer);
      case "long":
        const longBytes = new Uint8Array(9);
        longBytes[0] = 5;
        longBytes.set(header.value.bytes, 1);
        return longBytes;
      case "binary":
        const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
        binView.setUint8(0, 6);
        binView.setUint16(1, header.value.byteLength, false);
        const binBytes = new Uint8Array(binView.buffer);
        binBytes.set(header.value, 3);
        return binBytes;
      case "string":
        const utf8Bytes = this.fromUtf8(header.value);
        const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
        strView.setUint8(0, 7);
        strView.setUint16(1, utf8Bytes.byteLength, false);
        const strBytes = new Uint8Array(strView.buffer);
        strBytes.set(utf8Bytes, 3);
        return strBytes;
      case "timestamp":
        const tsBytes = new Uint8Array(9);
        tsBytes[0] = 8;
        tsBytes.set(Int642.fromNumber(header.value.valueOf()).bytes, 1);
        return tsBytes;
      case "uuid":
        if (!UUID_PATTERN2.test(header.value)) {
          throw new Error(`Invalid UUID received: ${header.value}`);
        }
        const uuidBytes = new Uint8Array(17);
        uuidBytes[0] = 9;
        uuidBytes.set(fromHex(header.value.replace(/\-/g, "")), 1);
        return uuidBytes;
    }
  }
  parse(headers) {
    const out = {};
    let position = 0;
    while (position < headers.byteLength) {
      const nameLength = headers.getUint8(position++);
      const name = this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, nameLength));
      position += nameLength;
      switch (headers.getUint8(position++)) {
        case 0:
          out[name] = {
            type: BOOLEAN_TAG,
            value: true
          };
          break;
        case 1:
          out[name] = {
            type: BOOLEAN_TAG,
            value: false
          };
          break;
        case 2:
          out[name] = {
            type: BYTE_TAG,
            value: headers.getInt8(position++)
          };
          break;
        case 3:
          out[name] = {
            type: SHORT_TAG,
            value: headers.getInt16(position, false)
          };
          position += 2;
          break;
        case 4:
          out[name] = {
            type: INT_TAG,
            value: headers.getInt32(position, false)
          };
          position += 4;
          break;
        case 5:
          out[name] = {
            type: LONG_TAG,
            value: new Int642(new Uint8Array(headers.buffer, headers.byteOffset + position, 8))
          };
          position += 8;
          break;
        case 6:
          const binaryLength = headers.getUint16(position, false);
          position += 2;
          out[name] = {
            type: BINARY_TAG,
            value: new Uint8Array(headers.buffer, headers.byteOffset + position, binaryLength)
          };
          position += binaryLength;
          break;
        case 7:
          const stringLength = headers.getUint16(position, false);
          position += 2;
          out[name] = {
            type: STRING_TAG,
            value: this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, stringLength))
          };
          position += stringLength;
          break;
        case 8:
          out[name] = {
            type: TIMESTAMP_TAG,
            value: new Date(new Int642(new Uint8Array(headers.buffer, headers.byteOffset + position, 8)).valueOf())
          };
          position += 8;
          break;
        case 9:
          const uuidBytes = new Uint8Array(headers.buffer, headers.byteOffset + position, 16);
          position += 16;
          out[name] = {
            type: UUID_TAG,
            value: `${toHex(uuidBytes.subarray(0, 4))}-${toHex(uuidBytes.subarray(4, 6))}-${toHex(uuidBytes.subarray(6, 8))}-${toHex(uuidBytes.subarray(8, 10))}-${toHex(uuidBytes.subarray(10))}`
          };
          break;
        default:
          throw new Error(`Unrecognized header type tag`);
      }
    }
    return out;
  }
};
var HEADER_VALUE_TYPE2;
(function(HEADER_VALUE_TYPE3) {
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolTrue"] = 0] = "boolTrue";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolFalse"] = 1] = "boolFalse";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byte"] = 2] = "byte";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["short"] = 3] = "short";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["integer"] = 4] = "integer";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["long"] = 5] = "long";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byteArray"] = 6] = "byteArray";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["string"] = 7] = "string";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["timestamp"] = 8] = "timestamp";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["uuid"] = 9] = "uuid";
})(HEADER_VALUE_TYPE2 || (HEADER_VALUE_TYPE2 = {}));
var BOOLEAN_TAG = "boolean";
var BYTE_TAG = "byte";
var SHORT_TAG = "short";
var INT_TAG = "integer";
var LONG_TAG = "long";
var BINARY_TAG = "binary";
var STRING_TAG = "string";
var TIMESTAMP_TAG = "timestamp";
var UUID_TAG = "uuid";
var UUID_PATTERN2 = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

// node_modules/@smithy/eventstream-codec/dist-es/splitMessage.js
var PRELUDE_MEMBER_LENGTH = 4;
var PRELUDE_LENGTH = PRELUDE_MEMBER_LENGTH * 2;
var CHECKSUM_LENGTH = 4;
var MINIMUM_MESSAGE_LENGTH = PRELUDE_LENGTH + CHECKSUM_LENGTH * 2;
function splitMessage({
  byteLength,
  byteOffset,
  buffer
}) {
  if (byteLength < MINIMUM_MESSAGE_LENGTH) {
    throw new Error("Provided message too short to accommodate event stream message overhead");
  }
  const view = new DataView(buffer, byteOffset, byteLength);
  const messageLength = view.getUint32(0, false);
  if (byteLength !== messageLength) {
    throw new Error("Reported message length does not match received message length");
  }
  const headerLength = view.getUint32(PRELUDE_MEMBER_LENGTH, false);
  const expectedPreludeChecksum = view.getUint32(PRELUDE_LENGTH, false);
  const expectedMessageChecksum = view.getUint32(byteLength - CHECKSUM_LENGTH, false);
  const checksummer = new Crc32().update(new Uint8Array(buffer, byteOffset, PRELUDE_LENGTH));
  if (expectedPreludeChecksum !== checksummer.digest()) {
    throw new Error(`The prelude checksum specified in the message (${expectedPreludeChecksum}) does not match the calculated CRC32 checksum (${checksummer.digest()})`);
  }
  checksummer.update(new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH, byteLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH)));
  if (expectedMessageChecksum !== checksummer.digest()) {
    throw new Error(`The message checksum (${checksummer.digest()}) did not match the expected value of ${expectedMessageChecksum}`);
  }
  return {
    headers: new DataView(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH, headerLength),
    body: new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH + headerLength, messageLength - headerLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH + CHECKSUM_LENGTH))
  };
}

// node_modules/@smithy/eventstream-codec/dist-es/EventStreamCodec.js
var EventStreamCodec = class {
  constructor(toUtf82, fromUtf85) {
    this.headerMarshaller = new HeaderMarshaller(toUtf82, fromUtf85);
    this.messageBuffer = [];
    this.isEndOfStream = false;
  }
  feed(message) {
    this.messageBuffer.push(this.decode(message));
  }
  endOfStream() {
    this.isEndOfStream = true;
  }
  getMessage() {
    const message = this.messageBuffer.pop();
    const isEndOfStream = this.isEndOfStream;
    return {
      getMessage() {
        return message;
      },
      isEndOfStream() {
        return isEndOfStream;
      }
    };
  }
  getAvailableMessages() {
    const messages = this.messageBuffer;
    this.messageBuffer = [];
    const isEndOfStream = this.isEndOfStream;
    return {
      getMessages() {
        return messages;
      },
      isEndOfStream() {
        return isEndOfStream;
      }
    };
  }
  encode({
    headers: rawHeaders,
    body
  }) {
    const headers = this.headerMarshaller.format(rawHeaders);
    const length = headers.byteLength + body.byteLength + 16;
    const out = new Uint8Array(length);
    const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
    const checksum = new Crc32();
    view.setUint32(0, length, false);
    view.setUint32(4, headers.byteLength, false);
    view.setUint32(8, checksum.update(out.subarray(0, 8)).digest(), false);
    out.set(headers, 12);
    out.set(body, headers.byteLength + 12);
    view.setUint32(length - 4, checksum.update(out.subarray(8, length - 4)).digest(), false);
    return out;
  }
  decode(message) {
    const {
      headers,
      body
    } = splitMessage(message);
    return {
      headers: this.headerMarshaller.parse(headers),
      body
    };
  }
  formatHeaders(rawHeaders) {
    return this.headerMarshaller.format(rawHeaders);
  }
};

// node_modules/@smithy/eventstream-codec/dist-es/MessageDecoderStream.js
var MessageDecoderStream = class {
  constructor(options) {
    this.options = options;
  }
  [Symbol.asyncIterator]() {
    return this.asyncIterator();
  }
  asyncIterator() {
    return __asyncGenerator(this, null, function* () {
      try {
        for (var iter = __forAwait(this.options.inputStream), more, temp, error; more = !(temp = yield new __await(iter.next())).done; more = false) {
          const bytes = temp.value;
          const decoded = this.options.decoder.decode(bytes);
          yield decoded;
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && (yield new __await(temp.call(iter)));
        } finally {
          if (error)
            throw error[0];
        }
      }
    });
  }
};

// node_modules/@smithy/eventstream-codec/dist-es/MessageEncoderStream.js
var MessageEncoderStream = class {
  constructor(options) {
    this.options = options;
  }
  [Symbol.asyncIterator]() {
    return this.asyncIterator();
  }
  asyncIterator() {
    return __asyncGenerator(this, null, function* () {
      try {
        for (var iter = __forAwait(this.options.messageStream), more, temp, error; more = !(temp = yield new __await(iter.next())).done; more = false) {
          const msg = temp.value;
          const encoded = this.options.encoder.encode(msg);
          yield encoded;
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && (yield new __await(temp.call(iter)));
        } finally {
          if (error)
            throw error[0];
        }
      }
      if (this.options.includeEndFrame) {
        yield new Uint8Array(0);
      }
    });
  }
};

// node_modules/@smithy/eventstream-codec/dist-es/SmithyMessageDecoderStream.js
var SmithyMessageDecoderStream = class {
  constructor(options) {
    this.options = options;
  }
  [Symbol.asyncIterator]() {
    return this.asyncIterator();
  }
  asyncIterator() {
    return __asyncGenerator(this, null, function* () {
      try {
        for (var iter = __forAwait(this.options.messageStream), more, temp, error; more = !(temp = yield new __await(iter.next())).done; more = false) {
          const message = temp.value;
          const deserialized = yield new __await(this.options.deserializer(message));
          if (deserialized === void 0) continue;
          yield deserialized;
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && (yield new __await(temp.call(iter)));
        } finally {
          if (error)
            throw error[0];
        }
      }
    });
  }
};

// node_modules/@smithy/eventstream-codec/dist-es/SmithyMessageEncoderStream.js
var SmithyMessageEncoderStream = class {
  constructor(options) {
    this.options = options;
  }
  [Symbol.asyncIterator]() {
    return this.asyncIterator();
  }
  asyncIterator() {
    return __asyncGenerator(this, null, function* () {
      try {
        for (var iter = __forAwait(this.options.inputStream), more, temp, error; more = !(temp = yield new __await(iter.next())).done; more = false) {
          const chunk = temp.value;
          const payloadBuf = this.options.serializer(chunk);
          yield payloadBuf;
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && (yield new __await(temp.call(iter)));
        } finally {
          if (error)
            throw error[0];
        }
      }
    });
  }
};

// node_modules/@smithy/eventstream-serde-universal/dist-es/getChunkedStream.js
function getChunkedStream(source) {
  let currentMessageTotalLength = 0;
  let currentMessagePendingLength = 0;
  let currentMessage = null;
  let messageLengthBuffer = null;
  const allocateMessage = (size) => {
    if (typeof size !== "number") {
      throw new Error("Attempted to allocate an event message where size was not a number: " + size);
    }
    currentMessageTotalLength = size;
    currentMessagePendingLength = 4;
    currentMessage = new Uint8Array(size);
    const currentMessageView = new DataView(currentMessage.buffer);
    currentMessageView.setUint32(0, size, false);
  };
  const iterator = function() {
    return __asyncGenerator(this, null, function* () {
      const sourceIterator = source[Symbol.asyncIterator]();
      while (true) {
        const {
          value,
          done
        } = yield new __await(sourceIterator.next());
        if (done) {
          if (!currentMessageTotalLength) {
            return;
          } else if (currentMessageTotalLength === currentMessagePendingLength) {
            yield currentMessage;
          } else {
            throw new Error("Truncated event message received.");
          }
          return;
        }
        const chunkLength = value.length;
        let currentOffset = 0;
        while (currentOffset < chunkLength) {
          if (!currentMessage) {
            const bytesRemaining = chunkLength - currentOffset;
            if (!messageLengthBuffer) {
              messageLengthBuffer = new Uint8Array(4);
            }
            const numBytesForTotal = Math.min(4 - currentMessagePendingLength, bytesRemaining);
            messageLengthBuffer.set(value.slice(currentOffset, currentOffset + numBytesForTotal), currentMessagePendingLength);
            currentMessagePendingLength += numBytesForTotal;
            currentOffset += numBytesForTotal;
            if (currentMessagePendingLength < 4) {
              break;
            }
            allocateMessage(new DataView(messageLengthBuffer.buffer).getUint32(0, false));
            messageLengthBuffer = null;
          }
          const numBytesToWrite = Math.min(currentMessageTotalLength - currentMessagePendingLength, chunkLength - currentOffset);
          currentMessage.set(value.slice(currentOffset, currentOffset + numBytesToWrite), currentMessagePendingLength);
          currentMessagePendingLength += numBytesToWrite;
          currentOffset += numBytesToWrite;
          if (currentMessageTotalLength && currentMessageTotalLength === currentMessagePendingLength) {
            yield currentMessage;
            currentMessage = null;
            currentMessageTotalLength = 0;
            currentMessagePendingLength = 0;
          }
        }
      }
    });
  };
  return {
    [Symbol.asyncIterator]: iterator
  };
}

// node_modules/@smithy/eventstream-serde-universal/dist-es/getUnmarshalledStream.js
function getMessageUnmarshaller(deserializer, toUtf82) {
  return function(message) {
    return __async(this, null, function* () {
      const {
        value: messageType
      } = message.headers[":message-type"];
      if (messageType === "error") {
        const unmodeledError = new Error(message.headers[":error-message"].value || "UnknownError");
        unmodeledError.name = message.headers[":error-code"].value;
        throw unmodeledError;
      } else if (messageType === "exception") {
        const code = message.headers[":exception-type"].value;
        const exception = {
          [code]: message
        };
        const deserializedException = yield deserializer(exception);
        if (deserializedException.$unknown) {
          const error = new Error(toUtf82(message.body));
          error.name = code;
          throw error;
        }
        throw deserializedException[code];
      } else if (messageType === "event") {
        const event = {
          [message.headers[":event-type"].value]: message
        };
        const deserialized = yield deserializer(event);
        if (deserialized.$unknown) return;
        return deserialized;
      } else {
        throw Error(`Unrecognizable event type: ${message.headers[":event-type"].value}`);
      }
    });
  };
}

// node_modules/@smithy/eventstream-serde-universal/dist-es/EventStreamMarshaller.js
var EventStreamMarshaller = class {
  constructor({
    utf8Encoder,
    utf8Decoder
  }) {
    this.eventStreamCodec = new EventStreamCodec(utf8Encoder, utf8Decoder);
    this.utfEncoder = utf8Encoder;
  }
  deserialize(body, deserializer) {
    const inputStream = getChunkedStream(body);
    return new SmithyMessageDecoderStream({
      messageStream: new MessageDecoderStream({
        inputStream,
        decoder: this.eventStreamCodec
      }),
      deserializer: getMessageUnmarshaller(deserializer, this.utfEncoder)
    });
  }
  serialize(inputStream, serializer) {
    return new MessageEncoderStream({
      messageStream: new SmithyMessageEncoderStream({
        inputStream,
        serializer
      }),
      encoder: this.eventStreamCodec,
      includeEndFrame: true
    });
  }
};

// node_modules/@smithy/eventstream-serde-browser/dist-es/utils.js
var readableStreamtoIterable = (readableStream) => ({
  [Symbol.asyncIterator]: function() {
    return __asyncGenerator(this, null, function* () {
      const reader = readableStream.getReader();
      try {
        while (true) {
          const {
            done,
            value
          } = yield new __await(reader.read());
          if (done) return;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    });
  }
});
var iterableToReadableStream = (asyncIterable) => {
  const iterator = asyncIterable[Symbol.asyncIterator]();
  return new ReadableStream({
    pull(controller) {
      return __async(this, null, function* () {
        const {
          done,
          value
        } = yield iterator.next();
        if (done) {
          return controller.close();
        }
        controller.enqueue(value);
      });
    }
  });
};

// node_modules/@smithy/eventstream-serde-browser/dist-es/EventStreamMarshaller.js
var EventStreamMarshaller2 = class {
  constructor({
    utf8Encoder,
    utf8Decoder
  }) {
    this.universalMarshaller = new EventStreamMarshaller({
      utf8Decoder,
      utf8Encoder
    });
  }
  deserialize(body, deserializer) {
    const bodyIterable = isReadableStream2(body) ? readableStreamtoIterable(body) : body;
    return this.universalMarshaller.deserialize(bodyIterable, deserializer);
  }
  serialize(input, serializer) {
    const serialziedIterable = this.universalMarshaller.serialize(input, serializer);
    return typeof ReadableStream === "function" ? iterableToReadableStream(serialziedIterable) : serialziedIterable;
  }
};
var isReadableStream2 = (body) => typeof ReadableStream === "function" && body instanceof ReadableStream;

// node_modules/@smithy/eventstream-serde-browser/dist-es/provider.js
var eventStreamSerdeProvider = (options) => new EventStreamMarshaller2(options);

// node_modules/@smithy/chunked-blob-reader/dist-es/index.js
function blobReader(blob, onChunk, chunkSize = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("error", reject);
    fileReader.addEventListener("abort", reject);
    const size = blob.size;
    let totalBytesRead = 0;
    function read() {
      if (totalBytesRead >= size) {
        resolve();
        return;
      }
      fileReader.readAsArrayBuffer(blob.slice(totalBytesRead, Math.min(size, totalBytesRead + chunkSize)));
    }
    fileReader.addEventListener("load", (event) => {
      const result = event.target.result;
      onChunk(new Uint8Array(result));
      totalBytesRead += result.byteLength;
      read();
    });
    read();
  });
}

// node_modules/@smithy/hash-blob-browser/dist-es/index.js
var blobHasher = function blobHasher2(hashCtor, blob) {
  return __async(this, null, function* () {
    const hash = new hashCtor();
    yield blobReader(blob, (chunk) => {
      hash.update(chunk);
    });
    return hash.digest();
  });
};

// node_modules/@smithy/invalid-dependency/dist-es/invalidProvider.js
var invalidProvider = (message) => () => Promise.reject(message);

// node_modules/@smithy/md5-js/dist-es/constants.js
var BLOCK_SIZE2 = 64;
var DIGEST_LENGTH2 = 16;
var INIT2 = [1732584193, 4023233417, 2562383102, 271733878];

// node_modules/@smithy/md5-js/dist-es/index.js
var Md5 = class {
  constructor() {
    this.reset();
  }
  update(sourceData) {
    if (isEmptyData3(sourceData)) {
      return;
    } else if (this.finished) {
      throw new Error("Attempted to update an already finished hash.");
    }
    const data = convertToBuffer3(sourceData);
    let position = 0;
    let {
      byteLength
    } = data;
    this.bytesHashed += byteLength;
    while (byteLength > 0) {
      this.buffer.setUint8(this.bufferLength++, data[position++]);
      byteLength--;
      if (this.bufferLength === BLOCK_SIZE2) {
        this.hashBuffer();
        this.bufferLength = 0;
      }
    }
  }
  digest() {
    return __async(this, null, function* () {
      if (!this.finished) {
        const {
          buffer,
          bufferLength: undecoratedLength,
          bytesHashed
        } = this;
        const bitsHashed = bytesHashed * 8;
        buffer.setUint8(this.bufferLength++, 128);
        if (undecoratedLength % BLOCK_SIZE2 >= BLOCK_SIZE2 - 8) {
          for (let i2 = this.bufferLength; i2 < BLOCK_SIZE2; i2++) {
            buffer.setUint8(i2, 0);
          }
          this.hashBuffer();
          this.bufferLength = 0;
        }
        for (let i2 = this.bufferLength; i2 < BLOCK_SIZE2 - 8; i2++) {
          buffer.setUint8(i2, 0);
        }
        buffer.setUint32(BLOCK_SIZE2 - 8, bitsHashed >>> 0, true);
        buffer.setUint32(BLOCK_SIZE2 - 4, Math.floor(bitsHashed / 4294967296), true);
        this.hashBuffer();
        this.finished = true;
      }
      const out = new DataView(new ArrayBuffer(DIGEST_LENGTH2));
      for (let i2 = 0; i2 < 4; i2++) {
        out.setUint32(i2 * 4, this.state[i2], true);
      }
      return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
    });
  }
  hashBuffer() {
    const {
      buffer,
      state
    } = this;
    let a2 = state[0], b2 = state[1], c2 = state[2], d2 = state[3];
    a2 = ff(a2, b2, c2, d2, buffer.getUint32(0, true), 7, 3614090360);
    d2 = ff(d2, a2, b2, c2, buffer.getUint32(4, true), 12, 3905402710);
    c2 = ff(c2, d2, a2, b2, buffer.getUint32(8, true), 17, 606105819);
    b2 = ff(b2, c2, d2, a2, buffer.getUint32(12, true), 22, 3250441966);
    a2 = ff(a2, b2, c2, d2, buffer.getUint32(16, true), 7, 4118548399);
    d2 = ff(d2, a2, b2, c2, buffer.getUint32(20, true), 12, 1200080426);
    c2 = ff(c2, d2, a2, b2, buffer.getUint32(24, true), 17, 2821735955);
    b2 = ff(b2, c2, d2, a2, buffer.getUint32(28, true), 22, 4249261313);
    a2 = ff(a2, b2, c2, d2, buffer.getUint32(32, true), 7, 1770035416);
    d2 = ff(d2, a2, b2, c2, buffer.getUint32(36, true), 12, 2336552879);
    c2 = ff(c2, d2, a2, b2, buffer.getUint32(40, true), 17, 4294925233);
    b2 = ff(b2, c2, d2, a2, buffer.getUint32(44, true), 22, 2304563134);
    a2 = ff(a2, b2, c2, d2, buffer.getUint32(48, true), 7, 1804603682);
    d2 = ff(d2, a2, b2, c2, buffer.getUint32(52, true), 12, 4254626195);
    c2 = ff(c2, d2, a2, b2, buffer.getUint32(56, true), 17, 2792965006);
    b2 = ff(b2, c2, d2, a2, buffer.getUint32(60, true), 22, 1236535329);
    a2 = gg(a2, b2, c2, d2, buffer.getUint32(4, true), 5, 4129170786);
    d2 = gg(d2, a2, b2, c2, buffer.getUint32(24, true), 9, 3225465664);
    c2 = gg(c2, d2, a2, b2, buffer.getUint32(44, true), 14, 643717713);
    b2 = gg(b2, c2, d2, a2, buffer.getUint32(0, true), 20, 3921069994);
    a2 = gg(a2, b2, c2, d2, buffer.getUint32(20, true), 5, 3593408605);
    d2 = gg(d2, a2, b2, c2, buffer.getUint32(40, true), 9, 38016083);
    c2 = gg(c2, d2, a2, b2, buffer.getUint32(60, true), 14, 3634488961);
    b2 = gg(b2, c2, d2, a2, buffer.getUint32(16, true), 20, 3889429448);
    a2 = gg(a2, b2, c2, d2, buffer.getUint32(36, true), 5, 568446438);
    d2 = gg(d2, a2, b2, c2, buffer.getUint32(56, true), 9, 3275163606);
    c2 = gg(c2, d2, a2, b2, buffer.getUint32(12, true), 14, 4107603335);
    b2 = gg(b2, c2, d2, a2, buffer.getUint32(32, true), 20, 1163531501);
    a2 = gg(a2, b2, c2, d2, buffer.getUint32(52, true), 5, 2850285829);
    d2 = gg(d2, a2, b2, c2, buffer.getUint32(8, true), 9, 4243563512);
    c2 = gg(c2, d2, a2, b2, buffer.getUint32(28, true), 14, 1735328473);
    b2 = gg(b2, c2, d2, a2, buffer.getUint32(48, true), 20, 2368359562);
    a2 = hh(a2, b2, c2, d2, buffer.getUint32(20, true), 4, 4294588738);
    d2 = hh(d2, a2, b2, c2, buffer.getUint32(32, true), 11, 2272392833);
    c2 = hh(c2, d2, a2, b2, buffer.getUint32(44, true), 16, 1839030562);
    b2 = hh(b2, c2, d2, a2, buffer.getUint32(56, true), 23, 4259657740);
    a2 = hh(a2, b2, c2, d2, buffer.getUint32(4, true), 4, 2763975236);
    d2 = hh(d2, a2, b2, c2, buffer.getUint32(16, true), 11, 1272893353);
    c2 = hh(c2, d2, a2, b2, buffer.getUint32(28, true), 16, 4139469664);
    b2 = hh(b2, c2, d2, a2, buffer.getUint32(40, true), 23, 3200236656);
    a2 = hh(a2, b2, c2, d2, buffer.getUint32(52, true), 4, 681279174);
    d2 = hh(d2, a2, b2, c2, buffer.getUint32(0, true), 11, 3936430074);
    c2 = hh(c2, d2, a2, b2, buffer.getUint32(12, true), 16, 3572445317);
    b2 = hh(b2, c2, d2, a2, buffer.getUint32(24, true), 23, 76029189);
    a2 = hh(a2, b2, c2, d2, buffer.getUint32(36, true), 4, 3654602809);
    d2 = hh(d2, a2, b2, c2, buffer.getUint32(48, true), 11, 3873151461);
    c2 = hh(c2, d2, a2, b2, buffer.getUint32(60, true), 16, 530742520);
    b2 = hh(b2, c2, d2, a2, buffer.getUint32(8, true), 23, 3299628645);
    a2 = ii(a2, b2, c2, d2, buffer.getUint32(0, true), 6, 4096336452);
    d2 = ii(d2, a2, b2, c2, buffer.getUint32(28, true), 10, 1126891415);
    c2 = ii(c2, d2, a2, b2, buffer.getUint32(56, true), 15, 2878612391);
    b2 = ii(b2, c2, d2, a2, buffer.getUint32(20, true), 21, 4237533241);
    a2 = ii(a2, b2, c2, d2, buffer.getUint32(48, true), 6, 1700485571);
    d2 = ii(d2, a2, b2, c2, buffer.getUint32(12, true), 10, 2399980690);
    c2 = ii(c2, d2, a2, b2, buffer.getUint32(40, true), 15, 4293915773);
    b2 = ii(b2, c2, d2, a2, buffer.getUint32(4, true), 21, 2240044497);
    a2 = ii(a2, b2, c2, d2, buffer.getUint32(32, true), 6, 1873313359);
    d2 = ii(d2, a2, b2, c2, buffer.getUint32(60, true), 10, 4264355552);
    c2 = ii(c2, d2, a2, b2, buffer.getUint32(24, true), 15, 2734768916);
    b2 = ii(b2, c2, d2, a2, buffer.getUint32(52, true), 21, 1309151649);
    a2 = ii(a2, b2, c2, d2, buffer.getUint32(16, true), 6, 4149444226);
    d2 = ii(d2, a2, b2, c2, buffer.getUint32(44, true), 10, 3174756917);
    c2 = ii(c2, d2, a2, b2, buffer.getUint32(8, true), 15, 718787259);
    b2 = ii(b2, c2, d2, a2, buffer.getUint32(36, true), 21, 3951481745);
    state[0] = a2 + state[0] & 4294967295;
    state[1] = b2 + state[1] & 4294967295;
    state[2] = c2 + state[2] & 4294967295;
    state[3] = d2 + state[3] & 4294967295;
  }
  reset() {
    this.state = Uint32Array.from(INIT2);
    this.buffer = new DataView(new ArrayBuffer(BLOCK_SIZE2));
    this.bufferLength = 0;
    this.bytesHashed = 0;
    this.finished = false;
  }
};
function cmn(q2, a2, b2, x2, s2, t2) {
  a2 = (a2 + q2 & 4294967295) + (x2 + t2 & 4294967295) & 4294967295;
  return (a2 << s2 | a2 >>> 32 - s2) + b2 & 4294967295;
}
function ff(a2, b2, c2, d2, x2, s2, t2) {
  return cmn(b2 & c2 | ~b2 & d2, a2, b2, x2, s2, t2);
}
function gg(a2, b2, c2, d2, x2, s2, t2) {
  return cmn(b2 & d2 | c2 & ~d2, a2, b2, x2, s2, t2);
}
function hh(a2, b2, c2, d2, x2, s2, t2) {
  return cmn(b2 ^ c2 ^ d2, a2, b2, x2, s2, t2);
}
function ii(a2, b2, c2, d2, x2, s2, t2) {
  return cmn(c2 ^ (b2 | ~d2), a2, b2, x2, s2, t2);
}
function isEmptyData3(data) {
  if (typeof data === "string") {
    return data.length === 0;
  }
  return data.byteLength === 0;
}
function convertToBuffer3(data) {
  if (typeof data === "string") {
    return fromUtf8(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
}

// node_modules/@smithy/util-body-length-browser/dist-es/calculateBodyLength.js
var TEXT_ENCODER = typeof TextEncoder == "function" ? new TextEncoder() : null;
var calculateBodyLength = (body) => {
  if (typeof body === "string") {
    if (TEXT_ENCODER) {
      return TEXT_ENCODER.encode(body).byteLength;
    }
    let len = body.length;
    for (let i2 = len - 1; i2 >= 0; i2--) {
      const code = body.charCodeAt(i2);
      if (code > 127 && code <= 2047) len++;
      else if (code > 2047 && code <= 65535) len += 2;
      if (code >= 56320 && code <= 57343) i2--;
    }
    return len;
  } else if (typeof body.byteLength === "number") {
    return body.byteLength;
  } else if (typeof body.size === "number") {
    return body.size;
  }
  throw new Error(`Body Length computation failed for ${body}`);
};

// node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.shared.js
var getRuntimeConfig = (config) => {
  return {
    apiVersion: "2006-03-01",
    base64Decoder: config?.base64Decoder ?? fromBase64,
    base64Encoder: config?.base64Encoder ?? toBase64,
    disableHostPrefix: config?.disableHostPrefix ?? false,
    endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
    extensions: config?.extensions ?? [],
    getAwsChunkedEncodingStream: config?.getAwsChunkedEncodingStream ?? getAwsChunkedEncodingStream,
    httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultS3HttpAuthSchemeProvider,
    httpAuthSchemes: config?.httpAuthSchemes ?? [{
      schemeId: "aws.auth#sigv4",
      identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
      signer: new AwsSdkSigV4Signer()
    }, {
      schemeId: "aws.auth#sigv4a",
      identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
      signer: new AwsSdkSigV4ASigner()
    }],
    logger: config?.logger ?? new NoOpLogger(),
    sdkStreamMixin: config?.sdkStreamMixin ?? sdkStreamMixin,
    serviceId: config?.serviceId ?? "S3",
    signerConstructor: config?.signerConstructor ?? SignatureV4MultiRegion,
    signingEscapePath: config?.signingEscapePath ?? false,
    urlParser: config?.urlParser ?? parseUrl,
    useArnRegion: config?.useArnRegion ?? false,
    utf8Decoder: config?.utf8Decoder ?? fromUtf8,
    utf8Encoder: config?.utf8Encoder ?? toUtf8
  };
};

// node_modules/@smithy/util-defaults-mode-browser/dist-es/constants.js
var DEFAULTS_MODE_OPTIONS = ["in-region", "cross-region", "mobile", "standard", "legacy"];

// node_modules/@smithy/util-defaults-mode-browser/dist-es/resolveDefaultsModeConfig.js
var resolveDefaultsModeConfig = ({
  defaultsMode
} = {}) => memoize(() => __async(void 0, null, function* () {
  const mode = typeof defaultsMode === "function" ? yield defaultsMode() : defaultsMode;
  switch (mode?.toLowerCase()) {
    case "auto":
      return Promise.resolve(isMobileBrowser() ? "mobile" : "standard");
    case "mobile":
    case "in-region":
    case "cross-region":
    case "standard":
    case "legacy":
      return Promise.resolve(mode?.toLocaleLowerCase());
    case void 0:
      return Promise.resolve("legacy");
    default:
      throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
  }
}));
var isMobileBrowser = () => {
  const parsedUA = typeof window !== "undefined" && window?.navigator?.userAgent ? bowser_default.parse(window.navigator.userAgent) : void 0;
  const platform = parsedUA?.platform?.type;
  return platform === "tablet" || platform === "mobile";
};

// node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.browser.js
var getRuntimeConfig2 = (config) => {
  const defaultsMode = resolveDefaultsModeConfig(config);
  const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
  const clientSharedValues = getRuntimeConfig(config);
  return __spreadProps(__spreadValues(__spreadValues({}, clientSharedValues), config), {
    runtime: "browser",
    defaultsMode,
    bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
    credentialDefaultProvider: config?.credentialDefaultProvider ?? ((_) => () => Promise.reject(new Error("Credential is missing"))),
    defaultUserAgentProvider: config?.defaultUserAgentProvider ?? defaultUserAgent({
      serviceId: clientSharedValues.serviceId,
      clientVersion: package_default.version
    }),
    eventStreamSerdeProvider: config?.eventStreamSerdeProvider ?? eventStreamSerdeProvider,
    maxAttempts: config?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    md5: config?.md5 ?? Md5,
    region: config?.region ?? invalidProvider("Region is missing"),
    requestHandler: FetchHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
    retryMode: config?.retryMode ?? (() => __async(void 0, null, function* () {
      return (yield defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE;
    })),
    sha1: config?.sha1 ?? Sha12,
    sha256: config?.sha256 ?? Sha2563,
    streamCollector: config?.streamCollector ?? streamCollector,
    streamHasher: config?.streamHasher ?? blobHasher,
    useDualstackEndpoint: config?.useDualstackEndpoint ?? (() => Promise.resolve(DEFAULT_USE_DUALSTACK_ENDPOINT)),
    useFipsEndpoint: config?.useFipsEndpoint ?? (() => Promise.resolve(DEFAULT_USE_FIPS_ENDPOINT))
  });
};

// node_modules/@aws-sdk/region-config-resolver/dist-es/extensions/index.js
var getAwsRegionExtensionConfiguration = (runtimeConfig) => {
  let runtimeConfigRegion = () => __async(void 0, null, function* () {
    if (runtimeConfig.region === void 0) {
      throw new Error("Region is missing from runtimeConfig");
    }
    const region = runtimeConfig.region;
    if (typeof region === "string") {
      return region;
    }
    return region();
  });
  return {
    setRegion(region) {
      runtimeConfigRegion = region;
    },
    region() {
      return runtimeConfigRegion;
    }
  };
};
var resolveAwsRegionExtensionConfiguration = (awsRegionExtensionConfiguration) => {
  return {
    region: awsRegionExtensionConfiguration.region()
  };
};

// node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
  const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
  let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
  let _credentials = runtimeConfig.credentials;
  return {
    setHttpAuthScheme(httpAuthScheme) {
      const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
      if (index === -1) {
        _httpAuthSchemes.push(httpAuthScheme);
      } else {
        _httpAuthSchemes.splice(index, 1, httpAuthScheme);
      }
    },
    httpAuthSchemes() {
      return _httpAuthSchemes;
    },
    setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
      _httpAuthSchemeProvider = httpAuthSchemeProvider;
    },
    httpAuthSchemeProvider() {
      return _httpAuthSchemeProvider;
    },
    setCredentials(credentials) {
      _credentials = credentials;
    },
    credentials() {
      return _credentials;
    }
  };
};
var resolveHttpAuthRuntimeConfig = (config) => {
  return {
    httpAuthSchemes: config.httpAuthSchemes(),
    httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
    credentials: config.credentials()
  };
};

// node_modules/@aws-sdk/client-s3/dist-es/runtimeExtensions.js
var asPartial = (t2) => t2;
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
  const extensionConfiguration = __spreadValues(__spreadValues(__spreadValues(__spreadValues({}, asPartial(getAwsRegionExtensionConfiguration(runtimeConfig))), asPartial(getDefaultExtensionConfiguration(runtimeConfig))), asPartial(getHttpHandlerExtensionConfiguration(runtimeConfig))), asPartial(getHttpAuthExtensionConfiguration(runtimeConfig)));
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, runtimeConfig), resolveAwsRegionExtensionConfiguration(extensionConfiguration)), resolveDefaultRuntimeConfig(extensionConfiguration)), resolveHttpHandlerRuntimeConfig(extensionConfiguration)), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

// node_modules/@aws-sdk/client-s3/dist-es/S3Client.js
var S3Client = class extends Client {
  constructor(...[configuration]) {
    const _config_0 = getRuntimeConfig2(configuration || {});
    const _config_1 = resolveClientEndpointParameters(_config_0);
    const _config_2 = resolveUserAgentConfig(_config_1);
    const _config_3 = resolveRetryConfig(_config_2);
    const _config_4 = resolveRegionConfig(_config_3);
    const _config_5 = resolveHostHeaderConfig(_config_4);
    const _config_6 = resolveEndpointConfig(_config_5);
    const _config_7 = resolveEventStreamSerdeConfig(_config_6);
    const _config_8 = resolveHttpAuthSchemeConfig(_config_7);
    const _config_9 = resolveS3Config(_config_8, {
      session: [() => this, CreateSessionCommand]
    });
    const _config_10 = resolveRuntimeExtensions(_config_9, configuration?.extensions || []);
    super(_config_10);
    this.config = _config_10;
    this.middlewareStack.use(getUserAgentPlugin(this.config));
    this.middlewareStack.use(getRetryPlugin(this.config));
    this.middlewareStack.use(getContentLengthPlugin(this.config));
    this.middlewareStack.use(getHostHeaderPlugin(this.config));
    this.middlewareStack.use(getLoggerPlugin(this.config));
    this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
    this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
      httpAuthSchemeParametersProvider: defaultS3HttpAuthSchemeParametersProvider,
      identityProviderConfigProvider: (config) => __async(this, null, function* () {
        return new DefaultIdentityProviderConfig({
          "aws.auth#sigv4": config.credentials,
          "aws.auth#sigv4a": config.credentials
        });
      })
    }));
    this.middlewareStack.use(getHttpSigningPlugin(this.config));
    this.middlewareStack.use(getValidateBucketNamePlugin(this.config));
    this.middlewareStack.use(getAddExpectContinuePlugin(this.config));
    this.middlewareStack.use(getRegionRedirectMiddlewarePlugin(this.config));
    this.middlewareStack.use(getS3ExpressPlugin(this.config));
    this.middlewareStack.use(getS3ExpressHttpSigningPlugin(this.config));
  }
  destroy() {
    super.destroy();
  }
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/AbortMultipartUploadCommand.js
var AbortMultipartUploadCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "AbortMultipartUpload", {}).n("S3Client", "AbortMultipartUploadCommand").f(void 0, void 0).ser(se_AbortMultipartUploadCommand).de(de_AbortMultipartUploadCommand).build() {
};

// node_modules/@aws-sdk/middleware-ssec/dist-es/index.js
function ssecMiddleware(options) {
  return (next) => (args) => __async(this, null, function* () {
    const input = __spreadValues({}, args.input);
    const properties = [{
      target: "SSECustomerKey",
      hash: "SSECustomerKeyMD5"
    }, {
      target: "CopySourceSSECustomerKey",
      hash: "CopySourceSSECustomerKeyMD5"
    }];
    for (const prop of properties) {
      const value = input[prop.target];
      if (value) {
        let valueForHash;
        if (typeof value === "string") {
          if (isValidBase64EncodedSSECustomerKey(value, options)) {
            valueForHash = options.base64Decoder(value);
          } else {
            valueForHash = options.utf8Decoder(value);
            input[prop.target] = options.base64Encoder(valueForHash);
          }
        } else {
          valueForHash = ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value);
          input[prop.target] = options.base64Encoder(valueForHash);
        }
        const hash = new options.md5();
        hash.update(valueForHash);
        input[prop.hash] = options.base64Encoder(yield hash.digest());
      }
    }
    return next(__spreadProps(__spreadValues({}, args), {
      input
    }));
  });
}
var ssecMiddlewareOptions = {
  name: "ssecMiddleware",
  step: "initialize",
  tags: ["SSE"],
  override: true
};
var getSsecPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.add(ssecMiddleware(config), ssecMiddlewareOptions);
  }
});
function isValidBase64EncodedSSECustomerKey(str, options) {
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!base64Regex.test(str)) return false;
  try {
    const decodedBytes = options.base64Decoder(str);
    return decodedBytes.length === 32;
  } catch {
    return false;
  }
}

// node_modules/@aws-sdk/client-s3/dist-es/commands/CompleteMultipartUploadCommand.js
var CompleteMultipartUploadCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "CompleteMultipartUpload", {}).n("S3Client", "CompleteMultipartUploadCommand").f(CompleteMultipartUploadRequestFilterSensitiveLog, CompleteMultipartUploadOutputFilterSensitiveLog).ser(se_CompleteMultipartUploadCommand).de(de_CompleteMultipartUploadCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/CopyObjectCommand.js
var CopyObjectCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  DisableS3ExpressSessionAuth: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  },
  CopySource: {
    type: "contextParams",
    name: "CopySource"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "CopyObject", {}).n("S3Client", "CopyObjectCommand").f(CopyObjectRequestFilterSensitiveLog, CopyObjectOutputFilterSensitiveLog).ser(se_CopyObjectCommand).de(de_CopyObjectCommand).build() {
};

// node_modules/@aws-sdk/middleware-location-constraint/dist-es/index.js
function locationConstraintMiddleware(options) {
  return (next) => (args) => __async(this, null, function* () {
    const {
      CreateBucketConfiguration
    } = args.input;
    const region = yield options.region();
    if (!CreateBucketConfiguration?.LocationConstraint && !CreateBucketConfiguration?.Location) {
      args = __spreadProps(__spreadValues({}, args), {
        input: __spreadProps(__spreadValues({}, args.input), {
          CreateBucketConfiguration: region === "us-east-1" ? void 0 : {
            LocationConstraint: region
          }
        })
      });
    }
    return next(args);
  });
}
var locationConstraintMiddlewareOptions = {
  step: "initialize",
  tags: ["LOCATION_CONSTRAINT", "CREATE_BUCKET_CONFIGURATION"],
  name: "locationConstraintMiddleware",
  override: true
};
var getLocationConstraintPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.add(locationConstraintMiddleware(config), locationConstraintMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/client-s3/dist-es/commands/CreateBucketCommand.js
var CreateBucketCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  DisableAccessPoints: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getLocationConstraintPlugin(config)];
}).s("AmazonS3", "CreateBucket", {}).n("S3Client", "CreateBucketCommand").f(void 0, void 0).ser(se_CreateBucketCommand).de(de_CreateBucketCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/CreateMultipartUploadCommand.js
var CreateMultipartUploadCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "CreateMultipartUpload", {}).n("S3Client", "CreateMultipartUploadCommand").f(CreateMultipartUploadRequestFilterSensitiveLog, CreateMultipartUploadOutputFilterSensitiveLog).ser(se_CreateMultipartUploadCommand).de(de_CreateMultipartUploadCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketAnalyticsConfigurationCommand.js
var DeleteBucketAnalyticsConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketAnalyticsConfiguration", {}).n("S3Client", "DeleteBucketAnalyticsConfigurationCommand").f(void 0, void 0).ser(se_DeleteBucketAnalyticsConfigurationCommand).de(de_DeleteBucketAnalyticsConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketCommand.js
var DeleteBucketCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucket", {}).n("S3Client", "DeleteBucketCommand").f(void 0, void 0).ser(se_DeleteBucketCommand).de(de_DeleteBucketCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketCorsCommand.js
var DeleteBucketCorsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketCors", {}).n("S3Client", "DeleteBucketCorsCommand").f(void 0, void 0).ser(se_DeleteBucketCorsCommand).de(de_DeleteBucketCorsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketEncryptionCommand.js
var DeleteBucketEncryptionCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketEncryption", {}).n("S3Client", "DeleteBucketEncryptionCommand").f(void 0, void 0).ser(se_DeleteBucketEncryptionCommand).de(de_DeleteBucketEncryptionCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketIntelligentTieringConfigurationCommand.js
var DeleteBucketIntelligentTieringConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketIntelligentTieringConfiguration", {}).n("S3Client", "DeleteBucketIntelligentTieringConfigurationCommand").f(void 0, void 0).ser(se_DeleteBucketIntelligentTieringConfigurationCommand).de(de_DeleteBucketIntelligentTieringConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketInventoryConfigurationCommand.js
var DeleteBucketInventoryConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketInventoryConfiguration", {}).n("S3Client", "DeleteBucketInventoryConfigurationCommand").f(void 0, void 0).ser(se_DeleteBucketInventoryConfigurationCommand).de(de_DeleteBucketInventoryConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketLifecycleCommand.js
var DeleteBucketLifecycleCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketLifecycle", {}).n("S3Client", "DeleteBucketLifecycleCommand").f(void 0, void 0).ser(se_DeleteBucketLifecycleCommand).de(de_DeleteBucketLifecycleCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketMetricsConfigurationCommand.js
var DeleteBucketMetricsConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketMetricsConfiguration", {}).n("S3Client", "DeleteBucketMetricsConfigurationCommand").f(void 0, void 0).ser(se_DeleteBucketMetricsConfigurationCommand).de(de_DeleteBucketMetricsConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketOwnershipControlsCommand.js
var DeleteBucketOwnershipControlsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketOwnershipControls", {}).n("S3Client", "DeleteBucketOwnershipControlsCommand").f(void 0, void 0).ser(se_DeleteBucketOwnershipControlsCommand).de(de_DeleteBucketOwnershipControlsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketPolicyCommand.js
var DeleteBucketPolicyCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketPolicy", {}).n("S3Client", "DeleteBucketPolicyCommand").f(void 0, void 0).ser(se_DeleteBucketPolicyCommand).de(de_DeleteBucketPolicyCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketReplicationCommand.js
var DeleteBucketReplicationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketReplication", {}).n("S3Client", "DeleteBucketReplicationCommand").f(void 0, void 0).ser(se_DeleteBucketReplicationCommand).de(de_DeleteBucketReplicationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketTaggingCommand.js
var DeleteBucketTaggingCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketTagging", {}).n("S3Client", "DeleteBucketTaggingCommand").f(void 0, void 0).ser(se_DeleteBucketTaggingCommand).de(de_DeleteBucketTaggingCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketWebsiteCommand.js
var DeleteBucketWebsiteCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeleteBucketWebsite", {}).n("S3Client", "DeleteBucketWebsiteCommand").f(void 0, void 0).ser(se_DeleteBucketWebsiteCommand).de(de_DeleteBucketWebsiteCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteObjectCommand.js
var DeleteObjectCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "DeleteObject", {}).n("S3Client", "DeleteObjectCommand").f(void 0, void 0).ser(se_DeleteObjectCommand).de(de_DeleteObjectCommand).build() {
};

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/constants.js
var ChecksumAlgorithm2;
(function(ChecksumAlgorithm3) {
  ChecksumAlgorithm3["MD5"] = "MD5";
  ChecksumAlgorithm3["CRC32"] = "CRC32";
  ChecksumAlgorithm3["CRC32C"] = "CRC32C";
  ChecksumAlgorithm3["SHA1"] = "SHA1";
  ChecksumAlgorithm3["SHA256"] = "SHA256";
})(ChecksumAlgorithm2 || (ChecksumAlgorithm2 = {}));
var ChecksumLocation;
(function(ChecksumLocation2) {
  ChecksumLocation2["HEADER"] = "header";
  ChecksumLocation2["TRAILER"] = "trailer";
})(ChecksumLocation || (ChecksumLocation = {}));
var DEFAULT_CHECKSUM_ALGORITHM = ChecksumAlgorithm2.MD5;
var S3_EXPRESS_DEFAULT_CHECKSUM_ALGORITHM = ChecksumAlgorithm2.CRC32;

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/types.js
var CLIENT_SUPPORTED_ALGORITHMS = [ChecksumAlgorithm2.CRC32, ChecksumAlgorithm2.CRC32C, ChecksumAlgorithm2.SHA1, ChecksumAlgorithm2.SHA256];
var PRIORITY_ORDER_ALGORITHMS = [ChecksumAlgorithm2.CRC32, ChecksumAlgorithm2.CRC32C, ChecksumAlgorithm2.SHA1, ChecksumAlgorithm2.SHA256];

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumAlgorithmForRequest.js
var getChecksumAlgorithmForRequest = (input, {
  requestChecksumRequired,
  requestAlgorithmMember
}, isS3Express) => {
  const defaultAlgorithm = isS3Express ? S3_EXPRESS_DEFAULT_CHECKSUM_ALGORITHM : DEFAULT_CHECKSUM_ALGORITHM;
  if (!requestAlgorithmMember || !input[requestAlgorithmMember]) {
    return requestChecksumRequired ? defaultAlgorithm : void 0;
  }
  const checksumAlgorithm = input[requestAlgorithmMember];
  if (!CLIENT_SUPPORTED_ALGORITHMS.includes(checksumAlgorithm)) {
    throw new Error(`The checksum algorithm "${checksumAlgorithm}" is not supported by the client. Select one of ${CLIENT_SUPPORTED_ALGORITHMS}.`);
  }
  return checksumAlgorithm;
};

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumLocationName.js
var getChecksumLocationName = (algorithm) => algorithm === ChecksumAlgorithm2.MD5 ? "content-md5" : `x-amz-checksum-${algorithm.toLowerCase()}`;

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/hasHeader.js
var hasHeader2 = (header, headers) => {
  const soughtHeader = header.toLowerCase();
  for (const headerName of Object.keys(headers)) {
    if (soughtHeader === headerName.toLowerCase()) {
      return true;
    }
  }
  return false;
};

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/isStreaming.js
var isStreaming = (body) => body !== void 0 && typeof body !== "string" && !ArrayBuffer.isView(body) && !isArrayBuffer(body);

// node_modules/@aws-crypto/crc32c/build/module/aws_crc32c.js
var AwsCrc32c = (
  /** @class */
  function() {
    function AwsCrc32c2() {
      this.crc32c = new Crc32c();
    }
    AwsCrc32c2.prototype.update = function(toHash) {
      if (isEmptyData2(toHash)) return;
      this.crc32c.update(convertToBuffer2(toHash));
    };
    AwsCrc32c2.prototype.digest = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a2) {
          return [2, numToUint8(this.crc32c.digest())];
        });
      });
    };
    AwsCrc32c2.prototype.reset = function() {
      this.crc32c = new Crc32c();
    };
    return AwsCrc32c2;
  }()
);

// node_modules/@aws-crypto/crc32c/build/module/index.js
var Crc32c = (
  /** @class */
  function() {
    function Crc32c2() {
      this.checksum = 4294967295;
    }
    Crc32c2.prototype.update = function(data) {
      var e_1, _a2;
      try {
        for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
          var byte = data_1_1.value;
          this.checksum = this.checksum >>> 8 ^ lookupTable2[(this.checksum ^ byte) & 255];
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (data_1_1 && !data_1_1.done && (_a2 = data_1.return)) _a2.call(data_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      return this;
    };
    Crc32c2.prototype.digest = function() {
      return (this.checksum ^ 4294967295) >>> 0;
    };
    return Crc32c2;
  }()
);
var a_lookupTable = [0, 4067132163, 3778769143, 324072436, 3348797215, 904991772, 648144872, 3570033899, 2329499855, 2024987596, 1809983544, 2575936315, 1296289744, 3207089363, 2893594407, 1578318884, 274646895, 3795141740, 4049975192, 51262619, 3619967088, 632279923, 922689671, 3298075524, 2592579488, 1760304291, 2075979607, 2312596564, 1562183871, 2943781820, 3156637768, 1313733451, 549293790, 3537243613, 3246849577, 871202090, 3878099393, 357341890, 102525238, 4101499445, 2858735121, 1477399826, 1264559846, 3107202533, 1845379342, 2677391885, 2361733625, 2125378298, 820201905, 3263744690, 3520608582, 598981189, 4151959214, 85089709, 373468761, 3827903834, 3124367742, 1213305469, 1526817161, 2842354314, 2107672161, 2412447074, 2627466902, 1861252501, 1098587580, 3004210879, 2688576843, 1378610760, 2262928035, 1955203488, 1742404180, 2511436119, 3416409459, 969524848, 714683780, 3639785095, 205050476, 4266873199, 3976438427, 526918040, 1361435347, 2739821008, 2954799652, 1114974503, 2529119692, 1691668175, 2005155131, 2247081528, 3690758684, 697762079, 986182379, 3366744552, 476452099, 3993867776, 4250756596, 255256311, 1640403810, 2477592673, 2164122517, 1922457750, 2791048317, 1412925310, 1197962378, 3037525897, 3944729517, 427051182, 170179418, 4165941337, 746937522, 3740196785, 3451792453, 1070968646, 1905808397, 2213795598, 2426610938, 1657317369, 3053634322, 1147748369, 1463399397, 2773627110, 4215344322, 153784257, 444234805, 3893493558, 1021025245, 3467647198, 3722505002, 797665321, 2197175160, 1889384571, 1674398607, 2443626636, 1164749927, 3070701412, 2757221520, 1446797203, 137323447, 4198817972, 3910406976, 461344835, 3484808360, 1037989803, 781091935, 3705997148, 2460548119, 1623424788, 1939049696, 2180517859, 1429367560, 2807687179, 3020495871, 1180866812, 410100952, 3927582683, 4182430767, 186734380, 3756733383, 763408580, 1053836080, 3434856499, 2722870694, 1344288421, 1131464017, 2971354706, 1708204729, 2545590714, 2229949006, 1988219213, 680717673, 3673779818, 3383336350, 1002577565, 4010310262, 493091189, 238226049, 4233660802, 2987750089, 1082061258, 1395524158, 2705686845, 1972364758, 2279892693, 2494862625, 1725896226, 952904198, 3399985413, 3656866545, 731699698, 4283874585, 222117402, 510512622, 3959836397, 3280807620, 837199303, 582374963, 3504198960, 68661723, 4135334616, 3844915500, 390545967, 1230274059, 3141532936, 2825850620, 1510247935, 2395924756, 2091215383, 1878366691, 2644384480, 3553878443, 565732008, 854102364, 3229815391, 340358836, 3861050807, 4117890627, 119113024, 1493875044, 2875275879, 3090270611, 1247431312, 2660249211, 1828433272, 2141937292, 2378227087, 3811616794, 291187481, 34330861, 4032846830, 615137029, 3603020806, 3314634738, 939183345, 1776939221, 2609017814, 2295496738, 2058945313, 2926798794, 1545135305, 1330124605, 3173225534, 4084100981, 17165430, 307568514, 3762199681, 888469610, 3332340585, 3587147933, 665062302, 2042050490, 2346497209, 2559330125, 1793573966, 3190661285, 1279665062, 1595330642, 2910671697];
var lookupTable2 = uint32ArrayFrom(a_lookupTable);

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/selectChecksumAlgorithmFunction.js
var selectChecksumAlgorithmFunction = (checksumAlgorithm, config) => ({
  [ChecksumAlgorithm2.MD5]: config.md5,
  [ChecksumAlgorithm2.CRC32]: AwsCrc32,
  [ChecksumAlgorithm2.CRC32C]: AwsCrc32c,
  [ChecksumAlgorithm2.SHA1]: config.sha1,
  [ChecksumAlgorithm2.SHA256]: config.sha256
})[checksumAlgorithm];

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/stringHasher.js
var stringHasher = (checksumAlgorithmFn, body) => {
  const hash = new checksumAlgorithmFn();
  hash.update(toUint8Array(body || ""));
  return hash.digest();
};

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/flexibleChecksumsMiddleware.js
var flexibleChecksumsMiddlewareOptions = {
  name: "flexibleChecksumsMiddleware",
  step: "build",
  tags: ["BODY_CHECKSUM"],
  override: true
};
var flexibleChecksumsMiddleware = (config, middlewareConfig) => (next, context) => (args) => __async(void 0, null, function* () {
  if (!HttpRequest.isInstance(args.request)) {
    return next(args);
  }
  const {
    request
  } = args;
  const {
    body: requestBody,
    headers
  } = request;
  const {
    base64Encoder,
    streamHasher
  } = config;
  const {
    input,
    requestChecksumRequired,
    requestAlgorithmMember
  } = middlewareConfig;
  const checksumAlgorithm = getChecksumAlgorithmForRequest(input, {
    requestChecksumRequired,
    requestAlgorithmMember
  }, !!context.isS3ExpressBucket);
  let updatedBody = requestBody;
  let updatedHeaders = headers;
  if (checksumAlgorithm) {
    const checksumLocationName = getChecksumLocationName(checksumAlgorithm);
    const checksumAlgorithmFn = selectChecksumAlgorithmFunction(checksumAlgorithm, config);
    if (isStreaming(requestBody)) {
      const {
        getAwsChunkedEncodingStream: getAwsChunkedEncodingStream2,
        bodyLengthChecker
      } = config;
      updatedBody = getAwsChunkedEncodingStream2(requestBody, {
        base64Encoder,
        bodyLengthChecker,
        checksumLocationName,
        checksumAlgorithmFn,
        streamHasher
      });
      updatedHeaders = __spreadProps(__spreadValues({}, headers), {
        "content-encoding": headers["content-encoding"] ? `${headers["content-encoding"]},aws-chunked` : "aws-chunked",
        "transfer-encoding": "chunked",
        "x-amz-decoded-content-length": headers["content-length"],
        "x-amz-content-sha256": "STREAMING-UNSIGNED-PAYLOAD-TRAILER",
        "x-amz-trailer": checksumLocationName
      });
      delete updatedHeaders["content-length"];
    } else if (!hasHeader2(checksumLocationName, headers)) {
      const rawChecksum = yield stringHasher(checksumAlgorithmFn, requestBody);
      updatedHeaders = __spreadProps(__spreadValues({}, headers), {
        [checksumLocationName]: base64Encoder(rawChecksum)
      });
    }
  }
  const result = yield next(__spreadProps(__spreadValues({}, args), {
    request: __spreadProps(__spreadValues({}, request), {
      headers: updatedHeaders,
      body: updatedBody
    })
  }));
  return result;
});

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumAlgorithmListForResponse.js
var getChecksumAlgorithmListForResponse = (responseAlgorithms = []) => {
  const validChecksumAlgorithms = [];
  for (const algorithm of PRIORITY_ORDER_ALGORITHMS) {
    if (!responseAlgorithms.includes(algorithm) || !CLIENT_SUPPORTED_ALGORITHMS.includes(algorithm)) {
      continue;
    }
    validChecksumAlgorithms.push(algorithm);
  }
  return validChecksumAlgorithms;
};

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/isChecksumWithPartNumber.js
var isChecksumWithPartNumber = (checksum) => {
  const lastHyphenIndex = checksum.lastIndexOf("-");
  if (lastHyphenIndex !== -1) {
    const numberPart = checksum.slice(lastHyphenIndex + 1);
    if (!numberPart.startsWith("0")) {
      const number = parseInt(numberPart, 10);
      if (!isNaN(number) && number >= 1 && number <= 1e4) {
        return true;
      }
    }
  }
  return false;
};

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/streams/create-read-stream-on-buffer.browser.js
function createReadStreamOnBuffer(buffer) {
  return new Blob([buffer]).stream();
}

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksum.js
var getChecksum = (_0, _1) => __async(void 0, [_0, _1], function* (body, {
  streamHasher,
  checksumAlgorithmFn,
  base64Encoder
}) {
  const digest = isStreaming(body) ? streamHasher(checksumAlgorithmFn, body) : stringHasher(checksumAlgorithmFn, body);
  return base64Encoder(yield digest);
});

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/validateChecksumFromResponse.js
var validateChecksumFromResponse = (_0, _1) => __async(void 0, [_0, _1], function* (response, {
  config,
  responseAlgorithms
}) {
  const checksumAlgorithms = getChecksumAlgorithmListForResponse(responseAlgorithms);
  const {
    body: responseBody,
    headers: responseHeaders
  } = response;
  for (const algorithm of checksumAlgorithms) {
    const responseHeader = getChecksumLocationName(algorithm);
    const checksumFromResponse = responseHeaders[responseHeader];
    if (checksumFromResponse) {
      const checksumAlgorithmFn = selectChecksumAlgorithmFunction(algorithm, config);
      const {
        streamHasher,
        base64Encoder
      } = config;
      const checksum = yield getChecksum(responseBody, {
        streamHasher,
        checksumAlgorithmFn,
        base64Encoder
      });
      if (checksum === checksumFromResponse) {
        break;
      }
      throw new Error(`Checksum mismatch: expected "${checksum}" but received "${checksumFromResponse}" in response header "${responseHeader}".`);
    }
  }
});

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/flexibleChecksumsResponseMiddleware.js
var flexibleChecksumsResponseMiddlewareOptions = {
  name: "flexibleChecksumsResponseMiddleware",
  toMiddleware: "deserializerMiddleware",
  relation: "after",
  tags: ["BODY_CHECKSUM"],
  override: true
};
var flexibleChecksumsResponseMiddleware = (config, middlewareConfig) => (next, context) => (args) => __async(void 0, null, function* () {
  if (!HttpRequest.isInstance(args.request)) {
    return next(args);
  }
  const input = args.input;
  const result = yield next(args);
  const response = result.response;
  let collectedStream = void 0;
  const {
    requestValidationModeMember,
    responseAlgorithms
  } = middlewareConfig;
  if (requestValidationModeMember && input[requestValidationModeMember] === "ENABLED") {
    const {
      clientName,
      commandName
    } = context;
    const isS3WholeObjectMultipartGetResponseChecksum = clientName === "S3Client" && commandName === "GetObjectCommand" && getChecksumAlgorithmListForResponse(responseAlgorithms).every((algorithm) => {
      const responseHeader = getChecksumLocationName(algorithm);
      const checksumFromResponse = response.headers[responseHeader];
      return !checksumFromResponse || isChecksumWithPartNumber(checksumFromResponse);
    });
    if (isS3WholeObjectMultipartGetResponseChecksum) {
      return result;
    }
    const isStreamingBody = isStreaming(response.body);
    if (isStreamingBody) {
      collectedStream = yield config.streamCollector(response.body);
      response.body = createReadStreamOnBuffer(collectedStream);
    }
    yield validateChecksumFromResponse(result.response, {
      config,
      responseAlgorithms
    });
    if (isStreamingBody && collectedStream) {
      response.body = createReadStreamOnBuffer(collectedStream);
    }
  }
  return result;
});

// node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getFlexibleChecksumsPlugin.js
var getFlexibleChecksumsPlugin = (config, middlewareConfig) => ({
  applyToStack: (clientStack) => {
    clientStack.add(flexibleChecksumsMiddleware(config, middlewareConfig), flexibleChecksumsMiddlewareOptions);
    clientStack.addRelativeTo(flexibleChecksumsResponseMiddleware(config, middlewareConfig), flexibleChecksumsResponseMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteObjectsCommand.js
var DeleteObjectsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  }), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "DeleteObjects", {}).n("S3Client", "DeleteObjectsCommand").f(void 0, void 0).ser(se_DeleteObjectsCommand).de(de_DeleteObjectsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteObjectTaggingCommand.js
var DeleteObjectTaggingCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "DeleteObjectTagging", {}).n("S3Client", "DeleteObjectTaggingCommand").f(void 0, void 0).ser(se_DeleteObjectTaggingCommand).de(de_DeleteObjectTaggingCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/DeletePublicAccessBlockCommand.js
var DeletePublicAccessBlockCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "DeletePublicAccessBlock", {}).n("S3Client", "DeletePublicAccessBlockCommand").f(void 0, void 0).ser(se_DeletePublicAccessBlockCommand).de(de_DeletePublicAccessBlockCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketAccelerateConfigurationCommand.js
var GetBucketAccelerateConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketAccelerateConfiguration", {}).n("S3Client", "GetBucketAccelerateConfigurationCommand").f(void 0, void 0).ser(se_GetBucketAccelerateConfigurationCommand).de(de_GetBucketAccelerateConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketAclCommand.js
var GetBucketAclCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketAcl", {}).n("S3Client", "GetBucketAclCommand").f(void 0, void 0).ser(se_GetBucketAclCommand).de(de_GetBucketAclCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketAnalyticsConfigurationCommand.js
var GetBucketAnalyticsConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketAnalyticsConfiguration", {}).n("S3Client", "GetBucketAnalyticsConfigurationCommand").f(void 0, void 0).ser(se_GetBucketAnalyticsConfigurationCommand).de(de_GetBucketAnalyticsConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketCorsCommand.js
var GetBucketCorsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketCors", {}).n("S3Client", "GetBucketCorsCommand").f(void 0, void 0).ser(se_GetBucketCorsCommand).de(de_GetBucketCorsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketEncryptionCommand.js
var GetBucketEncryptionCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketEncryption", {}).n("S3Client", "GetBucketEncryptionCommand").f(void 0, GetBucketEncryptionOutputFilterSensitiveLog).ser(se_GetBucketEncryptionCommand).de(de_GetBucketEncryptionCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketIntelligentTieringConfigurationCommand.js
var GetBucketIntelligentTieringConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketIntelligentTieringConfiguration", {}).n("S3Client", "GetBucketIntelligentTieringConfigurationCommand").f(void 0, void 0).ser(se_GetBucketIntelligentTieringConfigurationCommand).de(de_GetBucketIntelligentTieringConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketInventoryConfigurationCommand.js
var GetBucketInventoryConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketInventoryConfiguration", {}).n("S3Client", "GetBucketInventoryConfigurationCommand").f(void 0, GetBucketInventoryConfigurationOutputFilterSensitiveLog).ser(se_GetBucketInventoryConfigurationCommand).de(de_GetBucketInventoryConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketLifecycleConfigurationCommand.js
var GetBucketLifecycleConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketLifecycleConfiguration", {}).n("S3Client", "GetBucketLifecycleConfigurationCommand").f(void 0, void 0).ser(se_GetBucketLifecycleConfigurationCommand).de(de_GetBucketLifecycleConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketLocationCommand.js
var GetBucketLocationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketLocation", {}).n("S3Client", "GetBucketLocationCommand").f(void 0, void 0).ser(se_GetBucketLocationCommand).de(de_GetBucketLocationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketLoggingCommand.js
var GetBucketLoggingCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketLogging", {}).n("S3Client", "GetBucketLoggingCommand").f(void 0, void 0).ser(se_GetBucketLoggingCommand).de(de_GetBucketLoggingCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketMetricsConfigurationCommand.js
var GetBucketMetricsConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketMetricsConfiguration", {}).n("S3Client", "GetBucketMetricsConfigurationCommand").f(void 0, void 0).ser(se_GetBucketMetricsConfigurationCommand).de(de_GetBucketMetricsConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketNotificationConfigurationCommand.js
var GetBucketNotificationConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketNotificationConfiguration", {}).n("S3Client", "GetBucketNotificationConfigurationCommand").f(void 0, void 0).ser(se_GetBucketNotificationConfigurationCommand).de(de_GetBucketNotificationConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketOwnershipControlsCommand.js
var GetBucketOwnershipControlsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketOwnershipControls", {}).n("S3Client", "GetBucketOwnershipControlsCommand").f(void 0, void 0).ser(se_GetBucketOwnershipControlsCommand).de(de_GetBucketOwnershipControlsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketPolicyCommand.js
var GetBucketPolicyCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketPolicy", {}).n("S3Client", "GetBucketPolicyCommand").f(void 0, void 0).ser(se_GetBucketPolicyCommand).de(de_GetBucketPolicyCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketPolicyStatusCommand.js
var GetBucketPolicyStatusCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketPolicyStatus", {}).n("S3Client", "GetBucketPolicyStatusCommand").f(void 0, void 0).ser(se_GetBucketPolicyStatusCommand).de(de_GetBucketPolicyStatusCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketReplicationCommand.js
var GetBucketReplicationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketReplication", {}).n("S3Client", "GetBucketReplicationCommand").f(void 0, void 0).ser(se_GetBucketReplicationCommand).de(de_GetBucketReplicationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketRequestPaymentCommand.js
var GetBucketRequestPaymentCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketRequestPayment", {}).n("S3Client", "GetBucketRequestPaymentCommand").f(void 0, void 0).ser(se_GetBucketRequestPaymentCommand).de(de_GetBucketRequestPaymentCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketTaggingCommand.js
var GetBucketTaggingCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketTagging", {}).n("S3Client", "GetBucketTaggingCommand").f(void 0, void 0).ser(se_GetBucketTaggingCommand).de(de_GetBucketTaggingCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketVersioningCommand.js
var GetBucketVersioningCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketVersioning", {}).n("S3Client", "GetBucketVersioningCommand").f(void 0, void 0).ser(se_GetBucketVersioningCommand).de(de_GetBucketVersioningCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketWebsiteCommand.js
var GetBucketWebsiteCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetBucketWebsite", {}).n("S3Client", "GetBucketWebsiteCommand").f(void 0, void 0).ser(se_GetBucketWebsiteCommand).de(de_GetBucketWebsiteCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectAclCommand.js
var GetObjectAclCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetObjectAcl", {}).n("S3Client", "GetObjectAclCommand").f(void 0, void 0).ser(se_GetObjectAclCommand).de(de_GetObjectAclCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectAttributesCommand.js
var GetObjectAttributesCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "GetObjectAttributes", {}).n("S3Client", "GetObjectAttributesCommand").f(GetObjectAttributesRequestFilterSensitiveLog, void 0).ser(se_GetObjectAttributesCommand).de(de_GetObjectAttributesCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectCommand.js
var GetObjectCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestChecksumRequired: false,
    requestValidationModeMember: "ChecksumMode",
    responseAlgorithms: ["CRC32", "CRC32C", "SHA256", "SHA1"]
  }), getSsecPlugin(config), getS3ExpiresMiddlewarePlugin(config)];
}).s("AmazonS3", "GetObject", {}).n("S3Client", "GetObjectCommand").f(GetObjectRequestFilterSensitiveLog, GetObjectOutputFilterSensitiveLog).ser(se_GetObjectCommand).de(de_GetObjectCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectLegalHoldCommand.js
var GetObjectLegalHoldCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetObjectLegalHold", {}).n("S3Client", "GetObjectLegalHoldCommand").f(void 0, void 0).ser(se_GetObjectLegalHoldCommand).de(de_GetObjectLegalHoldCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectLockConfigurationCommand.js
var GetObjectLockConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetObjectLockConfiguration", {}).n("S3Client", "GetObjectLockConfigurationCommand").f(void 0, void 0).ser(se_GetObjectLockConfigurationCommand).de(de_GetObjectLockConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectRetentionCommand.js
var GetObjectRetentionCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetObjectRetention", {}).n("S3Client", "GetObjectRetentionCommand").f(void 0, void 0).ser(se_GetObjectRetentionCommand).de(de_GetObjectRetentionCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectTaggingCommand.js
var GetObjectTaggingCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetObjectTagging", {}).n("S3Client", "GetObjectTaggingCommand").f(void 0, void 0).ser(se_GetObjectTaggingCommand).de(de_GetObjectTaggingCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectTorrentCommand.js
var GetObjectTorrentCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "GetObjectTorrent", {}).n("S3Client", "GetObjectTorrentCommand").f(void 0, GetObjectTorrentOutputFilterSensitiveLog).ser(se_GetObjectTorrentCommand).de(de_GetObjectTorrentCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/GetPublicAccessBlockCommand.js
var GetPublicAccessBlockCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "GetPublicAccessBlock", {}).n("S3Client", "GetPublicAccessBlockCommand").f(void 0, void 0).ser(se_GetPublicAccessBlockCommand).de(de_GetPublicAccessBlockCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/HeadBucketCommand.js
var HeadBucketCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "HeadBucket", {}).n("S3Client", "HeadBucketCommand").f(void 0, void 0).ser(se_HeadBucketCommand).de(de_HeadBucketCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/HeadObjectCommand.js
var HeadObjectCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getSsecPlugin(config), getS3ExpiresMiddlewarePlugin(config)];
}).s("AmazonS3", "HeadObject", {}).n("S3Client", "HeadObjectCommand").f(HeadObjectRequestFilterSensitiveLog, HeadObjectOutputFilterSensitiveLog).ser(se_HeadObjectCommand).de(de_HeadObjectCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketAnalyticsConfigurationsCommand.js
var ListBucketAnalyticsConfigurationsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListBucketAnalyticsConfigurations", {}).n("S3Client", "ListBucketAnalyticsConfigurationsCommand").f(void 0, void 0).ser(se_ListBucketAnalyticsConfigurationsCommand).de(de_ListBucketAnalyticsConfigurationsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketIntelligentTieringConfigurationsCommand.js
var ListBucketIntelligentTieringConfigurationsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListBucketIntelligentTieringConfigurations", {}).n("S3Client", "ListBucketIntelligentTieringConfigurationsCommand").f(void 0, void 0).ser(se_ListBucketIntelligentTieringConfigurationsCommand).de(de_ListBucketIntelligentTieringConfigurationsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketInventoryConfigurationsCommand.js
var ListBucketInventoryConfigurationsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListBucketInventoryConfigurations", {}).n("S3Client", "ListBucketInventoryConfigurationsCommand").f(void 0, ListBucketInventoryConfigurationsOutputFilterSensitiveLog).ser(se_ListBucketInventoryConfigurationsCommand).de(de_ListBucketInventoryConfigurationsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketMetricsConfigurationsCommand.js
var ListBucketMetricsConfigurationsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListBucketMetricsConfigurations", {}).n("S3Client", "ListBucketMetricsConfigurationsCommand").f(void 0, void 0).ser(se_ListBucketMetricsConfigurationsCommand).de(de_ListBucketMetricsConfigurationsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketsCommand.js
var ListBucketsCommand = class extends Command.classBuilder().ep(__spreadValues({}, commonParams)).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListBuckets", {}).n("S3Client", "ListBucketsCommand").f(void 0, void 0).ser(se_ListBucketsCommand).de(de_ListBucketsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListDirectoryBucketsCommand.js
var ListDirectoryBucketsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListDirectoryBuckets", {}).n("S3Client", "ListDirectoryBucketsCommand").f(void 0, void 0).ser(se_ListDirectoryBucketsCommand).de(de_ListDirectoryBucketsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListMultipartUploadsCommand.js
var ListMultipartUploadsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Prefix: {
    type: "contextParams",
    name: "Prefix"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListMultipartUploads", {}).n("S3Client", "ListMultipartUploadsCommand").f(void 0, void 0).ser(se_ListMultipartUploadsCommand).de(de_ListMultipartUploadsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListObjectsCommand.js
var ListObjectsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Prefix: {
    type: "contextParams",
    name: "Prefix"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListObjects", {}).n("S3Client", "ListObjectsCommand").f(void 0, void 0).ser(se_ListObjectsCommand).de(de_ListObjectsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListObjectsV2Command.js
var ListObjectsV2Command = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Prefix: {
    type: "contextParams",
    name: "Prefix"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListObjectsV2", {}).n("S3Client", "ListObjectsV2Command").f(void 0, void 0).ser(se_ListObjectsV2Command).de(de_ListObjectsV2Command).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListObjectVersionsCommand.js
var ListObjectVersionsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Prefix: {
    type: "contextParams",
    name: "Prefix"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "ListObjectVersions", {}).n("S3Client", "ListObjectVersionsCommand").f(void 0, void 0).ser(se_ListObjectVersionsCommand).de(de_ListObjectVersionsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/ListPartsCommand.js
var ListPartsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "ListParts", {}).n("S3Client", "ListPartsCommand").f(ListPartsRequestFilterSensitiveLog, void 0).ser(se_ListPartsCommand).de(de_ListPartsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketAccelerateConfigurationCommand.js
var PutBucketAccelerateConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: false
  })];
}).s("AmazonS3", "PutBucketAccelerateConfiguration", {}).n("S3Client", "PutBucketAccelerateConfigurationCommand").f(void 0, void 0).ser(se_PutBucketAccelerateConfigurationCommand).de(de_PutBucketAccelerateConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketAclCommand.js
var PutBucketAclCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketAcl", {}).n("S3Client", "PutBucketAclCommand").f(void 0, void 0).ser(se_PutBucketAclCommand).de(de_PutBucketAclCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketAnalyticsConfigurationCommand.js
var PutBucketAnalyticsConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "PutBucketAnalyticsConfiguration", {}).n("S3Client", "PutBucketAnalyticsConfigurationCommand").f(void 0, void 0).ser(se_PutBucketAnalyticsConfigurationCommand).de(de_PutBucketAnalyticsConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketCorsCommand.js
var PutBucketCorsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketCors", {}).n("S3Client", "PutBucketCorsCommand").f(void 0, void 0).ser(se_PutBucketCorsCommand).de(de_PutBucketCorsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketEncryptionCommand.js
var PutBucketEncryptionCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketEncryption", {}).n("S3Client", "PutBucketEncryptionCommand").f(PutBucketEncryptionRequestFilterSensitiveLog, void 0).ser(se_PutBucketEncryptionCommand).de(de_PutBucketEncryptionCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketIntelligentTieringConfigurationCommand.js
var PutBucketIntelligentTieringConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "PutBucketIntelligentTieringConfiguration", {}).n("S3Client", "PutBucketIntelligentTieringConfigurationCommand").f(void 0, void 0).ser(se_PutBucketIntelligentTieringConfigurationCommand).de(de_PutBucketIntelligentTieringConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketInventoryConfigurationCommand.js
var PutBucketInventoryConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "PutBucketInventoryConfiguration", {}).n("S3Client", "PutBucketInventoryConfigurationCommand").f(PutBucketInventoryConfigurationRequestFilterSensitiveLog, void 0).ser(se_PutBucketInventoryConfigurationCommand).de(de_PutBucketInventoryConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketLifecycleConfigurationCommand.js
var PutBucketLifecycleConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketLifecycleConfiguration", {}).n("S3Client", "PutBucketLifecycleConfigurationCommand").f(void 0, void 0).ser(se_PutBucketLifecycleConfigurationCommand).de(de_PutBucketLifecycleConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketLoggingCommand.js
var PutBucketLoggingCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketLogging", {}).n("S3Client", "PutBucketLoggingCommand").f(void 0, void 0).ser(se_PutBucketLoggingCommand).de(de_PutBucketLoggingCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketMetricsConfigurationCommand.js
var PutBucketMetricsConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "PutBucketMetricsConfiguration", {}).n("S3Client", "PutBucketMetricsConfigurationCommand").f(void 0, void 0).ser(se_PutBucketMetricsConfigurationCommand).de(de_PutBucketMetricsConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketNotificationConfigurationCommand.js
var PutBucketNotificationConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "PutBucketNotificationConfiguration", {}).n("S3Client", "PutBucketNotificationConfigurationCommand").f(void 0, void 0).ser(se_PutBucketNotificationConfigurationCommand).de(de_PutBucketNotificationConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketOwnershipControlsCommand.js
var PutBucketOwnershipControlsCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketOwnershipControls", {}).n("S3Client", "PutBucketOwnershipControlsCommand").f(void 0, void 0).ser(se_PutBucketOwnershipControlsCommand).de(de_PutBucketOwnershipControlsCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketPolicyCommand.js
var PutBucketPolicyCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketPolicy", {}).n("S3Client", "PutBucketPolicyCommand").f(void 0, void 0).ser(se_PutBucketPolicyCommand).de(de_PutBucketPolicyCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketReplicationCommand.js
var PutBucketReplicationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketReplication", {}).n("S3Client", "PutBucketReplicationCommand").f(void 0, void 0).ser(se_PutBucketReplicationCommand).de(de_PutBucketReplicationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketRequestPaymentCommand.js
var PutBucketRequestPaymentCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketRequestPayment", {}).n("S3Client", "PutBucketRequestPaymentCommand").f(void 0, void 0).ser(se_PutBucketRequestPaymentCommand).de(de_PutBucketRequestPaymentCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketTaggingCommand.js
var PutBucketTaggingCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketTagging", {}).n("S3Client", "PutBucketTaggingCommand").f(void 0, void 0).ser(se_PutBucketTaggingCommand).de(de_PutBucketTaggingCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketVersioningCommand.js
var PutBucketVersioningCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketVersioning", {}).n("S3Client", "PutBucketVersioningCommand").f(void 0, void 0).ser(se_PutBucketVersioningCommand).de(de_PutBucketVersioningCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketWebsiteCommand.js
var PutBucketWebsiteCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutBucketWebsite", {}).n("S3Client", "PutBucketWebsiteCommand").f(void 0, void 0).ser(se_PutBucketWebsiteCommand).de(de_PutBucketWebsiteCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectAclCommand.js
var PutObjectAclCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  }), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "PutObjectAcl", {}).n("S3Client", "PutObjectAclCommand").f(void 0, void 0).ser(se_PutObjectAclCommand).de(de_PutObjectAclCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectCommand.js
var PutObjectCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: false
  }), getCheckContentLengthHeaderPlugin(config), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "PutObject", {}).n("S3Client", "PutObjectCommand").f(PutObjectRequestFilterSensitiveLog, PutObjectOutputFilterSensitiveLog).ser(se_PutObjectCommand).de(de_PutObjectCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectLegalHoldCommand.js
var PutObjectLegalHoldCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  }), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "PutObjectLegalHold", {}).n("S3Client", "PutObjectLegalHoldCommand").f(void 0, void 0).ser(se_PutObjectLegalHoldCommand).de(de_PutObjectLegalHoldCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectLockConfigurationCommand.js
var PutObjectLockConfigurationCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  }), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "PutObjectLockConfiguration", {}).n("S3Client", "PutObjectLockConfigurationCommand").f(void 0, void 0).ser(se_PutObjectLockConfigurationCommand).de(de_PutObjectLockConfigurationCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectRetentionCommand.js
var PutObjectRetentionCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  }), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "PutObjectRetention", {}).n("S3Client", "PutObjectRetentionCommand").f(void 0, void 0).ser(se_PutObjectRetentionCommand).de(de_PutObjectRetentionCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectTaggingCommand.js
var PutObjectTaggingCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  }), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "PutObjectTagging", {}).n("S3Client", "PutObjectTaggingCommand").f(void 0, void 0).ser(se_PutObjectTaggingCommand).de(de_PutObjectTaggingCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/PutPublicAccessBlockCommand.js
var PutPublicAccessBlockCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseS3ExpressControlEndpoint: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: true
  })];
}).s("AmazonS3", "PutPublicAccessBlock", {}).n("S3Client", "PutPublicAccessBlockCommand").f(void 0, void 0).ser(se_PutPublicAccessBlockCommand).de(de_PutPublicAccessBlockCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/RestoreObjectCommand.js
var RestoreObjectCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: false
  }), getThrow200ExceptionsPlugin(config)];
}).s("AmazonS3", "RestoreObject", {}).n("S3Client", "RestoreObjectCommand").f(RestoreObjectRequestFilterSensitiveLog, void 0).ser(se_RestoreObjectCommand).de(de_RestoreObjectCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/SelectObjectContentCommand.js
var SelectObjectContentCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "SelectObjectContent", {
  eventStream: {
    output: true
  }
}).n("S3Client", "SelectObjectContentCommand").f(SelectObjectContentRequestFilterSensitiveLog, SelectObjectContentOutputFilterSensitiveLog).ser(se_SelectObjectContentCommand).de(de_SelectObjectContentCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/UploadPartCommand.js
var UploadPartCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  },
  Key: {
    type: "contextParams",
    name: "Key"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getFlexibleChecksumsPlugin(config, {
    input: this.input,
    requestAlgorithmMember: "ChecksumAlgorithm",
    requestChecksumRequired: false
  }), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "UploadPart", {}).n("S3Client", "UploadPartCommand").f(UploadPartRequestFilterSensitiveLog, UploadPartOutputFilterSensitiveLog).ser(se_UploadPartCommand).de(de_UploadPartCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/UploadPartCopyCommand.js
var UploadPartCopyCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  DisableS3ExpressSessionAuth: {
    type: "staticContextParams",
    value: true
  },
  Bucket: {
    type: "contextParams",
    name: "Bucket"
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions()), getThrow200ExceptionsPlugin(config), getSsecPlugin(config)];
}).s("AmazonS3", "UploadPartCopy", {}).n("S3Client", "UploadPartCopyCommand").f(UploadPartCopyRequestFilterSensitiveLog, UploadPartCopyOutputFilterSensitiveLog).ser(se_UploadPartCopyCommand).de(de_UploadPartCopyCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/commands/WriteGetObjectResponseCommand.js
var WriteGetObjectResponseCommand = class extends Command.classBuilder().ep(__spreadProps(__spreadValues({}, commonParams), {
  UseObjectLambdaEndpoint: {
    type: "staticContextParams",
    value: true
  }
})).m(function(Command2, cs2, config, o2) {
  return [getSerdePlugin(config, this.serialize, this.deserialize), getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonS3", "WriteGetObjectResponse", {}).n("S3Client", "WriteGetObjectResponseCommand").f(WriteGetObjectResponseRequestFilterSensitiveLog, void 0).ser(se_WriteGetObjectResponseCommand).de(de_WriteGetObjectResponseCommand).build() {
};

// node_modules/@aws-sdk/client-s3/dist-es/S3.js
var commands = {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CopyObjectCommand,
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  CreateSessionCommand,
  DeleteBucketCommand,
  DeleteBucketAnalyticsConfigurationCommand,
  DeleteBucketCorsCommand,
  DeleteBucketEncryptionCommand,
  DeleteBucketIntelligentTieringConfigurationCommand,
  DeleteBucketInventoryConfigurationCommand,
  DeleteBucketLifecycleCommand,
  DeleteBucketMetricsConfigurationCommand,
  DeleteBucketOwnershipControlsCommand,
  DeleteBucketPolicyCommand,
  DeleteBucketReplicationCommand,
  DeleteBucketTaggingCommand,
  DeleteBucketWebsiteCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectTaggingCommand,
  DeletePublicAccessBlockCommand,
  GetBucketAccelerateConfigurationCommand,
  GetBucketAclCommand,
  GetBucketAnalyticsConfigurationCommand,
  GetBucketCorsCommand,
  GetBucketEncryptionCommand,
  GetBucketIntelligentTieringConfigurationCommand,
  GetBucketInventoryConfigurationCommand,
  GetBucketLifecycleConfigurationCommand,
  GetBucketLocationCommand,
  GetBucketLoggingCommand,
  GetBucketMetricsConfigurationCommand,
  GetBucketNotificationConfigurationCommand,
  GetBucketOwnershipControlsCommand,
  GetBucketPolicyCommand,
  GetBucketPolicyStatusCommand,
  GetBucketReplicationCommand,
  GetBucketRequestPaymentCommand,
  GetBucketTaggingCommand,
  GetBucketVersioningCommand,
  GetBucketWebsiteCommand,
  GetObjectCommand,
  GetObjectAclCommand,
  GetObjectAttributesCommand,
  GetObjectLegalHoldCommand,
  GetObjectLockConfigurationCommand,
  GetObjectRetentionCommand,
  GetObjectTaggingCommand,
  GetObjectTorrentCommand,
  GetPublicAccessBlockCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListBucketAnalyticsConfigurationsCommand,
  ListBucketIntelligentTieringConfigurationsCommand,
  ListBucketInventoryConfigurationsCommand,
  ListBucketMetricsConfigurationsCommand,
  ListBucketsCommand,
  ListDirectoryBucketsCommand,
  ListMultipartUploadsCommand,
  ListObjectsCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  ListPartsCommand,
  PutBucketAccelerateConfigurationCommand,
  PutBucketAclCommand,
  PutBucketAnalyticsConfigurationCommand,
  PutBucketCorsCommand,
  PutBucketEncryptionCommand,
  PutBucketIntelligentTieringConfigurationCommand,
  PutBucketInventoryConfigurationCommand,
  PutBucketLifecycleConfigurationCommand,
  PutBucketLoggingCommand,
  PutBucketMetricsConfigurationCommand,
  PutBucketNotificationConfigurationCommand,
  PutBucketOwnershipControlsCommand,
  PutBucketPolicyCommand,
  PutBucketReplicationCommand,
  PutBucketRequestPaymentCommand,
  PutBucketTaggingCommand,
  PutBucketVersioningCommand,
  PutBucketWebsiteCommand,
  PutObjectCommand,
  PutObjectAclCommand,
  PutObjectLegalHoldCommand,
  PutObjectLockConfigurationCommand,
  PutObjectRetentionCommand,
  PutObjectTaggingCommand,
  PutPublicAccessBlockCommand,
  RestoreObjectCommand,
  SelectObjectContentCommand,
  UploadPartCommand,
  UploadPartCopyCommand,
  WriteGetObjectResponseCommand
};
var S3 = class extends S3Client {
};
createAggregatedClient(commands, S3);

// node_modules/@aws-sdk/client-s3/dist-es/pagination/ListBucketsPaginator.js
var paginateListBuckets = createPaginator(S3Client, ListBucketsCommand, "ContinuationToken", "ContinuationToken", "MaxBuckets");

// node_modules/@aws-sdk/client-s3/dist-es/pagination/ListDirectoryBucketsPaginator.js
var paginateListDirectoryBuckets = createPaginator(S3Client, ListDirectoryBucketsCommand, "ContinuationToken", "ContinuationToken", "MaxDirectoryBuckets");

// node_modules/@aws-sdk/client-s3/dist-es/pagination/ListObjectsV2Paginator.js
var paginateListObjectsV2 = createPaginator(S3Client, ListObjectsV2Command, "ContinuationToken", "NextContinuationToken", "MaxKeys");

// node_modules/@aws-sdk/client-s3/dist-es/pagination/ListPartsPaginator.js
var paginateListParts = createPaginator(S3Client, ListPartsCommand, "PartNumberMarker", "NextPartNumberMarker", "MaxParts");

// node_modules/@smithy/util-waiter/dist-es/utils/sleep.js
var sleep = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
};

// node_modules/@smithy/util-waiter/dist-es/waiter.js
var waiterServiceDefaults = {
  minDelay: 2,
  maxDelay: 120
};
var WaiterState;
(function(WaiterState2) {
  WaiterState2["ABORTED"] = "ABORTED";
  WaiterState2["FAILURE"] = "FAILURE";
  WaiterState2["SUCCESS"] = "SUCCESS";
  WaiterState2["RETRY"] = "RETRY";
  WaiterState2["TIMEOUT"] = "TIMEOUT";
})(WaiterState || (WaiterState = {}));
var checkExceptions = (result) => {
  if (result.state === WaiterState.ABORTED) {
    const abortError = new Error(`${JSON.stringify(__spreadProps(__spreadValues({}, result), {
      reason: "Request was aborted"
    }))}`);
    abortError.name = "AbortError";
    throw abortError;
  } else if (result.state === WaiterState.TIMEOUT) {
    const timeoutError = new Error(`${JSON.stringify(__spreadProps(__spreadValues({}, result), {
      reason: "Waiter has timed out"
    }))}`);
    timeoutError.name = "TimeoutError";
    throw timeoutError;
  } else if (result.state !== WaiterState.SUCCESS) {
    throw new Error(`${JSON.stringify(result)}`);
  }
  return result;
};

// node_modules/@smithy/util-waiter/dist-es/poller.js
var exponentialBackoffWithJitter = (minDelay, maxDelay, attemptCeiling, attempt) => {
  if (attempt > attemptCeiling) return maxDelay;
  const delay = minDelay * 2 ** (attempt - 1);
  return randomInRange(minDelay, delay);
};
var randomInRange = (min, max) => min + Math.random() * (max - min);
var runPolling = (_0, _1, _2) => __async(void 0, [_0, _1, _2], function* ({
  minDelay,
  maxDelay,
  maxWaitTime,
  abortController,
  client,
  abortSignal
}, input, acceptorChecks) {
  const {
    state,
    reason
  } = yield acceptorChecks(client, input);
  if (state !== WaiterState.RETRY) {
    return {
      state,
      reason
    };
  }
  let currentAttempt = 1;
  const waitUntil = Date.now() + maxWaitTime * 1e3;
  const attemptCeiling = Math.log(maxDelay / minDelay) / Math.log(2) + 1;
  while (true) {
    if (abortController?.signal?.aborted || abortSignal?.aborted) {
      return {
        state: WaiterState.ABORTED
      };
    }
    const delay = exponentialBackoffWithJitter(minDelay, maxDelay, attemptCeiling, currentAttempt);
    if (Date.now() + delay * 1e3 > waitUntil) {
      return {
        state: WaiterState.TIMEOUT
      };
    }
    yield sleep(delay);
    const {
      state: state2,
      reason: reason2
    } = yield acceptorChecks(client, input);
    if (state2 !== WaiterState.RETRY) {
      return {
        state: state2,
        reason: reason2
      };
    }
    currentAttempt += 1;
  }
});

// node_modules/@smithy/util-waiter/dist-es/utils/validate.js
var validateWaiterOptions = (options) => {
  if (options.maxWaitTime < 1) {
    throw new Error(`WaiterConfiguration.maxWaitTime must be greater than 0`);
  } else if (options.minDelay < 1) {
    throw new Error(`WaiterConfiguration.minDelay must be greater than 0`);
  } else if (options.maxDelay < 1) {
    throw new Error(`WaiterConfiguration.maxDelay must be greater than 0`);
  } else if (options.maxWaitTime <= options.minDelay) {
    throw new Error(`WaiterConfiguration.maxWaitTime [${options.maxWaitTime}] must be greater than WaiterConfiguration.minDelay [${options.minDelay}] for this waiter`);
  } else if (options.maxDelay < options.minDelay) {
    throw new Error(`WaiterConfiguration.maxDelay [${options.maxDelay}] must be greater than WaiterConfiguration.minDelay [${options.minDelay}] for this waiter`);
  }
};

// node_modules/@smithy/util-waiter/dist-es/createWaiter.js
var abortTimeout = (abortSignal) => __async(void 0, null, function* () {
  return new Promise((resolve) => {
    const onAbort = () => resolve({
      state: WaiterState.ABORTED
    });
    if (typeof abortSignal.addEventListener === "function") {
      abortSignal.addEventListener("abort", onAbort);
    } else {
      abortSignal.onabort = onAbort;
    }
  });
});
var createWaiter = (options, input, acceptorChecks) => __async(void 0, null, function* () {
  const params = __spreadValues(__spreadValues({}, waiterServiceDefaults), options);
  validateWaiterOptions(params);
  const exitConditions = [runPolling(params, input, acceptorChecks)];
  if (options.abortController) {
    exitConditions.push(abortTimeout(options.abortController.signal));
  }
  if (options.abortSignal) {
    exitConditions.push(abortTimeout(options.abortSignal));
  }
  return Promise.race(exitConditions);
});

// node_modules/@aws-sdk/client-s3/dist-es/waiters/waitForBucketExists.js
var checkState = (client, input) => __async(void 0, null, function* () {
  let reason;
  try {
    const result = yield client.send(new HeadBucketCommand(input));
    reason = result;
    return {
      state: WaiterState.SUCCESS,
      reason
    };
  } catch (exception) {
    reason = exception;
    if (exception.name && exception.name == "NotFound") {
      return {
        state: WaiterState.RETRY,
        reason
      };
    }
  }
  return {
    state: WaiterState.RETRY,
    reason
  };
});
var waitForBucketExists = (params, input) => __async(void 0, null, function* () {
  const serviceDefaults = {
    minDelay: 5,
    maxDelay: 120
  };
  return createWaiter(__spreadValues(__spreadValues({}, serviceDefaults), params), input, checkState);
});
var waitUntilBucketExists = (params, input) => __async(void 0, null, function* () {
  const serviceDefaults = {
    minDelay: 5,
    maxDelay: 120
  };
  const result = yield createWaiter(__spreadValues(__spreadValues({}, serviceDefaults), params), input, checkState);
  return checkExceptions(result);
});

// node_modules/@aws-sdk/client-s3/dist-es/waiters/waitForBucketNotExists.js
var checkState2 = (client, input) => __async(void 0, null, function* () {
  let reason;
  try {
    const result = yield client.send(new HeadBucketCommand(input));
    reason = result;
  } catch (exception) {
    reason = exception;
    if (exception.name && exception.name == "NotFound") {
      return {
        state: WaiterState.SUCCESS,
        reason
      };
    }
  }
  return {
    state: WaiterState.RETRY,
    reason
  };
});
var waitForBucketNotExists = (params, input) => __async(void 0, null, function* () {
  const serviceDefaults = {
    minDelay: 5,
    maxDelay: 120
  };
  return createWaiter(__spreadValues(__spreadValues({}, serviceDefaults), params), input, checkState2);
});
var waitUntilBucketNotExists = (params, input) => __async(void 0, null, function* () {
  const serviceDefaults = {
    minDelay: 5,
    maxDelay: 120
  };
  const result = yield createWaiter(__spreadValues(__spreadValues({}, serviceDefaults), params), input, checkState2);
  return checkExceptions(result);
});

// node_modules/@aws-sdk/client-s3/dist-es/waiters/waitForObjectExists.js
var checkState3 = (client, input) => __async(void 0, null, function* () {
  let reason;
  try {
    const result = yield client.send(new HeadObjectCommand(input));
    reason = result;
    return {
      state: WaiterState.SUCCESS,
      reason
    };
  } catch (exception) {
    reason = exception;
    if (exception.name && exception.name == "NotFound") {
      return {
        state: WaiterState.RETRY,
        reason
      };
    }
  }
  return {
    state: WaiterState.RETRY,
    reason
  };
});
var waitForObjectExists = (params, input) => __async(void 0, null, function* () {
  const serviceDefaults = {
    minDelay: 5,
    maxDelay: 120
  };
  return createWaiter(__spreadValues(__spreadValues({}, serviceDefaults), params), input, checkState3);
});
var waitUntilObjectExists = (params, input) => __async(void 0, null, function* () {
  const serviceDefaults = {
    minDelay: 5,
    maxDelay: 120
  };
  const result = yield createWaiter(__spreadValues(__spreadValues({}, serviceDefaults), params), input, checkState3);
  return checkExceptions(result);
});

// node_modules/@aws-sdk/client-s3/dist-es/waiters/waitForObjectNotExists.js
var checkState4 = (client, input) => __async(void 0, null, function* () {
  let reason;
  try {
    const result = yield client.send(new HeadObjectCommand(input));
    reason = result;
  } catch (exception) {
    reason = exception;
    if (exception.name && exception.name == "NotFound") {
      return {
        state: WaiterState.SUCCESS,
        reason
      };
    }
  }
  return {
    state: WaiterState.RETRY,
    reason
  };
});
var waitForObjectNotExists = (params, input) => __async(void 0, null, function* () {
  const serviceDefaults = {
    minDelay: 5,
    maxDelay: 120
  };
  return createWaiter(__spreadValues(__spreadValues({}, serviceDefaults), params), input, checkState4);
});
var waitUntilObjectNotExists = (params, input) => __async(void 0, null, function* () {
  const serviceDefaults = {
    minDelay: 5,
    maxDelay: 120
  };
  const result = yield createWaiter(__spreadValues(__spreadValues({}, serviceDefaults), params), input, checkState4);
  return checkExceptions(result);
});
export {
  Command as $Command,
  AbortMultipartUploadCommand,
  AnalyticsFilter,
  AnalyticsS3ExportFileFormat,
  ArchiveStatus,
  BucketAccelerateStatus,
  BucketAlreadyExists,
  BucketAlreadyOwnedByYou,
  BucketCannedACL,
  BucketLocationConstraint,
  BucketLogsPermission,
  BucketType,
  BucketVersioningStatus,
  ChecksumAlgorithm,
  ChecksumMode,
  CompleteMultipartUploadCommand,
  CompleteMultipartUploadOutputFilterSensitiveLog,
  CompleteMultipartUploadRequestFilterSensitiveLog,
  CompressionType,
  CopyObjectCommand,
  CopyObjectOutputFilterSensitiveLog,
  CopyObjectRequestFilterSensitiveLog,
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  CreateMultipartUploadOutputFilterSensitiveLog,
  CreateMultipartUploadRequestFilterSensitiveLog,
  CreateSessionCommand,
  CreateSessionOutputFilterSensitiveLog,
  DataRedundancy,
  DeleteBucketAnalyticsConfigurationCommand,
  DeleteBucketCommand,
  DeleteBucketCorsCommand,
  DeleteBucketEncryptionCommand,
  DeleteBucketIntelligentTieringConfigurationCommand,
  DeleteBucketInventoryConfigurationCommand,
  DeleteBucketLifecycleCommand,
  DeleteBucketMetricsConfigurationCommand,
  DeleteBucketOwnershipControlsCommand,
  DeleteBucketPolicyCommand,
  DeleteBucketReplicationCommand,
  DeleteBucketTaggingCommand,
  DeleteBucketWebsiteCommand,
  DeleteMarkerReplicationStatus,
  DeleteObjectCommand,
  DeleteObjectTaggingCommand,
  DeleteObjectsCommand,
  DeletePublicAccessBlockCommand,
  EncodingType,
  EncryptionFilterSensitiveLog,
  Event,
  ExistingObjectReplicationStatus,
  ExpirationStatus,
  ExpressionType,
  FileHeaderInfo,
  FilterRuleName,
  GetBucketAccelerateConfigurationCommand,
  GetBucketAclCommand,
  GetBucketAnalyticsConfigurationCommand,
  GetBucketCorsCommand,
  GetBucketEncryptionCommand,
  GetBucketEncryptionOutputFilterSensitiveLog,
  GetBucketIntelligentTieringConfigurationCommand,
  GetBucketInventoryConfigurationCommand,
  GetBucketInventoryConfigurationOutputFilterSensitiveLog,
  GetBucketLifecycleConfigurationCommand,
  GetBucketLocationCommand,
  GetBucketLoggingCommand,
  GetBucketMetricsConfigurationCommand,
  GetBucketNotificationConfigurationCommand,
  GetBucketOwnershipControlsCommand,
  GetBucketPolicyCommand,
  GetBucketPolicyStatusCommand,
  GetBucketReplicationCommand,
  GetBucketRequestPaymentCommand,
  GetBucketTaggingCommand,
  GetBucketVersioningCommand,
  GetBucketWebsiteCommand,
  GetObjectAclCommand,
  GetObjectAttributesCommand,
  GetObjectAttributesRequestFilterSensitiveLog,
  GetObjectCommand,
  GetObjectLegalHoldCommand,
  GetObjectLockConfigurationCommand,
  GetObjectOutputFilterSensitiveLog,
  GetObjectRequestFilterSensitiveLog,
  GetObjectRetentionCommand,
  GetObjectTaggingCommand,
  GetObjectTorrentCommand,
  GetObjectTorrentOutputFilterSensitiveLog,
  GetPublicAccessBlockCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  HeadObjectOutputFilterSensitiveLog,
  HeadObjectRequestFilterSensitiveLog,
  IntelligentTieringAccessTier,
  IntelligentTieringStatus,
  InvalidObjectState,
  InventoryConfigurationFilterSensitiveLog,
  InventoryDestinationFilterSensitiveLog,
  InventoryEncryptionFilterSensitiveLog,
  InventoryFormat,
  InventoryFrequency,
  InventoryIncludedObjectVersions,
  InventoryOptionalField,
  InventoryS3BucketDestinationFilterSensitiveLog,
  JSONType,
  LifecycleRuleFilter,
  ListBucketAnalyticsConfigurationsCommand,
  ListBucketIntelligentTieringConfigurationsCommand,
  ListBucketInventoryConfigurationsCommand,
  ListBucketInventoryConfigurationsOutputFilterSensitiveLog,
  ListBucketMetricsConfigurationsCommand,
  ListBucketsCommand,
  ListDirectoryBucketsCommand,
  ListMultipartUploadsCommand,
  ListObjectVersionsCommand,
  ListObjectsCommand,
  ListObjectsV2Command,
  ListPartsCommand,
  ListPartsRequestFilterSensitiveLog,
  LocationType,
  MFADelete,
  MFADeleteStatus,
  MetadataDirective,
  MetricsFilter,
  MetricsStatus,
  NoSuchBucket,
  NoSuchKey,
  NoSuchUpload,
  NotFound,
  ObjectAlreadyInActiveTierError,
  ObjectAttributes,
  ObjectCannedACL,
  ObjectLockEnabled,
  ObjectLockLegalHoldStatus,
  ObjectLockMode,
  ObjectLockRetentionMode,
  ObjectNotInActiveTierError,
  ObjectOwnership,
  ObjectStorageClass,
  ObjectVersionStorageClass,
  OptionalObjectAttributes,
  OutputLocationFilterSensitiveLog,
  OwnerOverride,
  PartitionDateSource,
  Payer,
  Permission,
  Protocol,
  PutBucketAccelerateConfigurationCommand,
  PutBucketAclCommand,
  PutBucketAnalyticsConfigurationCommand,
  PutBucketCorsCommand,
  PutBucketEncryptionCommand,
  PutBucketEncryptionRequestFilterSensitiveLog,
  PutBucketIntelligentTieringConfigurationCommand,
  PutBucketInventoryConfigurationCommand,
  PutBucketInventoryConfigurationRequestFilterSensitiveLog,
  PutBucketLifecycleConfigurationCommand,
  PutBucketLoggingCommand,
  PutBucketMetricsConfigurationCommand,
  PutBucketNotificationConfigurationCommand,
  PutBucketOwnershipControlsCommand,
  PutBucketPolicyCommand,
  PutBucketReplicationCommand,
  PutBucketRequestPaymentCommand,
  PutBucketTaggingCommand,
  PutBucketVersioningCommand,
  PutBucketWebsiteCommand,
  PutObjectAclCommand,
  PutObjectCommand,
  PutObjectLegalHoldCommand,
  PutObjectLockConfigurationCommand,
  PutObjectOutputFilterSensitiveLog,
  PutObjectRequestFilterSensitiveLog,
  PutObjectRetentionCommand,
  PutObjectTaggingCommand,
  PutPublicAccessBlockCommand,
  QuoteFields,
  ReplicaModificationsStatus,
  ReplicationRuleFilter,
  ReplicationRuleStatus,
  ReplicationStatus,
  ReplicationTimeStatus,
  RequestCharged,
  RequestPayer,
  RestoreObjectCommand,
  RestoreObjectRequestFilterSensitiveLog,
  RestoreRequestFilterSensitiveLog,
  RestoreRequestType,
  S3,
  S3Client,
  S3LocationFilterSensitiveLog,
  S3ServiceException,
  SSEKMSFilterSensitiveLog,
  SelectObjectContentCommand,
  SelectObjectContentEventStream,
  SelectObjectContentEventStreamFilterSensitiveLog,
  SelectObjectContentOutputFilterSensitiveLog,
  SelectObjectContentRequestFilterSensitiveLog,
  ServerSideEncryption,
  ServerSideEncryptionByDefaultFilterSensitiveLog,
  ServerSideEncryptionConfigurationFilterSensitiveLog,
  ServerSideEncryptionRuleFilterSensitiveLog,
  SessionCredentialsFilterSensitiveLog,
  SessionMode,
  SseKmsEncryptedObjectsStatus,
  StorageClass,
  StorageClassAnalysisSchemaVersion,
  TaggingDirective,
  Tier,
  TransitionStorageClass,
  Type,
  UploadPartCommand,
  UploadPartCopyCommand,
  UploadPartCopyOutputFilterSensitiveLog,
  UploadPartCopyRequestFilterSensitiveLog,
  UploadPartOutputFilterSensitiveLog,
  UploadPartRequestFilterSensitiveLog,
  WriteGetObjectResponseCommand,
  WriteGetObjectResponseRequestFilterSensitiveLog,
  Client as __Client,
  paginateListBuckets,
  paginateListDirectoryBuckets,
  paginateListObjectsV2,
  paginateListParts,
  waitForBucketExists,
  waitForBucketNotExists,
  waitForObjectExists,
  waitForObjectNotExists,
  waitUntilBucketExists,
  waitUntilBucketNotExists,
  waitUntilObjectExists,
  waitUntilObjectNotExists
};
/*! Bundled license information:

bowser/src/bowser.js:
  (*!
   * Bowser - a browser detector
   * https://github.com/lancedikson/bowser
   * MIT License | (c) Dustin Diaz 2012-2015
   * MIT License | (c) Denis Demchenko 2015-2019
   *)
*/
//# sourceMappingURL=@aws-sdk_client-s3.js.map
