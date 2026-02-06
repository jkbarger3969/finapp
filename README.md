# Budget Tracker

## Purpose

The budget tracker app allows for realtime journal tracking of expenses and reconciliation of closing periods against statements. As well as meta data features to better understand spending.

## Features

- Account Journal
  - Filters
  - Aggregation
  - Reconciliation Tools
- Transaction Itemization

---

## Development Guide

### Client

#### Languages

- [Typescript](https://www.typescriptlang.org/docs/home.html)
- JSX
  - [Introduction](https://reactjs.org/docs/introducing-jsx.html)
  - [In Depth](https://reactjs.org/docs/jsx-in-depth.html)
  - [w3schools React JSX](https://www.w3schools.com/react/react_jsx.asp)
- [GraphQL](https://graphql.org/)

#### Libraries

- [React](https://reactjs.org/docs/getting-started.html)
- [Material UI](https://material-ui.com/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [DevExtreme Reactive: Grid](https://devexpress.github.io/devextreme-reactive/react/grid/)

### Server

#### Languages

- [Typescript](https://www.typescriptlang.org/docs/home.html)
- [GraphQL](https://graphql.org/)
- [MongoDb](https://docs.mongodb.com/manual/crud/)

#### Libraries

- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [MongoDB Node.js Driver](http://mongodb.github.io/node-mongodb-native/)
- [KOA](https://koajs.com/)

### Style Guide

#### Git Commit

The commit style implements the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification) v1.x.x standard.

##### Format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- `type` REQUIRED. MUST be one of the following:
  - **build:** Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
  - **ci:** Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
  - **docs:** Documentation only changes
  - **feat:** A new feature
  - **fix:** A bug fix
  - **perf:** A code change that improves performance
  - **refactor:** A code change that neither fixes a bug nor adds a feature
  - **style:** Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  - **test:** Adding missing tests or correcting existing tests
- `scope` OPTIONAL.
  - A scope MAY be provided to a commit’s type.
  - Provides additional contextual information.
  - Is contained within parenthesis, e.g., `feat(parser): add ability to parse arrays.`
- `description` REQUIRED.
  - MUST immediately follow the colon and space after the type/scope prefix.
  - Is a short summary of the code changes. e.g., `fix: array parsing issue when multiple spaces were contained in string.`
  - MAY contain a [story reference number](#story-reference-number).
- `body` OPTIONAL.
  - Free-form.
  - MAY consist of any number of newline separated paragraphs.
  - MAY contain one or more [story reference numbers](#story-reference-number).
- `footer(s)` OPTIONAL.
  - One or more footers MAY be provided one blank line after the body.
  - Each footer MUST consist of a word token, followed by either a `:<space>` or `<space>#` separator, followed by a string value.
  - Token MUST use a `-` in place of whitespace characters, e.g. `Acked-by`.
  - An exception is made for `BREAKING CHANGE`, which MAY also be used as a token.

###### Breaking Changes

Breaking changes MUST be listed in the footer in the `BREAKING CHANGE: <description>` format.

The [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification) breaking change type/scope prefix `!` format SHALL NOT be used.

###### Story Reference Number

Format: `[ch<number>]` or with [Commit Verb](https://help.clubhouse.io/hc/en-us/articles/360024588331-Changing-Your-Workflow-State-with-Commit-Messages) `[<verb> ch<number>]`.

- Commits MUST include at least one story reference number.
- A single story reference number MAY be included in the `description` e.g. `docs: add commit style to readme [ch29]`
- Multiple story reference numbers MUST be included in the `body` and SHALL NOT be in the `description`. e.g.

  ```
  docs: add style guides

  [ch13], [ch14], [ch15], [ch29]

  ```

- A commit verb MAY be included as a prefix to `ch<number>`. There MUST be a space between the `<verb>` and `ch` e.g. `[finish ch29]`.

#### Typescript

The Typescript code style is defined and enforced by:

1. [Prettier](https://prettier.io/docs/en/index.html)
1. [ESLint](https://eslint.org/) with plugins
   - [@typescript-eslint/recommended](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin#supported-rules)
   - [eslint:recommended](https://eslint.org/docs/rules/#possible-errors)

#### React

The React code style is defined and enforced by the [ESLint](https://eslint.org/) plugin [plugin:react/recommended](https://github.com/yannickcr/eslint-plugin-react#recommended).

#### Auto Formatting

It is REQUIRED to run the [Prettier](https://prettier.io/docs/en/index.html) formatting tool with the include `.prettierrc.js` config. And RECOMMENDED to run [ESLint](https://eslint.org/docs/rules/object-property-newline#fix) `--fix` with the include `.eslintrc.js` config.

Note Prettier MUST be run first.
# finapp
