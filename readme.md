# A great jaeorb, Homsar.
![](mascot.gif)

This script points Google's JSON search API at a handful of widely-used recruiting platforms in hopes of finding better-tailored matches for candidates and uncovering roles that have been listed internally but not yet announced.

I've extended original code written by [John Keenan](https://www.linkedin.com/in/johnkeenan/). John, in turn, was inspired by [Andrew Stetsenko](https://relocate.me/blog/job-search/how-to-find-unadvertised-tech-jobs/). There are some glitches in Andrew's implementation, however, like not working at all.


### Getting Started
You should have the latest Node.js LTS version (`v18.x` as of this writing), the latest version of Yarn, and, of course, our friend Git.

For Mac users, [Homebrew](https://brew.sh/) is the best way to manage both. Run these commands in your favorite terminal emulator:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ... follow instructions ...

brew install node yarn git
```

When ready, clone the repo, install the dependencies, and fire it up.

```bash
git clone https://github.com/phyllisstein/jorb-scripts.git
cd jorb-scripts
yarn install
node ./src/google.mjs
```


### Customizing search
Still a little janky! You'll have to dive into the code and edit a few constants:

- [`EXCLUDED_TERMS`](https://github.com/phyllisstein/jorb-scripts/blob/03eb41255fcb4bc3f3af8f3fc8658063f84a9a4e/src/google.mjs#L27-L29): Google omits any results which include any one of the terms in this array. (That is, they are `OR`'d.) You _may_ be able to exclude phrases by adding additional quotation marks:

    ```js
    const EXCLUDED_TERMS = [
        '"news corp"'
    ]
    ```
- [`REQUIRED_TERMS`](https://github.com/phyllisstein/jorb-scripts/blob/03eb41255fcb4bc3f3af8f3fc8658063f84a9a4e/src/google.mjs#L35-L37): Results will contain any one of these terms. (That is, they, too, are `OR`'d.)
- [`QUERY_STRING`](https://github.com/phyllisstein/jorb-scripts/blob/03eb41255fcb4bc3f3af8f3fc8658063f84a9a4e/src/google.mjs#L43): Because the API call uses Google's advanced filters for precision, this is just set to `'job'` by default. I don't see any reason to change that.
