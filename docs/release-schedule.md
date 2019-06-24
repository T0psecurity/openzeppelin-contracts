---
id: release-schedule
title:  Release Schedule
---

OpenZeppelin follows a [semantic versioning scheme](api-stability).

#### Minor releases

OpenZeppelin has a **5 week release cycle**. This means that every five weeks a new release is published.

At the beginning of the release cycle we decide which issues we want to prioritize, and assign them to [a milestone on GitHub](https://github.com/OpenZeppelin/openzeppelin-solidity/milestones). During the next five weeks, they are worked on and fixed.

Once the milestone is complete, we publish a feature-frozen release candidate. The purpose of the release candidate is to have a period where the community can review the new code before the actual release. If important problems are discovered, several more release candidates may be required. After a week of no more changes to the release candidate, the new version is published.

#### Major releases

Every several months a new major release may come out. These are not scheduled, but will be based on the need to release breaking changes such as a redesign of a core feature of the library (e.g. [roles](https://github.com/OpenZeppelin/openzeppelin-solidity/issues/1146) in 2.0). Since we value stability, we aim for these to happen infrequently (expect no less than six months between majors). However, we may be forced to release one when there are big changes to the Solidity language.
