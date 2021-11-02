
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
            set_current_component(null);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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

    /* Users/eduardoguruhotel/dev/svelte-multistep-form/src/StepForm.svelte generated by Svelte v3.44.1 */

    const file$2 = "Users/eduardoguruhotel/dev/svelte-multistep-form/src/StepForm.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "step step-not-active svelte-cj6jwx");
    			add_location(div, file$2, 9, 0, 106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StepForm', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StepForm> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class StepForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StepForm",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

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

    const store = writable(0);

    const currentStep = {
      subscribe: store.subscribe,
      increment: () => store.update(val => val + 1),
      decrement: () => store.update(val => val - 1),
      reset: () => store.update(val => 0),
    };

    const UUID_PATTERN = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    const ERROR_DISPLAY_TIME = 3000;
    const BUTTON_OPACITY = "1";
    const BUTTON_DISABLED_OPACITY = "0.5";

    let activeStep;
    currentStep.subscribe((value) => {
      activeStep = value;
    });

    const formHasError = () => {
      const steps = document.querySelectorAll(".step");
      const step = steps[activeStep];

      const requiredFields = step.querySelectorAll("[required]");
      let hasError = false;
      let errorMessages = [];

      requiredFields.forEach((el) => {
        if (!el.checkValidity()) {
          hasError = true;
          errorMessages.push(el.dataset.multistepErrorMessage);
        }
      });

      if (hasError) {
        showError(errorMessages);
      }
      return hasError;
    };

    const showError = (errorMessages) => {
      let errorField = document.querySelector("#multistep-error-messages");

      deleteChildNodes(errorField);
      showOrHide(errorField, "visible");

      errorMessages.forEach((message) => {
        createElementAppendTo("p", message, errorField);
      });

      setTimeout(() => {
        showOrHide(errorField, "hidden");
      }, ERROR_DISPLAY_TIME);
    };


    const updateStepStatus = (operation) => {
      if (!operation) return;
      const steps = document.querySelectorAll(".step");

      steps[activeStep].classList.remove("step-is-active");
      steps[activeStep].classList.add("step-not-active");

      operation();

      steps[activeStep].classList.remove("step-not-active");
      steps[activeStep].classList.add("step-is-active");

      updateButtonVisibility();
    };

    const updateButtonVisibility = () => {
      const steps = document.querySelectorAll(".step");
      const stepsLength = steps.length;
      
      const prev = document.querySelector("#multistep-prev");
      const next = document.querySelector("#multistep-next");

      prev.style.opacity = BUTTON_OPACITY;
      next.style.opacity = BUTTON_OPACITY;

      if (activeStep == 0) {
        prev.style.opacity = BUTTON_DISABLED_OPACITY;
      }
      if (activeStep == stepsLength - 1) {
        next.style.opacity = BUTTON_DISABLED_OPACITY;
      }
    };

    const showOrHide = (el, status) => {
      if (!el) return;

      const statusOptions = {
        hidden: BUTTON_DISABLED_OPACITY,
        visible: BUTTON_OPACITY,
      };

      el.style.visibility = statusOptions[status] ? status : null;
      el.style.opacity = statusOptions[status] ? statusOptions[status] : null;
    };

    // TODO: think about it if this is nedeed or useless
    const uuidv4 = () => {
      return UUID_PATTERN.replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const deleteChildNodes = (el) => {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    };

    const createElementAppendTo = (type, content, target) => {
      let el = document.createElement(type);
      el.innerHTML = content;
      target.appendChild(el);
    };

    /* Users/eduardoguruhotel/dev/svelte-multistep-form/src/MasterForm.svelte generated by Svelte v3.44.1 */

    const file$1 = "Users/eduardoguruhotel/dev/svelte-multistep-form/src/MasterForm.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (64:6) {#each multiStepOptions.stepsDescription as step}
    function create_each_block_1(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*step*/ ctx[7].title + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*step*/ ctx[7].subtitle + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span0, "class", "name svelte-1squrb9");
    			add_location(span0, file$1, 65, 10, 1620);
    			attr_dev(span1, "class", "subtitle svelte-1squrb9");
    			add_location(span1, file$1, 66, 10, 1669);
    			attr_dev(div, "class", "multistep-title-side svelte-1squrb9");
    			add_location(div, file$1, 64, 8, 1575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*multiStepOptions*/ 1 && t0_value !== (t0_value = /*step*/ ctx[7].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*multiStepOptions*/ 1 && t2_value !== (t2_value = /*step*/ ctx[7].subtitle + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(64:6) {#each multiStepOptions.stepsDescription as step}",
    		ctx
    	});

    	return block;
    }

    // (86:39) 
    function create_if_block_2(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*index*/ ctx[9] + 1 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div0, "class", "separator-check-number-blank svelte-1squrb9");
    			add_location(div0, file$1, 87, 12, 2439);
    			attr_dev(div1, "class", "separator-check-pending svelte-1squrb9");
    			add_location(div1, file$1, 86, 10, 2389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(86:39) ",
    		ctx
    	});

    	return block;
    }

    // (80:39) 
    function create_if_block_1(ctx) {
    	let div;
    	let svg;
    	let path;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t = space();
    			attr_dev(path, "d", "M1 14 L5 10 L13 18 L27 4 L31 8 L13 26 z");
    			add_location(path, file$1, 82, 14, 2250);
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			set_style(svg, "fill", "#48DB71");
    			add_location(svg, file$1, 81, 12, 2189);
    			attr_dev(div, "class", "separator-check svelte-1squrb9");
    			add_location(div, file$1, 80, 10, 2147);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(div, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(80:39) ",
    		ctx
    	});

    	return block;
    }

    // (76:8) {#if $currentStep === index}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*index*/ ctx[9] + 1 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div0, "class", "separator-check-number svelte-1squrb9");
    			add_location(div0, file$1, 77, 12, 2026);
    			attr_dev(div1, "class", "separator-check-current svelte-1squrb9");
    			add_location(div1, file$1, 76, 10, 1976);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(76:8) {#if $currentStep === index}",
    		ctx
    	});

    	return block;
    }

    // (72:6) {#each multiStepOptions.stepsDescription as step, index}
    function create_each_block$1(ctx) {
    	let div;
    	let span;
    	let t;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$currentStep*/ ctx[3] === /*index*/ ctx[9]) return create_if_block;
    		if (/*$currentStep*/ ctx[3] > /*index*/ ctx[9]) return create_if_block_1;
    		if (/*$currentStep*/ ctx[3] < /*index*/ ctx[9]) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span, "class", "dot svelte-1squrb9");
    			add_location(span, file$1, 73, 10, 1893);
    			attr_dev(div, "class", "separator-line svelte-1squrb9");
    			add_location(div, file$1, 72, 8, 1854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(72:6) {#each multiStepOptions.stepsDescription as step, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let h1;
    	let t1_value = /*multiStepOptions*/ ctx[0].formTitle + "";
    	let t1;
    	let t2;
    	let h5;
    	let t3_value = /*multiStepOptions*/ ctx[0].formSubtitle + "";
    	let t3;
    	let t4;
    	let form;
    	let div1;
    	let t5;
    	let div2;
    	let t6;
    	let div3;
    	let t7;
    	let div4;
    	let span0;
    	let t9;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*multiStepOptions*/ ctx[0].stepsDescription;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*multiStepOptions*/ ctx[0].stepsDescription;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			h5 = element("h5");
    			t3 = text(t3_value);
    			t4 = space();
    			form = element("form");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div3 = element("div");
    			if (default_slot) default_slot.c();
    			t7 = space();
    			div4 = element("div");
    			span0 = element("span");
    			span0.textContent = "prev";
    			t9 = text("\n    |\n    ");
    			span1 = element("span");
    			span1.textContent = "next";
    			attr_dev(div0, "id", "multistep-error-messages");
    			attr_dev(div0, "class", "svelte-1squrb9");
    			add_location(div0, file$1, 58, 2, 1256);
    			attr_dev(h1, "class", "multistep-form-title svelte-1squrb9");
    			add_location(h1, file$1, 59, 2, 1296);
    			attr_dev(h5, "class", "multistep-form-subtitle svelte-1squrb9");
    			add_location(h5, file$1, 60, 2, 1365);
    			attr_dev(div1, "class", "multistep-left-sidebar svelte-1squrb9");
    			add_location(div1, file$1, 62, 4, 1474);
    			attr_dev(div2, "class", "separator svelte-1squrb9");
    			add_location(div2, file$1, 70, 4, 1759);
    			attr_dev(div3, "class", "multistep-right-sidebar svelte-1squrb9");
    			add_location(div3, file$1, 93, 4, 2603);
    			attr_dev(form, "class", "multistep-form svelte-1squrb9");
    			add_location(form, file$1, 61, 2, 1440);
    			attr_dev(span0, "id", "multistep-prev");
    			attr_dev(span0, "class", "svelte-1squrb9");
    			add_location(span0, file$1, 99, 4, 2754);
    			attr_dev(span1, "id", "multistep-next");
    			attr_dev(span1, "class", "svelte-1squrb9");
    			add_location(span1, file$1, 101, 4, 2826);
    			attr_dev(div4, "class", "multistep-continue-button svelte-1squrb9");
    			add_location(div4, file$1, 98, 2, 2710);
    			attr_dev(div5, "class", "multistep-master-form svelte-1squrb9");
    			add_location(div5, file$1, 57, 0, 1218);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t0);
    			append_dev(div5, h1);
    			append_dev(h1, t1);
    			append_dev(div5, t2);
    			append_dev(div5, h5);
    			append_dev(h5, t3);
    			append_dev(div5, t4);
    			append_dev(div5, form);
    			append_dev(form, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(form, t5);
    			append_dev(form, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(form, t6);
    			append_dev(form, div3);

    			if (default_slot) {
    				default_slot.m(div3, null);
    			}

    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, span0);
    			append_dev(div4, t9);
    			append_dev(div4, span1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*previousStep*/ ctx[2], false, false, false),
    					listen_dev(span1, "click", /*nextStep*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*multiStepOptions*/ 1) && t1_value !== (t1_value = /*multiStepOptions*/ ctx[0].formTitle + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*multiStepOptions*/ 1) && t3_value !== (t3_value = /*multiStepOptions*/ ctx[0].formSubtitle + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*multiStepOptions*/ 1) {
    				each_value_1 = /*multiStepOptions*/ ctx[0].stepsDescription;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$currentStep, multiStepOptions*/ 9) {
    				each_value = /*multiStepOptions*/ ctx[0].stepsDescription;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $currentStep;
    	validate_store(currentStep, 'currentStep');
    	component_subscribe($$self, currentStep, $$value => $$invalidate(3, $currentStep = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MasterForm', slots, ['default']);
    	let { multiStepOptions } = $$props;
    	let { resetSteps } = $$props;

    	/*
    Lifecycle Hooks
    */
    	onMount(async () => {
    		let steps = document.querySelectorAll(".step");

    		steps.forEach((step, index) => {
    			step.setAttribute("id", uuidv4());
    			step.dataset.stepNumber = index;

    			if ($currentStep === index) {
    				step.classList.remove("step-not-active");
    				step.classList.add("step-is-active");
    			}
    		});

    		updateButtonVisibility();
    	});

    	afterUpdate(async () => {
    		if (resetSteps) {
    			updateStepStatus(stepStore.reset);
    			$$invalidate(4, resetSteps = false);
    		}
    	});

    	function nextStep() {
    		const steps = document.querySelectorAll(".step");

    		if (formHasError()) {
    			return;
    		}

    		if ($currentStep + 1 <= steps.length - 1) {
    			updateStepStatus(currentStep.increment);
    		}
    	}

    	const previousStep = () => {
    		if ($currentStep - 1 > -1) {
    			updateStepStatus(currentStep.decrement);
    		}
    	};

    	const writable_props = ['multiStepOptions', 'resetSteps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MasterForm> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('multiStepOptions' in $$props) $$invalidate(0, multiStepOptions = $$props.multiStepOptions);
    		if ('resetSteps' in $$props) $$invalidate(4, resetSteps = $$props.resetSteps);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		currentStep,
    		uuidv4,
    		formHasError,
    		updateStepStatus,
    		updateButtonVisibility,
    		multiStepOptions,
    		resetSteps,
    		nextStep,
    		previousStep,
    		$currentStep
    	});

    	$$self.$inject_state = $$props => {
    		if ('multiStepOptions' in $$props) $$invalidate(0, multiStepOptions = $$props.multiStepOptions);
    		if ('resetSteps' in $$props) $$invalidate(4, resetSteps = $$props.resetSteps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		multiStepOptions,
    		nextStep,
    		previousStep,
    		$currentStep,
    		resetSteps,
    		$$scope,
    		slots
    	];
    }

    class MasterForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			multiStepOptions: 0,
    			resetSteps: 4,
    			nextStep: 1,
    			previousStep: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MasterForm",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*multiStepOptions*/ ctx[0] === undefined && !('multiStepOptions' in props)) {
    			console.warn("<MasterForm> was created without expected prop 'multiStepOptions'");
    		}

    		if (/*resetSteps*/ ctx[4] === undefined && !('resetSteps' in props)) {
    			console.warn("<MasterForm> was created without expected prop 'resetSteps'");
    		}
    	}

    	get multiStepOptions() {
    		throw new Error("<MasterForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiStepOptions(value) {
    		throw new Error("<MasterForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resetSteps() {
    		throw new Error("<MasterForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resetSteps(value) {
    		throw new Error("<MasterForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nextStep() {
    		return this.$$.ctx[1];
    	}

    	set nextStep(value) {
    		throw new Error("<MasterForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previousStep() {
    		return this.$$.ctx[2];
    	}

    	set previousStep(value) {
    		throw new Error("<MasterForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.1 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (33:4) <Step>
    function create_default_slot_3(ctx) {
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let div2;
    	let input2;
    	let input2_class_value;
    	let input2_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "🤖 Github handle :";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "🦄 Repo url:";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div2 = element("div");
    			input2 = element("input");
    			attr_dev(label0, "class", "input-label svelte-14pn4o6");
    			attr_dev(label0, "for", "form-url-field");
    			add_location(label0, file, 34, 8, 1009);
    			attr_dev(input0, "class", "wide svelte-14pn4o6");
    			attr_dev(input0, "id", "form-input-field");
    			attr_dev(input0, "data-multistep-error-message", "name couldn't be empty");
    			attr_dev(input0, "placeholder", "githuber martinez");
    			add_location(input0, file, 37, 8, 1112);
    			attr_dev(div0, "class", "svelte-14pn4o6");
    			add_location(div0, file, 33, 6, 995);
    			attr_dev(label1, "class", "input-label svelte-14pn4o6");
    			attr_dev(label1, "for", "form-url-field");
    			add_location(label1, file, 47, 8, 1394);
    			attr_dev(input1, "class", "wide svelte-14pn4o6");
    			attr_dev(input1, "id", "form-url-field");
    			attr_dev(input1, "type", "url");
    			input1.required = true;
    			attr_dev(input1, "data-multistep-error-message", "url format is wrong");
    			attr_dev(input1, "placeholder", "http://github.com/handler/repo");
    			add_location(input1, file, 48, 8, 1471);
    			attr_dev(div1, "class", "svelte-14pn4o6");
    			add_location(div1, file, 46, 6, 1380);
    			attr_dev(input2, "class", input2_class_value = "button " + (!/*repoUrl*/ ctx[3] ? 'buton-disatbled' : '') + " svelte-14pn4o6");
    			input2.value = "call next programatically";
    			attr_dev(input2, "id", "form-skip-field");
    			attr_dev(input2, "type", "button");
    			input2.disabled = input2_disabled_value = !/*repoUrl*/ ctx[3];
    			add_location(input2, file, 59, 8, 1762);
    			attr_dev(div2, "class", "svelte-14pn4o6");
    			add_location(div2, file, 58, 6, 1748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*githubHandle*/ ctx[2]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*repoUrl*/ ctx[3]);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "keyup", /*handleTyping*/ ctx[7], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "click", prevent_default(/*click_handler*/ ctx[10]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*githubHandle*/ 4 && input0.value !== /*githubHandle*/ ctx[2]) {
    				set_input_value(input0, /*githubHandle*/ ctx[2]);
    			}

    			if (dirty & /*repoUrl*/ 8) {
    				set_input_value(input1, /*repoUrl*/ ctx[3]);
    			}

    			if (dirty & /*repoUrl*/ 8 && input2_class_value !== (input2_class_value = "button " + (!/*repoUrl*/ ctx[3] ? 'buton-disatbled' : '') + " svelte-14pn4o6")) {
    				attr_dev(input2, "class", input2_class_value);
    			}

    			if (dirty & /*repoUrl*/ 8 && input2_disabled_value !== (input2_disabled_value = !/*repoUrl*/ ctx[3])) {
    				prop_dev(input2, "disabled", input2_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(33:4) <Step>",
    		ctx
    	});

    	return block;
    }

    // (70:4) <Step>
    function create_default_slot_2(ctx) {
    	let p;
    	let t1;
    	let div;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "May or may not be skipped";
    			t1 = space();
    			div = element("div");
    			input = element("input");
    			attr_dev(p, "class", "svelte-14pn4o6");
    			add_location(p, file, 70, 6, 2082);
    			attr_dev(input, "class", "button svelte-14pn4o6");
    			input.value = "call previous programatically";
    			attr_dev(input, "id", "form-skip-field");
    			attr_dev(input, "type", "button");
    			add_location(input, file, 72, 8, 2135);
    			attr_dev(div, "class", "svelte-14pn4o6");
    			add_location(div, file, 71, 6, 2121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", prevent_default(/*click_handler_1*/ ctx[11]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(70:4) <Step>",
    		ctx
    	});

    	return block;
    }

    // (90:10) {#each categories as category}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*category*/ ctx[16].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*category*/ ctx[16];
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-14pn4o6");
    			add_location(option, file, 90, 12, 2688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(90:10) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    // (82:4) <Step>
    function create_default_slot_1(ctx) {
    	let div;
    	let label;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*categories*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Food:";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label, "class", "input-label svelte-14pn4o6");
    			attr_dev(label, "for", "form-category-field");
    			add_location(label, file, 83, 8, 2411);
    			attr_dev(select, "class", "select-categories wide svelte-14pn4o6");
    			attr_dev(select, "data-multistep-error-message", "Select a profile");
    			if (/*selected*/ ctx[4] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			add_location(select, file, 84, 8, 2486);
    			attr_dev(div, "class", "svelte-14pn4o6");
    			add_location(div, file, 82, 6, 2397);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[4]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*categories*/ 64) {
    				each_value = /*categories*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, categories*/ 80) {
    				select_option(select, /*selected*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(82:4) <Step>",
    		ctx
    	});

    	return block;
    }

    // (32:2) <Form {multiStepOptions} bind:this={FormComponentRef} bind:resetSteps>
    function create_default_slot(ctx) {
    	let step0;
    	let t0;
    	let step1;
    	let t1;
    	let step2;
    	let current;

    	step0 = new StepForm({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	step1 = new StepForm({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	step2 = new StepForm({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(step0.$$.fragment);
    			t0 = space();
    			create_component(step1.$$.fragment);
    			t1 = space();
    			create_component(step2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(step0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(step1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(step2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const step0_changes = {};

    			if (dirty & /*$$scope, repoUrl, FormComponentRef, githubHandle*/ 524301) {
    				step0_changes.$$scope = { dirty, ctx };
    			}

    			step0.$set(step0_changes);
    			const step1_changes = {};

    			if (dirty & /*$$scope, FormComponentRef*/ 524289) {
    				step1_changes.$$scope = { dirty, ctx };
    			}

    			step1.$set(step1_changes);
    			const step2_changes = {};

    			if (dirty & /*$$scope, selected*/ 524304) {
    				step2_changes.$$scope = { dirty, ctx };
    			}

    			step2.$set(step2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(step0.$$.fragment, local);
    			transition_in(step1.$$.fragment, local);
    			transition_in(step2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(step0.$$.fragment, local);
    			transition_out(step1.$$.fragment, local);
    			transition_out(step2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(step0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(step1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(step2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(32:2) <Form {multiStepOptions} bind:this={FormComponentRef} bind:resetSteps>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let form;
    	let updating_resetSteps;
    	let t0;
    	let div;
    	let h1;
    	let span0;
    	let t1_value = (/*githubHandle*/ ctx[2] || "") + "";
    	let t1;
    	let t2;
    	let span1;

    	let t3_value = (/*repoUrl*/ ctx[3]
    	? `has a repo ${/*repoUrl*/ ctx[3]}`
    	: "") + "";

    	let t3;
    	let t4;
    	let span2;

    	let t5_value = (/*selected*/ ctx[4].text
    	? `and likes ${/*selected*/ ctx[4].text}`
    	: "") + "";

    	let t5;
    	let current;

    	function form_resetSteps_binding(value) {
    		/*form_resetSteps_binding*/ ctx[14](value);
    	}

    	let form_props = {
    		multiStepOptions: /*multiStepOptions*/ ctx[5],
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*resetSteps*/ ctx[1] !== void 0) {
    		form_props.resetSteps = /*resetSteps*/ ctx[1];
    	}

    	form = new MasterForm({ props: form_props, $$inline: true });
    	/*form_binding*/ ctx[13](form);
    	binding_callbacks.push(() => bind(form, 'resetSteps', form_resetSteps_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(form.$$.fragment);
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			span2 = element("span");
    			t5 = text(t5_value);
    			attr_dev(span0, "class", "red svelte-14pn4o6");
    			add_location(span0, file, 99, 6, 2848);
    			attr_dev(span1, "class", "blue svelte-14pn4o6");
    			add_location(span1, file, 100, 6, 2900);
    			attr_dev(span2, "class", "orange svelte-14pn4o6");
    			add_location(span2, file, 101, 6, 2973);
    			attr_dev(h1, "class", "svelte-14pn4o6");
    			add_location(h1, file, 98, 4, 2837);
    			attr_dev(div, "class", "result svelte-14pn4o6");
    			add_location(div, file, 97, 2, 2812);
    			attr_dev(main, "class", "example-main svelte-14pn4o6");
    			add_location(main, file, 30, 0, 877);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(form, main, null);
    			append_dev(main, t0);
    			append_dev(main, div);
    			append_dev(div, h1);
    			append_dev(h1, span0);
    			append_dev(span0, t1);
    			append_dev(h1, t2);
    			append_dev(h1, span1);
    			append_dev(span1, t3);
    			append_dev(h1, t4);
    			append_dev(h1, span2);
    			append_dev(span2, t5);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const form_changes = {};

    			if (dirty & /*$$scope, selected, FormComponentRef, repoUrl, githubHandle*/ 524317) {
    				form_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_resetSteps && dirty & /*resetSteps*/ 2) {
    				updating_resetSteps = true;
    				form_changes.resetSteps = /*resetSteps*/ ctx[1];
    				add_flush_callback(() => updating_resetSteps = false);
    			}

    			form.$set(form_changes);
    			if ((!current || dirty & /*githubHandle*/ 4) && t1_value !== (t1_value = (/*githubHandle*/ ctx[2] || "") + "")) set_data_dev(t1, t1_value);

    			if ((!current || dirty & /*repoUrl*/ 8) && t3_value !== (t3_value = (/*repoUrl*/ ctx[3]
    			? `has a repo ${/*repoUrl*/ ctx[3]}`
    			: "") + "")) set_data_dev(t3, t3_value);

    			if ((!current || dirty & /*selected*/ 16) && t5_value !== (t5_value = (/*selected*/ ctx[4].text
    			? `and likes ${/*selected*/ ctx[4].text}`
    			: "") + "")) set_data_dev(t5, t5_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*form_binding*/ ctx[13](null);
    			destroy_component(form);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let FormComponentRef;
    	let resetSteps = false;
    	let githubHandle, repoUrl, technology;

    	let multiStepOptions = {
    		formTitle: "New Title ✍️",
    		formSubtitle: "Subtitle should be here",
    		stepsDescription: [
    			{
    				title: "STEP 1",
    				subtitle: "All the details to perform on this step"
    			},
    			{
    				title: "STEP 2",
    				subtitle: "Skip if input equals to next"
    			},
    			{
    				title: "STEP 3",
    				subtitle: "All the details to perform on this step"
    			}
    		]
    	};

    	let selected = { name: "", text: "" };

    	const categories = [
    		{ name: "🍕", text: "🍕 Pizza" },
    		{ name: "🌮", text: "🌮 Tacos al pastor" },
    		{ name: "🥙", text: "🥙 Otro taco" }
    	];

    	const handleTyping = event => {
    		$$invalidate(3, repoUrl = `http://github.com/${event.target.value}/`);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		githubHandle = this.value;
    		$$invalidate(2, githubHandle);
    	}

    	function input1_input_handler() {
    		repoUrl = this.value;
    		$$invalidate(3, repoUrl);
    	}

    	const click_handler = () => FormComponentRef.nextStep();
    	const click_handler_1 = () => FormComponentRef.previousStep();

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(4, selected);
    		$$invalidate(6, categories);
    	}

    	function form_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			FormComponentRef = $$value;
    			$$invalidate(0, FormComponentRef);
    		});
    	}

    	function form_resetSteps_binding(value) {
    		resetSteps = value;
    		$$invalidate(1, resetSteps);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Form: MasterForm,
    		Step: StepForm,
    		FormComponentRef,
    		resetSteps,
    		githubHandle,
    		repoUrl,
    		technology,
    		multiStepOptions,
    		selected,
    		categories,
    		handleTyping
    	});

    	$$self.$inject_state = $$props => {
    		if ('FormComponentRef' in $$props) $$invalidate(0, FormComponentRef = $$props.FormComponentRef);
    		if ('resetSteps' in $$props) $$invalidate(1, resetSteps = $$props.resetSteps);
    		if ('githubHandle' in $$props) $$invalidate(2, githubHandle = $$props.githubHandle);
    		if ('repoUrl' in $$props) $$invalidate(3, repoUrl = $$props.repoUrl);
    		if ('technology' in $$props) technology = $$props.technology;
    		if ('multiStepOptions' in $$props) $$invalidate(5, multiStepOptions = $$props.multiStepOptions);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		FormComponentRef,
    		resetSteps,
    		githubHandle,
    		repoUrl,
    		selected,
    		multiStepOptions,
    		categories,
    		handleTyping,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		click_handler_1,
    		select_change_handler,
    		form_binding,
    		form_resetSteps_binding
    	];
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

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
