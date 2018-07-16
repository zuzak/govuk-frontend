# Versioning

With an user interface (UI) library there are many ways that people can consume our code.

When we make changes to this code we need to be sure we communicate this consistently.

Semantic versioning is not enough to properly communicate changes to a UI library so this document
aims to detail what to do in certain circumstances.

If you use this as a point of reference and there are gaps please raise an issue or pull request to improve this document.

## Contents

- [Stability](#stability)
- [Deprecation](#deprecation)
- [Migration](#migration)
- [Public API](#public-api)
  - [Components](#components)
    - [Nunjucks Macros](#nunjucks-macros)
- [Accidental breaking releases](#accidental-breaking-releases)

## Stability

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

Whenever we decide to make a breaking change we must ensure we do our best to try to first deprecate the feature and allow a migration path.

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

## Public API

As defined in the [Semantic Versioning specification](https://semver.org/) a defined public api is required to version against.

> For this system to work, you first need to declare a public API. This may consist of documentation or be enforced by the code itself.

This section details the different aspects of this libaries' public API, and includes examples of when something is a breaking change.

### Components

#### HTML

#### JavaScript

#### SCSS

#### Nunjucks Macros

#### Version on the lowest abstraction
What happens if we make a breaking change that would not be breaking to users of our macros?
We should version as if users are using HTML, but make it clear in the CHANGELOG that macro users may not have difficulty updating.

Questions:
- Is the format the easiest to action?
- Is this only for the internal dev team?
- Does this need to be extended to what is in the design system?

### Extending GOV.UK Frontend

If you are extending a component or building your own, you may use certain parts of the library.

TODO: Flesh this section out.

https://govuk-frontend-review.herokuapp.com/docs/
https://design-system.service.gov.uk/styles/spacing/
https://design-system.service.gov.uk/styles/colour/

## Accidental breaking releases
If a backward-incompatible change is released unintentionally, we will follow the process outlined on semver.org: https://semver.org/#what-do-i-do-if-i-accidentally-release-a-backwards-incompatible-change-as-a-minor-version

> As soon as you realize that you’ve broken the Semantic Versioning spec, fix the problem and release a new minor version that corrects the problem and restores backwards compatibility. Even under this circumstance, it is unacceptable to modify versioned releases. If it’s appropriate, document the offending version and inform your users of the problem so that they are aware of the offending version.

If it makes sense to, setup an incident review that allows the team to see if there are
any steps to avoid this happening again in the future.

Communicate any actions as a result of an incident review, this will ensure our users will see that we take incidents seriously and can avoid some loss of trust.
