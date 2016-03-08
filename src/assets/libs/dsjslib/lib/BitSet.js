define(function (require, exports, module) {(function () {
    "use strict";

    var ADDRESS_BITS_PER_WORD = 5;//32 bits
    var BITS_PER_WORD = 1 << ADDRESS_BITS_PER_WORD;

    function BitSet(size) {
        var arr = [];
        this._wordsUsed = ( size && typeof size === 'number') ?
            (((size - 1) >> ADDRESS_BITS_PER_WORD) + 1) : 1;
        for (var i = 0; i < this._wordsUsed; i++) {
            arr[i] = 0;
        }
        this._words = arr;

    }

    BitSet.prototype.set = function (bitIndex) {
        var wordIndex = _getWordIndex(bitIndex);
        var actualIndex = bitIndex & 0X1F;
        if (wordIndex < this._wordsUsed) {
            this._words[wordIndex] |= 1 << actualIndex;
        }
    };

    BitSet.prototype.get = function (bitIndex) {
        var wordIndex = _getWordIndex(bitIndex);
        var actualIndex = bitIndex & 0X1F;
        return(wordIndex < this._wordsUsed) && (
            ((this._words[wordIndex]) & (1 << actualIndex) ) !== 0
            );

    };

    BitSet.prototype.clear = function (bitIndex) {
        var wordIndex = _getWordIndex(bitIndex);
        var actualIndex = bitIndex & 0X1F;

        if (wordIndex < this._wordsUsed) {
            this._words[wordIndex] &= ~(1 << actualIndex);
        }

    };

    /**
     * Return the number of bits set to true in this
     * BitSet
     * Courtesy Hacker's Delight 5.1
     */
    BitSet.prototype.cardinality = function () {
        return this._words.reduce(function (sum, w) {
            w = w - ((w >>> 1) & 0x55555555);
            w = (w & 0x33333333) + ((w >>> 2) & 0x33333333);
            w = (w + (w >>> 4)) & 0x0f0f0f0f;
            w = w + (w >>> 8);
            w = w + (w >>> 16);
            return sum + (w & 0x3F);

        }, 0);

    };


    BitSet.prototype.size = function () {
        return this._wordsUsed * BITS_PER_WORD;
    };

    function _getWordIndex(bitIndex) {
        if ((typeof bitIndex !== 'number') || bitIndex < 0)
            throw new Error("Invalid Parameter " + bitIndex);
        return bitIndex >> ADDRESS_BITS_PER_WORD;

    }


    module.exports = BitSet;


})();
});
