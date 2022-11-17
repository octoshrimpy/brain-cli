
## State properties

* action: `Array` with the action name and its arguments, OR an array of that (if multiple actions should be issued).
  State's actions are applied upon entering a state, but after the branching action.
* return: `true` or `object` if set it returns to the parent-state automatically *after*, i.e. on the next event-character,
  if an object is provided, it could contains the following keys:
	* matchState: the parent-state's name should match that string, or it will be considered as a parse error
	* matchMicroState: the parent's micro-states should match, or it will be considered as a parse error
	* errorAction: like an *action*, but will be used instead if any error occurs (mismatching state or micro-state)
  It's mostly the same than branch's *return* property, except that *return.errorAction* trigger immediately if it should.
* branches: `Array` of branch object (see branch properties below).
  The first branch that match is selected.
* span: `string` start or continue a span with the identified by the given name.
  For a span to continue, it must be contiguous.
  *Spans* define areas that can be styled with the *spanStyle* action, or *returnSpanStyle*.
* startSpan: same than *span*, but force a new span even if contiguous with a former one.
* expandSpan: same than *span*, but force continuing an existing span even if not contiguous with a former one: the former one is expanded toward the current position.
* copySpan: `Array` of 2 `string` or `Array` of `Array` of 2 `string`, copy the content of the span identified as #0 element into
  the span identified as #1 element. If it's an array of array: it's a list of copy.
* microState: `object` set/unset some micro-states, key: micro-state name, value: `boolean` or `number` or `string` or `Array`
  (true/number/string/Array: set, false: unset), if it's an Array, it's a dynamic value (see below).

MAYBE:
* clearSpan: `true` or `string` or `Array` of `string`, if set to true, clear all span, if a string, clear only this specific span, if an array of string, clear
  all specified span.



## Branch properties

* match: used to match an event-character, can be of multiple type:
	* true: always match, used as fallback on the last branch
	* string: perfect match
	* array: match if one of its element match
	* regexp: match if the regexp match
	* function: a userland function used for matching
* matchMicroState: `string` or `object` or `Array` of `string`, if set to a micro-state's name, the branch will only match if the current state
  has this micro-state turned on, if it's an array, all micro-states specified should be turned on, if it's an object, all micro-states specified as the *key*
  must have matching *values*, where *value* can be a *dynamic value* (an `Array`, see below).
* inverse: `boolean` inverse matching
* spanBranches: it's like `state.branches`, but it branches on a span's content (accumulated event), if a span-branch match, that branch is used
  instead of the parent branch program, if not, the parent branch program is used. The span's content to be used for matching is set by the `branchOn` property
  of the **parent** branch.
* branchOn: `string` in conjunction with `spanBranches`, tell which span to use
* span: `string` start or continue a span with the identified by the given name.
  For a span to continue, it must be contiguous.
  *Spans* define areas that can be styled with the *spanStyle* action, or *returnSpanStyle*.
* startSpan: same than *span*, but force a new span even if contiguous with a former one.
* expandSpan: same than *span*, but force continuing an existing span even if not contiguous with a former one: the former one is expanded toward the current position.
* copySpan: `Array` of 2 `string` or `Array` of `Array` of 2 `string`, copy the content of the span identified as #0 element into
  the span identified as #1 element. If it's an array of array: it's a list of copy.
* microState: `object` set/unset some micro-states, key: micro-state name, value: `boolean` or `number` or `string` or `Array`
  (true/number/string/Array: set, false: unset), if it's an Array, it's a dynamic value (see below).
* action: `Array` with the action name and its arguments, OR an array of that (if multiple actions should be issued).
  Branch's actions are applied before entering the new state (before the new state action).
* store: `Array`:
	* the #0 element is a `string`, it's the store's name
	* the #1 element is an `Array`, it's a dynamic value (see below)
  a store being a Javascript `Set`, and is used by the host program for things like populating auto-completion, or whatever.
* state: `string` switch to that state.
* subState: `string` gosub to this state (recursion), it will return on the parent-state once a matching branch will have a *return* property.
* return: `true` or `object` if set it returns to the parent-state automatically *after*, i.e. on the next event-character,
  if an object is provided, it could contains the following keys:
	* matchState: the parent-state's name should match that string, or it will be considered as a parse error
	* matchMicroState: the parent's micro-states should match, or it will be considered as a parse error
	* errorAction: like an *action*, but will be used instead if any error occurs (mismatching state or micro-state)
  It's mostly the same than branch's *return* property, except that *return.errorAction* trigger immediately if it should.
* embedded: `null` or `string` or `Array` of `string`, if set, embed another TextMachine instance (and reset it) into this one.
  When set to an array of string, it is a dynamic value (see below).
  Once set, when an event is received, the embedded textMachine executes before the host.
  It is the responsibility of the host machine to parse silently (no action) during the time the embedded machine is running, or it would overwrite style.
  The host machine can stop the embedded machine anytime by setting `embedded` to `null`.
* propagate: `boolean` if set, the event-character is issued again after the state have changed,
  i.e. the matching character is not eaten is re-used by the new state.
* delay: `boolean` if set, the action of the state before branching will be used this time, instead of those of the new state.
* transition: `boolean` like delay the new state's actions are not applied, but neither are the former state's actions, only the branch's actions are applied.
  This property is useful to avoid creating a state that will immediately change to another.

MAYBE:
* overide: `boolean` if set, the branch's action replace the next state's action once.



## SPECIAL DYNAMIC VALUES:

It's possible for `microState`, `matchMicroState`, `embedded`, etc, to pass an array instead of the number/string,
so that instead of a static value, a dynamic value will be produced.

* If the #0 element is 'parent', then the parent state is used instead of the current one, elements are then shifted to the left (element #0 is destroyed).
* If the #0 element is 'microState' and there is a #1 element, then it will be replaced by the current value of the micro-state having #1 as its name.
* If the #0 element is 'span', and there is a #1 element, then it will be replaced by the current content of the span having #1 as its name.

