# Contributing to Repo.js

## Issue Contributions

When opening issues or commenting on existing issues, please make sure
discussions are related to concrete technical issues.

## Code Contributions

This section will guide you through the contribution process.

### Step 1: Fork

Fork the project [on GitHub](https://github.com/darcyclarke/Repo.js) and clone your fork
locally.

```text
$ git clone git@github.com:username/Repo.js.git
$ cd node
$ git remote add upstream https://github.com/darcyclarke/Repo.js.git
```

#### Which branch?

For developing new features and bug fixes, the `master` branch should be pulled
and built upon.

### Step 2: Branch

Create a branch and start hacking:

```text
$ git checkout -b my-branch -t origin/master
```

### Step 3: Commit

Make sure git knows your name and email address:

```text
$ git config --global user.name "J. Random User"
$ git config --global user.email "j.random.user@example.com"
```

Add and commit:

Use [commitizen](https://github.com/commitizen/cz-cli) to follow simple commit conventions. Repo.js's changelog is automatically generated from the master branch's commit messages. Individual contributors should write an informative commit message.

```text
$ git add my/changed/files
$ git cz
```

### Commit message guidelines

The commit message should describe what changed and why. Utilize [commitizen](https://github.com/commitizen/cz-cli) to follow through the message flow.

### Step 4: Rebase

Use `git rebase` (not `git merge`) to synchronize your work with the main
repository (if its not already up-to-date).

```text
$ git fetch upstream
$ git rebase upstream/master
```

### Step 5: Test

Bug fixes and features should come with tests. Looking at
other tests to see how they should be structured can help. Add your
tests in the `test/` directory if you are unsure where to put them.

To run the tests (including code linting):

```text
$ npm test
```

Make sure the linter does not report any issues and that all tests pass. Please
do not submit patches that fail either check.

If you want to run the linter without running tests, use
`$ npm run lint`

### Step 6: Push

```text
$ git push origin my-branch
```

Pull requests are usually reviewed within a few days.

### Step 7: Discuss and update

You will probably get feedback or requests for changes to your Pull Request.
This is a big part of the submission process so don't be discouraged!

To make changes to an existing Pull Request, make the changes to your branch.
When you push that branch to your fork, GitHub will automatically update the
Pull Request.

You can push more commits to your branch:

```text
$ git add my/changed/files
$ git commit
$ git push origin my-branch
```

Or you can rebase against master:

```text
$ git fetch --all
$ git rebase origin/master
$ git push --force-with-lease origin my-branch
```

Or you can amend the last commit (for example if you want to change the commit
log).

```text
$ git add any/changed/files
$ git commit --amend
$ git push --force-with-lease origin my-branch
```

**Important:** The `git push --force-with-lease` command is one of the few ways
to delete history in git. Before you use it, make sure you understand the risks.

Feel free to post a comment in the Pull Request to ping reviewers if you are
awaiting an answer on something. If you encounter words or acronyms that
seem unfamiliar, refer to this
[glossary](https://sites.google.com/a/chromium.org/dev/glossary).

<a id="developers-certificate-of-origin"></a>
## Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

* (a) The contribution was created in whole or in part by me and I
  have the right to submit it under the open source license
  indicated in the file; or

* (b) The contribution is based upon previous work that, to the best
  of my knowledge, is covered under an appropriate open source
  license and I have the right under that license to submit that
  work with modifications, whether created in whole or in part
  by me, under the same open source license (unless I am
  permitted to submit under a different license), as indicated
  in the file; or

* (c) The contribution was provided directly to me by some other
  person who certified (a), (b) or (c) and I have not modified
  it.

* (d) I understand and agree that this project and the contribution
  are public and that a record of the contribution (including all
  personal information I submit with it, including my sign-off) is
  maintained indefinitely and may be redistributed consistent with
  this project or the open source license(s) involved.
