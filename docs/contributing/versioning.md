# Versioning

With an user interface (UI) library there are many ways that people can consume our code.

When we make changes to this code we need to be sure we communicate this consistently.

Semantic versioning is not enough to properly communicate changes to a UI library so this document
aims to detail what to do in certain circumstances.

## When to version

A stable library is more important than a library that is hard to update to.

We often release new components and features which will encourage people to update.

But we should ensure that we only make breaking changes when it is absolutely necessary.

Good reasons to make breaking changes:

- Accessibility is being impacted
- Security issue
- User research indicates something is confusing

Bad reasons to make breaking changes:

- An API doesnt feel 'pure'
- Following trends

Ember.JS is a great example of prioritising stability see [Stability without Stagnation: Lessons Learned from Shipping Ember.js
](https://speakerdeck.com/wycats/stability-without-stagnation-lessons-learned-from-shipping-ember-dot-js)

We do not want our users to be reliant on certain versions of our library with no way forward.

Whenever we decide to make a breaking change we must ensure we do our best to try to first deprecate the feature then allow a migration path.

## Deprecation

Deprecation is the practice of making breaking changes gradually, and is part of communicating up-coming changes
that would require a user to update their application.

Deprecating parts of the library help users migrate to the new way while still being able to run the old code.

Note: Our users will may not know what 'deprecation' means, so it's important to also clarify in full
that these changes.

Example 1: Fixing a typo in a CSS class name.

1. We discover the class name `.govuk-visually-hidden-focussable` includes the typo 'focussable'
2. We raise a pull request that renames the class to `.govuk-visually-hidden-focusable` while keeping
the previous class available.
3. We add a comment to the source code that indicates this is deprecated, and raise an issue to remove it in a future breaking release.
4. When releasing the change we include a clear summary that indications what was the problem, what we've changed and how a user can migrate before the future breaking release.

Sometimes it is not possible to deprecate code, this is OK but try to make this a last resort.

## Migration

Migration is the practice of a user moving from one approach to an equivlant approach.

It is very important that we make it easy to migrate when we make deprecations.

If possible include this directly in the CHANGELOG entry that introduces the deprecation.

The following examples will have examples of how to deprecate / migrate certain features.

### Colours

## Components


### Spacing

Components that do not nest
Internal spacing changes are not breaking changes.

## SCSS

## Macros (Templates)

A macro's primary API is based on the options that can be passed.

Breaking changes
- An update which adds or removes HTML elements e.g. changing a
- An update which adds or removes classes
- Changing a property name
- Changing the output of the template
- Changing the path to call it e.g.
- Changing macro name e.g. 'govukRadios' -> 'govukRadio'

Feature
- Adding a property name

## Accidental breaking release
If a backward-incompatible change is released unintentionally, we will follow the process outlined on semver.org: https://semver.org/#what-do-i-do-if-i-accidentally-release-a-backwards-incompatible-change-as-a-minor-version

It is important to communicate this openly with our users, and create an incident review and work as a team to see if there are
any steps to avoid this happening again in the future.

Communicate any actions as a result of an incident review, this will ensure our users will see that we take incidents seriously and can avoid some loss of trust.
