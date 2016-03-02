define(function (require, exports, module) {(function () {
    "use strict";
    /**
     *
     * @param capacity , optional , set to Number.MAX_VALUE if not provided
     * @constructor
     */
    function LinkedDeque(capacity) {
        this._capacity = typeof capacity === 'number' ? capacity : Number.MAX_VALUE;
        this._tail = this._head = null;
        this._size = 0;
    }

    /**
     * Nodes of a doubly linked list
     * @param prev
     * @param obj
     * @param next
     * @constructor
     */
    function QEntry(prev, obj, next) {
        if (typeof obj === 'undefined' || obj === null) {
            throw new Error('Null or Undefined values are not supported');
        }
        this.item = obj;
        this.prev = prev;
        this.next = next;
    }

    LinkedDeque.prototype.unshift =
        LinkedDeque.prototype.offerFirst = function (item) {
            if (this._size >= this._capacity)return false;
            var head = this._head,
                entry = new QEntry(null, item, head);
            if (!this._tail) {
                this._tail = entry;
            } else {
                head.prev = entry;
            }
            this._head = entry;
            this._size++;
            return true;
        };

    LinkedDeque.prototype.push =
        LinkedDeque.prototype.offerLast = function (item) {
            if (this._size >= this._capacity)return false;
            var tail = this._tail,
                entry = new QEntry(tail, item, null);
            if (!this._head) {
                this._head = entry;
            } else {
                tail.next = entry;
            }
            this._tail = entry;
            this._size++;
            return true;
        };

    LinkedDeque.prototype.shift =
        LinkedDeque.prototype.pollFirst = function () {
            if (this._size <= 0)return null;
            var ret = this._head,
                next = ret.next;
            if (!next) {
                this._head = this._tail = null;
            } else {
                next.prev = null;
                ret.next = null;
            }
            this._head = next;
            this._size--;
            return ret.item;
        };

    LinkedDeque.prototype.pop =
        LinkedDeque.prototype.pollLast = function () {
            if (this._size <= 0)return null;
            var ret = this._tail,
                prev = ret.prev;
            if (!prev) {
                this._head = this._tail = null;
            } else {
                prev.next = null;
                ret.prev = null;
            }
            this._tail = prev;
            this._size--;
            return ret.item;
        };

    LinkedDeque.prototype.toArray = function () {
        var head = this._head,
            arr = [];
        while (head) {
            arr.push(head.item);
            head = head.next;
        }
        return arr;
    };

    LinkedDeque.prototype.clear = function () {
        var first = this._head,
            next = first;
        while (next) {
            first.prev = null;
            next = first.next;
            first.next = null;
        }
        delete this._head;
        delete this._tail;
        this._head = this._tail = null;
        this._size = 0;
    };


    LinkedDeque.prototype.size = function () {
        return this._size;
    };


    module.exports = LinkedDeque;

}());
});
