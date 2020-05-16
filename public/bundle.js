
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var rngBrowser = createCommonjsModule(function (module) {
    // Unique ID creation requires a high quality random # generator.  In the
    // browser this is a little complicated due to unknown quality of Math.random()
    // and inconsistent support for the `crypto` API.  We do the best we can via
    // feature-detection

    // getRandomValues needs to be invoked in a context where "this" is a Crypto
    // implementation. Also, find the complete implementation of crypto on IE11.
    var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                          (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

    if (getRandomValues) {
      // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
      var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

      module.exports = function whatwgRNG() {
        getRandomValues(rnds8);
        return rnds8;
      };
    } else {
      // Math.random()-based (RNG)
      //
      // If all else fails, use Math.random().  It's fast, but is of unspecified
      // quality.
      var rnds = new Array(16);

      module.exports = function mathRNG() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
          rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return rnds;
      };
    }
    });

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */
    var byteToHex = [];
    for (var i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 0x100).toString(16).substr(1);
    }

    function bytesToUuid(buf, offset) {
      var i = offset || 0;
      var bth = byteToHex;
      // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
      return ([bth[buf[i++]], bth[buf[i++]], 
    	bth[buf[i++]], bth[buf[i++]], '-',
    	bth[buf[i++]], bth[buf[i++]], '-',
    	bth[buf[i++]], bth[buf[i++]], '-',
    	bth[buf[i++]], bth[buf[i++]], '-',
    	bth[buf[i++]], bth[buf[i++]],
    	bth[buf[i++]], bth[buf[i++]],
    	bth[buf[i++]], bth[buf[i++]]]).join('');
    }

    var bytesToUuid_1 = bytesToUuid;

    function v4(options, buf, offset) {
      var i = buf && offset || 0;

      if (typeof(options) == 'string') {
        buf = options === 'binary' ? new Array(16) : null;
        options = null;
      }
      options = options || {};

      var rnds = options.random || (options.rng || rngBrowser)();

      // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
      rnds[6] = (rnds[6] & 0x0f) | 0x40;
      rnds[8] = (rnds[8] & 0x3f) | 0x80;

      // Copy bytes to buffer, if provided
      if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
          buf[i + ii] = rnds[ii];
        }
      }

      return buf || bytesToUuid_1(rnds);
    }

    var v4_1 = v4;

    const ingridients_ = writable([]);
    const mainIngridients_ = writable([]);
    const fetchedRecepies_ = writable([]);

    const customIngridients = {
      subscribe: ingridients_.subscribe,
      addIngridients: (name, ingredientId) =>
        ingridients_.update((ingridients) => [
          ...ingridients,
          { name, ingredientId, id: v4_1() },
        ]),
      deleteIngridients: (id) =>
        ingridients_.update((ingridients) =>
          ingridients.filter((ingridient) => ingridient.id !== id)
        ),
    };
    const customMainIngridients = {
      subscribe: mainIngridients_.subscribe,
      addMainIngridient: (name, ingredientId) =>
        mainIngridients_.update((mainIngridients) => [
          ...mainIngridients,
          { name, ingredientId, id: v4_1() },
        ]),
      deleteMainIngridient: (id) =>
        mainIngridients_.update((mainIngridients) =>
          mainIngridients.filter((mainIngridient) => mainIngridient.id !== id)
        ),
    };

    const fetchedRecepies = {
      subscribe: fetchedRecepies_.subscribe,
      setFetchedRecepies: (data) => fetchedRecepies_.set(data),
    };

    /* src\components\Chip.svelte generated by Svelte v3.20.1 */
    const file = "src\\components\\Chip.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-bripnz-style";
    	style.textContent = ".todo-item.svelte-bripnz{display:inline-flex;border-radius:6px;padding:5px;color:#fff;margin-top:8px;margin-right:8px}.remove-item.svelte-bripnz{padding-left:10px}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hpcC5zdmVsdGUiLCJzb3VyY2VzIjpbIkNoaXAuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XHJcbiAgaW1wb3J0IHsgY3VzdG9tSW5ncmlkaWVudHMsIGN1c3RvbU1haW5JbmdyaWRpZW50cyB9IGZyb20gXCIuLi9zdG9yZVwiO1xyXG4gIGV4cG9ydCBsZXQgaWQ7XHJcbiAgZXhwb3J0IGxldCBuYW1lO1xyXG4gIGV4cG9ydCBsZXQgY29sb3I7XHJcbiAgY29uc3QgcmVtb3ZlID0gKGlkKSA9PiB7XHJcbiAgICBjdXN0b21JbmdyaWRpZW50cy5kZWxldGVJbmdyaWRpZW50cyhpZCk7XHJcbiAgICBjdXN0b21NYWluSW5ncmlkaWVudHMuZGVsZXRlTWFpbkluZ3JpZGllbnQoaWQpO1xyXG4gIH07XHJcbjwvc2NyaXB0PlxyXG48ZGl2IGNsYXNzPVwidG9kby1pdGVtXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB7Y29sb3J9XCI+XHJcbiAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA2MDA7XCI+e25hbWV9PC9kaXY+XHJcbiAgPGRpdiBjbGFzcz1cInJlbW92ZS1pdGVtXCIgb246Y2xpY2s9XCJ7KCk9PnJlbW92ZShpZCl9XCI+XHJcbiAgICB4XHJcbiAgPC9kaXY+XHJcbjwvZGl2PlxyXG5cclxuPHN0eWxlPlxyXG4gIC50b2RvLWl0ZW0ge1xyXG4gICAgZGlzcGxheTogaW5saW5lLWZsZXg7XHJcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XHJcbiAgICBwYWRkaW5nOiA1cHg7XHJcbiAgICBjb2xvcjogI2ZmZjtcclxuICAgIG1hcmdpbi10b3A6IDhweDtcclxuICAgIG1hcmdpbi1yaWdodDogOHB4O1xyXG4gIH1cclxuICAucmVtb3ZlLWl0ZW0ge1xyXG4gICAgcGFkZGluZy1sZWZ0OiAxMHB4O1xyXG4gIH1cclxuPC9zdHlsZT5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCRSxVQUFVLGNBQUMsQ0FBQyxBQUNWLE9BQU8sQ0FBRSxXQUFXLENBQ3BCLGFBQWEsQ0FBRSxHQUFHLENBQ2xCLE9BQU8sQ0FBRSxHQUFHLENBQ1osS0FBSyxDQUFFLElBQUksQ0FDWCxVQUFVLENBQUUsR0FBRyxDQUNmLFlBQVksQ0FBRSxHQUFHLEFBQ25CLENBQUMsQUFDRCxZQUFZLGNBQUMsQ0FBQyxBQUNaLFlBQVksQ0FBRSxJQUFJLEFBQ3BCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function create_fragment(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "x";
    			set_style(div0, "font-weight", "600");
    			add_location(div0, file, 11, 2, 340);
    			attr_dev(div1, "class", "remove-item svelte-bripnz");
    			add_location(div1, file, 12, 2, 387);
    			attr_dev(div2, "class", "todo-item svelte-bripnz");
    			set_style(div2, "background", /*color*/ ctx[2]);
    			add_location(div2, file, 10, 0, 285);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if (remount) dispose();
    			dispose = listen_dev(div1, "click", /*click_handler*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);

    			if (dirty & /*color*/ 4) {
    				set_style(div2, "background", /*color*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			dispose();
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
    	let { id } = $$props;
    	let { name } = $$props;
    	let { color } = $$props;

    	const remove = id => {
    		customIngridients.deleteIngridients(id);
    		customMainIngridients.deleteMainIngridient(id);
    	};

    	const writable_props = ["id", "name", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chip> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Chip", $$slots, []);
    	const click_handler = () => remove(id);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		customIngridients,
    		customMainIngridients,
    		id,
    		name,
    		color,
    		remove
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, name, color, remove, click_handler];
    }

    class Chip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-bripnz-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { id: 0, name: 1, color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chip",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Chip> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<Chip> was created without expected prop 'name'");
    		}

    		if (/*color*/ ctx[2] === undefined && !("color" in props)) {
    			console.warn("<Chip> was created without expected prop 'color'");
    		}
    	}

    	get id() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Autocomplete.svelte generated by Svelte v3.20.1 */
    const file$1 = "src\\components\\Autocomplete.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-63qac3-style";
    	style.textContent = ".svelte-63qac3{box-sizing:border-box}input.svelte-63qac3{height:2rem;font-size:1rem;padding:0.25rem 0.5rem}.autocomplete.svelte-63qac3{position:relative}.hide-results.svelte-63qac3{display:none}.autocomplete-results.svelte-63qac3{padding:0;margin:0;height:6rem;overflow:auto;width:100%;background-color:white;box-shadow:2px 2px 24px rgba(0, 0, 0, 0.1);position:absolute;z-index:100}.autocomplete-result.svelte-63qac3{color:#7a7a7a;list-style:none;text-align:left;height:2rem;padding:0.25rem 0.5rem;cursor:pointer}.autocomplete-result.svelte-63qac3>span{background-color:none;color:#242424;font-weight:bold}.autocomplete-result.is-active.svelte-63qac3,.autocomplete-result.svelte-63qac3:hover{background-color:#dbdbdb}.form-field.svelte-63qac3{--color:var(--border-hover);outline:none;display:block;width:100%;-webkit-appearance:none;background:#fff;border:1px solid var(--border);padding:8px 16px;line-height:22px;font-size:16px;font-weight:500;color:var(--input-color);border-radius:6px;transition:border 0.3s ease}.form-field.svelte-63qac3::placeholder{color:var(--border-hover)}.form-field.svelte-63qac3:focus{outline:none;border-color:var(--color)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b2NvbXBsZXRlLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQXV0b2NvbXBsZXRlLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxyXG4gIGltcG9ydCB7IGN1c3RvbUluZ3JpZGllbnRzLCBjdXN0b21NYWluSW5ncmlkaWVudHMgfSBmcm9tIFwiLi4vc3RvcmVcIjtcclxuICBjb25zdCByZWdFeHBFc2NhcGUgPSAocykgPT4ge1xyXG4gICAgcmV0dXJuIHMucmVwbGFjZSgvWy1cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKTtcclxuICB9O1xyXG5cclxuICBleHBvcnQgbGV0IG5hbWUgPSBcIlwiO1xyXG4gIGV4cG9ydCBsZXQgdmFsdWUgPSBcIlwiO1xyXG4gIGV4cG9ydCBsZXQgcGxhY2Vob2xkZXIgPSBcIlwiO1xyXG4gIGV4cG9ydCBsZXQgcmVxdWlyZWQgPSBmYWxzZTtcclxuICBleHBvcnQgbGV0IGRpc2FibGVkID0gZmFsc2U7XHJcbiAgZXhwb3J0IGxldCBtYWluSW5ncmlkaWVudHMgPSBmYWxzZTtcclxuXHJcbiAgLy8gYXV0b2NvbXBsZXRlIHByb3BzXHJcbiAgZXhwb3J0IGxldCBpdGVtcyA9IFtdO1xyXG4gIGV4cG9ydCBsZXQgaXNPcGVuID0gZmFsc2U7XHJcbiAgZXhwb3J0IGxldCByZXN1bHRzID0gW107XHJcbiAgZXhwb3J0IGxldCBzZWFyY2ggPSBcIlwiO1xyXG4gIGV4cG9ydCBsZXQgYXJyb3dDb3VudGVyID0gMDtcclxuXHJcbiAgbGV0IGNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgbGV0IGlzQXN5bmMgPSBmYWxzZTtcclxuICBsZXQgbWluQ2hhciA9IDI7XHJcbiAgbGV0IG1heEl0ZW1zID0gNTtcclxuICBsZXQgZnJvbVN0YXJ0ID0gdHJ1ZTsgLy8gRGVmYXVsdCB0eXBlIGFoZWFkXHJcbiAgbGV0IGxpc3Q7XHJcbiAgbGV0IGlucHV0O1xyXG4gIGxldCBhZGRlZEluZ3JlZGllbnRzID0gW107XHJcbiAgbGV0IG5leHRJZCA9IDI7XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIG9uQ2hhbmdlKGV2ZW50KSB7XHJcbiAgICBzZWFyY2gubGVuZ3RoID49IE51bWJlcihtaW5DaGFyKTtcclxuICAgIGZpbHRlclJlc3VsdHMoKTtcclxuICAgIGlzT3BlbiA9IHRydWU7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGZpbHRlclJlc3VsdHMoKSB7XHJcbiAgICByZXN1bHRzID0gaXRlbXNcclxuICAgICAgLmZpbHRlcigoaXRlbSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBmcm9tU3RhcnRcclxuICAgICAgICAgID8gaXRlbS5uYW1lLnRvVXBwZXJDYXNlKCkuc3RhcnRzV2l0aChzZWFyY2gudG9VcHBlckNhc2UoKSlcclxuICAgICAgICAgIDogaXRlbS5uYW1lLnRvVXBwZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoLnRvVXBwZXJDYXNlKCkpO1xyXG4gICAgICB9KVxyXG4gICAgICAubWFwKChpdGVtKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGl0ZW0ubmFtZTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAga2V5OiB0ZXh0LFxyXG4gICAgICAgICAgdmFsdWU6IGl0ZW0udmFsdWUgfHwgaXRlbSxcclxuICAgICAgICAgIGxhYmVsOlxyXG4gICAgICAgICAgICBzZWFyY2gudHJpbSgpID09PSBcIlwiXHJcbiAgICAgICAgICAgICAgPyB0ZXh0XHJcbiAgICAgICAgICAgICAgOiB0ZXh0LnJlcGxhY2UoXHJcbiAgICAgICAgICAgICAgICAgIFJlZ0V4cChyZWdFeHBFc2NhcGUoc2VhcmNoLnRyaW0oKSksIFwiaVwiKSxcclxuICAgICAgICAgICAgICAgICAgXCI8c3Bhbj4kJjwvc3Bhbj5cIlxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICB9O1xyXG4gICAgICB9KVxyXG4gICAgICAuc2xpY2UoMCwgNik7XHJcbiAgICBjb25zdCBoZWlnaHQgPSByZXN1bHRzLmxlbmd0aCA+IG1heEl0ZW1zID8gbWF4SXRlbXMgOiByZXN1bHRzLmxlbmd0aDtcclxuICAgIGxpc3QgPyAobGlzdC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHQgKiAyLjV9cmVtYCkgOiBcIjBweFwiO1xyXG4gIH1cclxuICBmdW5jdGlvbiBvbktleURvd24oZXZlbnQpIHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlID09PSA0MCAmJiBhcnJvd0NvdW50ZXIgPCByZXN1bHRzLmxlbmd0aCkge1xyXG4gICAgICAvLyBBcnJvd0Rvd25cclxuICAgICAgYXJyb3dDb3VudGVyID0gYXJyb3dDb3VudGVyICsgMTtcclxuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzggJiYgYXJyb3dDb3VudGVyID4gMCkge1xyXG4gICAgICAvLyBBcnJvd1VwXHJcbiAgICAgIGFycm93Q291bnRlciA9IGFycm93Q291bnRlciAtIDE7XHJcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgIC8vIEVudGVyXHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGlmIChhcnJvd0NvdW50ZXIgPT09IC0xKSB7XHJcbiAgICAgICAgYXJyb3dDb3VudGVyID0gMDsgLy8gRGVmYXVsdCBzZWxlY3QgZmlyc3QgaXRlbSBvZiBsaXN0XHJcbiAgICAgIH1cclxuICAgICAgY2xvc2UoYXJyb3dDb3VudGVyKTtcclxuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMjcpIHtcclxuICAgICAgLy8gRXNjYXBlXHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGNsb3NlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGNsb3NlKGluZGV4ID0gLTEpIHtcclxuICAgIGlzT3BlbiA9IGZhbHNlO1xyXG4gICAgYXJyb3dDb3VudGVyID0gLTE7XHJcbiAgICBpbnB1dC5ibHVyKCk7XHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICB2YWx1ZSA9IHJlc3VsdHNbaW5kZXhdLnZhbHVlLm5hbWU7XHJcbiAgICAgIGxldCBpbmdyZWRpZW50SWQgPSByZXN1bHRzW2luZGV4XS52YWx1ZS5pbmdyZWRpZW50SWQ7XHJcbiAgICAgIGlmIChtYWluSW5ncmlkaWVudHMpIHtcclxuICAgICAgICBjdXN0b21NYWluSW5ncmlkaWVudHMuYWRkTWFpbkluZ3JpZGllbnQodmFsdWUsIGluZ3JlZGllbnRJZCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VzdG9tSW5ncmlkaWVudHMuYWRkSW5ncmlkaWVudHModmFsdWUsIGluZ3JlZGllbnRJZCk7XHJcbiAgICAgIH1cclxuICAgICAgc2VhcmNoID0gXCJcIjtcclxuICAgICAgaW5wdXQuZm9jdXMoKTtcclxuICAgIH0gZWxzZSBpZiAoIXZhbHVlKSB7XHJcbiAgICAgIC8vc2VhcmNoID0gXCJcIjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRlc3QoKSB7XHJcbiAgICBpZiAoc2VhcmNoKSB7XHJcbiAgICAgIGlzT3BlbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG48L3NjcmlwdD5cclxuXHJcbjxzdHlsZT5cclxuICAqIHtcclxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XHJcbiAgfVxyXG5cclxuICBpbnB1dCB7XHJcbiAgICBoZWlnaHQ6IDJyZW07XHJcbiAgICBmb250LXNpemU6IDFyZW07XHJcbiAgICBwYWRkaW5nOiAwLjI1cmVtIDAuNXJlbTtcclxuICB9XHJcblxyXG4gIC5hdXRvY29tcGxldGUge1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gIH1cclxuXHJcbiAgLmhpZGUtcmVzdWx0cyB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gIH1cclxuXHJcbiAgLmF1dG9jb21wbGV0ZS1yZXN1bHRzIHtcclxuICAgIHBhZGRpbmc6IDA7XHJcbiAgICBtYXJnaW46IDA7XHJcbiAgICBoZWlnaHQ6IDZyZW07XHJcbiAgICBvdmVyZmxvdzogYXV0bztcclxuICAgIHdpZHRoOiAxMDAlO1xyXG5cclxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xyXG4gICAgYm94LXNoYWRvdzogMnB4IDJweCAyNHB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIHotaW5kZXg6IDEwMDtcclxuICB9XHJcblxyXG4gIC5hdXRvY29tcGxldGUtcmVzdWx0IHtcclxuICAgIGNvbG9yOiAjN2E3YTdhO1xyXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgICBoZWlnaHQ6IDJyZW07XHJcbiAgICBwYWRkaW5nOiAwLjI1cmVtIDAuNXJlbTtcclxuICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICB9XHJcblxyXG4gIC5hdXRvY29tcGxldGUtcmVzdWx0ID4gOmdsb2JhbChzcGFuKSB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiBub25lO1xyXG4gICAgY29sb3I6ICMyNDI0MjQ7XHJcbiAgICBmb250LXdlaWdodDogYm9sZDtcclxuICB9XHJcblxyXG4gIC5hdXRvY29tcGxldGUtcmVzdWx0LmlzLWFjdGl2ZSxcclxuICAuYXV0b2NvbXBsZXRlLXJlc3VsdDpob3ZlciB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZGJkYmRiO1xyXG4gIH1cclxuXHJcbiAgLmZvcm0tZmllbGQge1xyXG4gICAgLS1jb2xvcjogdmFyKC0tYm9yZGVyLWhvdmVyKTtcclxuICAgIG91dGxpbmU6IG5vbmU7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xyXG4gICAgYmFja2dyb3VuZDogI2ZmZjtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbiAgICBwYWRkaW5nOiA4cHggMTZweDtcclxuICAgIGxpbmUtaGVpZ2h0OiAyMnB4O1xyXG4gICAgZm9udC1zaXplOiAxNnB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcclxuICAgIGNvbG9yOiB2YXIoLS1pbnB1dC1jb2xvcik7XHJcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XHJcbiAgICB0cmFuc2l0aW9uOiBib3JkZXIgMC4zcyBlYXNlO1xyXG4gIH1cclxuXHJcbiAgLmZvcm0tZmllbGQ6OnBsYWNlaG9sZGVyIHtcclxuICAgIGNvbG9yOiB2YXIoLS1ib3JkZXItaG92ZXIpO1xyXG4gIH1cclxuICAuZm9ybS1maWVsZDpmb2N1cyB7XHJcbiAgICBvdXRsaW5lOiBub25lO1xyXG4gICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1jb2xvcik7XHJcbiAgfVxyXG48L3N0eWxlPlxyXG48c3ZlbHRlOndpbmRvdyBvbjpjbGljaz1cInsoKT0+Y2xvc2UoKX1cIiAvPlxyXG48ZGl2IG9uOmNsaWNrPVwieyhldmVudCk9PmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpfVwiIGNsYXNzPVwiYXV0b2NvbXBsZXRlXCI+XHJcbiAgPGlucHV0XHJcbiAgICB0eXBlPVwidGV4dFwiXHJcbiAgICBjbGFzcz1cImZvcm0tZmllbGQge2NsYXNzTmFtZX1cIlxyXG4gICAge25hbWV9XHJcbiAgICB7cGxhY2Vob2xkZXJ9XHJcbiAgICB7cmVxdWlyZWR9XHJcbiAgICB7ZGlzYWJsZWR9XHJcbiAgICB7bWFpbkluZ3JpZGllbnRzfVxyXG4gICAgYXV0b2ZvY3VzXHJcbiAgICBiaW5kOnZhbHVlPVwie3NlYXJjaH1cIlxyXG4gICAgb246aW5wdXQ9XCJ7KGV2ZW50KT0+b25DaGFuZ2UoZXZlbnQpfVwiXHJcbiAgICBvbjpmb2N1cz1cInt0ZXN0fVwiXHJcbiAgICBvbjpibHVyXHJcbiAgICBvbjprZXlkb3duPVwieyhldmVudCk9Pm9uS2V5RG93bihldmVudCl9XCJcclxuICAgIGJpbmQ6dGhpcz1cIntpbnB1dH1cIlxyXG4gICAgYXV0b2NvbXBsZXRlPVwib2ZmXCJcclxuICAgIGF1dG9jb3JyZWN0PVwib2ZmXCJcclxuICAgIGF1dG9jYXBpdGFsaXplPVwib2ZmXCJcclxuICAvPlxyXG4gIHsjaWYgc2VhcmNoLmxlbmd0aCA+PSAyfVxyXG4gIDx1bFxyXG4gICAgY2xhc3M9XCJhdXRvY29tcGxldGUtcmVzdWx0c3shaXNPcGVuID8gJyBoaWRlLXJlc3VsdHMnIDogJycgfHwgc2VhcmNoLmxlbmd0aCA8IDIgPyAnIGhpZGUtcmVzdWx0cycgOiAnJ31cIlxyXG4gICAgYmluZDp0aGlzPVwie2xpc3R9XCJcclxuICA+XHJcbiAgICB7I2VhY2ggcmVzdWx0cyBhcyByZXN1bHQsIGl9XHJcbiAgICA8bGlcclxuICAgICAgb246Y2xpY2s9XCJ7KCk9PmNsb3NlKGkpfVwiXHJcbiAgICAgIGNsYXNzPVwiYXV0b2NvbXBsZXRlLXJlc3VsdHsgaSA9PT0gYXJyb3dDb3VudGVyID8gJyBpcy1hY3RpdmUnIDogJycgfVwiXHJcbiAgICA+XHJcbiAgICAgIHtAaHRtbCByZXN1bHQubGFiZWx9XHJcbiAgICA8L2xpPlxyXG4gICAgey9lYWNofVxyXG4gIDwvdWw+XHJcbiAgey9pZn1cclxuPC9kaXY+XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyR0UsY0FBRSxDQUFDLEFBQ0QsVUFBVSxDQUFFLFVBQVUsQUFDeEIsQ0FBQyxBQUVELEtBQUssY0FBQyxDQUFDLEFBQ0wsTUFBTSxDQUFFLElBQUksQ0FDWixTQUFTLENBQUUsSUFBSSxDQUNmLE9BQU8sQ0FBRSxPQUFPLENBQUMsTUFBTSxBQUN6QixDQUFDLEFBRUQsYUFBYSxjQUFDLENBQUMsQUFDYixRQUFRLENBQUUsUUFBUSxBQUNwQixDQUFDLEFBRUQsYUFBYSxjQUFDLENBQUMsQUFDYixPQUFPLENBQUUsSUFBSSxBQUNmLENBQUMsQUFFRCxxQkFBcUIsY0FBQyxDQUFDLEFBQ3JCLE9BQU8sQ0FBRSxDQUFDLENBQ1YsTUFBTSxDQUFFLENBQUMsQ0FDVCxNQUFNLENBQUUsSUFBSSxDQUNaLFFBQVEsQ0FBRSxJQUFJLENBQ2QsS0FBSyxDQUFFLElBQUksQ0FFWCxnQkFBZ0IsQ0FBRSxLQUFLLENBQ3ZCLFVBQVUsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUMzQyxRQUFRLENBQUUsUUFBUSxDQUNsQixPQUFPLENBQUUsR0FBRyxBQUNkLENBQUMsQUFFRCxvQkFBb0IsY0FBQyxDQUFDLEFBQ3BCLEtBQUssQ0FBRSxPQUFPLENBQ2QsVUFBVSxDQUFFLElBQUksQ0FDaEIsVUFBVSxDQUFFLElBQUksQ0FDaEIsTUFBTSxDQUFFLElBQUksQ0FDWixPQUFPLENBQUUsT0FBTyxDQUFDLE1BQU0sQ0FDdkIsTUFBTSxDQUFFLE9BQU8sQUFDakIsQ0FBQyxBQUVELGtDQUFvQixDQUFXLElBQUksQUFBRSxDQUFDLEFBQ3BDLGdCQUFnQixDQUFFLElBQUksQ0FDdEIsS0FBSyxDQUFFLE9BQU8sQ0FDZCxXQUFXLENBQUUsSUFBSSxBQUNuQixDQUFDLEFBRUQsb0JBQW9CLHdCQUFVLENBQzlCLGtDQUFvQixNQUFNLEFBQUMsQ0FBQyxBQUMxQixnQkFBZ0IsQ0FBRSxPQUFPLEFBQzNCLENBQUMsQUFFRCxXQUFXLGNBQUMsQ0FBQyxBQUNYLE9BQU8sQ0FBRSxtQkFBbUIsQ0FDNUIsT0FBTyxDQUFFLElBQUksQ0FDYixPQUFPLENBQUUsS0FBSyxDQUNkLEtBQUssQ0FBRSxJQUFJLENBQ1gsa0JBQWtCLENBQUUsSUFBSSxDQUN4QixVQUFVLENBQUUsSUFBSSxDQUNoQixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUMvQixPQUFPLENBQUUsR0FBRyxDQUFDLElBQUksQ0FDakIsV0FBVyxDQUFFLElBQUksQ0FDakIsU0FBUyxDQUFFLElBQUksQ0FDZixXQUFXLENBQUUsR0FBRyxDQUNoQixLQUFLLENBQUUsSUFBSSxhQUFhLENBQUMsQ0FDekIsYUFBYSxDQUFFLEdBQUcsQ0FDbEIsVUFBVSxDQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxBQUM5QixDQUFDLEFBRUQseUJBQVcsYUFBYSxBQUFDLENBQUMsQUFDeEIsS0FBSyxDQUFFLElBQUksY0FBYyxDQUFDLEFBQzVCLENBQUMsQUFDRCx5QkFBVyxNQUFNLEFBQUMsQ0FBQyxBQUNqQixPQUFPLENBQUUsSUFBSSxDQUNiLFlBQVksQ0FBRSxJQUFJLE9BQU8sQ0FBQyxBQUM1QixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (205:2) {#if search.length >= 2}
    function create_if_block(ctx) {
    	let ul;
    	let ul_class_value;
    	let each_value = /*results*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", ul_class_value = "autocomplete-results" + (!/*isOpen*/ ctx[0]
    			? " hide-results"
    			:  /*search*/ ctx[2].length < 2
    				? " hide-results"
    				: "") + " svelte-63qac3");

    			add_location(ul, file$1, 205, 2, 4896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*ul_binding*/ ctx[33](ul);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*arrowCounter, close, results*/ 16394) {
    				each_value = /*results*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*isOpen, search*/ 5 && ul_class_value !== (ul_class_value = "autocomplete-results" + (!/*isOpen*/ ctx[0]
    			? " hide-results"
    			:  /*search*/ ctx[2].length < 2
    				? " hide-results"
    				: "") + " svelte-63qac3")) {
    				attr_dev(ul, "class", ul_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			/*ul_binding*/ ctx[33](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(205:2) {#if search.length >= 2}",
    		ctx
    	});

    	return block;
    }

    // (210:4) {#each results as result, i}
    function create_each_block(ctx) {
    	let li;
    	let html_tag;
    	let raw_value = /*result*/ ctx[34].label + "";
    	let t;
    	let li_class_value;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[32](/*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = space();
    			html_tag = new HtmlTag(raw_value, t);

    			attr_dev(li, "class", li_class_value = "autocomplete-result" + (/*i*/ ctx[36] === /*arrowCounter*/ ctx[3]
    			? " is-active"
    			: "") + " svelte-63qac3");

    			add_location(li, file$1, 210, 4, 5078);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			html_tag.m(li);
    			append_dev(li, t);
    			if (remount) dispose();
    			dispose = listen_dev(li, "click", click_handler_1, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*results*/ 2 && raw_value !== (raw_value = /*result*/ ctx[34].label + "")) html_tag.p(raw_value);

    			if (dirty[0] & /*arrowCounter*/ 8 && li_class_value !== (li_class_value = "autocomplete-result" + (/*i*/ ctx[36] === /*arrowCounter*/ ctx[3]
    			? " is-active"
    			: "") + " svelte-63qac3")) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(210:4) {#each results as result, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let input_1;
    	let input_1_class_value;
    	let t;
    	let dispose;
    	let if_block = /*search*/ ctx[2].length >= 2 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input_1 = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(input_1, "type", "text");
    			attr_dev(input_1, "class", input_1_class_value = "form-field " + /*className*/ ctx[11] + " svelte-63qac3");
    			attr_dev(input_1, "name", /*name*/ ctx[4]);
    			attr_dev(input_1, "placeholder", /*placeholder*/ ctx[5]);
    			input_1.required = /*required*/ ctx[6];
    			input_1.disabled = /*disabled*/ ctx[7];
    			attr_dev(input_1, "mainingridients", /*mainIngridients*/ ctx[8]);
    			input_1.autofocus = true;
    			attr_dev(input_1, "autocomplete", "off");
    			attr_dev(input_1, "autocorrect", "off");
    			attr_dev(input_1, "autocapitalize", "off");
    			add_location(input_1, file$1, 185, 2, 4448);
    			attr_dev(div, "class", "autocomplete svelte-63qac3");
    			add_location(div, file$1, 184, 0, 4372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input_1);
    			set_input_value(input_1, /*search*/ ctx[2]);
    			/*input_1_binding*/ ctx[31](input_1);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			input_1.focus();
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(window, "click", /*click_handler*/ ctx[27], false, false, false),
    				listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[28]),
    				listen_dev(input_1, "input", /*input_handler*/ ctx[29], false, false, false),
    				listen_dev(input_1, "focus", /*test*/ ctx[15], false, false, false),
    				listen_dev(input_1, "blur", /*blur_handler*/ ctx[26], false, false, false),
    				listen_dev(input_1, "keydown", /*keydown_handler*/ ctx[30], false, false, false),
    				listen_dev(div, "click", click_handler_2, false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*name*/ 16) {
    				attr_dev(input_1, "name", /*name*/ ctx[4]);
    			}

    			if (dirty[0] & /*placeholder*/ 32) {
    				attr_dev(input_1, "placeholder", /*placeholder*/ ctx[5]);
    			}

    			if (dirty[0] & /*required*/ 64) {
    				prop_dev(input_1, "required", /*required*/ ctx[6]);
    			}

    			if (dirty[0] & /*disabled*/ 128) {
    				prop_dev(input_1, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (dirty[0] & /*mainIngridients*/ 256) {
    				attr_dev(input_1, "mainingridients", /*mainIngridients*/ ctx[8]);
    			}

    			if (dirty[0] & /*search*/ 4 && input_1.value !== /*search*/ ctx[2]) {
    				set_input_value(input_1, /*search*/ ctx[2]);
    			}

    			if (/*search*/ ctx[2].length >= 2) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input_1_binding*/ ctx[31](null);
    			if (if_block) if_block.d();
    			run_all(dispose);
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

    const click_handler_2 = event => event.stopPropagation();

    function instance$1($$self, $$props, $$invalidate) {
    	const regExpEscape = s => {
    		return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
    	};

    	let { name = "" } = $$props;
    	let { value = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { required = false } = $$props;
    	let { disabled = false } = $$props;
    	let { mainIngridients = false } = $$props;
    	let { items = [] } = $$props;
    	let { isOpen = false } = $$props;
    	let { results = [] } = $$props;
    	let { search = "" } = $$props;
    	let { arrowCounter = 0 } = $$props;
    	let className = "";
    	let isAsync = false;
    	let minChar = 2;
    	let maxItems = 5;
    	let fromStart = true; // Default type ahead
    	let list;
    	let input;
    	let addedIngredients = [];
    	let nextId = 2;

    	async function onChange(event) {
    		search.length >= Number(minChar);
    		filterResults();
    		$$invalidate(0, isOpen = true);
    	}

    	function filterResults() {
    		$$invalidate(1, results = items.filter(item => {
    			return fromStart
    			? item.name.toUpperCase().startsWith(search.toUpperCase())
    			: item.name.toUpperCase().includes(search.toUpperCase());
    		}).map(item => {
    			const text = item.name;

    			return {
    				key: text,
    				value: item.value || item,
    				label: search.trim() === ""
    				? text
    				: text.replace(RegExp(regExpEscape(search.trim()), "i"), "<span>$&</span>")
    			};
    		}).slice(0, 6));

    		const height = results.length > maxItems ? maxItems : results.length;

    		list
    		? $$invalidate(9, list.style.height = `${height * 2.5}rem`, list)
    		: "0px";
    	}

    	function onKeyDown(event) {
    		if (event.keyCode === 40 && arrowCounter < results.length) {
    			// ArrowDown
    			$$invalidate(3, arrowCounter = arrowCounter + 1);
    		} else if (event.keyCode === 38 && arrowCounter > 0) {
    			// ArrowUp
    			$$invalidate(3, arrowCounter = arrowCounter - 1);
    		} else if (event.keyCode === 13) {
    			// Enter
    			event.preventDefault();

    			if (arrowCounter === -1) {
    				$$invalidate(3, arrowCounter = 0); // Default select first item of list
    			}

    			close(arrowCounter);
    		} else if (event.keyCode === 27) {
    			// Escape
    			event.preventDefault();

    			close();
    		}
    	}

    	function close(index = -1) {
    		$$invalidate(0, isOpen = false);
    		$$invalidate(3, arrowCounter = -1);
    		input.blur();

    		if (index > -1) {
    			$$invalidate(16, value = results[index].value.name);
    			let ingredientId = results[index].value.ingredientId;

    			if (mainIngridients) {
    				customMainIngridients.addMainIngridient(value, ingredientId);
    			} else {
    				customIngridients.addIngridients(value, ingredientId);
    			}

    			$$invalidate(2, search = "");
    			input.focus();
    		} //search = "";
    	}

    	function test() {
    		if (search) {
    			$$invalidate(0, isOpen = true);
    		}
    	}

    	const writable_props = [
    		"name",
    		"value",
    		"placeholder",
    		"required",
    		"disabled",
    		"mainIngridients",
    		"items",
    		"isOpen",
    		"results",
    		"search",
    		"arrowCounter"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Autocomplete> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Autocomplete", $$slots, []);

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	const click_handler = () => close();

    	function input_1_input_handler() {
    		search = this.value;
    		$$invalidate(2, search);
    	}

    	const input_handler = event => onChange();
    	const keydown_handler = event => onKeyDown(event);

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(10, input = $$value);
    		});
    	}

    	const click_handler_1 = i => close(i);

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(9, list = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("value" in $$props) $$invalidate(16, value = $$props.value);
    		if ("placeholder" in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ("required" in $$props) $$invalidate(6, required = $$props.required);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("mainIngridients" in $$props) $$invalidate(8, mainIngridients = $$props.mainIngridients);
    		if ("items" in $$props) $$invalidate(17, items = $$props.items);
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ("results" in $$props) $$invalidate(1, results = $$props.results);
    		if ("search" in $$props) $$invalidate(2, search = $$props.search);
    		if ("arrowCounter" in $$props) $$invalidate(3, arrowCounter = $$props.arrowCounter);
    	};

    	$$self.$capture_state = () => ({
    		customIngridients,
    		customMainIngridients,
    		regExpEscape,
    		name,
    		value,
    		placeholder,
    		required,
    		disabled,
    		mainIngridients,
    		items,
    		isOpen,
    		results,
    		search,
    		arrowCounter,
    		className,
    		isAsync,
    		minChar,
    		maxItems,
    		fromStart,
    		list,
    		input,
    		addedIngredients,
    		nextId,
    		onChange,
    		filterResults,
    		onKeyDown,
    		close,
    		test
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("value" in $$props) $$invalidate(16, value = $$props.value);
    		if ("placeholder" in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ("required" in $$props) $$invalidate(6, required = $$props.required);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("mainIngridients" in $$props) $$invalidate(8, mainIngridients = $$props.mainIngridients);
    		if ("items" in $$props) $$invalidate(17, items = $$props.items);
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ("results" in $$props) $$invalidate(1, results = $$props.results);
    		if ("search" in $$props) $$invalidate(2, search = $$props.search);
    		if ("arrowCounter" in $$props) $$invalidate(3, arrowCounter = $$props.arrowCounter);
    		if ("className" in $$props) $$invalidate(11, className = $$props.className);
    		if ("isAsync" in $$props) isAsync = $$props.isAsync;
    		if ("minChar" in $$props) minChar = $$props.minChar;
    		if ("maxItems" in $$props) maxItems = $$props.maxItems;
    		if ("fromStart" in $$props) fromStart = $$props.fromStart;
    		if ("list" in $$props) $$invalidate(9, list = $$props.list);
    		if ("input" in $$props) $$invalidate(10, input = $$props.input);
    		if ("addedIngredients" in $$props) addedIngredients = $$props.addedIngredients;
    		if ("nextId" in $$props) nextId = $$props.nextId;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isOpen,
    		results,
    		search,
    		arrowCounter,
    		name,
    		placeholder,
    		required,
    		disabled,
    		mainIngridients,
    		list,
    		input,
    		className,
    		onChange,
    		onKeyDown,
    		close,
    		test,
    		value,
    		items,
    		regExpEscape,
    		isAsync,
    		minChar,
    		maxItems,
    		fromStart,
    		addedIngredients,
    		nextId,
    		filterResults,
    		blur_handler,
    		click_handler,
    		input_1_input_handler,
    		input_handler,
    		keydown_handler,
    		input_1_binding,
    		click_handler_1,
    		ul_binding
    	];
    }

    class Autocomplete extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-63qac3-style")) add_css$1();

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				name: 4,
    				value: 16,
    				placeholder: 5,
    				required: 6,
    				disabled: 7,
    				mainIngridients: 8,
    				items: 17,
    				isOpen: 0,
    				results: 1,
    				search: 2,
    				arrowCounter: 3
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Autocomplete",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get name() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mainIngridients() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mainIngridients(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get results() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get search() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrowCounter() {
    		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrowCounter(value) {
    		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var EmptyFridgeData = {
      NoResultsSingleIngredientMessage:
        "Ledsen, vi har inga {mealtype}recept med {ingredient}. Try something else.",
      NoResultsManyIngredientsMessage:
        "Ledsen, vi har inga {mealtype}recept med de ingredienser du sökte med.",
      MealTypes: {
        "3247760446": "frukost",
        "1089312893": "förrätt",
        "865150284": "huvudrätt",
        "4278008420": "efterrätt",
        "627472273": "buffé",
      },
      MealTypesOrder: [3247760446, 1089312893, 865150284, 4278008420, 627472273],
      Ingredients: {
        "2442613792": "Arla Grevé 17%",
        "3070007940": "Arla Präst 17%",
        "374604941": "5-minuterssill",
        "153650213": "abborre",
        "4212150796": "abborrfilé",
        "3729165374": "acaciahonung",
        "1771701764": "acaipulver",
        "2927327405": "Kvibille ädel",
        "2411829129": "Kvibille ädel calvados",
        "154712074": "Kvibille ädel glögg",
        "3838059200": "Kvibille ädel grädd",
        "2557647876": "Kvibille Ädel mild",
        "3539760515": "Kvibille ädel special",
        "4227208067": "Kvibille ädel whisky",
        "1135079811_55207294": "ägg",
        "1600028341": "äggnudlar",
        "115678732": "äggula",
        "2327440604": "äggvita",
        "500428281_2224455614": "ajvar relish",
        "3432383678": "akvavit",
        "969277512": "alfaalfagrodd",
        "4050413681": "älgfärs",
        "2486505432_2863063732": "älgkött",
        "3798285330": "älgskav",
        "572496850": "älgstek",
        "135536885_1007428168": "ananas",
        "831863752": "ananasskiva",
        "1489846982": "ancho chili",
        "1740996172_229771819": "anis",
        "2191005675": "anisfrö",
        "2876806667": "ankbröst",
        "3545053621": "ankpaté",
        "2906828911": "ansjovisfilé",
        "2304893497": "ansjovisspad",
        "1370124660_1254627386": "apelsin",
        "1268374223": "apelsin- & blodapelsinjuice",
        "4110881750": "apelsin- & röd grapefruktjuice",
        "936032242": "apelsinjuice",
        "2609668015": "apelsinlikör",
        "3405398459": "apelsinmarmelad",
        "3463636371": "apelsinsaft",
        "1908636197": "äppelchutney",
        "3762969301": "äppelcider",
        "3841267640": "äppelcidervinäger",
        "1803574968_2908508285": "äppeljuice",
        "270361311": "äppelmos",
        "3735013201": "äppelmust",
        "2624454165_3673858981": "äpple",
        "3487567456_602675528": "aprikos",
        "3018917677": "aprikosmarmelad",
        "7244877": "arborioris",
        "352834952": "Arla Grevé Arla Grevé",
        "1392717199": "Arla Herrgård Arla Herrgård",
        "4047540413": "Arla Präst Arla Präst",
        "3034556675": "ärtskott",
        "2573090957_325246577": "ättiksgurka",
        "262625406": "ättiksprit 12%",
        "911686672": "aubergine",
        "361941351": "avklippta klubb- eller grillpinnar",
        "813924336": "avokado",
        "358411420_1427173420": "avorioris",
        "2206738219": "babyspenat",
        "4139464278_2363475137": "bacon",
        "1098045975": "bagel",
        "67533150": "baguette",
        "2425574933": "bakpotatis",
        "1529025459": "bakpulver",
        "3276377838": "ballerinakex, kladdkaka",
        "1003311949_3361829545": "balsamvinäger",
        "3586626443": "banan",
        "645261751": "bananchips",
        "546897280": "bananschalottenlök",
        "531522603": "baobabpulver",
        "1218690785_378729444": "bär",
        "2505380106": "barbequesås",
        "2411085515": "bärjuice",
        "3870663046": "basmatiris",
        "3554374217": "bearnaisesås",
        "3467123799": "Kelda bechamelsås",
        "4194247312": "beef chili",
        "1460277981": "belugalins",
        "2881293279": "benfri fläskkarré",
        "505392807": "benfri högrev",
        "2231536316": "benfri kassler",
        "3882730883": "benfri lammstek",
        "1263530945": "benfritt älgkött",
        "4098104358": "benfritt lammkött",
        "3726638680": "benfritt nötkött",
        "834168882": "berberis",
        "2885969502": "beta",
        "3004410068_253695153": "biff",
        "1675816877": "bifftomat",
        "3879651498": "bikarbonat",
        "1863464273": "bindgarn",
        "790906124": "bipollen",
        "1096106634": "bittermandel",
        "1313806921": "bittermandelarom",
        "1138413294_1760724354": "björnbär",
        "2340216378": "björnbärssylt",
        "3438518967": "blå hushållsfärg",
        "1855345364": "blå vallmofrön",
        "1361884059_403311670": "blåbär",
        "3746505800": "blåbärspulver",
        "4024821389": "blåbärssoppa",
        "2459566014": "blåbärssylt",
        "3259427377": "Castello Black",
        "1434723805": "black eye böna",
        "497294673": "bladpersilja",
        "3008697544_3201553201": "bladspenat",
        "2764366390": "blåmussla",
        "4239184809": "blandad böna",
        "1778269959": "blandad böna med matvete",
        "890520963": "blandad färsk svamp",
        "52322906": "blandad grönsallad",
        "3806782152": "blandad italiensk sallad",
        "775401038": "blandade bönor",
        "3840728320": "blandade citrusfrukter",
        "1292029607": "blandade färska bär",
        "818844615": "blandade frön",
        "1579318434": "blandade grönsaker",
        "1588832979": "blandade nötter",
        "2909284020": "blandade rotfrukter",
        "2850890442": "blandade skaldjur",
        "2779865520": "blandade torkade örter",
        "126922773": "blandfärs",
        "2852108553": "blandsvamp",
        "2192558304_2043888422": "blekselleri",
        "1363120459": "blodapelsin",
        "2114288536": "blodgrape",
        "3768799483": "blodpudding",
        "1046371796_1345055856": "blomkål",
        "206866590": "blomkålsbukett",
        "1945308534": "blomkålshuvud",
        "3934902459": "Bloody Mary crumbs",
        "9074035": "Castello Blue",
        "1347034740": "böckling",
        "1130487591": "böna",
        "1573593914": "bondbröd",
        "1632246089": "bondkaka",
        "181225749": "böngrodd",
        "3881532557": "Boxholms Borgmästarost Lagrad",
        "295847842": "bostongurka",
        "1334144974": "boveteflingor",
        "566416120": "bovetemjöl",
        "983609125": "branflakes",
        "1813243554": "Bregott Bregott",
        "3388293460": "bresaola",
        "2511245322": "Castello Brie ekologisk",
        "1607111300_3703263674": "broccoli",
        "872140211": "broccolibukett",
        "1890290187": "broccolini",
        "4102565967_959657145": "bröd",
        "705515925": "brödsirap",
        "187160466": "brödtärning",
        "1596014233": "brownie",
        "1276572747": "brun böna ",
        "2972782491": "brysselkål",
        "4020222355": "bulgur",
        "1932353363": "Castello Burger Blue",
        "4191365341": "Castello Burger Cheddar",
        "669558722": "butternutpumpa",
        "3428722289": "calvados",
        "3599580901": "cannelliniböna",
        "2808094645": "cantaloupemelon",
        "427753555": "cappuccinopulver",
        "3269423051": "cashewnöt",
        "1794990175": "Castello Creamy White",
        "2833917646": "cayennepeppar",
        "1853785933": "chaite",
        "2024026787": "champagne",
        "1339050251": "champagnevinäger",
        "2438182740": "champinjon",
        "2666834737": "charkuteri",
        "1300966658": "Wästgöta Kloster cheddar",
        "1718770233": "Kvibille cheddar 12 mån (svartvaxad)",
        "2988025594": "Kvibille cheddar 6 mån",
        "826016548": "Kvibille cheddar riven",
        "2988894692_2448946460": "chèvre",
        "1709935312": "chiafrö",
        "3496053465": "chili flakes",
        "155189544": "chili seasoning mix",
        "1575901048": "chili&lime krydda",
        "411214352": "chilibearnaisesås",
        "2739311808": "chilikorv",
        "2002070503": "Boxholms Chiliost",
        "2823863419_2505942496": "chilipeppar",
        "1649789243": "chilipulver",
        "4144940223": "chilisås",
        "3144254264": "chimichurri",
        "1177474392": "chipotlepasta",
        "2307231434_1433308552": "choklad",
        "1754640317": "chokladdryckspulver",
        "424833676": "chokladglass",
        "3278903489": "chokladkex",
        "4032348837": "Cocio Pucko chokladmjölk",
        "2907950491": "chokladsås",
        "2104596087": "chorizo",
        "1129552210": "ciabatta",
        "1535472681": "citron",
        "1582166513": "citrongräs",
        "2860857197": "citronkola",
        "2519100480": "citronmeliss",
        "2491464147": "citronpeppar",
        "2361805523": "citronsaft",
        "2031639808": "citronsyra",
        "717387197": "citrontimjan",
        "1341455407": "citruslikör",
        "375396949": "Puck Classic Creamy White",
        "1079011269": "clementin",
        "3659543909": "Coca cola",
        "4226429777": "cocktailkapris",
        "1630272318": "cocktailtomat",
        "1338651999": "cointreau",
        "30104117": "coleslaw",
        "1816733678": "cornflakes",
        "1346955888": "cornichons",
        "2386691919": "KESO cottage cheese",
        "3627458690": "KESO cottage cheese ananas & passion",
        "1321095933": "KESO cottage cheese ekologisk naturell",
        "3078150041": "KESO cottage cheese hummus",
        "1821365843": "KESO cottage cheese mexican salsa",
        "2277931652": "KESO cottage cheese mini",
        "2691023759": "KESO cottage cheese protein",
        "932789879": "KESO cottage cheese supermini",
        "2377071397_1162436249": "couscous",
        "4136522502": "crabsticks",
        "1935036223": "Puck Creamy",
        "2700113017": "crema balsamico",
        "1517035486": "Arla Köket crème fraiche",
        "1487743753": "Arla Köket crème fraiche fetaost & soltorkade tomater",
        "3130333187": "Arla Köket crème fraiche gourmet saffran & tomat",
        "2498060858": "crostini",
        "759960098": "cumberlandsås",
        "325607788": "curry",
        "1403900854_2059072878": "dadel",
        "2924867493_50046409": "daim",
        "972467246": "Castello Danablu",
        "3625730950": "danskt rågbröd",
        "514656788": "delikatesspotatis",
        "3770503485": "digestivekex",
        "325842294": "digestivekex fullkorn",
        "1166110045": "digestivekex råg",
        "2969664490": "dijonnaise",
        "3063517868_1134641702": "dijonsenap",
        "2294245998": "dillfrö",
        "1570848412": "dillknippe",
        "2966077814": "dillstjälk",
        "2798290104": "dillvippa",
        "2966262959": "dinkel hel",
        "1165423647": "dinkelflinga",
        "3095558892_1217152780": "dinkelmjöl",
        "136786469": "dinkelmjöl, fullkorn",
        "3505119288": "dinkelpuff",
        "3072442430": "dinkelvete",
        "2243789322": "dovhjortsfilé eller rådjursfilé",
        "2838454469": "Yoggi dröm jordgubb",
        "2224769713": "Yoggi dröm vanilj",
        "594953255": "dubbeldaim",
        "2402070948": "dumlekola",
        "3093120186": "durumvetemjöl",
        "2627604114": "Arla Familjefavoriter Edamer",
        "815232889": "Arla Edamer",
        "1096191122": "Arla ekologisk A-fil jordgubb",
        "958636114": "Arla Köket ekologisk crème fraiche",
        "4163444995": "Castello ekologisk färskost vitlök",
        "163351282": "Arla ekologisk filmjölk",
        "493570334": "Arla ekologisk gräddfil",
        "704837165": "Arla ekologisk laktosfri filmjölk",
        "3081920454": "Arla ekologisk lantmjölk",
        "3446908910": "Arla ekologisk lättmjölk",
        "3924696214": "Arla ekologisk mild yoghurt jordgubb & vanilj",
        "845204573": "Arla ekologisk mjölk",
        "3088396747": "Kelda ekologisk tomatsoppa",
        "3263831434": "Arla ekologisk vispgrädde",
        "3087603702": "Arla Köket ekologisk vispgrädde",
        "3053856860": "Arla ekologisk yoghurt naturell",
        "1285317518": "enbär",
        "402901740": "endive",
        "2267956482": "enokisvamp",
        "396555397": "entrecote",
        "4056941381": "espresso",
        "1477217775": "fajita marinad, smoke taste",
        "4080102220": "falafel",
        "4236528846": "falukorv",
        "4820091": "fänkål",
        "666969015": "Boxholms fänkål & dillfrö Årets Kock",
        "722969023_994458092": "farinsocker",
        "1759101681": "färsk basilika",
        "3786123794": "färsk chili",
        "2884048307": "färsk dill",
        "1456044521": "färsk dragon",
        "3494043619": "färsk frukt",
        "4261307691": "färsk fylld pasta",
        "834025355": "färsk gnocchi",
        "3919989441": "färsk gräslök",
        "1811144552": "färsk grön chili",
        "3933850210": "färsk grön jalapeno",
        "2652817771": "färsk grön sparris",
        "3704881721": "färsk gul lök",
        "2388772908": "färsk gurkmeja",
        "2064611568": "färsk haricots verts",
        "1136043232": "färsk ingefära",
        "234176372": "färsk koriander",
        "3096771139": "färsk körvel",
        "3204846016": "färsk lasagneplatta",
        "2798513837": "färsk laxsida",
        "876434791": "färsk lök",
        "595609711": "färsk mejram",
        "560402467": "Arla färsk mjölk, laktosfri",
        "3690368455": "färsk mynta",
        "1789797415": "färsk oregano",
        "3539505798_2398572196": "färsk pasta",
        "1098205913": "färsk persilja",
        "2007915067": "färsk röd chili",
        "1335795062": "färsk rosmarin",
        "3762393687": "färsk rostbiff",
        "1158387395": "färsk salvia",
        "2349272858": "färsk skinka",
        "149113749": "färsk sparris",
        "690499326": "färsk spenat",
        "2766390231": "färsk tagliatelle",
        "285939873": "färsk timjan",
        "3047859813": "färsk tryffel",
        "3941686357": "färsk vit sparris",
        "670763639": "färska blandade örter",
        "283021728": "färska fikon",
        "3455721477": "färska örter",
        "3170493427_3432495750": "färskost",
        "2557993939": "Arla färskost dill & persilja",
        "1774822256": "Arla färskost naturell",
        "864916176": "Arla färskost naturell med kvarg",
        "548673561": "Arla färskost paprika",
        "2494986521": "Arla färskost ruccolapesto",
        "3848287009": "färskpotatis",
        "3471119695": "fast potatis",
        "632714565": "fettuccine",
        "844069792": "fiberhavregryn",
        "656187321": "fiberhusk",
        "2313209986": "fikonmarmelad",
        "2251179461": "Arla filmjölk",
        "2834466997": "filodeg",
        "1467669829": "fiskbuljong",
        "1157180939": "fiskbullar i buljong",
        "1803327826": "fiskfond",
        "294748402": "fisksås",
        "152719905": "five spice-krydda",
        "4117247030": "fjärilskotlett av lax",
        "1889856141": "fläderblomsklase",
        "2555689000": "flädersaft",
        "2553573053": "flädersorbet",
        "671299633": "flankstek",
        "2778145797": "fläskfärs",
        "2844857066": "fläskfilé",
        "2482080952": "fläskkarré",
        "133275047": "fläskkotlett",
        "3785880413": "fläskkött",
        "77758327": "fläsklägg",
        "2300252279": "fläskytterfilé",
        "662782408": "flingsalt",
        "2994685286": "florsocker",
        "2983642782": "flower sprouts",
        "1715303132": "flytande honung",
        "1277549149": "forellrom",
        "3716723168": "förgräddad pizzabotten",
        "1996655516": "formbröd",
        "3864031786": "formbröd, fullkorn",
        "2462358260": "fransk senap",
        "1980983478": "franska örter",
        "699394647": "fransyska",
        "1555355683": "frisésallad",
        "188983613": "frukostkorv",
        "2214797608_2240185485": "frukt",
        "1477595748": "frukt- och valnötsbröd",
        "2374465855": "fruktcocktail",
        "37879585": "fruktsallad",
        "2735694242": "fruktsocker",
        "3402719901": "fruktsoda",
        "1360336945": "fryst ananas",
        "1280941528": "fryst ärta",
        "283188405": "fryst bär ",
        "292967627": "fryst björnbär",
        "1130602785": "fryst blåbär",
        "209778450": "fryst bladspenat",
        "35959999": "fryst broccolibukett",
        "2316187180": "fryst grön ärta",
        "1078363451": "fryst grönkål",
        "2441261048": "fryst grönsaksmix",
        "3741147899": "fryst hallon",
        "96731993": "fryst hallon och blåbär",
        "189104336": "fryst haricots verts",
        "2565622450": "fryst höstgrönsak",
        "2449845086": "fryst jordgubbe",
        "86671208": "fryst lingon",
        "3663777495": "fryst majskolv",
        "24973801": "fryst majskorn",
        "1026063148": "fryst mango",
        "2254710934": "fryst räka",
        "2465317486": "fryst ratatouillegrönsak",
        "3702053572": "fryst sommargrönsak",
        "4036354938": "fryst soppgrönsak",
        "1568716774": "fryst spenat",
        "2682939487": "fryst tropisk blandad frukt",
        "2275867259": "fryst wokgrönsak",
        "3668068862": "frystorkat espressokaffepulver",
        "300314752": "frystorkat hallon",
        "4056041944": "frystorkat hallonpulver",
        "996404626": "fullkornspasta",
        "4038682112": "fullkornsris",
        "2612641335": "fullkornsspaghetti",
        "3440958966": "fyllda chokladkex",
        "2062759577": "fyrkantigt mjukt tunnbröd",
        "3678055839": "galiamelon",
        "265502006": "gammeldags idealmakaroner",
        "2688715187": "garam masala",
        "2765461872": "gari, inlagd ingefära",
        "3273071901": "gås",
        "1043124292": "gelatinblad",
        "43327657": "gelatinpulver",
        "1824192745_1854077433": "gelé",
        "98425065": "gemsallad",
        "2742902058_3113835482": "getost",
        "108920382": "gin",
        "3134493614": "glasnudlar",
        "493430348_3993995950": "glass",
        "3668887448": "glass- eller klubbpinnar",
        "167174559": "glasstrut",
        "790716600_1028226327": "glögg",
        "660005386": "glöggkrydda",
        "3090213665": "glutenfritt havregryn",
        "3399528295": "glykossirap",
        "4284198187": "gochujang",
        "407923500": "gorgonzola",
        "684127382": "gösfilé",
        "755094195": "gourmetsalt",
        "3601397893": "Castello Grädd Danablu",
        "2525392683": "Arla gräddfil",
        "1370351841": "Arla Köket gräddmjölk",
        "1908918129": "Boxholms Gräddost",
        "3185580031": "grahamsmjöl",
        "552739216_3295060520": "granatäpple",
        "2620670572": "granatäpplekärnor",
        "275177331": "Grand Marnier",
        "2041737809": "granola",
        "358617704_2926395766": "grapefrukt",
        "1426970143": "gravad lax",
        "2318839502": "gravlaxsås",
        "1794423064": "green jalapeno",
        "2694913106": "Arla Köket grekisk yoghurt",
        "813568481": "grillad kyckling",
        "2951374212": "grillad kycklingklubba",
        "574328160": "grillad marinerad paprika",
        "1207921794": "grillad paprika i olja",
        "2383381737": "grillkrydda",
        "3218950546": "Apetina grillost",
        "1581992908": "grillspett",
        "1409972257": "grisfjälster",
        "1161549720": "grissini",
        "718092617": "grodd",
        "3309973253": "grön chilipeppar",
        "1974011972": "grön currypasta",
        "3654611545": "grön hushållsfärg",
        "3119759980": "grön lins",
        "1920203168": "grön oliv",
        "4251351783": "grön oliv med pimento",
        "596293518": "grön paprika",
        "2394867193": "Kelda Grön sparrissoppa",
        "1655331260": "grön tabasco",
        "928778006": "grön tapenade",
        "4024667790": "gröna russin",
        "3915770610_4007300244": "grönkål",
        "101802539_3651385679": "grönpeppar",
        "1603308669": "grönpeppar i lag",
        "3366865279": "grönsaksbuljong",
        "1914762371": "grönsaksfond",
        "838652021": "grönt äpple",
        "1196760225": "grönt te",
        "2132379557": "grötris",
        "1356021043": "grovkornig dijonsenap",
        "3358385366": "grovmalen svartpeppar",
        "2460951498": "grovt bröd",
        "1257222817": "grovt rågbröd",
        "1357634802": "grovt rågmjöl",
        "2395102224": "grovt salt",
        "829892725": "grytbit",
        "622462420": "grytbit av kalv",
        "357735285": "grytbit av lamm",
        "3106445094": "grytbitar av nötkött",
        "428453292": "guacamole",
        "1824224093": "gul ärta, kokt",
        "2208343747": "gul hushållsfärg",
        "3838187031_3789537927": "gul lök",
        "2646873773": "gul morot",
        "3609023306": "gul paprika",
        "4010510394": "gul skalad snabbärta",
        "1261663721": "gula plommon",
        "3011455754": "Kelda Gulaschsoppa",
        "201675825": "gulbeta",
        "587563013": "gurka",
        "1489668142": "habanero",
        "4003498747": "hackad fryst spenat",
        "185895172": "hälleflundra",
        "2181327359_2738448130": "hallon",
        "989359482": "hallonsylt",
        "795207573": "hallonvinäger",
        "421405403_781440310": "halloumi",
        "2541337142": "hamburgerbröd",
        "3370445107": "hampafrö",
        "3533070067": "hårdost",
        "770844458": "harissa",
        "2329387057": "hasselnöt",
        "2284257823": "hasselnötsmjöl",
        "3837889391": "havreflarn",
        "2811564762_303986226": "havregryn",
        "878166422": "havrekaka",
        "2315181943": "havrekärna",
        "2735333217": "havrekli",
        "3795029189_1722805536": "havskräfta",
        "1392340654": "havskräftstjärt",
        "1092380073": "havssalt",
        "3951495980": "havtorn",
        "1373357216": "hel gös",
        "2389374154": "hel kryddnejlika",
        "48939068": "hel kummin",
        "1353906395": "hel kyckling",
        "2211155146": "hel spiskummin",
        "651773876": "hela fänkålsfrö",
        "2996498873": "helt bovete",
        "4164356937": "herbes de provence",
        "2283030516": "hirsflingor",
        "866327906": "hjorthornssalt",
        "2927892554": "hjortron",
        "1112841566": "hjortronsylt",
        "2786025825": "hjortstek",
        "1775930233": "hjortytterfilé",
        "3423505661_2654445930": "högrev",
        "25649892": "högrevsfärs",
        "440137764": "hoisinsås",
        "3621289357": "hönsbuljong",
        "1895372129_2780626294": "honung",
        "1987840906": "honungsmelon",
        "1740710097": "honungsrostade jordnötter",
        "1047069636": "höstkantarell",
        "2754482819": "hovmästarsås",
        "1907840172_1946559588": "hummer",
        "2426047516_3921136062": "hummerfond",
        "261683324": "hummerkött",
        "193765615": "hummerstjärt",
        "4131322375": "Arla Hushålls",
        "703600651": "Indian tandoori",
        "722559756": "inlagd rödbeta",
        "2395582635": "inlagd sill",
        "3281440732": "inläggningssill",
        "3909019188": "is, gärna krossad",
        "1926270618": "isbergssallad",
        "1424388204": "isbit",
        "3171280695": "ishavsrom",
        "157685992": "isterband",
        "1591620794": "italiensk mandelskorpa",
        "3373874207": "italiensk tomatsås",
        "2742617671": "Arla Familjefavoriter Jämtgården",
        "34192264": "japansk soja",
        "3212502812": "jasminris",
        "3224679936_650959066": "jäst",
        "524937731": "jästmix för surdegsbröd",
        "61980847": "jordärtskocka",
        "2068208243": "jordgubbe",
        "3348645251": "jordgubbsglass",
        "393545021": "jordgubbsjuice",
        "3780671002": "jordgubbssylt",
        "2016487488": "jordnöt",
        "1792293916": "jordnötssmör",
        "2654962182": "julkryddor, egen blandning",
        "1897310994": "julmust",
        "3075910711": "julskinka",
        "3234397277": "kabanoss",
        "1044143187_1858117335": "kaffe",
        "483630896": "kaffeböna",
        "2003005030": "kaka",
        "1943124144": "kakao",
        "1097252462": "kakaonibs",
        "98768261": "kalamataoliv",
        "3364184715_2305664721": "kalkon",
        "2018156615": "kalkonfilé",
        "3330824346": "kallpressad olivolja",
        "575399420": "kallpressad rapsolja",
        "3071879606": "kallrökt lax",
        "1951805768": "kallrökt skinka",
        "1558923911": "kallt, starkt kaffe",
        "3103629981": "kålrabbi",
        "1588075191": "kålrot",
        "2110881114": "kalvbuljong",
        "908341002": "kalvfärs",
        "4200150334": "kalvfond ",
        "998341843": "kalvinnanlår",
        "914683776": "kalvkotlett med ben",
        "3534617120": "kalvstek",
        "3146342260": "kalvytterfilé",
        "1009637903": "kamben",
        "3693535932": "kanelbulle",
        "2239273641": "kanellängd",
        "2327173748": "kanelstång",
        "4248808699_1039916231": "kantarell",
        "3501918369": "kantarellfond",
        "4188121382": "kapris",
        "2427265880_590112928": "karamellfärg",
        "3627991204": "karamelliserad mjölk",
        "1162610752": "kardemummakapslar",
        "1983187370": "kardemummakärnor",
        "3981121099": "Kelda Karibisk soppa",
        "2663082751": "kärnfri oliv",
        "985741151_4155199773": "kassler",
        "3073752165": "katrinplommon",
        "4176472094_145632519": "kaviar",
        "3771562446": "kavring",
        "2664427379": "kebabskav",
        "86985890": "Arla kefir",
        "1478590612": "kidneyböna",
        "496668626": "kikärta",
        "1828989720": "kikärtsmjöl",
        "571924269": "kimchi",
        "114639261": "kinesisk soja",
        "2208747871": "kirsch",
        "1435726174": "kiwi",
        "150407207": "Kelda klassisk gräddsås",
        "1901154608": "klyftpotatis",
        "1548726193_540065063": "knäckebröd",
        "585343460": "kofta masala",
        "865424164_242865174": "kokos",
        "4211736073": "kokoschips",
        "2321720915": "kokosfett",
        "2595639969_2740637765": "kokosflingor",
        "2348807438": "kokosgrädde",
        "2880245685": "kokosmjöl",
        "3902132788_2253125630": "kokosmjölk",
        "659346203": "kokt durumvete",
        "14365576": "kokt haricots verts",
        "797202424": "kokt kallt ris",
        "2127802655": "kokt skinka",
        "1089635199": "kokt vitt ris",
        "1890376646": "kokta sniglar, musslor, räkor eller stekta små champinjoner",
        "682487992": "kolasås",
        "2283459637": "koljafilé",
        "1567681341": "konc ananas&apelsinjuice",
        "1318782622": "konc apelsinjuice ",
        "2393934687": "konc apelsinsaft",
        "2140741131": "konc äppeljuice",
        "1231343253": "konc fläderblomssaft",
        "2241760363": "konc hallonsaft ",
        "4264081793": "konc rabarbersaft",
        "4155147034": "konc saft",
        "4288062121": "konc svartvinbärssaft",
        "3607108541": "konc tranbärsdryck",
        "267983910": "konc tropisk",
        "938123532": "konc vinbärssaft",
        "2441223410": "kondencerad sötad mjölk",
        "3577034991": "kondenserad kokosmjölk",
        "2870831631": "kondenserad mjölk",
        "3150318743": "konjak",
        "3990616108": "konserverad persikohalva",
        "1219683096": "konserverade hela tomater",
        "3998803487": "konserverade körsbärstomater",
        "1320055101": "korianderfrö",
        "2279372343": "korma sås",
        "1018484109": "korngryn",
        "3496843251": "körsbär",
        "110957159_1023947572": "körsbärstomat",
        "1007490966": "körsbärstomat på kvist",
        "3809345324_1345561896": "korv",
        "1076648686": "kotlettrad med ben",
        "1832708813": "kotlettrad utan ben",
        "2904894326_753935260": "kött",
        "438608689": "kött- och viltfond",
        "1935678631": "köttbuljong",
        "3924428863": "köttbulle",
        "323296963_1540683931": "köttfärs",
        "288674255_3891768122": "krabba",
        "2697825584": "krabbkött",
        "534447655": "kräfta",
        "3510626806": "kräftstjärt",
        "3246345222_2176500843": "krasse",
        "3061876824": "krispsallad",
        "2214809805_3279202421": "kronärtskocka",
        "4239864377": "kronärtskocksbottnar",
        "894770633": "kronärtskockshjärtan",
        "1508385593": "krondill",
        "4113777649": "krossad ananas",
        "1848334760": "krossad is",
        "1565581679_101990928": "krossade tomater",
        "2966442689": "krossade tomater med vitlök",
        "2105054323": "krossat linfrö",
        "2902554261": "krusbär",
        "3177882703": "krustad",
        "2016888390": "krutong",
        "3568401161": "kryddig korv",
        "3746180535_3858300572": "kryddnejlika",
        "1680530399": "Boxholms Kryddost",
        "2325433086": "kryddpeppar",
        "2082405581": "kryddpepparkorn",
        "135573828": "kummel",
        "1963103501_2074014980": "kummin",
        "2316097024": "kumminfrö",
        "145495411": "kumquat",
        "3146640281": "Arla Köket Kesella kvarg",
        "270141423": "Yalla kvarg blåbär",
        "1928317084": "Arla Köket Kesella kvarg hallon",
        "3913281203": "Arla Köket Kesella kvarg lätt",
        "3865754014": "Arla Köket Kesella kvarg vanilj",
        "3362836106": "Kvibille cheddar",
        "2092030536_186612795": "kyckling",
        "1417117849": "kycklingben",
        "773829577": "kycklingbröst",
        "2294230807": "kycklingbröstfilé",
        "2284665813": "kycklingbuljong",
        "1243800096": "kycklingdel",
        "842704375": "kycklingfärs",
        "3933260733_1766839390": "kycklingfond",
        "3564569167": "kycklinginnerfilé",
        "1503627165": "kycklingklubba",
        "2740461043": "kycklinglår",
        "459913446": "kycklinglårfilé",
        "1835227391": "kycklinglever",
        "3760396622": "kycklingvinge",
        "2386072572": "lagerblad",
        "3534444876_1007713598": "lakritsknäck",
        "1050743080": "lakritspulver",
        "4207953884": "Arla laktosfri grekisk yoghurt naturell",
        "3946903407": "Arla Köket laktosfri lätt crème fraiche",
        "392658786": "Arla laktosfri mellanmjölk dryck",
        "2213624653": "Arla laktosfri mild yoghurt naturell",
        "2922668228": "Arla Laktosfri Mjölk-&Havredryck choklad",
        "2464321332": "Arla Laktosfri Mjölk-&Havredryck till kaffet",
        "2076741091": "Arla Köket laktosfri vispgrädde",
        "2787108158": "lammbog",
        "2685603691": "lammbringa",
        "3706436640": "lammentrecote",
        "3712643291": "lammfärs",
        "2208627072": "lammkorv",
        "3397017904": "lammkotlett",
        "4258995522_4093726382": "lammstek",
        "1251584757": "lammytterfilé",
        "479259240": "landgångsbröd",
        "3684607198": "lantbröd",
        "1518637225": "lantvetemjöl",
        "2822537635": "lasagneplatta",
        "3789245106": "lasagneplatta fullkorn",
        "2535819705_1051703369": "läsk",
        "2777752894": "Arla Köket lätt crème fraiche",
        "2581007230": "Arla Köket lätt crème fraiche cheddar & karamelliserad lök",
        "2874643384": "Arla Köket lätt crème fraiche franska örter",
        "3942891649": "Arla Köket lätt crème fraiche karljohansvamp & timjan",
        "1208238308": "Arla Köket lätt crème fraiche paprika & chili",
        "3140066940": "Arla Köket lätt crème fraiche parmesan & vitlök",
        "1864803441": "Arla Köket lätt crème fraiche tomat & basilika",
        "4183455916": "lätt kokosmjölk",
        "1045815246": "lättglögg",
        "2934533058": "lättmajonnäs",
        "1913056179": "Arla lättmjölk",
        "416976705": "lättrökt kaviar",
        "108177871": "lavendelblomma",
        "917465644_157658218": "lax",
        "4072892149": "laxfilé",
        "528485374": "laxfilé med skinn",
        "4293235753": "laxkotlett",
        "3473687671": "laxloin",
        "3704530989": "lemon curd",
        "3176124918": "lemonad",
        "4019490869": "levain",
        "743921412": "leverpastej",
        "3245519729_4010224631": "likör",
        "4057083015_990990464": "lime",
        "819429434": "limeraita",
        "3111969215": "limesaft",
        "3016248353_1230842997": "linfrö",
        "2895022640_1535568171": "lingon",
        "1273622520": "lingonsylt",
        "3001229790": "lins",
        "2012990553": "liten gul lök",
        "4205390481": "ljus choklad",
        "2478261038": "ljus öl",
        "4248884367": "ljus sirap",
        "3666556018": "ljusa russin",
        "3182039619": "ljust bröd",
        "1153867126": "ljust lantbrödsmjöl",
        "3929985226": "ljust muscovadosocker",
        "3172946321": "ljust surdegsbröd",
        "3037408332": "löjrom",
        "891230680_2013179699": "lök",
        "2966562719": "lökring",
        "928205664": "lönnsirap",
        "1868645632": "loomi, torkad lime",
        "3818236371": "lövbiff",
        "4239939582": "lufttorkad skinka",
        "2712626551": "lufttorkat nötkött",
        "4187170956": "lutfisk",
        "2499775547": "macadamianöt",
        "3893093048": "machésallad",
        "37863742": "madeira",
        "3762428007_30368893": "majonnäs",
        "2890931662": "majrova",
        "3793809400_1990891816": "majs",
        "3905136171": "majschips",
        "3696101797_1396435711": "majskolv",
        "3897887781": "majskorn",
        "42953544": "majsmjöl",
        "3244913342": "majsstärkelse",
        "3299561878_1564482008": "makaroner",
        "2879263621": "malen gurkmeja",
        "1110876781": "malen ingefära",
        "1416458683_1635041936": "malen kanel",
        "3995653921": "malen kardemumma",
        "2941998562": "malen koriander",
        "1776989407": "malen kryddnejlika",
        "1418227603": "malen muskot",
        "1252073566": "malen spiskummin",
        "512574105": "malen vitpeppar",
        "1771571397": "maltodextrin",
        "2638931591": "maltsirap",
        "1691007719": "mandarinklyfta",
        "1882092875_3710465837": "mandel",
        "4123820484": "mandel salt&söt",
        "1056580627": "mandelbiskvier",
        "426652803": "mandellikör",
        "3208166126": "mandelmassa",
        "2586833414": "mandelmjöl",
        "3138441915": "mandelmussla",
        "1205614886": "mandelpasta",
        "3962251545": "mandelpotatis",
        "943809439": "mandelspån",
        "2075344527": "mandelsplitter",
        "74156804_561983588": "mango",
        "2133781332": "mango balsamico",
        "3053877023": "mango chutney",
        "3692750628": "mangocurry-krydda",
        "353947320": "mangosalsa",
        "3752565302": "mangosorbet",
        "1418578442": "mangotärning",
        "3856826973": "mannagryn",
        "409274567": "maräng",
        "3959713057": "marängbotten",
        "3024486428": "marianne-kula",
        "2424511613": "mariekex",
        "1240821855": "Castello Marquis",
        "2622605862": "marsalavin",
        "1709762261": "marsánpulver",
        "430279474_923197542": "marshmallow",
        "1617289353": "marshmallowfluff",
        "4120476490": "marsipan",
        "946995846": "marsipankyckling",
        "2932857949": "marsipanros",
        "1577365894": "mästarmatjes",
        "1982477844": "mathavre",
        "3744038710": "matjessill i bitar",
        "1807938420": "matjessillfilé",
        "644196368": "Arla Köket matlagningsgrädde",
        "2630315837": "Kelda matlagningsgrädde",
        "662244868": "matlagningsvin rött",
        "2018564041": "matlagningsvin vitt",
        "2136966582": "matolja",
        "2224340744": "matvete",
        "2419639979": "Arla Köket matyoghurt",
        "3536952951": "medelhavssalt",
        "1581518990": "Kelda mellangrädde",
        "2097825859": "Arla mellanmjölk",
        "1083704810_1253360350": "melon",
        "1063732466": "melonkärna",
        "1331382292": "Kelda mild citronsås",
        "2789806107": "Arla mild kvarg naturell",
        "3093149718": "Arla mild kvarg vanilj",
        "678880016": "Arla mild lättyoghurt citronsmak",
        "1624998526": "Arla mild lättyoghurt naturell",
        "2491262376": "Arla mild lättyoghurt vanilj",
        "1941465834": "Kelda Mild tomatsoppa",
        "491058717": "Arla mild yoghurt ekologisk",
        "4149708859": "Arla mild yoghurt grekisk",
        "2799350173": "Arla mild yoghurt honung",
        "3056010116": "Arla mild yoghurt naturell",
        "2271661542": "Arla mild yoghurt vanilj ",
        "2106530234": "Arla mild yoghurt vanilj ekologisk",
        "927308489": "Bregott mindre",
        "2480668745": "mineralvatten",
        "3544992113": "Arla Köket minifraiche",
        "2520168024": "minimarshmallow",
        "1423411571": "minimozzarella",
        "1026128822": "minioliv",
        "2740845097_2832465845": "mintchoklad",
        "3372435988": "minutfilé",
        "365863588": "mirin",
        "876554530": "misopasta",
        "3322741327": "mix för vetebröd",
        "1388021426_2184341800": "mjöl",
        "3915876929": "mjölig potatis",
        "4072766249": "Arla mjölk",
        "2867645421": "mjölkchoklad",
        "3107944945": "mjuk lakrits",
        "1884193611": "mjuk lakritspinne",
        "1573283853": "mjuk pepparkaka",
        "296244841": "mjuk saltlakrits",
        "2749013296": "mörk choklad",
        "2957428968": "mörk choklad med apelsin",
        "620391394": "mörk choklad med mint",
        "4246869978": "mörk öl",
        "3230143429": "mörk rom",
        "2834800320": "mörk sirap",
        "723715310": "mörkt bröd",
        "13996896": "mörkt muscovadosocker",
        "1140860602_3452826718": "morot",
        "4245620250": "morotsjuice",
        "1382673970": "mortadella",
        "2900566390_2109825977": "mozzarella",
        "1142497271_268019006": "muscovadosocker",
        "976088699": "muskotnöt",
        "3278043810": "müsli",
        "3139387612": 'müsli med "crunch"',
        "2731489598": "musselbuljong",
        "4197929251_3216540816": "mussla",
        "1406662904": "myntablad",
        "2069004173": "naanbröd",
        "962513177": "nachochips",
        "2247881655": "nässlor",
        "2865885734": "nätmelon",
        "2368703874": "natriumbensoat",
        "3948142373": "nektarin",
        "4149691736": "non-stop",
        "3109486125": "noriark",
        "1171363809_1520078564": "nöt",
        "3526344545": "nötfärs",
        "27915051_3259498189": "nötkött",
        "341798206": "nötkräm",
        "3415500048": "nötlever",
        "1236659360": "nougat",
        "2836444617_2323341803": "nudlar",
        "1692749435": "nyponskalsmjöl",
        "2748022586": "nyponsoppa",
        "3812274472": "ogenmelon",
        "985233277_1369040933": "öl",
        "1160069691_4173888828": "oliv",
        "4218568806_880780068": "olivolja",
        "2689443754": "olivolja med smak av citron",
        "3657037185_657727100": "olja",
        "630877056": "olja med smak av tryffel",
        "80505239": "ölkorv",
        "1288256655": "orientalisk curry",
        "3932347324": "orientaliskt tunnbröd",
        "809578980": "Yoggi original madagaskar vanilj",
        "815189287": "orökt kaviar",
        "49307359": "örtbuljong",
        "925480668": "örtkrydda",
        "908324378": "örtsalt",
        "554550205": "osötad senap",
        "1074369048": "osötat fullkornsbröd",
        "931337251_327346868": "ost",
        "1011282702": "ostlöpe",
        "73251069": "ostron",
        "3133133241": "ostronsås",
        "3425286947": "ostronskivling",
        "3878749880": "oxbuljong",
        "875333327": "oxfilé",
        "1374928918": "oxfond",
        "2844702476": "oxsvans",
        "1638801489": "oystersauce",
        "275547595": "padrones",
        "350854737": "pajdeg",
        "3038858954": "pak choi",
        "478733208": "palsternacka",
        "4006045170": "pancetta",
        "2017031783": "Apetina Paneer",
        "3669322683": "paninibröd",
        "586373701": "panko",
        "2844029154": "pannkaka",
        "1135710159": "papaya",
        "2794195844_1364197354": "paprika",
        "1997611703": "paprika i olika färger",
        "1014728358_4142744486": "paprikapulver",
        "794254946": "pärlcouscous",
        "2940334535": "pärllök",
        "2278477523": "pärlsocker",
        "3348400784_3285290989": "parmaskinka",
        "2380486632": "parmesanost",
        "1396933647": "päron",
        "3069360588": "päronglass",
        "3208358785": "päronlikör",
        "3518754998": "passerade tomater",
        "930033840": "passionsfrukt",
        "3297169556_612560740": "pasta",
        "902677036": "pasta farfalle",
        "2306833662": "pasta fusilli",
        "3292670361": "pasta gnocchi",
        "2903191467": "pasta linguine",
        "273220226": "pasta orecchiette",
        "2104715609": "pasta penne",
        "1438017205": "pasta radiatori",
        "666484763": "pasta rigatoni",
        "2306099786": "pastahjärtan",
        "957689371": "pastahjul",
        "2141910301_3080011553": "pastasås",
        "2183280413": "Kelda pastasås fyra ostar",
        "2953012803": "Kelda pastasås mild ost",
        "2793761891": "Kelda Pastasås parmesan & kyckling",
        "882716253": "Kelda pastasås portabellosvamp&ost",
        "1134051192": "Kelda pastasås tomat&crème fraiche",
        "2760017177": "pastasnäckor",
        "3006951523": "pastrami",
        "1001663981": "pekannöt",
        "3584196068_833817676": "peppar",
        "1328001841": "pepparkaka",
        "3744159771": "pepparkakskrydda",
        "4144318572": "pepparmintsarom",
        "3787840346": "pepparmix",
        "2610895864": "pepparmyntsolja",
        "1933628125": "pepparrot",
        "959425780": "persika",
        "3154423055": "persiljerot",
        "3962337203": "persiljestjälk",
        "2625055607_806008221": "pesto",
        "2374622601": "petit choux-mix",
        "386528743": "physalis",
        "2327140470": "pickles",
        "2455169550": "pilgrimsmussla",
        "976595879": "pimientos de padron",
        "3351287155": "pineapple salsa",
        "4143884931_2848187569": "pinjenöt",
        "1101287849": "pistagenöt",
        "1059549562": "pitabröd",
        "1797754678": "pizzadeg",
        "4014131966": "pizzakit",
        "1093811360": "pizzakrydda",
        "3081479356": "pizzamix",
        "3726770912": "plastglas ",
        "1525204821": "plommon",
        "3728953311": "plommontomat",
        "1759768901": "polarbröd",
        "2644968170": "polenta",
        "774282503": "polkabeta",
        "2838806723": "polkachoklad",
        "2076717452": "polkagris",
        "961084395": "polly",
        "3972960650_1366594694": "pomerans",
        "3893155511": "pomeransskal",
        "1871955598": "pommes chateau",
        "4058923004": "popcorn",
        "3695257161": "portabellosvamp",
        "126426081": "porter",
        "2447987242": "portionsbaguette",
        "2680067336": "portionsbröd",
        "550918072_2035438286": "portvin",
        "304147639": "portvinsgelé",
        "2812685293_3284432557": "potatis",
        "3864985249": "Kelda Potatis-&purjolökssoppa",
        "877076840": "potatischips, saltade",
        "2927487741": "potatismjöl",
        "2330310646": "potatismos",
        "2848787828": "pressad citron",
        "1682158041": "pressad lime",
        "345934929": "prinskorv",
        "4189646954": "prosciutto",
        "3893385081": "Arla protein mjölkdryck choklad sport",
        "3132914111_892462111": "pumpa",
        "2547035275_321643885": "pumpakärna",
        "1093283261": "pumpernickelbröd",
        "1008970743": "punsch",
        "1687314181": "purjolök",
        "2372433455_405898380": "quinoa",
        "700189068": "quinoa tricolore",
        "2051417670": "quinoapuffar",
        "437884595": "quornbit",
        "271755414": "quornfärs",
        "1936182643": "quornfilé",
        "3019252461": "rabarber",
        "2407916464": "rabarberkräm",
        "2852265128": "rädisa",
        "2991474571": "rågbröd",
        "4168512568": "rågflingor",
        "3776303310": "rågkross",
        "3498127040_2454856529": "rågmjöl",
        "2848728312": "rågsikt",
        "1333274795": "räka med skal",
        "2670932285_1503624986": "råkorv",
        "3646068523": "räkskal",
        "1596326153_2709454001": "ramslök",
        "2743150223": "ramslöksblad",
        "137781217_1019198762": "rapsolja",
        "1325576559_61864648": "råris",
        "4228945298": "rårörda lingon",
        "1490526317": "rårörsocker",
        "1238766156": "rättika",
        "3815075482": "ravioli",
        "1332776037": "regnbågslax",
        "3178125593": "remoladsås",
        "3043806626": "renskav",
        "1981041628": "revbensspjäll",
        "3435482982": "ricotta",
        "3977629817": "rimmad lax",
        "3844061073": "rimmad oxbringa",
        "1383361691": "rimmat bogfläsk",
        "3124398082": "rimmat fläsk",
        "861403049": "rimmat sidfläsk",
        "2234589690_1252706684": "ris",
        "94546119": "risgrynsgröt",
        "423583990": "rismjöl",
        "4088699016": "risnudlar",
        "1593130867": "risoni",
        "75501788": "risotto",
        "2336012670_308718491": "risottoris",
        "783480200": "rispapper",
        "2352297469": "risvinäger",
        "3047583061": "riven lagrad ost",
        "3910531541": "Arla Familjefavoriter riven ost Gouda",
        "3000410596": "Arla Köket riven ost gratäng",
        "3612461249": "Arla Köket riven ost mager",
        "1367392615": "Arla Familjefavoriter riven ost mozzarella",
        "2736563234": "Arla Köket riven ost pizza",
        "1249099134": "Arla Köket riven ost texmex",
        "3036791943": "Wästgöta Kloster röd 28%",
        "860365466_3125227541": "röd chili",
        "1875153807": "röd currypasta",
        "2696342314": "röd hushållsfärg",
        "3931830393": "röd lins",
        "1722222485": "röd paprika",
        "3259673750": "röd pesto",
        "2635521704": "röd spansk peppar",
        "44897899": "röd stenbitsrom",
        "3895312936": "röd tandoori currypasta",
        "1694629172": "röda mangoldskott",
        "3360560984_2156124469": "rödbeta",
        "3291169553": "rödbetsgrodd",
        "4205782078": "rödbetsjuice",
        "4089614803": "rödbetslag",
        "1473388618": "rödbetsskott",
        "179972718": "rödingfilé",
        "1773779288": "rödkål",
        "3829815457_698137743": "rödlök",
        "1530721011_1654928151": "rödspätta",
        "1805516643": "rödspättafilé",
        "2011962971": "rödtunga",
        "3936795991_2284916815": "rödvin",
        "3921361808": "rödvinsvinäger",
        "2489795393_4109996583": "rökt fisk",
        "3363213252": "rökt fläsk",
        "3754168353": "rökt kalkon",
        "1718984240": "rökt kalkonbröst",
        "2723297378": "rökt kött",
        "1863894105": "rökt lammfiol",
        "3464702463": "rökt lax",
        "1046334105": "rökt makrill",
        "3547341543": "rökt nötkött",
        "268508773": "rökt paprikapulver",
        "1472285919": "rökt renkött",
        "4088779402": "rökt renstek",
        "277342429": "rökt sidfläsk",
        "4258697334": "rökt skinka",
        "1499118252": "rökt viltkött",
        "4218823367_146219626": "rom",
        "2217686375": "romanesco",
        "2547301976": "romansallad",
        "2192797687": "rönnbärsgelé",
        "1537984230": "rosenblad",
        "802295691": "rosenvatten",
        "2252147252": "rosépeppar",
        "3042597412": "rosmarinkvist",
        "4272193987": "rostad lök",
        "585729850": "rostad majs",
        "1034531828": "rostad pinjekärna",
        "1959586310": "rostad pumpakärna",
        "1780435178": "rostad tomat",
        "2847569084": "rostade hasselnötter",
        "3271542678": "rostade pinjenötter",
        "2155318463": "rostade sesamfrön",
        "2498018032_431492019": "rostbiff",
        "4068217169": "rostbröd",
        "2612124861_4097527992": "rotfrukt",
        "3387034116": "rotselleri",
        "620673360": "rött äpple",
        "99133160": "rött råris",
        "1545083341_3444844349": "rött vin",
        "610275915": "rucola",
        "3323080314": "rund knäckebrödskaka",
        "725419302": "rundkornigt ris",
        "2555479127_1789735464": "russin",
        "1647403944": "ryggbiff",
        "4022752421": "saffran",
        "810020912": "salami",
        "2741211660": "sallad",
        "2857766368": "salladsblad",
        "1105571790": "salladskål",
        "3255898951": "salladslök",
        "3207408916": "salladsmix",
        "960030101": "salladsskott",
        "743207020": "salmbärssylt",
        "1632095079": "salsiccia",
        "3623708641_1329871752": "salt",
        "3539515308": "salt och peppar",
        "253229625": "salt och svartpeppar",
        "1597600253": "salta jordnötter",
        "4161738561": "saltgurka",
        "3233140999": "saltrostad mandel",
        "1163968981": "saltrostad solroskärna",
        "3582846983": "saltrostade cashewnötter",
        "4160227771": "salviablad",
        "3136349805": "sambal oelek",
        "2473130242": "sardell med kapris",
        "3233209964": "sardellfilé",
        "580651381": "sardiner i olja",
        "2995201753": "savoiardikex",
        "102906354": "savoykål",
        "3607958255": "schalottenlök",
        "3053229863": "schalottenlökfond",
        "3209800358": "sconesmix",
        "3077995156": "seg bil",
        "1523206887": "segt chokladgodis",
        "4221545375": "sejfilé",
        "3630862412": "sellerisalt",
        "2540898019_3863049066": "senap",
        "358808758": "senapsfrö",
        "1242358747": "senapspulver",
        "3469786990_3735619037": "sesamfrö",
        "2607771233": "sesamolja",
        "3325061270": "seven spice",
        "761918112": "sharonfrukt",
        "2789042967": "sherry",
        "1727112261": "sherryvinäger",
        "1864610070": "shiitakesvamp",
        "2911993435": "sichuanpeppar",
        "3857749498": "sikrom",
        "752314657": "siktat dinkelmjöl",
        "2292080323": "sillspad",
        "2914981341": "silverlök",
        "3439849069_3713914966": "sirap",
        "1881396501": "sjögräsnudlar",
        "2922350526": "skalade räkor",
        "3485810503": "skaldjursfond",
        "3273197772": "skånsk senap",
        "1430840174": "skärböna",
        "1415172764": "Kelda Skärgårdssoppa",
        "2514273378_243596324": "skinka",
        "697102427": "skinkschnitzel",
        "3984724548": "skivad ananas ",
        "2085298631": "skivad inlagd jalapeno",
        "3465554388": "skogschampinjon",
        "1409945728": "Kelda Skogssvampsoppa",
        "2515257188": "sky",
        "713051041": "små maränger",
        "3356804600": "småbröd",
        "300040037": "smålök",
        "1168225095": "Arla Köket smetana",
        "3241537136": "Arla Köket Smör-&rapsolja",
        "2514313683": "Arla Smör&rapsolja gourmet",
        "574829060": "Arla Köket Smör-&rapsolja oliv",
        "2662848397_1827514879": "smördeg",
        "18687778": "smördegsplatta",
        "3495516286": "smörgåsgurka",
        "889237427": "smörgåskrasse",
        "3003722673": "Arla Smörstav",
        "1293136994": "snabbkaffepulver",
        "3432270130": "sobanudel",
        "152308189": "sockerärta",
        "79032769": "sockerkaka",
        "2828235251_838569965": "soja",
        "2843044562": "sojaböna",
        "3650574836": "sojafärs",
        "568478891": "solrosfrö",
        "439549593_1848000585": "solroskärna",
        "3189412353": "solrosskott",
        "3745147057": "soltorkad körsbärstomat",
        "3781030864": "soltorkad tomat",
        "1904571234": "soltorkade tomater",
        "3742855978": "soltorkade tomater i olja",
        "3363541555": "sötmandel",
        "2455462553": "sötpotatis",
        "3811353353": "sötstark senap",
        "4182236044": "sött vitt vin",
        "848882720_1161232403": "spaghetti",
        "3945529745": "sparrisbroccoli",
        "256133095_2570951131": "spenat",
        "1707945335": "spetskål",
        "3357536728": "spirulinapulver",
        "3226747737": "Puck Spread",
        "1902651998": "srirachasås",
        "499970251": "Arla standardmjölk",
        "93856127": "stark ajvar relish",
        "371275252": "stark julsenap",
        "3659456640": "stark salsasås",
        "1748885141": "stark senap",
        "4199314400": "starkt kaffe",
        "2713154085": "steklök",
        "1003093122": "stekpåse",
        "1225949183_2717173575": "stenbitsrom",
        "562627773": "stjälkselleri",
        "1204507899": "stjärnanis",
        "3446285015": "stor räka med skal",
        "3752589229": "stor räka utan skal",
        "3128265084": "stout",
        "1111887382": "strimlat nötkött",
        "1517605789_2808782890": "ströbröd",
        "3994277327": "strömmingsfilé",
        "1426563470": "strösocker",
        "911379750": "strössel",
        "1901493828": "sugarsnaps",
        "4293534719": "sumak",
        "2037802789": "surdegsbaguette",
        "1837292100": "surdegsbröd",
        "2431759171": "surkål",
        "3274098940": "surströmming",
        "865769938_288290281": "svamp",
        "3035527273": "svampbuljong",
        "567897289": "svampfond",
        "729517616": "Wästgöta Kloster svart 31%",
        "4011666490": "svart böna",
        "3159030279": "svart hushållsfärg",
        "3618622585": "svart kärnfri oliv",
        "263607552": "svart lins",
        "914069750": "svart oliv",
        "3426363203": "svart quinoa",
        "2365045353": "svart stenbitsrom",
        "13007491": "svart te",
        "2801058573": "svart vinbär",
        "4064652972": "svartkål",
        "822922967_2300673099": "svartpeppar",
        "3645418416": "svartpepparkorn",
        "2460269386": "svartrot",
        "645429701": "svartvinbärsgelé",
        "2483743080": "svartvinbärssaft",
        "3404157344": "svartvinbärssylt",
        "1218135352": "Arla Svecia ",
        "4110753650_3209171519": "Arla Svecia",
        "1666481223": "Arla Svenskt Smör",
        "756706220": "Arla Svenskt Smör ekologiskt",
        "488182003": "Arla Svenskt Smör osaltat",
        "2639658328": "sweet chilisås",
        "1276375078": "sweet&sour sås",
        "24803430_816121977": "sylt",
        "3272875173": "syltad ingefära",
        "1533251647": "syltlök",
        "3596074771": "syltsocker",
        "4225919708": "Arla Köket syrad grädde 30%",
        "3587162361_2293441969": "tabasco",
        "2431562270": "tabasco chipotle",
        "3628497659": "taco kryddmix",
        "323593412_496266508": "tacosås",
        "2900078785": "tacoskal",
        "1013326985_3355971690": "tagliatelle",
        "1257893373": "tahini",
        "2565153473": "tamarindpasta",
        "3518985070": "tamarisoja",
        "3936453422": "tandoori kryddmix",
        "652010266": "tandooripasta",
        "2529389480": "tandpetare",
        "2013139472_1197761226": "tapenade",
        "3905630727": "tärnat bacon",
        "2774867648": "tårtbotten",
        "1812272452": "teriyakimarinad",
        "2870789553": "teriyakisås",
        "2304071790": "Kelda Texmex tomatsoppa",
        "3284502891": "thaibasilika",
        "1003794429": "Kelda Thaisoppa",
        "303464029": "tikka masala kryddmix",
        "3977960190": "tikka masala sås",
        "744012625": "tofu",
        "544841215_1854825975": "tomat",
        "2713444048": "tomatcurd",
        "1830508333": "tomatjuice",
        "3791468988": "tomatketchup",
        "3809527651": "tomatpuré",
        "4063478007": "tomatsalsa",
        "3615145843_283672336": "tomatsås",
        "637066227": "tomatsås till pizza",
        "3266880440": "tomattartar",
        "434080103_3312537854": "tonfisk",
        "3556856496": "tonfisk i olja",
        "2162183345": "tonfisk i vatten",
        "1683842953": "torkad aprikos",
        "4154802483": "torkad basilika",
        "3181579553": "torkad dragon",
        "2606499859_3578129824": "torkad frukt",
        "3456529281": "torkad gul ärta",
        "3722846183": "torkad ingefära",
        "4290762935": "torkad Karl Johan ",
        "3394701117": "torkad körvel",
        "1410255597": "torkad mejram",
        "3917274706": "torkad mynta",
        "1949807119": "torkad oregano",
        "324268816": "torkad rosmarin",
        "1059235856": "torkad salvia",
        "2802331890": "torkad timjan",
        "1598056760": "torkat äpple",
        "464896315": "torkat blåbär",
        "2903041769": "torkat fikon",
        "2478303313": "torkat tranbär",
        "3091282380": "torr sherry",
        "1690451022": "torr vermouth",
        "2339144975": "torrjäst",
        "3378364071": "torrostade jordnötter",
        "2425876465": "torrt vitt vin",
        "3595911224": "torskfilé",
        "914775093": "torskrygg",
        "1901344100": "tortellini",
        "1433384576": "tortellini ost",
        "1249932770": "tortillabröd",
        "2717238174": "tortillachips",
        "2874686882": "Kelda Toscansk tomatsoppa",
        "1828437091": "tranbär",
        "1605035403_332791336": "tranbärsjuice",
        "1453971807": "träspett",
        "1829016644": "trattkantarell",
        "1524349021": "tropiskjuice",
        "2717811884": "tunn chokladplatta",
        "835230294": "tunnbröd",
        "948849959": "turkisk peppar",
        "3308849037": "Arla Köket turkisk yoghurt",
        "3343290833": "utskuren biff",
        "2600600930_2680765560": "vallmofrö",
        "1522457177": "valnöt",
        "123289213": "valnöts- eller hasselnötsolja",
        "2162604074": "valnötsfralla",
        "2094818111": "vaniljglass",
        "3175166361": "vaniljkräm",
        "382877763": "vaniljpulver",
        "635974934": "Arla Köket vaniljsås",
        "1795573907": "vaniljsocker",
        "4193795502": "vaniljstång",
        "3911339630": "Arla Köket vaniljvisp",
        "3216346975": "vannameiräka",
        "3776814505": "varmrökt lax",
        "1262695276": "varmrökt makrill",
        "2550879232": "Arla Västan krav",
        "1475372872": "vatten",
        "2378488553": "vattenkastanj",
        "1538671950": "vattenkrasse",
        "1030833642": "vattenmelon",
        "3990992970": "vaxböna",
        "2632785207": "vetekli",
        "3363673882": "vetekross",
        "1578528546": "vetelängd",
        "4028842345_3146794475": "vetemjöl",
        "566126564": "vetemjöl med fullkorn",
        "1951408031": "vetemjöl special",
        "10498172": "vetemjöl special med fullkorn",
        "502789334": "vildris",
        "2724352575": "vildrismix",
        "459779428": "vilt- och kantarellfond",
        "4156406475": "viltbuljong",
        "3941707431": "viltburgare",
        "1327812052": "viltfärs",
        "372856729": "viltfond",
        "1315350694": "viltkrydda",
        "1500057137": "viltskav",
        "1777159323_2143522704": "vinäger",
        "2932064228": "vinbär",
        "2954523189": "vinbärsgelé",
        "2028486881": "vinbärslikör",
        "56845687_409912433": "vindruva",
        "2125791911": "vindruva blå",
        "2859758045": "vinglögg",
        "618303763": "Arla Köket vispgrädde",
        "3373330301": "Arla vispgrädde",
        "3512038013": "vit balsamvinäger",
        "317388171": "vit böna",
        "3866474783": "vit choklad",
        "3792719005": "vit glögg",
        "2596923615": "vit sirap",
        "1335361295": "vitkål",
        "2369290276_3385323261": "vitlök",
        "884363637": "vitlöksklyfta",
        "2838981862": "vitlökspulver",
        "455931723_593810776": "vitmögelost",
        "2180176882": "Apetina vitost",
        "733898756": "Apetina vitost 10%",
        "3955850909": "Apetina vitost 17%",
        "3176379562": "Apetina vitost herbes de Provence",
        "2689257052": "Apetina vitost krämig hel bit ",
        "1893748520": "Apetina vitost tärnad i lake 22%",
        "1726315783": "Apetina vitost tärnad i lake 3%",
        "1356590249": "Apetina vitost tärnad i olja vitlök & örter",
        "149163406": "Apetina vitost vitlök & persilja",
        "4079760407_720316833": "vitpeppar",
        "1935965123": "vitpepparkorn",
        "1376500565": "vitt portvin",
        "2752845830_1599838698": "vitt vin",
        "1209271750": "vitvinsvinäger",
        "3472529149": "vodka",
        "4173338965": "vörtbröd",
        "2312163303": "wasabipasta",
        "401454443": "whisky",
        "1157287883": "Castello White",
        "3565976896": "Castello White with goats milk",
        "1166628608": "Castello White with truffle",
        "1608746595": "wienerkorv",
        "4261795093": "wontondeg",
        "184618108": "worcestersås",
        "1628205373": "Yoggi Yalla! yoghurt smoothie hallon",
        "3435290890": "Arla yoghurt kvarg hallon",
        "698280897": "Arla yoghurt kvarg naturell",
        "3084041924": "Arla yoghurt kvarg vanilj",
        "2659539876": "Arla yoghurtkvarg naturell",
        "1516456735": "zucchini",
        "804426821": "grevé",
        "2104714428": "präst",
        "631934407": "sill",
        "725680543": "fisk",
        "63577082": "aborre",
        "492834832": "dessertost",
        "714343925": "ädelost",
        "595872216": "desserost",
        "801717671": "calvadosädel",
        "1776010585": "sprit",
        "3681732545": "groddar",
        "2772822960": "ananasskivor",
        "902963371": "annanas",
        "2287738841": "färska kryddor",
        "4228517744": "anka",
        "1179477015": "ansjovis",
        "3727738448": "apelsiner",
        "1996713487": "juice",
        "2943373056": "jus",
        "917857995": "jos",
        "2118757609": "marmelad",
        "1127501637": "chutney",
        "2314851575": "cider",
        "2331019626": "herrgård",
        "704866907": "inlagd gurka",
        "3391034279": "ättiksprit",
        "2685593531": "äggplanta",
        "1864829362": "grillpinnar",
        "116526638": "aborioris",
        "1180529282": "kex",
        "732366862": "balsamico",
        "1565462069": "snacks",
        "2481840525": "scharlottenlök",
        "407095335": "sås",
        "3145014160": "bechamelsås",
        "1846337887": "linser",
        "4043850909": "lammkött",
        "810525470": "frön",
        "2748456088": "bönor",
        "2183416651": "grönsallad",
        "1008324323": "sallat",
        "3967713333": "citrusfrukter",
        "1226706808": "grönsaker",
        "248557216": "skaldjur",
        "3043641391": "örter",
        "2978887382": "blåmögelost",
        "3173486862": "bregott",
        "3731146603": "bordsmargarin",
        "769939155": "smör",
        "996798925": "brie",
        "409499150": "krutonger",
        "2146277451": "cheddar",
        "1343089191": "chai",
        "187269298": "mouseerande",
        "2729825579": "bubbelvin",
        "701567500": "cava",
        "523876498": "chili",
        "2260701622": "chipotle",
        "2580221037": "chokladpulver",
        "2615336579": "oboy",
        "3104312956": "pucko",
        "4104621089": "chokladmjölk",
        "319523247": "kola",
        "3464645584": "smältost",
        "1568896625": "keso",
        "2453837487": "cottage cheese",
        "1761303226": "crème fraiche",
        "3039460068": "dinkel",
        "780871443": "yoghurt",
        "2928049438": "edamer",
        "117467811": "fil",
        "3315510301": "filmjölk",
        "3730233871": "filmölk",
        "1893464018": "gräddfil",
        "3052745537": "filkmölk",
        "2398458140": "mjölk",
        "2675591486": "lantmjölk",
        "2133082787": "lättmjölk",
        "139302258": "soppa",
        "885515503": "tomatsoppa",
        "1710660460": "grädde",
        "321619070": "vispgrädde",
        "2436836318": "basilika",
        "1406295288": "spansk peppar",
        "4070854860": "chilifrukt",
        "196849345": "dill",
        "841206249": "dragon",
        "3214235037": "gnocchi",
        "3859611327": "gräslök",
        "15402132": "sparris",
        "2898431986": "grön sparris",
        "2074123124": "gurkmeja",
        "3142514993": "haricots verts",
        "941958694": "ingefära",
        "3278630076": "koriander",
        "1998525200": "körvel",
        "4489424": "lasagneplattor",
        "2141708071": "mejram",
        "1408627996": "mynta",
        "1101209280": "oregano",
        "2972636995": "persilja",
        "3928251265": "rosmarin",
        "3317923559": "salvia",
        "536274160": "skinkor",
        "691471581": "timjan",
        "457851178": "tryffel",
        "485818142": "vit sparris",
        "2548610714": "fikon",
        "1693901064": "färksost",
        "3200779899": "buljong",
        "665046820": "fiskbullar",
        "3895544240": "fond",
        "3015411437": "saft",
        "1142182047": "sorbet",
        "2317834957": "sprouts",
        "1091627790": "pizzabotten",
        "1705326197": "frysta grönsaker",
        "348663746": "grön ärta",
        "882583033": "ärtor",
        "1300711863": "gröna ärta",
        "367135044": "grönsaksmix",
        "370501354": "jordgubbar",
        "2637380397": "wokgrönsaker",
        "3405280983": "glasspinnar",
        "1294151031": "ädelsost gorgonzola",
        "3802798734": "gös",
        "3149265333": "gräddmjölk",
        "205117676": "gräddost",
        "663269362": "jalapeno",
        "1318318148": "grekisk yoghurt",
        "667910254": "matyoghurt",
        "3378137475": "grönsker",
        "1200631375": "vitost",
        "3014867359": "sparrissoppa",
        "1262693900": "frukt äpple",
        "432793951": "te",
        "1909286227": "svarpeppar",
        "936816555": "kalvkött",
        "3062914951": "gula ärtor",
        "2609765433": "gulaschsoppa",
        "3359100878": "salladsost",
        "3405688869": "apetina vitost",
        "3757667252": "kakor",
        "4016874486": "kykling",
        "855932642": "spiskummin",
        "3709025444": "bovete",
        "2167529295": "jordnötter",
        "4229277922": "hushållsost",
        "4254503280": "is",
        "12593373": "påskmust",
        "174776219": "must",
        "641750653": "bullar",
        "2204958596": "kanel",
        "1713576194": "hushållsfärg",
        "346257299": "kardemumma",
        "1336855559": "kebabkött",
        "1726677435": "kefir",
        "2020672706": "gräddsås",
        "1214005678": "durumvete",
        "3226098701": "kolja",
        "1373252651": "apeslinjouce",
        "1845985318": "persikohalvor",
        "1387502614": "kotlett",
        "856021102": "färs",
        "3485158244": "käfta",
        "2942786432": "brödtärningar",
        "954860804": "kryddost",
        "1711709533": "kvarg",
        "293327748": "kesella",
        "1670268314": "godis",
        "3173665299": "knäck",
        "397008431": "mjölk- &amp; havredryck",
        "4093414496": "socker",
        "986141785": "maizena",
        "3814693118": "muskot",
        "4294073982": "vipeppar",
        "3523882177": "mandarin",
        "1655593483": "potais",
        "1818136859": "mandelnötter",
        "4063076356": "marquis",
        "2184044057": "vin",
        "1713073855": "matjesill",
        "3402503951": "matlagningsgrädde",
        "1846195811": "matlagningsyoghurt",
        "4079333907": "mellangrädde",
        "3978262793": "mellanmjölk",
        "855062619": "ctronsås",
        "935896767": "yghurt",
        "3027158451": "bubbelvatten",
        "1878666576": "miso",
        "1967070133": "laktrits",
        "2887314613_3099349628": "musli",
        "506619710": "chips",
        "3954921865": "lever",
        "114655265": "kurry",
        "1836778028": "paneer",
        "514426780": "farfalle",
        "2559390476": "fusilli",
        "2294813904": "linguine",
        "358505068": "orecchiette",
        "1555244520": "penne",
        "3136112665": "radiatori",
        "2739296369": "rigatoni",
        "3267794762": "ostsås",
        "3606154971": "konserverade grönsaker",
        "2648624609": "pita",
        "445919563": "samp",
        "388531950": "quorn",
        "1317550485": "räka",
        "3327151298": "oxbringa",
        "924852182": "bogfläsk",
        "2987308315": "fläsk",
        "2901505197": "sidfläsk",
        "3617709983": "riven ost",
        "1349006819": "gouda",
        "1625661007": "gratängost",
        "3561669390": "pizzaost",
        "1342567779": "mangold",
        "2028424403": "röding",
        "563753005": "kål",
        "4170987619": "plattfisk",
        "2523799010": "renkött",
        "4015151466": "renstek",
        "3722540103": "viltkött",
        "443551779": "hasselnötter",
        "3376159911": "pinjenötter",
        "2832006097": "mandlar",
        "1586633005": "cashewnötter",
        "3167383662": "sardeller",
        "2497222244": "sardiner",
        "3502630365": "bilar",
        "491272680": "sej",
        "2465541331": "schnitzel",
        "1953790769": "champion",
        "187947089": "maränger",
        "2849589470": "smetana",
        "3476199248": "flytande margarin",
        "1369669130": "soya",
        "515341318": "vegofärs",
        "2848702340": "soltrokad tomat",
        "2070935619": "spagetti",
        "3497450966": "salsasås",
        "542834114": "selleri",
        "3357499433": "strömming",
        "67328815": "sockerärtor",
        "1465605622": "svecia",
        "1956291855": "syrad grädde",
        "1374230857": "ketchup",
        "970898853": "karljohan",
        "2828545124": "vermouth",
        "2109516774": "torsk",
        "3169730918": "lakrits",
        "3562598657": "turkisk yoghurt",
        "1962142519": "vanilj",
        "2252142788": "vaniljsås",
        "66716962": "vanlilj",
        "3481508641": "markill",
        "1130663409": "västan",
        "1659603936": "druvor",
        "2504040311": "whiskey",
        "2519137920": "chevre",
        "1836922154": "smoothie",
        "1084309052": "squash",
      },
      RecipesPageSize: 20,
      PhoneNumber: "",
      SearchOptions: { MealType: 0, MainIngredient: null, SubIngredients: [] },
      IntroSection: { IconUrl: null, BackgroundImageUrl: null, Text: null },
      IsAuthenticated: false,
      RecaptchaSiteKey: "6Ld2P-UUAAAAAJg4y0jvOs9ZNq1mard-w89Hfgfd",
    };

    /* src\components\CInput.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1 } = globals;

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-1031m8i-style";
    	style.textContent = "\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ0lucHV0LnN2ZWx0ZSIsInNvdXJjZXMiOlsiQ0lucHV0LnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxyXG4gIGltcG9ydCB7IG9uTW91bnQgfSBmcm9tIFwic3ZlbHRlXCI7XHJcbiAgaW1wb3J0IHsgY3VzdG9tSW5ncmlkaWVudHMgfSBmcm9tIFwiLi4vc3RvcmVcIlxyXG4gIGltcG9ydCBDaGlwIGZyb20gXCIuL0NoaXAuc3ZlbHRlXCI7XHJcbiAgaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tIFwiLi9BdXRvY29tcGxldGUuc3ZlbHRlXCJcclxuICBpbXBvcnQgRW1wdHlGcmlkZ2VEYXRhIGZyb20gJy4uLy4uL3Rlc3R0LmpzJ1xyXG4gIGV4cG9ydCBsZXQgbWFpbkluZ3JpZGllbnRzXHJcblxyXG4gIGNvbnN0IGFycmF5T2ZPYmogPSBPYmplY3QuZW50cmllcyhFbXB0eUZyaWRnZURhdGEuSW5ncmVkaWVudHMpLm1hcCgoZSkgPT4gKCB7ICdpbmdyZWRpZW50SWQnOiBlWzBdLCAnbmFtZSc6IGVbMV0gfSApKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48QXV0b2NvbXBsZXRlIGNsYXNzPVwiaW5wdXRcIiBuYW1lPVwiZnJ1aXRzXCIgIGl0ZW1zPVwie2FycmF5T2ZPYmp9XCIgbWluQ2hhcj1cIjJcIiBtYWluSW5ncmlkaWVudHM9e21haW5JbmdyaWRpZW50c30vPlxyXG5cclxuXHJcbjxzdHlsZT5cclxuICAuZm9ybS1yb3cgaW5wdXQge1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcclxuICAgIGJvcmRlcjogbm9uZTtcclxuICAgIG91dGxpbmU6IG5vbmU7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcclxuICAgIGNvbG9yOiAjMzIzMjVkO1xyXG4gICAgZm9udC1mYW1pbHk6IENhbXBob3IsIE9wZW4gU2FucywgU2Vnb2UgVUksIHNhbnMtc2VyaWY7XHJcbiAgICBmb250LXdlaWdodDogNDAwO1xyXG4gICAgZm9udC1zaXplOiAxN3B4O1xyXG4gICAgbGluZS1oZWlnaHQ6IDI2cHg7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjZmOWZjO1xyXG4gICAgcGFkZGluZzogNXB4IDIwcHggOHB4IDEzcHg7XHJcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWNvbG9yIDAuMXMgZWFzZS1pbiwgY29sb3IgMC4xcyBlYXNlLWluO1xyXG4gIH1cclxuICAuZm9ybS1yb3cgaW5wdXQuaGFzLXZhbHVlLFxyXG4gIC5mb3JtLXJvdyBpbnB1dC5oYXMtZm9jdXMge1xyXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XHJcbiAgICBib3gtc2hhZG93OiAwIDAgMCAxcHggI2U0ZWZmYTtcclxuICB9XHJcbjwvc3R5bGU+XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIn0= */";
    	append_dev(document.head, style);
    }

    function create_fragment$2(ctx) {
    	let current;

    	const autocomplete = new Autocomplete({
    			props: {
    				class: "input",
    				name: "fruits",
    				items: /*arrayOfObj*/ ctx[1],
    				minChar: "2",
    				mainIngridients: /*mainIngridients*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(autocomplete.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(autocomplete, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const autocomplete_changes = {};
    			if (dirty & /*mainIngridients*/ 1) autocomplete_changes.mainIngridients = /*mainIngridients*/ ctx[0];
    			autocomplete.$set(autocomplete_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(autocomplete.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(autocomplete.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(autocomplete, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { mainIngridients } = $$props;
    	const arrayOfObj = Object.entries(EmptyFridgeData.Ingredients).map(e => ({ "ingredientId": e[0], "name": e[1] }));
    	const writable_props = ["mainIngridients"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CInput> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CInput", $$slots, []);

    	$$self.$set = $$props => {
    		if ("mainIngridients" in $$props) $$invalidate(0, mainIngridients = $$props.mainIngridients);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		customIngridients,
    		Chip,
    		Autocomplete,
    		EmptyFridgeData,
    		mainIngridients,
    		arrayOfObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("mainIngridients" in $$props) $$invalidate(0, mainIngridients = $$props.mainIngridients);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mainIngridients, arrayOfObj];
    }

    class CInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1031m8i-style")) add_css$2();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { mainIngridients: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CInput",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mainIngridients*/ ctx[0] === undefined && !("mainIngridients" in props)) {
    			console.warn("<CInput> was created without expected prop 'mainIngridients'");
    		}
    	}

    	get mainIngridients() {
    		throw new Error("<CInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mainIngridients(value) {
    		throw new Error("<CInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Radio.svelte generated by Svelte v3.20.1 */

    const file$2 = "src\\components\\Radio.svelte";

    function add_css$3() {
    	var style = element("style");
    	style.id = "svelte-b5v77t-style";
    	style.textContent = "span.svelte-b5v77t{position:relative;border:var(--border-width) solid var(--border);transition:background 0.3s ease, border-color 0.3s ease;flex:1;line-height:35px;color:var(--text-color)\r\n  }@media(min-width: 768px){}input.svelte-b5v77t{display:none}label.svelte-b5v77t{cursor:pointer;display:flex;flex:1;text-align:center;height:40px}label.svelte-b5v77t:not(:first-child){margin-left:calc(var(--border-width) * -1)}label input:checked+span.svelte-b5v77t{z-index:2;background:var(--color);border-color:var(--color);color:#fff}label:first-child input+span.svelte-b5v77t{border-radius:6px 0 0 6px}label:last-child input+span.svelte-b5v77t{border-radius:0 6px 6px 0}.svelte-b5v77t:before,.svelte-b5v77t:after{box-sizing:inherit}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmFkaW8uc3ZlbHRlIiwic291cmNlcyI6WyJSYWRpby5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cclxuICBleHBvcnQgbGV0IG5hbWU7XHJcbiAgZXhwb3J0IGxldCB2YWx1ZTtcclxuICBleHBvcnQgbGV0IHRleHQ7XHJcblxyXG4gIGV4cG9ydCBsZXQgbWVhbE9wdGlvbnMgPSBbXTtcclxuICBleHBvcnQgbGV0IGdyb3VwID0gW107XHJcbjwvc2NyaXB0PlxyXG5cclxueyAjZWFjaCBtZWFsT3B0aW9ucyBhcyByYWRpbyB9XHJcbjxsYWJlbCBjbGFzcz1cInJhZGlvXCI+XHJcbiAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJ7cmFkaW8ubmFtZX1cIiB2YWx1ZT1cIntyYWRpby52YWx1ZX1cIiBiaW5kOmdyb3VwIC8+XHJcbiAgPHNwYW4+e3JhZGlvLnRleHR9PC9zcGFuPlxyXG48L2xhYmVsPlxyXG57L2VhY2h9XHJcblxyXG48c3R5bGU+XHJcbiAgc3BhbiB7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCkgc29saWQgdmFyKC0tYm9yZGVyKTtcclxuICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQgMC4zcyBlYXNlLCBib3JkZXItY29sb3IgMC4zcyBlYXNlO1xyXG4gICAgZmxleDogMTtcclxuICAgIGxpbmUtaGVpZ2h0OiAzNXB4O1xyXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpXHJcbiAgfVxyXG4gIEBtZWRpYSAobWluLXdpZHRoOiA3NjhweCkge1xyXG4gICAgLnNwYW4ge1xyXG4gICAgICBwYWRkaW5nOiA3cHggMjBweDtcclxuICAgIH1cclxuICB9XHJcbiAgaW5wdXQge1xyXG4gICAgZGlzcGxheTogbm9uZTtcclxuICB9XHJcbiAgbGFiZWwge1xyXG4gICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgZGlzcGxheTogZmxleDtcclxuICAgIGZsZXg6IDE7XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICBoZWlnaHQ6IDQwcHg7XHJcbiAgfVxyXG4gIGxhYmVsOm5vdCg6Zmlyc3QtY2hpbGQpIHtcclxuICAgIG1hcmdpbi1sZWZ0OiBjYWxjKHZhcigtLWJvcmRlci13aWR0aCkgKiAtMSk7XHJcbiAgfVxyXG4gIGxhYmVsIGlucHV0OmNoZWNrZWQgKyBzcGFuIHtcclxuICAgIHotaW5kZXg6IDI7XHJcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvcik7XHJcbiAgICBib3JkZXItY29sb3I6IHZhcigtLWNvbG9yKTtcclxuICAgIGNvbG9yOiAjZmZmO1xyXG4gIH1cclxuICBsYWJlbDpmaXJzdC1jaGlsZCBpbnB1dCArIHNwYW4ge1xyXG4gICAgYm9yZGVyLXJhZGl1czogNnB4IDAgMCA2cHg7XHJcbiAgfVxyXG4gIGxhYmVsOmxhc3QtY2hpbGQgaW5wdXQgKyBzcGFuIHtcclxuICAgIGJvcmRlci1yYWRpdXM6IDAgNnB4IDZweCAwO1xyXG4gIH1cclxuICAvKiAucmFkaW8ge1xyXG4gICAgLS1jb2xvcjogdmFyKC0tcHJpbWFyeS0xKTtcclxuICAgIC0tYm9yZGVyLWhvdmVyOiB2YXIoLS1wcmltYXJ5LTEpO1xyXG4gICAgLS1ib3JkZXItd2lkdGg6IDJweDtcclxuICAgIG1hcmdpbjogMCAwIDEycHggMDtcclxuICAgIGRpc3BsYXk6IHRhYmxlO1xyXG4gICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgbWFyZ2luOiAxMnB4IGF1dG8gMTJweCBhdXRvO1xyXG4gICAgbWluLXdpZHRoOiAxMTBweDtcclxuICB9XHJcbiAgLnJhZGlvLmlubGluZSB7XHJcbiAgICBtYXJnaW46IDAgMTJweCAwIDA7XHJcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgfVxyXG4gIC5yYWRpbyBpbnB1dCB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gIH1cclxuICAucmFkaW8gaW5wdXQgKyBzcGFuIHtcclxuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcclxuICAgIGhlaWdodDogMjJweDtcclxuICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgfVxyXG4gIC5yYWRpbyBpbnB1dCArIHNwYW46YmVmb3JlLFxyXG4gIC5yYWRpbyBpbnB1dCArIHNwYW46YWZ0ZXIge1xyXG4gICAgY29udGVudDogXCJcIjtcclxuICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gICAgbGVmdDogMDtcclxuICAgIHRvcDogMDtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICB9XHJcbiAgLnJhZGlvIGlucHV0ICsgc3BhbjpiZWZvcmUge1xyXG4gICAgaGVpZ2h0OiAxOHB4O1xyXG4gICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgpIHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbiAgICBiYWNrZ3JvdW5kOiAjZmZmO1xyXG4gICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjNzIGVhc2UsIGJvcmRlci1jb2xvciAwLjNzIGVhc2U7XHJcbiAgfVxyXG4gIC5yYWRpbyBpbnB1dCArIHNwYW46YWZ0ZXIge1xyXG4gICAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZSwgYmFja2dyb3VuZCAwLjJzIGVhc2UsXHJcbiAgICAgIC13ZWJraXQtdHJhbnNmb3JtIDAuM3MgZWFzZTtcclxuICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycyBlYXNlLCBiYWNrZ3JvdW5kIDAuMnMgZWFzZSxcclxuICAgICAgLXdlYmtpdC10cmFuc2Zvcm0gMC4zcyBlYXNlO1xyXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3MgZWFzZSwgb3BhY2l0eSAwLjJzIGVhc2UsIGJhY2tncm91bmQgMC4ycyBlYXNlO1xyXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3MgZWFzZSwgb3BhY2l0eSAwLjJzIGVhc2UsIGJhY2tncm91bmQgMC4ycyBlYXNlLFxyXG4gICAgICAtd2Via2l0LXRyYW5zZm9ybSAwLjNzIGVhc2U7XHJcbiAgfVxyXG4gIC5yYWRpbyBpbnB1dDpjaGVja2VkICsgc3BhbjpiZWZvcmUge1xyXG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29sb3IpO1xyXG4gICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1jb2xvcik7XHJcbiAgfVxyXG4gIC5yYWRpbyBpbnB1dDpjaGVja2VkICsgc3BhbjphZnRlciB7XHJcbiAgICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBlYXNlLCBiYWNrZ3JvdW5kIDAuM3MgZWFzZSxcclxuICAgICAgLXdlYmtpdC10cmFuc2Zvcm0gMC42cyBjdWJpYy1iZXppZXIoMC4xNzUsIDAuODgsIDAuMzIsIDEuMik7XHJcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgZWFzZSwgYmFja2dyb3VuZCAwLjNzIGVhc2UsXHJcbiAgICAgIC13ZWJraXQtdHJhbnNmb3JtIDAuNnMgY3ViaWMtYmV6aWVyKDAuMTc1LCAwLjg4LCAwLjMyLCAxLjIpO1xyXG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjNzIGVhc2UsIGJhY2tncm91bmQgMC4zcyBlYXNlLFxyXG4gICAgICB0cmFuc2Zvcm0gMC42cyBjdWJpYy1iZXppZXIoMC4xNzUsIDAuODgsIDAuMzIsIDEuMik7XHJcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgZWFzZSwgYmFja2dyb3VuZCAwLjNzIGVhc2UsXHJcbiAgICAgIHRyYW5zZm9ybSAwLjZzIGN1YmljLWJlemllcigwLjE3NSwgMC44OCwgMC4zMiwgMS4yKSxcclxuICAgICAgLXdlYmtpdC10cmFuc2Zvcm0gMC42cyBjdWJpYy1iZXppZXIoMC4xNzUsIDAuODgsIDAuMzIsIDEuMik7XHJcbiAgfVxyXG4gIC5yYWRpbzpob3ZlciBpbnB1dDpub3QoOmNoZWNrZWQpICsgc3BhbjpiZWZvcmUge1xyXG4gICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXItaG92ZXIpO1xyXG4gIH1cclxuXHJcbiAgLnJhZGlvIGlucHV0ICsgc3BhbiB7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDIycHg7XHJcbiAgfVxyXG4gIC5yYWRpbyBpbnB1dCArIHNwYW46bm90KDplbXB0eSkge1xyXG4gICAgcGFkZGluZy1sZWZ0OiAzMHB4O1xyXG4gIH1cclxuICAucmFkaW8gaW5wdXQgKyBzcGFuOmJlZm9yZSB7XHJcbiAgICB3aWR0aDogMThweDtcclxuICB9XHJcbiAgLnJhZGlvIGlucHV0ICsgc3BhbjphZnRlciB7XHJcbiAgICBvcGFjaXR5OiAwO1xyXG4gIH1cclxuICAucmFkaW8gaW5wdXQ6Y2hlY2tlZCArIHNwYW46YWZ0ZXIge1xyXG4gICAgb3BhY2l0eTogMTtcclxuICB9XHJcblxyXG4gIC5yYWRpbyBpbnB1dCArIHNwYW46YmVmb3JlLFxyXG4gIC5yYWRpbyBpbnB1dCArIHNwYW46YWZ0ZXIge1xyXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gIH1cclxuICAucmFkaW8gaW5wdXQgKyBzcGFuOmFmdGVyIHtcclxuICAgIHdpZHRoOiAyMnB4O1xyXG4gICAgaGVpZ2h0OiAyMnB4O1xyXG4gICAgYmFja2dyb3VuZDogI2ZmZjtcclxuICAgIG9wYWNpdHk6IDA7XHJcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMC42KTtcclxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC42KTtcclxuICB9XHJcbiAgLnJhZGlvIGlucHV0OmNoZWNrZWQgKyBzcGFuOmFmdGVyIHtcclxuICAgIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMC40KTtcclxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC40KTtcclxuICB9ICovXHJcbiAgKjpiZWZvcmUsXHJcbiAgKjphZnRlciB7XHJcbiAgICBib3gtc2l6aW5nOiBpbmhlcml0O1xyXG4gIH1cclxuPC9zdHlsZT5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlCRSxJQUFJLGNBQUMsQ0FBQyxBQUNKLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLE1BQU0sQ0FBRSxJQUFJLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUMvQyxVQUFVLENBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDeEQsSUFBSSxDQUFFLENBQUMsQ0FDUCxXQUFXLENBQUUsSUFBSSxDQUNqQixLQUFLLENBQUUsSUFBSSxZQUFZLENBQUM7RUFDMUIsQ0FBQyxBQUNELE1BQU0sQUFBQyxZQUFZLEtBQUssQ0FBQyxBQUFDLENBQUMsQUFJM0IsQ0FBQyxBQUNELEtBQUssY0FBQyxDQUFDLEFBQ0wsT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBQ0QsS0FBSyxjQUFDLENBQUMsQUFDTCxNQUFNLENBQUUsT0FBTyxDQUNmLE9BQU8sQ0FBRSxJQUFJLENBQ2IsSUFBSSxDQUFFLENBQUMsQ0FDUCxVQUFVLENBQUUsTUFBTSxDQUNsQixNQUFNLENBQUUsSUFBSSxBQUNkLENBQUMsQUFDRCxtQkFBSyxLQUFLLFlBQVksQ0FBQyxBQUFDLENBQUMsQUFDdkIsV0FBVyxDQUFFLEtBQUssSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEFBQzdDLENBQUMsQUFDRCxLQUFLLENBQUMsS0FBSyxRQUFRLENBQUcsSUFBSSxjQUFDLENBQUMsQUFDMUIsT0FBTyxDQUFFLENBQUMsQ0FDVixVQUFVLENBQUUsSUFBSSxPQUFPLENBQUMsQ0FDeEIsWUFBWSxDQUFFLElBQUksT0FBTyxDQUFDLENBQzFCLEtBQUssQ0FBRSxJQUFJLEFBQ2IsQ0FBQyxBQUNELEtBQUssWUFBWSxDQUFDLEtBQUssQ0FBRyxJQUFJLGNBQUMsQ0FBQyxBQUM5QixhQUFhLENBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUM1QixDQUFDLEFBQ0QsS0FBSyxXQUFXLENBQUMsS0FBSyxDQUFHLElBQUksY0FBQyxDQUFDLEFBQzdCLGFBQWEsQ0FBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEFBQzVCLENBQUMsQUFzR0QsY0FBQyxPQUFPLENBQ1IsY0FBQyxNQUFNLEFBQUMsQ0FBQyxBQUNQLFVBQVUsQ0FBRSxPQUFPLEFBQ3JCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (10:0) { #each mealOptions as radio }
    function create_each_block$1(ctx) {
    	let label;
    	let input;
    	let input_name_value;
    	let input_value_value;
    	let t0;
    	let span;
    	let t1_value = /*radio*/ ctx[7].text + "";
    	let t1;
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", input_name_value = /*radio*/ ctx[7].name);
    			input.__value = input_value_value = /*radio*/ ctx[7].value;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-b5v77t");
    			/*$$binding_groups*/ ctx[6][0].push(input);
    			add_location(input, file$2, 11, 2, 201);
    			attr_dev(span, "class", "svelte-b5v77t");
    			add_location(span, file$2, 12, 2, 280);
    			attr_dev(label, "class", "radio svelte-b5v77t");
    			add_location(label, file$2, 10, 0, 176);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*group*/ ctx[0];
    			append_dev(label, t0);
    			append_dev(label, span);
    			append_dev(span, t1);
    			append_dev(label, t2);
    			if (remount) dispose();
    			dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[5]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mealOptions*/ 2 && input_name_value !== (input_name_value = /*radio*/ ctx[7].name)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*mealOptions*/ 2 && input_value_value !== (input_value_value = /*radio*/ ctx[7].value)) {
    				prop_dev(input, "__value", input_value_value);
    			}

    			input.value = input.__value;

    			if (dirty & /*group*/ 1) {
    				input.checked = input.__value === /*group*/ ctx[0];
    			}

    			if (dirty & /*mealOptions*/ 2 && t1_value !== (t1_value = /*radio*/ ctx[7].text + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[6][0].splice(/*$$binding_groups*/ ctx[6][0].indexOf(input), 1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:0) { #each mealOptions as radio }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let each_1_anchor;
    	let each_value = /*mealOptions*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mealOptions, group*/ 3) {
    				each_value = /*mealOptions*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { value } = $$props;
    	let { text } = $$props;
    	let { mealOptions = [] } = $$props;
    	let { group = [] } = $$props;
    	const writable_props = ["name", "value", "text", "mealOptions", "group"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Radio> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Radio", $$slots, []);
    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		group = this.__value;
    		$$invalidate(0, group);
    	}

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("text" in $$props) $$invalidate(4, text = $$props.text);
    		if ("mealOptions" in $$props) $$invalidate(1, mealOptions = $$props.mealOptions);
    		if ("group" in $$props) $$invalidate(0, group = $$props.group);
    	};

    	$$self.$capture_state = () => ({ name, value, text, mealOptions, group });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("text" in $$props) $$invalidate(4, text = $$props.text);
    		if ("mealOptions" in $$props) $$invalidate(1, mealOptions = $$props.mealOptions);
    		if ("group" in $$props) $$invalidate(0, group = $$props.group);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [group, mealOptions, name, value, text, input_change_handler, $$binding_groups];
    }

    class Radio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-b5v77t-style")) add_css$3();

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			name: 2,
    			value: 3,
    			text: 4,
    			mealOptions: 1,
    			group: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Radio",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[2] === undefined && !("name" in props)) {
    			console.warn("<Radio> was created without expected prop 'name'");
    		}

    		if (/*value*/ ctx[3] === undefined && !("value" in props)) {
    			console.warn("<Radio> was created without expected prop 'value'");
    		}

    		if (/*text*/ ctx[4] === undefined && !("text" in props)) {
    			console.warn("<Radio> was created without expected prop 'text'");
    		}
    	}

    	get name() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mealOptions() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mealOptions(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Ingredients.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1$1, console: console_1 } = globals;

    const file$3 = "src\\components\\Ingredients.svelte";

    function add_css$4() {
    	var style = element("style");
    	style.id = "svelte-1pm0dbh-style";
    	style.textContent = ".open-fav.svelte-1pm0dbh{position:absolute;top:5px;right:5px}.wrapper.svelte-1pm0dbh{max-width:380px;margin:0 auto}.chip-wrapper.svelte-1pm0dbh{max-height:105px;overflow:scroll}@media(min-width: 1281px){.chip-wrapper.svelte-1pm0dbh{max-height:none;min-height:unset;overflow:unset}}.radio-group.svelte-1pm0dbh{--color:var(--primary-1);--border-width:2px;display:-webkit-box;display:flex;font-size:14px;font-weight:600;margin-bottom:20px}.radio-group.searched.svelte-1pm0dbh{margin-top:20px}section.svelte-1pm0dbh{margin-bottom:20px;position:relative}section.svelte-1pm0dbh:after{content:\"\";height:30px;width:100%;position:absolute;bottom:-37px;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);z-index:9}@media(min-width: 1081px){section.svelte-1pm0dbh{padding-top:30vh;width:40%;height:100vh;border-right:1px solid var(--border)}}.btn.svelte-1pm0dbh{--color:var(--primary-3);--text:#fff;display:inline-block;text-align:center;vertical-align:middle;touch-action:manipulation;position:relative;white-space:nowrap;border:none;color:var(--text);padding:9px 24px;font-size:14px;line-height:22px;font-weight:600;background:var(--color);border-radius:6px;text-decoration:none;transition:all 0.3s ease}.desktop-only.svelte-1pm0dbh{display:none}@media only screen and (min-width: 1280px){.desktop-only.svelte-1pm0dbh{display:block;text-align:center}}.mobile-only.svelte-1pm0dbh{text-align:center}@media only screen and (min-width: 1280px){.mobile-only.svelte-1pm0dbh{display:none}}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5ncmVkaWVudHMuc3ZlbHRlIiwic291cmNlcyI6WyJJbmdyZWRpZW50cy5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cclxuICBpbXBvcnQgQ0lucHV0IGZyb20gXCIuLi9jb21wb25lbnRzL0NJbnB1dC5zdmVsdGVcIjtcclxuICBpbXBvcnQgQ2hpcCBmcm9tIFwiLi4vY29tcG9uZW50cy9DaGlwLnN2ZWx0ZVwiO1xyXG4gIGltcG9ydCBSYWRpbyBmcm9tIFwiLi4vY29tcG9uZW50cy9SYWRpby5zdmVsdGVcIjtcclxuICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIsIG9uRGVzdHJveSB9IGZyb20gXCJzdmVsdGVcIjtcclxuICBpbXBvcnQgeyB3cml0YWJsZSB9IGZyb20gXCJzdmVsdGUvc3RvcmVcIjtcclxuXHJcbiAgaW1wb3J0IHtcclxuICAgIGN1c3RvbUluZ3JpZGllbnRzLFxyXG4gICAgY3VzdG9tTWFpbkluZ3JpZGllbnRzLFxyXG4gICAgZmV0Y2hlZFJlY2VwaWVzLFxyXG4gIH0gZnJvbSBcIi4uL3N0b3JlXCI7XHJcblxyXG4gIGV4cG9ydCBsZXQgbG9hZGluZ1JlY2VwaWVzID0gZmFsc2U7XHJcbiAgZXhwb3J0IGxldCBzZWFyY2hlZFJlY2VwaWVzID0gZmFsc2U7XHJcbiAgbGV0IGdyb3VwID0gXCJcIjtcclxuICBsZXQgbWVhbE9wdGlvbnMgPSBbXHJcbiAgICB7XHJcbiAgICAgIHZhbHVlOiBcIjg2NTE1MDI4NFwiLFxyXG4gICAgICB0ZXh0OiBcIkh1dnVkcsOkdHRcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHZhbHVlOiBcIjEwODkzMTI4OTNcIixcclxuICAgICAgdGV4dDogXCJmw7ZycsOkdHRcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHZhbHVlOiBcIjMyNDc3NjA0NDZcIixcclxuICAgICAgdGV4dDogXCJmcnVrb3N0XCIsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB2YWx1ZTogXCI0Mjc4MDA4NDIwXCIsXHJcbiAgICAgIHRleHQ6IFwiZWZ0ZXJyw6R0dFwiLFxyXG4gICAgfSxcclxuICBdO1xyXG4gIGNvbnN0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XHJcbiAgY29uc3Qgb3BlbkZhdiA9ICgpID0+IGRpc3BhdGNoKFwib3BlbmZhdlwiKTtcclxuXHJcbiAgY29uc3QgZ2V0UmVjaXBlcyA9IGFzeW5jICgpID0+IHtcclxuICAgIGxvYWRpbmdSZWNlcGllcyA9IHRydWU7XHJcbiAgICBzZWFyY2hlZFJlY2VwaWVzID0gdHJ1ZTtcclxuICAgIGxldCBhZGRlZEluZ3JpZGllbnRzID0gJGN1c3RvbUluZ3JpZGllbnRzXHJcbiAgICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0uaW5ncmVkaWVudElkKVxyXG4gICAgICAuam9pbihcIixcIik7XHJcbiAgICBsZXQgbWFpbkluZ3JpZGllbnQgPSAkY3VzdG9tTWFpbkluZ3JpZGllbnRzLm1hcChcclxuICAgICAgKGl0ZW0pID0+IGl0ZW0uaW5ncmVkaWVudElkXHJcbiAgICApO1xyXG4gICAgdmFyIHByb3h5VXJsID0gcHJvY2Vzcy5lbnYuUFJPWFlfVVJMLFxyXG4gICAgICB1cmwgPSBgJHtwcm9jZXNzLmVudi5BUElfVVJMfSR7bWFpbkluZ3JpZGllbnR9LyR7YWRkZWRJbmdyaWRpZW50c30/Y2F0ZWdvcnlpZD0ke2dyb3VwfSZza2lwPTAmdGFrZT0yMGA7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2gocHJveHlVcmwgKyB1cmwsIHsgbW9kZTogXCJjb3JzXCIgfSk7XHJcbiAgICAgIGxldCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICBpZiAoT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgZmV0Y2hlZFJlY2lwZXMgPSBbXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmZXRjaGVkUmVjZXBpZXMuc2V0RmV0Y2hlZFJlY2VwaWVzKGRhdGEpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICBzZWFyY2hlZFJlY2VwaWVzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBsb2FkaW5nUmVjZXBpZXMgPSBmYWxzZTtcclxuICB9O1xyXG48L3NjcmlwdD5cclxuPHNlY3Rpb24+XHJcbiAgPGJ1dHRvbiBjbGFzcz1cIm9wZW4tZmF2XCIgb246Y2xpY2s9XCJ7b3BlbkZhdn1cIj5GYXZvcml0ZXI8L2J1dHRvbj5cclxuICA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPlxyXG4gICAgeyNpZiAhc2VhcmNoZWRSZWNlcGllc31cclxuICAgIDxoMiBjbGFzcz1cIm1vYmlsZS1vbmx5XCI+VmFkIHZpbGwgZHUgbGFnYT88L2gyPlxyXG4gICAgey9pZn1cclxuICAgIDxoMiBjbGFzcz1cImRlc2t0b3Atb25seVwiPlZhZCB2aWxsIGR1IGxhZ2E/PC9oMj5cclxuICAgIDxkaXZcclxuICAgICAgY2xhc3M9XCJyYWRpby1ncm91cCB7c2VhcmNoZWRSZWNlcGllcyA/ICdzZWFyY2hlZCcgOiAnJ31cIlxyXG4gICAgICBzdHlsZT1cIi0tY29sb3I6IHZhcigtLXByaW1hcnktNCk7XCJcclxuICAgID5cclxuICAgICAgPFJhZGlvIHsgbWVhbE9wdGlvbnMgfSBiaW5kOmdyb3VwPjwvUmFkaW8+XHJcbiAgICA8L2Rpdj5cclxuICAgIHsjaWYgZ3JvdXAgIT09IFwiXCIgJiYgJGN1c3RvbU1haW5JbmdyaWRpZW50cy5sZW5ndGggPCAxfVxyXG4gICAgPGgzPlbDpGxqIGh1dnVkaW5ncmVkaWVuczwvaDM+XHJcbiAgICA8Q0lucHV0IG1haW5JbmdyaWRpZW50cz48L0NJbnB1dD5cclxuICAgIHsvaWZ9IHsjaWYgZ3JvdXAgIT09IFwiXCIgJiYgJGN1c3RvbU1haW5JbmdyaWRpZW50cy5sZW5ndGggPiAwfVxyXG4gICAgPGgzPkzDpGdnIHRpbGwgZmxlciBpbmdyZWRpZW5zZXI8L2gzPlxyXG4gICAgPENJbnB1dD48L0NJbnB1dD5cclxuICAgIDxidXR0b25cclxuICAgICAgY2xhc3M9XCJidG5cIlxyXG4gICAgICBvbjpjbGljaz1cIntnZXRSZWNpcGVzfVwiXHJcbiAgICAgIHN0eWxlPVwiXHJcbiAgICAgICAgYWxpZ24tc2VsZjogZmxleC1zdGFydDtcclxuICAgICAgICBtYXJnaW46IDAgYXV0bztcclxuICAgICAgICBkaXNwbGF5OiBibG9jaztcclxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxNXB4O1xyXG4gICAgICBcIlxyXG4gICAgPlxyXG4gICAgICBIaXR0YSByZWNlcHRcclxuICAgIDwvYnV0dG9uPlxyXG4gICAgPGRpdiBjbGFzcz1cImNoaXAtd3JhcHBlclwiPlxyXG4gICAgICB7I2VhY2ggJGN1c3RvbU1haW5JbmdyaWRpZW50cyBhcyB7bmFtZSxpZH0gKGlkKX1cclxuICAgICAgPENoaXAge25hbWV9IHtpZH0gY29sb3I9XCIjZjQ0MzM2XCI+PC9DaGlwPlxyXG4gICAgICB7L2VhY2h9IHsjZWFjaCAkY3VzdG9tSW5ncmlkaWVudHMgYXMge25hbWUsaWR9IChpZCl9XHJcbiAgICAgIDxDaGlwIHtuYW1lfSB7aWR9IGNvbG9yPVwiIzIzYzRmOFwiPjwvQ2hpcD5cclxuICAgICAgey9lYWNofVxyXG4gICAgPC9kaXY+XHJcbiAgICB7L2lmfVxyXG4gIDwvZGl2PlxyXG48L3NlY3Rpb24+XHJcblxyXG48c3R5bGU+XHJcbiAgLm9wZW4tZmF2IHtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIHRvcDogNXB4O1xyXG4gICAgcmlnaHQ6IDVweDtcclxuICB9XHJcbiAgLndyYXBwZXIge1xyXG4gICAgbWF4LXdpZHRoOiAzODBweDtcclxuICAgIG1hcmdpbjogMCBhdXRvO1xyXG4gIH1cclxuXHJcbiAgLmNoaXAtd3JhcHBlciB7XHJcbiAgICBtYXgtaGVpZ2h0OiAxMDVweDtcclxuICAgIG92ZXJmbG93OiBzY3JvbGw7XHJcbiAgfVxyXG4gIEBtZWRpYSAobWluLXdpZHRoOiAxMjgxcHgpIHtcclxuICAgIC5jaGlwLXdyYXBwZXIge1xyXG4gICAgICBtYXgtaGVpZ2h0OiBub25lO1xyXG4gICAgICBtaW4taGVpZ2h0OiB1bnNldDtcclxuICAgICAgb3ZlcmZsb3c6IHVuc2V0O1xyXG4gICAgfVxyXG4gIH1cclxuICAucmFkaW8tZ3JvdXAge1xyXG4gICAgLS1jb2xvcjogdmFyKC0tcHJpbWFyeS0xKTtcclxuICAgIC0tYm9yZGVyLXdpZHRoOiAycHg7XHJcbiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmb250LXNpemU6IDE0cHg7XHJcbiAgICBmb250LXdlaWdodDogNjAwO1xyXG4gICAgbWFyZ2luLWJvdHRvbTogMjBweDtcclxuICB9XHJcbiAgLnJhZGlvLWdyb3VwLnNlYXJjaGVkIHtcclxuICAgIG1hcmdpbi10b3A6IDIwcHg7XHJcbiAgfVxyXG4gIHNlY3Rpb24ge1xyXG4gICAgbWFyZ2luLWJvdHRvbTogMjBweDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICB9XHJcbiAgc2VjdGlvbjphZnRlciB7XHJcbiAgICBjb250ZW50OiBcIlwiO1xyXG4gICAgaGVpZ2h0OiAzMHB4O1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICBib3R0b206IC0zN3B4O1xyXG4gICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDJweCk7XHJcbiAgICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cigycHgpO1xyXG4gICAgei1pbmRleDogOTtcclxuICB9XHJcbiAgQG1lZGlhIChtaW4td2lkdGg6IDEwODFweCkge1xyXG4gICAgc2VjdGlvbiB7XHJcbiAgICAgIHBhZGRpbmctdG9wOiAzMHZoO1xyXG4gICAgICB3aWR0aDogNDAlO1xyXG4gICAgICBoZWlnaHQ6IDEwMHZoO1xyXG4gICAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO1xyXG4gICAgfVxyXG4gIH1cclxuICAuYnRuIHtcclxuICAgIC0tY29sb3I6IHZhcigtLXByaW1hcnktMyk7XHJcbiAgICAtLXRleHQ6ICNmZmY7XHJcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xyXG4gICAgdG91Y2gtYWN0aW9uOiBtYW5pcHVsYXRpb247XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xyXG4gICAgYm9yZGVyOiBub25lO1xyXG4gICAgY29sb3I6IHZhcigtLXRleHQpO1xyXG4gICAgcGFkZGluZzogOXB4IDI0cHg7XHJcbiAgICBmb250LXNpemU6IDE0cHg7XHJcbiAgICBsaW5lLWhlaWdodDogMjJweDtcclxuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XHJcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvcik7XHJcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XHJcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XHJcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xyXG4gIH1cclxuXHJcbiAgLmRlc2t0b3Atb25seSB7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gIH1cclxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDEyODBweCkge1xyXG4gICAgLmRlc2t0b3Atb25seSB7XHJcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC5tb2JpbGUtb25seSB7XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgfVxyXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogMTI4MHB4KSB7XHJcbiAgICAubW9iaWxlLW9ubHkge1xyXG4gICAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgfVxyXG4gIH1cclxuPC9zdHlsZT5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTJHRSxTQUFTLGVBQUMsQ0FBQyxBQUNULFFBQVEsQ0FBRSxRQUFRLENBQ2xCLEdBQUcsQ0FBRSxHQUFHLENBQ1IsS0FBSyxDQUFFLEdBQUcsQUFDWixDQUFDLEFBQ0QsUUFBUSxlQUFDLENBQUMsQUFDUixTQUFTLENBQUUsS0FBSyxDQUNoQixNQUFNLENBQUUsQ0FBQyxDQUFDLElBQUksQUFDaEIsQ0FBQyxBQUVELGFBQWEsZUFBQyxDQUFDLEFBQ2IsVUFBVSxDQUFFLEtBQUssQ0FDakIsUUFBUSxDQUFFLE1BQU0sQUFDbEIsQ0FBQyxBQUNELE1BQU0sQUFBQyxZQUFZLE1BQU0sQ0FBQyxBQUFDLENBQUMsQUFDMUIsYUFBYSxlQUFDLENBQUMsQUFDYixVQUFVLENBQUUsSUFBSSxDQUNoQixVQUFVLENBQUUsS0FBSyxDQUNqQixRQUFRLENBQUUsS0FBSyxBQUNqQixDQUFDLEFBQ0gsQ0FBQyxBQUNELFlBQVksZUFBQyxDQUFDLEFBQ1osT0FBTyxDQUFFLGdCQUFnQixDQUN6QixjQUFjLENBQUUsR0FBRyxDQUNuQixPQUFPLENBQUUsV0FBVyxDQUNwQixPQUFPLENBQUUsSUFBSSxDQUNiLFNBQVMsQ0FBRSxJQUFJLENBQ2YsV0FBVyxDQUFFLEdBQUcsQ0FDaEIsYUFBYSxDQUFFLElBQUksQUFDckIsQ0FBQyxBQUNELFlBQVksU0FBUyxlQUFDLENBQUMsQUFDckIsVUFBVSxDQUFFLElBQUksQUFDbEIsQ0FBQyxBQUNELE9BQU8sZUFBQyxDQUFDLEFBQ1AsYUFBYSxDQUFFLElBQUksQ0FDbkIsUUFBUSxDQUFFLFFBQVEsQUFDcEIsQ0FBQyxBQUNELHNCQUFPLE1BQU0sQUFBQyxDQUFDLEFBQ2IsT0FBTyxDQUFFLEVBQUUsQ0FDWCxNQUFNLENBQUUsSUFBSSxDQUNaLEtBQUssQ0FBRSxJQUFJLENBQ1gsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsTUFBTSxDQUFFLEtBQUssQ0FDYixlQUFlLENBQUUsS0FBSyxHQUFHLENBQUMsQ0FDMUIsdUJBQXVCLENBQUUsS0FBSyxHQUFHLENBQUMsQ0FDbEMsT0FBTyxDQUFFLENBQUMsQUFDWixDQUFDLEFBQ0QsTUFBTSxBQUFDLFlBQVksTUFBTSxDQUFDLEFBQUMsQ0FBQyxBQUMxQixPQUFPLGVBQUMsQ0FBQyxBQUNQLFdBQVcsQ0FBRSxJQUFJLENBQ2pCLEtBQUssQ0FBRSxHQUFHLENBQ1YsTUFBTSxDQUFFLEtBQUssQ0FDYixZQUFZLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxBQUN2QyxDQUFDLEFBQ0gsQ0FBQyxBQUNELElBQUksZUFBQyxDQUFDLEFBQ0osT0FBTyxDQUFFLGdCQUFnQixDQUN6QixNQUFNLENBQUUsSUFBSSxDQUNaLE9BQU8sQ0FBRSxZQUFZLENBQ3JCLFVBQVUsQ0FBRSxNQUFNLENBQ2xCLGNBQWMsQ0FBRSxNQUFNLENBQ3RCLFlBQVksQ0FBRSxZQUFZLENBQzFCLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLFdBQVcsQ0FBRSxNQUFNLENBQ25CLE1BQU0sQ0FBRSxJQUFJLENBQ1osS0FBSyxDQUFFLElBQUksTUFBTSxDQUFDLENBQ2xCLE9BQU8sQ0FBRSxHQUFHLENBQUMsSUFBSSxDQUNqQixTQUFTLENBQUUsSUFBSSxDQUNmLFdBQVcsQ0FBRSxJQUFJLENBQ2pCLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFVBQVUsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxDQUN4QixhQUFhLENBQUUsR0FBRyxDQUNsQixlQUFlLENBQUUsSUFBSSxDQUNyQixVQUFVLENBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEFBQzNCLENBQUMsQUFFRCxhQUFhLGVBQUMsQ0FBQyxBQUNiLE9BQU8sQ0FBRSxJQUFJLEFBQ2YsQ0FBQyxBQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxNQUFNLENBQUMsQUFBQyxDQUFDLEFBQzFDLGFBQWEsZUFBQyxDQUFDLEFBQ2IsT0FBTyxDQUFFLEtBQUssQ0FDZCxVQUFVLENBQUUsTUFBTSxBQUNwQixDQUFDLEFBQ0gsQ0FBQyxBQUNELFlBQVksZUFBQyxDQUFDLEFBQ1osVUFBVSxDQUFFLE1BQU0sQUFDcEIsQ0FBQyxBQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxNQUFNLENBQUMsQUFBQyxDQUFDLEFBQzFDLFlBQVksZUFBQyxDQUFDLEFBQ1osT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBQ0gsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i].name;
    	child_ctx[11] = list[i].id;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i].name;
    	child_ctx[11] = list[i].id;
    	return child_ctx;
    }

    // (68:4) {#if !searchedRecepies}
    function create_if_block_2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Vad vill du laga?";
    			attr_dev(h2, "class", "mobile-only svelte-1pm0dbh");
    			add_location(h2, file$3, 68, 4, 1865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(68:4) {#if !searchedRecepies}",
    		ctx
    	});

    	return block;
    }

    // (78:4) {#if group !== "" && $customMainIngridients.length < 1}
    function create_if_block_1(ctx) {
    	let h3;
    	let t1;
    	let current;

    	const cinput = new CInput({
    			props: { mainIngridients: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Välj huvudingrediens";
    			t1 = space();
    			create_component(cinput.$$.fragment);
    			add_location(h3, file$3, 78, 4, 2227);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(cinput, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_component(cinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(78:4) {#if group !== \\\"\\\" && $customMainIngridients.length < 1}",
    		ctx
    	});

    	return block;
    }

    // (81:10) {#if group !== "" && $customMainIngridients.length > 0}
    function create_if_block$1(ctx) {
    	let h3;
    	let t1;
    	let t2;
    	let button;
    	let t4;
    	let div;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t5;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let dispose;
    	const cinput = new CInput({ $$inline: true });
    	let each_value_1 = /*$customMainIngridients*/ ctx[3];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*id*/ ctx[11];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*$customIngridients*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*id*/ ctx[11];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Lägg till fler ingredienser";
    			t1 = space();
    			create_component(cinput.$$.fragment);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Hitta recept";
    			t4 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$3, 81, 4, 2368);
    			attr_dev(button, "class", "btn svelte-1pm0dbh");
    			set_style(button, "align-self", "flex-start");
    			set_style(button, "margin", "0 auto");
    			set_style(button, "display", "block");
    			set_style(button, "margin-bottom", "15px");
    			add_location(button, file$3, 83, 4, 2433);
    			attr_dev(div, "class", "chip-wrapper svelte-1pm0dbh");
    			add_location(div, file$3, 95, 4, 2675);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(cinput, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div, null);
    			}

    			append_dev(div, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*getRecipes*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$customMainIngridients*/ 8) {
    				const each_value_1 = /*$customMainIngridients*/ ctx[3];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div, outro_and_destroy_block, create_each_block_1, t5, get_each_context_1);
    				check_outros();
    			}

    			if (dirty & /*$customIngridients*/ 4) {
    				const each_value = /*$customIngridients*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cinput.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cinput.$$.fragment, local);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_component(cinput, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(81:10) {#if group !== \\\"\\\" && $customMainIngridients.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (97:6) {#each $customMainIngridients as {name,id}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let current;

    	const chip = new Chip({
    			props: {
    				name: /*name*/ ctx[10],
    				id: /*id*/ ctx[11],
    				color: "#f44336"
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(chip.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(chip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chip_changes = {};
    			if (dirty & /*$customMainIngridients*/ 8) chip_changes.name = /*name*/ ctx[10];
    			if (dirty & /*$customMainIngridients*/ 8) chip_changes.id = /*id*/ ctx[11];
    			chip.$set(chip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(chip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(97:6) {#each $customMainIngridients as {name,id}",
    		ctx
    	});

    	return block;
    }

    // (99:14) {#each $customIngridients as {name,id}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let current;

    	const chip = new Chip({
    			props: {
    				name: /*name*/ ctx[10],
    				id: /*id*/ ctx[11],
    				color: "#23c4f8"
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(chip.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(chip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chip_changes = {};
    			if (dirty & /*$customIngridients*/ 4) chip_changes.name = /*name*/ ctx[10];
    			if (dirty & /*$customIngridients*/ 4) chip_changes.id = /*id*/ ctx[11];
    			chip.$set(chip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(chip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(99:14) {#each $customIngridients as {name,id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let button;
    	let t1;
    	let div1;
    	let t2;
    	let h2;
    	let t4;
    	let div0;
    	let updating_group;
    	let div0_class_value;
    	let t5;
    	let t6;
    	let current;
    	let dispose;
    	let if_block0 = !/*searchedRecepies*/ ctx[0] && create_if_block_2(ctx);

    	function radio_group_binding(value) {
    		/*radio_group_binding*/ ctx[9].call(null, value);
    	}

    	let radio_props = { mealOptions: /*mealOptions*/ ctx[4] };

    	if (/*group*/ ctx[1] !== void 0) {
    		radio_props.group = /*group*/ ctx[1];
    	}

    	const radio = new Radio({ props: radio_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio, "group", radio_group_binding));
    	let if_block1 = /*group*/ ctx[1] !== "" && /*$customMainIngridients*/ ctx[3].length < 1 && create_if_block_1(ctx);
    	let if_block2 = /*group*/ ctx[1] !== "" && /*$customMainIngridients*/ ctx[3].length > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			button = element("button");
    			button.textContent = "Favoriter";
    			t1 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "Vad vill du laga?";
    			t4 = space();
    			div0 = element("div");
    			create_component(radio.$$.fragment);
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(button, "class", "open-fav svelte-1pm0dbh");
    			add_location(button, file$3, 65, 2, 1741);
    			attr_dev(h2, "class", "desktop-only svelte-1pm0dbh");
    			add_location(h2, file$3, 70, 4, 1928);
    			attr_dev(div0, "class", div0_class_value = "radio-group " + (/*searchedRecepies*/ ctx[0] ? "searched" : "") + " svelte-1pm0dbh");
    			set_style(div0, "--color", "var(--primary-4)");
    			add_location(div0, file$3, 71, 4, 1981);
    			attr_dev(div1, "class", "wrapper svelte-1pm0dbh");
    			add_location(div1, file$3, 66, 2, 1809);
    			attr_dev(section, "class", "svelte-1pm0dbh");
    			add_location(section, file$3, 64, 0, 1728);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, section, anchor);
    			append_dev(section, button);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, h2);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			mount_component(radio, div0, null);
    			append_dev(div1, t5);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t6);
    			if (if_block2) if_block2.m(div1, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*openFav*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*searchedRecepies*/ ctx[0]) {
    				if (!if_block0) {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const radio_changes = {};

    			if (!updating_group && dirty & /*group*/ 2) {
    				updating_group = true;
    				radio_changes.group = /*group*/ ctx[1];
    				add_flush_callback(() => updating_group = false);
    			}

    			radio.$set(radio_changes);

    			if (!current || dirty & /*searchedRecepies*/ 1 && div0_class_value !== (div0_class_value = "radio-group " + (/*searchedRecepies*/ ctx[0] ? "searched" : "") + " svelte-1pm0dbh")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (/*group*/ ctx[1] !== "" && /*$customMainIngridients*/ ctx[3].length < 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t6);
    				} else {
    					transition_in(if_block1, 1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*group*/ ctx[1] !== "" && /*$customMainIngridients*/ ctx[3].length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			destroy_component(radio);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $customIngridients;
    	let $customMainIngridients;
    	validate_store(customIngridients, "customIngridients");
    	component_subscribe($$self, customIngridients, $$value => $$invalidate(2, $customIngridients = $$value));
    	validate_store(customMainIngridients, "customMainIngridients");
    	component_subscribe($$self, customMainIngridients, $$value => $$invalidate(3, $customMainIngridients = $$value));
    	let { loadingRecepies = false } = $$props;
    	let { searchedRecepies = false } = $$props;
    	let group = "";

    	let mealOptions = [
    		{ value: "865150284", text: "Huvudrätt" },
    		{ value: "1089312893", text: "förrätt" },
    		{ value: "3247760446", text: "frukost" },
    		{ value: "4278008420", text: "efterrätt" }
    	];

    	const dispatch = createEventDispatcher();
    	const openFav = () => dispatch("openfav");

    	const getRecipes = async () => {
    		$$invalidate(7, loadingRecepies = true);
    		$$invalidate(0, searchedRecepies = true);
    		let addedIngridients = $customIngridients.map(item => item.ingredientId).join(",");
    		let mainIngridient = $customMainIngridients.map(item => item.ingredientId);

    		var proxyUrl = {"env":{"isProd":false,"API_URL":"https://www.arla.se/webappsfoodclub/demo/foodclubrecipes/byingredients/","PROXY_URL":"https://cors-anywhere.herokuapp.com/"}}.env.PROXY_URL,
    			url = `${{"env":{"isProd":false,"API_URL":"https://www.arla.se/webappsfoodclub/demo/foodclubrecipes/byingredients/","PROXY_URL":"https://cors-anywhere.herokuapp.com/"}}.env.API_URL}${mainIngridient}/${addedIngridients}?categoryid=${group}&skip=0&take=20`;

    		try {
    			let response = await fetch(proxyUrl + url, { mode: "cors" });
    			let data = await response.json();

    			if (Object.keys(data).length === 0) {
    				fetchedRecipes = [];
    			} else {
    				fetchedRecepies.setFetchedRecepies(data);
    			}
    		} catch(e) {
    			console.log(e);
    			$$invalidate(0, searchedRecepies = false);
    		}

    		$$invalidate(7, loadingRecepies = false);
    	};

    	const writable_props = ["loadingRecepies", "searchedRecepies"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Ingredients> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Ingredients", $$slots, []);

    	function radio_group_binding(value) {
    		group = value;
    		$$invalidate(1, group);
    	}

    	$$self.$set = $$props => {
    		if ("loadingRecepies" in $$props) $$invalidate(7, loadingRecepies = $$props.loadingRecepies);
    		if ("searchedRecepies" in $$props) $$invalidate(0, searchedRecepies = $$props.searchedRecepies);
    	};

    	$$self.$capture_state = () => ({
    		CInput,
    		Chip,
    		Radio,
    		createEventDispatcher,
    		onDestroy,
    		writable,
    		customIngridients,
    		customMainIngridients,
    		fetchedRecepies,
    		loadingRecepies,
    		searchedRecepies,
    		group,
    		mealOptions,
    		dispatch,
    		openFav,
    		getRecipes,
    		$customIngridients,
    		$customMainIngridients
    	});

    	$$self.$inject_state = $$props => {
    		if ("loadingRecepies" in $$props) $$invalidate(7, loadingRecepies = $$props.loadingRecepies);
    		if ("searchedRecepies" in $$props) $$invalidate(0, searchedRecepies = $$props.searchedRecepies);
    		if ("group" in $$props) $$invalidate(1, group = $$props.group);
    		if ("mealOptions" in $$props) $$invalidate(4, mealOptions = $$props.mealOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		searchedRecepies,
    		group,
    		$customIngridients,
    		$customMainIngridients,
    		mealOptions,
    		openFav,
    		getRecipes,
    		loadingRecepies,
    		dispatch,
    		radio_group_binding
    	];
    }

    class Ingredients extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1pm0dbh-style")) add_css$4();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { loadingRecepies: 7, searchedRecepies: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ingredients",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get loadingRecepies() {
    		throw new Error("<Ingredients>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadingRecepies(value) {
    		throw new Error("<Ingredients>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchedRecepies() {
    		throw new Error("<Ingredients>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchedRecepies(value) {
    		throw new Error("<Ingredients>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Spinner.svelte generated by Svelte v3.20.1 */

    const file$4 = "src\\components\\Spinner.svelte";

    function add_css$5() {
    	var style = element("style");
    	style.id = "svelte-2746il-style";
    	style.textContent = ".spinner.svelte-2746il.svelte-2746il{height:60px;width:60px;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-align-items:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;margin:0 auto}.spinner.svelte-2746il>div.svelte-2746il{height:15px;width:15px;background-color:var(--primary-1);margin:1px;display:inline-block;border-radius:100%}.spinner.svelte-2746il>div.svelte-2746il:first-child{animation:0.6s ease-in-out 0.07s infinite normal both running svelte-2746il-jump}.spinner.svelte-2746il>div.svelte-2746il:nth-child(2){animation:0.6s ease-in-out 0.14s infinite normal both running svelte-2746il-jump}.spinner.svelte-2746il>div.svelte-2746il:last-child{animation:0.6s ease-in-out 0.21s infinite normal both running svelte-2746il-jump}@keyframes svelte-2746il-jump{33%{-webkit-transform:translateY(10px);-ms-transform:translateY(10px);transform:translateY(10px)}66%{-webkit-transform:translateY(-10px);-ms-transform:translateY(-10px);transform:translateY(-10px)}100%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Bpbm5lci5zdmVsdGUiLCJzb3VyY2VzIjpbIlNwaW5uZXIuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxkaXYgY2xhc3M9XCJzcGlubmVyXCI+XHJcbiAgPGRpdj48L2Rpdj5cclxuICA8ZGl2PjwvZGl2PlxyXG4gIDxkaXY+PC9kaXY+XHJcbjwvZGl2PlxyXG5cclxuPHN0eWxlPlxyXG4gIC5zcGlubmVyIHtcclxuICAgIGhlaWdodDogNjBweDtcclxuICAgIHdpZHRoOiA2MHB4O1xyXG4gICAgZGlzcGxheTogLXdlYmtpdC1ib3g7XHJcbiAgICBkaXNwbGF5OiAtd2Via2l0LWZsZXg7XHJcbiAgICBkaXNwbGF5OiAtbXMtZmxleGJveDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICAtd2Via2l0LWFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICAtd2Via2l0LWJveC1hbGlnbjogY2VudGVyO1xyXG4gICAgLW1zLWZsZXgtYWxpZ246IGNlbnRlcjtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICAtd2Via2l0LWJveC1wYWNrOiBjZW50ZXI7XHJcbiAgICAtd2Via2l0LWp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gICAgLW1zLWZsZXgtcGFjazogY2VudGVyO1xyXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgICBtYXJnaW46IDAgYXV0bztcclxuICB9XHJcbiAgLnNwaW5uZXIgPiBkaXYge1xyXG4gICAgaGVpZ2h0OiAxNXB4O1xyXG4gICAgd2lkdGg6IDE1cHg7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wcmltYXJ5LTEpO1xyXG4gICAgbWFyZ2luOiAxcHg7XHJcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxMDAlO1xyXG4gIH1cclxuICAuc3Bpbm5lciA+IGRpdjpmaXJzdC1jaGlsZCB7XHJcbiAgICBhbmltYXRpb246IDAuNnMgZWFzZS1pbi1vdXQgMC4wN3MgaW5maW5pdGUgbm9ybWFsIGJvdGggcnVubmluZyBqdW1wO1xyXG4gIH1cclxuICAuc3Bpbm5lciA+IGRpdjpudGgtY2hpbGQoMikge1xyXG4gICAgYW5pbWF0aW9uOiAwLjZzIGVhc2UtaW4tb3V0IDAuMTRzIGluZmluaXRlIG5vcm1hbCBib3RoIHJ1bm5pbmcganVtcDtcclxuICB9XHJcbiAgLnNwaW5uZXIgPiBkaXY6bGFzdC1jaGlsZCB7XHJcbiAgICBhbmltYXRpb246IDAuNnMgZWFzZS1pbi1vdXQgMC4yMXMgaW5maW5pdGUgbm9ybWFsIGJvdGggcnVubmluZyBqdW1wO1xyXG4gIH1cclxuICBAa2V5ZnJhbWVzIGp1bXAge1xyXG4gICAgMzMlIHtcclxuICAgICAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTBweCk7XHJcbiAgICAgIC1tcy10cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTBweCk7XHJcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxMHB4KTtcclxuICAgIH1cclxuICAgIDY2JSB7XHJcbiAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xMHB4KTtcclxuICAgICAgLW1zLXRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMTBweCk7XHJcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMTBweCk7XHJcbiAgICB9XHJcbiAgICAxMDAlIHtcclxuICAgICAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XHJcbiAgICAgIC1tcy10cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XHJcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcclxuICAgIH1cclxuICB9XHJcbjwvc3R5bGU+XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPRSxRQUFRLDRCQUFDLENBQUMsQUFDUixNQUFNLENBQUUsSUFBSSxDQUNaLEtBQUssQ0FBRSxJQUFJLENBQ1gsT0FBTyxDQUFFLFdBQVcsQ0FDcEIsT0FBTyxDQUFFLFlBQVksQ0FDckIsT0FBTyxDQUFFLFdBQVcsQ0FDcEIsT0FBTyxDQUFFLElBQUksQ0FDYixtQkFBbUIsQ0FBRSxNQUFNLENBQzNCLGlCQUFpQixDQUFFLE1BQU0sQ0FDekIsY0FBYyxDQUFFLE1BQU0sQ0FDdEIsV0FBVyxDQUFFLE1BQU0sQ0FDbkIsZ0JBQWdCLENBQUUsTUFBTSxDQUN4Qix1QkFBdUIsQ0FBRSxNQUFNLENBQy9CLGFBQWEsQ0FBRSxNQUFNLENBQ3JCLGVBQWUsQ0FBRSxNQUFNLENBQ3ZCLE1BQU0sQ0FBRSxDQUFDLENBQUMsSUFBSSxBQUNoQixDQUFDLEFBQ0Qsc0JBQVEsQ0FBRyxHQUFHLGNBQUMsQ0FBQyxBQUNkLE1BQU0sQ0FBRSxJQUFJLENBQ1osS0FBSyxDQUFFLElBQUksQ0FDWCxnQkFBZ0IsQ0FBRSxJQUFJLFdBQVcsQ0FBQyxDQUNsQyxNQUFNLENBQUUsR0FBRyxDQUNYLE9BQU8sQ0FBRSxZQUFZLENBQ3JCLGFBQWEsQ0FBRSxJQUFJLEFBQ3JCLENBQUMsQUFDRCxzQkFBUSxDQUFHLGlCQUFHLFlBQVksQUFBQyxDQUFDLEFBQzFCLFNBQVMsQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQ2pFLENBQUMsQUFDRCxzQkFBUSxDQUFHLGlCQUFHLFdBQVcsQ0FBQyxDQUFDLEFBQUMsQ0FBQyxBQUMzQixTQUFTLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUNqRSxDQUFDLEFBQ0Qsc0JBQVEsQ0FBRyxpQkFBRyxXQUFXLEFBQUMsQ0FBQyxBQUN6QixTQUFTLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUNqRSxDQUFDLEFBQ0QsV0FBVyxrQkFBSyxDQUFDLEFBQ2YsR0FBRyxBQUFDLENBQUMsQUFDSCxpQkFBaUIsQ0FBRSxXQUFXLElBQUksQ0FBQyxDQUNuQyxhQUFhLENBQUUsV0FBVyxJQUFJLENBQUMsQ0FDL0IsU0FBUyxDQUFFLFdBQVcsSUFBSSxDQUFDLEFBQzdCLENBQUMsQUFDRCxHQUFHLEFBQUMsQ0FBQyxBQUNILGlCQUFpQixDQUFFLFdBQVcsS0FBSyxDQUFDLENBQ3BDLGFBQWEsQ0FBRSxXQUFXLEtBQUssQ0FBQyxDQUNoQyxTQUFTLENBQUUsV0FBVyxLQUFLLENBQUMsQUFDOUIsQ0FBQyxBQUNELElBQUksQUFBQyxDQUFDLEFBQ0osaUJBQWlCLENBQUUsV0FBVyxDQUFDLENBQUMsQ0FDaEMsYUFBYSxDQUFFLFdBQVcsQ0FBQyxDQUFDLENBQzVCLFNBQVMsQ0FBRSxXQUFXLENBQUMsQ0FBQyxBQUMxQixDQUFDLEFBQ0gsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "svelte-2746il");
    			add_location(div0, file$4, 1, 2, 25);
    			attr_dev(div1, "class", "svelte-2746il");
    			add_location(div1, file$4, 2, 2, 40);
    			attr_dev(div2, "class", "svelte-2746il");
    			add_location(div2, file$4, 3, 2, 55);
    			attr_dev(div3, "class", "spinner svelte-2746il");
    			add_location(div3, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", $$slots, []);
    	return [];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-2746il-style")) add_css$5();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Modal.svelte generated by Svelte v3.20.1 */

    const { document: document_1, window: window_1 } = globals;
    const file$5 = "src\\components\\Modal.svelte";

    function add_css$6() {
    	var style = element("style");
    	style.id = "svelte-y7oj57-style";
    	style.textContent = ".notch.svelte-y7oj57.svelte-y7oj57{height:34px;background-color:var(--notch);width:calc(100vw - 165px);margin:0 auto;border-bottom-left-radius:2em;border-bottom-right-radius:2em;position:relative;z-index:10;display:none}.notch.svelte-y7oj57.svelte-y7oj57:before{content:\"\";width:7px;height:7px;position:absolute;background-color:var(--notch);left:-2px;top:-6px;border-radius:6px}.notch.svelte-y7oj57.svelte-y7oj57:after{content:\"\";width:7px;height:7px;position:absolute;background-color:var(--notch);right:-2px;top:-6px;border-radius:6px}@media(min-width: 768px){.notch.svelte-y7oj57.svelte-y7oj57{display:none}}.modal-background.svelte-y7oj57.svelte-y7oj57{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.3);z-index:99}.modal.svelte-y7oj57.svelte-y7oj57{display:flex;flex-direction:column;position:absolute;left:8px;top:8px;width:calc(100vw - 4em);max-width:32em;overflow:hidden;-webkit-overflow-scrolling:touch;max-height:calc(100vh - 42px);height:calc(100vh - 180px);padding:24px;border-radius:0.2em;background:white;z-index:100;padding-top:0}.favorite-modal.svelte-y7oj57.svelte-y7oj57{min-height:500px}.modal-inner.svelte-y7oj57.svelte-y7oj57{overflow:scroll;width:100%;margin-bottom:24px;width:calc(100vw - 4em);height:100%;margin-top:0px}@media(min-width: 768px){.modal-inner.svelte-y7oj57.svelte-y7oj57{max-width:32em;margin-top:0}}.modal-inner.svelte-y7oj57.svelte-y7oj57::-webkit-scrollbar{-webkit-appearance:none;width:0;height:0}.modal.standalone.svelte-y7oj57.svelte-y7oj57{--safe-area-inset-top:env(safe-area-inset-top);height:calc(100% + var(--safe-area-inset-top));border-radius:2em}.modal.standalone.svelte-y7oj57 .notch.svelte-y7oj57{display:block}.modal.standalone.svelte-y7oj57 .modal-inner.svelte-y7oj57{margin-top:-31px}@media(min-width: 768px){.modal.svelte-y7oj57.svelte-y7oj57{left:50%;top:47%;transform:translate(-50%, -50%);height:auto;max-height:calc(100vh - 9em)}}button.svelte-y7oj57.svelte-y7oj57{align-self:flex-start;margin-top:auto;--color:var(--primary-2);display:block;--text:#fff;text-align:center;vertical-align:middle;touch-action:manipulation;position:relative;white-space:nowrap;border:none;color:var(--text);padding:9px 24px;font-size:14px;line-height:22px;font-weight:600;background:var(--color);border-radius:6px;text-decoration:none;-webkit-transition:all 0.3s ease;transition:all 0.3s ease}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kYWwuc3ZlbHRlIiwic291cmNlcyI6WyJNb2RhbC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cclxuICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIsIG9uRGVzdHJveSB9IGZyb20gXCJzdmVsdGVcIjtcclxuICBjb25zdCBpc0luV2ViQXBwaU9TID0gd2luZG93Lm5hdmlnYXRvci5zdGFuZGFsb25lID09IHRydWU7XHJcblxyXG4gIGNvbnN0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XHJcbiAgY29uc3QgY2xvc2UgPSAoKSA9PiBkaXNwYXRjaChcImNsb3NlXCIpO1xyXG4gIGNvbnN0IGFkZFRvRmF2b3JpdGVzID0gKCkgPT4gZGlzcGF0Y2goXCJhZGRUb0Zhdm9yaXRlc1wiKTtcclxuICBsZXQgbW9kYWw7XHJcbiAgZXhwb3J0IGxldCBmYXZvcml0ZU1vZGFsID0gZmFsc2U7XHJcbiAgY29uc3QgaGFuZGxlX2tleWRvd24gPSAoZSkgPT4ge1xyXG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XHJcbiAgICAgIGNsb3NlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChlLmtleSA9PT0gXCJUYWJcIikge1xyXG4gICAgICAvLyB0cmFwIGZvY3VzXHJcbiAgICAgIGNvbnN0IG5vZGVzID0gbW9kYWwucXVlcnlTZWxlY3RvckFsbChcIipcIik7XHJcbiAgICAgIGNvbnN0IHRhYmJhYmxlID0gQXJyYXkuZnJvbShub2RlcykuZmlsdGVyKChuKSA9PiBuLnRhYkluZGV4ID49IDApO1xyXG4gICAgICBsZXQgaW5kZXggPSB0YWJiYWJsZS5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xyXG4gICAgICBpZiAoaW5kZXggPT09IC0xICYmIGUuc2hpZnRLZXkpIGluZGV4ID0gMDtcclxuICAgICAgaW5kZXggKz0gdGFiYmFibGUubGVuZ3RoICsgKGUuc2hpZnRLZXkgPyAtMSA6IDEpO1xyXG4gICAgICBpbmRleCAlPSB0YWJiYWJsZS5sZW5ndGg7XHJcbiAgICAgIHRhYmJhYmxlW2luZGV4XS5mb2N1cygpO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBjb25zdCBwcmV2aW91c2x5X2ZvY3VzZWQgPVxyXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XHJcbiAgaWYgKHByZXZpb3VzbHlfZm9jdXNlZCkge1xyXG4gICAgb25EZXN0cm95KCgpID0+IHtcclxuICAgICAgcHJldmlvdXNseV9mb2N1c2VkLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuICB9XHJcbjwvc2NyaXB0PlxyXG5cclxuPHN2ZWx0ZTp3aW5kb3cgb246a2V5ZG93bj1cIntoYW5kbGVfa2V5ZG93bn1cIiAvPlxyXG5cclxuPGRpdiBjbGFzcz1cIm1vZGFsLWJhY2tncm91bmRcIiBvbjpjbGljaz1cIntjbG9zZX1cIj48L2Rpdj5cclxuXHJcbjxkaXZcclxuICBjbGFzcz1cIm1vZGFsIHtpc0luV2ViQXBwaU9TID8gJ3N0YW5kYWxvbmUnIDogJycsIGZhdm9yaXRlTW9kYWwgPyAnZmF2b3JpdGUtbW9kYWwnIDogJyd9XCJcclxuICByb2xlPVwiZGlhbG9nXCJcclxuICBhcmlhLW1vZGFsPVwidHJ1ZVwiXHJcbiAgYmluZDp0aGlzPVwie21vZGFsfVwiXHJcbj5cclxuICA8ZGl2IGNsYXNzPVwibm90Y2hcIj48L2Rpdj5cclxuICA8c2xvdCBuYW1lPVwiaGVhZGVyXCI+PC9zbG90PlxyXG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1pbm5lclwiPlxyXG4gICAgPHNsb3Q+PC9zbG90PlxyXG4gIDwvZGl2PlxyXG4gIDwhLS0gc3ZlbHRlLWlnbm9yZSBhMTF5LWF1dG9mb2N1cyAtLT5cclxuICA8ZGl2IHN0eWxlPVwiYWxpZ24tc2VsZjogZmxleC1zdGFydDsgbWFyZ2luLXRvcDogYXV0bztcIj5cclxuICAgIDxidXR0b24gY2xhc3M9XCJidG5cIiBvbjpjbGljaz1cIntjbG9zZX1cIj5TdMOkbmc8L2J1dHRvbj5cclxuICA8L2Rpdj5cclxuPC9kaXY+XHJcblxyXG48c3R5bGU+XHJcbiAgLm5vdGNoIHtcclxuICAgIGhlaWdodDogMzRweDtcclxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLW5vdGNoKTtcclxuICAgIHdpZHRoOiBjYWxjKDEwMHZ3IC0gMTY1cHgpO1xyXG4gICAgbWFyZ2luOiAwIGF1dG87XHJcbiAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiAyZW07XHJcbiAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMmVtO1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgei1pbmRleDogMTA7XHJcbiAgICBkaXNwbGF5OiBub25lO1xyXG4gIH1cclxuICAubm90Y2g6YmVmb3JlIHtcclxuICAgIGNvbnRlbnQ6IFwiXCI7XHJcbiAgICB3aWR0aDogN3B4O1xyXG4gICAgaGVpZ2h0OiA3cHg7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ub3RjaCk7XHJcbiAgICBsZWZ0OiAtMnB4O1xyXG4gICAgdG9wOiAtNnB4O1xyXG4gICAgYm9yZGVyLXJhZGl1czogNnB4O1xyXG4gIH1cclxuICAubm90Y2g6YWZ0ZXIge1xyXG4gICAgY29udGVudDogXCJcIjtcclxuICAgIHdpZHRoOiA3cHg7XHJcbiAgICBoZWlnaHQ6IDdweDtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLW5vdGNoKTtcclxuICAgIHJpZ2h0OiAtMnB4O1xyXG4gICAgdG9wOiAtNnB4O1xyXG4gICAgYm9yZGVyLXJhZGl1czogNnB4O1xyXG4gIH1cclxuICBAbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcclxuICAgIC5ub3RjaCB7XHJcbiAgICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC5tb2RhbC1iYWNrZ3JvdW5kIHtcclxuICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgIHRvcDogMDtcclxuICAgIGxlZnQ6IDA7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4zKTtcclxuICAgIHotaW5kZXg6IDk5O1xyXG4gIH1cclxuICAubW9kYWwge1xyXG4gICAgZGlzcGxheTogZmxleDtcclxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICBsZWZ0OiA4cHg7XHJcbiAgICB0b3A6IDhweDtcclxuICAgIHdpZHRoOiBjYWxjKDEwMHZ3IC0gNGVtKTtcclxuICAgIG1heC13aWR0aDogMzJlbTtcclxuICAgIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgICAtd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2g7XHJcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gNDJweCk7XHJcbiAgICBoZWlnaHQ6IGNhbGMoMTAwdmggLSAxODBweCk7XHJcbiAgICBwYWRkaW5nOiAyNHB4O1xyXG4gICAgYm9yZGVyLXJhZGl1czogMC4yZW07XHJcbiAgICBiYWNrZ3JvdW5kOiB3aGl0ZTtcclxuICAgIHotaW5kZXg6IDEwMDtcclxuICAgIHBhZGRpbmctdG9wOiAwO1xyXG4gIH1cclxuICAuZmF2b3JpdGUtbW9kYWwge1xyXG4gICAgbWluLWhlaWdodDogNTAwcHg7XHJcbiAgfVxyXG4gIC5tb2RhbC1pbm5lciB7XHJcbiAgICBvdmVyZmxvdzogc2Nyb2xsO1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbiAgICBtYXJnaW4tYm90dG9tOiAyNHB4O1xyXG4gICAgd2lkdGg6IGNhbGMoMTAwdncgLSA0ZW0pO1xyXG4gICAgaGVpZ2h0OiAxMDAlO1xyXG4gICAgbWFyZ2luLXRvcDogMHB4O1xyXG4gIH1cclxuICBAbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcclxuICAgIC5tb2RhbC1pbm5lciB7XHJcbiAgICAgIG1heC13aWR0aDogMzJlbTtcclxuICAgICAgbWFyZ2luLXRvcDogMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC5tb2RhbC1pbm5lcjo6LXdlYmtpdC1zY3JvbGxiYXIge1xyXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xyXG4gICAgd2lkdGg6IDA7XHJcbiAgICBoZWlnaHQ6IDA7XHJcbiAgfVxyXG4gIC5tb2RhbC5zdGFuZGFsb25lIHtcclxuICAgIC0tc2FmZS1hcmVhLWluc2V0LXRvcDogZW52KHNhZmUtYXJlYS1pbnNldC10b3ApO1xyXG4gICAgaGVpZ2h0OiBjYWxjKDEwMCUgKyB2YXIoLS1zYWZlLWFyZWEtaW5zZXQtdG9wKSk7XHJcbiAgICBib3JkZXItcmFkaXVzOiAyZW07XHJcbiAgfVxyXG4gIC5tb2RhbC5zdGFuZGFsb25lIC5ub3RjaCB7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxuICB9XHJcbiAgLm1vZGFsLnN0YW5kYWxvbmUgLm1vZGFsLWlubmVyIHtcclxuICAgIG1hcmdpbi10b3A6IC0zMXB4O1xyXG4gIH1cclxuXHJcbiAgQG1lZGlhIChtaW4td2lkdGg6IDc2OHB4KSB7XHJcbiAgICAubW9kYWwge1xyXG4gICAgICBsZWZ0OiA1MCU7XHJcbiAgICAgIHRvcDogNDclO1xyXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcclxuICAgICAgaGVpZ2h0OiBhdXRvO1xyXG4gICAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gOWVtKTtcclxuICAgIH1cclxuICB9XHJcbiAgYnV0dG9uIHtcclxuICAgIGFsaWduLXNlbGY6IGZsZXgtc3RhcnQ7XHJcbiAgICBtYXJnaW4tdG9wOiBhdXRvO1xyXG4gICAgLS1jb2xvcjogdmFyKC0tcHJpbWFyeS0yKTtcclxuICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gICAgLS10ZXh0OiAjZmZmO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcclxuICAgIHRvdWNoLWFjdGlvbjogbWFuaXB1bGF0aW9uO1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcclxuICAgIGJvcmRlcjogbm9uZTtcclxuICAgIGNvbG9yOiB2YXIoLS10ZXh0KTtcclxuICAgIHBhZGRpbmc6IDlweCAyNHB4O1xyXG4gICAgZm9udC1zaXplOiAxNHB4O1xyXG4gICAgbGluZS1oZWlnaHQ6IDIycHg7XHJcbiAgICBmb250LXdlaWdodDogNjAwO1xyXG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29sb3IpO1xyXG4gICAgYm9yZGVyLXJhZGl1czogNnB4O1xyXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xyXG4gICAgLXdlYmtpdC10cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xyXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcclxuICB9XHJcbjwvc3R5bGU+XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF5REUsTUFBTSw0QkFBQyxDQUFDLEFBQ04sTUFBTSxDQUFFLElBQUksQ0FDWixnQkFBZ0IsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxDQUM5QixLQUFLLENBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUMxQixNQUFNLENBQUUsQ0FBQyxDQUFDLElBQUksQ0FDZCx5QkFBeUIsQ0FBRSxHQUFHLENBQzlCLDBCQUEwQixDQUFFLEdBQUcsQ0FDL0IsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsT0FBTyxDQUFFLEVBQUUsQ0FDWCxPQUFPLENBQUUsSUFBSSxBQUNmLENBQUMsQUFDRCxrQ0FBTSxPQUFPLEFBQUMsQ0FBQyxBQUNiLE9BQU8sQ0FBRSxFQUFFLENBQ1gsS0FBSyxDQUFFLEdBQUcsQ0FDVixNQUFNLENBQUUsR0FBRyxDQUNYLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLGdCQUFnQixDQUFFLElBQUksT0FBTyxDQUFDLENBQzlCLElBQUksQ0FBRSxJQUFJLENBQ1YsR0FBRyxDQUFFLElBQUksQ0FDVCxhQUFhLENBQUUsR0FBRyxBQUNwQixDQUFDLEFBQ0Qsa0NBQU0sTUFBTSxBQUFDLENBQUMsQUFDWixPQUFPLENBQUUsRUFBRSxDQUNYLEtBQUssQ0FBRSxHQUFHLENBQ1YsTUFBTSxDQUFFLEdBQUcsQ0FDWCxRQUFRLENBQUUsUUFBUSxDQUNsQixnQkFBZ0IsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxDQUM5QixLQUFLLENBQUUsSUFBSSxDQUNYLEdBQUcsQ0FBRSxJQUFJLENBQ1QsYUFBYSxDQUFFLEdBQUcsQUFDcEIsQ0FBQyxBQUNELE1BQU0sQUFBQyxZQUFZLEtBQUssQ0FBQyxBQUFDLENBQUMsQUFDekIsTUFBTSw0QkFBQyxDQUFDLEFBQ04sT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBQ0gsQ0FBQyxBQUNELGlCQUFpQiw0QkFBQyxDQUFDLEFBQ2pCLFFBQVEsQ0FBRSxLQUFLLENBQ2YsR0FBRyxDQUFFLENBQUMsQ0FDTixJQUFJLENBQUUsQ0FBQyxDQUNQLEtBQUssQ0FBRSxJQUFJLENBQ1gsTUFBTSxDQUFFLElBQUksQ0FDWixVQUFVLENBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDOUIsT0FBTyxDQUFFLEVBQUUsQUFDYixDQUFDLEFBQ0QsTUFBTSw0QkFBQyxDQUFDLEFBQ04sT0FBTyxDQUFFLElBQUksQ0FDYixjQUFjLENBQUUsTUFBTSxDQUN0QixRQUFRLENBQUUsUUFBUSxDQUNsQixJQUFJLENBQUUsR0FBRyxDQUNULEdBQUcsQ0FBRSxHQUFHLENBQ1IsS0FBSyxDQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDeEIsU0FBUyxDQUFFLElBQUksQ0FDZixRQUFRLENBQUUsTUFBTSxDQUNoQiwwQkFBMEIsQ0FBRSxLQUFLLENBQ2pDLFVBQVUsQ0FBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQzlCLE1BQU0sQ0FBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQzNCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsYUFBYSxDQUFFLEtBQUssQ0FDcEIsVUFBVSxDQUFFLEtBQUssQ0FDakIsT0FBTyxDQUFFLEdBQUcsQ0FDWixXQUFXLENBQUUsQ0FBQyxBQUNoQixDQUFDLEFBQ0QsZUFBZSw0QkFBQyxDQUFDLEFBQ2YsVUFBVSxDQUFFLEtBQUssQUFDbkIsQ0FBQyxBQUNELFlBQVksNEJBQUMsQ0FBQyxBQUNaLFFBQVEsQ0FBRSxNQUFNLENBQ2hCLEtBQUssQ0FBRSxJQUFJLENBQ1gsYUFBYSxDQUFFLElBQUksQ0FDbkIsS0FBSyxDQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDeEIsTUFBTSxDQUFFLElBQUksQ0FDWixVQUFVLENBQUUsR0FBRyxBQUNqQixDQUFDLEFBQ0QsTUFBTSxBQUFDLFlBQVksS0FBSyxDQUFDLEFBQUMsQ0FBQyxBQUN6QixZQUFZLDRCQUFDLENBQUMsQUFDWixTQUFTLENBQUUsSUFBSSxDQUNmLFVBQVUsQ0FBRSxDQUFDLEFBQ2YsQ0FBQyxBQUNILENBQUMsQUFFRCx3Q0FBWSxtQkFBbUIsQUFBQyxDQUFDLEFBQy9CLGtCQUFrQixDQUFFLElBQUksQ0FDeEIsS0FBSyxDQUFFLENBQUMsQ0FDUixNQUFNLENBQUUsQ0FBQyxBQUNYLENBQUMsQUFDRCxNQUFNLFdBQVcsNEJBQUMsQ0FBQyxBQUNqQixxQkFBcUIsQ0FBRSx3QkFBd0IsQ0FDL0MsTUFBTSxDQUFFLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLHFCQUFxQixDQUFDLENBQUMsQ0FDL0MsYUFBYSxDQUFFLEdBQUcsQUFDcEIsQ0FBQyxBQUNELE1BQU0seUJBQVcsQ0FBQyxNQUFNLGNBQUMsQ0FBQyxBQUN4QixPQUFPLENBQUUsS0FBSyxBQUNoQixDQUFDLEFBQ0QsTUFBTSx5QkFBVyxDQUFDLFlBQVksY0FBQyxDQUFDLEFBQzlCLFVBQVUsQ0FBRSxLQUFLLEFBQ25CLENBQUMsQUFFRCxNQUFNLEFBQUMsWUFBWSxLQUFLLENBQUMsQUFBQyxDQUFDLEFBQ3pCLE1BQU0sNEJBQUMsQ0FBQyxBQUNOLElBQUksQ0FBRSxHQUFHLENBQ1QsR0FBRyxDQUFFLEdBQUcsQ0FDUixTQUFTLENBQUUsVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDaEMsTUFBTSxDQUFFLElBQUksQ0FDWixVQUFVLENBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUMvQixDQUFDLEFBQ0gsQ0FBQyxBQUNELE1BQU0sNEJBQUMsQ0FBQyxBQUNOLFVBQVUsQ0FBRSxVQUFVLENBQ3RCLFVBQVUsQ0FBRSxJQUFJLENBQ2hCLE9BQU8sQ0FBRSxnQkFBZ0IsQ0FDekIsT0FBTyxDQUFFLEtBQUssQ0FDZCxNQUFNLENBQUUsSUFBSSxDQUNaLFVBQVUsQ0FBRSxNQUFNLENBQ2xCLGNBQWMsQ0FBRSxNQUFNLENBQ3RCLFlBQVksQ0FBRSxZQUFZLENBQzFCLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLFdBQVcsQ0FBRSxNQUFNLENBQ25CLE1BQU0sQ0FBRSxJQUFJLENBQ1osS0FBSyxDQUFFLElBQUksTUFBTSxDQUFDLENBQ2xCLE9BQU8sQ0FBRSxHQUFHLENBQUMsSUFBSSxDQUNqQixTQUFTLENBQUUsSUFBSSxDQUNmLFdBQVcsQ0FBRSxJQUFJLENBQ2pCLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFVBQVUsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxDQUN4QixhQUFhLENBQUUsR0FBRyxDQUNsQixlQUFlLENBQUUsSUFBSSxDQUNyQixrQkFBa0IsQ0FBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDakMsVUFBVSxDQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxBQUMzQixDQUFDIn0= */";
    	append_dev(document_1.head, style);
    }

    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    function create_fragment$6(ctx) {
    	let div0;
    	let t0;
    	let div4;
    	let div1;
    	let t1;
    	let t2;
    	let div2;
    	let t3;
    	let div3;
    	let button;
    	let div4_class_value;
    	let current;
    	let dispose;
    	const header_slot_template = /*$$slots*/ ctx[9].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[8], get_header_slot_context);
    	const default_slot_template = /*$$slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			t1 = space();
    			if (header_slot) header_slot.c();
    			t2 = space();
    			div2 = element("div");
    			if (default_slot) default_slot.c();
    			t3 = space();
    			div3 = element("div");
    			button = element("button");
    			button.textContent = "Stäng";
    			attr_dev(div0, "class", "modal-background svelte-y7oj57");
    			add_location(div0, file$5, 37, 0, 1143);
    			attr_dev(div1, "class", "notch svelte-y7oj57");
    			add_location(div1, file$5, 45, 2, 1366);
    			attr_dev(div2, "class", "modal-inner svelte-y7oj57");
    			add_location(div2, file$5, 47, 2, 1426);
    			attr_dev(button, "class", "btn svelte-y7oj57");
    			add_location(button, file$5, 52, 4, 1586);
    			set_style(div3, "align-self", "flex-start");
    			set_style(div3, "margin-top", "auto");
    			add_location(div3, file$5, 51, 2, 1525);
    			attr_dev(div4, "class", div4_class_value = "modal " + (/*isInWebAppiOS*/ ctx[2] ? "standalone" : "", /*favoriteModal*/ ctx[0] ? "favorite-modal" : "") + " svelte-y7oj57");
    			attr_dev(div4, "role", "dialog");
    			attr_dev(div4, "aria-modal", "true");
    			add_location(div4, file$5, 39, 0, 1202);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div4, t1);

    			if (header_slot) {
    				header_slot.m(div4, null);
    			}

    			append_dev(div4, t2);
    			append_dev(div4, div2);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			/*div4_binding*/ ctx[10](div4);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(window_1, "keydown", /*handle_keydown*/ ctx[4], false, false, false),
    				listen_dev(div0, "click", /*close*/ ctx[3], false, false, false),
    				listen_dev(button, "click", /*close*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 256) {
    					header_slot.p(get_slot_context(header_slot_template, ctx, /*$$scope*/ ctx[8], get_header_slot_context), get_slot_changes(header_slot_template, /*$$scope*/ ctx[8], dirty, get_header_slot_changes));
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[8], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null));
    				}
    			}

    			if (!current || dirty & /*favoriteModal*/ 1 && div4_class_value !== (div4_class_value = "modal " + (/*isInWebAppiOS*/ ctx[2] ? "standalone" : "", /*favoriteModal*/ ctx[0] ? "favorite-modal" : "") + " svelte-y7oj57")) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			if (header_slot) header_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*div4_binding*/ ctx[10](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const isInWebAppiOS = window.navigator.standalone == true;
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch("close");
    	const addToFavorites = () => dispatch("addToFavorites");
    	let modal;
    	let { favoriteModal = false } = $$props;

    	const handle_keydown = e => {
    		if (e.key === "Escape") {
    			close();
    			return;
    		}

    		if (e.key === "Tab") {
    			// trap focus
    			const nodes = modal.querySelectorAll("*");

    			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && e.shiftKey) index = 0;
    			index += tabbable.length + (e.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			e.preventDefault();
    		}
    	};

    	const previously_focused = typeof document !== "undefined" && document.activeElement;

    	if (previously_focused) {
    		onDestroy(() => {
    			previously_focused.focus();
    		});
    	}

    	const writable_props = ["favoriteModal"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['header','default']);

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, modal = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("favoriteModal" in $$props) $$invalidate(0, favoriteModal = $$props.favoriteModal);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		isInWebAppiOS,
    		dispatch,
    		close,
    		addToFavorites,
    		modal,
    		favoriteModal,
    		handle_keydown,
    		previously_focused
    	});

    	$$self.$inject_state = $$props => {
    		if ("modal" in $$props) $$invalidate(1, modal = $$props.modal);
    		if ("favoriteModal" in $$props) $$invalidate(0, favoriteModal = $$props.favoriteModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		favoriteModal,
    		modal,
    		isInWebAppiOS,
    		close,
    		handle_keydown,
    		dispatch,
    		addToFavorites,
    		previously_focused,
    		$$scope,
    		$$slots,
    		div4_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document_1.getElementById("svelte-y7oj57-style")) add_css$6();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { favoriteModal: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get favoriteModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set favoriteModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FoodCard.svelte generated by Svelte v3.20.1 */
    const file$6 = "src\\components\\FoodCard.svelte";

    function add_css$7() {
    	var style = element("style");
    	style.id = "svelte-vchswv-style";
    	style.textContent = ".available.svelte-vchswv{margin-bottom:8px;text-align:center}article.svelte-vchswv{padding:24px;background:var(--card-background);border-radius:8px;box-shadow:0 2px 4px var(--shadow);border:1px solid var(--border);display:flex;flex-direction:column}.img-wrapper.svelte-vchswv{position:relative;height:0;padding-top:61%;overflow:hidden;margin-bottom:8px}img.svelte-vchswv{position:absolute;left:0;top:0;width:100%;object-fit:fill}h2.svelte-vchswv{font-family:\"Encode Sans\";font-weight:700;font-size:18px;color:var(--text-color-headline);margin:0 0 16px 0;text-align:center}article.svelte-vchswv:last-child{margin-bottom:20px}span.svelte-vchswv{text-align:center}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9vZENhcmQuc3ZlbHRlIiwic291cmNlcyI6WyJGb29kQ2FyZC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cclxuICBpbXBvcnQgTW9kYWwgZnJvbSBcIi4vTW9kYWwuc3ZlbHRlXCI7XHJcbiAgaW1wb3J0IHsgY3VzdG9tSW5ncmlkaWVudHMgfSBmcm9tIFwiLi4vc3RvcmVcIjtcclxuICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIgfSBmcm9tIFwic3ZlbHRlXCI7XHJcblxyXG4gIGV4cG9ydCBsZXQgdGl0bGU7XHJcbiAgZXhwb3J0IGxldCB0aHVtYm5haWw7XHJcbiAgZXhwb3J0IGxldCBpbmdyZWRpZW50cztcclxuICBleHBvcnQgbGV0IGhyZWY7XHJcbiAgZXhwb3J0IGxldCBpZDtcclxuICBleHBvcnQgbGV0IGluc3RydWN0aW9ucztcclxuICBsZXQgc2hvd01vZGFsID0gZmFsc2U7XHJcbiAgbGV0IGF2YWlsYWJsZUluZ3JlZGllbnRzID0gaW5ncmVkaWVudHMuZmlsdGVyKChlKSA9PiBlLlNlbGVjdGVkKTtcclxuICBsZXQgcmVtb3ZlZFN0cmluZ0FycmF5ID0gaW5ncmVkaWVudHMubWFwKGZ1bmN0aW9uIChkKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBOYW1lOiBkLk5hbWUucmVwbGFjZSgvQXJsYSBLw7ZrZXR8QXJsYS9nLCBcIlwiKSxcclxuICAgICAgQW1vdW50OiBkLkFtb3VudCxcclxuICAgICAgU2VsZWN0ZWQ6IGQuU2VsZWN0ZWQsXHJcbiAgICB9O1xyXG4gIH0pO1xyXG5cclxuICBjb25zdCBkaXNwYXRjaCA9IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpO1xyXG5cclxuICBmdW5jdGlvbiBvcGVuTW9kYWwoaWQpIHtcclxuICAgIGRpc3BhdGNoKFwicmVjaXBlSWRcIiwge1xyXG4gICAgICBpZDogaWQsXHJcbiAgICAgIHNob3dNb2RhbDogdHJ1ZSxcclxuICAgICAgcmVtb3ZlZFN0cmluZ0FycmF5OiByZW1vdmVkU3RyaW5nQXJyYXksXHJcbiAgICAgIGhyZWY6IGhyZWYsXHJcbiAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgaW5zdHJ1Y3Rpb25zOiBpbnN0cnVjdGlvbnMsXHJcbiAgICB9KTtcclxuICB9XHJcbjwvc2NyaXB0PlxyXG5cclxuPGFydGljbGUgZGF0YS11cmw9XCJ7aHJlZn1cIj5cclxuICA8c3BhbiBjbGFzcz1cImF2YWlsYWJsZVwiPlxyXG4gICAgZHUgaGFyIHsgYXZhaWxhYmxlSW5ncmVkaWVudHMubGVuZ3RoIH0gYXYge2luZ3JlZGllbnRzLmxlbmd0aH0gaW5ncmVkaWVuc2VyXHJcbiAgPC9zcGFuPlxyXG4gIDxoMj57dGl0bGV9PC9oMj5cclxuICA8ZGl2IGNsYXNzPVwiaW1nLXdyYXBwZXJcIj5cclxuICAgIDxpbWcgc3JjPVwie3RodW1ibmFpbH1cIiBoZWlnaHQ9XCIxOTBcIiAvPlxyXG4gIDwvZGl2PlxyXG4gIDxzcGFuIG9uOmNsaWNrPVwie29wZW5Nb2RhbChpZCl9XCI+VmlzYSBhbGxhIGluZ3JlZGllbnNlcjwvc3Bhbj5cclxuPC9hcnRpY2xlPlxyXG5cclxuPHN0eWxlPlxyXG4gIC5hdmFpbGFibGUge1xyXG4gICAgbWFyZ2luLWJvdHRvbTogOHB4O1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gIH1cclxuICBhcnRpY2xlIHtcclxuICAgIHBhZGRpbmc6IDI0cHg7XHJcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jYXJkLWJhY2tncm91bmQpO1xyXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xyXG4gICAgYm94LXNoYWRvdzogMCAycHggNHB4IHZhcigtLXNoYWRvdyk7XHJcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO1xyXG4gICAgZGlzcGxheTogZmxleDtcclxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgfVxyXG4gIC5pbWctd3JhcHBlciB7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBoZWlnaHQ6IDA7XHJcbiAgICBwYWRkaW5nLXRvcDogNjElO1xyXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICAgIG1hcmdpbi1ib3R0b206IDhweDtcclxuICB9XHJcbiAgaW1nIHtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGxlZnQ6IDA7XHJcbiAgICB0b3A6IDA7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIG9iamVjdC1maXQ6IGZpbGw7XHJcbiAgfVxyXG4gIGgyIHtcclxuICAgIGZvbnQtZmFtaWx5OiBcIkVuY29kZSBTYW5zXCI7XHJcbiAgICBmb250LXdlaWdodDogNzAwO1xyXG4gICAgZm9udC1zaXplOiAxOHB4O1xyXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3ItaGVhZGxpbmUpO1xyXG4gICAgbWFyZ2luOiAwIDAgMTZweCAwO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gIH1cclxuXHJcbiAgc21hbGwge1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbiAgICBmb250LXNpemU6IDEycHg7XHJcbiAgICBmb250LXdlaWdodDogNTAwO1xyXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xyXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xyXG4gIH1cclxuICBhIHtcclxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gIH1cclxuICBhcnRpY2xlOmxhc3QtY2hpbGQge1xyXG4gICAgbWFyZ2luLWJvdHRvbTogMjBweDtcclxuICB9XHJcbiAgc3BhbiB7XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgfVxyXG48L3N0eWxlPlxyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBK0NFLFVBQVUsY0FBQyxDQUFDLEFBQ1YsYUFBYSxDQUFFLEdBQUcsQ0FDbEIsVUFBVSxDQUFFLE1BQU0sQUFDcEIsQ0FBQyxBQUNELE9BQU8sY0FBQyxDQUFDLEFBQ1AsT0FBTyxDQUFFLElBQUksQ0FDYixVQUFVLENBQUUsSUFBSSxpQkFBaUIsQ0FBQyxDQUNsQyxhQUFhLENBQUUsR0FBRyxDQUNsQixVQUFVLENBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FDbkMsTUFBTSxDQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FDL0IsT0FBTyxDQUFFLElBQUksQ0FDYixjQUFjLENBQUUsTUFBTSxBQUN4QixDQUFDLEFBQ0QsWUFBWSxjQUFDLENBQUMsQUFDWixRQUFRLENBQUUsUUFBUSxDQUNsQixNQUFNLENBQUUsQ0FBQyxDQUNULFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFFBQVEsQ0FBRSxNQUFNLENBQ2hCLGFBQWEsQ0FBRSxHQUFHLEFBQ3BCLENBQUMsQUFDRCxHQUFHLGNBQUMsQ0FBQyxBQUNILFFBQVEsQ0FBRSxRQUFRLENBQ2xCLElBQUksQ0FBRSxDQUFDLENBQ1AsR0FBRyxDQUFFLENBQUMsQ0FDTixLQUFLLENBQUUsSUFBSSxDQUNYLFVBQVUsQ0FBRSxJQUFJLEFBQ2xCLENBQUMsQUFDRCxFQUFFLGNBQUMsQ0FBQyxBQUNGLFdBQVcsQ0FBRSxhQUFhLENBQzFCLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFNBQVMsQ0FBRSxJQUFJLENBQ2YsS0FBSyxDQUFFLElBQUkscUJBQXFCLENBQUMsQ0FDakMsTUFBTSxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDbEIsVUFBVSxDQUFFLE1BQU0sQUFDcEIsQ0FBQyxBQWNELHFCQUFPLFdBQVcsQUFBQyxDQUFDLEFBQ2xCLGFBQWEsQ0FBRSxJQUFJLEFBQ3JCLENBQUMsQUFDRCxJQUFJLGNBQUMsQ0FBQyxBQUNKLFVBQVUsQ0FBRSxNQUFNLEFBQ3BCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function create_fragment$7(ctx) {
    	let article;
    	let span0;
    	let t0;
    	let t1_value = /*availableIngredients*/ ctx[5].length + "";
    	let t1;
    	let t2;
    	let t3_value = /*ingredients*/ ctx[2].length + "";
    	let t3;
    	let t4;
    	let t5;
    	let h2;
    	let t6;
    	let t7;
    	let div;
    	let img;
    	let img_src_value;
    	let t8;
    	let span1;
    	let dispose;

    	const block = {
    		c: function create() {
    			article = element("article");
    			span0 = element("span");
    			t0 = text("du har ");
    			t1 = text(t1_value);
    			t2 = text(" av ");
    			t3 = text(t3_value);
    			t4 = text(" ingredienser");
    			t5 = space();
    			h2 = element("h2");
    			t6 = text(/*title*/ ctx[0]);
    			t7 = space();
    			div = element("div");
    			img = element("img");
    			t8 = space();
    			span1 = element("span");
    			span1.textContent = "Visa alla ingredienser";
    			attr_dev(span0, "class", "available svelte-vchswv");
    			add_location(span0, file$6, 36, 2, 904);
    			attr_dev(h2, "class", "svelte-vchswv");
    			add_location(h2, file$6, 39, 2, 1024);
    			if (img.src !== (img_src_value = /*thumbnail*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "190");
    			attr_dev(img, "class", "svelte-vchswv");
    			add_location(img, file$6, 41, 4, 1075);
    			attr_dev(div, "class", "img-wrapper svelte-vchswv");
    			add_location(div, file$6, 40, 2, 1044);
    			attr_dev(span1, "class", "svelte-vchswv");
    			add_location(span1, file$6, 43, 2, 1127);
    			attr_dev(article, "data-url", /*href*/ ctx[3]);
    			attr_dev(article, "class", "svelte-vchswv");
    			add_location(article, file$6, 35, 0, 873);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, article, anchor);
    			append_dev(article, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(span0, t4);
    			append_dev(article, t5);
    			append_dev(article, h2);
    			append_dev(h2, t6);
    			append_dev(article, t7);
    			append_dev(article, div);
    			append_dev(div, img);
    			append_dev(article, t8);
    			append_dev(article, span1);
    			if (remount) dispose();

    			dispose = listen_dev(
    				span1,
    				"click",
    				function () {
    					if (is_function(/*openModal*/ ctx[6](/*id*/ ctx[4]))) /*openModal*/ ctx[6](/*id*/ ctx[4]).apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*ingredients*/ 4 && t3_value !== (t3_value = /*ingredients*/ ctx[2].length + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*title*/ 1) set_data_dev(t6, /*title*/ ctx[0]);

    			if (dirty & /*thumbnail*/ 2 && img.src !== (img_src_value = /*thumbnail*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*href*/ 8) {
    				attr_dev(article, "data-url", /*href*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { title } = $$props;
    	let { thumbnail } = $$props;
    	let { ingredients } = $$props;
    	let { href } = $$props;
    	let { id } = $$props;
    	let { instructions } = $$props;
    	let showModal = false;
    	let availableIngredients = ingredients.filter(e => e.Selected);

    	let removedStringArray = ingredients.map(function (d) {
    		return {
    			Name: d.Name.replace(/Arla Köket|Arla/g, ""),
    			Amount: d.Amount,
    			Selected: d.Selected
    		};
    	});

    	const dispatch = createEventDispatcher();

    	function openModal(id) {
    		dispatch("recipeId", {
    			id,
    			showModal: true,
    			removedStringArray,
    			href,
    			title,
    			instructions
    		});
    	}

    	const writable_props = ["title", "thumbnail", "ingredients", "href", "id", "instructions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FoodCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FoodCard", $$slots, []);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("thumbnail" in $$props) $$invalidate(1, thumbnail = $$props.thumbnail);
    		if ("ingredients" in $$props) $$invalidate(2, ingredients = $$props.ingredients);
    		if ("href" in $$props) $$invalidate(3, href = $$props.href);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("instructions" in $$props) $$invalidate(7, instructions = $$props.instructions);
    	};

    	$$self.$capture_state = () => ({
    		Modal,
    		customIngridients,
    		createEventDispatcher,
    		title,
    		thumbnail,
    		ingredients,
    		href,
    		id,
    		instructions,
    		showModal,
    		availableIngredients,
    		removedStringArray,
    		dispatch,
    		openModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("thumbnail" in $$props) $$invalidate(1, thumbnail = $$props.thumbnail);
    		if ("ingredients" in $$props) $$invalidate(2, ingredients = $$props.ingredients);
    		if ("href" in $$props) $$invalidate(3, href = $$props.href);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("instructions" in $$props) $$invalidate(7, instructions = $$props.instructions);
    		if ("showModal" in $$props) showModal = $$props.showModal;
    		if ("availableIngredients" in $$props) $$invalidate(5, availableIngredients = $$props.availableIngredients);
    		if ("removedStringArray" in $$props) removedStringArray = $$props.removedStringArray;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		thumbnail,
    		ingredients,
    		href,
    		id,
    		availableIngredients,
    		openModal,
    		instructions
    	];
    }

    class FoodCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-vchswv-style")) add_css$7();

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			title: 0,
    			thumbnail: 1,
    			ingredients: 2,
    			href: 3,
    			id: 4,
    			instructions: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FoodCard",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<FoodCard> was created without expected prop 'title'");
    		}

    		if (/*thumbnail*/ ctx[1] === undefined && !("thumbnail" in props)) {
    			console.warn("<FoodCard> was created without expected prop 'thumbnail'");
    		}

    		if (/*ingredients*/ ctx[2] === undefined && !("ingredients" in props)) {
    			console.warn("<FoodCard> was created without expected prop 'ingredients'");
    		}

    		if (/*href*/ ctx[3] === undefined && !("href" in props)) {
    			console.warn("<FoodCard> was created without expected prop 'href'");
    		}

    		if (/*id*/ ctx[4] === undefined && !("id" in props)) {
    			console.warn("<FoodCard> was created without expected prop 'id'");
    		}

    		if (/*instructions*/ ctx[7] === undefined && !("instructions" in props)) {
    			console.warn("<FoodCard> was created without expected prop 'instructions'");
    		}
    	}

    	get title() {
    		throw new Error("<FoodCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<FoodCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnail() {
    		throw new Error("<FoodCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnail(value) {
    		throw new Error("<FoodCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ingredients() {
    		throw new Error("<FoodCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ingredients(value) {
    		throw new Error("<FoodCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<FoodCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<FoodCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<FoodCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<FoodCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get instructions() {
    		throw new Error("<FoodCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set instructions(value) {
    		throw new Error("<FoodCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SkeletonFoodCard.svelte generated by Svelte v3.20.1 */

    const file$7 = "src\\components\\SkeletonFoodCard.svelte";

    function add_css$8() {
    	var style = element("style");
    	style.id = "svelte-1fzhey1-style";
    	style.textContent = ".skel-mask-1-heading.svelte-1fzhey1{height:20px;width:40px;left:0;top:0}.skel-mask-2-heading.svelte-1fzhey1{height:20px;width:40px;right:0;top:0}.card-skeleton-heading.svelte-1fzhey1{width:100%;height:20px;display:block}.skel-mask-2-image.svelte-1fzhey1{width:31%;height:100px;top:20px;right:0}.skel-mask-3-image.svelte-1fzhey1{width:32%;height:100px;top:20px;left:0}.card-skeleton.svelte-1fzhey1{transition:all 0.3s ease-in-out;-webkit-backface-visibility:hidden;background:#fff;z-index:10;padding:24px;opacity:1;box-shadow:0 2px 4px var(--shadow);border:1px solid var(--border);border-radius:8px;min-height:230px}.animated-background.svelte-1fzhey1{will-change:transform;animation:svelte-1fzhey1-placeHolderShimmer 1s linear infinite forwards;-webkit-backface-visibility:hidden;background:#e6e6e6;background:linear-gradient(90deg, #eee 8%, #ddd 18%, #eee 33%);background-size:800px 104px;height:100%;position:relative}.card-skeleton-img.svelte-1fzhey1{width:100%;height:80px;display:block}.skel-mask-container.svelte-1fzhey1{position:relative}.skel-mask.svelte-1fzhey1{background:#fff;position:absolute;z-index:2}.skel-mask-1-container.svelte-1fzhey1{width:100%;height:10px;left:0}.skel-mask-1.svelte-1fzhey1{width:100%;height:15px;left:0}.skel-mask-3.svelte-1fzhey1{top:20px}.skel-mask-3.svelte-1fzhey1{width:100%;height:20px;right:0}@keyframes svelte-1fzhey1-placeHolderShimmer{0%{-webkit-transform:translateZ(0);transform:translateZ(0);background-position:-468px 0}to{-webkit-transform:translateZ(0);transform:translateZ(0);background-position:468px 0}}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2tlbGV0b25Gb29kQ2FyZC5zdmVsdGUiLCJzb3VyY2VzIjpbIlNrZWxldG9uRm9vZENhcmQuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxkaXYgY2xhc3M9XCJjYXJkLXNrZWxldG9uXCI+XHJcbiAgPGRpdiBjbGFzcz1cImFuaW1hdGVkLWJhY2tncm91bmRcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJjYXJkLXNrZWxldG9uLWhlYWRpbmdcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cInNrZWwtbWFzayBza2VsLW1hc2stMS1oZWFkaW5nXCI+PC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJza2VsLW1hc2sgc2tlbC1tYXNrLTItaGVhZGluZ1wiPjwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVwiY2FyZC1za2VsZXRvbi1pbWdcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cInNrZWwtbWFzayBza2VsLW1hc2stMVwiPjwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic2tlbC1tYXNrIHNrZWwtbWFzay0yLWltYWdlXCI+PC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJza2VsLW1hc2sgc2tlbC1tYXNrLTMtaW1hZ2VcIj48L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICAgPGRpdiBjbGFzcz1cInNrZWwtbWFzay1jb250YWluZXJcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cInNrZWwtbWFzayBza2VsLW1hc2stMS1jb250YWluZXJcIj48L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cInNrZWwtbWFzayBza2VsLW1hc2stM1wiPjwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvZGl2PlxyXG5cclxuPHN0eWxlPlxyXG4gIC5za2VsLW1hc2stMS1oZWFkaW5nIHtcclxuICAgIGhlaWdodDogMjBweDtcclxuICAgIHdpZHRoOiA0MHB4O1xyXG4gICAgbGVmdDogMDtcclxuICAgIHRvcDogMDtcclxuICB9XHJcbiAgLnNrZWwtbWFzay0yLWhlYWRpbmcge1xyXG4gICAgaGVpZ2h0OiAyMHB4O1xyXG4gICAgd2lkdGg6IDQwcHg7XHJcbiAgICByaWdodDogMDtcclxuICAgIHRvcDogMDtcclxuICB9XHJcbiAgLmNhcmQtc2tlbGV0b24taGVhZGluZyB7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIGhlaWdodDogMjBweDtcclxuICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gIH1cclxuICAuc2tlbC1tYXNrLTItaW1hZ2Uge1xyXG4gICAgd2lkdGg6IDMxJTtcclxuICAgIGhlaWdodDogMTAwcHg7XHJcbiAgICB0b3A6IDIwcHg7XHJcbiAgICByaWdodDogMDtcclxuICB9XHJcbiAgLnNrZWwtbWFzay0zLWltYWdlIHtcclxuICAgIHdpZHRoOiAzMiU7XHJcbiAgICBoZWlnaHQ6IDEwMHB4O1xyXG4gICAgdG9wOiAyMHB4O1xyXG4gICAgbGVmdDogMDtcclxuICB9XHJcbiAgLmNhcmQtc2tlbGV0b24ge1xyXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZS1pbi1vdXQ7XHJcbiAgICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcclxuICAgIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgICB6LWluZGV4OiAxMDtcclxuICAgIHBhZGRpbmc6IDI0cHg7XHJcbiAgICBvcGFjaXR5OiAxO1xyXG4gICAgYm94LXNoYWRvdzogMCAycHggNHB4IHZhcigtLXNoYWRvdyk7XHJcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO1xyXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xyXG4gICAgbWluLWhlaWdodDogMjMwcHg7XHJcbiAgfVxyXG4gIC5hbmltYXRlZC1iYWNrZ3JvdW5kIHtcclxuICAgIHdpbGwtY2hhbmdlOiB0cmFuc2Zvcm07XHJcbiAgICBhbmltYXRpb246IHBsYWNlSG9sZGVyU2hpbW1lciAxcyBsaW5lYXIgaW5maW5pdGUgZm9yd2FyZHM7XHJcbiAgICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcclxuICAgIGJhY2tncm91bmQ6ICNlNmU2ZTY7XHJcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsICNlZWUgOCUsICNkZGQgMTglLCAjZWVlIDMzJSk7XHJcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDgwMHB4IDEwNHB4O1xyXG4gICAgaGVpZ2h0OiAxMDAlO1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gIH1cclxuICAuY2FyZC1za2VsZXRvbi1pbWcge1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbiAgICBoZWlnaHQ6IDgwcHg7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxuICB9XHJcbiAgLnNrZWwtbWFzay1jb250YWluZXIge1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gIH1cclxuICAuc2tlbC1tYXNrIHtcclxuICAgIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICB6LWluZGV4OiAyO1xyXG4gIH1cclxuICAuc2tlbC1tYXNrLTEtY29udGFpbmVyIHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgaGVpZ2h0OiAxMHB4O1xyXG4gICAgbGVmdDogMDtcclxuICB9XHJcbiAgLnNrZWwtbWFzay0xIHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgaGVpZ2h0OiAxNXB4O1xyXG4gICAgbGVmdDogMDtcclxuICB9XHJcbiAgLnNrZWwtbWFzay0yIHtcclxuICAgIHdpZHRoOiAyNSU7XHJcbiAgICBoZWlnaHQ6IDEwcHg7XHJcbiAgICB0b3A6IDE1cHg7XHJcbiAgICByaWdodDogMDtcclxuICB9XHJcblxyXG4gIC5za2VsLW1hc2stMyB7XHJcbiAgICB0b3A6IDIwcHg7XHJcbiAgfVxyXG5cclxuICAuc2tlbC1tYXNrLTMsXHJcbiAgLnNrZWwtbWFzay00IHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgaGVpZ2h0OiAyMHB4O1xyXG4gICAgcmlnaHQ6IDA7XHJcbiAgfVxyXG5cclxuICAuc2tlbC1tYXNrLTQge1xyXG4gICAgdG9wOiA0MHB4O1xyXG4gIH1cclxuXHJcbiAgLnNrZWwtbWFzay01IHtcclxuICAgIHdpZHRoOiAxMCU7XHJcbiAgICBoZWlnaHQ6IDMwcHg7XHJcbiAgICB0b3A6IDY1cHg7XHJcbiAgICByaWdodDogMzAlO1xyXG4gIH1cclxuXHJcbiAgLnNrZWwtbWFzay02IHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgaGVpZ2h0OiAxNXB4O1xyXG4gICAgdG9wOiA5NXB4O1xyXG4gICAgcmlnaHQ6IDA7XHJcbiAgfVxyXG4gIEBrZXlmcmFtZXMgcGxhY2VIb2xkZXJTaGltbWVyIHtcclxuICAgIDAlIHtcclxuICAgICAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCk7XHJcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWigwKTtcclxuICAgICAgYmFja2dyb3VuZC1wb3NpdGlvbjogLTQ2OHB4IDA7XHJcbiAgICB9XHJcbiAgICB0byB7XHJcbiAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGVaKDApO1xyXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCk7XHJcbiAgICAgIGJhY2tncm91bmQtcG9zaXRpb246IDQ2OHB4IDA7XHJcbiAgICB9XHJcbiAgfVxyXG48L3N0eWxlPlxyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbUJFLG9CQUFvQixlQUFDLENBQUMsQUFDcEIsTUFBTSxDQUFFLElBQUksQ0FDWixLQUFLLENBQUUsSUFBSSxDQUNYLElBQUksQ0FBRSxDQUFDLENBQ1AsR0FBRyxDQUFFLENBQUMsQUFDUixDQUFDLEFBQ0Qsb0JBQW9CLGVBQUMsQ0FBQyxBQUNwQixNQUFNLENBQUUsSUFBSSxDQUNaLEtBQUssQ0FBRSxJQUFJLENBQ1gsS0FBSyxDQUFFLENBQUMsQ0FDUixHQUFHLENBQUUsQ0FBQyxBQUNSLENBQUMsQUFDRCxzQkFBc0IsZUFBQyxDQUFDLEFBQ3RCLEtBQUssQ0FBRSxJQUFJLENBQ1gsTUFBTSxDQUFFLElBQUksQ0FDWixPQUFPLENBQUUsS0FBSyxBQUNoQixDQUFDLEFBQ0Qsa0JBQWtCLGVBQUMsQ0FBQyxBQUNsQixLQUFLLENBQUUsR0FBRyxDQUNWLE1BQU0sQ0FBRSxLQUFLLENBQ2IsR0FBRyxDQUFFLElBQUksQ0FDVCxLQUFLLENBQUUsQ0FBQyxBQUNWLENBQUMsQUFDRCxrQkFBa0IsZUFBQyxDQUFDLEFBQ2xCLEtBQUssQ0FBRSxHQUFHLENBQ1YsTUFBTSxDQUFFLEtBQUssQ0FDYixHQUFHLENBQUUsSUFBSSxDQUNULElBQUksQ0FBRSxDQUFDLEFBQ1QsQ0FBQyxBQUNELGNBQWMsZUFBQyxDQUFDLEFBQ2QsVUFBVSxDQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUNoQywyQkFBMkIsQ0FBRSxNQUFNLENBQ25DLFVBQVUsQ0FBRSxJQUFJLENBQ2hCLE9BQU8sQ0FBRSxFQUFFLENBQ1gsT0FBTyxDQUFFLElBQUksQ0FDYixPQUFPLENBQUUsQ0FBQyxDQUNWLFVBQVUsQ0FBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUNuQyxNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUMvQixhQUFhLENBQUUsR0FBRyxDQUNsQixVQUFVLENBQUUsS0FBSyxBQUNuQixDQUFDLEFBQ0Qsb0JBQW9CLGVBQUMsQ0FBQyxBQUNwQixXQUFXLENBQUUsU0FBUyxDQUN0QixTQUFTLENBQUUsaUNBQWtCLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUN6RCwyQkFBMkIsQ0FBRSxNQUFNLENBQ25DLFVBQVUsQ0FBRSxPQUFPLENBQ25CLFVBQVUsQ0FBRSxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQy9ELGVBQWUsQ0FBRSxLQUFLLENBQUMsS0FBSyxDQUM1QixNQUFNLENBQUUsSUFBSSxDQUNaLFFBQVEsQ0FBRSxRQUFRLEFBQ3BCLENBQUMsQUFDRCxrQkFBa0IsZUFBQyxDQUFDLEFBQ2xCLEtBQUssQ0FBRSxJQUFJLENBQ1gsTUFBTSxDQUFFLElBQUksQ0FDWixPQUFPLENBQUUsS0FBSyxBQUNoQixDQUFDLEFBQ0Qsb0JBQW9CLGVBQUMsQ0FBQyxBQUNwQixRQUFRLENBQUUsUUFBUSxBQUNwQixDQUFDLEFBQ0QsVUFBVSxlQUFDLENBQUMsQUFDVixVQUFVLENBQUUsSUFBSSxDQUNoQixRQUFRLENBQUUsUUFBUSxDQUNsQixPQUFPLENBQUUsQ0FBQyxBQUNaLENBQUMsQUFDRCxzQkFBc0IsZUFBQyxDQUFDLEFBQ3RCLEtBQUssQ0FBRSxJQUFJLENBQ1gsTUFBTSxDQUFFLElBQUksQ0FDWixJQUFJLENBQUUsQ0FBQyxBQUNULENBQUMsQUFDRCxZQUFZLGVBQUMsQ0FBQyxBQUNaLEtBQUssQ0FBRSxJQUFJLENBQ1gsTUFBTSxDQUFFLElBQUksQ0FDWixJQUFJLENBQUUsQ0FBQyxBQUNULENBQUMsQUFRRCxZQUFZLGVBQUMsQ0FBQyxBQUNaLEdBQUcsQ0FBRSxJQUFJLEFBQ1gsQ0FBQyxBQUVELFlBQVksZUFDQyxDQUFDLEFBQ1osS0FBSyxDQUFFLElBQUksQ0FDWCxNQUFNLENBQUUsSUFBSSxDQUNaLEtBQUssQ0FBRSxDQUFDLEFBQ1YsQ0FBQyxBQW1CRCxXQUFXLGlDQUFtQixDQUFDLEFBQzdCLEVBQUUsQUFBQyxDQUFDLEFBQ0YsaUJBQWlCLENBQUUsV0FBVyxDQUFDLENBQUMsQ0FDaEMsU0FBUyxDQUFFLFdBQVcsQ0FBQyxDQUFDLENBQ3hCLG1CQUFtQixDQUFFLE1BQU0sQ0FBQyxDQUFDLEFBQy9CLENBQUMsQUFDRCxFQUFFLEFBQUMsQ0FBQyxBQUNGLGlCQUFpQixDQUFFLFdBQVcsQ0FBQyxDQUFDLENBQ2hDLFNBQVMsQ0FBRSxXQUFXLENBQUMsQ0FBQyxDQUN4QixtQkFBbUIsQ0FBRSxLQUFLLENBQUMsQ0FBQyxBQUM5QixDQUFDLEFBQ0gsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function create_fragment$8(ctx) {
    	let div11;
    	let div10;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div6;
    	let div3;
    	let t2;
    	let div4;
    	let t3;
    	let div5;
    	let t4;
    	let div9;
    	let div7;
    	let t5;
    	let div8;

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div10 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div6 = element("div");
    			div3 = element("div");
    			t2 = space();
    			div4 = element("div");
    			t3 = space();
    			div5 = element("div");
    			t4 = space();
    			div9 = element("div");
    			div7 = element("div");
    			t5 = space();
    			div8 = element("div");
    			attr_dev(div0, "class", "skel-mask skel-mask-1-heading svelte-1fzhey1");
    			add_location(div0, file$7, 3, 6, 113);
    			attr_dev(div1, "class", "skel-mask skel-mask-2-heading svelte-1fzhey1");
    			add_location(div1, file$7, 4, 6, 170);
    			attr_dev(div2, "class", "card-skeleton-heading svelte-1fzhey1");
    			add_location(div2, file$7, 2, 4, 70);
    			attr_dev(div3, "class", "skel-mask skel-mask-1 svelte-1fzhey1");
    			add_location(div3, file$7, 7, 6, 276);
    			attr_dev(div4, "class", "skel-mask skel-mask-2-image svelte-1fzhey1");
    			add_location(div4, file$7, 8, 6, 325);
    			attr_dev(div5, "class", "skel-mask skel-mask-3-image svelte-1fzhey1");
    			add_location(div5, file$7, 9, 6, 380);
    			attr_dev(div6, "class", "card-skeleton-img svelte-1fzhey1");
    			add_location(div6, file$7, 6, 4, 237);
    			attr_dev(div7, "class", "skel-mask skel-mask-1-container svelte-1fzhey1");
    			add_location(div7, file$7, 12, 6, 486);
    			attr_dev(div8, "class", "skel-mask skel-mask-3 svelte-1fzhey1");
    			add_location(div8, file$7, 13, 6, 545);
    			attr_dev(div9, "class", "skel-mask-container svelte-1fzhey1");
    			add_location(div9, file$7, 11, 4, 445);
    			attr_dev(div10, "class", "animated-background svelte-1fzhey1");
    			add_location(div10, file$7, 1, 2, 31);
    			attr_dev(div11, "class", "card-skeleton svelte-1fzhey1");
    			add_location(div11, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div10);
    			append_dev(div10, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div10, t1);
    			append_dev(div10, div6);
    			append_dev(div6, div3);
    			append_dev(div6, t2);
    			append_dev(div6, div4);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div10, t4);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t5);
    			append_dev(div9, div8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SkeletonFoodCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SkeletonFoodCard", $$slots, []);
    	return [];
    }

    class SkeletonFoodCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1fzhey1-style")) add_css$8();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkeletonFoodCard",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\components\FavoritesList.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$8 = "src\\components\\FavoritesList.svelte";

    function add_css$9() {
    	var style = element("style");
    	style.id = "svelte-z20w4j-style";
    	style.textContent = ".test.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{position:absolute;top:0;left:0;height:100%;width:100%;z-index:1;overflow:auto;background-color:#fff}ul.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{margin:0;padding:0;list-style:none}.list.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{--color:var(--primary-1);margin:0 0 8px 0;border:1px solid var(--border);border-radius:6px;padding:12px;display:flex;-webkit-box-align:center;align-items:center;position:relative;text-decoration:none;color:var(--text-color-headline);font-weight:600;font-size:14px;cursor:pointer}.list.svelte-z20w4j.svelte-z20w4j>svg.svelte-z20w4j.svelte-z20w4j{position:absolute;display:block;right:0;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);-webkit-transition:-webkit-transform 0.3s ease;transition:-webkit-transform 0.3s ease;transition:transform 0.3s ease;transition:transform 0.3s ease, -webkit-transform 0.3s ease;fill:var(--border-hover)}.inner.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{padding:24px}.recipe-title.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{margin-top:0}ol.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{margin-left:20px !important;margin-bottom:20px !important}.ingredients.svelte-z20w4j.svelte-z20w4j>li.svelte-z20w4j.svelte-z20w4j{padding:0.5rem;text-align:left}.ingredients.svelte-z20w4j.svelte-z20w4j>li.svelte-z20w4j.svelte-z20w4j:nth-child(odd){background-color:var(--color-odd);color:var(--instructions-color)}.ingredients.svelte-z20w4j.svelte-z20w4j>li.svelte-z20w4j.svelte-z20w4j:nth-child(even){background-color:var(--color-even)}.instructions.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{margin:0;text-indent:-20px;list-style-type:none;counter-increment:item;text-align:left}.instructions.svelte-z20w4j.svelte-z20w4j li.svelte-z20w4j.svelte-z20w4j:before{display:inline-block;width:1em;padding-right:0.5em;font-weight:bold;text-align:right;content:counter(item) \".\";color:inherit}.instructions.svelte-z20w4j.svelte-z20w4j li.svelte-z20w4j.svelte-z20w4j{margin-top:10px;color:var(--instructions-color)}.instructions.svelte-z20w4j li.svelte-z20w4j span.svelte-z20w4j{font-size:18px;line-height:1.5;color:var(--instructions-color)}ol.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j,ul.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{list-style:none;margin:0;padding:0;margin-bottom:10px}.arrow.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{border:solid black;border-width:0 3px 3px 0;display:inline-block;padding:3px;position:fixed;top:18px;left:18px;cursor:pointer}@media(min-width: 1281px){.arrow.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{top:10px;left:10px}}.left.svelte-z20w4j.svelte-z20w4j.svelte-z20w4j{transform:rotate(135deg);-webkit-transform:rotate(135deg)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmF2b3JpdGVzTGlzdC5zdmVsdGUiLCJzb3VyY2VzIjpbIkZhdm9yaXRlc0xpc3Quc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XHJcbiAgaW1wb3J0IE1vZGFsIGZyb20gXCIuL01vZGFsLnN2ZWx0ZVwiO1xyXG4gIGltcG9ydCB7IGZseSB9IGZyb20gXCJzdmVsdGUvdHJhbnNpdGlvblwiO1xyXG4gIGltcG9ydCB7IHF1aW50T3V0IH0gZnJvbSBcInN2ZWx0ZS9lYXNpbmdcIjtcclxuICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xyXG5cclxuICBvbk1vdW50KGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IGdldEZhdm9yaXRlc0xpc3QoKTtcclxuICB9KTtcclxuXHJcbiAgbGV0IHJlY2VwaWVMaXN0ID0gW107XHJcbiAgbGV0IGlzUmVjZXBpZVZpc2libGUgPSBmYWxzZTtcclxuICBsZXQgZnVsbFJlY2VwaWUgPSBbXTtcclxuICBjb25zdCBnZXRGYXZvcml0ZXNMaXN0ID0gKCkgPT4ge1xyXG4gICAgdmFyIHJlcXVlc3QgPSBzZWxmLmluZGV4ZWREQi5vcGVuKFwiRkFWT1JJVEVTX0RCXCIsIDEpO1xyXG4gICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdmFyIGRiID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgdmFyIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oXCJwcm9kdWN0c1wiLCBcInJlYWR3cml0ZVwiKTtcclxuICAgICAgdmFyIG9iamVjdFN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJwcm9kdWN0c1wiKTtcclxuICAgICAgdmFyIG9iamVjdFN0b3JlUmVxdWVzdCA9IG9iamVjdFN0b3JlLmdldEFsbCgpO1xyXG4gICAgICB0cmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJbVHJhbnNhY3Rpb25dIENPTVBMRVRFRCFcIik7XHJcbiAgICAgICAgcmVjZXBpZUxpc3QgPSBvYmplY3RTdG9yZVJlcXVlc3QucmVzdWx0O1xyXG4gICAgICB9O1xyXG4gICAgICB0cmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJbVHJhbnNhY3Rpb25dIEVSUk9SIVwiKTtcclxuICAgICAgfTtcclxuICAgIH07XHJcbiAgfTtcclxuICBjb25zdCBvcGVuRmF2b3JpdGVSZWNpcGUgPSAoZSkgPT4ge1xyXG4gICAgbGV0IGlkID0gZS50YXJnZXQuZGF0YXNldC5pZDtcclxuICAgIGlzUmVjZXBpZVZpc2libGUgPSB0cnVlO1xyXG4gICAgdmFyIHJlcXVlc3QgPSBzZWxmLmluZGV4ZWREQi5vcGVuKFwiRkFWT1JJVEVTX0RCXCIsIDEpO1xyXG4gICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdmFyIGRiID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgdmFyIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oXCJwcm9kdWN0c1wiLCBcInJlYWR3cml0ZVwiKTtcclxuICAgICAgdmFyIG9iamVjdFN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoXCJwcm9kdWN0c1wiKTtcclxuICAgICAgdmFyIG9iamVjdFN0b3JlUmVxdWVzdCA9IG9iamVjdFN0b3JlLmdldChOdW1iZXIoaWQpKTtcclxuICAgICAgdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiW1RyYW5zYWN0aW9uXSBDT01QTEVURUQhXCIpO1xyXG4gICAgICAgIGZ1bGxSZWNlcGllWzBdID0gb2JqZWN0U3RvcmVSZXF1ZXN0LnJlc3VsdDtcclxuICAgICAgfTtcclxuICAgICAgdHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiW1RyYW5zYWN0aW9uXSBFUlJPUiFcIik7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG4gIH07XHJcbjwvc2NyaXB0PlxyXG48aDM+RGluYSBzcGFyYWRlIHJlY2VwdDwvaDM+XHJcbjx1bD5cclxuICB7I2VhY2ggcmVjZXBpZUxpc3QgYXMge3RpdGxlLCBpZH19XHJcblxyXG4gIDxsaSBjbGFzcz1cImxpc3RcIiBvbjpjbGljaz1cIntvcGVuRmF2b3JpdGVSZWNpcGV9XCIgZGF0YS1pZD1cIntpZH1cIj5cclxuICAgIHt0aXRsZX1cclxuICAgIDxzdmdcclxuICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXHJcbiAgICAgIHdpZHRoPVwiMjRcIlxyXG4gICAgICBoZWlnaHQ9XCIyNFwiXHJcbiAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxyXG4gICAgICBjbGFzcz1cImV2YSBldmEtY2hldnJvbi1yaWdodC1vdXRsaW5lXCJcclxuICAgID5cclxuICAgICAgPGcgZGF0YS1uYW1lPVwiTGF5ZXIgMlwiPlxyXG4gICAgICAgIDxnIGRhdGEtbmFtZT1cImNoZXZyb24tcmlnaHRcIj5cclxuICAgICAgICAgIDxyZWN0XHJcbiAgICAgICAgICAgIHdpZHRoPVwiMjRcIlxyXG4gICAgICAgICAgICBoZWlnaHQ9XCIyNFwiXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybT1cInJvdGF0ZSgtOTAgMTIgMTIpXCJcclxuICAgICAgICAgICAgb3BhY2l0eT1cIjBcIlxyXG4gICAgICAgICAgPjwvcmVjdD5cclxuICAgICAgICAgIDxwYXRoXHJcbiAgICAgICAgICAgIGQ9XCJNMTAuNSAxN2ExIDEgMCAwIDEtLjcxLS4yOSAxIDEgMCAwIDEgMC0xLjQyTDEzLjEgMTIgOS45MiA4LjY5YTEgMSAwIDAgMSAwLTEuNDEgMSAxIDAgMCAxIDEuNDIgMGwzLjg2IDRhMSAxIDAgMCAxIDAgMS40bC00IDRhMSAxIDAgMCAxLS43LjMyelwiXHJcbiAgICAgICAgICA+PC9wYXRoPlxyXG4gICAgICAgIDwvZz5cclxuICAgICAgPC9nPlxyXG4gICAgPC9zdmc+XHJcbiAgPC9saT5cclxuICB7L2VhY2h9XHJcbjwvdWw+XHJcbnsjaWYgaXNSZWNlcGllVmlzaWJsZX1cclxuPGRpdlxyXG4gIGNsYXNzPVwidGVzdFwiXHJcbiAgaW46Zmx5PVwie3t4OiAtOTAwLCBkdXJhdGlvbjogMzAwLCBlYXNpbmc6IHF1aW50T3V0IH19XCJcclxuICBvdXQ6Zmx5PVwie3t4OiAtOTAwLCBkdXJhdGlvbjogMzAwLCBlYXNpbmc6IHF1aW50T3V0IH19XCJcclxuPlxyXG4gIDxpIGNsYXNzPVwiYXJyb3cgbGVmdFwiIG9uOmNsaWNrPVwieygpID0+IGlzUmVjZXBpZVZpc2libGUgPSBmYWxzZX1cIj48L2k+XHJcbiAgPGRpdiBjbGFzcz1cImlubmVyXCI+XHJcbiAgICB7I2VhY2ggZnVsbFJlY2VwaWUgYXMgcmVjZXBpZX1cclxuICAgIDxoMyBjbGFzcz1cInJlY2lwZS10aXRsZVwiPntyZWNlcGllLnRpdGxlfTwvaDM+XHJcbiAgICA8dWwgY2xhc3M9XCJpbmdyZWRpZW50c1wiPlxyXG4gICAgICB7I2VhY2ggcmVjZXBpZS5yZW1vdmVkU3RyaW5nQXJyYXkgYXMge05hbWUsIEFtb3VudCwgU2VsZWN0ZWR9fVxyXG4gICAgICA8bGkgY2xhc3M9XCJ7U2VsZWN0ZWQgPyAnaGFzLWluZ3JpZGllbnQnIDogJycgfVwiPlxyXG4gICAgICAgIDxzcGFuPntOYW1lfTwvc3Bhbj5cclxuICAgICAgICA8c3Bhbj57QW1vdW50fTwvc3Bhbj5cclxuICAgICAgPC9saT5cclxuICAgICAgey9lYWNofVxyXG4gICAgPC91bD5cclxuICAgIDxvbCBjbGFzcz1cImluc3RydWN0aW9uc1wiPlxyXG4gICAgICB7I2VhY2ggcmVjZXBpZS5pbnN0cnVjdGlvbnMgYXMge3RleHR9fVxyXG4gICAgICA8bGk+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJpbnN0cnVjdGlvbnNcIj5cclxuICAgICAgICAgIHt0ZXh0fVxyXG4gICAgICAgIDwvc3Bhbj5cclxuICAgICAgPC9saT5cclxuICAgICAgey9lYWNofVxyXG4gICAgPC9vbD5cclxuICAgIHsvZWFjaH1cclxuICA8L2Rpdj5cclxuPC9kaXY+XHJcbnsvaWZ9XHJcblxyXG48c3R5bGU+XHJcbiAgLnRlc3Qge1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgdG9wOiAwO1xyXG4gICAgbGVmdDogMDtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgei1pbmRleDogMTtcclxuICAgIG92ZXJmbG93OiBhdXRvO1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcclxuICB9XHJcbiAgdWwge1xyXG4gICAgbWFyZ2luOiAwO1xyXG4gICAgcGFkZGluZzogMDtcclxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XHJcbiAgfVxyXG4gIC5saXN0IHtcclxuICAgIC0tY29sb3I6IHZhcigtLXByaW1hcnktMSk7XHJcbiAgICBtYXJnaW46IDAgMCA4cHggMDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7XHJcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XHJcbiAgICBwYWRkaW5nOiAxMnB4O1xyXG4gICAgZGlzcGxheTogZmxleDtcclxuICAgIC13ZWJraXQtYm94LWFsaWduOiBjZW50ZXI7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xyXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3ItaGVhZGxpbmUpO1xyXG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcclxuICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICB9XHJcbiAgLmxpc3QgPiBzdmcge1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbiAgICByaWdodDogMDtcclxuICAgIHRvcDogNTAlO1xyXG4gICAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XHJcbiAgICAtd2Via2l0LXRyYW5zaXRpb246IC13ZWJraXQtdHJhbnNmb3JtIDAuM3MgZWFzZTtcclxuICAgIHRyYW5zaXRpb246IC13ZWJraXQtdHJhbnNmb3JtIDAuM3MgZWFzZTtcclxuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjNzIGVhc2U7XHJcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4zcyBlYXNlLCAtd2Via2l0LXRyYW5zZm9ybSAwLjNzIGVhc2U7XHJcbiAgICBmaWxsOiB2YXIoLS1ib3JkZXItaG92ZXIpO1xyXG4gIH1cclxuICAuaW5uZXIge1xyXG4gICAgcGFkZGluZzogMjRweDtcclxuICB9XHJcbiAgLnJlY2lwZS10aXRsZSB7XHJcbiAgICBtYXJnaW4tdG9wOiAwO1xyXG4gIH1cclxuICBvbCB7XHJcbiAgICBtYXJnaW4tbGVmdDogMjBweCAhaW1wb3J0YW50O1xyXG4gICAgbWFyZ2luLWJvdHRvbTogMjBweCAhaW1wb3J0YW50O1xyXG4gIH1cclxuICAuaW5ncmVkaWVudHMgPiBsaSB7XHJcbiAgICBwYWRkaW5nOiAwLjVyZW07XHJcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG4gIH1cclxuICAuaW5ncmVkaWVudHMgPiBsaTpudGgtY2hpbGQob2RkKSB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1vZGQpO1xyXG4gICAgY29sb3I6IHZhcigtLWluc3RydWN0aW9ucy1jb2xvcik7XHJcbiAgfVxyXG4gIC5pbmdyZWRpZW50cyA+IGxpOm50aC1jaGlsZChldmVuKSB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1ldmVuKTtcclxuICB9XHJcblxyXG4gIC5pbnN0cnVjdGlvbnMge1xyXG4gICAgbWFyZ2luOiAwO1xyXG4gICAgdGV4dC1pbmRlbnQ6IC0yMHB4O1xyXG4gICAgbGlzdC1zdHlsZS10eXBlOiBub25lO1xyXG4gICAgY291bnRlci1pbmNyZW1lbnQ6IGl0ZW07XHJcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG4gIH1cclxuICAuaW5zdHJ1Y3Rpb25zIGxpOmJlZm9yZSB7XHJcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgICB3aWR0aDogMWVtO1xyXG4gICAgcGFkZGluZy1yaWdodDogMC41ZW07XHJcbiAgICBmb250LXdlaWdodDogYm9sZDtcclxuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xyXG4gICAgY29udGVudDogY291bnRlcihpdGVtKSBcIi5cIjtcclxuICAgIGNvbG9yOiBpbmhlcml0O1xyXG4gIH1cclxuXHJcbiAgLmluc3RydWN0aW9ucyBsaSB7XHJcbiAgICBtYXJnaW4tdG9wOiAxMHB4O1xyXG4gICAgY29sb3I6IHZhcigtLWluc3RydWN0aW9ucy1jb2xvcik7XHJcbiAgfVxyXG5cclxuICAuaW5zdHJ1Y3Rpb25zIGxpIHNwYW4ge1xyXG4gICAgZm9udC1zaXplOiAxOHB4O1xyXG4gICAgbGluZS1oZWlnaHQ6IDEuNTtcclxuICAgIGNvbG9yOiB2YXIoLS1pbnN0cnVjdGlvbnMtY29sb3IpO1xyXG4gIH1cclxuICBvbCxcclxuICB1bCB7XHJcbiAgICBsaXN0LXN0eWxlOiBub25lO1xyXG4gICAgbWFyZ2luOiAwO1xyXG4gICAgcGFkZGluZzogMDtcclxuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XHJcbiAgfVxyXG4gIC5hcnJvdyB7XHJcbiAgICBib3JkZXI6IHNvbGlkIGJsYWNrO1xyXG4gICAgYm9yZGVyLXdpZHRoOiAwIDNweCAzcHggMDtcclxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcclxuICAgIHBhZGRpbmc6IDNweDtcclxuICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgIHRvcDogMThweDtcclxuICAgIGxlZnQ6IDE4cHg7XHJcbiAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgfVxyXG4gIEBtZWRpYSAobWluLXdpZHRoOiAxMjgxcHgpIHtcclxuICAgIC5hcnJvdyB7XHJcbiAgICAgIHRvcDogMTBweDtcclxuICAgICAgbGVmdDogMTBweDtcclxuICAgIH1cclxuICB9XHJcbiAgLmxlZnQge1xyXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMTM1ZGVnKTtcclxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMTM1ZGVnKTtcclxuICB9XHJcbjwvc3R5bGU+XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUErR0UsS0FBSywwQ0FBQyxDQUFDLEFBQ0wsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsR0FBRyxDQUFFLENBQUMsQ0FDTixJQUFJLENBQUUsQ0FBQyxDQUNQLE1BQU0sQ0FBRSxJQUFJLENBQ1osS0FBSyxDQUFFLElBQUksQ0FDWCxPQUFPLENBQUUsQ0FBQyxDQUNWLFFBQVEsQ0FBRSxJQUFJLENBQ2QsZ0JBQWdCLENBQUUsSUFBSSxBQUN4QixDQUFDLEFBQ0QsRUFBRSwwQ0FBQyxDQUFDLEFBQ0YsTUFBTSxDQUFFLENBQUMsQ0FDVCxPQUFPLENBQUUsQ0FBQyxDQUNWLFVBQVUsQ0FBRSxJQUFJLEFBQ2xCLENBQUMsQUFDRCxLQUFLLDBDQUFDLENBQUMsQUFDTCxPQUFPLENBQUUsZ0JBQWdCLENBQ3pCLE1BQU0sQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQ2pCLE1BQU0sQ0FBRSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLENBQy9CLGFBQWEsQ0FBRSxHQUFHLENBQ2xCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsT0FBTyxDQUFFLElBQUksQ0FDYixpQkFBaUIsQ0FBRSxNQUFNLENBQ3pCLFdBQVcsQ0FBRSxNQUFNLENBQ25CLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLGVBQWUsQ0FBRSxJQUFJLENBQ3JCLEtBQUssQ0FBRSxJQUFJLHFCQUFxQixDQUFDLENBQ2pDLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFNBQVMsQ0FBRSxJQUFJLENBQ2YsTUFBTSxDQUFFLE9BQU8sQUFDakIsQ0FBQyxBQUNELGlDQUFLLENBQUcsR0FBRyw0QkFBQyxDQUFDLEFBQ1gsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsT0FBTyxDQUFFLEtBQUssQ0FDZCxLQUFLLENBQUUsQ0FBQyxDQUNSLEdBQUcsQ0FBRSxHQUFHLENBQ1IsaUJBQWlCLENBQUUsV0FBVyxJQUFJLENBQUMsQ0FDbkMsU0FBUyxDQUFFLFdBQVcsSUFBSSxDQUFDLENBQzNCLGtCQUFrQixDQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQy9DLFVBQVUsQ0FBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUN2QyxVQUFVLENBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQy9CLFVBQVUsQ0FBRSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQzVELElBQUksQ0FBRSxJQUFJLGNBQWMsQ0FBQyxBQUMzQixDQUFDLEFBQ0QsTUFBTSwwQ0FBQyxDQUFDLEFBQ04sT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBQ0QsYUFBYSwwQ0FBQyxDQUFDLEFBQ2IsVUFBVSxDQUFFLENBQUMsQUFDZixDQUFDLEFBQ0QsRUFBRSwwQ0FBQyxDQUFDLEFBQ0YsV0FBVyxDQUFFLElBQUksQ0FBQyxVQUFVLENBQzVCLGFBQWEsQ0FBRSxJQUFJLENBQUMsVUFBVSxBQUNoQyxDQUFDLEFBQ0Qsd0NBQVksQ0FBRyxFQUFFLDRCQUFDLENBQUMsQUFDakIsT0FBTyxDQUFFLE1BQU0sQ0FDZixVQUFVLENBQUUsSUFBSSxBQUNsQixDQUFDLEFBQ0Qsd0NBQVksQ0FBRyw4QkFBRSxXQUFXLEdBQUcsQ0FBQyxBQUFDLENBQUMsQUFDaEMsZ0JBQWdCLENBQUUsSUFBSSxXQUFXLENBQUMsQ0FDbEMsS0FBSyxDQUFFLElBQUksb0JBQW9CLENBQUMsQUFDbEMsQ0FBQyxBQUNELHdDQUFZLENBQUcsOEJBQUUsV0FBVyxJQUFJLENBQUMsQUFBQyxDQUFDLEFBQ2pDLGdCQUFnQixDQUFFLElBQUksWUFBWSxDQUFDLEFBQ3JDLENBQUMsQUFFRCxhQUFhLDBDQUFDLENBQUMsQUFDYixNQUFNLENBQUUsQ0FBQyxDQUNULFdBQVcsQ0FBRSxLQUFLLENBQ2xCLGVBQWUsQ0FBRSxJQUFJLENBQ3JCLGlCQUFpQixDQUFFLElBQUksQ0FDdkIsVUFBVSxDQUFFLElBQUksQUFDbEIsQ0FBQyxBQUNELHlDQUFhLENBQUMsOEJBQUUsT0FBTyxBQUFDLENBQUMsQUFDdkIsT0FBTyxDQUFFLFlBQVksQ0FDckIsS0FBSyxDQUFFLEdBQUcsQ0FDVixhQUFhLENBQUUsS0FBSyxDQUNwQixXQUFXLENBQUUsSUFBSSxDQUNqQixVQUFVLENBQUUsS0FBSyxDQUNqQixPQUFPLENBQUUsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQzFCLEtBQUssQ0FBRSxPQUFPLEFBQ2hCLENBQUMsQUFFRCx5Q0FBYSxDQUFDLEVBQUUsNEJBQUMsQ0FBQyxBQUNoQixVQUFVLENBQUUsSUFBSSxDQUNoQixLQUFLLENBQUUsSUFBSSxvQkFBb0IsQ0FBQyxBQUNsQyxDQUFDLEFBRUQsMkJBQWEsQ0FBQyxnQkFBRSxDQUFDLElBQUksY0FBQyxDQUFDLEFBQ3JCLFNBQVMsQ0FBRSxJQUFJLENBQ2YsV0FBVyxDQUFFLEdBQUcsQ0FDaEIsS0FBSyxDQUFFLElBQUksb0JBQW9CLENBQUMsQUFDbEMsQ0FBQyxBQUNELDRDQUFFLENBQ0YsRUFBRSwwQ0FBQyxDQUFDLEFBQ0YsVUFBVSxDQUFFLElBQUksQ0FDaEIsTUFBTSxDQUFFLENBQUMsQ0FDVCxPQUFPLENBQUUsQ0FBQyxDQUNWLGFBQWEsQ0FBRSxJQUFJLEFBQ3JCLENBQUMsQUFDRCxNQUFNLDBDQUFDLENBQUMsQUFDTixNQUFNLENBQUUsS0FBSyxDQUFDLEtBQUssQ0FDbkIsWUFBWSxDQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDekIsT0FBTyxDQUFFLFlBQVksQ0FDckIsT0FBTyxDQUFFLEdBQUcsQ0FDWixRQUFRLENBQUUsS0FBSyxDQUNmLEdBQUcsQ0FBRSxJQUFJLENBQ1QsSUFBSSxDQUFFLElBQUksQ0FDVixNQUFNLENBQUUsT0FBTyxBQUNqQixDQUFDLEFBQ0QsTUFBTSxBQUFDLFlBQVksTUFBTSxDQUFDLEFBQUMsQ0FBQyxBQUMxQixNQUFNLDBDQUFDLENBQUMsQUFDTixHQUFHLENBQUUsSUFBSSxDQUNULElBQUksQ0FBRSxJQUFJLEFBQ1osQ0FBQyxBQUNILENBQUMsQUFDRCxLQUFLLDBDQUFDLENBQUMsQUFDTCxTQUFTLENBQUUsT0FBTyxNQUFNLENBQUMsQ0FDekIsaUJBQWlCLENBQUUsT0FBTyxNQUFNLENBQUMsQUFDbkMsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i].text;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i].Name;
    	child_ctx[13] = list[i].Amount;
    	child_ctx[14] = list[i].Selected;
    	return child_ctx;
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i].title;
    	child_ctx[18] = list[i].id;
    	return child_ctx;
    }

    // (51:2) {#each recepieList as {title, id}}
    function create_each_block_3(ctx) {
    	let li;
    	let t0_value = /*title*/ ctx[17] + "";
    	let t0;
    	let t1;
    	let svg;
    	let g1;
    	let g0;
    	let rect;
    	let path;
    	let t2;
    	let li_data_id_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			rect = svg_element("rect");
    			path = svg_element("path");
    			t2 = space();
    			attr_dev(rect, "width", "24");
    			attr_dev(rect, "height", "24");
    			attr_dev(rect, "transform", "rotate(-90 12 12)");
    			attr_dev(rect, "opacity", "0");
    			add_location(rect, file$8, 63, 10, 2093);
    			attr_dev(path, "d", "M10.5 17a1 1 0 0 1-.71-.29 1 1 0 0 1 0-1.42L13.1 12 9.92 8.69a1 1 0 0 1 0-1.41 1 1 0 0 1 1.42 0l3.86 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-.7.32z");
    			add_location(path, file$8, 69, 10, 2247);
    			attr_dev(g0, "data-name", "chevron-right");
    			add_location(g0, file$8, 62, 8, 2052);
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$8, 61, 6, 2019);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "eva eva-chevron-right-outline svelte-z20w4j");
    			add_location(svg, file$8, 54, 4, 1849);
    			attr_dev(li, "class", "list svelte-z20w4j");
    			attr_dev(li, "data-id", li_data_id_value = /*id*/ ctx[18]);
    			add_location(li, file$8, 52, 2, 1766);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, svg);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, rect);
    			append_dev(g0, path);
    			append_dev(li, t2);
    			if (remount) dispose();
    			dispose = listen_dev(li, "click", /*openFavoriteRecipe*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*recepieList*/ 1 && t0_value !== (t0_value = /*title*/ ctx[17] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*recepieList*/ 1 && li_data_id_value !== (li_data_id_value = /*id*/ ctx[18])) {
    				attr_dev(li, "data-id", li_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(51:2) {#each recepieList as {title, id}}",
    		ctx
    	});

    	return block;
    }

    // (79:0) {#if isRecepieVisible}
    function create_if_block$2(ctx) {
    	let div1;
    	let i;
    	let t;
    	let div0;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	let dispose;
    	let each_value = /*fullRecepie*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			i = element("i");
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i, "class", "arrow left svelte-z20w4j");
    			add_location(i, file$8, 84, 2, 2665);
    			attr_dev(div0, "class", "inner svelte-z20w4j");
    			add_location(div0, file$8, 85, 2, 2739);
    			attr_dev(div1, "class", "test svelte-z20w4j");
    			add_location(div1, file$8, 79, 0, 2521);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, i);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(i, "click", /*click_handler*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fullRecepie*/ 4) {
    				each_value = /*fullRecepie*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { x: -900, duration: 300, easing: quintOut });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fly, { x: -900, duration: 300, easing: quintOut });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div1_outro) div1_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(79:0) {#if isRecepieVisible}",
    		ctx
    	});

    	return block;
    }

    // (90:6) {#each recepie.removedStringArray as {Name, Amount, Selected}}
    function create_each_block_2(ctx) {
    	let li;
    	let span0;
    	let t0_value = /*Name*/ ctx[12] + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*Amount*/ ctx[13] + "";
    	let t2;
    	let t3;
    	let li_class_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span0, "class", "svelte-z20w4j");
    			add_location(span0, file$8, 91, 8, 3011);
    			attr_dev(span1, "class", "svelte-z20w4j");
    			add_location(span1, file$8, 92, 8, 3040);
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*Selected*/ ctx[14] ? "has-ingridient" : "") + " svelte-z20w4j"));
    			add_location(li, file$8, 90, 6, 2953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span0);
    			append_dev(span0, t0);
    			append_dev(li, t1);
    			append_dev(li, span1);
    			append_dev(span1, t2);
    			append_dev(li, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fullRecepie*/ 4 && t0_value !== (t0_value = /*Name*/ ctx[12] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*fullRecepie*/ 4 && t2_value !== (t2_value = /*Amount*/ ctx[13] + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*fullRecepie*/ 4 && li_class_value !== (li_class_value = "" + (null_to_empty(/*Selected*/ ctx[14] ? "has-ingridient" : "") + " svelte-z20w4j"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(90:6) {#each recepie.removedStringArray as {Name, Amount, Selected}}",
    		ctx
    	});

    	return block;
    }

    // (98:6) {#each recepie.instructions as {text}}
    function create_each_block_1$1(ctx) {
    	let li;
    	let span;
    	let t_value = /*text*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "instructions svelte-z20w4j");
    			add_location(span, file$8, 99, 8, 3199);
    			attr_dev(li, "class", "svelte-z20w4j");
    			add_location(li, file$8, 98, 6, 3185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fullRecepie*/ 4 && t_value !== (t_value = /*text*/ ctx[9] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(98:6) {#each recepie.instructions as {text}}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {#each fullRecepie as recepie}
    function create_each_block$3(ctx) {
    	let h3;
    	let t0_value = /*recepie*/ ctx[6].title + "";
    	let t0;
    	let t1;
    	let ul;
    	let t2;
    	let ol;
    	let t3;
    	let each_value_2 = /*recepie*/ ctx[6].removedStringArray;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*recepie*/ ctx[6].instructions;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			attr_dev(h3, "class", "recipe-title svelte-z20w4j");
    			add_location(h3, file$8, 87, 4, 2800);
    			attr_dev(ul, "class", "ingredients svelte-z20w4j");
    			add_location(ul, file$8, 88, 4, 2851);
    			attr_dev(ol, "class", "instructions svelte-z20w4j");
    			add_location(ol, file$8, 96, 4, 3106);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, ol, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			append_dev(ol, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fullRecepie*/ 4 && t0_value !== (t0_value = /*recepie*/ ctx[6].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*fullRecepie*/ 4) {
    				each_value_2 = /*recepie*/ ctx[6].removedStringArray;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*fullRecepie*/ 4) {
    				each_value_1 = /*recepie*/ ctx[6].instructions;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ol, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ol);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(87:4) {#each fullRecepie as recepie}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let h3;
    	let t1;
    	let ul;
    	let t2;
    	let if_block_anchor;
    	let current;
    	let each_value_3 = /*recepieList*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let if_block = /*isRecepieVisible*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Dina sparade recept";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h3, file$8, 48, 0, 1688);
    			attr_dev(ul, "class", "svelte-z20w4j");
    			add_location(ul, file$8, 49, 0, 1718);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*recepieList, openFavoriteRecipe*/ 9) {
    				each_value_3 = /*recepieList*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (/*isRecepieVisible*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	onMount(async () => {
    		await getFavoritesList();
    	});

    	let recepieList = [];
    	let isRecepieVisible = false;
    	let fullRecepie = [];

    	const getFavoritesList = () => {
    		var request = self.indexedDB.open("FAVORITES_DB", 1);

    		request.onsuccess = function (event) {
    			var db = event.target.result;
    			var transaction = db.transaction("products", "readwrite");
    			var objectStore = transaction.objectStore("products");
    			var objectStoreRequest = objectStore.getAll();

    			transaction.oncomplete = function (event) {
    				console.log("[Transaction] COMPLETED!");
    				$$invalidate(0, recepieList = objectStoreRequest.result);
    			};

    			transaction.onerror = function (event) {
    				console.log("[Transaction] ERROR!");
    			};
    		};
    	};

    	const openFavoriteRecipe = e => {
    		let id = e.target.dataset.id;
    		$$invalidate(1, isRecepieVisible = true);
    		var request = self.indexedDB.open("FAVORITES_DB", 1);

    		request.onsuccess = function (event) {
    			var db = event.target.result;
    			var transaction = db.transaction("products", "readwrite");
    			var objectStore = transaction.objectStore("products");
    			var objectStoreRequest = objectStore.get(Number(id));

    			transaction.oncomplete = function (event) {
    				console.log("[Transaction] COMPLETED!");
    				$$invalidate(2, fullRecepie[0] = objectStoreRequest.result, fullRecepie);
    			};

    			transaction.onerror = function (event) {
    				console.log("[Transaction] ERROR!");
    			};
    		};
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<FavoritesList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FavoritesList", $$slots, []);
    	const click_handler = () => $$invalidate(1, isRecepieVisible = false);

    	$$self.$capture_state = () => ({
    		Modal,
    		fly,
    		quintOut,
    		onMount,
    		recepieList,
    		isRecepieVisible,
    		fullRecepie,
    		getFavoritesList,
    		openFavoriteRecipe
    	});

    	$$self.$inject_state = $$props => {
    		if ("recepieList" in $$props) $$invalidate(0, recepieList = $$props.recepieList);
    		if ("isRecepieVisible" in $$props) $$invalidate(1, isRecepieVisible = $$props.isRecepieVisible);
    		if ("fullRecepie" in $$props) $$invalidate(2, fullRecepie = $$props.fullRecepie);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		recepieList,
    		isRecepieVisible,
    		fullRecepie,
    		openFavoriteRecipe,
    		getFavoritesList,
    		click_handler
    	];
    }

    class FavoritesList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-z20w4j-style")) add_css$9();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FavoritesList",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    var mockData = [
    	{
    		Id: 711283736,
    		Name: "Thaisoppa med räkor",
    		Url: "https://www.arla.se/recept/thaisoppa-med-rakor/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/711283736/0362416f-8ade-43d7-b9f3-c21c25352627.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 1003794429,
    				Name: "Kelda Thaisoppa",
    				Amount: "5 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "½",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1105571790,
    				Name: "salladskål",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 2922350526,
    				Name: "skalade räkor",
    				Amount: "100 g",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 1814372915,
    		Name: "Pasta med paprika- och vitlökssås",
    		Url: "https://www.arla.se/recept/pasta-med-paprika--och-vitlokssas/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/1814372915/06aaae8a-3766-47c5-9f54-f17832ce2a01.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 3297169556,
    				Name: "pasta",
    				Amount: "150 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 884363637,
    				Name: "vitlöksklyfta",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1666481223,
    				Name: "Arla Svenskt Smör",
    				Amount: "1 msk",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 2953012803,
    				Name: "Kelda pastasås mild ost",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			}
    		]
    	},
    	{
    		Id: 9121617,
    		Name: "Spansk räkgryta",
    		Url: "https://www.arla.se/recept/spansk-rakgryta/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/9121617/d5a3fada-764c-42bc-b724-5572408ef296.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 1333274795,
    				Name: "räka med skal",
    				Amount: "500 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 884363637,
    				Name: "vitlöksklyfta",
    				Amount: "2",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1208238308,
    				Name: "Arla Köket lätt crème fraiche paprika & chili",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 152308189,
    				Name: "sockerärta",
    				Amount: "200 g",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 3418899373,
    		Name: "Tortellini med ädelostsmör",
    		Url: "https://www.arla.se/recept/tortellini-med-adelostsmor/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/3418899373/a7878eaf-1c6b-4135-9778-02d66666e6e0.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 2927327405,
    				Name: "Kvibille ädel",
    				Amount: "150 g",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1666481223,
    				Name: "Arla Svenskt Smör",
    				Amount: "75 g",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1649789243,
    				Name: "chilipulver",
    				Amount: "½ tsk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1901344100,
    				Name: "tortellini",
    				Amount: "250 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "2",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 110957159,
    				Name: "körsbärstomat",
    				Amount: "250 g",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 3626567194,
    		Name: "Pastasås med kyckling och fetaostkräm",
    		Url: "https://www.arla.se/recept/pastasas-med-kyckling-och-fetaostkram/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/3626567194/8dd826e6-12c1-4e42-a45a-425e856a8b85.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: "30 min",
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 813568481,
    				Name: "grillad kyckling",
    				Amount: "½",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3829815457,
    				Name: "rödlök",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3241537136,
    				Name: "Arla Köket Smör-&rapsolja",
    				Amount: "1 msk",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3897887781,
    				Name: "majskorn",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1487743753,
    				Name: "Arla Köket crème fraiche fetaost & soltorkade tomater",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			}
    		]
    	},
    	{
    		Id: 3243985971,
    		Name: "Vegetariska wraps med hummus",
    		Url: "https://www.arla.se/recept/vegetariska-wraps-med-hummus/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/3243985971/f9fd223a-e9fc-48f2-978e-ab668b29bdcd.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 496668626,
    				Name: "kikärta",
    				Amount: "400 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1208238308,
    				Name: "Arla Köket lätt crème fraiche paprika & chili",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3623708641,
    				Name: "salt",
    				Amount: "1 krm",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1249932770,
    				Name: "tortillabröd",
    				Amount: "4",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 2741211660,
    				Name: "sallad",
    				Amount: "4 dl",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 2812757793,
    		Name: "Blomkål i grädde med pesto",
    		Url: "https://www.arla.se/recept/blomkal-i-gradde-med-pesto/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/2812757793/49ed16bd-71af-46f6-9453-97dca5d2fef7.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 1046371796,
    				Name: "blomkål",
    				Amount: "600 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1666481223,
    				Name: "Arla Svenskt Smör",
    				Amount: "",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1581518990,
    				Name: "Kelda mellangrädde",
    				Amount: "2½ dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 2625055607,
    				Name: "pesto",
    				Amount: "½ dl",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3623708641,
    				Name: "salt",
    				Amount: "½ tsk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 2224340744,
    				Name: "matvete",
    				Amount: "3 dl",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 957854432,
    		Name: "Svamp- och falukorvspanna",
    		Url: "https://www.arla.se/recept/svamp--och-falukorvspanna/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/957854432/95d33d74-bf5c-4f9d-a922-abf43fa0b149.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: "20 min",
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 4236528846,
    				Name: "falukorv",
    				Amount: "400 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1666481223,
    				Name: "Arla Svenskt Smör",
    				Amount: "",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 2630315837,
    				Name: "Kelda matlagningsgrädde",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 567897289,
    				Name: "svampfond",
    				Amount: "¾ msk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3244913342,
    				Name: "majsstärkelse",
    				Amount: "½ msk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 957689371,
    				Name: "pastahjul",
    				Amount: "300 g",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 2435798856,
    		Name: "Tonfiskspaghetti",
    		Url: "https://www.arla.se/recept/tonfiskspaghetti/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/2435798856/2f77ec8d-ae7a-482f-932f-73e7653ec7ac.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 848882720,
    				Name: "spaghetti",
    				Amount: "300 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "2",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1687314181,
    				Name: "purjolök",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3556856496,
    				Name: "tonfisk i olja",
    				Amount: "185 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1666481223,
    				Name: "Arla Svenskt Smör",
    				Amount: "",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 2777752894,
    				Name: "Arla Köket lätt crème fraiche",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 4188121382,
    				Name: "kapris",
    				Amount: "½ dl",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 2439043826,
    		Name: "Tunnbrödswraps",
    		Url: "https://www.arla.se/recept/tunnbrodwraps/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/2439043826/ae982702-de57-4ef6-aaeb-6a8338a12e5b.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 835230294,
    				Name: "tunnbröd",
    				Amount: "4",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3218950546,
    				Name: "Apetina grillost",
    				Amount: "240 g",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3241537136,
    				Name: "Arla Köket Smör-&rapsolja",
    				Amount: "",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1516456735,
    				Name: "zucchini",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3308849037,
    				Name: "Arla Köket turkisk yoghurt",
    				Amount: "1 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3917274706,
    				Name: "torkad mynta",
    				Amount: "1 tsk",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 1719074018,
    		Name: "Baconlindade grillspett med örter och citron",
    		Url: "https://www.arla.se/recept/baconlindade-grillspett-med-orter-och-citron/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/1719074018/55c819ae-4d38-4464-baf3-0e090966d423.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Buffé, Huvudrätt, Förrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 4139464278,
    				Name: "bacon",
    				Amount: "140 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 421405403,
    				Name: "halloumi",
    				Amount: "240 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 137781217,
    				Name: "rapsolja",
    				Amount: "2 msk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1535472681,
    				Name: "citron",
    				Amount: "½",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 822922967,
    				Name: "svartpeppar",
    				Amount: "2 krm",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 324268816,
    				Name: "torkad rosmarin",
    				Amount: "1 tsk",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 3150366321,
    		Name: "Lövbiffspanna",
    		Url: "https://www.arla.se/recept/lovbiffspanna/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/3150366321/b9285270-f7f0-4b49-9243-7aebe8fb0ee3.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 3818236371,
    				Name: "lövbiff",
    				Amount: "500 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3241537136,
    				Name: "Arla Köket Smör-&rapsolja",
    				Amount: "1 msk",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 2630315837,
    				Name: "Kelda matlagningsgrädde",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 567897289,
    				Name: "svampfond",
    				Amount: "¾ msk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3244913342,
    				Name: "majsstärkelse",
    				Amount: "½ msk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3919989441,
    				Name: "färsk gräslök",
    				Amount: "2 msk",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 832482492,
    		Name: "Pizza med kabanoss och smetana",
    		Url: "https://www.arla.se/recept/pizza-med-kabanoss-och-smetana/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/832482492/ed2d22a7-3ddb-4822-aff2-aea5556ba9b5.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 1797754678,
    				Name: "pizzadeg",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 2736563234,
    				Name: "Arla Köket riven ost pizza",
    				Amount: "150 g",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3234397277,
    				Name: "kabanoss",
    				Amount: "250 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 610275915,
    				Name: "rucola",
    				Amount: "60 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 4161738561,
    				Name: "saltgurka",
    				Amount: "150 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1168225095,
    				Name: "Arla Köket smetana",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			}
    		]
    	},
    	{
    		Id: 517266965,
    		Name: "Fläskfilé tikka masala",
    		Url: "https://www.arla.se/recept/flaskfile-tikka-masala/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/517266965/0efb4457-97e7-403f-93a5-98c5fc68c0f8.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: "20 min",
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 2844857066,
    				Name: "fläskfilé",
    				Amount: "500 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3241537136,
    				Name: "Arla Köket Smör-&rapsolja",
    				Amount: "1 msk",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3977960190,
    				Name: "tikka masala sås",
    				Amount: "1 burk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3212502812,
    				Name: "jasminris",
    				Amount: "3 dl",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 2419639979,
    				Name: "Arla Köket matyoghurt",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 234176372,
    				Name: "färsk koriander",
    				Amount: "½ kruka",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 1832352422,
    		Name: "Het gryta med fläskytterfilé",
    		Url: "https://www.arla.se/recept/het-gryta-med-flaskytterfile/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/1832352422/9ec98195-46fd-4cbd-bba0-48bfb6b984de.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: "20 min",
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 2300252279,
    				Name: "fläskytterfilé",
    				Amount: "400 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 2104596087,
    				Name: "chorizo",
    				Amount: "150 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1666481223,
    				Name: "Arla Svenskt Smör",
    				Amount: "",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3623708641,
    				Name: "salt",
    				Amount: "½ tsk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1475372872,
    				Name: "vatten",
    				Amount: "½ dl",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1208238308,
    				Name: "Arla Köket lätt crème fraiche paprika & chili",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			}
    		]
    	},
    	{
    		Id: 1033488300,
    		Name: "Paprikor fyllda med krämig ost",
    		Url: "https://www.arla.se/recept/paprikor-fyllda-med-kramig-ost/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/1033488300/18339e63-14db-4c79-9d64-f1bf7f1e5820.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Buffé, Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "5",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 2689257052,
    				Name: "Apetina vitost krämig hel bit ",
    				Amount: "400 g",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1135079811,
    				Name: "ägg",
    				Amount: "2",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1837292100,
    				Name: "surdegsbröd",
    				Amount: "4 skivor",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 52322906,
    				Name: "blandad grönsallad",
    				Amount: "",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 4160227771,
    				Name: "salviablad",
    				Amount: "½ kruka",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 137781217,
    				Name: "rapsolja",
    				Amount: "3 dl",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 4200799584,
    		Name: "Paprika- och chilikyckling",
    		Url: "https://www.arla.se/recept/ingefara--och-chilikyckling/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/4200799584/a6958cb6-7a94-4877-819a-7ef1179f5c09.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 2294230807,
    				Name: "kycklingbröstfilé",
    				Amount: "400 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 4038682112,
    				Name: "fullkornsris",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3623708641,
    				Name: "salt",
    				Amount: "1 tsk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3255898951,
    				Name: "salladslök",
    				Amount: "2",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3241537136,
    				Name: "Arla Köket Smör-&rapsolja",
    				Amount: "1 msk",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1208238308,
    				Name: "Arla Köket lätt crème fraiche paprika & chili",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			}
    		]
    	},
    	{
    		Id: 3085975616,
    		Name: "Gazpacho med grönsakstopping",
    		Url: "https://www.arla.se/recept/gazpacho-med-gronsakstopping/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/3085975616/ec1e2387-a3fb-47c2-b988-cc4e48ac8b79.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: null,
    		MealType: "Buffé, Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 1941465834,
    				Name: "Kelda Mild tomatsoppa",
    				Amount: "5 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3587162361,
    				Name: "tabasco",
    				Amount: "1 krm",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1209271750,
    				Name: "vitvinsvinäger",
    				Amount: "1 msk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 884363637,
    				Name: "vitlöksklyfta",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "½",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 587563013,
    				Name: "gurka",
    				Amount: "½",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 544841215,
    				Name: "tomat",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 2192558304,
    				Name: "blekselleri",
    				Amount: "1 stjälk",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 2699333654,
    		Name: "Ostkryddat mos med kryddig korv",
    		Url: "https://www.arla.se/recept/ostkryddat-mos-med-kryddig-korv/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/2699333654/a0ca8480-8bf4-4553-80e3-499c794e7a98.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: "30 min",
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 2812685293,
    				Name: "potatis",
    				Amount: "1 kg",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1687314181,
    				Name: "purjolök",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 884363637,
    				Name: "vitlöksklyfta",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 4072766249,
    				Name: "Arla mjölk",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3612461249,
    				Name: "Arla Köket riven ost mager",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 1821365843,
    				Name: "KESO cottage cheese mexican salsa",
    				Amount: "300 g",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 3568401161,
    				Name: "kryddig korv",
    				Amount: "4",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	},
    	{
    		Id: 1913544872,
    		Name: "Medelhavsgryta",
    		Url: "https://www.arla.se/recept/medelhavsgryta/",
    		ImageUrl: "https://cdn-rdb.arla.com/Files/arla-se/1913544872/fa01aca5-171d-4afe-836e-ffbd9feaa88a.jpg",
    		Favorite: false,
    		Pinned: false,
    		CookingTime: "30 min",
    		MealType: "Huvudrätt",
    		HasMainIngredient: true,
    		Ingredients: [
    			{
    				Id: 2844857066,
    				Name: "fläskfilé",
    				Amount: "400 g",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3623708641,
    				Name: "salt",
    				Amount: "½ tsk",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 911686672,
    				Name: "aubergine",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 3838187031,
    				Name: "gul lök",
    				Amount: "1",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 884363637,
    				Name: "vitlöksklyfta",
    				Amount: "2",
    				Selected: false,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1722222485,
    				Name: "röd paprika",
    				Amount: "1",
    				Selected: true,
    				IsArlaProduct: false
    			},
    			{
    				Id: 1864803441,
    				Name: "Arla Köket lätt crème fraiche tomat & basilika",
    				Amount: "2 dl",
    				Selected: false,
    				IsArlaProduct: true
    			},
    			{
    				Id: 317388171,
    				Name: "vit böna",
    				Amount: "1 burk",
    				Selected: false,
    				IsArlaProduct: false
    			}
    		]
    	}
    ];

    /* src\App.svelte generated by Svelte v3.20.1 */

    const { console: console_1$2, document: document_1$1 } = globals;
    const file$9 = "src\\App.svelte";

    function add_css$a() {
    	var style = element("style");
    	style.id = "svelte-1571666-style";
    	style.textContent = ".addtofav.svelte-1571666.svelte-1571666.svelte-1571666{border:none;background:transparent;position:absolute;right:5px;top:5px;margin-bottom:0;cursor:pointer}.has-ingridient.svelte-1571666.svelte-1571666>span.svelte-1571666.svelte-1571666{text-decoration:line-through}.instructions-title.svelte-1571666.svelte-1571666.svelte-1571666{color:var(--instructions-color)}.loading-title.svelte-1571666.svelte-1571666.svelte-1571666{color:var(--instructions-color)}.recipe-title.svelte-1571666.svelte-1571666.svelte-1571666{color:var(--instructions-color)}h3.standalone.svelte-1571666.svelte-1571666.svelte-1571666{margin-top:45px}.instructions.svelte-1571666.svelte-1571666.svelte-1571666{margin:0;text-indent:-20px;list-style-type:none;counter-increment:item;text-align:left}.instructions.svelte-1571666.svelte-1571666 li.svelte-1571666.svelte-1571666:before{display:inline-block;width:1em;padding-right:0.5em;font-weight:bold;text-align:right;content:counter(item) \".\";color:inherit}.instructions.svelte-1571666.svelte-1571666 li.svelte-1571666.svelte-1571666{margin-top:10px;color:var(--instructions-color)}.instructions.svelte-1571666 li.svelte-1571666 span.svelte-1571666{font-size:18px;line-height:1.5;color:var(--instructions-color)}ol.svelte-1571666.svelte-1571666.svelte-1571666,ul.svelte-1571666.svelte-1571666.svelte-1571666{list-style:none;margin:0;padding:0;margin-bottom:10px}ol.svelte-1571666.svelte-1571666.svelte-1571666{margin-left:20px !important;margin-bottom:20px !important}.ingredients.svelte-1571666.svelte-1571666>li.svelte-1571666.svelte-1571666{padding:0.5rem;text-align:left}.ingredients.svelte-1571666.svelte-1571666>li.svelte-1571666.svelte-1571666:nth-child(odd){background-color:var(--color-odd);color:var(--instructions-color)}.ingredients.svelte-1571666.svelte-1571666>li.svelte-1571666.svelte-1571666:nth-child(even){background-color:var(--color-even)}main.svelte-1571666.svelte-1571666.svelte-1571666{display:flex;flex-direction:column;height:100vh;padding:0 15px}@media(min-width: 1281px){main.svelte-1571666.svelte-1571666.svelte-1571666{padding:0;flex-direction:row}}h1.svelte-1571666.svelte-1571666.svelte-1571666{font-size:1.5em;text-align:center;line-height:30px}@media(min-width: 1281px){h1.svelte-1571666.svelte-1571666.svelte-1571666{font-size:35px;text-align:center}}#start.svelte-1571666.svelte-1571666.svelte-1571666{order:-1}@media(min-width: 1281px){#start.svelte-1571666.svelte-1571666.svelte-1571666{margin-top:30vh;width:60%;order:0}}#recipes.svelte-1571666.svelte-1571666.svelte-1571666{margin-top:0;display:grid;grid-template-columns:1fr;grid-gap:10px;grid-auto-rows:minmax(min-content, max-content);overflow-y:scroll;height:auto;-webkit-overflow-scrolling:touch;margin-bottom:env(safe-area-inset-bottom)}#recipes.modal-open.svelte-1571666.svelte-1571666.svelte-1571666{overflow:hidden}@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: landscape){#recipes.svelte-1571666.svelte-1571666.svelte-1571666{grid-template-columns:repeat(3, 1fr);padding:20px}}@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait){#recipes.svelte-1571666.svelte-1571666.svelte-1571666{grid-template-columns:repeat(2, 1fr)}}@media(min-width: 1281px){#recipes.svelte-1571666.svelte-1571666.svelte-1571666{width:calc(60% - 40px);grid-template-columns:repeat(3, 1fr);height:calc(100vh - 40px);padding:20px}}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQXBwLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxyXG4gIGltcG9ydCBDb21wb25lbnRJbmdyZWRpZW50cyBmcm9tIFwiLi9jb21wb25lbnRzL0luZ3JlZGllbnRzLnN2ZWx0ZVwiO1xyXG4gIGltcG9ydCBSYWRpbyBmcm9tIFwiLi9jb21wb25lbnRzL1JhZGlvLnN2ZWx0ZVwiO1xyXG4gIGltcG9ydCBDSW5wdXQgZnJvbSBcIi4vY29tcG9uZW50cy9DSW5wdXQuc3ZlbHRlXCI7XHJcbiAgaW1wb3J0IENoaXAgZnJvbSBcIi4vY29tcG9uZW50cy9DaGlwLnN2ZWx0ZVwiO1xyXG4gIGltcG9ydCBTcGlubmVyIGZyb20gXCIuL2NvbXBvbmVudHMvU3Bpbm5lci5zdmVsdGVcIjtcclxuICBpbXBvcnQgRm9vZENhcmQgZnJvbSBcIi4vY29tcG9uZW50cy9Gb29kQ2FyZC5zdmVsdGVcIjtcclxuICBpbXBvcnQgU2tlbGV0b25Gb29kQ2FyZCBmcm9tIFwiLi9jb21wb25lbnRzL1NrZWxldG9uRm9vZENhcmQuc3ZlbHRlXCI7XHJcbiAgaW1wb3J0IE1vZGFsIGZyb20gXCIuL2NvbXBvbmVudHMvTW9kYWwuc3ZlbHRlXCI7XHJcbiAgaW1wb3J0IEZhdm9yaXRlTGlzdCBmcm9tIFwiLi9jb21wb25lbnRzL0Zhdm9yaXRlc0xpc3Quc3ZlbHRlXCI7XHJcblxyXG4gIGltcG9ydCB7XHJcbiAgICBjdXN0b21JbmdyaWRpZW50cyxcclxuICAgIGN1c3RvbU1haW5JbmdyaWRpZW50cyxcclxuICAgIGZldGNoZWRSZWNlcGllcyxcclxuICB9IGZyb20gXCIuL3N0b3JlXCI7XHJcbiAgaW1wb3J0IG1vY2tEYXRhIGZyb20gXCIuLi9tb2NrRGF0YVwiO1xyXG4gIGlmIChcInNlcnZpY2VXb3JrZXJcIiBpbiBuYXZpZ2F0b3IpIHtcclxuICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKFwiL3NlcnZpY2Utd29ya2VyLmpzXCIpO1xyXG4gIH1cclxuICBjb25zdCBpc0luV2ViQXBwaU9TID0gd2luZG93Lm5hdmlnYXRvci5zdGFuZGFsb25lID09IHRydWU7XHJcbiAgaXNJbldlYkFwcGlPUyA/IChkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IFwic3RhbmRhbG9uZVwiKSA6IFwiXCI7XHJcbiAgbGV0IFNob3dGYXZvcml0ZUxpc3QgPSBmYWxzZTtcclxuICBsZXQgc2hvd01vZGFsID0gZmFsc2U7XHJcbiAgbGV0IGxvYWRpbmcgPSBmYWxzZTtcclxuICBsZXQgc2VhcmNoZWQgPSBmYWxzZTtcclxuICBsZXQgcmVjaXBlc1N0ZXBzTG9hZGluZyA9IHRydWU7XHJcbiAgbGV0IG1vZGFsUmVjaXBlID0gW107XHJcbiAgbGV0IGZldGNoZWRSZWNpcGVzID0gW107XHJcbiAgbGV0IHJlbW92ZWRTdHJpbmdBcnJheSA9IFtdO1xyXG4gIGxldCBpbnN0cnVjdGlvbnMgPSBbXTtcclxuICBsZXQgaHJlZiA9IFwiXCI7XHJcbiAgbGV0IHRpdGxlID0gXCJcIjtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0UmVjaXBlSWQoZXZlbnQpIHtcclxuICAgIGNvbnN0IGlkID0gZXZlbnQuZGV0YWlsLmlkO1xyXG4gICAgc2hvd01vZGFsID0gZXZlbnQuZGV0YWlsLnNob3dNb2RhbDtcclxuICAgIHJlbW92ZWRTdHJpbmdBcnJheSA9IGV2ZW50LmRldGFpbC5yZW1vdmVkU3RyaW5nQXJyYXk7XHJcbiAgICBocmVmID0gZXZlbnQuZGV0YWlsLmhyZWY7XHJcbiAgICB0aXRsZSA9IGV2ZW50LmRldGFpbC50aXRsZTtcclxuICAgIGdldFJlY2lwZXNTdGVwcyhocmVmKTtcclxuICAgIG1vZGFsUmVjaXBlID0ge1xyXG4gICAgICBpZDogZXZlbnQuZGV0YWlsLmlkLFxyXG4gICAgICB0aXRsZTogZXZlbnQuZGV0YWlsLnRpdGxlLFxyXG4gICAgICBocmVmOiBldmVudC5kZXRhaWwuaHJlZixcclxuICAgICAgcmVtb3ZlZFN0cmluZ0FycmF5OiBldmVudC5kZXRhaWwucmVtb3ZlZFN0cmluZ0FycmF5LFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGdldFJlY2lwZXNTdGVwcyA9IGFzeW5jIChocmVmKSA9PiB7XHJcbiAgICBzaG93TW9kYWwgPSB0cnVlO1xyXG4gICAgdmFyIHByb3h5VXJsID0gcHJvY2Vzcy5lbnYuUFJPWFlfVVJMLFxyXG4gICAgICB1cmwgPSBocmVmO1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmVjaXBlc1N0ZXBzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHByb3h5VXJsICsgdXJsKTtcclxuICAgICAgbGV0IGRhdGEgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgIHZhciBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XHJcbiAgICAgIHZhciBkb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKGRhdGEsIFwidGV4dC9odG1sXCIpO1xyXG4gICAgICBsZXQgbm9kZSA9IGRvYy5xdWVyeVNlbGVjdG9yKFwiLmMtcmVjaXBlX19pbnN0cnVjdGlvbnMtc3RlcHNcIik7XHJcbiAgICAgIGxldCB0ZXh0ID0gbm9kZS5maXJzdENoaWxkLm5leHRTaWJsaW5nLmRhdGFzZXQubW9kZWw7XHJcbiAgICAgIGxldCBwYXJzZVJlc3VsdCA9IEpTT04ucGFyc2UodGV4dCk7XHJcbiAgICAgIGluc3RydWN0aW9ucyA9IHBhcnNlUmVzdWx0LnNlY3Rpb25zWzBdLnN0ZXBzO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG4gICAgcmVjaXBlc1N0ZXBzTG9hZGluZyA9IGZhbHNlO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGFkZFRvRmF2b3JpdGVzID0gKCkgPT4ge1xyXG4gICAgdmFyIHJlcXVlc3QgPSBzZWxmLmluZGV4ZWREQi5vcGVuKFwiRkFWT1JJVEVTX0RCXCIsIDEpO1xyXG4gICAgY29uc3QgcHJvZHVjdCA9IG1vZGFsUmVjaXBlO1xyXG4gICAgcHJvZHVjdC5pbnN0cnVjdGlvbnMgPSBpbnN0cnVjdGlvbnM7XHJcbiAgICBjb25zb2xlLmxvZyhwcm9kdWN0KTtcclxuICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHZhciBwcm9kdWN0cyA9IFtcclxuICAgICAgICB7IGlkOiAxLCBuYW1lOiBcIlJlZCBNZW4gVC1TaGlydFwiLCBwcmljZTogXCIkMy45OVwiIH0sXHJcbiAgICAgICAgeyBpZDogMiwgbmFtZTogXCJQaW5rIFdvbWVuIFNob3J0c1wiLCBwcmljZTogXCIkNS45OVwiIH0sXHJcbiAgICAgICAgeyBpZDogMywgbmFtZTogXCJOaWtlIHdoaXRlIFNob2VzXCIsIHByaWNlOiBcIiQzMDBcIiB9LFxyXG4gICAgICBdO1xyXG4gICAgICB2YXIgZGIgPSBldmVudC50YXJnZXQucmVzdWx0O1xyXG5cclxuICAgICAgdmFyIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oXCJwcm9kdWN0c1wiLCBcInJlYWR3cml0ZVwiKTtcclxuXHJcbiAgICAgIC8vIGFkZCBzdWNjZXNzIGV2ZW50IGhhbmRsZWVyIGZvciB0cmFuc2FjdGlvblxyXG4gICAgICAvLyB5b3Ugc2hvdWxkIGFsc28gYWRkIG9uZXJyb3IsIG9uYWJvcnQgZXZlbnQgaGFuZGxlcnNcclxuICAgICAgdHJhbnNhY3Rpb24ub25zdWNjZXNzID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJbVHJhbnNhY3Rpb25dIEFMTCBET05FIVwiKTtcclxuICAgICAgfTtcclxuICAgICAgdmFyIHByb2R1Y3RzU3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShcInByb2R1Y3RzXCIpO1xyXG4gICAgICAvL0FkZCByZWNpcGUgdG8gZmF2b3JpdGVzXHJcblxyXG4gICAgICAvLyBwcm9kdWN0cy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9kdWN0KSB7XHJcbiAgICAgIHZhciBkYl9vcF9yZXEgPSBwcm9kdWN0c1N0b3JlLmFkZChwcm9kdWN0KTtcclxuICAgICAgZGJfb3BfcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldC5yZXN1bHQgPT0gcHJvZHVjdC5pZCk7IC8vIHRydWVcclxuICAgICAgfTtcclxuICAgICAgLy8gfSk7XHJcbiAgICB9O1xyXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiW29uZXJyb3JdXCIsIHJlcXVlc3QuZXJyb3IpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXF1ZXN0Lm9udXBncmFkZW5lZWRlZCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB2YXIgZGIgPSBldmVudC50YXJnZXQucmVzdWx0O1xyXG4gICAgICB2YXIgcHJvZHVjdHNTdG9yZSA9IGRiLmNyZWF0ZU9iamVjdFN0b3JlKFwicHJvZHVjdHNcIiwgeyBrZXlQYXRoOiBcImlkXCIgfSk7XHJcbiAgICB9O1xyXG4gIH07XHJcbjwvc2NyaXB0PlxyXG48bWFpbj5cclxuICA8Q29tcG9uZW50SW5ncmVkaWVudHNcclxuICAgIGJpbmQ6bG9hZGluZ1JlY2VwaWVzPVwie2xvYWRpbmd9XCJcclxuICAgIGJpbmQ6c2VhcmNoZWRSZWNlcGllcz1cIntzZWFyY2hlZH1cIlxyXG4gICAgb246b3BlbmZhdj1cInsoKSA9PiBTaG93RmF2b3JpdGVMaXN0ID0gdHJ1ZX1cIlxyXG4gID48L0NvbXBvbmVudEluZ3JlZGllbnRzPlxyXG4gIHsjaWYgIXNlYXJjaGVkfVxyXG4gIDxzZWN0aW9uIGlkPVwic3RhcnRcIj5cclxuICAgIDxoMT5Ww6RsaiB2aWxrZW4gdHlwIGF2IHLDpHR0IGR1IHZpbGwgbGFnYSBvY2ggbMOkZ2cgdGlsbCBpbmdyZWRpZW5zZXI8L2gxPlxyXG4gIDwvc2VjdGlvbj5cclxuICB7OmVsc2V9XHJcbiAgPHNlY3Rpb24gaWQ9XCJyZWNpcGVzXCIgY2xhc3M9XCJ7c2hvd01vZGFsID8gJ21vZGFsLW9wZW4nIDogJyd9XCI+XHJcbiAgICB7I2lmIGxvYWRpbmd9XHJcbiAgICA8U2tlbGV0b25Gb29kQ2FyZD48L1NrZWxldG9uRm9vZENhcmQ+XHJcbiAgICA8U2tlbGV0b25Gb29kQ2FyZD48L1NrZWxldG9uRm9vZENhcmQ+XHJcbiAgICA8U2tlbGV0b25Gb29kQ2FyZD48L1NrZWxldG9uRm9vZENhcmQ+XHJcbiAgICA8U2tlbGV0b25Gb29kQ2FyZD48L1NrZWxldG9uRm9vZENhcmQ+XHJcbiAgICA8U2tlbGV0b25Gb29kQ2FyZD48L1NrZWxldG9uRm9vZENhcmQ+XHJcbiAgICB7OmVsc2V9IHsjZWFjaCAkZmV0Y2hlZFJlY2VwaWVzIGFzIHtOYW1lLCBJbWFnZVVybCwgVXJsLCBJbmdyZWRpZW50cywgSWR9fVxyXG4gICAgPEZvb2RDYXJkXHJcbiAgICAgIHRpdGxlPVwie05hbWV9XCJcclxuICAgICAgdGh1bWJuYWlsPVwie0ltYWdlVXJsfVwiXHJcbiAgICAgIGhyZWY9XCJ7VXJsfVwiXHJcbiAgICAgIGluZ3JlZGllbnRzPVwie0luZ3JlZGllbnRzfVwiXHJcbiAgICAgIGlkPVwie0lkfVwiXHJcbiAgICAgIGluc3RydWN0aW9ucz1cIntpbnN0cnVjdGlvbnN9XCJcclxuICAgICAgb246cmVjaXBlSWQ9XCJ7Z2V0UmVjaXBlSWR9XCJcclxuICAgID48L0Zvb2RDYXJkPlxyXG4gICAgey9lYWNofSB7L2lmfSB7I2lmICFpc0luV2ViQXBwaU9TfVxyXG4gICAgPGRpdiBzdHlsZT1cImhlaWdodDogMTAwcHg7XCI+PC9kaXY+XHJcbiAgICB7L2lmfVxyXG4gIDwvc2VjdGlvbj5cclxuXHJcbiAgey9pZn0geyNpZiBzaG93TW9kYWx9XHJcbiAgPE1vZGFsIG9uOmNsb3NlPVwieygpID0+IHNob3dNb2RhbCA9IGZhbHNlfVwiPlxyXG4gICAgPGgzIGNsYXNzPVwicmVjaXBlLXRpdGxlIHtpc0luV2ViQXBwaU9TID8gJ3N0YW5kYWxvbmUnIDogJyd9XCI+e3RpdGxlfTwvaDM+XHJcbiAgICB7I2lmIGluc3RydWN0aW9ucy5sZW5ndGggPiAwfVxyXG4gICAgPGJ1dHRvbiBjbGFzcz1cImFkZHRvZmF2XCIgb246Y2xpY2s9XCJ7YWRkVG9GYXZvcml0ZXN9XCI+XHJcbiAgICAgIDxzdmdcclxuICAgICAgICBoZWlnaHQ9XCIyNVwiXHJcbiAgICAgICAgdmlld0JveD1cIjAgLTExIDUxMS45OTgxNyA1MTFcIlxyXG4gICAgICAgIHdpZHRoPVwiMjVcIlxyXG4gICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPHBhdGhcclxuICAgICAgICAgIGQ9XCJtNTEwLjY0MDYyNSAxODUuNTA3ODEyYy0zLjg3NS0xMS45MzM1OTMtMTUuNDI1NzgxLTIwLjEzMjgxMi0zMS42ODM1OTQtMjIuNDk2MDkzbC0xMzIuNTExNzE5LTE5LjI1NzgxMy01OS4yNjE3MTgtMTIwLjA3MDMxMmMtNy4yNjk1MzItMTQuNzM0Mzc1LTE4LjYzNjcxOS0yMy4xODM1OTQtMzEuMTgzNTk0LTIzLjE4MzU5NHMtMjMuOTE0MDYyIDguNDQ5MjE5LTMxLjE4NzUgMjMuMTgzNTk0bC01OS4yNTM5MDYgMTIwLjA3MDMxMi0xMzIuNTE5NTMyIDE5LjI1NzgxM2MtMTYuMjU3ODEyIDIuMzYzMjgxLTI3LjgwODU5MyAxMC41NjI1LTMxLjY4MzU5MyAyMi40OTYwOTMtMy44NzUgMTEuOTMzNTk0LjY0ODQzNyAyNS4zNTU0NjkgMTIuNDE0MDYyIDM2LjgyMDMxM2w5NS44OTA2MjUgOTMuNDY0ODQ0LTIyLjY0MDYyNSAxMzEuOTgwNDY5Yy0yLjg5NDUzMSAxNi44Nzg5MDYgMi4wMzkwNjMgMjYuOTk2MDkzIDYuNjg3NSAzMi41MDc4MTIgNS40NTcwMzEgNi40Njg3NSAxMy40MDYyNSAxMC4wMzEyNSAyMi4zOTA2MjUgMTAuMDMxMjUgNi43NjU2MjUgMCAxMy45NTcwMzItMS45NzY1NjIgMjEuMzc4OTA2LTUuODc4OTA2bDExOC41MjM0MzgtNjIuMzEyNSAxMTguNTI3MzQ0IDYyLjMxMjVjNy40MjE4NzUgMy45MDIzNDQgMTQuNjEzMjgxIDUuODc4OTA2IDIxLjM3NSA1Ljg4MjgxMmguMDAzOTA2YzguOTg0Mzc1IDAgMTYuOTM3NS0zLjU2NjQwNiAyMi4zOTA2MjUtMTAuMDM1MTU2IDQuNjQ4NDM3LTUuNTExNzE5IDkuNTgyMDMxLTE1LjYyODkwNiA2LjY4MzU5NC0zMi41MDc4MTJsLTIyLjYzMjgxMy0xMzEuOTgwNDY5IDk1Ljg4MjgxMy05My40NjA5MzhjMTEuNzY1NjI1LTExLjQ2ODc1IDE2LjI4OTA2Mi0yNC44OTA2MjUgMTIuNDEwMTU2LTM2LjgyNDIxOXptLTMzLjM0NzY1NiAxNS4zMzk4NDQtMTAxLjUzMTI1IDk4Ljk2ODc1Yy0zLjUzNTE1NyAzLjQ0NTMxMy01LjE0ODQzOCA4LjQxNDA2My00LjMxMjUgMTMuMjc3MzQ0bDIzLjk2NDg0MyAxMzkuNzUzOTA2Yy42OTkyMTkgNC4wNjY0MDYuMzk4NDM4IDYuMzc1LjEyMTA5NCA3LjQ1MzEyNS0xLjA3MDMxMi0uMDcwMzEyLTMuMzY3MTg3LS40ODQzNzUtNy4wNDY4NzUtMi40MTc5NjlsLTEyNS41MDc4MTItNjUuOTg0Mzc0Yy0yLjE4NzUtMS4xNDg0MzgtNC41ODIwMzEtMS43MjI2NTctNi45ODA0NjktMS43MjI2NTdzLTQuNzk2ODc1LjU3NDIxOS02Ljk4MDQ2OSAxLjcyMjY1N2wtMTI1LjUgNjUuOTgwNDY4Yy0zLjY3OTY4NyAxLjkzMzU5NC01Ljk4MDQ2OSAyLjM1MTU2My03LjA1MDc4MSAyLjQyMTg3NS0uMjczNDM4LTEuMDc4MTI1LS41NzgxMjUtMy4zODY3MTkuMTIxMDk0LTcuNDUzMTI1bDIzLjk3MjY1Ni0xMzkuNzVjLjgzMjAzMS00Ljg2NzE4Ny0uNzgxMjUtOS44MzU5MzctNC4zMTY0MDYtMTMuMjc3MzQ0bC0xMDEuNTM1MTU2LTk4Ljk3MjY1NmMtMi45NTMxMjYtMi44Nzg5MDYtNC4wNjY0MDctNC45MjE4NzUtNC40ODA0NjktNS45NTcwMzEuOTQxNDA2LS41OTM3NSAzLjA0Mjk2OS0xLjU5Mzc1IDcuMTI1LTIuMTg3NWwxNDAuMzI0MjE5LTIwLjM5MDYyNWM0Ljg4NjcxOC0uNzEwOTM4IDkuMTA5Mzc0LTMuNzgxMjUgMTEuMjkyOTY4LTguMjA3MDMxbDYyLjc0NjA5NC0xMjcuMTQ0NTMxYzEuODI4MTI1LTMuNjk5MjE5IDMuNDI1NzgxLTUuMzg2NzE5IDQuMjg1MTU2LTYuMTAxNTYzLjg1NTQ2OS43MTQ4NDQgMi40NTcwMzIgMi40MDIzNDQgNC4yODEyNSA2LjEwMTU2M2w2Mi43NSAxMjcuMTQ0NTMxYzIuMTg3NSA0LjQyNTc4MSA2LjQxMDE1NiA3LjQ5NjA5MyAxMS4yOTY4NzUgOC4yMDcwMzFsMTQwLjMxMjUgMjAuMzkwNjI1YzQuMDg1OTM4LjU5Mzc1IDYuMTgzNTk0IDEuNTkzNzUgNy4xMjUgMi4xODc1LS40MTQwNjIgMS4wMzEyNS0xLjUyMzQzNyAzLjA3ODEyNS00LjQ3NjU2MiA1Ljk1NzAzMXptMCAwXCJcclxuICAgICAgICAvPlxyXG4gICAgICA8L3N2Zz5cclxuICAgIDwvYnV0dG9uPlxyXG4gICAgey9pZn1cclxuICAgIDx1bCBjbGFzcz1cImluZ3JlZGllbnRzXCI+XHJcbiAgICAgIHsjZWFjaCByZW1vdmVkU3RyaW5nQXJyYXkgYXMge05hbWUsIEFtb3VudCwgU2VsZWN0ZWR9fVxyXG4gICAgICA8bGkgY2xhc3M9XCJ7U2VsZWN0ZWQgPyAnaGFzLWluZ3JpZGllbnQnIDogJycgfVwiPlxyXG4gICAgICAgIDxzcGFuPntOYW1lfTwvc3Bhbj5cclxuICAgICAgICA8c3Bhbj57QW1vdW50fTwvc3Bhbj5cclxuICAgICAgPC9saT5cclxuICAgICAgey9lYWNofVxyXG4gICAgPC91bD5cclxuICAgIHsjaWYgcmVjaXBlc1N0ZXBzTG9hZGluZ31cclxuICAgIDxoMyBjbGFzcz1cImxvYWRpbmctdGl0bGVcIiBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIj5cclxuICAgICAgTGFkZGFyIHJlY2VwdCBzdGVnLi4uXHJcbiAgICA8L2gzPlxyXG4gICAgPFNwaW5uZXI+PC9TcGlubmVyPlxyXG4gICAgezplbHNlfVxyXG4gICAgPGgzIGNsYXNzPVwiaW5zdHJ1Y3Rpb25zLXRpdGxlXCIgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0O1wiPkfDtnIgc8OlIGjDpHI8L2gzPlxyXG4gICAgPG9sIGNsYXNzPVwiaW5zdHJ1Y3Rpb25zXCI+XHJcbiAgICAgIHsjZWFjaCBpbnN0cnVjdGlvbnMgYXMge3RleHR9fVxyXG4gICAgICA8bGk+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJpbnN0cnVjdGlvbnNcIj5cclxuICAgICAgICAgIHt0ZXh0fVxyXG4gICAgICAgIDwvc3Bhbj5cclxuICAgICAgPC9saT5cclxuICAgICAgey9lYWNofVxyXG4gICAgPC9vbD5cclxuICAgIHsvaWZ9XHJcbiAgPC9Nb2RhbD5cclxuICB7L2lmfSB7I2lmIFNob3dGYXZvcml0ZUxpc3R9XHJcbiAgPE1vZGFsIG9uOmNsb3NlPVwieygpID0+IFNob3dGYXZvcml0ZUxpc3QgPSBmYWxzZX1cIiBmYXZvcml0ZU1vZGFsPlxyXG4gICAgPEZhdm9yaXRlTGlzdD48L0Zhdm9yaXRlTGlzdD5cclxuICA8L01vZGFsPlxyXG4gIHsvaWZ9XHJcbjwvbWFpbj5cclxuXHJcbjxzdHlsZT5cclxuICAuYWRkdG9mYXYge1xyXG4gICAgYm9yZGVyOiBub25lO1xyXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICByaWdodDogNXB4O1xyXG4gICAgdG9wOiA1cHg7XHJcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xyXG4gICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gIH1cclxuICAuaGFzLWluZ3JpZGllbnQgPiBzcGFuIHtcclxuICAgIHRleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO1xyXG4gIH1cclxuICAuaW5zdHJ1Y3Rpb25zLXRpdGxlIHtcclxuICAgIGNvbG9yOiB2YXIoLS1pbnN0cnVjdGlvbnMtY29sb3IpO1xyXG4gIH1cclxuICAubG9hZGluZy10aXRsZSB7XHJcbiAgICBjb2xvcjogdmFyKC0taW5zdHJ1Y3Rpb25zLWNvbG9yKTtcclxuICB9XHJcbiAgLnJlY2lwZS10aXRsZSB7XHJcbiAgICBjb2xvcjogdmFyKC0taW5zdHJ1Y3Rpb25zLWNvbG9yKTtcclxuICB9XHJcbiAgaDMuc3RhbmRhbG9uZSB7XHJcbiAgICBtYXJnaW4tdG9wOiA0NXB4O1xyXG4gIH1cclxuXHJcbiAgLmluc3RydWN0aW9ucyB7XHJcbiAgICBtYXJnaW46IDA7XHJcbiAgICB0ZXh0LWluZGVudDogLTIwcHg7XHJcbiAgICBsaXN0LXN0eWxlLXR5cGU6IG5vbmU7XHJcbiAgICBjb3VudGVyLWluY3JlbWVudDogaXRlbTtcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgfVxyXG4gIC5pbnN0cnVjdGlvbnMgbGk6YmVmb3JlIHtcclxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcclxuICAgIHdpZHRoOiAxZW07XHJcbiAgICBwYWRkaW5nLXJpZ2h0OiAwLjVlbTtcclxuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xyXG4gICAgdGV4dC1hbGlnbjogcmlnaHQ7XHJcbiAgICBjb250ZW50OiBjb3VudGVyKGl0ZW0pIFwiLlwiO1xyXG4gICAgY29sb3I6IGluaGVyaXQ7XHJcbiAgfVxyXG5cclxuICAuaW5zdHJ1Y3Rpb25zIGxpIHtcclxuICAgIG1hcmdpbi10b3A6IDEwcHg7XHJcbiAgICBjb2xvcjogdmFyKC0taW5zdHJ1Y3Rpb25zLWNvbG9yKTtcclxuICB9XHJcblxyXG4gIC5pbnN0cnVjdGlvbnMgbGkgc3BhbiB7XHJcbiAgICBmb250LXNpemU6IDE4cHg7XHJcbiAgICBsaW5lLWhlaWdodDogMS41O1xyXG4gICAgY29sb3I6IHZhcigtLWluc3RydWN0aW9ucy1jb2xvcik7XHJcbiAgfVxyXG4gIG9sLFxyXG4gIHVsIHtcclxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XHJcbiAgICBtYXJnaW46IDA7XHJcbiAgICBwYWRkaW5nOiAwO1xyXG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcclxuICB9XHJcbiAgb2wge1xyXG4gICAgbWFyZ2luLWxlZnQ6IDIwcHggIWltcG9ydGFudDtcclxuICAgIG1hcmdpbi1ib3R0b206IDIwcHggIWltcG9ydGFudDtcclxuICB9XHJcbiAgLmluZ3JlZGllbnRzID4gbGkge1xyXG4gICAgcGFkZGluZzogMC41cmVtO1xyXG4gICAgdGV4dC1hbGlnbjogbGVmdDtcclxuICB9XHJcbiAgLmluZ3JlZGllbnRzID4gbGk6bnRoLWNoaWxkKG9kZCkge1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3Itb2RkKTtcclxuICAgIGNvbG9yOiB2YXIoLS1pbnN0cnVjdGlvbnMtY29sb3IpO1xyXG4gIH1cclxuICAuaW5ncmVkaWVudHMgPiBsaTpudGgtY2hpbGQoZXZlbikge1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItZXZlbik7XHJcbiAgfVxyXG5cclxuICBtYWluIHtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAgaGVpZ2h0OiAxMDB2aDtcclxuICAgIHBhZGRpbmc6IDAgMTVweDtcclxuICB9XHJcbiAgQG1lZGlhIChtaW4td2lkdGg6IDEyODFweCkge1xyXG4gICAgbWFpbiB7XHJcbiAgICAgIHBhZGRpbmc6IDA7XHJcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBoMSB7XHJcbiAgICBmb250LXNpemU6IDEuNWVtO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgbGluZS1oZWlnaHQ6IDMwcHg7XHJcbiAgfVxyXG5cclxuICBAbWVkaWEgKG1pbi13aWR0aDogMTI4MXB4KSB7XHJcbiAgICBoMSB7XHJcbiAgICAgIGZvbnQtc2l6ZTogMzVweDtcclxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgfVxyXG4gIH1cclxuICAjc3RhcnQge1xyXG4gICAgb3JkZXI6IC0xO1xyXG4gIH1cclxuICBAbWVkaWEgKG1pbi13aWR0aDogMTI4MXB4KSB7XHJcbiAgICAjc3RhcnQge1xyXG4gICAgICBtYXJnaW4tdG9wOiAzMHZoO1xyXG4gICAgICB3aWR0aDogNjAlO1xyXG4gICAgICBvcmRlcjogMDtcclxuICAgIH1cclxuICB9XHJcbiAgI3JlY2lwZXMge1xyXG4gICAgbWFyZ2luLXRvcDogMDtcclxuICAgIGRpc3BsYXk6IGdyaWQ7XHJcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjtcclxuICAgIGdyaWQtZ2FwOiAxMHB4O1xyXG4gICAgZ3JpZC1hdXRvLXJvd3M6IG1pbm1heChtaW4tY29udGVudCwgbWF4LWNvbnRlbnQpO1xyXG4gICAgb3ZlcmZsb3cteTogc2Nyb2xsO1xyXG4gICAgaGVpZ2h0OiBhdXRvO1xyXG4gICAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xyXG4gICAgbWFyZ2luLWJvdHRvbTogZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pO1xyXG4gIH1cclxuICAjcmVjaXBlcy5tb2RhbC1vcGVuIHtcclxuICAgIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgfVxyXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2Utd2lkdGg6IDc2OHB4KSBhbmQgKG1heC1kZXZpY2Utd2lkdGg6IDEwMjRweCkgYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKSB7XHJcbiAgICAjcmVjaXBlcyB7XHJcbiAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsIDFmcik7XHJcbiAgICAgIHBhZGRpbmc6IDIwcHg7XHJcbiAgICB9XHJcbiAgfVxyXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2Utd2lkdGg6IDc2OHB4KSBhbmQgKG1heC1kZXZpY2Utd2lkdGg6IDEwMjRweCkgYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpIHtcclxuICAgICNyZWNpcGVzIHtcclxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgMWZyKTtcclxuICAgIH1cclxuICB9XHJcbiAgQG1lZGlhIChtaW4td2lkdGg6IDEyODFweCkge1xyXG4gICAgI3JlY2lwZXMge1xyXG4gICAgICB3aWR0aDogY2FsYyg2MCUgLSA0MHB4KTtcclxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTtcclxuICAgICAgaGVpZ2h0OiBjYWxjKDEwMHZoIC0gNDBweCk7XHJcbiAgICAgIHBhZGRpbmc6IDIwcHg7XHJcbiAgICB9XHJcbiAgfVxyXG48L3N0eWxlPlxyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaU1FLFNBQVMsNkNBQUMsQ0FBQyxBQUNULE1BQU0sQ0FBRSxJQUFJLENBQ1osVUFBVSxDQUFFLFdBQVcsQ0FDdkIsUUFBUSxDQUFFLFFBQVEsQ0FDbEIsS0FBSyxDQUFFLEdBQUcsQ0FDVixHQUFHLENBQUUsR0FBRyxDQUNSLGFBQWEsQ0FBRSxDQUFDLENBQ2hCLE1BQU0sQ0FBRSxPQUFPLEFBQ2pCLENBQUMsQUFDRCw2Q0FBZSxDQUFHLElBQUksOEJBQUMsQ0FBQyxBQUN0QixlQUFlLENBQUUsWUFBWSxBQUMvQixDQUFDLEFBQ0QsbUJBQW1CLDZDQUFDLENBQUMsQUFDbkIsS0FBSyxDQUFFLElBQUksb0JBQW9CLENBQUMsQUFDbEMsQ0FBQyxBQUNELGNBQWMsNkNBQUMsQ0FBQyxBQUNkLEtBQUssQ0FBRSxJQUFJLG9CQUFvQixDQUFDLEFBQ2xDLENBQUMsQUFDRCxhQUFhLDZDQUFDLENBQUMsQUFDYixLQUFLLENBQUUsSUFBSSxvQkFBb0IsQ0FBQyxBQUNsQyxDQUFDLEFBQ0QsRUFBRSxXQUFXLDZDQUFDLENBQUMsQUFDYixVQUFVLENBQUUsSUFBSSxBQUNsQixDQUFDLEFBRUQsYUFBYSw2Q0FBQyxDQUFDLEFBQ2IsTUFBTSxDQUFFLENBQUMsQ0FDVCxXQUFXLENBQUUsS0FBSyxDQUNsQixlQUFlLENBQUUsSUFBSSxDQUNyQixpQkFBaUIsQ0FBRSxJQUFJLENBQ3ZCLFVBQVUsQ0FBRSxJQUFJLEFBQ2xCLENBQUMsQUFDRCwyQ0FBYSxDQUFDLGdDQUFFLE9BQU8sQUFBQyxDQUFDLEFBQ3ZCLE9BQU8sQ0FBRSxZQUFZLENBQ3JCLEtBQUssQ0FBRSxHQUFHLENBQ1YsYUFBYSxDQUFFLEtBQUssQ0FDcEIsV0FBVyxDQUFFLElBQUksQ0FDakIsVUFBVSxDQUFFLEtBQUssQ0FDakIsT0FBTyxDQUFFLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUMxQixLQUFLLENBQUUsT0FBTyxBQUNoQixDQUFDLEFBRUQsMkNBQWEsQ0FBQyxFQUFFLDhCQUFDLENBQUMsQUFDaEIsVUFBVSxDQUFFLElBQUksQ0FDaEIsS0FBSyxDQUFFLElBQUksb0JBQW9CLENBQUMsQUFDbEMsQ0FBQyxBQUVELDRCQUFhLENBQUMsaUJBQUUsQ0FBQyxJQUFJLGVBQUMsQ0FBQyxBQUNyQixTQUFTLENBQUUsSUFBSSxDQUNmLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLEtBQUssQ0FBRSxJQUFJLG9CQUFvQixDQUFDLEFBQ2xDLENBQUMsQUFDRCwrQ0FBRSxDQUNGLEVBQUUsNkNBQUMsQ0FBQyxBQUNGLFVBQVUsQ0FBRSxJQUFJLENBQ2hCLE1BQU0sQ0FBRSxDQUFDLENBQ1QsT0FBTyxDQUFFLENBQUMsQ0FDVixhQUFhLENBQUUsSUFBSSxBQUNyQixDQUFDLEFBQ0QsRUFBRSw2Q0FBQyxDQUFDLEFBQ0YsV0FBVyxDQUFFLElBQUksQ0FBQyxVQUFVLENBQzVCLGFBQWEsQ0FBRSxJQUFJLENBQUMsVUFBVSxBQUNoQyxDQUFDLEFBQ0QsMENBQVksQ0FBRyxFQUFFLDhCQUFDLENBQUMsQUFDakIsT0FBTyxDQUFFLE1BQU0sQ0FDZixVQUFVLENBQUUsSUFBSSxBQUNsQixDQUFDLEFBQ0QsMENBQVksQ0FBRyxnQ0FBRSxXQUFXLEdBQUcsQ0FBQyxBQUFDLENBQUMsQUFDaEMsZ0JBQWdCLENBQUUsSUFBSSxXQUFXLENBQUMsQ0FDbEMsS0FBSyxDQUFFLElBQUksb0JBQW9CLENBQUMsQUFDbEMsQ0FBQyxBQUNELDBDQUFZLENBQUcsZ0NBQUUsV0FBVyxJQUFJLENBQUMsQUFBQyxDQUFDLEFBQ2pDLGdCQUFnQixDQUFFLElBQUksWUFBWSxDQUFDLEFBQ3JDLENBQUMsQUFFRCxJQUFJLDZDQUFDLENBQUMsQUFDSixPQUFPLENBQUUsSUFBSSxDQUNiLGNBQWMsQ0FBRSxNQUFNLENBQ3RCLE1BQU0sQ0FBRSxLQUFLLENBQ2IsT0FBTyxDQUFFLENBQUMsQ0FBQyxJQUFJLEFBQ2pCLENBQUMsQUFDRCxNQUFNLEFBQUMsWUFBWSxNQUFNLENBQUMsQUFBQyxDQUFDLEFBQzFCLElBQUksNkNBQUMsQ0FBQyxBQUNKLE9BQU8sQ0FBRSxDQUFDLENBQ1YsY0FBYyxDQUFFLEdBQUcsQUFDckIsQ0FBQyxBQUNILENBQUMsQUFFRCxFQUFFLDZDQUFDLENBQUMsQUFDRixTQUFTLENBQUUsS0FBSyxDQUNoQixVQUFVLENBQUUsTUFBTSxDQUNsQixXQUFXLENBQUUsSUFBSSxBQUNuQixDQUFDLEFBRUQsTUFBTSxBQUFDLFlBQVksTUFBTSxDQUFDLEFBQUMsQ0FBQyxBQUMxQixFQUFFLDZDQUFDLENBQUMsQUFDRixTQUFTLENBQUUsSUFBSSxDQUNmLFVBQVUsQ0FBRSxNQUFNLEFBQ3BCLENBQUMsQUFDSCxDQUFDLEFBQ0QsTUFBTSw2Q0FBQyxDQUFDLEFBQ04sS0FBSyxDQUFFLEVBQUUsQUFDWCxDQUFDLEFBQ0QsTUFBTSxBQUFDLFlBQVksTUFBTSxDQUFDLEFBQUMsQ0FBQyxBQUMxQixNQUFNLDZDQUFDLENBQUMsQUFDTixVQUFVLENBQUUsSUFBSSxDQUNoQixLQUFLLENBQUUsR0FBRyxDQUNWLEtBQUssQ0FBRSxDQUFDLEFBQ1YsQ0FBQyxBQUNILENBQUMsQUFDRCxRQUFRLDZDQUFDLENBQUMsQUFDUixVQUFVLENBQUUsQ0FBQyxDQUNiLE9BQU8sQ0FBRSxJQUFJLENBQ2IscUJBQXFCLENBQUUsR0FBRyxDQUMxQixRQUFRLENBQUUsSUFBSSxDQUNkLGNBQWMsQ0FBRSxPQUFPLFdBQVcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUNoRCxVQUFVLENBQUUsTUFBTSxDQUNsQixNQUFNLENBQUUsSUFBSSxDQUNaLDBCQUEwQixDQUFFLEtBQUssQ0FDakMsYUFBYSxDQUFFLElBQUksc0JBQXNCLENBQUMsQUFDNUMsQ0FBQyxBQUNELFFBQVEsV0FBVyw2Q0FBQyxDQUFDLEFBQ25CLFFBQVEsQ0FBRSxNQUFNLEFBQ2xCLENBQUMsQUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLFNBQVMsQ0FBQyxBQUFDLENBQUMsQUFDNUcsUUFBUSw2Q0FBQyxDQUFDLEFBQ1IscUJBQXFCLENBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDckMsT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBQ0gsQ0FBQyxBQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsUUFBUSxDQUFDLEFBQUMsQ0FBQyxBQUMzRyxRQUFRLDZDQUFDLENBQUMsQUFDUixxQkFBcUIsQ0FBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUN2QyxDQUFDLEFBQ0gsQ0FBQyxBQUNELE1BQU0sQUFBQyxZQUFZLE1BQU0sQ0FBQyxBQUFDLENBQUMsQUFDMUIsUUFBUSw2Q0FBQyxDQUFDLEFBQ1IsS0FBSyxDQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDdkIscUJBQXFCLENBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDckMsTUFBTSxDQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDMUIsT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBQ0gsQ0FBQyJ9 */";
    	append_dev(document_1$1.head, style);
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i].text;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i].Name;
    	child_ctx[25] = list[i].Amount;
    	child_ctx[26] = list[i].Selected;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i].Name;
    	child_ctx[29] = list[i].ImageUrl;
    	child_ctx[30] = list[i].Url;
    	child_ctx[31] = list[i].Ingredients;
    	child_ctx[32] = list[i].Id;
    	return child_ctx;
    }

    // (120:2) {:else}
    function create_else_block_1(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let section_class_value;
    	let current;
    	const if_block_creators = [create_if_block_6, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*loading*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = !/*isInWebAppiOS*/ ctx[9] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(section, "id", "recipes");
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(/*showModal*/ ctx[1] ? "modal-open" : "") + " svelte-1571666"));
    			add_location(section, file$9, 120, 2, 4088);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			append_dev(section, t);
    			if (if_block1) if_block1.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(section, t);
    			}

    			if (!current || dirty[0] & /*showModal*/ 2 && section_class_value !== (section_class_value = "" + (null_to_empty(/*showModal*/ ctx[1] ? "modal-open" : "") + " svelte-1571666"))) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(120:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (116:2) {#if !searched}
    function create_if_block_4(ctx) {
    	let section;
    	let h1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Välj vilken typ av rätt du vill laga och lägg till ingredienser";
    			attr_dev(h1, "class", "svelte-1571666");
    			add_location(h1, file$9, 117, 4, 3987);
    			attr_dev(section, "id", "start");
    			attr_dev(section, "class", "svelte-1571666");
    			add_location(section, file$9, 116, 2, 3961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(116:2) {#if !searched}",
    		ctx
    	});

    	return block;
    }

    // (128:4) {:else}
    function create_else_block_2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_2 = /*$fetchedRecepies*/ ctx[8];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fetchedRecepies, instructions, getRecipeId*/ 1344) {
    				each_value_2 = /*$fetchedRecepies*/ ctx[8];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(128:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#if loading}
    function create_if_block_6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	const skeletonfoodcard0 = new SkeletonFoodCard({ $$inline: true });
    	const skeletonfoodcard1 = new SkeletonFoodCard({ $$inline: true });
    	const skeletonfoodcard2 = new SkeletonFoodCard({ $$inline: true });
    	const skeletonfoodcard3 = new SkeletonFoodCard({ $$inline: true });
    	const skeletonfoodcard4 = new SkeletonFoodCard({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(skeletonfoodcard0.$$.fragment);
    			t0 = space();
    			create_component(skeletonfoodcard1.$$.fragment);
    			t1 = space();
    			create_component(skeletonfoodcard2.$$.fragment);
    			t2 = space();
    			create_component(skeletonfoodcard3.$$.fragment);
    			t3 = space();
    			create_component(skeletonfoodcard4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skeletonfoodcard0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(skeletonfoodcard1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(skeletonfoodcard2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(skeletonfoodcard3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(skeletonfoodcard4, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skeletonfoodcard0.$$.fragment, local);
    			transition_in(skeletonfoodcard1.$$.fragment, local);
    			transition_in(skeletonfoodcard2.$$.fragment, local);
    			transition_in(skeletonfoodcard3.$$.fragment, local);
    			transition_in(skeletonfoodcard4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skeletonfoodcard0.$$.fragment, local);
    			transition_out(skeletonfoodcard1.$$.fragment, local);
    			transition_out(skeletonfoodcard2.$$.fragment, local);
    			transition_out(skeletonfoodcard3.$$.fragment, local);
    			transition_out(skeletonfoodcard4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skeletonfoodcard0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(skeletonfoodcard1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(skeletonfoodcard2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(skeletonfoodcard3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(skeletonfoodcard4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(122:4) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (128:12) {#each $fetchedRecepies as {Name, ImageUrl, Url, Ingredients, Id}}
    function create_each_block_2$1(ctx) {
    	let current;

    	const foodcard = new FoodCard({
    			props: {
    				title: /*Name*/ ctx[24],
    				thumbnail: /*ImageUrl*/ ctx[29],
    				href: /*Url*/ ctx[30],
    				ingredients: /*Ingredients*/ ctx[31],
    				id: /*Id*/ ctx[32],
    				instructions: /*instructions*/ ctx[6]
    			},
    			$$inline: true
    		});

    	foodcard.$on("recipeId", /*getRecipeId*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(foodcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(foodcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const foodcard_changes = {};
    			if (dirty[0] & /*$fetchedRecepies*/ 256) foodcard_changes.title = /*Name*/ ctx[24];
    			if (dirty[0] & /*$fetchedRecepies*/ 256) foodcard_changes.thumbnail = /*ImageUrl*/ ctx[29];
    			if (dirty[0] & /*$fetchedRecepies*/ 256) foodcard_changes.href = /*Url*/ ctx[30];
    			if (dirty[0] & /*$fetchedRecepies*/ 256) foodcard_changes.ingredients = /*Ingredients*/ ctx[31];
    			if (dirty[0] & /*$fetchedRecepies*/ 256) foodcard_changes.id = /*Id*/ ctx[32];
    			if (dirty[0] & /*instructions*/ 64) foodcard_changes.instructions = /*instructions*/ ctx[6];
    			foodcard.$set(foodcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(foodcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(foodcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(foodcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(128:12) {#each $fetchedRecepies as {Name, ImageUrl, Url, Ingredients, Id}}",
    		ctx
    	});

    	return block;
    }

    // (138:18) {#if !isInWebAppiOS}
    function create_if_block_5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "100px");
    			add_location(div, file$9, 138, 4, 4739);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(138:18) {#if !isInWebAppiOS}",
    		ctx
    	});

    	return block;
    }

    // (143:8) {#if showModal}
    function create_if_block_1$1(ctx) {
    	let current;

    	const modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[0] & /*recipesStepsLoading, instructions, removedStringArray, title*/ 240 | dirty[1] & /*$$scope*/ 16) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(143:8) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    // (146:4) {#if instructions.length > 0}
    function create_if_block_3(ctx) {
    	let button;
    	let svg;
    	let path;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "m510.640625 185.507812c-3.875-11.933593-15.425781-20.132812-31.683594-22.496093l-132.511719-19.257813-59.261718-120.070312c-7.269532-14.734375-18.636719-23.183594-31.183594-23.183594s-23.914062 8.449219-31.1875 23.183594l-59.253906 120.070312-132.519532 19.257813c-16.257812 2.363281-27.808593 10.5625-31.683593 22.496093-3.875 11.933594.648437 25.355469 12.414062 36.820313l95.890625 93.464844-22.640625 131.980469c-2.894531 16.878906 2.039063 26.996093 6.6875 32.507812 5.457031 6.46875 13.40625 10.03125 22.390625 10.03125 6.765625 0 13.957032-1.976562 21.378906-5.878906l118.523438-62.3125 118.527344 62.3125c7.421875 3.902344 14.613281 5.878906 21.375 5.882812h.003906c8.984375 0 16.9375-3.566406 22.390625-10.035156 4.648437-5.511719 9.582031-15.628906 6.683594-32.507812l-22.632813-131.980469 95.882813-93.460938c11.765625-11.46875 16.289062-24.890625 12.410156-36.824219zm-33.347656 15.339844-101.53125 98.96875c-3.535157 3.445313-5.148438 8.414063-4.3125 13.277344l23.964843 139.753906c.699219 4.066406.398438 6.375.121094 7.453125-1.070312-.070312-3.367187-.484375-7.046875-2.417969l-125.507812-65.984374c-2.1875-1.148438-4.582031-1.722657-6.980469-1.722657s-4.796875.574219-6.980469 1.722657l-125.5 65.980468c-3.679687 1.933594-5.980469 2.351563-7.050781 2.421875-.273438-1.078125-.578125-3.386719.121094-7.453125l23.972656-139.75c.832031-4.867187-.78125-9.835937-4.316406-13.277344l-101.535156-98.972656c-2.953126-2.878906-4.066407-4.921875-4.480469-5.957031.941406-.59375 3.042969-1.59375 7.125-2.1875l140.324219-20.390625c4.886718-.710938 9.109374-3.78125 11.292968-8.207031l62.746094-127.144531c1.828125-3.699219 3.425781-5.386719 4.285156-6.101563.855469.714844 2.457032 2.402344 4.28125 6.101563l62.75 127.144531c2.1875 4.425781 6.410156 7.496093 11.296875 8.207031l140.3125 20.390625c4.085938.59375 6.183594 1.59375 7.125 2.1875-.414062 1.03125-1.523437 3.078125-4.476562 5.957031zm0 0");
    			add_location(path, file$9, 153, 8, 5201);
    			attr_dev(svg, "height", "25");
    			attr_dev(svg, "viewBox", "0 -11 511.99817 511");
    			attr_dev(svg, "width", "25");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$9, 147, 6, 5054);
    			attr_dev(button, "class", "addtofav svelte-1571666");
    			add_location(button, file$9, 146, 4, 4993);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*addToFavorites*/ ctx[11], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(146:4) {#if instructions.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (161:6) {#each removedStringArray as {Name, Amount, Selected}}
    function create_each_block_1$2(ctx) {
    	let li;
    	let span0;
    	let t0_value = /*Name*/ ctx[24] + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*Amount*/ ctx[25] + "";
    	let t2;
    	let t3;
    	let li_class_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span0, "class", "svelte-1571666");
    			add_location(span0, file$9, 162, 8, 7335);
    			attr_dev(span1, "class", "svelte-1571666");
    			add_location(span1, file$9, 163, 8, 7364);
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*Selected*/ ctx[26] ? "has-ingridient" : "") + " svelte-1571666"));
    			add_location(li, file$9, 161, 6, 7277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span0);
    			append_dev(span0, t0);
    			append_dev(li, t1);
    			append_dev(li, span1);
    			append_dev(span1, t2);
    			append_dev(li, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*removedStringArray*/ 32 && t0_value !== (t0_value = /*Name*/ ctx[24] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*removedStringArray*/ 32 && t2_value !== (t2_value = /*Amount*/ ctx[25] + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*removedStringArray*/ 32 && li_class_value !== (li_class_value = "" + (null_to_empty(/*Selected*/ ctx[26] ? "has-ingridient" : "") + " svelte-1571666"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(161:6) {#each removedStringArray as {Name, Amount, Selected}}",
    		ctx
    	});

    	return block;
    }

    // (173:4) {:else}
    function create_else_block(ctx) {
    	let h3;
    	let t1;
    	let ol;
    	let each_value = /*instructions*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Gör så här";
    			t1 = space();
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "instructions-title svelte-1571666");
    			set_style(h3, "text-align", "left");
    			add_location(h3, file$9, 173, 4, 7599);
    			attr_dev(ol, "class", "instructions svelte-1571666");
    			add_location(ol, file$9, 174, 4, 7677);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ol, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*instructions*/ 64) {
    				each_value = /*instructions*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ol, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ol);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(173:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (168:4) {#if recipesStepsLoading}
    function create_if_block_2$1(ctx) {
    	let h3;
    	let t1;
    	let current;
    	const spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Laddar recept steg...";
    			t1 = space();
    			create_component(spinner.$$.fragment);
    			attr_dev(h3, "class", "loading-title svelte-1571666");
    			set_style(h3, "text-align", "center");
    			add_location(h3, file$9, 168, 4, 7461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(168:4) {#if recipesStepsLoading}",
    		ctx
    	});

    	return block;
    }

    // (176:6) {#each instructions as {text}}
    function create_each_block$4(ctx) {
    	let li;
    	let span;
    	let t0_value = /*text*/ ctx[21] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "instructions svelte-1571666");
    			add_location(span, file$9, 177, 8, 7762);
    			attr_dev(li, "class", "svelte-1571666");
    			add_location(li, file$9, 176, 6, 7748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span);
    			append_dev(span, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*instructions*/ 64 && t0_value !== (t0_value = /*text*/ ctx[21] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(176:6) {#each instructions as {text}}",
    		ctx
    	});

    	return block;
    }

    // (144:2) <Modal on:close="{() => showModal = false}">
    function create_default_slot_1(ctx) {
    	let h3;
    	let t0;
    	let h3_class_value;
    	let t1;
    	let t2;
    	let ul;
    	let t3;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*instructions*/ ctx[6].length > 0 && create_if_block_3(ctx);
    	let each_value_1 = /*removedStringArray*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const if_block_creators = [create_if_block_2$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*recipesStepsLoading*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[7]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(h3, "class", h3_class_value = "recipe-title " + (/*isInWebAppiOS*/ ctx[9] ? "standalone" : "") + " svelte-1571666");
    			add_location(h3, file$9, 144, 4, 4879);
    			attr_dev(ul, "class", "ingredients svelte-1571666");
    			add_location(ul, file$9, 159, 4, 7183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t3, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*title*/ 128) set_data_dev(t0, /*title*/ ctx[7]);

    			if (/*instructions*/ ctx[6].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*removedStringArray*/ 32) {
    				each_value_1 = /*removedStringArray*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(144:2) <Modal on:close=\\\"{() => showModal = false}\\\">",
    		ctx
    	});

    	return block;
    }

    // (186:8) {#if ShowFavoriteList}
    function create_if_block$3(ctx) {
    	let current;

    	const modal = new Modal({
    			props: {
    				favoriteModal: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler_1*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[1] & /*$$scope*/ 16) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(186:8) {#if ShowFavoriteList}",
    		ctx
    	});

    	return block;
    }

    // (187:2) <Modal on:close="{() => ShowFavoriteList = false}" favoriteModal>
    function create_default_slot(ctx) {
    	let current;
    	const favoritelist = new FavoritesList({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(favoritelist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(favoritelist, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(favoritelist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(favoritelist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(favoritelist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(187:2) <Modal on:close=\\\"{() => ShowFavoriteList = false}\\\" favoriteModal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let updating_loadingRecepies;
    	let updating_searchedRecepies;
    	let t0;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let t2;
    	let current;

    	function componentingredients_loadingRecepies_binding(value) {
    		/*componentingredients_loadingRecepies_binding*/ ctx[16].call(null, value);
    	}

    	function componentingredients_searchedRecepies_binding(value) {
    		/*componentingredients_searchedRecepies_binding*/ ctx[17].call(null, value);
    	}

    	let componentingredients_props = {};

    	if (/*loading*/ ctx[2] !== void 0) {
    		componentingredients_props.loadingRecepies = /*loading*/ ctx[2];
    	}

    	if (/*searched*/ ctx[3] !== void 0) {
    		componentingredients_props.searchedRecepies = /*searched*/ ctx[3];
    	}

    	const componentingredients = new Ingredients({
    			props: componentingredients_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(componentingredients, "loadingRecepies", componentingredients_loadingRecepies_binding));
    	binding_callbacks.push(() => bind(componentingredients, "searchedRecepies", componentingredients_searchedRecepies_binding));
    	componentingredients.$on("openfav", /*openfav_handler*/ ctx[18]);
    	const if_block_creators = [create_if_block_4, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*searched*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*showModal*/ ctx[1] && create_if_block_1$1(ctx);
    	let if_block2 = /*ShowFavoriteList*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(componentingredients.$$.fragment);
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(main, "class", "svelte-1571666");
    			add_location(main, file$9, 109, 0, 3751);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(componentingredients, main, null);
    			append_dev(main, t0);
    			if_blocks[current_block_type_index].m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t2);
    			if (if_block2) if_block2.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const componentingredients_changes = {};

    			if (!updating_loadingRecepies && dirty[0] & /*loading*/ 4) {
    				updating_loadingRecepies = true;
    				componentingredients_changes.loadingRecepies = /*loading*/ ctx[2];
    				add_flush_callback(() => updating_loadingRecepies = false);
    			}

    			if (!updating_searchedRecepies && dirty[0] & /*searched*/ 8) {
    				updating_searchedRecepies = true;
    				componentingredients_changes.searchedRecepies = /*searched*/ ctx[3];
    				add_flush_callback(() => updating_searchedRecepies = false);
    			}

    			componentingredients.$set(componentingredients_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(main, t1);
    			}

    			if (/*showModal*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*ShowFavoriteList*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block$3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(componentingredients.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(componentingredients.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(componentingredients);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $fetchedRecepies;
    	validate_store(fetchedRecepies, "fetchedRecepies");
    	component_subscribe($$self, fetchedRecepies, $$value => $$invalidate(8, $fetchedRecepies = $$value));

    	if ("serviceWorker" in navigator) {
    		navigator.serviceWorker.register("/service-worker.js");
    	}

    	const isInWebAppiOS = window.navigator.standalone == true;

    	isInWebAppiOS
    	? document.body.className = "standalone"
    	: "";

    	let ShowFavoriteList = false;
    	let showModal = false;
    	let loading = false;
    	let searched = false;
    	let recipesStepsLoading = true;
    	let modalRecipe = [];
    	let fetchedRecipes = [];
    	let removedStringArray = [];
    	let instructions = [];
    	let href = "";
    	let title = "";

    	function getRecipeId(event) {
    		const id = event.detail.id;
    		$$invalidate(1, showModal = event.detail.showModal);
    		$$invalidate(5, removedStringArray = event.detail.removedStringArray);
    		href = event.detail.href;
    		$$invalidate(7, title = event.detail.title);
    		getRecipesSteps(href);

    		modalRecipe = {
    			id: event.detail.id,
    			title: event.detail.title,
    			href: event.detail.href,
    			removedStringArray: event.detail.removedStringArray
    		};
    	}

    	const getRecipesSteps = async href => {
    		$$invalidate(1, showModal = true);
    		var proxyUrl = {"env":{"isProd":false,"API_URL":"https://www.arla.se/webappsfoodclub/demo/foodclubrecipes/byingredients/","PROXY_URL":"https://cors-anywhere.herokuapp.com/"}}.env.PROXY_URL, url = href;

    		try {
    			$$invalidate(4, recipesStepsLoading = true);
    			let response = await fetch(proxyUrl + url);
    			let data = await response.text();
    			var parser = new DOMParser();
    			var doc = parser.parseFromString(data, "text/html");
    			let node = doc.querySelector(".c-recipe__instructions-steps");
    			let text = node.firstChild.nextSibling.dataset.model;
    			let parseResult = JSON.parse(text);
    			$$invalidate(6, instructions = parseResult.sections[0].steps);
    		} catch(e) {
    			throw e;
    		}

    		$$invalidate(4, recipesStepsLoading = false);
    	};

    	const addToFavorites = () => {
    		var request = self.indexedDB.open("FAVORITES_DB", 1);
    		const product = modalRecipe;
    		product.instructions = instructions;
    		console.log(product);

    		request.onsuccess = function (event) {

    			var db = event.target.result;
    			var transaction = db.transaction("products", "readwrite");

    			// add success event handleer for transaction
    			// you should also add onerror, onabort event handlers
    			transaction.onsuccess = function (event) {
    				console.log("[Transaction] ALL DONE!");
    			};

    			var productsStore = transaction.objectStore("products");

    			//Add recipe to favorites
    			// products.forEach(function (product) {
    			var db_op_req = productsStore.add(product);

    			db_op_req.onsuccess = function (event) {
    				console.log(event.target.result == product.id); // true
    			};
    		}; // });

    		request.onerror = function (event) {
    			console.log("[onerror]", request.error);
    		};

    		request.onupgradeneeded = function (event) {
    			var db = event.target.result;
    			var productsStore = db.createObjectStore("products", { keyPath: "id" });
    		};
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function componentingredients_loadingRecepies_binding(value) {
    		loading = value;
    		$$invalidate(2, loading);
    	}

    	function componentingredients_searchedRecepies_binding(value) {
    		searched = value;
    		$$invalidate(3, searched);
    	}

    	const openfav_handler = () => $$invalidate(0, ShowFavoriteList = true);
    	const close_handler = () => $$invalidate(1, showModal = false);
    	const close_handler_1 = () => $$invalidate(0, ShowFavoriteList = false);

    	$$self.$capture_state = () => ({
    		ComponentIngredients: Ingredients,
    		Radio,
    		CInput,
    		Chip,
    		Spinner,
    		FoodCard,
    		SkeletonFoodCard,
    		Modal,
    		FavoriteList: FavoritesList,
    		customIngridients,
    		customMainIngridients,
    		fetchedRecepies,
    		mockData,
    		isInWebAppiOS,
    		ShowFavoriteList,
    		showModal,
    		loading,
    		searched,
    		recipesStepsLoading,
    		modalRecipe,
    		fetchedRecipes,
    		removedStringArray,
    		instructions,
    		href,
    		title,
    		getRecipeId,
    		getRecipesSteps,
    		addToFavorites,
    		$fetchedRecepies
    	});

    	$$self.$inject_state = $$props => {
    		if ("ShowFavoriteList" in $$props) $$invalidate(0, ShowFavoriteList = $$props.ShowFavoriteList);
    		if ("showModal" in $$props) $$invalidate(1, showModal = $$props.showModal);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    		if ("searched" in $$props) $$invalidate(3, searched = $$props.searched);
    		if ("recipesStepsLoading" in $$props) $$invalidate(4, recipesStepsLoading = $$props.recipesStepsLoading);
    		if ("modalRecipe" in $$props) modalRecipe = $$props.modalRecipe;
    		if ("fetchedRecipes" in $$props) fetchedRecipes = $$props.fetchedRecipes;
    		if ("removedStringArray" in $$props) $$invalidate(5, removedStringArray = $$props.removedStringArray);
    		if ("instructions" in $$props) $$invalidate(6, instructions = $$props.instructions);
    		if ("href" in $$props) href = $$props.href;
    		if ("title" in $$props) $$invalidate(7, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ShowFavoriteList,
    		showModal,
    		loading,
    		searched,
    		recipesStepsLoading,
    		removedStringArray,
    		instructions,
    		title,
    		$fetchedRecepies,
    		isInWebAppiOS,
    		getRecipeId,
    		addToFavorites,
    		modalRecipe,
    		href,
    		fetchedRecipes,
    		getRecipesSteps,
    		componentingredients_loadingRecepies_binding,
    		componentingredients_searchedRecepies_binding,
    		openfav_handler,
    		close_handler,
    		close_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document_1$1.getElementById("svelte-1571666-style")) add_css$a();
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
