
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const WHOLE_NOTE_TICKS = 384;

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const lemonade = {
        songTitle: "Lemonade",
        segments: [
            {
                position: 0,
                duration: 768,
                chords: [
                    {
                        position: 384,
                        duration: 96,
                        charIndex: 17,
                        data: "Bb"
                    },
                    {
                        position: 576,
                        duration: 96,
                        charIndex: 25,
                        data: "F"
                    },
                    {
                        position: 720,
                        duration: 96,
                        charIndex: 33,
                        data: "C"
                    }
                ],
                leadVocal: {
                    lyric: "Just tell me his name"
                }
            },
            {
                position: 0,
                duration: 768,
                chords: [
                    {
                        position: 0,
                        duration: 96,
                        charIndex: 0,
                        data: "Dm"
                    },
                    {
                        position: 384,
                        duration: 96,
                        charIndex: 17,
                        data: "Bb"
                    },
                    {
                        position: 576,
                        duration: 96,
                        charIndex: 25,
                        data: "F"
                    },
                    {
                        position: 720,
                        duration: 96,
                        charIndex: 33,
                        data: "C"
                    }
                ],
                leadVocal: {
                    lyric: "Just tell me you didn't get laid in our bedroom"
                }
            }
        ]
    };
    const dirtbag$1 = {
        songTitle: "Teenage Dirtbag",
        segments: [
            {
                position: 0,
                duration: 384,
                chords: [
                    {
                        position: 48,
                        duration: 192,
                        charIndex: 4,
                        data: "E"
                    },
                    {
                        position: 240,
                        duration: 192,
                        charIndex: 13,
                        data: "B"
                    }
                ],
                leadVocal: {
                    lyric: "Her name is Noelle",
                    melodyNodes: []
                }
            }
        ]
    };
    const emptySong = lemonade;
    localStorage.getItem("song") || JSON.stringify(lemonade);
    // export const song = writable<ISong>(JSON.parse(storedSong));
    const song = writable(dirtbag$1);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /**
     * Lodash (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */

    var lodash_merge = createCommonjsModule(function (module, exports) {
    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used to detect hot functions by number of calls within a span of milliseconds. */
    var HOT_COUNT = 800,
        HOT_SPAN = 16;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        asyncTag = '[object AsyncFunction]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        nullTag = '[object Null]',
        objectTag = '[object Object]',
        proxyTag = '[object Proxy]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        undefinedTag = '[object Undefined]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    /* Node.js helper references. */
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString.call(Object);

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Built-in value references. */
    var Buffer = moduleExports ? root.Buffer : undefined,
        Symbol = root.Symbol,
        Uint8Array = root.Uint8Array,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
        getPrototype = overArg(Object.getPrototypeOf, Object),
        objectCreate = Object.create,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice,
        symToStringTag = Symbol ? Symbol.toStringTag : undefined;

    var defineProperty = (function() {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
        nativeMax = Math.max,
        nativeNow = Date.now;

    /* Built-in method references that are verified to be native. */
    var Map = getNative(root, 'Map'),
        nativeCreate = getNative(Object, 'create');

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
    }

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
      return this;
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * This function is like `assignValue` except that it doesn't assign
     * `undefined` values.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignMergeValue(object, key, value) {
      if ((value !== undefined && !eq(object[key], value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without support for multiple sources.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} [customizer] The function to customize merged values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack);
        if (isObject(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        }
        else {
          var newValue = customizer
            ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
            : undefined;

          if (newValue === undefined) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }

    /**
     * A specialized version of `baseMerge` for arrays and objects which performs
     * deep merges and tracks traversed objects enabling objects with circular
     * references to be merged.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {string} key The key of the value to merge.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} mergeFunc The function to merge values.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key),
          srcValue = safeGet(source, key),
          stacked = stack.get(srcValue);

      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer
        ? customizer(objValue, srcValue, (key + ''), object, source, stack)
        : undefined;

      var isCommon = newValue === undefined;

      if (isCommon) {
        var isArr = isArray(srcValue),
            isBuff = !isArr && isBuffer(srcValue),
            isTyped = !isArr && !isBuff && isTypedArray(srcValue);

        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          }
          else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          }
          else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          }
          else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          }
          else {
            newValue = [];
          }
        }
        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          }
          else if (!isObject(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        }
        else {
          isCommon = false;
        }
      }
      if (isCommon) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack['delete'](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }

    /**
     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     */
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + '');
    }

    /**
     * The base implementation of `setToString` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant(string),
        'writable': true
      });
    };

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }

    /**
     * Creates a function like `_.assign`.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined,
            guard = length > 2 ? sources[2] : undefined;

        customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined;

        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? undefined : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
    }

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike(object) && isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq(object[index], value);
      }
      return false;
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

      return value === proto;
    }

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    /**
     * A specialized version of `baseRest` which transforms the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @param {Function} transform The rest array transform.
     * @returns {Function} Returns the new function.
     */
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }

    /**
     * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function safeGet(object, key) {
      if (key === 'constructor' && typeof object[key] === 'function') {
        return;
      }

      if (key == '__proto__') {
        return;
      }

      return object[key];
    }

    /**
     * Sets the `toString` method of `func` to return `string`.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var setToString = shortOut(baseSetToString);

    /**
     * Creates a function that'll short out and invoke `identity` instead
     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
     * milliseconds.
     *
     * @private
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new shortable function.
     */
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;

      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString.call(Ctor) == objectCtorString;
    }

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /**
     * Converts `value` to a plain object flattening inherited enumerable string
     * keyed properties of `value` to own properties of the plain object.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Object} Returns the converted plain object.
     * @example
     *
     * function Foo() {
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.assign({ 'a': 1 }, new Foo);
     * // => { 'a': 1, 'b': 2 }
     *
     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
     * // => { 'a': 1, 'b': 2, 'c': 3 }
     */
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }

    /**
     * This method is like `_.assign` except that it recursively merges own and
     * inherited enumerable string keyed properties of source objects into the
     * destination object. Source properties that resolve to `undefined` are
     * skipped if a destination value exists. Array and plain object properties
     * are merged recursively. Other objects and value types are overridden by
     * assignment. Source objects are applied from left to right. Subsequent
     * sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {
     *   'a': [{ 'b': 2 }, { 'd': 4 }]
     * };
     *
     * var other = {
     *   'a': [{ 'c': 3 }, { 'e': 5 }]
     * };
     *
     * _.merge(object, other);
     * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
     */
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    module.exports = merge;
    });

    /**
     * Fill a string with a repeated character
     *
     * @param character
     * @param repetition
     */
    const fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);

    function isNamed(src) {
        return src !== null && typeof src === "object" && typeof src.name === "string"
            ? true
            : false;
    }

    function isPitch(pitch) {
        return pitch !== null &&
            typeof pitch === "object" &&
            typeof pitch.step === "number" &&
            typeof pitch.alt === "number"
            ? true
            : false;
    }
    // The number of fifths of [C, D, E, F, G, A, B]
    const FIFTHS = [0, 2, 4, -1, 1, 3, 5];
    // The number of octaves it span each step
    const STEPS_TO_OCTS = FIFTHS.map((fifths) => Math.floor((fifths * 7) / 12));
    function encode(pitch) {
        const { step, alt, oct, dir = 1 } = pitch;
        const f = FIFTHS[step] + 7 * alt;
        if (oct === undefined) {
            return [dir * f];
        }
        const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
        return [dir * f, dir * o];
    }
    // We need to get the steps from fifths
    // Fifths for CDEFGAB are [ 0, 2, 4, -1, 1, 3, 5 ]
    // We add 1 to fifths to avoid negative numbers, so:
    // for ["F", "C", "G", "D", "A", "E", "B"] we have:
    const FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
    function decode(coord) {
        const [f, o, dir] = coord;
        const step = FIFTHS_TO_STEPS[unaltered(f)];
        const alt = Math.floor((f + 1) / 7);
        if (o === undefined) {
            return { step, alt, dir };
        }
        const oct = o + 4 * alt + STEPS_TO_OCTS[step];
        return { step, alt, oct, dir };
    }
    // Return the number of fifths as if it were unaltered
    function unaltered(f) {
        const i = (f + 1) % 7;
        return i < 0 ? 7 + i : i;
    }

    const NoNote = { empty: true, name: "", pc: "", acc: "" };
    const cache$1 = new Map();
    const stepToLetter = (step) => "CDEFGAB".charAt(step);
    const altToAcc = (alt) => alt < 0 ? fillStr("b", -alt) : fillStr("#", alt);
    const accToAlt = (acc) => acc[0] === "b" ? -acc.length : acc.length;
    /**
     * Given a note literal (a note name or a note object), returns the Note object
     * @example
     * note('Bb4') // => { name: "Bb4", midi: 70, chroma: 10, ... }
     */
    function note(src) {
        const cached = cache$1.get(src);
        if (cached) {
            return cached;
        }
        const value = typeof src === "string"
            ? parse$1(src)
            : isPitch(src)
                ? note(pitchName$1(src))
                : isNamed(src)
                    ? note(src.name)
                    : NoNote;
        cache$1.set(src, value);
        return value;
    }
    const REGEX$1 = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;
    /**
     * @private
     */
    function tokenizeNote(str) {
        const m = REGEX$1.exec(str);
        return [m[1].toUpperCase(), m[2].replace(/x/g, "##"), m[3], m[4]];
    }
    /**
     * @private
     */
    function coordToNote(noteCoord) {
        return note(decode(noteCoord));
    }
    const mod = (n, m) => ((n % m) + m) % m;
    const SEMI = [0, 2, 4, 5, 7, 9, 11];
    function parse$1(noteName) {
        const tokens = tokenizeNote(noteName);
        if (tokens[0] === "" || tokens[3] !== "") {
            return NoNote;
        }
        const letter = tokens[0];
        const acc = tokens[1];
        const octStr = tokens[2];
        const step = (letter.charCodeAt(0) + 3) % 7;
        const alt = accToAlt(acc);
        const oct = octStr.length ? +octStr : undefined;
        const coord = encode({ step, alt, oct });
        const name = letter + acc + octStr;
        const pc = letter + acc;
        const chroma = (SEMI[step] + alt + 120) % 12;
        const height = oct === undefined
            ? mod(SEMI[step] + alt, 12) - 12 * 99
            : SEMI[step] + alt + 12 * (oct + 1);
        const midi = height >= 0 && height <= 127 ? height : null;
        const freq = oct === undefined ? null : Math.pow(2, (height - 69) / 12) * 440;
        return {
            empty: false,
            acc,
            alt,
            chroma,
            coord,
            freq,
            height,
            letter,
            midi,
            name,
            oct,
            pc,
            step,
        };
    }
    function pitchName$1(props) {
        const { step, alt, oct } = props;
        const letter = stepToLetter(step);
        if (!letter) {
            return "";
        }
        const pc = letter + altToAcc(alt);
        return oct || oct === 0 ? pc + oct : pc;
    }

    const NoInterval = { empty: true, name: "", acc: "" };
    // shorthand tonal notation (with quality after number)
    const INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
    // standard shorthand notation (with quality before number)
    const INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
    const REGEX$2 = new RegExp("^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$");
    /**
     * @private
     */
    function tokenizeInterval(str) {
        const m = REGEX$2.exec(`${str}`);
        if (m === null) {
            return ["", ""];
        }
        return m[1] ? [m[1], m[2]] : [m[4], m[3]];
    }
    const cache$2 = {};
    /**
     * Get interval properties. It returns an object with:
     *
     * - name: the interval name
     * - num: the interval number
     * - type: 'perfectable' or 'majorable'
     * - q: the interval quality (d, m, M, A)
     * - dir: interval direction (1 ascending, -1 descending)
     * - simple: the simplified number
     * - semitones: the size in semitones
     * - chroma: the interval chroma
     *
     * @param {string} interval - the interval name
     * @return {Object} the interval properties
     *
     * @example
     * import { interval } from '@tonaljs/core'
     * interval('P5').semitones // => 7
     * interval('m3').type // => 'majorable'
     */
    function interval(src) {
        return typeof src === "string"
            ? cache$2[src] || (cache$2[src] = parse(src))
            : isPitch(src)
                ? interval(pitchName(src))
                : isNamed(src)
                    ? interval(src.name)
                    : NoInterval;
    }
    const SIZES = [0, 2, 4, 5, 7, 9, 11];
    const TYPES = "PMMPPMM";
    function parse(str) {
        const tokens = tokenizeInterval(str);
        if (tokens[0] === "") {
            return NoInterval;
        }
        const num = +tokens[0];
        const q = tokens[1];
        const step = (Math.abs(num) - 1) % 7;
        const t = TYPES[step];
        if (t === "M" && q === "P") {
            return NoInterval;
        }
        const type = t === "M" ? "majorable" : "perfectable";
        const name = "" + num + q;
        const dir = num < 0 ? -1 : 1;
        const simple = num === 8 || num === -8 ? num : dir * (step + 1);
        const alt = qToAlt(type, q);
        const oct = Math.floor((Math.abs(num) - 1) / 7);
        const semitones = dir * (SIZES[step] + alt + 12 * oct);
        const chroma = (((dir * (SIZES[step] + alt)) % 12) + 12) % 12;
        const coord = encode({ step, alt, oct, dir });
        return {
            empty: false,
            name,
            num,
            q,
            step,
            alt,
            dir,
            type,
            simple,
            semitones,
            chroma,
            coord,
            oct,
        };
    }
    function qToAlt(type, q) {
        return (q === "M" && type === "majorable") ||
            (q === "P" && type === "perfectable")
            ? 0
            : q === "m" && type === "majorable"
                ? -1
                : /^A+$/.test(q)
                    ? q.length
                    : /^d+$/.test(q)
                        ? -1 * (type === "perfectable" ? q.length : q.length + 1)
                        : 0;
    }
    // return the interval name of a pitch
    function pitchName(props) {
        const { step, alt, oct = 0, dir } = props;
        if (!dir) {
            return "";
        }
        const calcNum = step + 1 + 7 * oct;
        // this is an edge case: descending pitch class unison (see #243)
        const num = calcNum === 0 ? step + 1 : calcNum;
        const d = dir < 0 ? "-" : "";
        const type = TYPES[step] === "M" ? "majorable" : "perfectable";
        const name = d + num + altToQ(type, alt);
        return name;
    }
    function altToQ(type, alt) {
        if (alt === 0) {
            return type === "majorable" ? "M" : "P";
        }
        else if (alt === -1 && type === "majorable") {
            return "m";
        }
        else if (alt > 0) {
            return fillStr("A", alt);
        }
        else {
            return fillStr("d", type === "perfectable" ? alt : alt + 1);
        }
    }

    /**
     * Transpose a note by an interval.
     *
     * @param {string} note - the note or note name
     * @param {string} interval - the interval or interval name
     * @return {string} the transposed note name or empty string if not valid notes
     * @example
     * import { tranpose } from "@tonaljs/core"
     * transpose("d3", "3M") // => "F#3"
     * transpose("D", "3M") // => "F#"
     * ["C", "D", "E", "F", "G"].map(pc => transpose(pc, "M3)) // => ["E", "F#", "G#", "A", "B"]
     */
    function transpose(noteName, intervalName) {
        const note$1 = note(noteName);
        const interval$1 = interval(intervalName);
        if (note$1.empty || interval$1.empty) {
            return "";
        }
        const noteCoord = note$1.coord;
        const intervalCoord = interval$1.coord;
        const tr = noteCoord.length === 1
            ? [noteCoord[0] + intervalCoord[0]]
            : [noteCoord[0] + intervalCoord[0], noteCoord[1] + intervalCoord[1]];
        return coordToNote(tr).name;
    }

    // ascending range
    /**
     * Rotates a list a number of times. It"s completly agnostic about the
     * contents of the list.
     *
     * @param {Integer} times - the number of rotations
     * @param {Array} collection
     * @return {Array} the rotated collection
     *
     * @example
     * rotate(1, [1, 2, 3]) // => [2, 3, 1]
     */
    function rotate(times, arr) {
        const len = arr.length;
        const n = ((times % len) + len) % len;
        return arr.slice(n, len).concat(arr.slice(0, n));
    }

    const EmptyPcset = {
        empty: true,
        name: "",
        setNum: 0,
        chroma: "000000000000",
        normalized: "000000000000",
        intervals: [],
    };
    // UTILITIES
    const setNumToChroma = (num) => Number(num).toString(2);
    const chromaToNumber = (chroma) => parseInt(chroma, 2);
    const REGEX = /^[01]{12}$/;
    function isChroma(set) {
        return REGEX.test(set);
    }
    const isPcsetNum = (set) => typeof set === "number" && set >= 0 && set <= 4095;
    const isPcset = (set) => set && isChroma(set.chroma);
    const cache = { [EmptyPcset.chroma]: EmptyPcset };
    /**
     * Get the pitch class set of a collection of notes or set number or chroma
     */
    function get$2(src) {
        const chroma = isChroma(src)
            ? src
            : isPcsetNum(src)
                ? setNumToChroma(src)
                : Array.isArray(src)
                    ? listToChroma(src)
                    : isPcset(src)
                        ? src.chroma
                        : EmptyPcset.chroma;
        return (cache[chroma] = cache[chroma] || chromaToPcset(chroma));
    }
    const IVLS = [
        "1P",
        "2m",
        "2M",
        "3m",
        "3M",
        "4P",
        "5d",
        "5P",
        "6m",
        "6M",
        "7m",
        "7M",
    ];
    /**
     * @private
     * Get the intervals of a pcset *starting from C*
     * @param {Set} set - the pitch class set
     * @return {IntervalName[]} an array of interval names or an empty array
     * if not a valid pitch class set
     */
    function chromaToIntervals(chroma) {
        const intervals = [];
        for (let i = 0; i < 12; i++) {
            // tslint:disable-next-line:curly
            if (chroma.charAt(i) === "1")
                intervals.push(IVLS[i]);
        }
        return intervals;
    }
    //// PRIVATE ////
    function chromaRotations(chroma) {
        const binary = chroma.split("");
        return binary.map((_, i) => rotate(i, binary).join(""));
    }
    function chromaToPcset(chroma) {
        const setNum = chromaToNumber(chroma);
        const normalizedNum = chromaRotations(chroma)
            .map(chromaToNumber)
            .filter((n) => n >= 2048)
            .sort()[0];
        const normalized = setNumToChroma(normalizedNum);
        const intervals = chromaToIntervals(chroma);
        return {
            empty: false,
            name: "",
            setNum,
            chroma,
            normalized,
            intervals,
        };
    }
    function listToChroma(set) {
        if (set.length === 0) {
            return EmptyPcset.chroma;
        }
        let pitch;
        const binary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < set.length; i++) {
            pitch = note(set[i]);
            // tslint:disable-next-line: curly
            if (pitch.empty)
                pitch = interval(set[i]);
            // tslint:disable-next-line: curly
            if (!pitch.empty)
                binary[pitch.chroma] = 1;
        }
        return binary.join("");
    }

    /**
     * @private
     * Chord List
     * Source: https://en.wikibooks.org/wiki/Music_Theory/Complete_List_of_Chord_Patterns
     * Format: ["intervals", "full name", "abrv1 abrv2"]
     */
    const CHORDS = [
        // ==Major==
        ["1P 3M 5P", "major", "M ^ "],
        ["1P 3M 5P 7M", "major seventh", "maj7 Δ ma7 M7 Maj7 ^7"],
        ["1P 3M 5P 7M 9M", "major ninth", "maj9 Δ9 ^9"],
        ["1P 3M 5P 7M 9M 13M", "major thirteenth", "maj13 Maj13 ^13"],
        ["1P 3M 5P 6M", "sixth", "6 add6 add13 M6"],
        ["1P 3M 5P 6M 9M", "sixth/ninth", "6/9 69 M69"],
        ["1P 3M 6m 7M", "major seventh flat sixth", "M7b6 ^7b6"],
        [
            "1P 3M 5P 7M 11A",
            "major seventh sharp eleventh",
            "maj#4 Δ#4 Δ#11 M7#11 ^7#11 maj7#11",
        ],
        // ==Minor==
        // '''Normal'''
        ["1P 3m 5P", "minor", "m min -"],
        ["1P 3m 5P 7m", "minor seventh", "m7 min7 mi7 -7"],
        [
            "1P 3m 5P 7M",
            "minor/major seventh",
            "m/ma7 m/maj7 mM7 mMaj7 m/M7 -Δ7 mΔ -^7",
        ],
        ["1P 3m 5P 6M", "minor sixth", "m6 -6"],
        ["1P 3m 5P 7m 9M", "minor ninth", "m9 -9"],
        ["1P 3m 5P 7M 9M", "minor/major ninth", "mM9 mMaj9 -^9"],
        ["1P 3m 5P 7m 9M 11P", "minor eleventh", "m11 -11"],
        ["1P 3m 5P 7m 9M 13M", "minor thirteenth", "m13 -13"],
        // '''Diminished'''
        ["1P 3m 5d", "diminished", "dim ° o"],
        ["1P 3m 5d 7d", "diminished seventh", "dim7 °7 o7"],
        ["1P 3m 5d 7m", "half-diminished", "m7b5 ø -7b5 h7 h"],
        // ==Dominant/Seventh==
        // '''Normal'''
        ["1P 3M 5P 7m", "dominant seventh", "7 dom"],
        ["1P 3M 5P 7m 9M", "dominant ninth", "9"],
        ["1P 3M 5P 7m 9M 13M", "dominant thirteenth", "13"],
        ["1P 3M 5P 7m 11A", "lydian dominant seventh", "7#11 7#4"],
        // '''Altered'''
        ["1P 3M 5P 7m 9m", "dominant flat ninth", "7b9"],
        ["1P 3M 5P 7m 9A", "dominant sharp ninth", "7#9"],
        ["1P 3M 7m 9m", "altered", "alt7"],
        // '''Suspended'''
        ["1P 4P 5P", "suspended fourth", "sus4 sus"],
        ["1P 2M 5P", "suspended second", "sus2"],
        ["1P 4P 5P 7m", "suspended fourth seventh", "7sus4 7sus"],
        ["1P 5P 7m 9M 11P", "eleventh", "11"],
        [
            "1P 4P 5P 7m 9m",
            "suspended fourth flat ninth",
            "b9sus phryg 7b9sus 7b9sus4",
        ],
        // ==Other==
        ["1P 5P", "fifth", "5"],
        ["1P 3M 5A", "augmented", "aug + +5 ^#5"],
        ["1P 3m 5A", "minor augmented", "m#5 -#5 m+"],
        ["1P 3M 5A 7M", "augmented seventh", "maj7#5 maj7+5 +maj7 ^7#5"],
        [
            "1P 3M 5P 7M 9M 11A",
            "major sharp eleventh (lydian)",
            "maj9#11 Δ9#11 ^9#11",
        ],
        // ==Legacy==
        ["1P 2M 4P 5P", "", "sus24 sus4add9"],
        ["1P 3M 5A 7M 9M", "", "maj9#5 Maj9#5"],
        ["1P 3M 5A 7m", "", "7#5 +7 7+ 7aug aug7"],
        ["1P 3M 5A 7m 9A", "", "7#5#9 7#9#5 7alt"],
        ["1P 3M 5A 7m 9M", "", "9#5 9+"],
        ["1P 3M 5A 7m 9M 11A", "", "9#5#11"],
        ["1P 3M 5A 7m 9m", "", "7#5b9 7b9#5"],
        ["1P 3M 5A 7m 9m 11A", "", "7#5b9#11"],
        ["1P 3M 5A 9A", "", "+add#9"],
        ["1P 3M 5A 9M", "", "M#5add9 +add9"],
        ["1P 3M 5P 6M 11A", "", "M6#11 M6b5 6#11 6b5"],
        ["1P 3M 5P 6M 7M 9M", "", "M7add13"],
        ["1P 3M 5P 6M 9M 11A", "", "69#11"],
        ["1P 3m 5P 6M 9M", "", "m69 -69"],
        ["1P 3M 5P 6m 7m", "", "7b6"],
        ["1P 3M 5P 7M 9A 11A", "", "maj7#9#11"],
        ["1P 3M 5P 7M 9M 11A 13M", "", "M13#11 maj13#11 M13+4 M13#4"],
        ["1P 3M 5P 7M 9m", "", "M7b9"],
        ["1P 3M 5P 7m 11A 13m", "", "7#11b13 7b5b13"],
        ["1P 3M 5P 7m 13M", "", "7add6 67 7add13"],
        ["1P 3M 5P 7m 9A 11A", "", "7#9#11 7b5#9 7#9b5"],
        ["1P 3M 5P 7m 9A 11A 13M", "", "13#9#11"],
        ["1P 3M 5P 7m 9A 11A 13m", "", "7#9#11b13"],
        ["1P 3M 5P 7m 9A 13M", "", "13#9"],
        ["1P 3M 5P 7m 9A 13m", "", "7#9b13"],
        ["1P 3M 5P 7m 9M 11A", "", "9#11 9+4 9#4"],
        ["1P 3M 5P 7m 9M 11A 13M", "", "13#11 13+4 13#4"],
        ["1P 3M 5P 7m 9M 11A 13m", "", "9#11b13 9b5b13"],
        ["1P 3M 5P 7m 9m 11A", "", "7b9#11 7b5b9 7b9b5"],
        ["1P 3M 5P 7m 9m 11A 13M", "", "13b9#11"],
        ["1P 3M 5P 7m 9m 11A 13m", "", "7b9b13#11 7b9#11b13 7b5b9b13"],
        ["1P 3M 5P 7m 9m 13M", "", "13b9"],
        ["1P 3M 5P 7m 9m 13m", "", "7b9b13"],
        ["1P 3M 5P 7m 9m 9A", "", "7b9#9"],
        ["1P 3M 5P 9M", "", "Madd9 2 add9 add2"],
        ["1P 3M 5P 9m", "", "Maddb9"],
        ["1P 3M 5d", "", "Mb5"],
        ["1P 3M 5d 6M 7m 9M", "", "13b5"],
        ["1P 3M 5d 7M", "", "M7b5"],
        ["1P 3M 5d 7M 9M", "", "M9b5"],
        ["1P 3M 5d 7m", "", "7b5"],
        ["1P 3M 5d 7m 9M", "", "9b5"],
        ["1P 3M 7m", "", "7no5"],
        ["1P 3M 7m 13m", "", "7b13"],
        ["1P 3M 7m 9M", "", "9no5"],
        ["1P 3M 7m 9M 13M", "", "13no5"],
        ["1P 3M 7m 9M 13m", "", "9b13"],
        ["1P 3m 4P 5P", "", "madd4"],
        ["1P 3m 5P 6m 7M", "", "mMaj7b6"],
        ["1P 3m 5P 6m 7M 9M", "", "mMaj9b6"],
        ["1P 3m 5P 7m 11P", "", "m7add11 m7add4"],
        ["1P 3m 5P 9M", "", "madd9"],
        ["1P 3m 5d 6M 7M", "", "o7M7"],
        ["1P 3m 5d 7M", "", "oM7"],
        ["1P 3m 6m 7M", "", "mb6M7"],
        ["1P 3m 6m 7m", "", "m7#5"],
        ["1P 3m 6m 7m 9M", "", "m9#5"],
        ["1P 3m 5A 7m 9M 11P", "", "m11A"],
        ["1P 3m 6m 9m", "", "mb6b9"],
        ["1P 2M 3m 5d 7m", "", "m9b5"],
        ["1P 4P 5A 7M", "", "M7#5sus4"],
        ["1P 4P 5A 7M 9M", "", "M9#5sus4"],
        ["1P 4P 5A 7m", "", "7#5sus4"],
        ["1P 4P 5P 7M", "", "M7sus4"],
        ["1P 4P 5P 7M 9M", "", "M9sus4"],
        ["1P 4P 5P 7m 9M", "", "9sus4 9sus"],
        ["1P 4P 5P 7m 9M 13M", "", "13sus4 13sus"],
        ["1P 4P 5P 7m 9m 13m", "", "7sus4b9b13 7b9b13sus4"],
        ["1P 4P 7m 10m", "", "4 quartal"],
        ["1P 5P 7m 9m 11P", "", "11b9"],
    ];

    ({
        ...EmptyPcset,
        name: "",
        quality: "Unknown",
        intervals: [],
        aliases: [],
    });
    let dictionary = [];
    let index$2 = {};
    /**
     * Add a chord to the dictionary.
     * @param intervals
     * @param aliases
     * @param [fullName]
     */
    function add$1(intervals, aliases, fullName) {
        const quality = getQuality(intervals);
        const chord = {
            ...get$2(intervals),
            name: fullName || "",
            quality,
            intervals,
            aliases,
        };
        dictionary.push(chord);
        if (chord.name) {
            index$2[chord.name] = chord;
        }
        index$2[chord.setNum] = chord;
        index$2[chord.chroma] = chord;
        chord.aliases.forEach((alias) => addAlias$1(chord, alias));
    }
    function addAlias$1(chord, alias) {
        index$2[alias] = chord;
    }
    function getQuality(intervals) {
        const has = (interval) => intervals.indexOf(interval) !== -1;
        return has("5A")
            ? "Augmented"
            : has("3M")
                ? "Major"
                : has("5d")
                    ? "Diminished"
                    : has("3m")
                        ? "Minor"
                        : "Unknown";
    }
    CHORDS.forEach(([ivls, fullName, names]) => add$1(ivls.split(" "), names.split(" "), fullName));
    dictionary.sort((a, b) => a.setNum - b.setNum);

    // SCALES
    // Format: ["intervals", "name", "alias1", "alias2", ...]
    const SCALES = [
        // 5-note scales
        ["1P 2M 3M 5P 6M", "major pentatonic", "pentatonic"],
        ["1P 3M 4P 5P 7M", "ionian pentatonic"],
        ["1P 3M 4P 5P 7m", "mixolydian pentatonic", "indian"],
        ["1P 2M 4P 5P 6M", "ritusen"],
        ["1P 2M 4P 5P 7m", "egyptian"],
        ["1P 3M 4P 5d 7m", "neopolitan major pentatonic"],
        ["1P 3m 4P 5P 6m", "vietnamese 1"],
        ["1P 2m 3m 5P 6m", "pelog"],
        ["1P 2m 4P 5P 6m", "kumoijoshi"],
        ["1P 2M 3m 5P 6m", "hirajoshi"],
        ["1P 2m 4P 5d 7m", "iwato"],
        ["1P 2m 4P 5P 7m", "in-sen"],
        ["1P 3M 4A 5P 7M", "lydian pentatonic", "chinese"],
        ["1P 3m 4P 6m 7m", "malkos raga"],
        ["1P 3m 4P 5d 7m", "locrian pentatonic", "minor seven flat five pentatonic"],
        ["1P 3m 4P 5P 7m", "minor pentatonic", "vietnamese 2"],
        ["1P 3m 4P 5P 6M", "minor six pentatonic"],
        ["1P 2M 3m 5P 6M", "flat three pentatonic", "kumoi"],
        ["1P 2M 3M 5P 6m", "flat six pentatonic"],
        ["1P 2m 3M 5P 6M", "scriabin"],
        ["1P 3M 5d 6m 7m", "whole tone pentatonic"],
        ["1P 3M 4A 5A 7M", "lydian #5P pentatonic"],
        ["1P 3M 4A 5P 7m", "lydian dominant pentatonic"],
        ["1P 3m 4P 5P 7M", "minor #7M pentatonic"],
        ["1P 3m 4d 5d 7m", "super locrian pentatonic"],
        // 6-note scales
        ["1P 2M 3m 4P 5P 7M", "minor hexatonic"],
        ["1P 2A 3M 5P 5A 7M", "augmented"],
        ["1P 2M 3m 3M 5P 6M", "major blues"],
        ["1P 2M 4P 5P 6M 7m", "piongio"],
        ["1P 2m 3M 4A 6M 7m", "prometheus neopolitan"],
        ["1P 2M 3M 4A 6M 7m", "prometheus"],
        ["1P 2m 3M 5d 6m 7m", "mystery #1"],
        ["1P 2m 3M 4P 5A 6M", "six tone symmetric"],
        ["1P 2M 3M 4A 5A 7m", "whole tone", "messiaen's mode #1"],
        ["1P 2m 4P 4A 5P 7M", "messiaen's mode #5"],
        ["1P 3m 4P 5d 5P 7m", "minor blues", "blues"],
        // 7-note scales
        ["1P 2M 3M 4P 5d 6m 7m", "locrian major", "arabian"],
        ["1P 2m 3M 4A 5P 6m 7M", "double harmonic lydian"],
        ["1P 2M 3m 4P 5P 6m 7M", "harmonic minor"],
        [
            "1P 2m 2A 3M 4A 6m 7m",
            "altered",
            "super locrian",
            "diminished whole tone",
            "pomeroy",
        ],
        ["1P 2M 3m 4P 5d 6m 7m", "locrian #2", "half-diminished", "aeolian b5"],
        [
            "1P 2M 3M 4P 5P 6m 7m",
            "mixolydian b6",
            "melodic minor fifth mode",
            "hindu",
        ],
        ["1P 2M 3M 4A 5P 6M 7m", "lydian dominant", "lydian b7", "overtone"],
        ["1P 2M 3M 4A 5P 6M 7M", "lydian"],
        ["1P 2M 3M 4A 5A 6M 7M", "lydian augmented"],
        [
            "1P 2m 3m 4P 5P 6M 7m",
            "dorian b2",
            "phrygian #6",
            "melodic minor second mode",
        ],
        ["1P 2M 3m 4P 5P 6M 7M", "melodic minor"],
        ["1P 2m 3m 4P 5d 6m 7m", "locrian"],
        [
            "1P 2m 3m 4d 5d 6m 7d",
            "ultralocrian",
            "superlocrian bb7",
            "superlocrian diminished",
        ],
        ["1P 2m 3m 4P 5d 6M 7m", "locrian 6", "locrian natural 6", "locrian sharp 6"],
        ["1P 2A 3M 4P 5P 5A 7M", "augmented heptatonic"],
        // Source https://en.wikipedia.org/wiki/Ukrainian_Dorian_scale
        [
            "1P 2M 3m 4A 5P 6M 7m",
            "dorian #4",
            "ukrainian dorian",
            "romanian minor",
            "altered dorian",
        ],
        ["1P 2M 3m 4A 5P 6M 7M", "lydian diminished"],
        ["1P 2m 3m 4P 5P 6m 7m", "phrygian"],
        ["1P 2M 3M 4A 5A 7m 7M", "leading whole tone"],
        ["1P 2M 3M 4A 5P 6m 7m", "lydian minor"],
        ["1P 2m 3M 4P 5P 6m 7m", "phrygian dominant", "spanish", "phrygian major"],
        ["1P 2m 3m 4P 5P 6m 7M", "balinese"],
        ["1P 2m 3m 4P 5P 6M 7M", "neopolitan major"],
        ["1P 2M 3m 4P 5P 6m 7m", "aeolian", "minor"],
        ["1P 2M 3M 4P 5P 6m 7M", "harmonic major"],
        ["1P 2m 3M 4P 5P 6m 7M", "double harmonic major", "gypsy"],
        ["1P 2M 3m 4P 5P 6M 7m", "dorian"],
        ["1P 2M 3m 4A 5P 6m 7M", "hungarian minor"],
        ["1P 2A 3M 4A 5P 6M 7m", "hungarian major"],
        ["1P 2m 3M 4P 5d 6M 7m", "oriental"],
        ["1P 2m 3m 3M 4A 5P 7m", "flamenco"],
        ["1P 2m 3m 4A 5P 6m 7M", "todi raga"],
        ["1P 2M 3M 4P 5P 6M 7m", "mixolydian", "dominant"],
        ["1P 2m 3M 4P 5d 6m 7M", "persian"],
        ["1P 2M 3M 4P 5P 6M 7M", "major", "ionian"],
        ["1P 2m 3M 5d 6m 7m 7M", "enigmatic"],
        [
            "1P 2M 3M 4P 5A 6M 7M",
            "major augmented",
            "major #5",
            "ionian augmented",
            "ionian #5",
        ],
        ["1P 2A 3M 4A 5P 6M 7M", "lydian #9"],
        // 8-note scales
        ["1P 2m 2M 4P 4A 5P 6m 7M", "messiaen's mode #4"],
        ["1P 2m 3M 4P 4A 5P 6m 7M", "purvi raga"],
        ["1P 2m 3m 3M 4P 5P 6m 7m", "spanish heptatonic"],
        ["1P 2M 3M 4P 5P 6M 7m 7M", "bebop"],
        ["1P 2M 3m 3M 4P 5P 6M 7m", "bebop minor"],
        ["1P 2M 3M 4P 5P 5A 6M 7M", "bebop major"],
        ["1P 2m 3m 4P 5d 5P 6m 7m", "bebop locrian"],
        ["1P 2M 3m 4P 5P 6m 7m 7M", "minor bebop"],
        ["1P 2M 3m 4P 5d 6m 6M 7M", "diminished", "whole-half diminished"],
        ["1P 2M 3M 4P 5d 5P 6M 7M", "ichikosucho"],
        ["1P 2M 3m 4P 5P 6m 6M 7M", "minor six diminished"],
        [
            "1P 2m 3m 3M 4A 5P 6M 7m",
            "half-whole diminished",
            "dominant diminished",
            "messiaen's mode #2",
        ],
        ["1P 3m 3M 4P 5P 6M 7m 7M", "kafi raga"],
        ["1P 2M 3M 4P 4A 5A 6A 7M", "messiaen's mode #6"],
        // 9-note scales
        ["1P 2M 3m 3M 4P 5d 5P 6M 7m", "composite blues"],
        ["1P 2M 3m 3M 4A 5P 6m 7m 7M", "messiaen's mode #3"],
        // 10-note scales
        ["1P 2m 2M 3m 4P 4A 5P 6m 6M 7M", "messiaen's mode #7"],
        // 12-note scales
        ["1P 2m 2M 3m 3M 4P 5d 5P 6m 6M 7m 7M", "chromatic"],
    ];

    const NoScaleType = {
        ...EmptyPcset,
        intervals: [],
        aliases: [],
    };
    let index$1 = {};
    /**
     * Given a scale name or chroma, return the scale properties
     *
     * @param {string} type - scale name or pitch class set chroma
     * @example
     * import { get } from 'tonaljs/scale-type'
     * get('major') // => { name: 'major', ... }
     */
    function get$1(type) {
        return index$1[type] || NoScaleType;
    }
    /**
     * Add a scale into dictionary
     * @param intervals
     * @param name
     * @param aliases
     */
    function add(intervals, name, aliases = []) {
        const scale = { ...get$2(intervals), name, intervals, aliases };
        index$1[scale.name] = scale;
        index$1[scale.setNum] = scale;
        index$1[scale.chroma] = scale;
        scale.aliases.forEach((alias) => addAlias(scale, alias));
        return scale;
    }
    function addAlias(scale, alias) {
        index$1[alias] = scale;
    }
    SCALES.forEach(([ivls, name, ...aliases]) => add(ivls.split(" "), name, aliases));

    Object.freeze([]);

    const MODES = [
        [0, 2773, 0, "ionian", "", "Maj7", "major"],
        [1, 2902, 2, "dorian", "m", "m7"],
        [2, 3418, 4, "phrygian", "m", "m7"],
        [3, 2741, -1, "lydian", "", "Maj7"],
        [4, 2774, 1, "mixolydian", "", "7"],
        [5, 2906, 3, "aeolian", "m", "m7", "minor"],
        [6, 3434, 5, "locrian", "dim", "m7b5"],
    ];
    const NoMode = {
        ...EmptyPcset,
        name: "",
        alt: 0,
        modeNum: NaN,
        triad: "",
        seventh: "",
        aliases: [],
    };
    const modes = MODES.map(toMode);
    const index = {};
    modes.forEach((mode) => {
        index[mode.name] = mode;
        mode.aliases.forEach((alias) => {
            index[alias] = mode;
        });
    });
    /**
     * Get a Mode by it's name
     *
     * @example
     * get('dorian')
     * // =>
     * // {
     * //   intervals: [ '1P', '2M', '3m', '4P', '5P', '6M', '7m' ],
     * //   modeNum: 1,
     * //   chroma: '101101010110',
     * //   normalized: '101101010110',
     * //   name: 'dorian',
     * //   setNum: 2902,
     * //   alt: 2,
     * //   triad: 'm',
     * //   seventh: 'm7',
     * //   aliases: []
     * // }
     */
    function get(name) {
        return typeof name === "string"
            ? index[name.toLowerCase()] || NoMode
            : name && name.name
                ? get(name.name)
                : NoMode;
    }
    function toMode(mode) {
        const [modeNum, setNum, alt, name, triad, seventh, alias] = mode;
        const aliases = alias ? [alias] : [];
        const chroma = Number(setNum).toString(2);
        const intervals = get$1(name).intervals;
        return {
            empty: false,
            intervals,
            modeNum,
            chroma,
            normalized: chroma,
            name,
            setNum,
            alt,
            triad,
            seventh,
            aliases,
        };
    }
    function chords(chords) {
        return (modeName, tonic) => {
            const mode = get(modeName);
            if (mode.empty)
                return [];
            const triads = rotate(mode.modeNum, chords);
            const tonics = mode.intervals.map((i) => transpose(tonic, i));
            return triads.map((triad, i) => tonics[i] + triad);
        };
    }
    chords(MODES.map((x) => x[4]));
    chords(MODES.map((x) => x[5]));

    const dirtbag = {
        title: "Teenage Dirtbag",
        artist: "Wheatus",
        sections: [
            {
                title: "Section",
                lines: [
                    {
                        lyric: "",
                        chords: "",
                    },
                ],
            },
        ],
    };
    const storedSketch = localStorage.getItem("sketch") || JSON.stringify(dirtbag);
    // export const song = writable<ISong>(JSON.parse(storedSong));
    writable(JSON.parse(storedSketch));

    /* src/sketch/SongParser.svelte generated by Svelte v3.49.0 */
    const file$1 = "src/sketch/SongParser.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let textarea;
    	let t;
    	let div1;
    	let raw_value = /*parse*/ ctx[1](/*song*/ ctx[0]) + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			textarea = element("textarea");
    			t = space();
    			div1 = element("div");
    			add_location(textarea, file$1, 9, 4, 235);
    			attr_dev(div0, "class", "input");
    			add_location(div0, file$1, 8, 2, 211);
    			attr_dev(div1, "class", "output");
    			add_location(div1, file$1, 12, 2, 288);
    			attr_dev(div2, "class", "sketch-container svelte-1jfewva");
    			add_location(div2, file$1, 7, 0, 178);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*song*/ ctx[0]);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			div1.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*song*/ 1) {
    				set_input_value(textarea, /*song*/ ctx[0]);
    			}

    			if (dirty & /*song*/ 1 && raw_value !== (raw_value = /*parse*/ ctx[1](/*song*/ ctx[0]) + "")) div1.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SongParser', slots, []);
    	let song = "";

    	const parse = song => {
    		return song.split('\n').map(line => `<div>${line}</div>`).join("");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SongParser> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		song = this.value;
    		$$invalidate(0, song);
    	}

    	$$self.$capture_state = () => ({ song, parse });

    	$$self.$inject_state = $$props => {
    		if ('song' in $$props) $$invalidate(0, song = $$props.song);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [song, parse, textarea_input_handler];
    }

    class SongParser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongParser",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let main;
    	let songparser;
    	let current;
    	songparser = new SongParser({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			main = element("main");
    			create_component(songparser.$$.fragment);
    			attr_dev(main, "class", "song svelte-tp47nt");
    			add_location(main, file, 36, 2, 1036);
    			attr_dev(div, "class", "songbook-container svelte-tp47nt");
    			add_location(div, file, 35, 0, 1001);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, main);
    			mount_component(songparser, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(songparser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(songparser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(songparser);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $song;
    	validate_store(song, 'song');
    	component_subscribe($$self, song, $$value => $$invalidate(0, $song = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let initialLyrics = "Her name is Noelle\nI had a dream about her";

    	const generateLyricsTrack = () => {
    		const nodes = initialLyrics.split("\n").map((node, index) => {
    			return {
    				data: node,
    				position: index * WHOLE_NOTE_TICKS,
    				duration: WHOLE_NOTE_TICKS
    			};
    		});

    		song.set(lodash_merge($song, { tracks: [{ type: "lyrics", nodes }] }));
    	};

    	song.subscribe(value => {
    		localStorage.setItem("song", JSON.stringify(value));
    	});

    	const clearStorage = () => {
    		song.set(emptySong);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		WHOLE_NOTE_TICKS,
    		emptySong,
    		song,
    		merge: lodash_merge,
    		SongParser,
    		initialLyrics,
    		generateLyricsTrack,
    		clearStorage,
    		$song
    	});

    	$$self.$inject_state = $$props => {
    		if ('initialLyrics' in $$props) initialLyrics = $$props.initialLyrics;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
